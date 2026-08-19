# Assets pendientes

## `/assets/pov/` — escena POV del escritorio ✅ fotos reales cargadas

| Archivo | Uso | Notas |
|---|---|---|
| `desk-scene.JPG` | Fondo de la escena POV (`<img class="pov-bg">`) | Foto real, EXIF/GPS removido, redimensionada a 2400px para peso web (~640 KB). |
| `mate-detail.JPG` | Panel "El mate galleta" | Foto real. |
| `libreta-sketch-1.JPG` | Panel "Bocetos a mano" | Foto real. Se pueden sumar más `<img>` al `.sketch-grid` en `index.html` cuando tengas más páginas. |
| `auriculares-detail.JPG` | Panel de mood musical | Foto real. |
| — (no existe todavía) | `desk-loop.mp4` / `desk-loop.webm` | Loop corto (pocos segundos) de movimiento sutil — vapor del mate, luz ambiente. En `index.html` hay un bloque comentado con el `<video>` listo para descomentar una vez que subas los archivos. `main.js` ya maneja el fallback: si el video no puede reproducir, se elimina y queda la imagen de fondo. |

**Nota sobre `desk-scene.JPG`:** en esta foto en particular hay una taza/vela
en el lugar donde normalmente está el mate (no el mate en sí). El hotspot
"Mi mate" apunta a esa posición porque es donde el mate suele estar en tu
escritorio real — si más adelante sacás una foto general con el mate puesto
ahí, reemplazá `desk-scene.JPG` y no deberías necesitar tocar nada más.

**Coordenadas de los hotspots:** cada botón `.hotspot` en `index.html` tiene
`style="--x: N%; --y: N%"`, ya ajustado a las posiciones reales en
`desk-scene.JPG`. Si subís una foto distinta con objetos en otro lugar,
reajustá esos valores.

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
