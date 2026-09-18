# ADR-0006: ubicación verificable y moderación administrativa

## Decisión

Cada aporte incorpora dirección, latitud, longitud, precisión y origen del punto (`device` o
`manual`). La ubicación se recoge con consentimiento explícito, puede corregirse tocando un mapa
y sigue privada hasta aprobar el local.

Un único rol `admin` puede revisar los aportes pendientes. Al aprobar, el sistema copia la foto
desde el bucket privado `item-submissions` al bucket público `item-images`, y recién entonces el
ítem pasa a `active`.

## Motivo

La dirección permite visitar locales y abre una futura capa de descubrimiento cercano. Separar
fotos pendientes de las públicas evita exposición prematura. El rol se verifica con RLS y no se
puede autoasignar desde el navegador.

## Consecuencias

- Se guarda la ubicación del negocio, no un historial de ubicación de la persona.
- El mapa usa Leaflet y datos de OpenStreetMap con atribución para el piloto.
- Latitud/longitud permiten enlaces de navegación desde ya; PostGIS se activará antes de crear
  búsquedas complejas por radio o zonas.
- Patrocinios futuros deberán estar separados y etiquetados; no pueden influir el Elo.
