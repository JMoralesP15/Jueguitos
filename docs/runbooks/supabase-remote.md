# Operación de Supabase alojado

## Estado actual

- Proyecto remoto: Community Manager, plan Free.
- La aplicación local usa variables públicas en `apps/web/.env.local`, archivo ignorado por Git.
- La migración inicial `20260917000000_create_profiles.sql` se aplicó manualmente desde SQL Editor.
- `20260918000000_create_comparisons_and_votes.sql` se aplicó manualmente el 18 de septiembre de
  2026 y Supabase confirmó `Success. No rows returned`.
- `20260918010000_create_duel_engine.sql` se aplicó manualmente el 18 de septiembre de 2026 y
  Supabase confirmó `Success. No rows returned`. Crea el motor público de nombres: `items`,
  `duels`, `duel_votes`, ranking y las operaciones atómicas de voto.
- `20260918020000_add_item_submissions.sql` se aplicó manualmente el 18 de septiembre de 2026 y
  Supabase confirmó `Success. No rows returned`. Crea el bucket privado `item-submissions` y las
  reglas para aportes protegidos de locales.
- `20260918030000_add_locations_and_admin_review.sql` se aplicó manualmente el 18 de septiembre de
  2026 y Supabase confirmó `Success. No rows returned`. Incorpora ubicación, el rol administrativo,
  el bucket público de imágenes aprobadas y las políticas de revisión de MVP-004b.
- `20260919000000_add_closed_test_rounds_and_metrics.sql` se aplicó manualmente el 20 de septiembre
  de 2026 y Supabase confirmó `Success. No rows returned`. La verificación posterior confirmó las
  tablas `game_sessions`, `product_events` y la función `record_ranking_view`.
- `20260920000000_require_accounts_magic_link_and_results.sql` se aplicó manualmente el 20 de
  septiembre de 2026. Se verificaron `profiles.onboarding_completed`, el índice de parejas y la
  salida de porcentajes de `cast_duel_vote`.
- `20260921000000_refine_p0_rounds.sql` se validó primero dentro de una transacción reversible y se
  aplicó manualmente el 21 de septiembre de 2026. Supabase confirmó `Success. No rows returned`.
  Incorpora progreso, errores distinguibles, resumen factual y rondas consecutivas.
- El acceso vigente usa Magic Link. La URL HTTPS del Worker está configurada como Site URL y como
  redirección autorizada; localhost permanece permitido para desarrollo.
- La plantilla remota **Magic link or OTP** debe coincidir con `docs/auth-contracts.md`: el enlace
  lleva `token_hash` al callback del Worker y una confirmación explícita completa la sesión. Si se
  restaura `{{ .ConfirmationURL }}` como único enlace, se reintroduce la dependencia de PKCE entre
  el navegador que pide el correo y el navegador que lo abre.
- `apps/web/wrangler.jsonc` conserva con `keep_vars` las variables administradas desde Cloudflare.
  Sin esta opción, un despliegue de Wrangler elimina las variables del panel y el sitio responde 500.
- Las credenciales públicas de Supabase se leen una sola vez en el servidor y se entregan a los dos
  componentes interactivos que las necesitan. Por eso basta mantenerlas como variables de ejecución
  del Worker; no es necesario duplicarlas como variables de compilación de Cloudflare.
- `20260921010000_stabilize_ranking_positions.sql` se aplicó manualmente el 21 de septiembre de
  2026. El ranking ahora usa posiciones únicas y estables incluso cuando todos los locales tienen el
  mismo Elo y la misma cantidad de duelos.
- La aplicación ya no inicia sesiones anónimas. El proveedor anónimo puede desactivarse manualmente
  en Supabase una vez terminada la comprobación de cuentas existentes.

## Regla de migraciones

No ejecutar `supabase db push` sobre la migración inicial hasta vincular la CLI y reconciliar el
historial remoto. Para cambios posteriores, usar una migración SQL nueva y aplicarla una sola vez:
desde SQL Editor **o** con la CLI, nunca ambas vías. La migración del 21 de septiembre usa reemplazo
idempotente para las funciones auxiliares, pero eso no sustituye reconciliar
`supabase_migrations` antes de vincular la CLI.

## Antes de un piloto público

1. Configurar SMTP externo y una dirección emisora de un dominio verificado.
2. Revisar plantillas, límites de Magic Link y entregabilidad.
3. Configurar el dominio HTTPS final como Site URL y redirect URL.
4. Activar Turnstile para el acceso público y revisar límites de cuota.
5. En **Authentication → URL Configuration**, registrar la URL de producción y las URLs de
   prueba autorizadas para recuperación de contraseña. Los Quick Tunnels cambian en cada sesión;
   se agregan sólo para probar y se eliminan después.
