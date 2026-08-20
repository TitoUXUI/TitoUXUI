# Fotos de referencia — NO son assets de producción

Las 4 fotos de esta carpeta las subió Nicolás únicamente como referencia de
**composición y encuadre**: ángulo de cámara, y posición del mate, la libreta
y los auriculares sobre el escritorio. No se usan en ningún lado del sitio
— `index.html`, `styles.css` y `main.js` no las referencian.

Sirvieron para calcular las coordenadas `--x`/`--y` de los 4 hotspots en
`index.html` (mate, libreta, auriculares, pantalla), que sí se conservan y
van a coincidir con el encuadre de los assets finales si se respetan las
medidas de abajo.

## Specs exactas para cada asset final

| Reemplaza a | Archivo de referencia | Medidas | Aspect ratio | Formato |
|---|---|---|---|---|
| Fondo de la escena POV | `desk-scene.JPG` | 2400×1800 px (mínimo; puede ser mayor manteniendo el ratio) | **4:3** | JPG/PNG (poster), o MP4+WebM si es un loop de video |
| Panel "El mate galleta" | `mate-detail.JPG` | 1050×1400 px | **3:4** (retrato) | JPG/PNG |
| Panel "Bocetos a mano" | `libreta-sketch-1.JPG` | 1400×1050 px | **4:3** | JPG/PNG |
| Panel de mood musical | `auriculares-detail.JPG` | 1400×1050 px | **4:3** | JPG/PNG |

**Por qué estas medidas:** son las que ya tienen las fotos de referencia
(después de un resize a 2400px en el lado más largo), y son las que se usaron
para calcular dónde caen los hotspots. Mientras el asset final respete el
mismo **aspect ratio** y el mismo **encuadre/ángulo** que la referencia
correspondiente, va a encajar en su contenedor sin tocar CSS.

**Nota sobre el fondo POV específicamente:** el contenedor (`.pov-scene`)
cubre todo el viewport y usa `object-fit: cover`, así que técnicamente
acepta cualquier proporción — pero como los hotspots están calculados en %
sobre el encuadre 4:3 de `desk-scene.JPG`, mantener ese mismo ratio y esa
misma composición (mismos objetos en el mismo lugar relativo) es lo que
garantiza que el mate, la libreta y los auriculares terminen exactamente
bajo sus respectivos hotspots.

## Cómo reemplazar cada placeholder

Cada placeholder (`.asset-pending`) en `index.html` tiene un comentario
`<!-- TODO(asset final pendiente) -->` justo arriba con instrucciones
puntuales de qué borrar y qué `<img>` poner en su lugar. No hace falta tocar
`styles.css` — el placeholder y el `<img>` final ocupan el mismo espacio.
