# GitHub y entorno de producción

El repositorio queda preparado para GitHub, pero no se crea ni publica automáticamente: primero hay que decidir la organización y el nombre del repositorio.

## Primera publicación

1. Crear un repositorio vacío en GitHub, sin README ni `.gitignore` adicionales.
2. Añadirlo como remoto `origin` y publicar la rama `main`.
3. En **Settings → Environments**, crear el entorno `production`.
4. Activar aprobación manual para `production` si la cuenta de GitHub lo permite.
5. En variables del entorno, añadir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. En secretos del entorno, añadir `CLOUDFLARE_ACCOUNT_ID` y un `CLOUDFLARE_API_TOKEN` limitado al Worker de este proyecto.
7. En **Settings → Branches**, proteger `main`: exigir pull request y el check `quality` antes de fusionar.

## Automatizaciones incluidas

- `ci.yml`: lint, tipos, pruebas, build de Next, chequeo vinext y simulación del Worker.
- `deploy-cloudflare.yml`: despliegue manual desde el entorno protegido `production`.
- Dependabot semanal para paquetes npm y GitHub Actions.
- Plantillas para pull requests, errores y propuestas.

El token de Cloudflare nunca debe guardarse en `.env`, código, commits ni variables públicas.
