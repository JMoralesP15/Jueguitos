# Contratos de autenticación del MVP

## Registro

Entrada:

- `email`: correo válido y privado.
- `username`: alias público único, entre 3 y 24 caracteres, en minúsculas; admite letras, números y `_`.
- `password`: entre 10 y 128 caracteres.

Supabase Auth almacena y verifica la contraseña. El cliente envía `username` como metadata de registro y un trigger crea `public.profiles`. La base de datos vuelve a validar formato y unicidad.

## Inicio de sesión

Entrada: `email` y `password`. El nombre de usuario no se utiliza como credencial en esta fase para no construir un sistema propio de resolución de identidad ni exponer correos en tablas públicas.

## Sesión y autorización

- Las cookies de sesión se actualizan en `proxy.ts`.
- Las operaciones de servidor deben resolver la identidad con Supabase Auth.
- Las tablas de negocio usarán RLS; nunca se confiará en un `user_id` enviado por el navegador.
- `profiles` es legible públicamente, pero cada usuario sólo puede modificar su propia fila.

## Evolución futura

Google OAuth puede añadirse como otro proveedor de la misma cuenta. Antes de activarlo se debe definir cómo se asigna o solicita el `username` cuando el proveedor no lo entrega.

En el proyecto alojado de Supabase se debe activar la confirmación de correo antes de producción. Localmente queda desactivada para no bloquear el desarrollo con correo saliente.
