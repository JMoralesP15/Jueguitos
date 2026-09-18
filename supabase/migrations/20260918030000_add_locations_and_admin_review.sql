-- MVP-004b: ubicación del local, revisión administrativa y publicación de fotos.

alter table public.profiles
  add column role text not null default 'contributor',
  add constraint profiles_role_check check (role in ('contributor', 'admin'));

-- El rol no puede cambiarse desde el cliente autenticado.
revoke update on table public.profiles from authenticated;
grant update (username, display_name, avatar_url) on table public.profiles to authenticated;

update public.profiles as profile
set role = 'admin'
from auth.users as auth_user
where profile.id = auth_user.id
  and lower(auth_user.email) = 'javier.morales@ist.cl';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles as profile
    where profile.id = auth.uid()
      and profile.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.items
  add column address text,
  add column latitude double precision,
  add column longitude double precision,
  add column location_accuracy_meters double precision,
  add column location_source text;

alter table public.items
  add constraint items_location_pair_check check (
    (latitude is null and longitude is null)
    or (latitude between -90 and 90 and longitude between -180 and 180)
  ),
  add constraint items_location_accuracy_check check (
    location_accuracy_meters is null or location_accuracy_meters > 0
  ),
  add constraint items_location_source_check check (
    location_source is null or location_source in ('device', 'manual')
  );

create index items_coordinates_idx
on public.items (latitude, longitude)
where status = 'active';

create policy "admins read all item submissions"
on public.items
for select
to authenticated
using (public.is_admin());

create policy "admins update item submissions"
on public.items
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-images',
  'item-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "admins read private submission photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'item-submissions' and public.is_admin());

create policy "admins publish approved item photos"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'item-images' and public.is_admin());
