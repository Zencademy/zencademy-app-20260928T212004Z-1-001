begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null check (char_length(username) between 1 and 40),
 brain_type text not null default 'balanced' check(char_length(brain_type)<80),
 onboarding_checked boolean not null default false,
 timezone text not null default 'UTC',
 points bigint not null default 0 check(points>=0),
 coins bigint not null default 0 check(coins>=0),
 plan text not null default 'free' check(plan in ('free','lite','elite')),
 equipped_badge text,
 daily_streak_count integer not null default 0,
 streak_count integer not null default 0,
 last_training_day date,
 completed_games integer not null default 0,
 session_time double precision not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.activity_catalog (
 id text primary key, category text not null, reward_xp integer not null check(reward_xp between 0 and 200),
 reward_coins integer not null check(reward_coins between 0 and 50), min_seconds integer not null default 5 check(min_seconds>=0)
);
create table public.training_sessions (
 id uuid primary key, user_id uuid not null references public.profiles(id) on delete cascade,
 activity_id text not null references public.activity_catalog(id), started_at timestamptz not null default now(),
 completed_at timestamptz, duration_seconds integer not null default 0,
 xp integer not null default 0, coins integer not null default 0, activity_day date,
 score integer check(score between 0 and 100)
);
create index sessions_user_day on public.training_sessions(user_id,activity_day);
create table public.shop_catalog(id text primary key, title text not null, price integer not null check(price>0));
insert into public.shop_catalog values ('badge-legend','Legend',520),('badge-focus','Focus Master',500),('badge-streak','Streak Champion',480),('badge-zen','Zen Spirit',500);
create table public.user_badges(user_id uuid references public.profiles(id) on delete cascade, badge_id text not null, purchased_at timestamptz not null default now(), primary key(user_id,badge_id));
create table public.journal_entries (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 date date not null, mood text not null check(char_length(mood)<100), answers jsonb not null default '{}' check(jsonb_typeof(answers)='object'),
 timestamp bigint not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,date)
);
create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now(); return new; end$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.touch_updated_at();
create trigger journal_updated before update on public.journal_entries for each row execute function public.touch_updated_at();
create function public.create_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,username) values(new.id,'Member '||left(new.id::text,8)) on conflict(id) do nothing;
 return new;
end$$;
create trigger new_user_profile after insert on auth.users for each row execute function public.create_profile();

alter table public.profiles enable row level security;
alter table public.activity_catalog enable row level security;
alter table public.training_sessions enable row level security;
alter table public.shop_catalog enable row level security;
alter table public.user_badges enable row level security;
alter table public.journal_entries enable row level security;
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid());
create policy profile_edit on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy activities_read on public.activity_catalog for select to authenticated using(true);
create policy shop_read on public.shop_catalog for select to authenticated using(true);
create policy sessions_read on public.training_sessions for select to authenticated using(user_id=auth.uid());
create policy badges_read on public.user_badges for select to authenticated using(user_id=auth.uid());
create policy journal_owner on public.journal_entries for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
revoke all on public.profiles, public.activity_catalog, public.shop_catalog, public.training_sessions, public.user_badges, public.journal_entries from anon, authenticated;
grant select on public.profiles, public.activity_catalog, public.shop_catalog, public.training_sessions, public.user_badges to authenticated;
grant update(username,brain_type,onboarding_checked) on public.profiles to authenticated;
grant select,insert,update,delete on public.journal_entries to authenticated;

