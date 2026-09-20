# Contrato de medición mínima

## Principio de privacidad

Los eventos se asocian sólo al identificador de sesión anónima de Supabase. No incluyen correo,
nombre de usuario, dirección, coordenadas ni el texto de una foto.

## Eventos

| Evento | Momento | Datos asociados |
| --- | --- | --- |
| `duel_viewed` | Se crea un duelo nuevo para una ronda. | Identidad anónima y duelo. |
| `vote_cast` | Se resuelve correctamente un duelo. | Identidad anónima y duelo. |
| `ranking_viewed` | Se abre el ranking público. | Identidad anónima. |

Los eventos de duelo y voto se generan dentro de PostgreSQL junto a la operación que representan;
por tanto, un voto fallido no cuenta como voto. El ranking crea una identidad anónima si el visitante
no tenía una, únicamente para registrar la vista.

## Lectura

Sólo el rol `admin` puede leer los eventos agregados de la prueba. Los visitantes no pueden leer los
eventos ni los votos individuales de otras personas.
