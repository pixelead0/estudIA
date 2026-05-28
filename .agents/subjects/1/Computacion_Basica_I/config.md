# Configuración: Computación Básica I

## Metadatos de la Materia
- **Nombre**: Computación Básica I
- **Semestre**: 1
- **Foco**: Alfabetización digital, gestión de información y herramientas de productividad.
- **Engine**: [.agents/subjects/1/Computacion_Basica_I/](.)
- **Salida**: [1/Computacion_Basica_I/](../../../../1/Computacion_Basica_I)
- **Assets**: [assets/1/Computacion_Basica_I/](../../../../assets/1/Computacion_Basica_I)

## Estado de Desarrollo
- **Módulos Totales**: 13
- **Módulos Completados**: 13 (migración estructural v3 + multimedia, 2026-05-27)
- **Última Actualización**: 2026-05-27
- **Esquema**: v3 — casos 🔍 en Practica, H3 en Explora, títulos H2 v3; reactivos verbatim salvo ortografía.
- **Estándar Multimedia**: Premium 2.0 (2 YouTube + 2 TikTok por bloque en Explora)

## Política de vídeos (específica de la materia)

En Computación Básica I, **todos los clips deben enseñar cómo usar la herramienta o el tema del módulo** (tutoriales en pantalla, atajos, menús), no curiosidades históricas ni cine desvinculado.

- **Referencia principal**: Microsoft (Word, PowerPoint, Explorador de archivos, Windows, Chrome/Edge, Gmail).
- **Google** (Docs/Slides): solo cuando el módulo ya los cite como alternativa.
- Los H3 `### Clips y casos` y `### Cine y series` se mantienen por auditoría; en esta materia el segundo bloque también lleva **tutoriales extendidos** (no ficción).
- Cuentas TikTok de referencia: `@mtholfsen`, `@windows`, `@seewhatiseeee`, `@lourrutia.ppt`, `@rob.ppt`, `@kevinstratvert` (verificación manual en navegador; TikTok no valida por script).

## Herramientas

- Migración v3: `python3 scripts/migrate_computacion_v3.py`
- Vídeos Explora: `python3 scripts/apply_computacion_videos.py` (datos en `scripts/computacion_video_data.py`)
- Índice: `python3 .agents/scratch/gen_video_index.py "1/Computacion_Basica_I" "1/Computacion_Basica_I/00_indice_videos.md"`
- QA: `python3 scripts/audit_modules.py` · `python3 scripts/check_multimedia.py --root 1/Computacion_Basica_I`
