# Contrato: cola privada de investigación de locales

## Objetivo

Preparar un lote de hasta 50 bares, cafeterías, panaderías y barberías de Santiago antes de convertir cualquier ficha en un aporte del catálogo.

## Datos y privacidad

- Cada ficha conserva fuente del negocio y fuente de la dirección; web e Instagram guardan sus enlaces de origen cuando están disponibles.
- Las fichas viven en tablas privadas con acceso exclusivo de administración. No aparecen en duelos, ranking ni páginas públicas.
- El lote acepta como máximo 50 fichas activas. Nombre y comuna duplicados se rechazan dentro del mismo lote.
- Los enlaces de evidencia deben usar HTTPS. La investigación no descarga ni replica fotografías de Google Maps, Instagram u otras páginas.

## Paso a revisión

- Una ficha requiere fotografía legible del letrero del local y confirmación explícita de que la imagen es propia o está autorizada.
- La imagen entra al bucket privado `item-submissions`, bajo el límite existente de 5 MB y los tipos JPG, PNG o WebP.
- Al enviarse se crea un `items` con estado `pending` y se registra quién declaró tener autorización y cuándo.
- La publicación sigue exclusivamente el flujo vigente de revisión/aprobación administrativa; importar una ficha nunca la hace jugable.

## Límites de automatización

Esta primera versión provee la bandeja, validación, evidencia y transición al flujo de revisión. La recolección de datos de la web se hace mediante investigación supervisada y se importa como JSON; no se instala un raspador ni un proveedor/API de búsqueda de pago.
