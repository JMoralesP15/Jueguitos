# SMTP gratuito con Resend

## Decisión propuesta

Usar Resend como proveedor SMTP externo. Su plan Free ofrece 3.000 correos al mes, hasta 100 al
día y permite tres dominios verificados. Supabase acepta SMTP personalizado también en el plan
Free.

## Datos necesarios

- Un dominio que controles, por ejemplo `ejemplo.cl` o el subdominio `auth.ejemplo.cl`.
- Una cuenta de Resend y una API key SMTP creada por la persona propietaria de la cuenta.
- Acceso al DNS del dominio para añadir los registros de verificación.

## Configuración en Supabase

En **Authentication → Emails → Set up SMTP**:

| Campo | Valor |
| --- | --- |
| Host | `smtp.resend.com` |
| Puerto | `465` |
| Usuario | `resend` |
| Contraseña | API key de Resend, nunca en Git ni en el chat |
| Remitente | `Community Manager <no-reply@auth.tu-dominio>` |

Después se activa confirmación de correo y se actualiza la plantilla **Confirm signup** con el
enlace documentado en [contratos de autenticación](../auth-contracts.md).

## Seguridad

Desactivar el seguimiento de enlaces en el proveedor de correo para los mensajes de autenticación:
puede alterar el enlace de confirmación. Rotar la API key si se expone.
