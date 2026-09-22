-- P0: embudo de retención y diagnóstico de acceso sin almacenar datos personales.

alter table public.product_events
  drop constraint if exists product_events_name_check;

alter table public.product_events
  add constraint product_events_name_check check (event_name in (
    'duel_viewed',
    'vote_cast',
    'ranking_viewed',
    'introduction_completed',
    'round_completed',
    'next_round_started',
    'favorite_added',
    'favorite_removed',
    'item_details_opened',
    'external_link_clicked',
    'profile_updated'
  ));

create or replace function public.record_product_event(
  p_event_name text,
  p_duel_id uuid default null
)
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

  if p_event_name not in (
    'introduction_completed',
    'round_completed',
    'next_round_started',
    'favorite_added',
    'favorite_removed',
    'item_details_opened',
    'external_link_clicked',
    'profile_updated'
  ) then
    raise exception 'unsupported product event' using errcode = '22023';
  end if;

  insert into public.product_events (viewer_id, event_name, duel_id)
  values (current_viewer_id, p_event_name, p_duel_id);
end;
$$;

revoke all on function public.record_product_event(text, uuid) from public;
grant execute on function public.record_product_event(text, uuid) to authenticated;

create table if not exists public.auth_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  outcome text not null,
  error_code text,
  created_at timestamptz not null default now(),
  constraint auth_events_name_check check (event_name in (
    'magic_link_requested',
    'magic_link_sent',
    'magic_link_failed',
    'magic_link_confirmed',
    'magic_link_confirmation_failed'
  )),
  constraint auth_events_outcome_check check (outcome in ('started', 'success', 'error')),
  constraint auth_events_error_code_length check (error_code is null or char_length(error_code) <= 120)
);

create index if not exists auth_events_name_created_at_idx
  on public.auth_events (event_name, created_at desc);

alter table public.auth_events enable row level security;

drop policy if exists "admins read auth events" on public.auth_events;
create policy "admins read auth events"
on public.auth_events
for select
to authenticated
using (public.is_admin());

create or replace function public.record_auth_event(
  p_event_name text,
  p_outcome text,
  p_error_code text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_event_name not in (
    'magic_link_requested',
    'magic_link_sent',
    'magic_link_failed',
    'magic_link_confirmed',
    'magic_link_confirmation_failed'
  ) then
    raise exception 'unsupported auth event' using errcode = '22023';
  end if;

  if p_outcome not in ('started', 'success', 'error') then
    raise exception 'unsupported auth event outcome' using errcode = '22023';
  end if;

  insert into public.auth_events (event_name, outcome, error_code)
  values (p_event_name, p_outcome, left(nullif(trim(p_error_code), ''), 120));
end;
$$;

revoke all on function public.record_auth_event(text, text, text) from public;
grant execute on function public.record_auth_event(text, text, text) to anon, authenticated;
