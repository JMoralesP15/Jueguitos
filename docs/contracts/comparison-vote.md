# Contrato de comparación y voto

## Crear comparación

```ts
{
  title: string; // 3–120 caracteres
  description?: string; // máximo 1.000 caracteres
  options: [string, string]; // cada opción: 2–80 caracteres
}
```

El creador se obtiene desde `auth.uid()`, nunca desde el navegador. Una comparación nace en
estado `draft`; sólo puede recibir votos cuando pasa a `published`.

## Emitir voto

```ts
{
  comparisonId: string; // UUID
  optionId: string; // UUID perteneciente a comparisonId
}
```

La aplicación invocará `public.cast_vote(comparisonId, optionId)`. La función devuelve el UUID de
la opción registrada o falla. No existe una operación de actualización ni eliminación de voto en
este MVP.

## Lectura de resultados

La interfaz consumirá agregados por opción. Las filas individuales de `votes` son privadas del
votante y no forman parte de un contrato público.
