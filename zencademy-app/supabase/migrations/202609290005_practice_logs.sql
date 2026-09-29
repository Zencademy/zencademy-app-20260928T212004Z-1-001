-- Practice logs for Focus / Meditate sessions (history, no XP economy side effects).
create table if not exists public.practice_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('focus', 'meditate')),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  note text not null default '' check (char_length(note) <= 280),
  meta jsonb not null default '{}'::jsonb check (jsonb_typeof(meta) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists practice_logs_user_created on public.practice_logs (user_id, created_at desc);

alter table public.practice_logs enable row level security;

drop policy if exists practice_logs_owner on public.practice_logs;
create policy practice_logs_owner on public.practice_logs
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

revoke all on public.practice_logs from anon, authenticated;
grant select, insert, delete on public.practice_logs to authenticated;

create or replace function public.log_practice(
  p_kind text,
  p_duration_seconds integer,
  p_note text default '',
  p_meta jsonb default '{}'::jsonb
) returns public.practice_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.practice_logs;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if p_kind not in ('focus', 'meditate') then
    raise exception 'Invalid kind';
  end if;
  insert into public.practice_logs (user_id, kind, duration_seconds, note, meta)
  values (
    auth.uid(),
    p_kind,
    greatest(0, coalesce(p_duration_seconds, 0)),
    left(coalesce(p_note, ''), 280),
    case when jsonb_typeof(coalesce(p_meta, '{}'::jsonb)) = 'object' then coalesce(p_meta, '{}'::jsonb) else '{}'::jsonb end
  )
  returning * into row;
  return row;
end;
$$;

revoke all on function public.log_practice(text, integer, text, jsonb) from public, anon;
grant execute on function public.log_practice(text, integer, text, jsonb) to authenticated;
