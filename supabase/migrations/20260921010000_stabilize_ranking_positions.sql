-- El catálogo nuevo parte completamente empatado. La posición debe seguir siendo única y estable
-- para que la interfaz no repita claves ni entregue veinte medallas de primer lugar.

create or replace function public.get_public_ranking()
returns table (
  rank_position bigint,
  item_id uuid,
  name text,
  image_url text,
  category text,
  city text,
  rating numeric,
  duel_count integer,
  wins integer,
  losses integer,
  win_rate numeric
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    row_number() over (
      order by item.rating desc, item.duel_count desc, item.created_at asc, item.id asc
    ) as rank_position,
    item.id,
    item.name,
    item.image_url,
    item.category,
    item.city,
    item.rating,
    item.duel_count,
    item.wins,
    item.losses,
    case
      when item.duel_count = 0 then 0
      else round((item.wins::numeric / item.duel_count::numeric) * 100, 1)
    end as win_rate
  from public.items as item
  where item.status = 'active'
  order by item.rating desc, item.duel_count desc, item.created_at asc, item.id asc;
$$;

revoke all on function public.get_public_ranking() from public;
grant execute on function public.get_public_ranking() to anon, authenticated;

comment on function public.get_public_ranking() is
  'Ranking público con posición única y desempate estable para catálogos nuevos.';
