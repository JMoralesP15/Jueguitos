-- Anonymous visitors are authenticated by Supabase but do not receive a public profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if coalesce(new.is_anonymous, false) then
    return new;
  end if;

  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;

create table public.items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'business_name',
  name text not null,
  image_url text not null,
  category text not null,
  city text not null,
  status text not null default 'active',
  rating numeric(8, 2) not null default 1500,
  duel_count integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_type_check check (type = 'business_name'),
  constraint items_name_length check (char_length(btrim(name)) between 2 and 120),
  constraint items_image_url_not_blank check (char_length(btrim(image_url)) > 0),
  constraint items_category_length check (char_length(btrim(category)) between 2 and 80),
  constraint items_city_length check (char_length(btrim(city)) between 2 and 80),
  constraint items_status_check check (status in ('pending', 'active', 'hidden')),
  constraint items_nonnegative_stats check (duel_count >= 0 and wins >= 0 and losses >= 0),
  constraint items_consistent_stats check (duel_count = wins + losses)
);

create unique index items_unique_name_category_city_idx
on public.items (lower(btrim(name)), lower(btrim(category)), lower(btrim(city)));

create index items_active_ranking_idx
on public.items (rating desc, duel_count desc)
where status = 'active';

create table public.duels (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references auth.users (id) on delete cascade,
  first_item_id uuid not null references public.items (id) on delete restrict,
  second_item_id uuid not null references public.items (id) on delete restrict,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint duels_different_items check (first_item_id <> second_item_id),
  constraint duels_status_check check (status in ('open', 'resolved')),
  constraint duels_resolution_check check (
    (status = 'resolved' and resolved_at is not null) or status = 'open'
  )
);

create index duels_viewer_id_idx on public.duels (viewer_id, created_at desc);

