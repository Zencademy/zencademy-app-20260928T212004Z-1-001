begin;

-- =============================================================================
-- Secure rewards: catalog is source of truth; client cannot choose XP amounts.
-- Coins ~= 40% of granted XP (aligned with client coinsForXp).
-- attempt id = training_sessions.id (idempotent complete).
-- LIMITATION: mental-game win still originates client-side; server enforces
-- catalog amount, min_seconds, daily cap, rate limits, plan/boost modifiers.
-- Timer alone does not prove a cognitive win — only that a session existed.
-- =============================================================================

insert into public.activity_catalog (id, category, reward_xp, reward_coins, min_seconds) values
  ('focus-easy', 'attention', 12, 5, 5),
  ('focus-medium', 'attention', 18, 7, 8),
  ('sequence-tap', 'attention', 18, 7, 8),
  ('number-recall', 'memory', 12, 5, 5),
  ('grid-pattern', 'memory', 18, 7, 8),
  ('sequence-recall', 'memory', 28, 11, 10),
  ('odd-one-out', 'logic', 12, 5, 5),
  ('mastermind', 'logic', 28, 11, 10),
  ('reaction-tap', 'speed', 12, 5, 5),
  ('speed-pattern', 'speed', 28, 11, 8),
  ('verbal-easy', 'verbal', 12, 5, 5),
  ('visual-easy', 'visual', 12, 5, 5),
  ('creativity-easy', 'creativity', 12, 5, 5),
  ('fact-check', 'critical', 18, 7, 8),
  ('fallacies', 'critical', 28, 11, 10),
  ('evidence', 'critical', 18, 7, 8),
  ('reflection', 'meta', 12, 5, 5),
  ('goal-review', 'meta', 18, 7, 8),
  ('mindful-pause', 'meta', 12, 5, 5),
  ('box-breathing', 'breathing', 12, 5, 60),
  ('four-seven-eight', 'breathing', 18, 7, 60),
  ('wim-hof', 'breathing', 28, 11, 90),
  ('forward-fold', 'stretching', 12, 5, 60),
  ('shoulder-stretch', 'stretching', 12, 5, 60),
  ('hip-flexor', 'stretching', 18, 7, 60),
  ('one-leg', 'balance', 12, 5, 45),
  ('heel-toe', 'balance', 18, 7, 60),
  ('plank', 'strength', 12, 5, 30),
  ('circuit', 'strength', 18, 7, 90),
  ('body-scan', 'relaxation', 12, 5, 60),
  ('progressive', 'relaxation', 18, 7, 90),
  ('joint-rotations', 'mobility', 12, 5, 45),
  ('cardio', 'endurance', 12, 5, 90),
  ('intervals', 'endurance', 18, 7, 90),
  ('cross-crawl', 'coordination', 12, 5, 45),
  ('hand-clap', 'coordination', 18, 7, 45),
  ('story-builder', 'creativity', 28, 11, 10),
  ('mini-sudoku', 'logic', 28, 11, 10),
  ('pattern-sequence', 'attention', 18, 7, 8),
  ('relaxation-breathing', 'breathing', 12, 5, 60),
  ('alternate-nostril', 'breathing', 18, 7, 60),
  ('guided-imagery', 'relaxation', 12, 5, 60),
  ('bosu-balance', 'balance', 18, 7, 60),
  ('dynamic-balance', 'balance', 28, 11, 60),
  ('juggling', 'coordination', 18, 7, 60),
  ('reaction-catch', 'speed', 18, 7, 45),
  ('explosive-power', 'strength', 28, 11, 60),
  ('resistance-bands', 'strength', 18, 7, 90),
  ('butterfly-stretch', 'stretching', 12, 5, 60),
  ('worlds-greatest', 'mobility', 18, 7, 90),
  ('cycling-sprint', 'endurance', 28, 11, 90),
  ('long-distance-walk', 'endurance', 12, 5, 120),
  ('self-reflection', 'meta', 12, 5, 5),
  ('logical-fallacies', 'critical', 28, 11, 10),
  ('practice-easy', 'practice', 12, 5, 30),
  ('practice-medium', 'practice', 18, 7, 45),
  ('practice-hard', 'practice', 28, 11, 60),
  ('intelligence-test', 'assessment', 28, 11, 60),
  ('logic-game', 'logic', 18, 7, 30)
