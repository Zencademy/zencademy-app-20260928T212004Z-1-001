-- Include plan on leaderboard; stable tie-break for my_rank
drop function if exists public.get_leaderboard(integer);

create function public.get_leaderboard(p_limit integer default 50)
returns table(
  id uuid,
  username text,
  points bigint,
  brain_type text,
  equipped_badge text,
  streak_count integer,
  daily_streak_count integer,
  plan text,
  rank bigint,
  total_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.username,
    p.points,
    p.brain_type,
    p.equipped_badge,
    p.streak_count,
    p.daily_streak_count,
    p.plan,
    rank() over (order by p.points desc, p.id),
    count(*) over ()
  from public.profiles p
  where auth.uid() is not null
  order by p.points desc, p.id
  limit least(greatest(p_limit, 1), 100);
$$;

revoke all on function public.get_leaderboard(integer) from public, anon;
grant execute on function public.get_leaderboard(integer) to authenticated;

create or replace function public.my_rank()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null then null
    when not exists (select 1 from public.profiles where id = auth.uid()) then null
    else (
      select count(*) + 1
      from public.profiles
      where points > (select points from public.profiles where id = auth.uid())
         or (points = (select points from public.profiles where id = auth.uid())
             and id < auth.uid())
    )
  end;
$$;

revoke all on function public.my_rank() from public, anon;
grant execute on function public.my_rank() to authenticated;
