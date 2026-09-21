-- P0: cuentas por Magic Link, introducción por cuenta, parejas únicas y feedback inmediato.

alter table public.profiles
  add column onboarding_completed boolean not null default false;

-- Magic Link puede crear una cuenta sin metadata previa. Se asigna un alias técnico estable para
-- conservar el contrato de profiles sin convertir el correo en información pública.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  requested_username text := nullif(new.raw_user_meta_data ->> 'username', '');
  generated_username text := 'jugador_' || left(replace(new.id::text, '-', ''), 12);
begin
  if coalesce(new.is_anonymous, false) then
    return new;
  end if;

  insert into public.profiles (id, username)
  values (new.id, coalesce(requested_username, generated_username));
  return new;
end;
$$;

create index duels_viewer_unordered_pair_idx
on public.duels (
  viewer_id,
  least(first_item_id, second_item_id),
  greatest(first_item_id, second_item_id)
);

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
  selected_first_id uuid;
  selected_second_id uuid;
  created_duel_id uuid;
begin
  if current_viewer_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

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
    raise exception 'round is complete' using errcode = 'P0001';
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
    );
end;
$$;

drop function public.cast_duel_vote(uuid, uuid);

create function public.cast_duel_vote(p_duel_id uuid, p_winner_id uuid)
returns table (
  winner_rating numeric,
  loser_rating numeric,
  first_votes bigint,
  second_votes bigint,
  first_percentage numeric,
  second_percentage numeric
)
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
  first_vote_count bigint;
  second_vote_count bigint;
  total_vote_count bigint;
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
      update public.game_sessions set status = 'closed', closed_at = now()
      where id = selected_session.id;
    end if;
    update public.duels set status = 'expired', resolved_at = now()
    where id = selected_duel.id and status = 'open';
    raise exception 'duel round has expired' using errcode = 'P0001';
  end if;

  if selected_duel.status <> 'open' then
    raise exception 'duel has already been resolved' using errcode = '23505';
  end if;

  if p_winner_id not in (selected_duel.first_item_id, selected_duel.second_item_id) then
    raise exception 'winner does not belong to duel' using errcode = '23514';
  end if;

  if exists (
    select 1 from public.duels as previous_duel
    where previous_duel.viewer_id = current_voter_id
      and previous_duel.status = 'resolved'
      and previous_duel.id <> selected_duel.id
      and least(previous_duel.first_item_id, previous_duel.second_item_id)
        = least(selected_duel.first_item_id, selected_duel.second_item_id)
      and greatest(previous_duel.first_item_id, previous_duel.second_item_id)
        = greatest(selected_duel.first_item_id, selected_duel.second_item_id)
  ) then
    raise exception 'pair has already been voted' using errcode = '23505';
  end if;

  perform 1 from public.items
  where id in (selected_duel.first_item_id, selected_duel.second_item_id)
  order by id for update;

  select rating into first_rating from public.items where id = selected_duel.first_item_id;
  select rating into second_rating from public.items where id = selected_duel.second_item_id;

  expected_first := 1 / (1 + power(10::numeric, (second_rating - first_rating) / 400));
  next_first_rating := round(first_rating + 32 * (
    (case when p_winner_id = selected_duel.first_item_id then 1 else 0 end) - expected_first
  ), 2);
  next_second_rating := round(second_rating + 32 * (
    (case when p_winner_id = selected_duel.second_item_id then 1 else 0 end) - (1 - expected_first)
  ), 2);

  insert into public.duel_votes (duel_id, voter_id, winner_id)
  values (selected_duel.id, current_voter_id, p_winner_id);

  update public.items
  set
    rating = case when id = selected_duel.first_item_id then next_first_rating else next_second_rating end,
    duel_count = duel_count + 1,
    wins = wins + case when id = p_winner_id then 1 else 0 end,
    losses = losses + case when id <> p_winner_id then 1 else 0 end,
    updated_at = now()
  where id in (selected_duel.first_item_id, selected_duel.second_item_id);

  update public.duels set status = 'resolved', resolved_at = now()
  where id = selected_duel.id;

  update public.game_sessions set last_activity_at = now()
  where id = selected_session.id;

  insert into public.product_events (viewer_id, event_name, duel_id)
  values (current_voter_id, 'vote_cast', selected_duel.id);

  select
    count(*) filter (where vote.winner_id = selected_duel.first_item_id),
    count(*) filter (where vote.winner_id = selected_duel.second_item_id)
  into first_vote_count, second_vote_count
  from public.duel_votes as vote
  join public.duels as duel on duel.id = vote.duel_id
  where least(duel.first_item_id, duel.second_item_id)
      = least(selected_duel.first_item_id, selected_duel.second_item_id)
    and greatest(duel.first_item_id, duel.second_item_id)
      = greatest(selected_duel.first_item_id, selected_duel.second_item_id);

  total_vote_count := first_vote_count + second_vote_count;

  return query select
    case when p_winner_id = selected_duel.first_item_id then next_first_rating else next_second_rating end,
    case when p_winner_id = selected_duel.first_item_id then next_second_rating else next_first_rating end,
    first_vote_count,
    second_vote_count,
    round(first_vote_count::numeric * 100 / total_vote_count, 1),
    round(second_vote_count::numeric * 100 / total_vote_count, 1);
end;
$$;

revoke all on function public.cast_duel_vote(uuid, uuid) from public;
grant execute on function public.cast_duel_vote(uuid, uuid) to authenticated;

