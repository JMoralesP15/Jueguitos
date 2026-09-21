# Catálogo ficticio para pruebas

`supabase/seed.sql` contiene 20 locales sintéticos repartidos entre comunas de Santiago. Todos los
nombres terminan en `(demo)`, usan un gráfico propio que declara su carácter ficticio y tienen UUID
reservados con el prefijo `10000000-0000-4000-8000-`.

El set sirve para comprobar Magic Link, rondas de 10 duelos, resultados, ranking y métricas. No debe
usarse para una prueba de preferencia con participantes reales, porque no representa negocios ni
fotografías reales.

La carga es idempotente: puede ejecutarse más de una vez sin duplicar filas. Antes de incorporar el
catálogo real, retirar el set con:

```sql
delete from public.items
where id::text like '10000000-0000-4000-8000-%';
```

Si ya existen duelos asociados, PostgreSQL impedirá el borrado para conservar integridad. En ese
caso se deben ocultar primero con `status = 'hidden'` y conservarlos como historial técnico.
