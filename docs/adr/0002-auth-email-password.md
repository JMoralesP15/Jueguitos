# ADR 0002 Autenticación con correo nombre de usuario y contraseña

## Estado

Reemplazado por ADR 0008 para el flujo principal

## Contexto

La primera versión no necesita Google OAuth. Supabase Auth admite contraseña asociada a correo o teléfono, pero no autentica de forma nativa con un alias arbitrario.

## Decisión

Usar correo y contraseña para registro e inicio de sesión. Al registrarse, la persona elige además un nombre de usuario público único en `profiles`.

El correo permanece privado dentro de Supabase Auth. La aplicación no almacena contraseñas ni hashes en tablas propias. La recuperación usa correo cuando se configure un proveedor SMTP apropiado.

## Reglas

- Contraseña mínima de 10 caracteres.
- Nombre de usuario de 3 a 24 caracteres.
- Sólo letras minúsculas, números y guion bajo.
- El nombre se normaliza a minúsculas y es único sin distinguir mayúsculas.
- Los mensajes de inicio de sesión no deben confirmar si existe una cuenta.
- Turnstile se añadirá antes del piloto público.

## Consecuencias

- Para desarrollo local se puede desactivar confirmación de correo.
- En producción la confirmación requiere SMTP externo o se mantiene cerrada a una cohorte controlada.
- Google OAuth puede añadirse después enlazando la identidad existente.
