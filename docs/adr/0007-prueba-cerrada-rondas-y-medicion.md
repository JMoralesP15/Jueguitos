# ADR 0007: rondas de juego y medición para la prueba cerrada

## Estado

Aceptado, con acceso actualizado por ADR 0008

## Contexto

La primera validación responde una sola pregunta: si a personas de Santiago les entretiene votar
repetidamente entre nombres de locales. El diseño anterior impedía que una misma identidad volviera
a ver un ítem para siempre y creaba un duelo nuevo al recargar la pantalla. Con un catálogo de 20
ítems, eso agotaba el juego demasiado pronto y podía ocultar la señal de retención.

La prueba será cerrada, con 10 a 15 personas invitadas y sin difusión pública. No tendrá todavía
confirmación de correo, SMTP propio ni Turnstile. Esos controles siguen siendo requisitos previos al
piloto público; esta excepción no autoriza publicar el enlace ni recibir tráfico abierto.

## Decisión

- Una ronda abandonada dura hasta 30 minutos de inactividad de la cuenta autenticada de Supabase.
- Dentro de una ronda, un ítem no se repite. Si la persona recarga durante la ronda, recibe el mismo
  duelo abierto en lugar de consumir otro par.
- Al completar una ronda se puede iniciar otra de inmediato. Los ítems pueden volver a participar,
  pero una cuenta nunca vuelve a resolver la misma pareja. Esto permite continuar sin añadir
  matchmaking ni un catálogo grande antes de validar el juego.
- El mapa no enviará una ubicación inicial implícita. La persona puede sugerir su posición desde el
  dispositivo o elegir un punto manualmente, y debe confirmarlo antes de aportar.
- Se registrarán sólo eventos mínimos y pseudónimos: `duel_viewed`, `vote_cast` y
  `ranking_viewed`. No se guardan correos, nombres de usuario ni coordenadas dentro de esos eventos;
  sólo el identificador técnico de la sesión o cuenta que originó la acción.
- La prueba usará una URL estable `workers.dev` gratuita. Un dominio propio, SMTP, confirmación de
  correo y Turnstile quedan en la lista de salida hacia piloto público.

## Consecuencias

- El motor incorpora sesiones de juego y vence duelos abandonados al terminar la ronda.
- El panel administrativo puede consultar métricas agregadas de la prueba, sin exponer votos
  individuales ni identidades a visitantes.
- Veinte locales de Santiago con fotos propias o autorizadas bastan para la cohorte cerrada. Para el
  piloto público siguen siendo necesarios 100 a 300 locales, Turnstile y correo configurado.
