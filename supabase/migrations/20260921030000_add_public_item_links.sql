-- Datos opcionales para la ficha de un local aprobado. Nunca se rellenan con enlaces ficticios.

alter table public.items
  add column if not exists website_url text,
  add column if not exists instagram_url text;

alter table public.items
  drop constraint if exists items_website_url_check,
  add constraint items_website_url_check check (
    website_url is null or website_url ~ '^https://'
  ),
  drop constraint if exists items_instagram_url_check,
  add constraint items_instagram_url_check check (
    instagram_url is null or instagram_url ~ '^https://'
  );

comment on column public.items.website_url is 'Sitio oficial verificado del local, si existe.';
comment on column public.items.instagram_url is 'Instagram verificado del local, si existe.';
