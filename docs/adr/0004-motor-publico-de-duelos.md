# ADR 0004 Motor público de ítems y duelos

## Estado

Aceptado

## Contexto

El informe técnico define el producto inicial como un juego público de nombres de locales: un mismo
ítem participa en muchos duelos, acumula un rating Elo y aparece en rankings. El módulo
`comparisons` ya implementado modela encuestas A/B creadas por una persona; cada comparación
contiene sus dos propias opciones y no genera un ranking reutilizable de ítems.

## Decisión

El núcleo del MVP será `items` + `duels` + `duel_votes`.

- Un `item` representa un descubrimiento genérico y comienza como `business_name`.
- Un duelo enfrenta dos ítems activos y pertenece a quien lo recibe.
- Un voto resuelve una sola vez ese duelo y actualiza los ratings dentro de PostgreSQL.
- Las visitas usan Supabase Anonymous Sign-Ins; una cuenta permanente sólo será necesaria para
  subir descubrimientos en MVP-004.
- El módulo `comparisons` se conserva sin ampliarlo como posible producto futuro de testing A/B.

## Consecuencias

- Se evita convertir una encuesta aislada en un ranking incorrecto.
- La identidad anónima requiere CAPTCHA/Turnstile antes de abrir el juego públicamente y limpieza
  periódica de usuarios anónimos.
- Se requerirá un catálogo inicial suficiente para evitar duelos repetidos.
- Los datos y contratos de `comparisons` no se eliminan ni se reutilizan para los duelos.
