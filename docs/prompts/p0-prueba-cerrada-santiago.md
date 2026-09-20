# Prompt técnico ejecutivo — P0: prueba cerrada en Santiago

Actúa como responsable técnico ejecutivo de Community Manager. Ejecuta el incremento más pequeño
que permita validar si el juego de nombres de locales resulta entretenido en una cohorte cerrada de
10 a 15 personas de Santiago.

## Decisiones ya tomadas

- No repetir un local dentro de una ronda de 30 minutos de inactividad; permitirlo en una visita
  posterior.
- Recuperar el mismo duelo si la persona recarga durante una ronda activa.
- Sugerir ubicación del dispositivo, pero exigir confirmación explícita o selección manual antes de
  enviar un aporte. Nunca enviar un punto inicial implícito.
- Usar 20 locales de Santiago, con fotos propias o autorizadas; una sola persona administra las
  revisiones.
- Usar una URL estable gratuita `workers.dev`, sólo por invitación y sin difusión pública.
- No activar confirmación de correo, SMTP propio ni Turnstile en esta cohorte. Activarlos antes del
  piloto público.
- Medir `duel_viewed`, `vote_cast` y `ranking_viewed` sin guardar datos personales en los eventos.

## Alcance técnico

1. Modelar la ronda en PostgreSQL, hacer atómica la recuperación del duelo abierto y vencer los
   duelos abandonados cuando termine la ronda.
2. Mantener la actualización Elo y la protección RLS existentes.
3. Actualizar el formulario de ubicación, contrato y validación de servidor para requerir
   confirmación explícita.
4. Registrar los tres eventos mínimos y exponer métricas agregadas sólo a administración.
5. Documentar migración, operación de la prueba y condiciones que bloquean el piloto público.

## Límites

- No añadir matchmaking, recomendaciones, SEO, pagos, IA, importadores masivos ni funcionalidades
  sociales.
- No desplegar ni modificar secretos, URL de Supabase, SMTP o configuración de Turnstile sin acceso
  explícito de la persona responsable.
- No usar fotos sin autorización ni publicar el enlace de la cohorte.

## Criterios de aceptación

1. Una recarga no consume un segundo duelo y no deja pares bloqueados.
2. Una ronda no repite locales y una nueva ronda puede reutilizarlos.
3. No se puede enviar un aporte sin confirmar el pin del mapa.
4. Un admin puede ver conteos agregados de vistas de duelos, votos y vistas de ranking.
5. Contratos, ADR, roadmap y runbook reflejan las decisiones.
6. Lint, tipos, pruebas, build y chequeos de Cloudflare se ejecutan antes de desplegar.

## Meta-análisis de alineación

Este incremento es coherente con ADR 0003 porque conserva PostgreSQL como fuente de verdad y las
reglas atómicas en la base. Es coherente con ADR 0004 porque sigue usando identidades anónimas, pero
limita su exposición a una cohorte controlada. Es coherente con ADR 0006 y el contrato de aportes al
guardar la ubicación del local con consentimiento explícito. No relaja los requisitos de piloto:
Turnstile, confirmación de correo, SMTP y un dominio propio continúan siendo puertas de salida para
la apertura pública.
