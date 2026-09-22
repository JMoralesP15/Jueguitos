# Auditoría técnica y visual del frontend — 2026-09-22

## Alcance y objetivo

Revisión mobile-first del sitio publicado y del código de las rutas públicas y privadas: portada,
acceso, juego, ranking, cuenta, favoritos, aportes, comparaciones y paneles de administración. El
objetivo del jugador es entender en pocos segundos que compara nombres de locales de Santiago,
elegir una opción con confianza y querer seguir.

La revisión visual se hizo con capturas del sitio publicado en una ventana estrecha (aprox. 756 ×
684 px) para portada, acceso, ranking y carga de imágenes. La revisión de código cubrió estados,
copy, estilos globales, interacciones y navegación. El juego autenticado y las áreas privadas no
pudieron recorrerse en vivo porque la sesión del navegador de auditoría no está autenticada.

## Fortalezas

- La acción central es concreta: elegir entre dos locales y seguir al siguiente duelo.
- Las tarjetas reúnen nombre, rubro, comuna y, si están disponibles, dirección y enlaces reales.
- El acceso por enlace evita contraseñas; la sesión puede persistir entre visitas.
- El resultado da respuesta después del voto; los favoritos y el apodo se mantienen privados.
- Hay estados de carga, error, ronda terminada, lista vacía y movimiento reducido.
- La prueba actual tiene cuatro locales reales aprobados; el catálogo sintético está oculto.

## Riesgos de experiencia

1. **La portada no representa el producto que abre.** La primera captura es mayormente texto, y la
   sección de ejemplo usa dos nombres de demostración sin foto. El sitio publicado sí tiene fotos
   reales de los cuatro locales; al cargar el ranking, las primeras miniaturas aparecieron varios
   segundos después y antes se veían como bloques beige vacíos.
2. **La jerarquía de la portada es débil en móvil.** El titular ocupa gran parte de la primera
   pantalla y las tarjetas que hacen tangible el juego quedan más abajo. Hay poca variación visual
   entre la portada y las páginas informativas.
3. **El ranking puede sobreinterpretarse.** En la captura en vivo había locales con 100% y 0% tras
   un solo duelo; la cantidad de duelos quedaba escondida en “Ver detalle”. Es un dato correcto,
   pero sin el tamaño de muestra visible parece concluyente.
4. **El contexto del negocio se queda corto.** “Un local de {rubro}” repite el rubro y no cuenta qué
   ofrece. No existe un campo aprobado para descripción; inventarla desde el frontend sería
   engañoso.
5. **Las áreas de cuenta concentran muchas acciones con el mismo peso visual.** Perfil, favoritos,
   aportes, comparaciones, administración y salir aparecen juntos, por lo que cuesta reconocer el
   siguiente paso habitual.
6. **Hay estados secundarios con feedback incompleto.** Si guardar o quitar un favorito falla, la
   interfaz revierte el cambio sin explicar qué ocurrió. Los enlaces externos y controles pequeños
   deben conservar espacio suficiente en tarjetas móviles.

## Riesgos de accesibilidad y verificación

- Se encontraron foco visible, labels de formulario, estructura semántica, botones de al menos 44 px
  en acciones principales y soporte para `prefers-reduced-motion` en el juego.
- Las capturas no prueban navegación completa con teclado, lector de pantalla, zoom, contraste medido
  ni uso real en varios dispositivos. No se declara conformidad WCAG.
- No se pudo verificar en vivo el duelo autenticado, el estado posterior al voto, favoritos, perfil,
  formularios privados ni administración.

## Recomendaciones priorizadas

### P0 — Hacer reconocible la experiencia

- Usar fotos y fichas de los locales activos reales en la portada, en lugar de nombres de ejemplo.
- Dar a la portada una jerarquía compacta: qué se hace, una llamada principal y una vista previa
  real del duelo.
- Acelerar las primeras fotos del ranking y evitar que las posiciones parezcan definitivas cuando
  hay pocos duelos, mostrando el tamaño de muestra junto al porcentaje.
- Eliminar el texto genérico “Un local de...” de las tarjetas: mostrar sólo hechos del registro.

### P1 — Mejorar interacción y retorno

- Dar feedback explícito cuando una operación de favoritos falla y anunciar el estado guardado.
- Afinar espaciado y enlaces de ficha para pantallas estrechas y controles táctiles.
- Dar un orden visual claro a las acciones de cuenta: jugar y favoritos primero; las demás como
  acciones secundarias.
- Unificar color, superficies, foco y estados hover/pressed entre portada, ranking, juego y cuenta.

### Más adelante — requiere decisión de producto o datos

- Añadir una descripción factual del local exige una fuente confiable y una decisión de datos y
  moderación. No se debe inferir desde categoría ni rellenar con texto ficticio.
- Puntos personales, ligas, cuadro de eliminación, perfil público, fotos de perfil y compartir
  rankings siguen fuera de ADR 0009/0010; no se agregan como “recompensas” improvisadas.

## Cambios de esta pasada

Se ejecutan los P0 de presentación y los P1 que no requieren cambio de modelo: fichas reales en
portada, fotos prioritarias del ranking, tamaño de muestra visible, eliminación del copy redundante,
feedback de favoritos, jerarquía responsive y refinamiento del sistema visual. Los demás puntos
quedan como recomendaciones explícitas en esta auditoría.

## Referencias

- Capturas del sitio publicado inspeccionadas durante esta auditoría: portada, acceso por correo y
  ranking público. La sesión privada no estuvo disponible para captura autenticada.
- `docs/product/roadmap.md`, ADR 0008, ADR 0009 y ADR 0010.
