# Informe de avance — Community Manager

**Fecha:** 19 de septiembre de 2026  
**Estado:** construcción funcional; pendiente de validación con usuarios reales.  
**Producto:** juego público, diseñado primero para móvil, donde las personas comparan nombres de locales. Los aportes y la moderación alimentan ese catálogo.

> Documento histórico cerrado el 19 de septiembre. Para el estado vigente de acceso y jugabilidad,
> prevalecen ADR 0008, ADR 0009 y el runbook de la prueba cerrada.

## Resumen ejecutivo

La base del MVP está construida: registro e ingreso por correo y contraseña, perfiles, área protegida, motor de duelos con ranking, aportes privados con foto y ubicación, panel administrativo y una interfaz móvil de tono juvenil. El repositorio, GitHub y Obsidian comparten los mismos archivos Markdown, de modo que no hay que importar documentos manualmente en cada sesión.

El producto **aún no está listo para un piloto público abierto**. Antes se deben validar el recorrido completo desde teléfono, el correo transaccional (confirmación y recuperación), la protección antiabuso con Turnstile y un catálogo inicial de locales aprobados.

Los porcentajes separan **entrega técnica** (existe y fue comprobada técnicamente) de **validación de producto** (usada con personas y datos reales). Así se evita confundir código terminado con producto validado.

## Avance por hito

| Hito | Entrega técnica | Validación | Estado y evidencia | Siguiente cierre |
| --- | ---: | ---: | --- | --- |
| Fundación, repo y documentación | 100% | 80% | Monorepo, GitHub, ADR, contratos y documentación en Markdown disponibles. | Mantener decisiones y métricas actualizadas. |
| MVP-001 — identidad y sesión | 95% | 70% | Registro, ingreso, salida, perfil y área `/cuenta`. | Probar correo real y recuperación con URL permitida. |
| MVP-002 — comparaciones privadas | 90% | 20% | Borradores, opciones y votos protegidos. | Decidir si pasa a módulo B2B posterior. |
| MVP-003a — motor público de duelos | 95% | 10% | Tablas, voto atómico, Elo, ranking, `/jugar` y `/ranking`. | Cargar 20 locales de prueba. |
| MVP-003b — experiencia de juego | 60% | 0% | Flujo visual base, sin catálogo real ni sesión observada. | Probar juego móvil con locales aprobados. |
| MVP-004a — aporte protegido | 95% | 40% | Formulario, foto privada, nombre, categoría y ciudad. | Completar prueba externa desde teléfono. |
| MVP-004b — ubicación y moderación | 90% | 20% | Dirección, GPS/mapa, almacenamiento separado y `/admin/aportes`. | Aprobar un aporte real y verlo jugable. |
| Interfaz móvil juvenil | 85% | 30% | Paleta naranja y flujo lúdico de tres pasos. | Revisar el comportamiento móvil que parece abrir otra pantalla. |
| Recuperación de contraseña | 90% | 0% | Solicitud de enlace y cambio de clave implementados. | SMTP + URLs autorizadas + prueba real. |
| Preparación de piloto público | 25% | 0% | Arquitectura y checklist definidos. | Turnstile, contenido, analítica y prueba cerrada. |

**Lectura global:** cerca de **81% de construcción técnica** y **27% de validación de producto**. No es un “81% de lanzamiento”: seguridad pública, correo, catálogo y evidencia con usuarios son determinantes.

## Arquitectura implementada

```text
Persona (móvil/web)
        │
Next.js 16 + React 19 (apps/web)
        ├── público: /jugar, /ranking
        └── protegido: /cuenta, /aportes, /admin/aportes
        │
Supabase ── Auth (correo/clave; anónimo sólo en pruebas)
        ├── Postgres + RLS
        ├── imágenes pendientes privadas: item-submissions
        └── imágenes aprobadas públicas: item-images
        │
packages/domain: reglas y contratos Zod
        │
Cloudflare/vinext para despliegue; Quick Tunnel sólo para pruebas temporales
```

