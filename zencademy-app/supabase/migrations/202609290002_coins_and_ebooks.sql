begin;

create table public.ebook_catalog (
  id text primary key,
  title text not null,
  price integer not null check (price > 0),
  status text not null default 'available' check (status in ('available', 'under-development'))
);

insert into public.ebook_catalog (id, title, price, status) values
  ('1', 'Mindful Living Guide', 20, 'available'),
  ('2', 'Stress Management', 20, 'available'),
  ('3', 'Advanced Meditation Techniques', 21, 'available'),
  ('4', 'Mind-Body Connection', 20, 'available'),
  ('5', 'Holistic Health & Wellness', 21, 'available');

insert into public.activity_catalog (id, category, reward_xp, reward_coins, min_seconds)
values ('practice-reward', 'practice', 0, 0, 0);

create table public.user_ebooks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  ebook_id text not null references public.ebook_catalog(id),
  purchased_at timestamptz not null default now(),
  primary key (user_id, ebook_id)
);

alter table public.ebook_catalog enable row level security;
alter table public.user_ebooks enable row level security;
create policy ebooks_read on public.ebook_catalog for select to authenticated using (true);
create policy owned_ebooks_read on public.user_ebooks for select to authenticated using (user_id = auth.uid());

revoke all on public.ebook_catalog, public.user_ebooks from anon, authenticated;
grant select on public.ebook_catalog, public.user_ebooks to authenticated;

create function public.record_reward(p_xp integer, p_coins integer) returns void
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  spent integer;
  earned integer;
  coins_earned integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_xp is null or p_xp <= 0 then return; end if;
  if p_xp > 2000 then raise exception 'Reward is too large'; end if;
  select * into strict p from public.profiles where id = auth.uid() for update;
  select coalesce(sum(xp), 0) into spent
  from public.training_sessions
  where user_id = p.id and activity_day = (now() at time zone p.timezone)::date;
  earned = least(p_xp, greatest(0, 2000 - spent));
  if earned <= 0 then return; end if;
  -- p_coins is ignored. Coins are derived from the XP that was actually granted.
  coins_earned = greatest(2, round(earned::numeric * 0.5))::integer;
  insert into public.training_sessions (id, user_id, activity_id, completed_at, duration_seconds, xp, coins, activity_day)
  values (gen_random_uuid(), p.id, 'practice-reward', now(), 0, earned, coins_earned, (now() at time zone p.timezone)::date);
  update public.profiles
  set points = points + earned, coins = coins + coins_earned
  where id = p.id;
end$$;

create function public.purchase_ebook(p_ebook_id text) returns void
language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  item public.ebook_catalog;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into strict p from public.profiles where id = auth.uid() for update;
  select * into item from public.ebook_catalog where id = p_ebook_id;
  if not found then raise exception 'Unknown ebook'; end if;
  if item.status <> 'available' then raise exception 'This ebook is not for sale'; end if;
  if exists (select 1 from public.user_ebooks where user_id = p.id and ebook_id = p_ebook_id) then return; end if;
  if p.coins < item.price then raise exception 'Not enough coins'; end if;
  insert into public.user_ebooks (user_id, ebook_id) values (p.id, p_ebook_id);
  update public.profiles set coins = coins - item.price where id = p.id;
end$$;

revoke all on function public.record_reward(integer, integer), public.purchase_ebook(text) from public;
grant execute on function public.record_reward(integer, integer), public.purchase_ebook(text) to authenticated;

commit;
