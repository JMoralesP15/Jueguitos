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

La aplicación incluye `/auth/confirm`, que acepta el `token_hash` de un Magic Link (y el `code` de
los enlaces anteriores). La página no consume el enlace al abrirse: la sesión sólo se crea cuando
la persona pulsa **Entrar y continuar**. Esto evita que los escáneres automáticos de correo consuman
el enlace antes de que la persona lo use, y permite completar el acceso desde otro navegador.

La plantilla **Magic link or OTP** debe enviar el hash directamente al callback de la app y conservar
la ruta de retorno calculada por el formulario. El botón de correo debe usar:

```html
<a href="{{ .RedirectTo }}&amp;token_hash={{ .TokenHash }}&amp;type=magiclink">
  Entrar a Community Manager
</a>
```

El callback verifica el `token_hash` mediante `verifyOtp({ type: "magiclink" })` desde una Server
Action. No reemplazar el enlace con `{{ .RedirectTo }}` solo: ese valor es la dirección de retorno,
no contiene el token de acceso. Tampoco usar únicamente `{{ .ConfirmationURL }}` para este flujo SSR:
la ruta estándar de PKCE depende de una cookie temporal del navegador desde el que se pidió el enlace.

Durante desarrollo se autoriza `http://localhost:3000/auth/confirm`. Para la prueba se añade la URL
HTTPS exacta del Worker sin retirar localhost.

Las rutas históricas de contraseña (`/registro`, `/recuperar-contrasena` y
`/actualizar-contrasena`) permanecen temporalmente en el código para no mezclar su retiro con la
prueba P0, pero no forman parte de la navegación ni del flujo vigente. ADR 0008 es la fuente actual.

## Operación de correo

El proveedor incorporado de Supabase basta para la cohorte cerrada de 10 a 15 personas. Antes del
piloto público se configura SMTP propio, se revisan límites de envío y se activa Turnstile.

## Evolución futura

El alias técnico puede reemplazarse por un nombre público elegido durante una edición de perfil.
Google OAuth puede añadirse después enlazando la identidad existente.
