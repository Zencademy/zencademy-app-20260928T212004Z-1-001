-- Keep cosmetics on purchase_badge; timed boosts must use purchase_boost.

create or replace function public.purchase_badge(p_item_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare p public.profiles; cost integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_item_id like 'boost-%' then raise exception 'Use purchase_boost for boosts'; end if;
  select * into strict p from public.profiles where id = auth.uid() for update;
  select price into cost from public.shop_catalog where id = p_item_id;
  if cost is null then raise exception 'Unknown item'; end if;
  if exists(select 1 from public.user_badges where user_id = p.id and badge_id = p_item_id) then return; end if;
  if p.coins < cost then raise exception 'Not enough coins'; end if;
  insert into public.user_badges(user_id, badge_id) values (p.id, p_item_id);
  update public.profiles set coins = coins - cost where id = p.id;
end$$;

revoke all on function public.purchase_badge(text) from public, anon;
grant execute on function public.purchase_badge(text) to authenticated;
