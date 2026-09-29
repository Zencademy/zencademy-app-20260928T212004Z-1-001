begin;

revoke all on function public.complete_activity(uuid, integer) from public, anon;
revoke all on function public.create_profile() from public, anon;
revoke all on function public.delete_my_account() from public, anon;
revoke all on function public.equip_badge(text) from public, anon;
revoke all on function public.get_leaderboard(integer) from public, anon;
revoke all on function public.my_rank() from public, anon;
revoke all on function public.purchase_badge(text) from public, anon;
revoke all on function public.purchase_ebook(text) from public, anon;
revoke all on function public.record_reward(integer, integer) from public, anon;
revoke all on function public.set_timezone(text) from public, anon;
revoke all on function public.spend_coins(integer, text) from public, anon;
revoke all on function public.start_activity(uuid, text) from public, anon;

grant execute on function public.complete_activity(uuid, integer) to authenticated;
grant execute on function public.create_profile() to authenticated;
grant execute on function public.delete_my_account() to authenticated;
grant execute on function public.equip_badge(text) to authenticated;
grant execute on function public.get_leaderboard(integer) to authenticated;
grant execute on function public.my_rank() to authenticated;
grant execute on function public.purchase_badge(text) to authenticated;
grant execute on function public.purchase_ebook(text) to authenticated;
grant execute on function public.record_reward(integer, integer) to authenticated;
grant execute on function public.set_timezone(text) to authenticated;
grant execute on function public.spend_coins(integer, text) to authenticated;
grant execute on function public.start_activity(uuid, text) to authenticated;

do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

commit;
