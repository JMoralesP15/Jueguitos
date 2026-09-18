# MVP-001 — Identidad y sesión

## Objetivo

Permitir que una persona cree una cuenta, inicie sesión, cierre sesión y mantenga un perfil público mínimo. Es el primer incremento que habilita voto, propiedad de contenido y reglas RLS posteriores.

## Estado

Validado el 18 de septiembre de 2026 contra el proyecto alojado de Supabase. Se comprobó
registro, creación automática de perfil, acceso, área protegida y cierre de sesión con una cuenta
de prueba. La confirmación de correo queda desactivada sólo durante el desarrollo privado, hasta
configurar SMTP externo.

## Alcance

- Pantallas `/registro`, `/ingresar` y `/cuenta`.
- Registro con correo, contraseña y nombre de usuario.
- Inicio y cierre de sesión mediante Supabase Auth.
- Creación automática de `profiles` desde el trigger ya definido.
- Protección de `/cuenta` y redirección si no hay sesión.
- Mensajes de validación claros sin revelar si un correo ya está registrado.

## Fuera de alcance

- Google OAuth, recuperación de contraseña y cambio de correo.
- Roles administrativos, perfiles editables, avatares y preferencias.
- Captcha/Turnstile: se incorpora antes de abrir el registro al público.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Colisión de nombre de usuario | Validación en cliente, contrato compartido y restricción única en PostgreSQL. |
| Enumeración de correos | Error de inicio de sesión deliberadamente genérico. |
| Confirmación de correo sin SMTP | Localmente se prueba sin confirmación; producción queda restringida hasta configurar correo o una cohorte cerrada. |
| Diferencias de vinext beta | Las rutas y acciones deben pasar `pnpm cf:check` y `pnpm cf:dry-run`. |

## Decisión técnica

Usar Server Actions de Next.js para registro, inicio y cierre de sesión. Cada acción validará con los esquemas del paquete `@mvp/domain` y usará el cliente SSR de Supabase. El navegador nunca recibe claves de servicio ni puede crear o modificar perfiles ajenos.

## Criterios de aceptación

1. Un registro válido crea cuenta y perfil con el mismo identificador de usuario.
2. Un nombre de usuario repetido o inválido no crea un perfil duplicado.
3. El inicio de sesión válido abre `/cuenta`; las credenciales inválidas muestran un mensaje genérico.
4. Un visitante sin sesión no puede abrir `/cuenta`.
5. Cerrar sesión invalida el acceso a `/cuenta`.
6. La interfaz funciona en local y el build del Worker completa sin incompatibilidades nuevas.

## Implementación

- `/registro` valida los tres datos del contrato y llama a `supabase.auth.signUp` desde el
  servidor. El alias llega como metadata; el trigger SQL crea el perfil.
- `/ingresar` usa correo y contraseña y conserva un mensaje genérico ante credenciales erróneas.
- `/cuenta` consulta la identidad validada por Supabase en cada carga. Sin sesión, redirige a
  `/ingresar?origen=cuenta`; no depende de que la interfaz oculte un enlace.
- El cierre de sesión elimina la sesión en Supabase y redirige al inicio.

## Plan de validación

1. Aplicar la migración contra Supabase local.
2. Probar registro, duplicado, ingreso, ruta protegida y salida con una cuenta de prueba.
3. Ejecutar `pnpm check`, `pnpm cf:check` y `pnpm cf:dry-run`.
4. Abrir una pull request y exigir el workflow `quality` antes de fusionar.

## Resultado de validación

| Comprobación | Resultado |
| --- | --- |
| Migración `profiles` aplicada en Supabase alojado | Correcta |
| Registro y trigger de perfil | Correctos |
| Ruta `/cuenta` sin sesión | Redirige a `/ingresar` |
| Cierre e inicio de sesión | Correctos |
| Build de Next.js y simulación del Worker | Correctos |

> La primera migración se aplicó desde SQL Editor. No se debe ejecutar `supabase db push` para
> esta migración sin reconciliar antes el historial de migraciones remoto.

## Siguiente decisión

Una vez aceptado MVP-001, el siguiente incremento será el modelo de una comparación: entidad, opciones, voto único y resultado agregado.
