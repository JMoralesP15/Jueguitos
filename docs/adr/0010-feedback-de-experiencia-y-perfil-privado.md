# ADR 0010: claridad del juego, contexto y continuidad personal

## Estado

Aceptado para la siguiente iteración de la prueba cerrada. Amplía parcialmente ADR 0008 y ADR 0009.

## Contexto

El feedback de una persona señaló cuatro oportunidades: entender qué juego es, conocer mejor cada
local al votar, sentir una pequeña recompensa al avanzar y tener razones personales para volver.
También pidió dirección y enlaces externos, un perfil y favoritos. La imagen compartida de una llave
de eliminatorias se considera referencia para conversar, no una decisión de producto.

El nombre `Community Manager` describe el nombre técnico del proyecto, no el juego. El catálogo
actual de 20 registros está explícitamente marcado como sintético; no representa negocios reales ni
debe llevar direcciones o redes inventadas. `items.category` sí está disponible y es apto para dar
contexto inmediato. El esquema existente no tiene campos de web o redes sociales.

## Decisión

- La interfaz llamará provisionalmente a la experiencia **el juego de los locales** o **duelos de
  locales**. No se declara elegido el nombre comercial definitivo.
- Las tarjetas muestran categoría junto a nombre y comuna para que la persona entienda qué tipo de
  local está comparando. Dirección y enlaces sólo se mostrarán cuando exista información real
  revisada; la prueba sintética no generará ubicaciones ni redes ficticias.
- Cada voto recibe una señal visual breve y completar una ronda tiene una celebración ligera. No se
  inventan puntos del jugador, rachas ni una posición personal. Las animaciones respetan
  `prefers-reduced-motion`.
- La persona puede editar un nombre visible privado y guardar locales en una lista personal de
  favoritos. Favoritos y perfil no se exponen al ranking ni a otras cuentas. Se mantiene la sesión
  mediante Magic Link; no se pide contraseña.
- No se añade foto de perfil en esta iteración. Se puede decidir luego si un apodo basta o si se
  necesita avatar, después de probar la lista privada y el retorno.

## Consecuencias

- La interfaz y el contrato de duelos incorporan `category`, ya presente en el catálogo, sin tocar el
  modelo de los locales.
- `item_favorites` asocia la cuenta autenticada con locales activos y usa RLS para que sólo esa
  cuenta pueda consultar, guardar o quitar sus favoritos.
- `profiles` deja de ser legible públicamente; cada cuenta sólo puede consultar su propio perfil.
- Los aportes permiten registrar dirección, página e Instagram opcionales como enlaces HTTPS. Sólo
  se muestran después de la aprobación; no se generan enlaces a partir de registros ficticios.
- El ranking sigue siendo de locales. No hay liga, perfil público, puntaje de jugador ni cuadro de
  eliminatorias en esta iteración.
