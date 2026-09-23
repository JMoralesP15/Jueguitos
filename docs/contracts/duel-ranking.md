# Contrato del motor de duelos y ranking

## Propiedad del puntaje

El juego compara **nombres de locales**. El rating Elo, las victorias, las derrotas y la posición del
ranking pertenecen al local (`items`), nunca a la persona que vota. La cuenta de la persona sólo
permite mantener la sesión, evitar votos repetidos y medir uso de forma pseudónima.

## Ítem público

```ts
{
  id: string;
  type: "business_name";
  name: string;
  imageUrl: string;
  category: string;
  city: string; // se presenta como comuna durante el P0 de Santiago
  rating: number; // inicia en 1500
}
```

Cada tarjeta del juego muestra una foto del letrero donde se lea el nombre, el nombre del local,
categoría y comuna. La foto debe permitir evaluar el nombre sin abrir enlaces externos. El campo
técnico sigue llamándose `city` para no cambiar el modelo de datos durante el P0. Las direcciones y
redes sólo se presentan cuando son datos reales revisados; no se fabrican para el catálogo de prueba.

## Ronda de juego

Una ronda pertenece a una cuenta autenticada. Contiene hasta 10 duelos y cada local aparece como
máximo una vez dentro de esa ronda. El tamaño real es el menor entre 10 y la mitad del catálogo
activo. La persona sólo puede resolver una vez la misma pareja en todo su historial.

Treinta minutos de inactividad cierran una ronda abandonada. Una ronda completada puede cerrarse de
inmediato para comenzar la siguiente; no existe una espera obligatoria de 30 minutos.

## Solicitar duelo

La aplicación invoca `public.create_next_duel()`. PostgreSQL identifica a la persona desde
`auth.uid()`. Si ya existe un duelo abierto de su ronda activa, devuelve ese mismo duelo. En caso
contrario selecciona dos locales activos que no han aparecido en la ronda y crea uno nuevo.

Salida real de Supabase:

```ts
{
  duel_id: string;
  first_item: Item;
  second_item: Item;
  round_position: number;
  round_size: number;
}
```

Estados controlados:

| Código | Significado | Respuesta de interfaz |
| --- | --- | --- |
| `P0002` | Hay menos de dos locales activos. | Catálogo en preparación. |
| `P0003` | La ronda llegó a su límite o no quedan locales sin repetir en ella. | Resumen y nueva ronda. |
| `P0004` | La cuenta ya resolvió todas las parejas únicas disponibles. | Catálogo completado. |

## Votar

```ts
{
  duelId: string;
  winnerId: string;
}
```

La aplicación llama a `public.cast_duel_vote(duelId, winnerId)`. La función comprueba identidad,
propiedad y vigencia del duelo, pertenencia del ganador y ausencia de un voto previo para esa pareja.
Luego registra el voto y actualiza el Elo de ambos locales con K=32 dentro de una sola transacción.

Salida real de Supabase:

```ts
{
  winner_rating: number;
  loser_rating: number;
  first_votes: number;
  second_votes: number;
  first_percentage: number;
  second_percentage: number;
}
```

La interfaz no presenta Elo como premio personal. Con menos de cinco votos históricos para la pareja,
muestra únicamente los conteos y explica que aún no hay muestra suficiente. Desde cinco votos muestra
el reparto porcentual como una tendencia descriptiva, no como una verdad estadística.

## Cerrar y resumir una ronda

- `public.get_current_round_summary()` devuelve sólo `votes_cast` y `round_size` de la ronda activa.
- `public.start_new_round()` cierra una ronda sin duelo abierto; el siguiente pedido crea otra.
- Si existe un duelo abierto, `start_new_round()` rechaza la operación con `P0005`.

El resumen es factual: informa cuántas decisiones tomó la persona y que sus votos actualizaron el
ranking. No calcula una supuesta coincidencia acumulada con la mayoría.

## Ranking

El ranking es público y muestra únicamente locales activos: posición, foto, nombre, comuna y
porcentaje de victorias. Elo y cantidad de duelos quedan disponibles como detalle secundario. No
expone identidades de votantes ni crea un ranking de personas.

Los favoritos son privados y no alteran el ranking. Consulta [ADR 0010](../adr/0010-feedback-de-experiencia-y-perfil-privado.md).
