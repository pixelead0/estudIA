# Contenido estudIA — fuente única

Los archivos **Markdown** en `1/<Materia>/` son la **única fuente** del material:

| Canal | Cómo consume los `.md` |
|--------|-------------------------|
| **Web** (Vite) | `fetch` del `.md` → `marked` + transformaciones en `main.js` (vídeos, callouts, playlist) |
| **PDF** | `bin/generate-pdf.js` fusiona los mismos archivos → `markdown-it` + `premium-pdf.css` → Playwright |

## Metadatos compartidos

`content/pipeline.js` define reglas comunes:

- **Clasificación**: `module` (01_…, 02.01_…), `appendix` (`00_*`), `supplement` (`Resumen_*`, `Mission_*`)
- **Títulos**: mismos criterios que el PDF (`Módulo 04: …`, apéndices con nombre fijo)
- **Orden**: orden numérico natural de nombres de archivo

`scripts/generate-content-index.js` genera `subjects.json` usando este pipeline.

## Vistas por canal (no duplicar contenido)

- **Web** (`main.js` tras `marked`):
  - H2 → tarjetas `.study-section` (kickers en `section-labels.js`)
  - `[!TIP]` etc. → `.callout` (tag nunca visible; cabecera Consejo/Nota/Clave/Ojo)
  - Practica: casos `🔍` en `.practica-caso`; tablas 3 col → `.scenario-cards` con **Ver clave**
  - Reflexiona: listas numeradas → `.reflect-stepper` (una pregunta por pantalla)
  - Palabras clave: listas `**Término**:` → `.glossary-deck` (flashcards con volteo)
  - Explora: vídeos solo en el reproductor inicial; en la sección, curiosidades + Para conversar
  - Pon a prueba: cuestionario interactivo; Respuestas ocultas hasta terminar el reto
  - YouTube/TikTok → playlist; `00_*` en «Extras» del menú
- **PDF**: imágenes en Base64; callouts como `<div class="alert">`; saltos de página; apéndices al final del libro

Detalle técnico: `.agents/instructions/web_platform_management.md` y didáctica: `.agents/instructions/module_schema_v3.md` (§ callouts, Practica web, Reflexiona web).

**Prueba web recomendada:** `1/Desarrollo_de_Habilidades_del_Pensamiento/` (v3 completo). Tras cambios en `enhance*`, revisar al menos un módulo DHP, uno de Filosofía I y uno de Computación Básica I (p. ej. `07_procesador_textos_inicio.md`: Practica stepper + playlist Word).

Editar siempre el `.md` en `1/`; no mantener copias paralelas para web y PDF.

## Vídeos en la Zona de Descubrimiento

Cada clip va en un ítem de lista, **una línea por vídeo**:

```markdown
- **Título del clip**: Reflexión o análisis pedagógico en una o dos frases. https://www.youtube.com/watch?v=…
- **Otro título**: Misma estructura. https://www.tiktok.com/@cuenta/video/…
```

Reglas:

- El **título** va en negrita (`**…**`), sin repetir «(TikTok)» si ya está bajo un bloque TikTok.
- El **análisis** es el texto entre el título y la URL (la web y la playlist lo muestran bajo el reproductor).
- No usar solo la URL como título; no dejar el análisis solo en un blockquote aparte (el índice `00_indice_videos.md` puede usar `>` para lectura, pero la lección debe llevar título + análisis en la misma línea).
- Estándar por módulo: **2 YouTube + 2 TikTok** en «Para ver (YouTube + TikToks)» y **2 YouTube + 2 TikTok** en «Para ver (Cine y Series)».

Tras editar lecciones de una materia, conviene alinear `00_indice_videos.md` (manual o script de rebuild cuando exista para esa materia).

## Esquema v3 (obligatorio)

Ver **`.agents/instructions/module_schema_v3.md`** — fuente canónica para agentes.

Resumen en repo: `content/module-schema.md` (enlace al doc de agentes).
