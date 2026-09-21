# Contratos de autenticación del MVP

> ADR 0008 reemplaza el flujo original de correo y contraseña.

## Acceso por enlace

Entrada:

- `email`: correo válido y privado.
- `next`: ruta interna permitida; por defecto `/jugar`.

Supabase envía un Magic Link y crea la cuenta en la primera visita. Un trigger genera un alias
técnico único sin exponer el correo. La misma pantalla sirve para crear y recuperar una cuenta.

## Sesión y autorización

- Las cookies de sesión se actualizan en `proxy.ts`.
- Las operaciones de servidor resuelven la identidad con Supabase Auth.
- Jugar y aportar requieren sesión; el ranking continúa siendo legible públicamente.
- Las tablas de negocio usan RLS y nunca confían en un `user_id` enviado por el navegador.
- `profiles` es legible públicamente, pero cada persona sólo puede modificar su propia fila.
- La explicación inicial se marca una vez por cuenta mediante `profiles.onboarding_completed`.

## Callback y redirecciones

La aplicación incluye `GET /auth/confirm`, que acepta el `code` o `token_hash` de Supabase, crea la
cookie de sesión y redirige únicamente a una ruta interna segura.

La plantilla **Magic Link** debe respetar la dirección enviada por la aplicación:

```html
{{ .RedirectTo }}
```

Durante desarrollo se autoriza `http://localhost:3000/auth/confirm`. Para la prueba se añade la URL
HTTPS exacta del Worker sin retirar localhost.

## Operación de correo

El proveedor incorporado de Supabase basta para la cohorte cerrada de 10 a 15 personas. Antes del
piloto público se configura SMTP propio, se revisan límites de envío y se activa Turnstile.

## Evolución futura

El alias técnico puede reemplazarse por un nombre público elegido durante una edición de perfil.
Google OAuth puede añadirse después enlazando la identidad existente.
