# Roadmap de producto

## Dirección vigente

Community Manager es un juego público, mobile-first, de descubrimiento de nombres de locales.
Una persona entra, elige entre dos nombres y ayuda a producir un ranking. Votar no exige crear una
cuenta; aportar un descubrimiento sí.

## Estado de fases

| Fase | Objetivo | Estado |
| --- | --- | --- |
| Fundación | Repositorio, contratos, Supabase, sesión y controles básicos | Completada |
| MVP-003a: motor del juego | Ítems, duelo anónimo, voto atómico, Elo y ranking | Base técnica completada |
| MVP-003b: experiencia de juego | Rondas sin repetición inmediata, recarga segura y ranking público | Activa: prueba cerrada |
| MVP-004: aportes | Foto, nombre, categoría, ciudad, duplicados y moderación mínima | Activa |
| Piloto | Dataset, medición, protección antiabuso y despliegue | Pendiente |

## MVP-003a — Alcance actual

- Entidad genérica `item`, iniciando con `business_name`.
- Duelos de exactamente dos ítems y una selección por duelo.
- Identidad anónima de Supabase para votar sin correo ni contraseña.
- Función PostgreSQL atómica que registra el voto y actualiza Elo con K=32.
- Ranking público con rating, victorias, derrotas y número de duelos.
- Sin subida de contenido, comentarios, geolocalización automática ni matchmaking personalizado.

La prueba cerrada usa 20 locales de Santiago y una cohorte de 10 a 15 personas invitadas. Para el
piloto público siguen pendientes 100 a 300 locales, Turnstile y correo configurado.

## Principios de secuencia

1. Primero se valida que votar sea entretenido y recurrente.
2. Luego se habilita que las personas aporten contenido.
3. Sólo después se agregan funciones sociales, SEO avanzado o monetización.

## MVP-004a — Aporte privado (completado)

- Área protegida para enviar nombre, categoría, ciudad y una foto propia.
- Categorías cerradas para mantener el catálogo consistente.
- Fotos privadas y aportes `pending` hasta una revisión humana.

## MVP-004b — Ubicación y moderación (completado)

- Dirección, geolocalización con consentimiento y ajuste manual del pin.
- Panel de administración para aprobar o descartar aportes pendientes.
- Al aprobar, la foto privada se copia al catálogo público y el local entra al juego.

Siguiente subhito: detección de duplicados, ficha pública de cada local y consultas “cerca de mí”.

## Refuerzo previo a MVP-005

- Recuperación de contraseña por correo, sin revelar si una cuenta existe.
- Pendiente de operación: configurar SMTP y las URL de retorno de cada entorno para probar el
  envío real de enlaces.

## Prueba cerrada de Santiago

- Una ronda dura 30 minutos de inactividad: no repite locales dentro de la ronda y recupera un duelo
  abierto tras una recarga.
- La ubicación debe ser confirmada de forma explícita; no existe un pin por defecto.
- El enlace estable `workers.dev` se comparte sólo con 10 a 15 personas invitadas. No es un piloto
  público ni sustituye un dominio propio.
- Se medirán `duel_viewed`, `vote_cast` y `ranking_viewed`; la decisión posterior se basará en votos
  por visita, finalización de duelos y retorno.

## Criterio para pasar a piloto

- Catálogo curado inicial de 100 a 300 ítems con derecho de uso de sus imágenes.
- Instrumentación de `duel_viewed`, `vote_cast` y `ranking_viewed`.
- Confirmación de correo, Turnstile y límites de abuso activos antes de abrir el registro público.
- Prueba concentrada en una zona inicial, idealmente Santiago.