create function public.set_timezone(p_timezone text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if not exists(select 1 from pg_catalog.pg_timezone_names where name=p_timezone) then raise exception 'Invalid timezone'; end if;
 update public.profiles set timezone=p_timezone where id=auth.uid();
end$$;
create function public.start_activity(p_session_id uuid,p_activity_id text) returns void language plpgsql security definer set search_path='' as $$
declare v_owner uuid; v_activity text;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 if not exists(select 1 from public.activity_catalog where id=p_activity_id) then raise exception 'Unknown activity'; end if;
 select user_id,activity_id into v_owner,v_activity from public.training_sessions where id=p_session_id;
 if found then
   if v_owner<>auth.uid() or v_activity<>p_activity_id then raise exception 'Session conflict'; end if;
   return;
 end if;
 if (select count(*) from public.training_sessions where user_id=auth.uid() and started_at>now()-interval '1 hour')>=120 then raise exception 'Too many sessions; try again later'; end if;
 insert into public.training_sessions(id,user_id,activity_id) values(p_session_id,auth.uid(),p_activity_id);
end$$;
create function public.complete_activity(p_session_id uuid,p_score integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.profiles; s public.training_sessions; a public.activity_catalog; d date; earned integer; coins_earned integer; spent integer; streak integer; elapsed integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into strict p from public.profiles where id=auth.uid() for update;
 select * into s from public.training_sessions where id=p_session_id and user_id=auth.uid() for update;
 if not found then raise exception 'Session not found'; end if;
 if s.completed_at is not null then return to_jsonb(s); end if;
 select * into strict a from public.activity_catalog where id=s.activity_id;
 elapsed=greatest(0,floor(extract(epoch from now()-s.started_at)))::integer;
 if elapsed<a.min_seconds then raise exception 'Finish the exercise before saving'; end if;
 if elapsed>14400 then raise exception 'Session expired; start a new session'; end if;
 if p_score is not null and (p_score<0 or p_score>100) then raise exception 'Invalid score'; end if;
 d=(now() at time zone p.timezone)::date;
 select coalesce(sum(xp),0) into spent from public.training_sessions where user_id=p.id and activity_day=d;
 earned=least(a.reward_xp,greatest(0,2000-spent));
 coins_earned=case when earned>0 then a.reward_coins else 0 end;
 streak=case when p.last_training_day=d then p.daily_streak_count when p.last_training_day=d-1 then p.daily_streak_count+1 else 1 end;
 update public.training_sessions set completed_at=now(),duration_seconds=elapsed,xp=earned,coins=coins_earned,activity_day=d,score=p_score where id=s.id returning * into s;
 update public.profiles set points=points+earned,coins=coins+coins_earned,completed_games=completed_games+1,session_time=session_time+elapsed/3600.0,daily_streak_count=streak,streak_count=streak,last_training_day=d where id=p.id;
 return to_jsonb(s);
end$$;
create function public.purchase_badge(p_item_id text) returns void language plpgsql security definer set search_path='' as $$
declare p public.profiles; cost integer;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into strict p from public.profiles where id=auth.uid() for update;
 select price into cost from public.shop_catalog where id=p_item_id;
 if cost is null then raise exception 'Unknown item'; end if;
 if exists(select 1 from public.user_badges where user_id=p.id and badge_id=p_item_id) then return; end if;
 if p.coins<cost then raise exception 'Not enough coins'; end if;
 insert into public.user_badges(user_id,badge_id) values(p.id,p_item_id);
 update public.profiles set coins=coins-cost where id=p.id;
end$$;
create function public.equip_badge(p_badge_id text) returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_badge_id is not null and not exists(select 1 from public.user_badges where user_id=auth.uid() and badge_id=p_badge_id) then raise exception 'Badge not owned'; end if;
 update public.profiles set equipped_badge=p_badge_id where id=auth.uid();
end$$;
create function public.get_leaderboard(p_limit integer default 50) returns table(id uuid,username text,points bigint,brain_type text,equipped_badge text,streak_count integer,daily_streak_count integer,rank bigint,total_count bigint) language sql stable security definer set search_path='' as $$
 select p.id,p.username,p.points,p.brain_type,p.equipped_badge,p.streak_count,p.daily_streak_count,rank() over(order by p.points desc),count(*) over()
 from public.profiles p where auth.uid() is not null order by p.points desc,p.id limit least(greatest(p_limit,1),100)
$$;
create function public.my_rank() returns bigint language sql stable security definer set search_path='' as $$
 select count(*)+1 from public.profiles where points>(select points from public.profiles where id=auth.uid()) and auth.uid() is not null
$$;
create function public.delete_my_account() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 delete from auth.users where id=auth.uid();
end$$;
revoke all on function public.create_profile(),public.touch_updated_at(),public.set_timezone(text),public.start_activity(uuid,text),public.complete_activity(uuid,integer),public.purchase_badge(text),public.equip_badge(text),public.get_leaderboard(integer),public.my_rank(),public.delete_my_account() from public;
grant execute on function public.set_timezone(text),public.start_activity(uuid,text),public.complete_activity(uuid,integer),public.purchase_badge(text),public.equip_badge(text),public.get_leaderboard(integer),public.my_rank(),public.delete_my_account() to authenticated;
-- Supabase creates the publication. Conditional block also allows local PostgreSQL tests.
do $$begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then alter publication supabase_realtime add table public.profiles; end if;
end$$;
commit;
