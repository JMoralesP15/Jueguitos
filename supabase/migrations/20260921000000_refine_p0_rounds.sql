-- P0: progreso explícito, estados de catálogo distinguibles y rondas encadenables.

drop function if exists public.create_next_duel();

create function public.create_next_duel()
returns table (
  duel_id uuid,
  first_item jsonb,
  second_item jsonb,
  round_position integer,
  round_size integer
)
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
  selected_first_id uuid;
  selected_second_id uuid;
  created_duel_id uuid;
  active_item_count integer;
  current_duel_count integer;
  current_round_size integer;
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_viewer_id::text, 0));

  select count(*)::integer into active_item_count
  from public.items
  where status = 'active';

  if active_item_count < 2 then
    raise exception 'catalog is not ready' using errcode = 'P0002';
  end if;

  current_round_size := least(10, floor(active_item_count / 2.0)::integer);

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

  select count(*)::integer into current_duel_count
  from public.duels
  where session_id = current_session.id;

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
      ),
      current_duel_count,
      current_round_size;
    return;
  end if;

  if current_duel_count >= current_round_size then
    raise exception 'round is complete' using errcode = 'P0003';
  end if;

  select candidate.first_id, candidate.second_id
  into selected_first_id, selected_second_id
  from (
    select first_candidate.id as first_id, second_candidate.id as second_id
    from public.items as first_candidate
    cross join public.items as second_candidate
    where first_candidate.status = 'active'
      and second_candidate.status = 'active'
      and first_candidate.id::text < second_candidate.id::text
      and not exists (
        select 1
        from public.duels as session_duel
        where session_duel.session_id = current_session.id
          and (
            session_duel.first_item_id in (first_candidate.id, second_candidate.id)
            or session_duel.second_item_id in (first_candidate.id, second_candidate.id)
          )
      )
      and not exists (
        select 1
        from public.duels as previous_duel
        where previous_duel.viewer_id = current_viewer_id
          and previous_duel.status = 'resolved'
          and least(previous_duel.first_item_id, previous_duel.second_item_id) = first_candidate.id
          and greatest(previous_duel.first_item_id, previous_duel.second_item_id) = second_candidate.id
      )
    order by random()
    limit 1
  ) as candidate;

  if selected_first_id is null or selected_second_id is null then
    if exists (
      select 1
      from public.items as first_candidate
      cross join public.items as second_candidate
      where first_candidate.status = 'active'
        and second_candidate.status = 'active'
        and first_candidate.id::text < second_candidate.id::text
        and not exists (
          select 1
          from public.duels as previous_duel
          where previous_duel.viewer_id = current_viewer_id
            and previous_duel.status = 'resolved'
            and least(previous_duel.first_item_id, previous_duel.second_item_id) = first_candidate.id
            and greatest(previous_duel.first_item_id, previous_duel.second_item_id) = second_candidate.id
        )
    ) then
      raise exception 'round is complete' using errcode = 'P0003';
    end if;

    raise exception 'catalog is complete for this player' using errcode = 'P0004';
  end if;

  select * into selected_first_item from public.items where id = selected_first_id;
  select * into selected_second_item from public.items where id = selected_second_id;

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
    ),
    current_duel_count + 1,
    current_round_size;
end;
$$;

create or replace function public.get_current_round_summary()
returns table (votes_cast integer, round_size integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_viewer_id uuid := auth.uid();
  current_session_id uuid;
  active_item_count integer;
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  select id into current_session_id
  from public.game_sessions
  where viewer_id = current_viewer_id
    and status = 'active'
  order by last_activity_at desc
  limit 1;

  if current_session_id is null then
    return;
  end if;

  select count(*)::integer into active_item_count
  from public.items
  where status = 'active';

  return query
  select
    count(*) filter (where duel.status = 'resolved')::integer,
    least(10, floor(active_item_count / 2.0)::integer)
  from public.duels as duel
  where duel.session_id = current_session_id;
end;
$$;

create or replace function public.start_new_round()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_viewer_id uuid := auth.uid();
  current_session_id uuid;
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(current_viewer_id::text, 0));

  select id into current_session_id
  from public.game_sessions
  where viewer_id = current_viewer_id
    and status = 'active'
  order by last_activity_at desc
  limit 1
  for update;

  if current_session_id is null then
    return true;
  end if;

  if exists (
    select 1 from public.duels
    where session_id = current_session_id and status = 'open'
  ) then
    raise exception 'finish the open duel before starting a new round' using errcode = 'P0005';
  end if;

  update public.game_sessions
  set status = 'closed', closed_at = now()
  where id = current_session_id;

  return true;
end;
$$;

revoke all on function public.create_next_duel() from public;
revoke all on function public.get_current_round_summary() from public;
revoke all on function public.start_new_round() from public;

grant execute on function public.create_next_duel() to authenticated;
grant execute on function public.get_current_round_summary() to authenticated;
grant execute on function public.start_new_round() to authenticated;

comment on function public.create_next_duel() is
  'Devuelve un duelo con progreso de ronda y errores distinguibles para catálogo y cierre.';
comment on function public.get_current_round_summary() is
  'Devuelve sólo conteos factuales de la ronda activa de la cuenta autenticada.';
comment on function public.start_new_round() is
  'Cierra una ronda sin duelo abierto para que la cuenta pueda continuar de inmediato.';
