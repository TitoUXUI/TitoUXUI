# Assets pendientes

## `/assets/pov/` — escena POV del escritorio ⏳ placeholders, a la espera del asset final

Las fotos que subiste eran solo referencia de encuadre — **no se usan en el
sitio**. Se movieron a `/assets/_reference/` (no se sirven en producción) y
en su lugar, `index.html` muestra un placeholder visual explícito
("Escena POV — pendiente de asset final", etc.) en cada uno de los 4 lugares:
fondo de la escena, panel del mate, panel de la libreta, panel de auriculares.

Las medidas exactas que debe tener cada asset final (para que encaje sin
tocar el CSS) están documentadas en **`assets/_reference/README.md`**, junto
con las instrucciones puntuales (comentarios `TODO(asset final pendiente)`
en `index.html`) de qué borrar y qué `<img>`/`<video>` poner en su lugar.

**Coordenadas de los hotspots:** cada botón `.hotspot` en `index.html` tiene
`style="--x: N%; --y: N%"`, ya calculado a partir del encuadre de las fotos
de referencia (mate, libreta, auriculares, pantalla). Se conservan tal cual
— si el asset final respeta el mismo encuadre/ángulo, coinciden sin retocar.

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
