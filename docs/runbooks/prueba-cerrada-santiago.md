# Prueba cerrada — Santiago

## Objetivo

Validar si las personas disfrutan votar nombres de locales. No mide aún la escala de aportes ni
autoriza un piloto público.

## Cohorte y alcance

- Invitar personalmente a 10–15 personas de Santiago.
- Cargar 20 locales reales de Santiago, con fotos propias o autorizadas, usando el flujo normal de
  aporte y aprobación.
- Una sola persona con rol `admin` revisa todos los aportes.
- No publicar el enlace en redes, buscadores, códigos QR abiertos ni comunidades públicas.

## Antes de invitar

1. Aplicar la migración `20260919000000_add_closed_test_rounds_and_metrics.sql` una sola vez al
   proyecto alojado de Supabase.
2. Aplicar `20260920000000_require_accounts_magic_link_and_results.sql` para activar Magic Link,
   la introducción por cuenta, parejas únicas y porcentajes.
3. Aplicar `20260921000000_refine_p0_rounds.sql` para activar progreso, estados distinguibles y
   rondas consecutivas. No aplicar la interfaz nueva antes de esta migración.
4. Aplicar `20260922000000_add_retention_event_tracking.sql` para registrar continuidad,
   favoritos, perfil y resultados de Magic Link sin almacenar datos personales.
5. Desplegar el Worker y anotar su URL HTTPS estable `workers.dev`. Configurar esa misma URL como
   `NEXT_PUBLIC_SITE_URL` en Cloudflare.
6. En Supabase Auth, configurar esa URL como **Site URL** y URL de retorno autorizada. Probar el
   Magic Link con el proveedor de correo incorporado antes de invitar.
7. Probar desde un teléfono: solicitar enlace, abrirlo, ver la introducción sólo una vez, recargar un
   duelo, completar una ronda, iniciar otra sin espera, comprobar que una pareja no se repite, aportar
   un local, confirmarlo en el mapa, aprobarlo como admin y comprobarlo en juego y ranking.
8. Confirmar que una pareja con menos de cinco votos no muestre porcentaje y que una con cinco o más
   sí lo muestre.
9. Confirmar que `/admin/metricas` muestra los conteos de duelo, voto y ranking, además del retorno
   en días distintos.

## Durante la prueba

- Compartir el enlace sólo por mensaje directo.
- No corregir el ranking manualmente ni modificar votos.
- Revisar aportes al menos una vez por día y aprobar sólo los que tengan foto y ubicación válidas.
- Para cargar locales reales de forma acumulativa, usar `/admin/locales`. Cada registro queda
  pendiente, la foto se guarda en el bucket privado y el lote se puede exportar desde **Exportar
  lote CSV**. Después, publicar desde `/admin/aportes` sólo los registros verificados.
- Registrar comentarios cualitativos: qué confundió, qué dio risa, si entendió que elegía nombres de
  locales y si volvería a jugar.

## Señales a revisar

| Señal | Meta inicial | Lectura |
| --- | ---: | --- |
| Votos por jugador | >= 5 | Indica interés por continuar la ronda. |
| Duelos que terminan en voto | >= 70% | Indica que las parejas son comprensibles y la interfaz responde. |
| Personas que vuelven en 7 días | >= 20% | Indica posibilidad de recurrencia. |
| Errores en aporte móvil | 0 bloqueantes | Define si el flujo de aporte puede seguir activo. |

## Cierre y siguiente decisión

Al completar una semana o alcanzar al menos 50 votos, guardar los conteos y comentarios en el
informe de avance. Si el juego no alcanza interés suficiente, no ampliar catálogo ni construir
MVP-005. Si alcanza las señales, preparar el piloto público: dominio propio, SMTP propio, Turnstile,
límites de abuso y 100–300 locales.