on conflict (id) do update set
  category = excluded.category,
  reward_xp = excluded.reward_xp,
  reward_coins = excluded.reward_coins,
  min_seconds = excluded.min_seconds;

create table if not exists public.user_boosts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  boost_id text not null,
  expires_at timestamptz not null,
  primary key (user_id, boost_id)
);
alter table public.user_boosts enable row level security;
drop policy if exists boosts_read on public.user_boosts;
create policy boosts_read on public.user_boosts for select to authenticated using (user_id = auth.uid());
revoke all on public.user_boosts from anon, authenticated;
grant select on public.user_boosts to authenticated;

create or replace function public.activate_boost(p_boost_id text, p_hours integer)
returns void language plpgsql security definer set search_path = '' as $$
declare
  p public.profiles;
  item public.shop_catalog;
  hours integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_boost_id is null or left(p_boost_id, 6) <> 'boost-' then raise exception 'Unknown boost'; end if;
  if p_boost_id = 'boost-focus-1h' then raise exception 'This boost is not available yet'; end if;
  hours = greatest(1, least(coalesce(p_hours, 1), 72));
  select * into strict p from public.profiles where id = auth.uid() for update;
  select * into item from public.shop_catalog where id = p_boost_id;
  if not found then raise exception 'Unknown boost'; end if;
  if p.coins < item.price then raise exception 'Not enough coins'; end if;
  update public.profiles set coins = coins - item.price where id = p.id;
  insert into public.user_boosts(user_id, boost_id, expires_at)
  values (p.id, p_boost_id, now() + make_interval(hours => hours))
  on conflict (user_id, boost_id) do update
    set expires_at = greatest(public.user_boosts.expires_at, now()) + make_interval(hours => hours);
end$$;

revoke all on function public.activate_boost(text, integer) from public, anon;
grant execute on function public.activate_boost(text, integer) to authenticated;

create or replace function public.record_reward(p_xp integer, p_coins integer)
returns void language plpgsql security definer set search_path = '' as $$
begin
  raise exception 'record_reward is disabled; use claim_activity_reward';
end$$;

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
  xp_mult numeric := 1;
  coin_mult numeric := 1;
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

  if exists(select 1 from public.user_boosts where user_id = p.id and boost_id = 'boost-xp-2h' and expires_at > now()) then
    xp_mult = 1.15;
  end if;
  if exists(select 1 from public.user_boosts where user_id = p.id and boost_id = 'boost-coin-rain' and expires_at > now()) then
    coin_mult = 1.10;
  end if;
  has_shield = exists(select 1 from public.user_boosts where user_id = p.id and boost_id = 'boost-streak-shield' and expires_at > now());

  d = (now() at time zone p.timezone)::date;
  select coalesce(sum(xp), 0) into spent from public.training_sessions where user_id = p.id and activity_day = d;
  earned = least(greatest(0, round((a.reward_xp + plan_bonus) * xp_mult)::integer), greatest(0, 2000 - spent));
  coins_earned = case
    when earned > 0 then greatest(a.reward_coins, greatest(1, round(earned::numeric * 0.4 * coin_mult)::integer))
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

