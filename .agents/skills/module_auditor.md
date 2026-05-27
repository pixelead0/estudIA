# Skill: Module Auditor

Esta habilidad permite validar la integridad estructural y pedagógica de los módulos Markdown de estudIA utilizando herramientas automatizadas.

## Herramientas
- **Script**: `scripts/audit_modules.py`
- **Lenguaje**: Python 3

## Funciones
1. **Validación de Secciones v3**: Ver `.agents/instructions/module_schema_v3.md` y `scripts/audit_modules.py` (acepta nombres v2 y v3: Entiende, Practica, Explora, etc.).

2. **Practica didáctica**: En migraciones v3, comprobar manualmente casos `🔍` con **Tu turno** antes de **Clave** (ver quality gate).

3. **Conteo de Reactivos**: Al menos 6 preguntas en **🏆 Pon a prueba** / Reto Final.

4. **Multimedia**: `python3 scripts/check_multimedia.py --root 1/<Materia>`

## Cómo usar
Ejecuta el script desde la raíz del proyecto para obtener un reporte completo de todas las materias:
```bash
python3 scripts/audit_modules.py
```

## Interpretación de Resultados
- **✅ PASS**: El módulo cumple con todos los requisitos estructurales.
- **❌ FAIL**: El módulo tiene errores. Revisa la columna "Observaciones" para corregir (ej. "Falta sección Glosario", "Solo 4 preguntas detectadas").

---
> [!IMPORTANT]
> El paso de auditoría es obligatorio antes de realizar cualquier commit o dar por finalizada una tarea de creación/refactorización.
