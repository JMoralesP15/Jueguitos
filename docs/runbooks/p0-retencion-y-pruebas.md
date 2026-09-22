# P0 — retención, acceso y prueba móvil

## Objetivo

Validar que una persona entiende el juego, completa una ronda y encuentra un motivo para volver.
La métrica principal es la proporción de personas que completan una ronda y vuelven a votar dentro
de siete días.

## Embudo instrumentado

La aplicación registra, sin correo ni nombre, estos eventos:

- `duel_viewed`
- `vote_cast`
- `introduction_completed`
- `round_completed`
- `next_round_started`
- `favorite_added` / `favorite_removed`
- `item_details_opened`
- `external_link_clicked`
- `profile_updated`
- `ranking_viewed`

El acceso registra únicamente el tipo de evento, el resultado y el código técnico del error:

- `magic_link_requested`
- `magic_link_sent`
- `magic_link_failed`
- `magic_link_confirmed`
- `magic_link_confirmation_failed`

## Checklist móvil

Probar en 360×800 y 390×844, con conexión normal y simulación de red lenta:

1. Solicitar un enlace y abrir el correo más reciente.
2. Confirmar el acceso y comprobar que el destino sea `/jugar`.
3. Ver la introducción sólo en la primera visita.
4. Completar tres duelos sin ayuda y confirmar el estado visual de selección.
5. Abrir una ficha con dirección o enlace aprobado.
6. Guardar y quitar un favorito.
7. Completar diez duelos y comenzar otra ronda.
8. Abrir el ranking y volver al juego.
9. Recargar durante un duelo y confirmar que no se pierde el duelo abierto.
10. Activar `prefers-reduced-motion` y comprobar que el juego sigue siendo claro.

## Prueba moderada con cinco personas

Usar las mismas cinco tareas y anotar sólo tiempos, bloqueos y comentarios:

1. “Explícame qué crees que es este sitio.”
2. “Juega tres duelos.”
3. “Dime qué local escogerías y por qué.”
4. “Guarda un local para volver a verlo.”
5. “Vuelve a entrar y encuentra tus favoritos.”

Señales iniciales: al menos 4 de 5 personas entienden el objetivo sin explicación, completan tres
duelos y pueden encontrar sus favoritos. Estos umbrales son heurísticos para la prueba cerrada, no
resultados estadísticamente concluyentes.

## Revisión semanal

En `/admin/metricas` revisar votos por jugador, finalización de duelo, retorno, rondas adicionales,
solicitudes fallidas de Magic Link y confirmaciones fallidas. Comparar cohortes por fecha, no sólo
conteos acumulados.
