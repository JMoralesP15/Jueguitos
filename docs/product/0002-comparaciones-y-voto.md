# MVP-002 — Comparaciones y voto único

## Objetivo

Permitir que una persona autenticada publique una comparación entre dos opciones y que cada
miembro vote una sola vez. El resultado debe poder agregarse sin exponer el voto individual.

## Alcance

- Comparación con título, descripción opcional y exactamente dos opciones.
- Estados `draft`, `published` y `closed`.
- Un voto irreversible por persona y comparación.
- Función PostgreSQL atómica para emitir el voto.
- RLS: el creador gestiona sus borradores; la comunidad lee sólo comparaciones publicadas.

## Fuera de alcance

- Editar o retirar un voto, comentarios, rankings, imágenes y moderación.
- Publicación, pantalla de voto, resultados y edición de borradores.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Dos votos de una misma persona | Clave primaria `(comparison_id, voter_id)` y función atómica. |
| Votar una opción de otra comparación | Verificación de pertenencia dentro de PostgreSQL. |
| Votos antes o después de la ventana válida | La función exige estado `published`. |
| Exponer preferencias individuales | No se habilita lectura pública de `votes`. |

## Decisión técnica

La fuente de verdad es PostgreSQL. El navegador no escribe directamente en `votes`: llama a
`public.cast_vote(comparison_id, option_id)`, que usa `auth.uid()` y rechaza duplicados. Los
contratos reutilizables se declaran en `@mvp/domain` antes de construir pantallas.

## Criterios de aceptación

1. Una comparación publicada tiene exactamente dos opciones ordenadas.
2. Un usuario puede votar una opción válida una sola vez.
3. Un voto duplicado, anónimo, fuera de estado publicado o con opción ajena falla.
4. La base permite resultados agregados sin revelar la identidad del votante.
5. Las reglas se validan con pruebas de dominio, migración SQL y build de Cloudflare.

## Estado

Contrato y migración aplicados en el proyecto remoto el 18 de septiembre de 2026. La primera
pantalla protegida de creación de borradores está en implementación; publicación y voto siguen
pendientes.
