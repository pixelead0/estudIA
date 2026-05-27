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
- Las tablas solo para **ejemplo resuelto** o comparaciones, no para listar respuestas.
- En web, `main.js` envuelve `### 🔍 Caso` en `.practica-caso` y el ejemplo en `.practica-ejemplo`.

---

## 5. 🌟 Explora

Subdividir con H3:

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

---

## 6. Lo que NO se toca al migrar

| Elemento | Regla |
|----------|--------|
| **Pon a prueba** | Preguntas **verbatim** (solo ortografía `¿` `¡` y acentos) |
| **Respuestas** | Clave igual |
| **URLs de vídeo** | Mismos enlaces salvo corrección rota |
| **Etiquetas `(N)`** | Mantener vínculo teoría ↔ reactivo |

---

## 7. Checklist por módulo (agente)

- [ ] 9 secciones v3 con emojis y orden correcto
- [ ] Gancho 🎯 con título **propio** (no «El reto»)
- [ ] H3 cortos en Entiende
- [ ] Practica con ejemplo resuelto + casos 🔍 (Tu turno → Clave → Por qué)
- [ ] Explora con H3 + 8 vídeos (formato título + análisis)
- [ ] `00_indice_videos.md` alineado si aplica
- [ ] `python3 scripts/audit_modules.py` — módulo PASS
- [ ] `python3 scripts/check_multimedia.py --root 1/<Materia>` — OK
- [ ] `npm run build` si hay cambios que afecten índice web

---

## 8. Migración por materia

1. Un módulo piloto → revisión humana.
2. Resto de módulos **uno a uno** (mismo patrón).
3. No mezclar v2 y v3 dentro del mismo archivo.

**DHP:** módulo 01 ✅ — continuar 02–12.

---

## 9. Referencias cruzadas

- Tono y audiencia: `.agents/standards/general.md`
- Workflow creación: `.agents/instructions/workflow_module_creation.md`
- Quality gate: `.agents/instructions/workflow_quality_gate.md`
- Plataforma web: `.agents/instructions/web_platform_management.md`
- Resumen técnico repo: `content/README.md`
