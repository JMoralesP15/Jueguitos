# Prompt técnico ejecutivo — P0 de aportes, ubicación y continuidad

## Instrucción ejecutada

Actúa como fullstack senior en Next.js App Router, React 19, TypeScript estricto, Supabase con
RLS y Cloudflare Workers mediante vinext. Mejora el flujo de aportes de locales sin romper los
contratos existentes ni publicar contenido sin revisión humana.

Implementa:

1. Búsqueda explícita de ubicación con comuna, calle y numeración; presenta el resultado en el
   mapa Leaflet, permite ajustar el pin y exige confirmación antes de enviar. Usa el proveedor
   gratuito OpenStreetMap/Nominatim sólo bajo acción del usuario y conserva `manual` como origen
   compatible con el contrato actual.
2. Persistencia local de los campos válidos del formulario ante errores de validación, red,
   duplicado o subida. La foto nunca se persiste; se vuelve a seleccionar por seguridad.
3. Confirmación visual de aporte recibido con estado de revisión, estímulo moderado y enlaces para
   jugar o aportar otro local. No debe prometer publicación automática.
4. Aprobación masiva opcional desde `/admin/aportes`, protegida por autenticación y rol `admin`,
   con confirmación del navegador y revalidación de catálogo, ranking y aportes.
5. Verificaciones de lint, typecheck, tests, build y dry-run de Cloudflare.

## Metaanálisis de alineación

- Se conserva el modelo `items`, el bucket privado `item-submissions`, el bucket público
  `item-images` y la regla de que sólo una revisión administrativa publica un local.
- La búsqueda de dirección no crea un nuevo origen de ubicación ni una dependencia de pago; se
  alinea con ADR-0006 y el contrato `item-submissions.md`.
- La persistencia queda en el navegador y no agrega datos personales a Supabase.
- La aprobación masiva sigue siendo una decisión humana explícita; no cambia el ranking ni el Elo.
- El alcance es P0 de experiencia y operación. No introduce perfiles públicos, recompensas
  monetarias, scraping de Google/Instagram ni funcionalidades fuera del producto definido.
