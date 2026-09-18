create table public.comparisons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'draft',
  created_by uuid not null references auth.users (id) on delete cascade,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comparisons_title_length check (char_length(btrim(title)) between 3 and 120),
  constraint comparisons_description_length check (
    description is null or char_length(btrim(description)) <= 1000
  ),
  constraint comparisons_status check (status in ('draft', 'published', 'closed')),
  constraint comparisons_publication_timestamp check (
    (status = 'published' and published_at is not null) or status <> 'published'
  )
);

create table public.comparison_options (
  id uuid primary key default gen_random_uuid(),
  comparison_id uuid not null references public.comparisons (id) on delete cascade,
  label text not null,
  position smallint not null,
  created_at timestamptz not null default now(),
  constraint comparison_options_label_length check (char_length(btrim(label)) between 2 and 80),
  constraint comparison_options_position check (position in (1, 2)),
  constraint comparison_options_unique_position unique (comparison_id, position)
);

create table public.votes (
  comparison_id uuid not null references public.comparisons (id) on delete cascade,
  voter_id uuid not null references auth.users (id) on delete cascade,
  option_id uuid not null references public.comparison_options (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (comparison_id, voter_id)
);

create index votes_option_id_idx on public.votes (option_id);

create or replace function public.require_two_options_to_publish()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'published' and old.status <> 'published' and (
    select count(*) from public.comparison_options where comparison_id = new.id
  ) <> 2 then
    raise exception 'a published comparison needs exactly two options';
  end if;

  if new.status = 'published' and old.status <> 'published' then
    new.published_at := coalesce(new.published_at, now());
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger comparisons_require_two_options_to_publish
  before update on public.comparisons
  for each row execute procedure public.require_two_options_to_publish();

create or replace function public.validate_vote_option()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.comparison_options
    where id = new.option_id and comparison_id = new.comparison_id
  ) then
    raise exception 'option does not belong to comparison';
  end if;

  return new;
end;
$$;

create trigger votes_validate_option
  before insert or update on public.votes
  for each row execute procedure public.validate_vote_option();

alter table public.comparisons enable row level security;
alter table public.comparison_options enable row level security;
alter table public.votes enable row level security;

create policy "published comparisons are readable"
on public.comparisons
for select
using (status = 'published' or (select auth.uid()) = created_by);

create policy "users create draft comparisons"
on public.comparisons
for insert
to authenticated
with check ((select auth.uid()) = created_by and status = 'draft');

create policy "owners update comparisons"
on public.comparisons
for update
to authenticated
using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

create policy "visible comparison options are readable"
on public.comparison_options
for select
using (
  exists (
    select 1
    from public.comparisons
    where comparisons.id = comparison_options.comparison_id
      and (comparisons.status = 'published' or comparisons.created_by = (select auth.uid()))
  )
);

create policy "owners manage draft options"
on public.comparison_options
for all
to authenticated
using (
  exists (
    select 1
    from public.comparisons
    where comparisons.id = comparison_options.comparison_id
      and comparisons.created_by = (select auth.uid())
      and comparisons.status = 'draft'
  )
)
with check (
  exists (
    select 1
    from public.comparisons
    where comparisons.id = comparison_options.comparison_id
      and comparisons.created_by = (select auth.uid())
      and comparisons.status = 'draft'
  )
);

create policy "users read their own votes"
on public.votes
for select
to authenticated
using ((select auth.uid()) = voter_id);

create or replace function public.cast_vote(p_comparison_id uuid, p_option_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_voter_id uuid := auth.uid();
  selected_option_id uuid;
begin
  if current_voter_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;

  if not exists (
    select 1
    from public.comparisons
    where id = p_comparison_id and status = 'published'
  ) then
    raise exception 'comparison is not available for voting';
  end if;

  if not exists (
    select 1
    from public.comparison_options
    where id = p_option_id and comparison_id = p_comparison_id
  ) then
    raise exception 'option does not belong to comparison';
  end if;

  insert into public.votes (comparison_id, voter_id, option_id)
  values (p_comparison_id, current_voter_id, p_option_id)
  on conflict (comparison_id, voter_id) do nothing
  returning option_id into selected_option_id;

  if selected_option_id is null then
    raise exception 'vote already exists' using errcode = '23505';
  end if;

  return selected_option_id;
end;
$$;

revoke all on function public.cast_vote(uuid, uuid) from public;
grant execute on function public.cast_vote(uuid, uuid) to authenticated;

create or replace function public.get_comparison_results(p_comparison_id uuid)
returns table (option_id uuid, label text, votes_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    options.id as option_id,
    options.label,
    count(votes.voter_id) as votes_count
  from public.comparison_options as options
  left join public.votes
    on votes.option_id = options.id
  where options.comparison_id = p_comparison_id
    and exists (
      select 1
      from public.comparisons
      where id = p_comparison_id and status in ('published', 'closed')
    )
  group by options.id, options.label, options.position
  order by options.position;
$$;

revoke all on function public.get_comparison_results(uuid) from public;
grant execute on function public.get_comparison_results(uuid) to anon, authenticated;
