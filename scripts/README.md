# Scripts (estudIA)

Herramientas locales para validar y mantener el contenido del repo.

## `check_multimedia.py`

Valida enlaces de **YouTube** y **TikTok** en los módulos **`01_*.md` … `12_*.md`** de una materia (carpeta plana con `.md` por módulo).

### Qué revisa

- Que no se repita el mismo **ID de YouTube** entre módulos distintos.
- Que no se repita el mismo **ID de TikTok** (`…/video/<id>`) entre módulos distintos.
- Heurística de **solapamiento** dentro del mismo módulo: mismo “tema” deducido del título del bullet en YouTube y TikTok (por ejemplo, si aparece el mismo trabajo en ambos).
- Patrones de URL TikTok claramente mal armadas (`@usuario/@usuario/video/…`).

### Opcional: comprobar enlaces en red (`--check-http`)

- YouTube: API **oEmbed**.
- TikTok: petición **HEAD** (puede variar según región o bloqueos; no sustituye abrir el vídeo en el navegador).

### Uso

Desde la raíz del repo (`estudIA`):

```bash
# Materia por defecto: Desarrollo de Habilidades del Pensamiento
python3 scripts/check_multimedia.py

# Otra asignatura (cualquier carpeta con 01–12_*.md en el mismo nivel)
python3 scripts/check_multimedia.py --root 1/Computacion_Basica_I
python3 scripts/check_multimedia.py --root 1/Filosofia_I

# Sin imprimir mensaje de OK (solo código de salida)
python3 scripts/check_multimedia.py -q

# Validar además que los URLs respondan (requiere red)
python3 scripts/check_multimedia.py --check-http
python3 scripts/check_multimedia.py --check-http -q
```

### Códigos de salida

| Código | Significado |
|--------|-------------|
| `0` | Sin problemas detectados. |
| `1` | Se encontraron conflictos o fallos HTTP (con `--check-http`). |
| `2` | Error de configuración (por ejemplo, `--root` no existe). |

> **Nota:** `00_*.md` (resúmenes, índices) no se usa en esta auditoría; evita falsos positivos por duplicados intencionados en el índice global.

---

## Otros scripts en esta carpeta

| Archivo | Rol breve |
|---------|-----------|
| `audit_modules.py` | Auditoría de estructura/reglas en módulos. |
| `rigorous_audit.py` | Reglas estrictas adicionales (secciones, palabras prohibidas, etc.). |
| `generate-content-index.js` | Índice / generación de contenido (Node). |
