# AULICA 2.0 — Desglose del archivo de Figma

> Documento de referencia generado explorando el archivo real vía Figma MCP. Sirve como mapa
> de partida para cualquier agente/skill que necesite investigar diseño dentro de AULICA 2.0.
> **No es exhaustivo** — Figma no expone un listado confiable de todas las páginas del archivo
> (ver "Limitación conocida" abajo), así que este mapa se arma y se amplía a mano, con links que
> va aportando el usuario.

## Ubicación

- **Team**: Netbel → carpeta "Team Aulica"
- **Archivo**: `AULICA 2.0`
- **File key**: `YKZsvPtCoDmThtCvgHuBEX`
- **URL base**: `https://www.figma.com/design/YKZsvPtCoDmThtCvgHuBEX/AULICA-2.0`

## Estructura de páginas (Pages panel)

Figma no anida páginas de verdad — este archivo simula jerarquía con una **convención de
nombres**: las páginas "hijas" llevan espacios de indentación + el símbolo `↳` delante del
nombre (ej. `"     ↳ V2.0 Home administrador"`). Las páginas "madre" de cada módulo quedan
**vacías** (sin frames propios); son solo agrupadores visuales en el panel.

| Página | node-id | Contenido |
|---|---|---|
| (portada) | `0:1` | Cover de branding, sin contenido de sistema. |
| 📌 Design Foundations | `2876:6860` | **Hub/índice** (Table of Contents), no el contenido en sí. Tarjetas: Color System, Typography, Icon Library, Grids & Layouts, Elevation — cada una con un link (prototype) a la página real de esa foundation, todavía no mapeadas. |
| 📌 Main Components | `2876:6867` | **Hub/índice** igual que el anterior. Tarjetas: Badges, Botones, Inputs, Toggles/Checkbox/Radio, Modal, Table — apuntan a páginas de detalle no mapeadas aún. |
| 📌 Módulo Administrativo | `2877:6829` | **Vacía** — es la página madre; las pantallas reales están en sub-páginas `↳` debajo de ella en el panel. |
| 📌 Módulo Contable | `2877:8336` | **Vacía** — mismo patrón. |
| &nbsp;&nbsp;&nbsp;&nbsp;↳ V2.0 Home administrador | `2401:12149` | Sub-página real con pantallas (ver detalle abajo). Vive bajo Módulo Administrativo. |
| &nbsp;↳ V2.1 - Ficha familia 2 | `5:29` | Sub-página real con pantallas (ver detalle abajo). Módulo sin confirmar todavía. |

**Pendiente:** confirmar el resto de sub-páginas por módulo (solo tenemos 2 de ejemplo hasta
ahora) y mapear a dónde apuntan los links de las tarjetas de Design Foundations / Main
Components.

## Librería de equipo publicada (independiente de las páginas)

Además de navegar por páginas, el archivo tiene **agregada** (subscribed) una librería de
equipo llamada `AULICA 2.0` (`libraryKey: lk-f283b5e0...fbb1a`), buscable con
`search_design_system` sin necesidad de saber en qué página vive cada componente. Resultados
confirmados buscando "button" (una muestra, no el listado completo):

- Buttons - Data row (component_set)
- Buttons pages and modals (component_set)
- Radio button (component_set)
- Iconos de botón secundario (component_set)
- Data masive actions (component_set)
- Chip (component_set)
- Modal footer (component_set)
- Nueva noticia (component)

Ruta interna reportada por la herramienta: `design_systems/AULICA 2.0/components/...`

**Recomendación de uso:** para "revisar Main Components", conviene usar
`search_design_system` (scopeado a este `libraryKey`) en vez de navegar la página hub —
es más rápido y no arrastra el problema de tamaño descrito abajo.

## Ejemplo de sub-página real: "V2.0 Home administrador" (`2401:12149`)

Screen de dashboard para admin de una escuela (Aulica es un sistema de gestión escolar).
8 frames de primer nivel dentro de la página:

- `Inicio` (×6, distintas variantes/tamaños — el ancho de cada una varía mucho: 2116px,
  3132px, 5048px, 6514px, 7980px — sugiere distintos estados o breakpoints puestos uno al
  lado del otro en el canvas, no una sola pantalla).
- `Componentes` — frame aparte con instancias/variantes locales usadas solo por esta pantalla.

Dentro de un frame real (`Home administrador`, 1366×734) se ve la anatomía típica: `Menú
lateral` (con accesos/menú desplegable), `Encabezado`, `Totalizadores home administrador`
(cards de Ingresos hoy / Egresos hoy / Saldo con ícono + monto).

## Ejemplo de sub-página real: "V2.1 - Ficha familia 2" (`5:29`)

Screen de "ficha de familia" (probablemente el perfil de una familia/alumno dentro del
módulo administrativo o de alumnos). 21 frames de primer nivel: múltiples variantes de
`Ficha familia - Datos` (anchos entre 2116px y 28504px) más componentes locales reutilizables
(`Card FF`, `Iconos de datos`, `Perfil`, `Card datos adicionales - Alumno`, `Card datos
adicionales - Familiar`).

## ⚠️ Limitación conocida — importante para el diseño de la skill

1. **`get_metadata` sin `nodeId` no lista todas las páginas del archivo.** En este archivo
   devolvió 1 sola página de 6+ reales. No sirve para "descubrir" la estructura completa
   mediante una sola llamada — hay que ir con node-ids concretos que aporta el usuario o que
   ya estén mapeados en este documento.
2. **El tamaño de una página completa puede ser inmanejable.** Pedir metadata de una página
   entera puede devolver desde ~400.000 hasta más de **10.000.000 de caracteres** (caso real:
   `5:29`, 85.830 líneas). Ningún agente debe pedir metadata/design-context de una página
   completa — siempre apuntar a un **frame específico** (una pantalla o un estado puntual).
3. Consecuencia directa: cualquier agente de investigación en Figma necesita **node-ids
   concretos de entrada** (pantalla o frame puntual), no "explorar el módulo entero". Este
   documento debe mantenerse como un índice creciente de referencias módulo → página → frame,
   en vez de depender de que el agente descubra todo solo en cada corrida.