create table public.duel_votes (
  duel_id uuid primary key references public.duels (id) on delete cascade,
  voter_id uuid not null references auth.users (id) on delete cascade,
  winner_id uuid not null references public.items (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index duel_votes_voter_id_idx on public.duel_votes (voter_id, created_at desc);

alter table public.items enable row level security;
alter table public.duels enable row level security;
alter table public.duel_votes enable row level security;

create policy "active items are publicly readable"
on public.items
for select
using (status = 'active');

create policy "viewers read their own duels"
on public.duels
for select
to authenticated
using ((select auth.uid()) = viewer_id);

create policy "voters read their own duel votes"
on public.duel_votes
for select
to authenticated
using ((select auth.uid()) = voter_id);

create or replace function public.create_next_duel()
returns table (duel_id uuid, first_item jsonb, second_item jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_viewer_id uuid := auth.uid();
  selected_first_item public.items%rowtype;
  selected_second_item public.items%rowtype;
  created_duel_id uuid;
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into selected_first_item
  from public.items as item
  where item.status = 'active'
    and not exists (
      select 1
      from public.duels as duel
      where duel.viewer_id = current_viewer_id
        and (duel.first_item_id = item.id or duel.second_item_id = item.id)
    )
  order by random()
  limit 1;

  if selected_first_item.id is null then
    raise exception 'not enough unseen items' using errcode = 'P0001';
  end if;

  select * into selected_second_item
  from public.items as item
  where item.status = 'active'
    and item.id <> selected_first_item.id
    and not exists (
      select 1
      from public.duels as duel
      where duel.viewer_id = current_viewer_id
        and (duel.first_item_id = item.id or duel.second_item_id = item.id)
    )
  order by random()
  limit 1;

  if selected_second_item.id is null then
    raise exception 'not enough unseen items' using errcode = 'P0001';
  end if;

  insert into public.duels (viewer_id, first_item_id, second_item_id)
  values (current_viewer_id, selected_first_item.id, selected_second_item.id)
  returning id into created_duel_id;

  return query
  select
    created_duel_id,
    jsonb_build_object(
      'id', selected_first_item.id,
      'type', selected_first_item.type,
      'name', selected_first_item.name,
      'imageUrl', selected_first_item.image_url,
      'category', selected_first_item.category,
      'city', selected_first_item.city,
      'rating', selected_first_item.rating
    ),
    jsonb_build_object(
      'id', selected_second_item.id,
      'type', selected_second_item.type,
      'name', selected_second_item.name,
      'imageUrl', selected_second_item.image_url,
      'category', selected_second_item.category,
      'city', selected_second_item.city,
      'rating', selected_second_item.rating
    );
end;
$$;

create or replace function public.cast_duel_vote(p_duel_id uuid, p_winner_id uuid)
returns table (winner_rating numeric, loser_rating numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_voter_id uuid := auth.uid();
  selected_duel public.duels%rowtype;
  first_rating numeric;
  second_rating numeric;
  next_first_rating numeric;
  next_second_rating numeric;
  expected_first numeric;
begin
  if current_voter_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select * into selected_duel
  from public.duels
  where id = p_duel_id
  for update;

  if selected_duel.id is null or selected_duel.viewer_id <> current_voter_id then
    raise exception 'duel is not available' using errcode = '42501';
  end if;

  if selected_duel.status <> 'open' then
    raise exception 'duel has already been resolved' using errcode = '23505';
  end if;

  if p_winner_id not in (selected_duel.first_item_id, selected_duel.second_item_id) then
    raise exception 'winner does not belong to duel' using errcode = '23514';
  end if;

  perform 1
  from public.items
  where id in (selected_duel.first_item_id, selected_duel.second_item_id)
  order by id
  for update;

  select rating into first_rating from public.items where id = selected_duel.first_item_id;
  select rating into second_rating from public.items where id = selected_duel.second_item_id;

  expected_first := 1 / (1 + power(10::numeric, (second_rating - first_rating) / 400));
  next_first_rating := round(
    first_rating + 32 * ((case when p_winner_id = selected_duel.first_item_id then 1 else 0 end) - expected_first),
    2
  );
  next_second_rating := round(second_rating + 32 * ((case when p_winner_id = selected_duel.second_item_id then 1 else 0 end) - (1 - expected_first)), 2);

  insert into public.duel_votes (duel_id, voter_id, winner_id)
  values (selected_duel.id, current_voter_id, p_winner_id);

  update public.items
  set
    rating = case
      when id = selected_duel.first_item_id then next_first_rating
      else next_second_rating
    end,
    duel_count = duel_count + 1,
    wins = wins + case when id = p_winner_id then 1 else 0 end,
    losses = losses + case when id <> p_winner_id then 1 else 0 end,
    updated_at = now()
  where id in (selected_duel.first_item_id, selected_duel.second_item_id);

  update public.duels
  set status = 'resolved', resolved_at = now()
  where id = selected_duel.id;

  return query
  select
    case when p_winner_id = selected_duel.first_item_id then next_first_rating else next_second_rating end,
    case when p_winner_id = selected_duel.first_item_id then next_second_rating else next_first_rating end;
end;
$$;

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
    rank() over (order by item.rating desc, item.duel_count desc, item.created_at asc) as rank_position,
    item.id,
    item.name,
    item.image_url,
    item.category,
    item.city,
    item.rating,
    item.duel_count,
    item.wins,
    item.losses,
    case when item.duel_count = 0 then 0 else round((item.wins::numeric / item.duel_count) * 100, 1) end
  from public.items as item
  where item.status = 'active'
  order by item.rating desc, item.duel_count desc, item.created_at asc;
$$;

revoke all on function public.create_next_duel() from public;
revoke all on function public.cast_duel_vote(uuid, uuid) from public;
revoke all on function public.get_public_ranking() from public;
grant execute on function public.create_next_duel() to authenticated;
grant execute on function public.cast_duel_vote(uuid, uuid) to authenticated;
grant execute on function public.get_public_ranking() to anon, authenticated;
