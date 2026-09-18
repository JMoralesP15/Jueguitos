# Operación de Supabase alojado

## Estado actual

- Proyecto remoto: Community Manager, plan Free.
- La aplicación local usa variables públicas en `apps/web/.env.local`, archivo ignorado por Git.
- La migración inicial `20260917000000_create_profiles.sql` se aplicó manualmente desde SQL Editor.
- `20260918000000_create_comparisons_and_votes.sql` se aplicó manualmente el 18 de septiembre de
  2026 y Supabase confirmó `Success. No rows returned`.
- La confirmación de correo está desactivada de manera temporal para las pruebas privadas.

## Regla de migraciones

No ejecutar `supabase db push` sobre la migración inicial hasta vincular la CLI y reconciliar el
historial remoto. Para cambios posteriores, usar una migración SQL nueva y aplicarla una sola vez:
desde SQL Editor **o** con la CLI, nunca ambas vías.

## Antes de un piloto público

1. Configurar SMTP externo y una dirección emisora de un dominio verificado.
2. Activar confirmación de correo.
3. Configurar el dominio HTTPS final como Site URL y redirect URL.
4. Añadir Turnstile al registro y revisar límites de cuota.
