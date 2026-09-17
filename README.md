# Community Manager

Base técnica para una plataforma comunitaria de comparaciones entre pares. Esta fase contiene las decisiones de arquitectura, el monorepo, la integración inicial con Supabase, la ruta de despliegue en Cloudflare y la automatización de GitHub.

## Decisiones actuales

- Next.js 16 con App Router y TypeScript estricto.
- Supabase para PostgreSQL, Auth, Storage y Row Level Security.
- Registro temporal mediante correo, nombre de usuario público y contraseña.
- Cloudflare Workers mediante vinext, sujeto al chequeo de compatibilidad por tratarse de una integración beta.
- pnpm workspaces, GitHub Actions y Dependabot.
- Sin dependencia de servicios exclusivos de Vercel.

## Requisitos

- Node.js 22.
- pnpm 11.19.0.
- Docker Desktop para Supabase local.

## Inicio local

```bash
pnpm install
copy .env.example .env.local
pnpm supabase:start
pnpm dev
```

La aplicación queda disponible en `http://localhost:3000`. El endpoint de salud está en `http://localhost:3000/api/health`.

## Verificaciones

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm cf:check
pnpm cf:dry-run
```

## Cloudflare

Cloudflare recomienda vinext para proyectos nuevos de Next.js en Workers. La integración permanece en beta, por lo que cada cambio debe pasar `pnpm cf:check` y `pnpm cf:dry-run` antes de fusionarse. La simulación compila el proyecto y valida el paquete final con Wrangler sin publicarlo.

El despliegue requiere `CLOUDFLARE_ACCOUNT_ID` y `CLOUDFLARE_API_TOKEN`. No se ejecuta automáticamente desde ramas o pull requests sin un entorno de GitHub aprobado.

## Autenticación temporal

Supabase autentica contraseñas asociadas a correo o teléfono, no a un alias arbitrario. El MVP utilizará:

- correo privado para iniciar sesión y recuperar acceso;
- contraseña administrada por Supabase Auth;
- nombre de usuario único almacenado en `profiles` y mostrado públicamente.

No se almacenan hashes de contraseña en tablas propias.

## Documentación

- `docs/adr` contiene decisiones de arquitectura.
- `docs/auth-contracts.md` define registro, inicio de sesión, sesión y autorización.
- `docs/runbooks` contiene procedimientos operativos.
- `docs/github-environment.md` explica cómo crear el repositorio y el entorno protegido de producción.
- `supabase` contendrá configuración, migraciones, datos semilla y pruebas SQL.
