-- Primera iteración del feedback: favoritos privados y lectura privada del perfil.

drop policy if exists "profiles are publicly readable" on public.profiles;

drop policy if exists "users read their own profile" on public.profiles;
create policy "users read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create table if not exists public.item_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null references public.items (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index item_favorites_item_id_idx on public.item_favorites (item_id);

alter table public.item_favorites enable row level security;

drop policy if exists "users read their own item favorites" on public.item_favorites;
create policy "users read their own item favorites"
on public.item_favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "users save active items as favorites" on public.item_favorites;
create policy "users save active items as favorites"
on public.item_favorites
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.items as item
    where item.id = item_id and item.status = 'active'
  )
);

drop policy if exists "users remove their own item favorites" on public.item_favorites;
create policy "users remove their own item favorites"
on public.item_favorites
for delete
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.item_favorites from anon, public;
grant select, insert, delete on table public.item_favorites to authenticated;
