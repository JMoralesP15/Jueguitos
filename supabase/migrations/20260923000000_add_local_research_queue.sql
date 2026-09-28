-- Cola privada para fichas de investigación. No crea locales jugables ni publica imágenes.
create table public.local_research_batches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'collecting' check (status in ('collecting', 'closed')),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create table public.local_research_candidates (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.local_research_batches(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  category text not null,
  city text not null check (char_length(city) between 2 and 80),
  address text not null check (char_length(address) between 5 and 200),
  website_url text,
  instagram_url text,
  source_url text not null,
  address_source_url text not null,
  website_source_url text,
  instagram_source_url text,
  notes text,
  photo_rights_attested_by uuid references auth.users(id),
  photo_rights_attested_at timestamptz,
  status text not null default 'researching' check (status in ('researching', 'ready', 'submitted', 'archived')),
  promoted_item_id uuid references public.items(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint local_research_candidate_category_allowed check (
    category in (
      'Cafetería y pastelería', 'Bar, pub y cervecería', 'Panadería', 'Peluquería y barbería'
    )
  ),
  constraint local_research_photo_attestation_pair check (
    (photo_rights_attested_by is null and photo_rights_attested_at is null)
    or (photo_rights_attested_by is not null and photo_rights_attested_at is not null)
  )
);

create index local_research_candidates_batch_status_idx
  on public.local_research_candidates (batch_id, status, created_at);

create unique index local_research_candidates_exact_dedupe_idx
  on public.local_research_candidates (batch_id, lower(trim(name)), lower(trim(city)))
  where status <> 'archived';

create or replace function public.enforce_local_research_batch_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  batch_creator uuid;
  batch_status text;
  candidate_count integer;
begin
  select batch.created_by, batch.status
    into batch_creator, batch_status
    from public.local_research_batches as batch
    where batch.id = new.batch_id
    for update;

  if batch_creator is null or batch_creator <> new.created_by or batch_status <> 'collecting' then
    raise exception 'research batch is unavailable';
  end if;

  select count(*) into candidate_count
    from public.local_research_candidates as candidate
    where candidate.batch_id = new.batch_id and candidate.status <> 'archived';

  if candidate_count >= 50 then
    raise exception 'research batch limit reached';
  end if;
  return new;
end;
$$;

create trigger local_research_batch_limit
  before insert on public.local_research_candidates
  for each row execute function public.enforce_local_research_batch_limit();

alter table public.local_research_batches enable row level security;
alter table public.local_research_candidates enable row level security;

grant select, insert, update on public.local_research_batches to authenticated;
grant select, insert, update on public.local_research_candidates to authenticated;

create policy "admins manage local research batches"
  on public.local_research_batches for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admins manage local research candidates"
  on public.local_research_candidates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
