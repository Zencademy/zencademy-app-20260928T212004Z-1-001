-- Remote currently has activate_boost (002), not purchase_boost (003).
-- Align with client UNAVAILABLE_BOOSTS: block XP/coin boosts; drop multipliers from payouts.

create table if not exists public.boost_purchases (
  user_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null,
  boost_id text not null,
  price integer not null,
  expires_at timestamptz not null,
  primary key (user_id, request_id)
);
alter table public.boost_purchases enable row level security;
revoke all on public.boost_purchases from public, anon, authenticated;

create or replace function public.activate_boost(p_boost_id text, p_hours integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  raise exception 'Update the app to purchase boosts safely';
end$$;
revoke all on function public.activate_boost(text, integer) from public, anon, authenticated;

create or replace function public.purchase_boost(p_request_id uuid, p_boost_id text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  receipt public.boost_purchases;
  cost integer;
  hours integer;
  expiry timestamptz;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_request_id is null then raise exception 'Purchase id required'; end if;
  select * into strict p from public.profiles where id = auth.uid() for update;
  select * into receipt from public.boost_purchases where user_id = p.id and request_id = p_request_id;
  if found then
    if receipt.boost_id <> p_boost_id then raise exception 'Purchase conflict'; end if;
    return to_jsonb(receipt);
  end if;

  if p_boost_id in ('boost-xp-2h', 'boost-coin-rain', 'boost-focus-1h') then
    raise exception 'This boost is not available';
  end if;
  hours = case p_boost_id when 'boost-streak-shield' then 24 else null end;
  if hours is null then raise exception 'This boost is not available'; end if;

  select price into cost from public.shop_catalog where id = p_boost_id;
  if cost is null then raise exception 'Unknown boost'; end if;
  if p.coins < cost then raise exception 'Not enough coins'; end if;

  insert into public.user_boosts(user_id, boost_id, expires_at)
  values (p.id, p_boost_id, now() + make_interval(hours => hours))
  on conflict (user_id, boost_id) do update
    set expires_at = greatest(public.user_boosts.expires_at, now()) + make_interval(hours => hours)
  returning expires_at into expiry;

  update public.profiles set coins = coins - cost where id = p.id;
  insert into public.boost_purchases values (p.id, p_request_id, p_boost_id, cost, expiry)
  returning * into receipt;
  return to_jsonb(receipt);
end$$;

revoke all on function public.purchase_boost(uuid, text) from public, anon;
grant execute on function public.purchase_boost(uuid, text) to authenticated;

create or replace function public.complete_activity(p_session_id uuid, p_score integer default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  s public.training_sessions;
  a public.activity_catalog;
  d date;
  earned integer;
  coins_earned integer;
  spent integer;
  streak integer;
  elapsed integer;
  plan_bonus integer := 0;
  has_shield boolean := false;
  prev_day date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into strict p from public.profiles where id = auth.uid() for update;
  prev_day := p.last_training_day;
  select * into s from public.training_sessions where id = p_session_id and user_id = auth.uid() for update;
  if not found then raise exception 'Session not found'; end if;
  if s.completed_at is not null then return to_jsonb(s); end if;
  select * into strict a from public.activity_catalog where id = s.activity_id;
  elapsed = greatest(0, floor(extract(epoch from now() - s.started_at)))::integer;
  if elapsed < a.min_seconds then raise exception 'Finish the exercise before saving'; end if;
  if elapsed > 14400 then raise exception 'Session expired; start a new session'; end if;
  if p_score is not null and (p_score < 0 or p_score > 100) then raise exception 'Invalid score'; end if;

  if p.plan = 'elite' then plan_bonus = 4;
  elsif p.plan = 'lite' then plan_bonus = 2;
  end if;

  has_shield = exists(
    select 1 from public.user_boosts
    where user_id = p.id and boost_id = 'boost-streak-shield' and expires_at > now()
  );

  d = (now() at time zone p.timezone)::date;
  select coalesce(sum(xp), 0) into spent from public.training_sessions where user_id = p.id and activity_day = d;
  earned = least(greatest(0, a.reward_xp + plan_bonus), greatest(0, 2000 - spent));
  coins_earned = case
    when earned > 0 then greatest(1, round(earned::numeric * 0.4)::integer)
    else 0
  end;

  streak = case
    when prev_day = d then p.daily_streak_count
    when prev_day = d - 1 then p.daily_streak_count + 1
    when has_shield and prev_day = d - 2 then p.daily_streak_count
    else 1
  end;

  update public.training_sessions
    set completed_at = now(), duration_seconds = elapsed, xp = earned, coins = coins_earned, activity_day = d, score = p_score
    where id = s.id returning * into s;
  update public.profiles set
    points = points + earned,
    coins = coins + coins_earned,
    completed_games = completed_games + 1,
    session_time = session_time + elapsed / 3600.0,
    daily_streak_count = streak,
    streak_count = streak,
    last_training_day = d
  where id = p.id;

  if has_shield and prev_day is not null and prev_day = d - 2 then
    delete from public.user_boosts where user_id = p.id and boost_id = 'boost-streak-shield';
  end if;

  return to_jsonb(s);
end$$;

insert into public.activity_catalog (id, category, reward_xp, reward_coins, min_seconds)
values ('self-reflection', 'meta', 12, 5, 5)
on conflict (id) do update set
  category = excluded.category,
  reward_xp = excluded.reward_xp,
  reward_coins = excluded.reward_coins,
  min_seconds = excluded.min_seconds;
