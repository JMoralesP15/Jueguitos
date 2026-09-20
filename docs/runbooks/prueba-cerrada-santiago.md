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
2. Desplegar el Worker y anotar su URL HTTPS estable `workers.dev`.
3. En Supabase Auth, configurar esa URL como **Site URL** y URL de retorno autorizada. Mantener la
   confirmación de correo desactivada para esta cohorte.
4. Probar desde un teléfono: abrir juego, recargar un duelo, emitir cinco votos, aportar un local,
   confirmarlo en el mapa, aprobarlo como admin y comprobarlo en juego y ranking.
5. Confirmar que `/admin/metricas` muestra los conteos de duelo, voto y ranking, además del retorno
   en días distintos.

## Durante la prueba

- Compartir el enlace sólo por mensaje directo.
- No corregir el ranking manualmente ni modificar votos.
- Revisar aportes al menos una vez por día y aprobar sólo los que tengan foto y ubicación válidas.
- Registrar comentarios cualitativos: qué confundió, qué dio risa, y si la persona volvería a jugar.

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
MVP-005. Si alcanza las señales, preparar el piloto público: dominio propio, SMTP, confirmación de
correo, Turnstile, límites de abuso y 100–300 locales.
