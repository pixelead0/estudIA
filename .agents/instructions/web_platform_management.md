# Skill: Web Platform Management

This instruction defines how to manage and extend the estudIA web platform.

## Architecture
- **Framework**: Vite + Vanilla JS/CSS.
- **Fuente única**: archivos `.md` en `1/<Materia>/` (misma carpeta que usa el PDF). Ver `content/README.md` y `content/pipeline.js`.
- **Índice web**: `scripts/generate-content-index.js` → `subjects.json` (clasifica `module` / `appendix` / `supplement`, títulos alineados al PDF).
- **Vista web**: `fetch` del `.md` + `marked` + transformaciones en `main.js` — no copiar contenido a otro formato.
- **Vista PDF**: `bin/generate-pdf.js` (markdown-it + Playwright) sobre los mismos `.md`.
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages.

## UI/UX Features
- **Home Grid**: Menú visual de materias.
- **Filtered Sidebar**: Solo módulos de la materia activa; apéndices `00_*` en «Extras».
- **Theme Toggle**: Dark/Light con `localStorage`.
- **Módulos v3**: Tarjetas por sección H2 (`enhanceModuleSections`), kickers/títulos web vía `content/section-labels.js`.
- **Contenido didáctico:** `.agents/instructions/module_schema_v3.md`.

## Pipeline post-`marked` (`renderSubjectView`)

Orden **fijo** tras cargar el HTML del módulo:

| Orden | Función | Qué transforma |
|------|---------|----------------|
| 1 | `enhanceCallouts` | `blockquote` con `[!NOTE\|TIP\|IMPORTANT\|WARNING\|CAUTION]` → `.callout` + cabecera (Consejo, Nota, Clave, Ojo) |
| 2 | `enhanceModuleSections` | Cada `h2` con emoji → `.study-section` (intro previa al primer H2 en `.study-intro`) |
| 3 | `enhancePracticeCases` | Practica: casos 🔍 en **stepper** (Anterior/Siguiente), Clave oculta hasta **Ver clave**; ejemplo resuelto aparte |
| 4 | `enhanceReflectPrompts` | En Reflexiona: `ol` con ≥2 ítems → `.reflect-stepper` (una pregunta a la vez) |
| 5 | `enhanceGlossaryFlashcards` | En Palabras clave: `ul` con ≥2 `**Término**:` → `.glossary-deck` (volteo) |
| 6 | `enhanceExploreSection` | En Explora: quita listas de vídeo duplicadas; curiosidades + Para conversar |
| 7 | `enhanceQuizChallenge` | Pon a prueba: cuestionario paso a paso; clave 🔑 oculta hasta el final |
| 8 | `enhanceQuizTheoryAnchors` | Párrafos con `(N)` → ancla; cada pregunta del reto y los resultados enlazan a esa base teórica (clic: resaltado del párrafo completo + etiqueta amarilla como superíndice) |
| 9 | `enhanceWisdomQuotes` | Citas atribuidas → `.wisdom-quote` (excluye `.callout` y TikTok) |
| 10 | `enhanceActivityTables` | Tablas 3 columnas → `.scenario-cards`; en Practica: modo quiz (clave oculta) |
| 11 | `enhanceVideoPlaylist` + TikTok | Vídeos YouTube/TikTok, playlist arriba del módulo, `embed.js` |

### Callouts (`enhanceCallouts`)

- **Problema conocido:** con `marked` (GFM), `> [!TIP]` + línea siguiente suele fusionarse en un solo `<p>` con el tag al inicio.
- **Solución:** regex `CALLOUT_TAG_INLINE_RE` elimina el tag del HTML y añade `.callout-header`.
- **Autor en `.md`:** mantener sintaxis estándar en dos líneas; no depender de que el tag se vea en crudo en web.

### Secciones H2 (`enhanceModuleSections`)

- Agrupa contenido bajo cada `h2` en `.study-section--{kind}` según emoji (🎯 challenge, 💡 learn, ✍️ practice, 🏁 reflect, etc.).
- **Regla DOM:** mover nodos al `<section>` **antes** de reubicar el `h2` dentro de `.study-section-titles` (si no, `insertBefore` falla).

### Practica — tablas (`enhanceActivityTables`)

- Solo tablas con **3 columnas** y ≥1 fila de datos.
- Dentro de `.study-section--practice`:
  - Columna 1 → situación (visible).
  - Columnas 2–3 → ocultas hasta **Ver clave** (`.scenario-card--quiz`).
  - Hint: «Piensa tu respuesta antes de abrir cada clave.»
- Fuera de Practica o tablas de **2 columnas**: tarjetas sin modo quiz (p. ej. ejemplo resuelto).

### Explora — sin clips duplicados (`enhanceExploreSection`)

- Los vídeos del `.md` se recogen en `enhanceVideoPlaylist` **antes** de agrupar secciones; el hub queda al inicio del `<article>`.
- Dentro de `.study-section--explore` se quitan H3/listas de clips y `.video-playlist-ref`.
- Contenido visible: banner → reproductor, tarjetas de **dato curioso**, bloque **Para conversar**.

### Palabras clave — flashcards (`enhanceGlossaryFlashcards`)

- Solo el `ul` directo hijo de `.study-section--glossary .study-section-body`.
- Cada ítem debe tener `**Término**:` al inicio; la definición puede incluir HTML inline de `marked`.
- Tarjetas en cuadrícula; frente = término + «Voltear»; dorso = término pequeño + definición.
- `prefers-reduced-motion`: sin animación 3D, se alterna frente/dorso al pulsar.

### Reflexiona — listas (`enhanceReflectPrompts`)

- Solo el `ol` directo hijo de `.study-section--reflect .study-section-body`.
- **No** usar acordeón con todas las preguntas visibles: **stepper** con barra de progreso, Anterior/Siguiente, puntos y una tarjeta `.reflect-slide` activa.
- El markdown sigue siendo lista numerada para PDF.

### Vídeos

- Enlaces YouTube/TikTok → reproductor; metadatos desde `**Título**: análisis… URL` (`extractVideoMetaFromAnchor`).
- Con 2+ vídeos: playlist + panel de contexto del clip activo.
- TikTok: `blockquote.tiktok-embed` + `embed.js`.

## Workflows

### 1. Adding New Content
When a new subject or module is added:
1. Place the `.md` file in the appropriate folder under `1/`.
2. Run `npm run pre-index` (or `make web-build`) to update `subjects.json`.
3. Verify local rendering with `make web-dev`.

### 2. Updating UI/UX
- **Styles**: `style.css` (`.study-section--*`, `.scenario-card*`, `.reflect-stepper*`, `.callout-*`).
- **Logic**: `main.js` (funciones `enhance*` anteriores).
- **Etiquetas web de sección**: `content/section-labels.js`.
- **Theme**: `:root[data-theme='light']` en `style.css`.

### 3. Build & Deploy
- **Local Build**: `make web-build`.
- **Deploy**: Automatic on push to `main`.

## Verification Standards
- **Manual over Automatic**: DO NOT use automatic browser testing unless the USER explicitly requests it. Rely on build checks and walkthroughs.
- Interactive elements should have stable hooks (clases `reflect-stepper-*`, `scenario-card-*`, etc.).
- Tras cambiar `enhance*`, probar al menos un módulo con: callout `[!TIP]`, tabla Practica 3 col, lista Reflexiona 3+ ítems, y sección Explora con vídeos.
