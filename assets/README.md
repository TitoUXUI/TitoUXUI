# Assets pendientes

## `/assets/pov/` — escena POV del escritorio

**Fondo de la escena** (`desk-scene.jpg` / `.webp`) ✅ **es el asset final**,
no un placeholder. Nicolás decidió usar la foto real directamente —animada
por CSS (Ken Burns sutil + vapor del mate en SVG + flicker de luz, todo en
`styles.css`)— en vez de generar un video con IA. No hay ningún asset de
video pendiente.

**Los 3 paneles de detalle** (mate, libreta, auriculares) siguen mostrando
el placeholder "pendiente de asset final" — eso no cambió en esta vuelta.
Las medidas exactas para esos 3 assets están en `assets/_reference/README.md`.

**Coordenadas de los hotspots:** cada botón `.hotspot` en `index.html` tiene
`style="--x: N%; --y: N%"`, calculado a partir del encuadre de la foto de
referencia y sin recalcular en este cambio — coinciden con `desk-scene.jpg`
tal cual está.

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
