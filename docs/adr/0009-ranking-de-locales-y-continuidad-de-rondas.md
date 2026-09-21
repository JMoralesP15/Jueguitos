# ADR 0009: ranking de locales y continuidad inmediata de rondas

## Estado

Aceptado. La privacidad del perfil y los favoritos privados se amplían en ADR 0010.

## Contexto

Una revisión externa detectó que la frase "comparaciones entre pares" podía leerse como si las
personas compitieran entre sí. Sin embargo, ADR 0004, MVP-002 y el modelo implementado asignan el
resultado a los locales. También se propuso premiar a la persona con Elo, deltas o una coincidencia
acumulada con la mayoría.

Con una cohorte inicial de 10 a 15 personas y 190 parejas posibles para 20 locales, la mayoría de las
parejas tendrá pocos votos. Una coincidencia acumulada mezclaría muestras desiguales y comunicaría
una precisión que el P0 no posee. Por otra parte, la regla de pareja única ya impide que una cuenta
repita comparaciones entre rondas, por lo que esperar 30 minutos después de completar 10 duelos no
protege la integridad del juego.

## Decisión

- Los sujetos clasificados son los locales. El rating Elo, victorias, derrotas y posición pertenecen
  a `items`; no se crea un puntaje de jugador.
- Foto, nombre, categoría y comuna describen el local. Durante el P0 la comuna usa el campo existente
  `items.city`, sin migración de tabla.
- Tras cada voto se muestran conteos. El porcentaje se revela sólo al alcanzar cinco votos para esa
  pareja y se presenta como tendencia actual.
- El cierre de ronda informa únicamente hechos verificables: cantidad de decisiones y actualización
  del ranking. No muestra coincidencia acumulada ni atribuye una variación específica a un voto.
- Al completar una ronda, la persona puede comenzar otra inmediatamente. Los 30 minutos se conservan
  sólo para cerrar por inactividad una ronda abandonada.
- La interfaz debe priorizar dos tarjetas tocables, progreso de ronda, confirmación clara de elección
  y un siguiente paso único, con diseño primero para celular.

## Consecuencias

- No se incorporan perfiles públicos, ligas ni competencia entre personas. ADR 0010 permite un
  nombre visible privado y una lista privada de favoritos, sin cambiar el sujeto del ranking.
- El motor necesita distinguir catálogo vacío, ronda completada y catálogo agotado, además de permitir
  cerrar explícitamente una ronda completada.
- El ranking ofrece una lectura simple de preferencia y deja Elo como detalle técnico secundario.
- Una mecánica social o viral futura deberá tener una decisión propia y no podrá convertir votos o
  correos privados en exposición pública de personas por defecto.
