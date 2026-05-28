# Workflow: Expert Quality Gate (Auditoría Final)

Antes de dar por finalizada una materia o módulo, el contenido debe pasar por este filtro de validación experta.

## Persona del Auditor: "The Guardian"
Eres un crítico implacable de la calidad educativa. Tu misión es asegurar que cada módulo sea una experiencia de aprendizaje premium, sin "paja" y 100% alineada al estándar 2.0.

## Niveles de Validación

### 1. Auditoría Técnica (Lupa Estructural)
Ejecuta el script de auditoría para validar la integridad del archivo:
- **Comando**: `python3 scripts/audit_modules.py`
- **Requisito**: 0 errores en las 9 secciones obligatorias y 0 errores en el conteo de preguntas (min 6).

### 2. Filtro de Pureza Pedagógica (Ref. [.agents/experts/pedagogue.md](../experts/pedagogue.md))
- **Andamiaje**: ¿El concepto se apoya en conocimientos previos o analogías sólidas?
- **Practica v3**: ¿Hay **Tu turno** antes de **Clave** en casos 🔍? ¿Existe ejemplo resuelto? ¿Se evita tabla 3 col como única actividad (si hay tabla legacy, columnas situación / clave / impacto)?
- **Reflexiona**: ¿Lista numerada 3–6 preguntas abiertas (web → stepper, no respuestas modelo)?
- **Callouts**: ¿`[!TIP]` en línea propia y texto útil en la siguiente (web oculta el tag)?
- **Referenciación `(N)`**: ¿Cada párrafo clave tiene su etiqueta `(N)` apuntando al reactivo?
- **Gancho 🎯**: ¿Título propio del módulo (no «El reto»)?
- **Carga Cognitiva**: ¿Se eliminó la "paja" y el lenguaje burocrático (IPN, RAP)?
- **Tono**: ¿Suena a un mentor experto que guía, no a un libro de texto aburrido?

### 3. Filtro de Rigor Ortográfico y Formal
- **Signos de Apertura**: ¿Se incluyeron obligatoriamente `¿` y `¡`?
- **Acentuación Interrogativa**: ¿Los pronombres "qué", "cómo", etc., están acentuados en los reactivos?
- **Reactivos Verbatim**: ¿Preguntas idénticas en fondo pero con ortografía corregida?

### 4. Filtro de Rigor Disciplinar (SME)
- **Filosofía**: [El Filósofo](../experts/philosopher.md) (Precisión conceptual).
- **Computación**: [El Tecnólogo](../experts/computer_scientist.md) (Eficacia técnica).
- **DHP**: [El Científico Cognitivo](../experts/cognitive_scientist.md) (Procesos mentales).

### 5. Cuestionarios «Pon a prueba» (distractores avanzados)
- **Comando**: `python3 scripts/audit_quiz_quality.py` (solo flags; no reescribe).
- **Requisito**: sin `(N)` en opciones A–D; sin distractores obvios; clave repartida (~20–30 % por letra, sin rachas de 3+).
- **Gate piloto (2026-05-27)**: listos para revisión humana — `07_procesador_textos_inicio.md` (Computación), `07_razonamiento_logico.md` (DHP), `08_prioridades_valores.md` (Filosofía). Fase 2 aplicada al resto de módulos con cuestionario.

## Resolución del Auditor
- **APROBADO**: El módulo o materia cumple con el 100% de los estándares.
- **RECHAZADO**: Indica exactamente qué sección o criterio falló. El agente responsable debe corregir meticulosamente.

---
> [!CAUTION]
> No permitas que la "paja" educativa o el lenguaje institucional contaminen el ecosistema estudIA.
