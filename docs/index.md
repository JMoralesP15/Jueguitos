# Community Manager

Este es el mapa de trabajo del MVP. La documentación vive junto al código y GitHub conserva su historial.

## Punto de partida

- [Visión general del repositorio](../README.md)
- [Prompt técnico ejecutivo](prompts/technical-executive.md)
- [Contratos de autenticación](auth-contracts.md)
- [Configuración de GitHub y producción](github-environment.md)

## Arquitectura

- [Decisión: alojamiento en Cloudflare](adr/0001-hosting-cloudflare.md)
- [Decisión reemplazada: correo, contraseña y nombre de usuario](adr/0002-auth-email-password.md)
- [Decisión: monolito modular y Supabase](adr/0003-monolith-supabase.md)
- [Decisión: motor público de duelos](adr/0004-motor-publico-de-duelos.md)
- [Decisión: aportes privados de locales](adr/0005-aportes-privados-de-locales.md)
- [Decisión: ubicación y moderación](adr/0006-ubicacion-y-moderacion-de-locales.md)
- [Decisión: prueba cerrada, rondas y medición](adr/0007-prueba-cerrada-rondas-y-medicion.md)
- [Decisión: acceso por enlace y resultado de duelo](adr/0008-acceso-por-enlace-y-resultado-de-duelo.md)
- [Decisión: el juego clasifica locales, no personas](adr/0009-ranking-de-locales-y-continuidad-de-rondas.md)
- [Notas de arquitectura](architecture/README.md)

## Producto y contratos

- [Catálogo ficticio para pruebas](runbooks/catalogo-ficticio.md)

- [Producto y roadmap](product/README.md)
- [Roadmap operativo](product/roadmap.md)
- [Informe de avance técnico — 19 de septiembre de 2026](product/informe-avance-mvp-2026-09-19.md)
- [MVP-001: identidad y sesión](product/0001-identidad-y-sesion.md)
- [MVP-002: comparaciones y voto único](product/0002-comparaciones-y-voto.md)
- [Contratos futuros](contracts/README.md)
- [Contrato del juego y ranking](contracts/duel-ranking.md)
- [Contrato de aporte de local](contracts/item-submissions.md)
- [Contrato de medición mínima](contracts/product-events.md)
- [Bandeja de ideas](inbox/README.md)

## Operación

- [Runbooks](runbooks/README.md)
- [Exposición de secretos](runbooks/secret-exposure.md)
- [Alertas de cuota](runbooks/quota-warning.md)
- [Operación de Supabase alojado](runbooks/supabase-remote.md)
- [SMTP gratuito con Resend](runbooks/smtp-resend.md)
- [Prueba cerrada de Santiago](runbooks/prueba-cerrada-santiago.md)

## Regla simple

Si una decisión modifica el producto, la seguridad, los costos o la arquitectura, se documenta aquí antes de implementarla.
