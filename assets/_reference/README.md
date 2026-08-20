# Fotos de referencia — NO son assets de producción

Las 3 fotos que quedan en esta carpeta las subió Nicolás únicamente como
referencia de **composición y encuadre** para los 3 paneles de detalle
(mate, libreta, auriculares). No se usan en ningún lado del sitio —
`index.html`, `styles.css` y `main.js` no las referencian.

(La cuarta foto, `desk-scene`, ya no está acá: se promovió a
`/assets/pov/desk-scene.jpg` como fondo **definitivo** de la escena POV,
animado por CSS. Ver `assets/README.md`.)

Sirvieron para calcular las coordenadas `--x`/`--y` de los hotspots en
`index.html`, que sí se conservan y van a coincidir con el encuadre de los
assets finales si se respetan las medidas de abajo.

## Specs exactas para cada asset final pendiente

| Reemplaza a | Archivo de referencia | Medidas | Aspect ratio | Formato |
|---|---|---|---|---|
| Panel "El mate galleta" | `mate-detail.JPG` | 1050×1400 px | **3:4** (retrato) | JPG/PNG |
| Panel "Bocetos a mano" | `libreta-sketch-1.JPG` | 1400×1050 px | **4:3** | JPG/PNG |
| Panel de mood musical | `auriculares-detail.JPG` | 1400×1050 px | **4:3** | JPG/PNG |

**Por qué estas medidas:** son las que ya tienen las fotos de referencia
(después de un resize a 2400px en el lado más largo), y son las que se usaron
para calcular dónde caen los hotspots. Mientras el asset final respete el
mismo **aspect ratio** y el mismo **encuadre/ángulo** que la referencia
correspondiente, va a encajar en su contenedor sin tocar CSS.

## Cómo reemplazar cada placeholder

Cada placeholder (`.asset-pending`) en `index.html` tiene un comentario
`<!-- TODO(asset final pendiente) -->` justo arriba con instrucciones
puntuales de qué borrar y qué `<img>` poner en su lugar. No hace falta tocar
`styles.css` — el placeholder y el `<img>` final ocupan el mismo espacio.
