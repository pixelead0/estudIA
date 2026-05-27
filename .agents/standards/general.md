# Estándares Maestros: estudIA

Este documento consolida el perfil, lenguaje y diseño para todo contenido en la plataforma.

## 1. Perfil del Estudiante (13-15 años)
- **Contexto**: Adolescentes en transición al pensamiento abstracto. Estudiantes de diversas realidades sociales.
- **Necesidad**: Lenguaje claro, cercano y sin complicaciones. Conexión con situaciones que viven a diario.
- **Inclusión**: No asumas que son expertos en videojuegos o tecnología avanzada. El contenido debe ser accesible para todos.

## 2. Reglas de Oro del Lenguaje
- **PROHIBIDO**:
  - Nombres institucionales (IPN, CECyT, etc.) y jerga pedagógica (RAP, Competencia, Metacognición).
  - Jerga técnica excesiva (Prospectiva, Costo de Oportunidad) o "gamer" (Boss Fight, Loot, Spawn, Glitch) que no sea universal.
- **PRINCIPIO DE ACCESIBILIDAD**: No asumas que el estudiante conoce conceptos de economía, historia avanzada o tecnología. Explica todo con analogías de la vida diaria (comida, deportes, familia).
- **PERMITIDO**: Tono de "Mentor Amigo", analogías de la vida diaria variadas, segunda persona ("Tú").
- **OBLIGATORIO**: Explicar siempre *por qué* importa el tema (el sentido y la utilidad práctica). Conectar los conceptos abstractos directamente con la toma de decisiones cotidianas del adolescente mediante el uso de **metáforas originales y diversas**; NO repetir las mismas analogías entre módulos.
- **ESTILO**: Frases cortas, directas y motivadoras. Evita los muros de texto. Usa comparaciones actuales pero **asegúrate de variar los contextos** (deportes, arte, ciencia, convivencia, etc.) para mantener siempre la frescura y evitar la repetitividad.
- **FRASES CÉLEBRES (OBLIGATORIO)**: Integrar una **alta densidad de citas** (mínimo 4-6 frases por módulo) de filósofos, científicos o figuras históricas relevantes. Estas deben actuar como "puntos de anclaje" visuales y conceptuales usando el formato de cita `>`.

## 3. Estructura Obligatoria (Versión 2.0)
Cada módulo debe estar contenido en un archivo Markdown.

**Nomenclatura**:
- Guía General del Curso: `00_resumen_temario.md` (Obligatorio para cada materia). No debe contener las 9 secciones estándar, sino un resumen de los bloques.
- Módulo Simple: `XX_[nombre].md`
- Sub-módulos (para temas densos): `XX.YY_[nombre].md` (ej. `03.01_doctrinas_griegas.md`)

**Secciones Obligatorias (v3 — ver `instructions/module_schema_v3.md`)**:
1.  **🎯 [Gancho propio]**: Desafío reconocible; **no** titular «El reto».
2.  **💡 Entiende**: Analogía, citas, H3 cortos, `(N)`.
3.  **✍️ Practica**: Tu turno → Clave → Por qué (casos 🔍); ejemplo resuelto. En web, tablas 3 col (legacy) ocultan clave hasta **Ver clave**.
4.  **🌍 En la vida real**: Aplicación cotidiana.
5.  **🏁 Reflexiona**: Lista numerada, 3–6 preguntas abiertas (web: stepper, una por pantalla).
6.  **📚 Palabras clave**: Glosario breve.
7.  **🌟 Explora**: Datos, clips (2+2 YT/TT), cine (2+2), Para conversar; vídeos con `**Título**: análisis. URL`.
8.  **🏆 Pon a prueba**: Mínimo 6 reactivos verbatim.
9.  **🔑 Respuestas**: Clave del reto.

## 4. Sistema de Referencia de Autoaprendizaje
- **Etiquetas `(N)`**: Dentro de **💡 Entiende**, insertar `(N)` donde `N` es el número de la pregunta de **🏆 Pon a prueba**.
- **Propósito**: Permitir que el estudiante localice inmediatamente la base teórica de cada reactivo del examen.
- **Vista web**: `(N)` se muestra como superíndice; desde cada pregunta (y en resultados) hay un enlace a los párrafos base con `(N)`, y al abrirlos se resalta el párrafo completo y la etiqueta en amarillo.

## 5. Calidad Visual y Redacción
- **Fluidez y Párrafos**: Evitar muros de texto. Separar los párrafos de manera que cada uno trate una idea clara. Usar conectores de transición (Por consiguiente, No obstante, En consecuencia) para asegurar la fluidez.
- **Sin imágenes embebidas**: Los módulos NO deben incluir links de imagen (`![alt](ruta)`). Recursos en **🌟 Explora** (YouTube/TikTok).
- **Formato**: Callouts `> [!TIP]` (dos líneas); tablas para comparaciones o ejemplo resuelto; listas numeradas en Reflexiona. La web estiliza callouts y no muestra el tag `[!TIP]` en crudo.

## 6. Regla de Multimedia (Formato de Ficha con Reflexión)

Cada recurso de **🌟 Explora** debe usar:

### Formato obligatorio dentro del módulo

```markdown
- **Título del Video**: Reflexión pedagógica de una línea que conecta el clip con el objetivo de aprendizaje del módulo. https://url-directa
```

### Reglas de la Reflexión Pedagógica
- **Obligatoria**: No se puede publicar un recurso sin reflexión.
- **Longitud**: Máximo 2 líneas. Debe ser concisa y directa.
- **Contenido**: Debe conectar explícitamente el clip con un concepto del módulo (no solo describir el video).
- **Tono**: Mismo tono "Mentor Amigo" del resto del módulo.
- **Ejemplo correcto**: `> La creatividad no es un chispazo de suerte, sino un proceso que puede entrenarse y construirse colectivamente.`
- **Ejemplo incorrecto**: `> Un video sobre brainstorming.`

### Índice Maestro de Multimedia
El archivo `00_indice_videos.md` dentro de cada carpeta de materia consolida **todos** los recursos en formato de fichas navegables:

```markdown
### Título del Video
▶️ **YouTube** &nbsp; [Título](https://url)
> Reflexión pedagógica que conecta el clip con los objetivos de aprendizaje.
```

Este índice se genera automáticamente con el script `.agents/scratch/extract_videos_v4.py` y debe regenerarse cada vez que se añadan o modifiquen recursos multimedia en los módulos.

---

## 7. Estándares de Exportación (PDF)
Para garantizar una experiencia de lectura fluida y profesional en los archivos descargables:
- **Títulos Automáticos**: El generador de PDF añade un encabezado `H1` con el nombre del módulo (ej. "Módulo 01: [Título]"). NO añadir títulos `H1` manuales dentro de los archivos `.md`.
- **Salto de Página**: Cada módulo debe comenzar en una página nueva. Esto es gestionado por la clase `.page-break` en el CSS de exportación.
- **Paginación**: El pie de página debe mostrar siempre el número de página actual y el total del documento.
- **Apéndices al Final**: Los archivos con prefijo `00_` (ej. `00_resumen_temario.md`, `00_indice_videos.md`) se agregan automáticamente **al final del PDF** como apéndices, después de todos los módulos numerados. El título en el PDF será `Apéndice: [Nombre legible]`. No se incluyen al inicio.

---
> [!IMPORTANT]
> El objetivo es que cualquier alumno, sin importar su nivel tecnológico, pueda entender el tema a la primera.
