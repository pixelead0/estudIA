# Esquema de módulo v3 — instrucción para agentes

**Cuándo usar:** al crear o **actualizar** lecciones en `1/<Materia>/*.md` (web + PDF comparten el mismo archivo).

**Principio:** migración **estructural** — renombrar secciones, mejorar didáctica, acortar títulos. **No** reescribir teoría, reactivos del Reto Final, URLs de vídeo ni respuestas correctas salvo ortografía.

**Piloto de referencia:** `1/Desarrollo_de_Habilidades_del_Pensamiento/01_procesos_basicos.md`

**Código relacionado:** `content/pipeline.js`, `content/section-labels.js`, `content/README.md`, `main.js` (vista web).

---

## 1. Mapa de secciones (v2 → v3)

| Emoji | v2 (legacy) | v3 en el `.md` | Kicker web | Fallback web si H2 genérico |
|-------|-------------|----------------|------------|-----------------------------|
| 🎯 | El Reto | **Título propio del módulo** | Para empezar | ¿Te suena familiar? |
| 💡 | ¿Cómo funciona esto? | **Entiende** | Lo esencial | Así funciona |
| ✍️ | Manos a la obra | **Practica** | Practica esto | Ponlo en acción |
| 🌍 | En tu mundo | **En la vida real** | En tu mundo | En tu día a día |
| 🏁 | Pausa para pensar | **Reflexiona** | Para pensar | Un momento… |
| 📚 | Glosario Maestro | **Palabras clave** | Repaso rápido | Conceptos clave |
| 🌟 | Zona de Descubrimiento | **Explora** | Mira esto | Clips y curiosidades |
| 🏆 | Reto Final | **Pon a prueba** | Pon a prueba | ¿Lo dominas? |
| 🔑 | Respuestas Correctas | **Respuestas** | — | — |

### Reglas de títulos H2

- **Nunca** usar `## 🎯 El reto` — suena a tarea escolar.
- El gancho 🎯 debe ser **propio del módulo** (ej. `## 🎯 Toma el control de tu mente`, `## 🎯 Tu fábrica de ideas`).
- Los **emojis no cambian** (la web colorea tarjetas por emoji).
- Kickers y fallbacks están en `content/section-labels.js`; no duplicar en cada `.md`.

---

## 2. Orden obligatorio de secciones

1. 🎯 Gancho → 2. 💡 Entiende → 3. ✍️ Practica → 4. 🌍 En la vida real → 5. 🏁 Reflexiona → 6. 📚 Palabras clave → 7. 🌟 Explora → 8. 🏆 Pon a prueba → 9. 🔑 Respuestas

---

## 3. 💡 Entiende

- H3 **cortos**, sin paréntesis largos: `### Tu cerebro, el hardware`, `### Entrada, proceso y salida`.
- Conservar analogías, citas `>`, callouts `[!TIP]`, etiquetas `(N)` ligadas al Reto Final.
- No acortar ni “mejorar” reactivos; sí se puede pulir prosa teórica si no cambia el sentido.

### Callouts (`[!TIP]`, `[!NOTE]`, etc.)

Sintaxis GitHub en el `.md` (válida también para PDF):

```markdown
> [!TIP]
> **Recuerda**: …
```

- Preferir **dos líneas** (`> [!TIP]` y luego el texto). `marked` a veces fusiona todo en un solo `<p>`; la web lo corrige igual.
- No dejar `[!TIP]` visible en producción: `main.js` → `enhanceCallouts` quita el tag y muestra cabecera **Consejo** / **Nota** / **Clave** / **Ojo** (`.callout-tip`, etc.).
- Las citas de autor (`> "Texto" — Nombre`) no son callouts; la web las marca como `.wisdom-quote` si aplican las heurísticas.

---

## 4. ✍️ Practica — didáctica (OBLIGATORIO en v3)

### ❌ No hacer

Tabla de 3 columnas con **situación + respuesta + explicación** en la misma fila. Es lectura pasiva; el estudiante no predice ni reflexiona.

### ✅ Hacer

