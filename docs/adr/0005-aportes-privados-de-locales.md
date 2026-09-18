# ADR-0005: aportes privados antes de publicar locales

## Decisión

Los aportes de locales se crean desde un área protegida, con estado `pending` y una foto guardada
en el bucket privado `item-submissions`. Sólo una revisión posterior podrá convertir el aporte en
un ítem `active` del juego y asignarle una URL pública de imagen.

## Motivo

El juego necesita nombres reales, pero un aporte no verificado no debe aparecer de inmediato ni
dejar su fotografía disponible públicamente. Esto protege la calidad del catálogo y los derechos
sobre las imágenes durante el piloto.

## Consecuencias

- El formulario pide nombre, categoría, ciudad y una foto JPG, PNG o WebP de máximo 5 MB.
- Las categorías están controladas por el contrato y por la base de datos.
- La persona que aportó puede ver el estado, pero no la foto de otros aportes.
- La aprobación y publicación se implementarán como el siguiente subhito de MVP-004.
