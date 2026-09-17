# Community Manager

Este es el mapa de trabajo del MVP. La documentación vive junto al código y GitHub conserva su historial.

## Punto de partida

- [Visión general del repositorio](../README.md)
- [Prompt técnico ejecutivo](prompts/technical-executive.md)
- [Contratos de autenticación](auth-contracts.md)
- [Configuración de GitHub y producción](github-environment.md)

## Arquitectura

- [Decisión: alojamiento en Cloudflare](adr/0001-hosting-cloudflare.md)
- [Decisión: correo, contraseña y nombre de usuario](adr/0002-auth-email-password.md)
- [Decisión: monolito modular y Supabase](adr/0003-monolith-supabase.md)
- [Notas de arquitectura](architecture/README.md)

## Producto y contratos

- [Producto y roadmap](product/README.md)
- [MVP-001: identidad y sesión](product/0001-identidad-y-sesion.md)
- [Contratos futuros](contracts/README.md)
- [Bandeja de ideas](inbox/README.md)

## Operación

- [Runbooks](runbooks/README.md)
- [Exposición de secretos](runbooks/secret-exposure.md)
- [Alertas de cuota](runbooks/quota-warning.md)

## Regla simple

Si una decisión modifica el producto, la seguridad, los costos o la arquitectura, se documenta aquí antes de implementarla.
