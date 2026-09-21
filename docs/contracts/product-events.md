# Contrato de medición mínima

## Principio de privacidad

Los eventos se asocian sólo al identificador UUID de la cuenta autenticada en Supabase. No incluyen correo,
nombre de usuario, dirección, coordenadas ni el texto de una foto.

## Eventos

| Evento | Momento | Datos asociados |
| --- | --- | --- |
| `duel_viewed` | Se crea un duelo nuevo para una ronda. | UUID técnico y duelo. |
| `vote_cast` | Se resuelve correctamente un duelo. | UUID técnico y duelo. |
| `ranking_viewed` | Una cuenta autenticada abre el ranking. | UUID técnico. |

Los eventos de duelo y voto se generan dentro de PostgreSQL junto a la operación que representan;
por tanto, un voto fallido no cuenta como voto. Una visita pública sin sesión al ranking no crea una
cuenta ni registra un evento.

Las rondas adicionales se observan como señal exploratoria a partir de `game_sessions`: se resta la
primera ronda de cada cuenta al total de rondas creadas. No se incorpora un evento nuevo ni una meta
hasta contar con evidencia de la prueba cerrada.

## Lectura

Sólo el rol `admin` puede leer los eventos agregados de la prueba. Los visitantes no pueden leer los
eventos ni los votos individuales de otras personas.
