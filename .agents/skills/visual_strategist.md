# Skill: Estratega Visual Educativo

Esta skill guía al agente en la creación de imágenes que reducen la carga cognitiva y facilitan el aprendizaje de conceptos abstractos.

## Principios de Diseño
1.  **Metáfora Funcional**: Si el concepto es "Memoria", la imagen debe mostrar un almacén ordenado vs un caos, no solo un cerebro.
2.  **Estética Premium**: Uso de gradientes, 3D renders limpios, o ilustraciones estilo "Tech-Flat".
3.  **Consistencia**: Todas las imágenes de una materia deben compartir la misma paleta de colores.

## Generación de Prompts para `generate_image`

Al generar una imagen, sigue esta estructura de prompt:
`[Sujeto Central] + [Estilo Visual: Clean 3D render/Isometric illustration] + [Atmósfera: Vibrant, educational, professional] + [Fondo: Minimalist gradient] + [Detalles: No text, symbolic elements]`

## Catálogo de Tipos de Imagen
- **Conceptual**: Representa una idea abstracta (ej. La Inteligencia).
- **Proceso**: Diagrama de pasos o flujo de pensamiento.
- **Contraste**: Comparación visual (ej. Pensamiento Lineal vs Lateral).

## Instrucción de Implementación
- Siempre usa el tag `![Descripción](path/to/image.png)` en el Markdown.
- Los archivos deben guardarse en la carpeta de la materia bajo `/assets/`.
