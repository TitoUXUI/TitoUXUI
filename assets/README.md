# Assets pendientes

Este sitio ships con placeholders SVG generados (marcados visualmente como
placeholders, no fotos falsas) para poder probar toda la interacción sin
material real. Esto es lo que falta reemplazar:

## `/assets/pov/` — escena POV del escritorio

| Archivo actual (placeholder) | Reemplazar por | Notas |
|---|---|---|
| `desk-scene-placeholder.svg` | Foto o poster del escritorio real, vista fija en primera persona | Usar como `src` del `<img class="pov-bg">` en `index.html`. Mantené el formato ~16:9. |
| — (no existe todavía) | `desk-loop.mp4` / `desk-loop.webm` | Loop corto (pocos segundos) de movimiento sutil — vapor del mate, luz ambiente. En `index.html` hay un bloque comentado (`<!-- TODO(assets reales) -->`) con el `<video>` listo para descomentar una vez que subas los archivos. `main.js` ya maneja el fallback: si el video no puede reproducir, se elimina y queda la imagen de fondo. |
| `mate-detail-placeholder.svg` | Foto detalle del mate | Panel "El mate galleta". |
| `libreta-sketch-1-placeholder.svg`, `libreta-sketch-2-placeholder.svg` | Fotos/escaneos de bocetos reales | Panel "Bocetos a mano". Se pueden agregar más `<img>` al `.sketch-grid` en `index.html`. |
| `auriculares-detail-placeholder.svg` | Foto detalle de los auriculares | Panel de mood musical. |

**Importante — coordenadas de los hotspots:** cada botón `.hotspot` en
`index.html` tiene `style="--x: N%; --y: N%"`, que posiciona el punto sobre
la imagen de fondo. Los porcentajes actuales corresponden a las zonas
marcadas en el SVG placeholder (mate, libreta, auriculares, pantalla). Al
reemplazar la imagen por la foto real, ajustá esos `--x`/`--y` para que
coincidan con la posición real de cada objeto en tu foto.

## `/assets/audio/` — narración de proyectos

No existen archivos todavía. Cada proyecto tiene un `<audio preload="none"
data-src="assets/audio/proyecto-0N-narracion.mp3">` — el reproductor
(`main.js`) recién intenta cargar el archivo cuando el usuario le da play,
así que no hay requests rotos mientras no exista el archivo. Simplemente
grabá y subí:

- `proyecto-01-narracion.mp3`
- `proyecto-02-narracion.mp3`

## Spotify — selector de mood ✅ completado

`SPOTIFY_PLAYLISTS` en `main.js` ya tiene los 3 enlaces reales:

- **Concentración** → playlist `37i9dQZF1DX7EF8wVxBVhG`
- **Creativa** → álbum `0LMOYhr8s4J84ALzWVGBa6`
- **Tranquila** → playlist `37i9dQZF1DXaw68inx4UiN`

Si en algún momento cambiás alguno, cada entrada tiene `type` (`"playlist"`
o `"album"`) e `id` — usá el segmento correspondiente de la URL de Spotify.

## Copys pendientes de ajuste

Todo el copy generado es un punto de partida razonable, no texto final:

- **Historia del mate galleta** (`index.html`, panel `#panel-mate`): texto
  genérico, falta la anécdota real.
- **Hero por audiencia** (`main.js`, objeto `AUDIENCE_COPY`): copy inicial
  para las 5 audiencias. En particular, el de "Reclutadores" evita inventar
  años de experiencia o disponibilidad concretos — conviene que sumes esos
  datos reales ahí.
- **Resúmenes de los 2 proyectos** (`index.html`, `.project-summary` y
  `.project-bullets`): placeholders genéricos hasta que definas el caso
  final de cada proyecto.
