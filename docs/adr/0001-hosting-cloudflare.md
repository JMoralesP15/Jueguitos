# ADR 0001 Hosting en Cloudflare Workers

## Estado

Aceptado con condición de compatibilidad

## Contexto

El MVP necesita una ruta de despliegue gratuita que no dependa de la licencia de Vercel Hobby para uso comercial. Next.js sigue siendo útil para App Router, páginas públicas y metadatos.

## Decisión

Mantener Next.js 16.3.5 como implementación de referencia y usar vinext para Cloudflare Workers. Cada pull request debe ejecutar el chequeo y la compilación de vinext.

Vinext permanece en beta. No se utilizarán APIs exclusivas de Vercel. Si aparece una incompatibilidad que no pueda resolverse dentro de un día, la capa web migrará a React y Vite sin cambiar `packages/domain`, Supabase ni los contratos.

OpenNext queda como alternativa para una brecha puntual, pero no se mantendrán dos adaptadores activos al mismo tiempo.

## Consecuencias

- Se conserva el desarrollo normal con `next dev` y `next build`.
- La ruta Cloudflare se verifica de forma separada.
- Las imágenes de usuario se sirven desde Storage y no dependen del optimizador pagado de Cloudflare Images.
- El despliegue productivo es manual y usa un entorno protegido de GitHub.
