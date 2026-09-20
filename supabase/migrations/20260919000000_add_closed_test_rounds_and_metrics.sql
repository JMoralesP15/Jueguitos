-- P0: rondas de juego, recuperación de duelos y medición mínima de la cohorte cerrada.

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),
  closed_at timestamptz,
  constraint game_sessions_status_check check (status in ('active', 'closed')),
  constraint game_sessions_closure_check check (
    (status = 'active' and closed_at is null)
    or (status = 'closed' and closed_at is not null)
  )
);

create unique index game_sessions_one_active_viewer_idx
on public.game_sessions (viewer_id)
where status = 'active';

alter table public.game_sessions enable row level security;

create policy "viewers read their own game sessions"
on public.game_sessions
for select
to authenticated
using ((select auth.uid()) = viewer_id);

create policy "admins read all game sessions"
on public.game_sessions
for select
to authenticated
using (public.is_admin());

alter table public.duels
  add column session_id uuid references public.game_sessions (id) on delete set null;

alter table public.duels drop constraint duels_status_check;
alter table public.duels
  add constraint duels_status_check check (status in ('open', 'resolved', 'expired'));

alter table public.duels drop constraint duels_resolution_check;
alter table public.duels
  add constraint duels_resolution_check check (
    (status = 'open' and resolved_at is null)
    or (status in ('resolved', 'expired') and resolved_at is not null)
  );

-- Los duelos abiertos anteriores no pertenecen a una ronda y no deben volver a ser votables.
update public.duels
set status = 'expired', resolved_at = now()
where status = 'open' and session_id is null;

create index duels_session_id_idx on public.duels (session_id, created_at desc);

create table public.product_events (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid not null references auth.users (id) on delete cascade,
  event_name text not null,
  duel_id uuid references public.duels (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint product_events_name_check check (event_name in ('duel_viewed', 'vote_cast', 'ranking_viewed'))
);

create index product_events_name_created_at_idx on public.product_events (event_name, created_at desc);
create index product_events_viewer_id_idx on public.product_events (viewer_id, created_at desc);

alter table public.product_events enable row level security;

create policy "admins read product events"
on public.product_events
for select
to authenticated
using (public.is_admin());

create or replace function public.create_next_duel()
returns table (duel_id uuid, first_item jsonb, second_item jsonb)
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_viewer_id uuid := auth.uid();
  current_session public.game_sessions%rowtype;
  existing_duel public.duels%rowtype;
  selected_first_item public.items%rowtype;
  selected_second_item public.items%rowtype;
  created_duel_id uuid;
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  -- Serializa la creación de ronda por identidad para que dos solicitudes simultáneas no creen
  -- duelos distintos ni más de una ronda activa.
  perform pg_advisory_xact_lock(hashtextextended(current_viewer_id::text, 0));

  select * into current_session
  from public.game_sessions as session
  where session.viewer_id = current_viewer_id
    and session.status = 'active'
  order by session.last_activity_at desc
  limit 1
  for update;

  if current_session.id is not null
     and current_session.last_activity_at < now() - interval '30 minutes' then
    update public.game_sessions
    set status = 'closed', closed_at = now()
    where id = current_session.id;
    current_session.id := null;
  end if;

  if current_session.id is null then
    insert into public.game_sessions (viewer_id)
    values (current_viewer_id)
    returning * into current_session;
  else
    update public.game_sessions
    set last_activity_at = now()
    where id = current_session.id
    returning * into current_session;
  end if;

  select * into existing_duel
  from public.duels as duel
  where duel.session_id = current_session.id
    and duel.status = 'open'
  order by duel.created_at desc
  limit 1
  for update;

  if existing_duel.id is not null then
    select * into selected_first_item from public.items where id = existing_duel.first_item_id;
    select * into selected_second_item from public.items where id = existing_duel.second_item_id;

    return query
    select
      existing_duel.id,
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
    return;
  end if;

  select * into selected_first_item
  from public.items as item
  where item.status = 'active'
    and not exists (
      select 1
      from public.duels as duel
      where duel.session_id = current_session.id
        and (duel.first_item_id = item.id or duel.second_item_id = item.id)
    )
  order by random()
  limit 1;

  if selected_first_item.id is null then
    raise exception 'round is complete' using errcode = 'P0001';
  end if;

  select * into selected_second_item
  from public.items as item
  where item.status = 'active'
    and item.id <> selected_first_item.id
    and not exists (
      select 1
      from public.duels as duel
      where duel.session_id = current_session.id
        and (duel.first_item_id = item.id or duel.second_item_id = item.id)
    )
  order by random()
  limit 1;

  if selected_second_item.id is null then
    raise exception 'round is complete' using errcode = 'P0001';
  end if;

  insert into public.duels (viewer_id, session_id, first_item_id, second_item_id)
  values (current_viewer_id, current_session.id, selected_first_item.id, selected_second_item.id)
  returning id into created_duel_id;

  insert into public.product_events (viewer_id, event_name, duel_id)
  values (current_viewer_id, 'duel_viewed', created_duel_id);

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
  selected_session public.game_sessions%rowtype;
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

  select * into selected_session
  from public.game_sessions
  where id = selected_duel.session_id
  for update;

  if selected_session.id is null
     or selected_session.status <> 'active'
     or selected_session.last_activity_at < now() - interval '30 minutes' then
    if selected_session.id is not null and selected_session.status = 'active' then
      update public.game_sessions
      set status = 'closed', closed_at = now()
      where id = selected_session.id;
    end if;
    update public.duels
    set status = 'expired', resolved_at = now()
    where id = selected_duel.id and status = 'open';
    raise exception 'duel round has expired' using errcode = 'P0001';
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

  update public.game_sessions
  set last_activity_at = now()
  where id = selected_session.id;

  insert into public.product_events (viewer_id, event_name, duel_id)
  values (current_voter_id, 'vote_cast', selected_duel.id);

  return query
  select
    case when p_winner_id = selected_duel.first_item_id then next_first_rating else next_second_rating end,
    case when p_winner_id = selected_duel.first_item_id then next_second_rating else next_first_rating end;
end;
$$;

create or replace function public.record_ranking_view()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_viewer_id uuid := auth.uid();
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  insert into public.product_events (viewer_id, event_name)
  values (current_viewer_id, 'ranking_viewed');
end;
$$;

revoke all on function public.create_next_duel() from public;
revoke all on function public.cast_duel_vote(uuid, uuid) from public;
revoke all on function public.record_ranking_view() from public;
grant execute on function public.create_next_duel() to authenticated;
grant execute on function public.cast_duel_vote(uuid, uuid) to authenticated;
grant execute on function public.record_ranking_view() to authenticated;