```markdown
## ✍️ Practica

**Objetivo:** …

**Cómo practicar (siempre en este orden):**
1. Lee la situación.
2. Pregúntate: …
3. Recién entonces abre la **clave**.

> [!TIP]
> …

### Ejemplo resuelto — [título corto]

[Tabla o explicación modelo — p. ej. Entrada | Procesamiento | Salida]

**Idea clave:** …

---

### 🔍 Caso 1 — [situación corta]

**Tu turno:** [pregunta abierta; el alumno escribe o piensa antes]

**Clave:** [respuesta breve]

**Por qué importa:** [vida real]

---

(repetir casos 2–8; mínimo 6 casos + 1 ejemplo resuelto)

### Cierra la práctica

[Aplicación personal: diario, tres líneas, etc.]
```

- **Tu turno** siempre **antes** de **Clave**.
- Separar casos con `---` entre bloques.
- Las tablas de **3 columnas** solo para **ejemplo resuelto** o comparaciones modelo — **no** como sustituto de los casos 🔍 con clave explícita en el `.md`.
- En web, `main.js` envuelve `### 🔍 Caso` en `.practica-caso` (stepper **Anterior/Siguiente**, un caso visible); **Clave** y **Por qué** ocultos hasta **Ver clave**; el `.md` sigue completo para PDF.

### Vista web — Practica (tablas y claves)

Si el módulo aún usa una tabla legacy `| Situación | Clasificación | Impacto |` dentro de **Practica**:

| Columna | Rol en `.md` | En web |
|---------|----------------|--------|
| 1 | Situación / enunciado | Visible en la tarjeta |
| 2 | Respuesta / concepto | **Oculta** hasta pulsar **Ver clave** |
| 3 | Por qué importa | **Oculta** junto con la columna 2 |

- `enhanceActivityTables` convierte la tabla en `.scenario-cards` solo en `.study-section--practice`.
- Texto guía encima: *«Piensa tu respuesta antes de abrir cada clave.»*
- Al revelar: desaparece el botón; se muestran etiqueta (`.scenario-card-tag`) + impacto.
- Tablas de **2 columnas** (p. ej. ejemplo resuelto Entrada | Proceso) **no** entran en modo quiz.

**Formato preferido v3:** casos 🔍 (el alumno predice en **Tu turno**; la **Clave** está en el markdown pero la lectura es secuencial, no en tabla).

---

## 5. 🏁 Reflexiona

- Lista **numerada** (`1.` `2.` …), **3 a 6** preguntas abiertas, sin respuesta modelo.
- Conectan el tema con identidad, hábitos, comunidad o futuro — no son reactivos del Reto Final.

### Vista web — Reflexiona (stepper)

- `enhanceReflectPrompts` sustituye el `<ol>` por `.reflect-stepper` cuando hay **≥ 2** ítems.
- **Una pregunta visible** a la vez (no acordeón con todas las preguntas listadas).
- Barra de progreso + «Pregunta *n* de *N*» + **Anterior** / **Siguiente** (última: **Listo**) + puntos para saltar.
- El `.md` sigue siendo lista numerada (PDF y lectura lineal sin JS).

---

## 6. 📚 Palabras clave

- Lista con viñetas: `- **Término**: definición breve y memorable (puede usar comillas o metáfora).`
- Mínimo 4 términos; definiciones en una o dos frases cortas.

### Vista web — Glosario (flashcards)

- `enhanceGlossaryFlashcards` convierte el `<ul>` en `.glossary-deck` cuando hay **≥ 2** entradas con `**Término**:`.
- Cuadrícula de tarjetas: **solo el término** al frente; al tocar, **volteo 3D** con la definición.
- Texto guía: *«Toca cada tarjeta para voltearla y fijar el concepto.»*
- El `.md` no cambia (PDF y lectura lineal siguen siendo lista).

---

## 7. 🌟 Explora

Subdividir con H3 (o lista anidada legacy en materias antiguas):

```markdown
### Datos que sorprenden
- **Dato curioso 1**: …
- **Dato curioso 2**: …

### Clips y casos
- **Título del clip**: Análisis pedagógico 1–2 frases. https://…
(2 YouTube + 2 TikTok)

### Cine y series
- **Título**: Análisis. https://…
(2 YouTube + 2 TikTok)

### Para conversar
Pregunta o consigna para debatir con alguien.
```

### Vídeos (web + PDF)

- Una línea por vídeo: `**Título**: análisis. URL`
- Sin `(TikTok)` redundante en el título si ya está en bloque TikTok.
- No usar solo la URL como título.
- Tras editar lecciones, alinear `00_indice_videos.md` de la materia.
- **En web:** los enlaces de vídeo alimentan el **reproductor al inicio del módulo** (playlist). El análisis se ve en el panel del reproductor al elegir un clip.

