# Prompt técnico ejecutivo — P0: acceso y feedback del duelo

Actúa como responsable full-stack de Community Manager. Completa una prueba cerrada mobile-first en
Santiago que permita identificar a cada participante, observar su retorno y recompensar cada voto con
un resultado comprensible, manteniendo costo y complejidad operativa mínimos.

## Objetivo

Entregar una versión desplegable en Cloudflare Workers donde una persona invitada entra mediante un
enlace enviado al correo, ve una explicación sólo la primera vez, vota parejas de locales sin repetir
la misma pareja y recibe el porcentaje histórico del duelo antes de continuar.

## Alcance obligatorio

1. Exigir una sesión autenticada para jugar y aportar; usar Magic Link de Supabase, sin contraseña.
2. Mantener el ranking visible y la sesión persistente.
3. Mostrar la introducción una sola vez por cuenta.
4. Mostrar foto, nombre y comuna en cada tarjeta.
5. Evitar un segundo voto de la misma cuenta para la misma pareja, incluso en orden inverso.
6. Tras votar, mostrar porcentajes históricos entre ambos locales y un botón `Siguiente duelo`.
7. Mantener Elo atómico en PostgreSQL, RLS, rondas de 30 minutos y medición mínima pseudónima.
8. Reservar aprobación, eliminación y métricas para el único rol administrador.
9. Configurar Supabase y Cloudflare sólo con valores públicos mínimos y URLs HTTPS autorizadas.
10. Validar tipos, pruebas, lint, build de Next.js y paquete de Cloudflare antes de publicar.

## Fuera de alcance

No añadir pagos, anuncios, perfiles sociales, seguidores, comentarios, mensajería, recomendaciones,
IA, dominio propio ni difusión pública. Turnstile y SMTP propio siguen siendo puertas del piloto
público, no de esta cohorte cerrada.

## Criterios de aceptación

- Una persona sin sesión es enviada al acceso por correo antes de jugar.
- El enlace crea o recupera la cuenta y vuelve de forma segura a `/jugar`.
- La explicación no reaparece después de marcarla como vista.
- El voto y Elo se escriben en una sola transacción y devuelven porcentajes consistentes.
- La misma cuenta no puede recibir ni votar nuevamente la misma pareja.
- Recargar conserva el duelo abierto; avanzar requiere una acción explícita tras ver el resultado.
- Los eventos no contienen correo, nombre, ubicación ni texto de fotografías.
- La documentación y los contratos indican qué decisiones anteriores fueron reemplazadas.

## Meta-análisis de alineación

La propuesta conserva ADR 0001 (Cloudflare/vinext), ADR 0003 (Supabase como monolito de datos), ADR
0006 (ubicación confirmada) y el núcleo de ADR 0007 (rondas, recarga y medición). ADR 0008 declara de
forma explícita los únicos cambios incompatibles: reemplaza contraseña y voto anónimo por Magic Link
y cuenta obligatoria. Mantiene Elo como fuente del ranking, pero presenta porcentajes porque son más
comprensibles para validar entretenimiento. El alcance no adelanta monetización ni funciones sociales
y por tanto sigue la secuencia del roadmap.

