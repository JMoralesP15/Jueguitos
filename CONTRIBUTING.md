# Contribución

## Flujo de trabajo

1. Crear una rama corta desde `main`.
2. Mantener cada cambio concentrado en una sola decisión o capacidad.
3. Añadir pruebas para nuevas reglas de dominio.
4. Ejecutar `pnpm check` y `pnpm cf:check` antes de abrir un pull request.
5. Usar migraciones nuevas; no modificar una migración que ya haya sido aplicada fuera del entorno local.

## Reglas de seguridad

- No subir secretos ni archivos `.env`.
- No exponer `SUPABASE_SECRET_KEY` al navegador.
- Tratar Server Actions y Route Handlers como endpoints públicos.
- Validar todas las entradas en el servidor.
- Probar RLS con casos permitidos y denegados.
- Mantener los contratos de `packages/domain` independientes del framework web.

## Convenciones

- TypeScript estricto.
- Componentes de servidor por defecto.
- Componentes cliente sólo cuando necesiten estado, eventos o APIs del navegador.
- Importaciones directas en lugar de archivos barrel extensos.
- Decisiones que cambien hosting, autenticación, datos o seguridad requieren un ADR.
