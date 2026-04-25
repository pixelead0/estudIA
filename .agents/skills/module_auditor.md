# Skill: Module Auditor

Esta habilidad permite validar la integridad estructural y pedagógica de los módulos Markdown de estudIA utilizando herramientas automatizadas.

## Herramientas
- **Script**: `scripts/audit_modules.py`
- **Lenguaje**: Python 3

## Funciones
1. **Validación de Secciones**: Verifica que el módulo contenga las 9 secciones obligatorias definidas en el estándar:
   - `# Módulo XX` (Título)
   - `## 🎯 El Reto`
   - `## 💡 ¿Cómo funciona esto?`
   - `## ✍️ Manos a la obra`
   - `## 🌍 En tu mundo`
   - `## 🏆 Reto Final`
   - `## 🏁 Pausa para pensar`
   - `## 📚 Glosario Maestro`
   - `## 🌟 Zona de Descubrimiento`
   - `## 🔑 Respuestas Correctas`

2. **Conteo de Reactivos**: Asegura que la sección `## 🏆 Reto Final` contenga al menos 6 preguntas numeradas.

3. **Verificación de Respuestas**: Valida que existan respuestas para todas las preguntas en la sección `## 🔑 Respuestas Correctas`.

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
