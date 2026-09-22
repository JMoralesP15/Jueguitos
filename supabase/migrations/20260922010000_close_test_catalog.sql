-- Prueba cerrada: los locales sintéticos del seed quedan ocultos y no se borran.
-- Los locales reales aprobados conservan status = active y son los únicos elegibles.

update public.items
set status = 'hidden', updated_at = now()
where status = 'active'
  and image_path is null
  and id::text like '10000000-0000-4000-8000-%';
