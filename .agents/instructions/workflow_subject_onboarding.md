# Workflow: Onboarding de Nueva Materia

Sigue este proceso cuando el usuario proporcione un programa de estudio de una materia nueva.

## 1. Detección y Estructura
- **Identificar**: Extrae el nombre de la materia y el **Semestre** (1-6) del documento.
- **Directorio de Salida**: Crea `[SEMESTRE]/[MATERIA]/`.
- **Directorio de Engine**: Crea `.agents/subjects/[SEMESTRE]/[MATERIA]/`.
- **Directorio de Assets**: Crea `assets/[SEMESTRE]/[MATERIA]/`.

## 2. Análisis Técnico (Backstage)
Genera en `.agents/subjects/[SEMESTRE]/[MATERIA]/`:
- **`curriculum_map.md`**: Mapa de módulos (00, 01, 02...).
- **`knowledge_base.md`**: Conceptos y bibliografía.
- **`specialized_skills.md`**: Habilidades técnicas específicas de la materia.

## 3. Configuración
- Actualiza `.agents/config.md` con los nuevos datos de **Semestre** y **Materia**.
- Presenta el mapa al usuario para aprobación.

---
> [!IMPORTANT]
> Todo activo visual debe guardarse siguiendo la convención:
> `assets/[SEMESTRE]/[MATERIA]/##_[MODULO]_[TIPO: concepts/exercises]_[NOMBRE].png`
