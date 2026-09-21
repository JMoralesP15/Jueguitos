# Roadmap de producto

## Dirección vigente

El producto (repositorio interno `Community Manager`) es un juego público, mobile-first, de descubrimiento de nombres de locales.
Una persona entra mediante un enlace enviado al correo, elige entre dos nombres y ayuda a producir
un ranking. Jugar y aportar exigen cuenta; el ranking continúa visible públicamente.

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
- Cuenta de Supabase mediante Magic Link, sin contraseña.
- Función PostgreSQL atómica que registra el voto y actualiza Elo con K=32.
- Ranking público con rating, victorias, derrotas y número de duelos.
- Sin subida de contenido, comentarios, geolocalización automática ni matchmaking personalizado.

La prueba cerrada usa 20 locales de Santiago y una cohorte de 10 a 15 personas invitadas. Para el
piloto público siguen pendientes 100 a 300 locales, Turnstile y correo configurado.

## Principios de secuencia

1. Primero se valida que votar sea claro, entretenido y recurrente.
2. Luego se habilita que las personas aporten contenido y se curan fichas reales de locales.
3. El perfil y los favoritos de la prueba son privados; las funciones sociales públicas, SEO avanzado
   y monetización requieren validación y decisiones posteriores.

## MVP-004a — Aporte privado (completado)

- Área protegida para enviar nombre, categoría, ciudad y una foto propia.
- Categorías cerradas para mantener el catálogo consistente.
- Fotos privadas y aportes `pending` hasta una revisión humana.

## MVP-004b — Ubicación y moderación (completado)

- Dirección, geolocalización con consentimiento y ajuste manual del pin.
- Panel de administración para aprobar o descartar aportes pendientes.
- Al aprobar, la foto privada se copia al catálogo público y el local entra al juego.

Siguiente subhito: detección de duplicados, ficha pública de cada local y consultas “cerca de mí”.

## Iteración de feedback de experiencia

- Aclarar la propuesta del juego sin presentar `Community Manager` como nombre comercial.
- Mostrar la categoría real del local durante cada duelo.
- Dar una señal breve al votar y una celebración ligera al completar la ronda, sin puntaje personal.
- Permitir un nombre visible privado y guardar favoritos en la cuenta, protegidos por RLS.
- Dirección, web y redes sólo se agregan cuando la información real se haya curado; no mostrar
  ubicaciones ni enlaces inventados para los 20 registros sintéticos.

## Refuerzo previo a MVP-005

- Recuperación de contraseña por correo, sin revelar si una cuenta existe.
- Pendiente de operación: configurar SMTP y las URL de retorno de cada entorno para probar el
  envío real de enlaces.

## Prueba cerrada de Santiago

- Una ronda dura 30 minutos de inactividad: no repite locales dentro de la ronda y recupera un duelo
  abierto tras una recarga.
- Una cuenta no vuelve a votar la misma pareja y ve porcentajes históricos después de cada voto.
- La ubicación debe ser confirmada de forma explícita; no existe un pin por defecto.
- El enlace estable `workers.dev` se comparte sólo con 10 a 15 personas invitadas. No es un piloto
  público ni sustituye un dominio propio.
- Se medirán `duel_viewed`, `vote_cast` y `ranking_viewed`; la decisión posterior se basará en votos
  por visita, finalización de duelos y retorno.

## Criterio para pasar a piloto

- Catálogo curado inicial de 100 a 300 ítems con derecho de uso de sus imágenes.
- Instrumentación de `duel_viewed`, `vote_cast` y `ranking_viewed`.
- SMTP propio, Turnstile y límites de abuso activos antes de abrir el registro público.
- Prueba concentrada en una zona inicial, idealmente Santiago.
