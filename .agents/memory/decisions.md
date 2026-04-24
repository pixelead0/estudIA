# Memoria: Decisiones Estratégicas

Este documento registra los acuerdos fundamentales sobre la dirección del proyecto.

| Fecha | Decisión | Razón / Justificación |
| :--- | :--- | :--- |
| 2026-04-24 | **Eliminación de Marcas** | Se prohíbe mencionar IPN, CECyT o Politécnico para centrar el contenido 100% en el estudiante y la materia. |
| 2026-04-24 | **Cero Jerga Pedagógica** | Se eliminan términos como NEM, RAP, Competencia y Metacognición del texto final para evitar la "paja educativa". |
| 2026-04-24 | **Perfil 13-15 años** | El tono debe ser de un "Mentor Cool" (Experto pero cercano). |
| 2026-04-24 | **Analogías Híbridas** | Se deben usar tanto analogías tecnológicas (Gaming/IA) como de la vida común/comunitaria. |
| 2026-04-24 | **Generalización del Motor** | La carpeta `.agents/` debe ser agnóstica; la información de materias vive en `/subjects/`. |
| 2026-04-24 | **Expert Quality Gate** | Implementación de una auditoría final obligatoria ("The Guardian") antes de cada entrega. |
| 2026-04-24 | **PDF Image Stability** | Uso de Base64 + MIME detection para garantizar el renderizado de imágenes en PDF saltando restricciones de seguridad del navegador. |
- **[2026-04-24] - Migración a Estándar 2.0**: Se decidió unificar la estructura de todos los módulos bajo un esquema de 9 secciones obligatorias (Glosario, Respuestas, etc.) y un mínimo de 6 preguntas por reto. Se implementó `audit_modules.py` para garantizar el cumplimiento.