- **Aplicación:** Next.js 16, React 19, TypeScript y pnpm en monorepo.
- **Datos y seguridad:** Supabase Auth, PostgreSQL y Row Level Security. El dueño accede a su aporte; la moderación se limita al rol administrativo.
- **Imágenes:** se suben como privadas y sólo pasan a un bucket público al ser aprobadas.
- **Ubicación:** permiso del navegador, selección manual en Leaflet/OpenStreetMap, dirección y ciudad.
- **Juego:** `items`, `duels` y `duel_votes`; rating Elo con operaciones atómicas.
- **Calidad:** contratos Zod, pruebas de dominio, chequeo de tipos y compilación superados durante los hitos.
- **Coste:** objetivo de USD 0 en etapa MVP, vigilando cuotas gratuitas de Supabase, Cloudflare y OpenStreetMap.

## Capacidades entregadas

| Área | Disponible hoy |
| --- | --- |
| Cuentas | Registro, ingreso, cierre de sesión, perfil y área protegida. |
| Juego público | Duelo de nombres, voto, Elo y ranking; requiere catálogo aprobado. |
| Aportes | Nombre, categoría controlada, ciudad, dirección, ubicación, foto y estado pendiente. |
| Moderación | Aprobar o descartar aportes; una aprobación habilita imagen pública y catálogo. |
| Recuperación | Solicitud de enlace y cambio de contraseña; falta validar su envío real. |

Categorías actuales: restaurante; cafetería y pastelería; bar, pub y cervecería; comida rápida; panadería; heladería; peluquería y barbería; belleza y bienestar; moda y accesorios; hogar y decoración; mascotas; salud y farmacia; deporte y aire libre; tecnología y reparación; librería y educación; servicios profesionales; turismo y entretención; otro.

## Seguridad y operación

| Control | Estado | Nota |
| --- | --- | --- |
| RLS por propietario | Implementado | Aísla aportes y perfiles por usuario. |
| Rol administrativo | Implementado | No se puede autoasignar desde la interfaz. |
| Separación de imágenes | Implementado | Pendientes privadas; aprobadas públicas. |
| Recuperación anti-enumeración | Implementado | No revela si un correo tiene cuenta. |
| Confirmación de correo | Temporalmente desactivada | Adecuada para pruebas privadas, no para abrir al público. |
| SMTP | En configuración, sin validación final | Falta comprobar una entrega real de la aplicación. |
| URLs de retorno | Pendiente operativo | Producción y pruebas temporales deben estar autorizadas en Auth. |
| Turnstile | Pendiente | Requisito antes de habilitar registro/voto anónimo públicos. |
| Catálogo y moderación real | Pendiente | El juego necesita suficientes locales aprobados. |

## Repositorio, GitHub y Obsidian

