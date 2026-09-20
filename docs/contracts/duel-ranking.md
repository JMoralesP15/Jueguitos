# Contrato del motor de duelos y ranking

## Ítem

```ts
{
  id: string;
  type: "business_name";
  name: string;
  imageUrl: string;
  category: string;
  city: string;
  rating: number; // inicia en 1500
  duelCount: number;
  wins: number;
  losses: number;
}
```

## Ronda de juego

Una ronda pertenece a la identidad anónima o autenticada de Supabase y se mantiene activa mientras
la persona interactúe al menos una vez cada 30 minutos. Dentro de la ronda, cada ítem aparece como
máximo en un duelo. Una nueva ronda puede reutilizar ítems para que una visita posterior no agote el
catálogo.

## Solicitar duelo

La aplicación invoca `public.create_next_duel()`. PostgreSQL identifica a la persona desde
`auth.uid()`. Si ya existe un duelo abierto de su ronda activa, devuelve ese mismo duelo. En caso
contrario selecciona dos ítems activos que no han aparecido en la ronda y crea uno nuevo.

Salida:

```ts
{
  duelId: string;
  firstItem: Item;
  secondItem: Item;
}
```

## Votar

```ts
{
  duelId: string;
  winnerId: string;
}
```

La aplicación llama a `public.cast_duel_vote(duelId, winnerId)`. La función comprueba la identidad,
que el duelo pertenezca a una ronda vigente de esa identidad, que siga abierto y que el ganador sea
uno de sus dos ítems. Luego registra una vez el voto y actualiza los dos Elo con K=32 en la misma
transacción.

## Ranking

El ranking es público y muestra únicamente ítems activos: posición, rating, duelos, victorias y
porcentaje de victorias. No expone identidades de votantes.
