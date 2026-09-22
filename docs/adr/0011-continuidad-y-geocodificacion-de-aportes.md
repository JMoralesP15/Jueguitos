# ADR-0011: continuidad del formulario y geocodificación explícita de aportes

## Decisión

El formulario de aportes conservará en el navegador los campos de texto, enlaces y coordenadas
mientras exista un error de validación o de red. La fotografía no se persiste por restricciones de
seguridad del navegador y deberá elegirse nuevamente si el envío falla.

La ubicación podrá buscarse con `comuna + calle + numeración` mediante una consulta explícita a
OpenStreetMap/Nominatim. El resultado se tratará como `location_source: "manual"`, se mostrará en
el mapa y exigirá una confirmación humana antes de enviar. No se incorpora un proveedor de mapas
de pago ni se modifica el esquema de datos.

La pantalla posterior al envío mostrará una confirmación celebratoria, el estado de revisión y
acciones para jugar o aportar otro local. El panel administrativo ofrecerá una aprobación masiva
protegida por rol `admin`, siempre con confirmación previa y manteniendo la publicación de fotos
como paso explícito.

## Motivo

La geocodificación reduce errores de ubicación sin eliminar la revisión humana. La persistencia
evita que un error de foto, enlace o duplicado obligue a repetir todo el aporte. El feedback visual
reconoce la colaboración sin convertir un aporte pendiente en una publicación automática.

## Límites

- Nominatim se consulta sólo al pulsar `Buscar dirección`, no como autocompletado.
- El punto puede corregirse en Leaflet y debe confirmarse explícitamente.
- La aprobación masiva no omite autenticación, autorización ni la copia desde el bucket privado.