### Vista web — Explora (sin repetir clips)

- `enhanceExploreSection` **no** vuelve a listar vídeos dentro de la tarjeta Explora (evita duplicar el reproductor superior).
- Se eliminan bloques «Para ver», «Clips y casos», «Cine y series» y filas `.video-playlist-ref` dentro de Explora.
- Se muestran:
  - Aviso con enlace **Ir al reproductor ↑**
  - **Datos curiosos** en tarjetas (`.explore-facts`)
  - **Para conversar** destacado (`.explore-conversation`)
- El `.md` **no cambia**: PDF y fuente siguen con URLs y análisis completos.

---

### Vista web — Pon a prueba (cuestionario)

- `enhanceQuizChallenge` convierte el `<ol>` de reactivos en `.quiz-challenge` (una pregunta a la vez).
- Opciones **A–D** como botones; **Validar** compara con la clave parseada de **🔑 Respuestas** (`1. B | 2. A | …`).
- **Correcto** → mensaje verde y se habilita **Siguiente**; **incorrecto** → mensaje rojo + contador de intentos (puede cambiar opción y validar de nuevo).
- Al terminar: resumen en pantalla y botón **Ver resultados** (intentos fallidos por pregunta, a la primera, mensaje de mejora). La clave completa queda en un desplegable al final.
- El `.md` no cambia (mismas preguntas y clave para PDF).

---

## 8. Lo que NO se toca al migrar

| Elemento | Regla |
|----------|--------|
| **Pon a prueba** | Preguntas **verbatim** (solo ortografía `¿` `¡` y acentos) |
| **Respuestas** | Clave igual |
| **URLs de vídeo** | Mismos enlaces salvo corrección rota |
| **Etiquetas `(N)`** | Mantener en el `.md`; en web `enhanceQuizTheoryAnchors` marca el párrafo y el reto enlaza desde la pregunta (y en resultados) hacia esa teoría (clic: resaltado amarillo + etiqueta como superíndice) |

---

## 9. Checklist por módulo (agente)

- [ ] 9 secciones v3 con emojis y orden correcto
- [ ] Gancho 🎯 con título **propio** (no «El reto»)
- [ ] H3 cortos en Entiende
- [ ] Callouts `[!TIP]` en dos líneas (sin tag suelto en preview web)
- [ ] Practica con ejemplo resuelto + casos 🔍 (Tu turno → Clave → Por qué); si hay tabla 3 col, solo situación+clave+impacto con sentido pedagógico
- [ ] Reflexiona: lista numerada 3–6 preguntas abiertas
- [ ] Palabras clave: ≥4 términos `**Término**: definición` (web → flashcards)
- [ ] Explora con H3 + 8 vídeos (formato título + análisis)
- [ ] `00_indice_videos.md` alineado si aplica
- [ ] `python3 scripts/audit_modules.py` — módulo PASS
- [ ] `python3 scripts/check_multimedia.py --root 1/<Materia>` — OK
- [ ] `npm run build` si hay cambios que afecten índice web
- [ ] (Opcional) `make web-dev` — Practica: claves ocultas; Reflexiona: stepper; callouts con cabecera

---

## 10. Migración por materia

1. Un módulo piloto → revisión humana.
2. Resto de módulos **uno a uno** (mismo patrón).
3. No mezclar v2 y v3 dentro del mismo archivo.

**DHP:** módulos 01–12 ✅ (completado; referencia QA web).

**Filosofía I:** módulos 01–12 y submódulos ✅ (migración v3 estructural, 2026-05-27).

**Computación Básica I:** módulos 01–13 ✅ (v3 + 104 vídeos tutoriales Microsoft, 2026-05-27). En esta materia, `### Cine y series` lleva **tutoriales en pantalla**, no películas; ver `.agents/subjects/1/Computacion_Basica_I/config.md`.

---

## 11. Referencias cruzadas

- Tono y audiencia: `.agents/standards/general.md`
- Workflow creación: `.agents/instructions/workflow_module_creation.md`
- Quality gate: `.agents/instructions/workflow_quality_gate.md`
- Plataforma web: `.agents/instructions/web_platform_management.md`
- Resumen técnico repo: `content/README.md`