-- claim_activity_reward: idempotent payout by attempt id.
-- LIMITATION: the client asserts completion (cognitive win / UI timer finished).
-- Server still owns XP/coins (catalog + plan + boosts), daily cap, rate limits,
-- and attempt idempotency. Wall-clock min_seconds is NOT re-proven here when the
-- session was opened in the same request; use start_activity early + complete_activity
-- when you need strict elapsed timing.
create or replace function public.claim_activity_reward(p_attempt_id uuid, p_activity_id text, p_score integer default null)
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
  duration integer;
  plan_bonus integer := 0;
  xp_mult numeric := 1;
  coin_mult numeric := 1;
  has_shield boolean := false;
  prev_day date;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  perform public.start_activity(p_attempt_id, p_activity_id);
  select * into strict p from public.profiles where id = auth.uid() for update;
  prev_day := p.last_training_day;
  select * into s from public.training_sessions where id = p_attempt_id and user_id = auth.uid() for update;
  if not found then raise exception 'Session not found'; end if;
  if s.completed_at is not null then return to_jsonb(s); end if;
  if s.activity_id <> p_activity_id then raise exception 'Session conflict'; end if;
  select * into strict a from public.activity_catalog where id = s.activity_id;
  if a.reward_xp <= 0 and a.min_seconds >= 999999 then raise exception 'This activity cannot be claimed'; end if;
  elapsed = greatest(0, floor(extract(epoch from now() - s.started_at)))::integer;
  if elapsed > 14400 then raise exception 'Session expired; start a new session'; end if;
  duration = greatest(elapsed, a.min_seconds);
  if p_score is not null and (p_score < 0 or p_score > 100) then raise exception 'Invalid score'; end if;

  if p.plan = 'elite' then plan_bonus = 4;
  elsif p.plan = 'lite' then plan_bonus = 2;
  end if;
  if exists(select 1 from public.user_boosts where user_id = p.id and boost_id = 'boost-xp-2h' and expires_at > now()) then
    xp_mult = 1.15;
  end if;
  if exists(select 1 from public.user_boosts where user_id = p.id and boost_id = 'boost-coin-rain' and expires_at > now()) then
    coin_mult = 1.10;
  end if;
  has_shield = exists(select 1 from public.user_boosts where user_id = p.id and boost_id = 'boost-streak-shield' and expires_at > now());

  d = (now() at time zone p.timezone)::date;
  select coalesce(sum(xp), 0) into spent from public.training_sessions where user_id = p.id and activity_day = d;
  earned = least(greatest(0, round((a.reward_xp + plan_bonus) * xp_mult)::integer), greatest(0, 2000 - spent));
  coins_earned = case
    when earned > 0 then greatest(a.reward_coins, greatest(1, round(earned::numeric * 0.4 * coin_mult)::integer))
    else 0
  end;

  streak = case
    when prev_day = d then p.daily_streak_count
    when prev_day = d - 1 then p.daily_streak_count + 1
    when has_shield and prev_day = d - 2 then p.daily_streak_count
    else 1
  end;

  update public.training_sessions
    set completed_at = now(), duration_seconds = duration, xp = earned, coins = coins_earned, activity_day = d, score = p_score
    where id = s.id returning * into s;
  update public.profiles set
    points = points + earned,
    coins = coins + coins_earned,
    completed_games = completed_games + 1,
    session_time = session_time + duration / 3600.0,
    daily_streak_count = streak,
    streak_count = streak,
    last_training_day = d
  where id = p.id;

  if has_shield and prev_day is not null and prev_day = d - 2 then
    delete from public.user_boosts where user_id = p.id and boost_id = 'boost-streak-shield';
  end if;

  return to_jsonb(s);
end$$;

revoke all on function public.claim_activity_reward(uuid, text, integer) from public, anon;
grant execute on function public.claim_activity_reward(uuid, text, integer) to authenticated;

-- Keep stub callable so old clients get a clear error, but prefer claim_activity_reward.
revoke all on function public.record_reward(integer, integer) from public, anon;
grant execute on function public.record_reward(integer, integer) to authenticated;

create or replace function public.get_training_totals()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select jsonb_build_object(
    'session_count', count(*),
    'total_xp', coalesce(sum(xp), 0),
    'total_coins', coalesce(sum(coins), 0),
    'total_duration_seconds', coalesce(sum(duration_seconds), 0)
  ) into result
  from public.training_sessions
  where user_id = auth.uid() and completed_at is not null;
  return result;
end$$;

revoke all on function public.get_training_totals() from public, anon;
grant execute on function public.get_training_totals() to authenticated;

update public.activity_catalog set reward_xp = 0, reward_coins = 0, min_seconds = 999999
where id = 'practice-reward';

commit;
