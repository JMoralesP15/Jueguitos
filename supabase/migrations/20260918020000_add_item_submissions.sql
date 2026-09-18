-- MVP-004a: aportes privados de nombres de locales con una foto en revisión.

alter table public.items
  drop constraint items_image_url_not_blank,
  alter column image_url drop not null,
  add column image_path text;

alter table public.items
  add constraint items_pending_has_private_image
    check (status <> 'pending' or image_path is not null),
  add constraint items_active_has_public_image
    check (status <> 'active' or image_url is not null),
  add constraint items_category_allowed
    check (
      category in (
        'Restaurante',
        'Cafetería y pastelería',
        'Bar, pub y cervecería',
        'Comida rápida',
        'Panadería',
        'Heladería',
        'Peluquería y barbería',
        'Belleza y bienestar',
        'Moda y accesorios',
        'Hogar y decoración',
        'Mascotas',
        'Salud y farmacia',
        'Deporte y aire libre',
        'Tecnología y reparación',
        'Librería y educación',
        'Servicios profesionales',
        'Turismo y entretención',
        'Otro'
      )
    );

create policy "contributors create pending items"
on public.items
for insert
to authenticated
with check (
  auth.uid() = created_by
  and status = 'pending'
  and exists (select 1 from public.profiles profile where profile.id = auth.uid())
);

create policy "contributors read their own items"
on public.items
for select
to authenticated
using (auth.uid() = created_by);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'item-submissions',
  'item-submissions',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "contributors upload their own submission photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'item-submissions'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and exists (select 1 from public.profiles profile where profile.id = auth.uid())
);

create policy "contributors read their own submission photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'item-submissions'
  and owner_id = (select auth.uid()::text)
);

create policy "contributors remove their own submission photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'item-submissions'
  and owner_id = (select auth.uid()::text)
);
