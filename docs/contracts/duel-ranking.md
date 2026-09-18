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

## Solicitar duelo

La aplicación invoca `public.create_next_duel()`. PostgreSQL identifica a la persona desde
`auth.uid()`, selecciona dos ítems activos que esa persona no ha votado y crea un duelo abierto.

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
que el duelo pertenezca a esa identidad, que siga abierto y que el ganador sea uno de sus dos
ítems. Luego registra una vez el voto y actualiza los dos Elo con K=32 en la misma transacción.

## Ranking

El ranking es público y muestra únicamente ítems activos: posición, rating, duelos, victorias y
porcentaje de victorias. No expone identidades de votantes.
