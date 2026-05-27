# Skill: Web Platform Management

This instruction defines how to manage and extend the estudIA web platform.

## Architecture
- **Framework**: Vite + Vanilla JS/CSS.
- **Fuente única**: archivos `.md` en `1/<Materia>/` (misma carpeta que usa el PDF). Ver `content/README.md` y `content/pipeline.js`.
- **Índice web**: `scripts/generate-content-index.js` → `subjects.json` (clasifica `module` / `appendix` / `supplement`, títulos alineados al PDF).
- **Vista web**: `fetch` del `.md` + `marked` + transformaciones en `main.js` (vídeos, callouts, playlist) — no copiar contenido a otro formato.
- **Vista PDF**: `bin/generate-pdf.js` (markdown-it + Playwright) sobre los mismos `.md`.
- **Deployment**: GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages.

## UI/UX Features
- **Home Grid**: A visual menu of all subjects.
- **Filtered Sidebar**: The sidebar only shows modules of the currently selected subject.
- **Theme Toggle**: Support for Dark/Light mode with persistence in `localStorage`.
- **Aesthetic**: Espacio de estudio para adolescentes maduros. Módulos v3: tarjetas por sección, kickers web (`content/section-labels.js`), casos Practica `🔍`. **Contenido:** `.agents/instructions/module_schema_v3.md`.

## Workflows

### 1. Adding New Content
When a new subject or module is added:
1. Place the `.md` file in the appropriate folder under `1/`.
2. Run `npm run pre-index` (or `make web-build`) to update `subjects.json`.
3. Verify local rendering with `make web-dev`.

### 2. Updating UI/UX
- **Styles**: Modify `style.css`.
- **Logic**: Modify `main.js`.
- **Theme**: Light mode variables are defined in `:root[data-theme='light']`.

### 3. Build & Deploy
- **Local Build**: `make web-build`.
- **Deploy**: Automatic on push to `main`.

## Verification Standards
- **Manual over Automatic**: DO NOT use automatic browser testing tools (e.g., `browser_subagent`) to verify UI changes unless the USER explicitly requests it. Rely on terminal build checks and descriptive walkthroughs.
- All interactive elements must have unique IDs.
- Ensure `marked` supports pedagogical Markdown; YouTube/TikTok links become video slots in `main.js` (`transformVideoLinks`). **Título y análisis** se leen del ítem de lista (`**Título**: descripción… URL`) vía `extractVideoMetaFromAnchor`, no solo de h3/blockquote. TikTok: **`embed.js`** + `blockquote.tiktok-embed`. Con 2+ vídeos: playlist arriba + panel de contexto con título/descripción del clip activo.
