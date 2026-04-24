# Workflow: Onboarding de Materia

Si el programa no existe en `/subjects/`:

1. **Estructura**: Crea `.agents/subjects/[NOMBRE]/`.
2. **Assets**: Crea raíz de materia `[NOMBRE]/assets/concepts` y `[NOMBRE]/assets/exercises`.
3. **Análisis**: Genera en el folder de la materia:
   - `curriculum_map.md`: Temas divididos en módulos numéricos.
   - `knowledge_base.md`: Conceptos clave y bibliografía.
4. **Config**: Establece en `.agents/config.md` la nueva materia como activa.
5. **Aprobación**: Presenta el mapa al usuario antes de diseñar lecciones.

---
> [!NOTE]
> Mantén el rigor técnico en el análisis interno (Backstage), pero sepáralo totalmente del contenido final.
