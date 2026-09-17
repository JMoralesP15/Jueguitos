# ADR 0003 Monolito modular con Supabase

## Estado

Aceptado

## Decisión

La aplicación se implementará como monolito modular. PostgreSQL es la fuente de verdad. Supabase aporta Auth, Storage y RLS. La lógica atómica del voto vivirá en funciones PostgreSQL y no en el navegador.

Los contratos reutilizables viven en `packages/domain`. La aplicación web puede cambiar de framework o hosting sin reescribir las reglas de identidad, duelos, votos y ratings.
