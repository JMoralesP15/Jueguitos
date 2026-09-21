# ADR 0008: acceso por enlace y resultado visible del duelo

## Estado

Aceptado

## Contexto

La definición inicial permitía votar con una identidad anónima y separaba el registro con correo y
contraseña para quienes aportaran contenido. Para la prueba cerrada se decidió priorizar un registro
confiable de retorno por persona: todas las personas que votan deben identificarse, sin obligarlas a
crear ni recordar una contraseña.

También se decidió dar una respuesta inmediata después de cada voto. El rating Elo sigue siendo útil
para ordenar el ranking, pero sus variaciones no son suficientemente claras como recompensa principal
del juego.

## Decisión

- Para jugar y aportar se exige una cuenta de Supabase autenticada mediante un enlace de un solo uso
  enviado al correo. La sesión persistente evita repetir el acceso en cada visita.
- Una cuenta creada desde el enlace recibe un alias técnico único; elegir un nombre público puede
  incorporarse después sin bloquear la prueba.
- La explicación del juego se muestra una sola vez por cuenta y se guarda en `profiles`.
- Una persona sólo puede resolver una vez la misma pareja de locales, aunque cambie el orden. Las
  rondas de 30 minutos siguen evitando que un local se repita dentro de una sesión.
- Después de votar se muestran los conteos históricos y un botón explícito para pasar al siguiente
  duelo. El porcentaje aparece desde cinco votos para evitar presentar una muestra mínima como señal
  estable.
- Las tarjetas del juego muestran únicamente foto, nombre y comuna. Elo permanece como detalle del
  ranking y como implementación interna.
- El ranking sigue siendo legible sin iniciar sesión, pero la medición de visitas sólo se registra
  cuando existe una cuenta autenticada.

## Decisiones reemplazadas

- Reemplaza correo + contraseña de ADR 0002 para el flujo principal de acceso.
- Reemplaza el voto anónimo de ADR 0004 y de la dirección vigente del roadmap.
- Reemplaza la excepción sin correo de ADR 0007: la cohorte seguirá cerrada, pero necesita entrega de
  enlaces de acceso por correo. Turnstile continúa pendiente hasta el piloto público.

## Consecuencias

- Supabase debe tener configuradas la URL del Worker y las URL de retorno autorizadas.
- El proveedor de correo incorporado de Supabase puede usarse en la cohorte pequeña; antes del piloto
  público se deberá configurar SMTP propio y revisar límites de envío.
- No se guardan correos en `product_events`; la asociación sigue siendo un UUID técnico.
- Al agotarse las parejas únicas de una cuenta, el juego informa que completó el catálogo disponible.
- ADR 0009 aclara que el puntaje pertenece a los locales y permite encadenar rondas sin espera.
