# Workflow: Creación y actualización de módulos (v3)

1. **Sincronización**: Lee `.agents/subjects/1/[MATERIA]/curriculum_map.md` para tema y objetivo.
2. **Setup**: Aplica `.agents/standards/general.md` (Mentor Experto, 13–15 años).
3. **Esquema v3**: Sigue **obligatoriamente** `.agents/instructions/module_schema_v3.md` (secciones, Practica didáctica, vídeos, gancho 🎯).
4. **Generación de secciones**:
    - **🎯 Gancho**: título **propio del módulo** (nunca solo «El reto»).
    - **💡 Entiende**: analogías, citas, H3 cortos, etiquetas `(N)`.
    - **✍️ Practica**: ejemplo resuelto + casos `### 🔍 Caso N` con **Tu turno → Clave → Por qué** (formato preferido). Tabla 3 col legacy solo si columnas = situación / clave / impacto (web oculta clave hasta **Ver clave**).
    - **🌍 En la vida real** + **🏁 Reflexiona** (lista numerada 3–6 preguntas; web = stepper).
    - **Callouts** `[!TIP]` en dos líneas; citas de autor con `> "…" — Autor`.
    - **📚 Palabras clave** + **🌟 Explora** (H3: datos, clips, cine, conversar; 8 vídeos).
    - **🏆 Pon a prueba** (mín. 6 preguntas) + **🔑 Respuestas**.
5. **Reglas de precisión**:
    - Reactivos del Reto Final: **verbatim** en fondo; solo corregir ortografía.
    - Referencias `(N)` en teoría apuntando al número de reactivo.
6. **Quality Gate**: `.agents/instructions/workflow_quality_gate.md` + `python3 scripts/audit_modules.py`.
7. **Salida**: `1/[Materia]/##_[nombre].md` — fuente única web y PDF.

---
> [!IMPORTANT]
> Un módulo sin las 9 secciones v3, sin Practica didáctica (Tu turno antes de Clave) o sin gancho 🎯 propio debe **corregirse** antes de dar por cerrado. Comportamiento web: `web_platform_management.md`.
