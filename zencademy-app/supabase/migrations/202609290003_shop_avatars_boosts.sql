begin;

insert into public.shop_catalog (id, title, price) values
  ('badge-iron', 'Iron Will', 48),
  ('badge-night', 'Night Operator', 38),
  ('avatar-fox', 'Fox', 35),
  ('avatar-wolf', 'Wolf', 40),
  ('avatar-eagle', 'Eagle', 45),
  ('avatar-lion', 'Lion', 55),
  ('avatar-oni', 'Oni', 60),
  ('avatar-cyber', 'Cyber', 50),
  ('boost-xp-2h', 'XP Pulse 2h', 32),
  ('boost-focus-1h', 'Deep Focus 1h', 24),
  ('boost-streak-shield', 'Streak Shield', 45),
  ('boost-coin-rain', 'Coin Rain 1h', 36)
on conflict (id) do update set title = excluded.title, price = excluded.price;

-- Allow re-buying timed boosts: delete ownership after purchase is recorded as spend via a helper.
-- Boosts stay in user_badges as "owned once" for unlock cosmetics; timed effect is client-side.
-- For rebuyable boosts we use a spend_coins function.

create or replace function public.spend_coins(p_amount integer, p_reason text default 'spend') returns void
language plpgsql security definer set search_path = '' as $$
declare p public.profiles;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'Invalid amount'; end if;
  if p_amount > 5000 then raise exception 'Amount too large'; end if;
  select * into strict p from public.profiles where id = auth.uid() for update;
  if p.coins < p_amount then raise exception 'Not enough coins'; end if;
  update public.profiles set coins = coins - p_amount where id = p.id;
end$$;

revoke all on function public.spend_coins(integer, text) from public;
grant execute on function public.spend_coins(integer, text) to authenticated;

commit;
