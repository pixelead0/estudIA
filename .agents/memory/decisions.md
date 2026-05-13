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
| 2026-05-13 | **Automatización de Formato PDF** | Los títulos de módulos y saltos de página se generan dinámicamente durante la exportación para garantizar consistencia visual total. |
| 2026-05-13 | **Auditoría Rigurosa 2.0** | Se implementó `rigorous_audit.py` para verificar: Densidad de citas (4-6), densidad de ejemplos (6-8), etiquetas (N), ausencia de H1 y eliminación de palabras prohibidas. |
| 2026-05-13 | **Accesibilidad Universal** | Se prohíbe el uso de analogías que dependan de conocimientos específicos (Gaming, Alquimia, Economía avanzada) para asegurar la comprensión en todos los contextos sociales. |
| 2026-05-13 | **Neutralización de Conceptos** | Términos como "Costo de Oportunidad" o "Prospectiva" deben ser sustituidos por expresiones descriptivas ("El precio de elegir", "Visión de futuro") para alumnos de 13-15 años. |
| 2026-05-13 | **Metáforas Diversas y Claras** | Se priorizan analogías de la vida diaria (cocina, herramientas, linternas, mochilas) que sean familiares para cualquier estudiante sin importar su entorno tecnológico. |
| 2026-05-13 | **Equilibrio Técnico-Narrativo** | Se mantiene la profundidad de los conceptos (procesos básicos, lógica, expansión) pero se "traduce" a un lenguaje que no requiere conocimientos previos fuera del entorno escolar común. |
