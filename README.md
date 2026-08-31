# TitoUXUI

## Ministerio de Adolescentes

La carpeta [`ministerio/`](ministerio/) contiene el MVP de una PWA (Next.js + Supabase) para gestionar el ministerio de adolescentes de una iglesia: directorio, calendario con itinerario y notificaciones push, tareas, muro y reporte mensual para los ancianos. Ver [`ministerio/README.md`](ministerio/README.md) para levantarlo local y desplegarlo.

## Claude Skills

Colección de skills para Claude Code instaladas en este repositorio bajo `.claude/skills/`. Cada carpeta contiene un `SKILL.md` (y, cuando aplica, `references/`, `scripts/`, `templates/`, etc.) tal como lo publica su repositorio de origen.

Claude Code detecta automáticamente cualquier carpeta con un `SKILL.md` dentro de `.claude/skills/` cuando se trabaja en este repositorio.

## Fuentes instaladas

| Origen | Repositorio | Licencia | Skills incluidas |
|---|---|---|---|
| ibelick | [ui-skills](https://github.com/ibelick/ui-skills) | MIT | `baseline-ui`, `create-design-md`, `fixing-accessibility`, `fixing-metadata`, `fixing-motion-performance`, `improve-ui`, `ui-skills-root` |
| nextlevelbuilder | [ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT | `banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`, `ui-ux-pro-max` |
| microsoft | [playwright-cli](https://github.com/microsoft/playwright-cli) | Apache-2.0 | `playwright-cli` |
| wondelai | [skills](https://github.com/wondelai/skills) | MIT | 61 skills de producto, negocio, diseño e ingeniería (ver `.claude/skills/`) |
| pbakaus | [impeccable](https://github.com/pbakaus/impeccable) | Apache-2.0 | `impeccable` |

Los textos de licencia originales de cada repositorio se conservan en `THIRD_PARTY_LICENSES/`.

## Notas

- Los contenidos se copiaron tal cual desde la carpeta canónica de skills de cada repositorio (`skills/`, `.claude/skills/`, según el proyecto).
- Del repositorio `wondelai/skills` solo se copiaron las carpetas de skills individuales (cada una con su propio `SKILL.md`); se omitieron los directorios de infraestructura del repo (`docs/`, `plugins/`, `scripts/`, manifests de marketplace, espejos para otros agentes como `.cursor/`, `.windsurf/`, `.pi/`, `.agents/`).
- Del repositorio `microsoft/playwright-cli` solo se copió la skill de uso de la CLI (`skills/playwright-cli`); se omitió la skill de mantenimiento interno del repo (`.claude/skills/dev`).
