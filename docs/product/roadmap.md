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
| MVP-003b: experiencia de juego | Pantalla de duelo rápida, siguiente duelo y ranking público | Pendiente |
| MVP-004: aportes | Foto, nombre, categoría, ciudad, duplicados y moderación mínima | Activa |
| Piloto | Dataset, medición, protección antiabuso y despliegue | Pendiente |

## MVP-003a — Alcance actual

- Entidad genérica `item`, iniciando con `business_name`.
- Duelos de exactamente dos ítems y una selección por duelo.
- Identidad anónima de Supabase para votar sin correo ni contraseña.
- Función PostgreSQL atómica que registra el voto y actualiza Elo con K=32.
- Ranking público con rating, victorias, derrotas y número de duelos.
- Sin subida de contenido, comentarios, geolocalización automática ni matchmaking personalizado.

Pendiente para cerrar este hito: cargar y moderar el catálogo inicial de 100 a 300 locales.
Turnstile es requisito antes de exponer el juego al público.

## Principios de secuencia

1. Primero se valida que votar sea entretenido y recurrente.
2. Luego se habilita que las personas aporten contenido.
3. Sólo después se agregan funciones sociales, SEO avanzado o monetización.

## MVP-004a — Aporte privado (completado)

- Área protegida para enviar nombre, categoría, ciudad y una foto propia.
- Categorías cerradas para mantener el catálogo consistente.
- Fotos privadas y aportes `pending` hasta una revisión humana.

Siguiente subhito: panel de moderación para detectar duplicados, aprobar un aporte y preparar su
imagen pública antes de incorporarlo al juego.

## Criterio para pasar a piloto

- Catálogo curado inicial de 100 a 300 ítems con derecho de uso de sus imágenes.
- Instrumentación de `duel_viewed`, `vote_cast` y `ranking_viewed`.
- Confirmación de correo, Turnstile y límites de abuso activos antes de abrir el registro público.
- Prueba concentrada en una zona inicial, idealmente Santiago.
