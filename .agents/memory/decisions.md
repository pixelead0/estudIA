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
| 2026-05-13 | **Estrategia de Citas Maestras** | Se eleva la densidad obligatoria a 4-6 citas por módulo para aumentar el valor pedagógico e inspirador. |
| 2026-05-13 | **Densidad de Ejemplos Prácticos** | La sección "Manos a la obra" debe contener un mínimo de 6-8 ejemplos diversificados para evitar la repetitividad y cubrir más contextos. |
| 2026-05-13 | **Guía de Navegación 00_** | Se establece como obligatorio crear un archivo resumen de temario para cada materia que facilite la visión global del alumno. |
- **[2026-04-24] - Migración a Estándar 2.0**: Se decidió unificar la estructura de todos los módulos bajo un esquema de 9 secciones obligatorias (Glosario, Respuestas, etc.) y un mínimo de 6 preguntas por reto. Se implementó `audit_modules.py` para garantizar el cumplimiento.