- **Repositorio remoto:** [JMoralesP15/Jueguitos](https://github.com/JMoralesP15/Jueguitos), rama `main`; el producto se llama Community Manager.
- **Historial reciente:** identidad, juego público, aportes, ubicación/moderación, interfaz y recuperación se registraron en commits independientes.
- **Secretos:** las variables locales de Supabase no se versionan ni deben copiarse a documentos, issues o commits.
- **Obsidian:** la raíz del repositorio es el vault. Todo archivo en `docs/` aparece automáticamente en Obsidian y se sincroniza con Git al hacer commit y push.
- **Flujo recomendado:** actualizar Markdown en `docs/` → revisar en Obsidian → confirmar en Git → subir a GitHub.

## Mapa de documentación

| Documento | Para qué sirve |
| --- | --- |
| [Índice documental](../index.md) | Entrada principal para Obsidian y repositorio. |
| [Roadmap](roadmap.md) | Prioridades, alcance y condiciones para piloto. |
| [MVP-001](0001-identidad-y-sesion.md) | Identidad y sesión. |
| [MVP-002](0002-comparaciones-y-voto.md) | Comparaciones y voto protegido. |
| [Contrato del juego](../contracts/duel-ranking.md) | Reglas de duelos, votos y ranking. |
| [Contrato de aportes](../contracts/item-submissions.md) | Estados y reglas para locales aportados. |
| [ADR 0004](../adr/0004-motor-publico-de-duelos.md) | Decisión del motor público de duelos. |
| [ADR 0005](../adr/0005-aportes-privados-de-locales.md) | Decisión de aportes privados. |
| [ADR 0006](../adr/0006-ubicacion-y-moderacion-de-locales.md) | Decisión de ubicación y moderación. |
| [Runbook de Supabase](../runbooks/supabase-remote.md) | Migraciones, operación y salida a piloto. |
| [Runbook SMTP](../runbooks/smtp-resend.md) | Correo transaccional y su verificación. |

## KPIs: línea base y metas de prueba

No existe todavía analítica pública. Por ello la línea base es **“sin medir”**, no cero. La primera prueba cerrada debe crear esa línea base y contrastarla con las siguientes metas.

| Dimensión | KPI | Meta de prueba cerrada | Revisión |
| --- | --- | ---: | --- |
| Catálogo | Locales aprobados y jugables | 20 iniciales; 100–300 para piloto | Semanal |
| Aportes | Finalización de aporte móvil | >= 60% | Semanal |
| Moderación | Tiempo mediano hasta decisión | < 24 h | Semanal |
| Juego | Votos completados por sesión | >= 5 | Semanal |
| Juego | Duelo mostrado que termina en voto | >= 70% | Semanal |
| Retención | Regreso de personas a 7 días | >= 20% | Semanal |
| Ubicación | Aportes con ubicación útil | >= 70% | Semanal |
| Calidad | Rechazo por duplicado/baja calidad | < 20% | Semanal |
| Correo | Recuperaciones entregadas/completadas | >= 95% / >= 70% | Semanal |
| Seguridad | Cobertura Turnstile en accesos públicos | 100% antes de piloto | Por lanzamiento |
| Confiabilidad | Errores de servidor en flujos críticos | < 1% | Semanal |
| Coste | Gasto mensual de infraestructura MVP | USD 0 | Mensual |

## Plan priorizado

### P0 — antes de invitar usuarios externos

1. Autorizar las URLs de autenticación del entorno de prueba y ejecutar una recuperación de contraseña con correo real.
2. Investigar el comportamiento móvil del aporte con una captura/grabación: puede estar asociado al selector nativo de fotos, permiso de ubicación o redirección de sesión. Corregir sobre evidencia.
3. Incorporar Turnstile en registro y acceso anónimo antes de publicar enlaces abiertamente.
4. Verificar el circuito entero: registro → aporte con foto/ubicación → revisión → aprobación → aparición en juego.

### P1 — validar el núcleo

1. Crear y aprobar 20 locales de prueba y planificar la carga de 100–300 para el piloto.
2. Añadir eventos mínimos de embudo y un tablero de KPIs.
3. Observar sesiones reales de juego móvil; resolver catálogo vacío, empates y contenido insuficiente.

### P2 — MVP-004c, calidad y confianza

1. Detección de duplicados por nombre, cercanía y categoría.
2. Motivo de rechazo, historial de revisión y avisos al aportante.
3. Ficha pública de local aprobado: foto, dirección, mapa/enlace para visitarlo.
4. Límites de foto, moderación de contenido y manejo explícito de permisos de ubicación.

### Después: MVP-005

Definirlo según la evidencia del juego. La hipótesis central es: **¿las personas votan repetidamente por nombres de locales y los aportes crean un catálogo de calidad?** Funciones de promoción, competencia, publicidad o GenAI/LLMs deben esperar la respuesta a esa pregunta para no añadir coste ni complejidad prematura.

## Riesgos y criterio de salida

- El túnel temporal sirve para pruebas, no para producción: su URL cambia y depende del computador local.
- El correo no está listo hasta completar una recuperación real y, posteriormente, una confirmación de cuenta.
- La geolocalización depende del permiso del teléfono; dirección y mapa manual son el respaldo obligatorio.
- Las fotos y los datos de locales requieren reglas de contenido, moderación y reporte antes de escalar.

La prueba cerrada puede abrirse cuando exista: correo validado, Turnstile activo, 20 locales aprobados, aporte/moderación comprobados desde teléfono, juego con votos reales, eventos de KPI y cuotas gratuitas revisadas. Para un piloto público más amplio se necesitan 100–300 locales y un despliegue estable con dominio HTTPS, en lugar del túnel.
