# Scripts (estudIA)

Herramientas locales para validar y mantener el contenido del repo.

**Fuente de contenido:** los `.md` en `1/<Materia>/` alimentan web y PDF. Esquema v3: `.agents/instructions/module_schema_v3.md`. Metadatos: `content/pipeline.js`; índice web: `node scripts/generate-content-index.js`.

**Sitio web (Vite/GitHub Pages):** TikTok con **blockquote + `embed.js`** (iframe interno `/embed/v2/`). El método `player/v1` propio rompe con Firefox y protección antirrastre. YouTube usa `youtube-nocookie`.

## `check_multimedia.py`

Valida enlaces de **YouTube** y **TikTok** en archivos lección (`.md`) de una materia.

### Qué revisa

- Que no se repita el mismo **ID de YouTube** entre **lecciones distintas** (archivos distintos).
- Que no se repita el mismo **ID de TikTok** (`…/video/<id>`) entre lecciones distintas.
- Heurística de **solapamiento** dentro del **mismo archivo**: mismo “tema” deducido del título del bullet en YouTube y TikTok (por ejemplo, si aparece el mismo trabajo en ambos).
- Patrones de URL TikTok claramente mal armadas (`@usuario/@usuario/video/…`).

### Modo de archivos

- **Por defecto (flexible):** incluye `NN_nombre.md` y `NN.MM_nombre.md`, y excluye `00_*` e `Resumen_*` (como en **Filosofía I**).
- **`--strict-modules`:** solo `NN_nombre.md` con N = 01…12; además exige que existan los doce módulos (comportamiento clásico de **Desarrollo de Habilidades del Pensamiento**).

### Opcional: comprobar enlaces en red (`--check-http`)

- **YouTube** y **TikTok** vía **oEmbed** (requiere red).

### Uso

Desde la raíz del repo (`estudIA`):

```bash
# Materia por defecto: Desarrollo de Habilidades del Pensamiento (modo flexible)
python3 scripts/check_multimedia.py

# DHP con regla clásica 01–12 (un archivo por número)
python3 scripts/check_multimedia.py --strict-modules

# Filosofía I (NN y NN.MM; sin auditar 00_* / Resumen_*)
python3 scripts/check_multimedia.py --root 1/Filosofia_I

# Sin imprimir mensaje de OK (solo código de salida)
python3 scripts/check_multimedia.py -q

# Validar además que los URLs respondan (requiere red)
python3 scripts/check_multimedia.py --check-http
python3 scripts/check_multimedia.py --root 1/Filosofia_I --check-http
```

### Códigos de salida

| Código | Significado |
|--------|-------------|
| `0` | Sin problemas detectados. |
| `1` | Se encontraron conflictos o fallos HTTP (con `--check-http`). |
| `2` | Error de configuración (por ejemplo, `--root` no existe). |

---

## Filosofía I: mantenimiento de TikTok e índice

Si aparecen IDs rotos o repetidos entre lecciones:

1. `python3 scripts/fix_filosofia_tiktok.py` — sustituye TikTok con oEmbed inválido usando el pool DHP + lecciones (requiere red).
2. `python3 scripts/dedupe_filosofia_tiktok.py` — deja **un uso por `video_id`** en las lecciones (la primera aparición gana; el resto toma URLs del pool DHP).
3. `python3 scripts/rebuild_filosofia_indice_videos.py` — regenera `1/Filosofia_I/00_indice_videos.md` desde la sección **🌟 Explora** de cada lección (no toca `Resumen_*`).

Luego: `python3 scripts/check_multimedia.py --root 1/Filosofia_I --check-http`.

### Migración v2 → v3 (Filosofía I)

| Script | Uso |
|--------|-----|
| `migrate_filosofia_v3.py` | Renombra H2, convierte tablas Practica → casos 🔍, reestructura Explora. |
| `fix_filosofia_explora_v3.py` | Dedupe de vídeos en Explora (tras migración). |
| `restore_filosofia_conversar.py` | Recupera texto **Para conversar** si hace falta (desde `git show HEAD:…`). |

### Migración v2 → v3 (Computación Básica I)

| Script | Uso |
|--------|-----|
| `migrate_computacion_v3.py` | Renombra H2, convierte tablas Practica → casos 🔍, reestructura Explora (sin URLs). |
| `computacion_video_data.py` | Pool de 52 TikTok + YouTube por módulo (datos). |
| `apply_computacion_videos.py` | Inserta 8 vídeos tutoriales en Explora de cada lección. |

Regenerar índice: `python3 .agents/scratch/gen_video_index.py "1/Computacion_Basica_I" "1/Computacion_Basica_I/00_indice_videos.md"`.

---

## Otros scripts en esta carpeta

| Archivo | Rol breve |
|---------|-----------|
| `audit_modules.py` | Auditoría de estructura/reglas en módulos. |
| `rigorous_audit.py` | Reglas estrictas adicionales (secciones, palabras prohibidas, etc.). |
| `generate-content-index.js` | Índice / generación de contenido (Node). |
