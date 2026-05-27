# Biblioteca de Prompts: Plantillas de Módulo (Versión Simple)

Usa estas plantillas para estructurar cada sección del archivo Markdown con un lenguaje accesible.

## Prompt A: Gancho inicial (🎯)
"Actúa como mentor. Crea un **título propio y atractivo** para el gancho (no uses «El reto»). Situación cotidiana que despierte curiosidad en un joven de 14 años. Ver `.agents/instructions/module_schema_v3.md` §1."

## Prompt B: Explicación (💡 Entiende)
"Explica [CONCEPTO] con analogía de vida diaria, H3 cortos, citas `>`, etiquetas `(N)` hacia el Reto Final."

## Prompt C: Practica didáctica (✍️)
"Diseña: objetivo + 3 pasos; **un ejemplo resuelto**; 6–8 casos `### 🔍 Caso N` con **Tu turno** (predicción), **Clave**, **Por qué importa**. **No** uses tabla situación+respuesta en la misma fila. Plantilla: `module_schema_v3.md` §4."

## Prompt D: Reflexiona (🏁)
"3–6 preguntas abiertas en lista numerada (`1.` `2.` …), sin respuesta modelo. Conectan el tema con identidad, hábitos o comunidad. En web se muestran en stepper (una a la vez)."

## Prompt E: Explora (🌟)
"Datos curiosos + 8 vídeos (2+2 YT/TT clips, 2+2 cine) con `**Título**: análisis. URL` + Para conversar."

## Prompt F: Pon a prueba (🏆)
"Reactivos verbatim de la guía; solo corregir ortografía (¿ ¡ acentos). Mínimo 6."

## Estructura maestra (v3)
```markdown
## 🎯 [Gancho propio del módulo]

## 💡 Entiende
### [Subtema corto]
…

## ✍️ Practica
**Objetivo:** …
**Cómo practicar:** 1. … 2. … 3. …
### Ejemplo resuelto — …
### 🔍 Caso 1 — …
**Tu turno:** …
**Clave:** …
**Por qué importa:** …
---

## 🌍 En la vida real
…

## 🏁 Reflexiona
1. …

## 📚 Palabras clave
- **Término**: …

## 🌟 Explora
### Datos que sorprenden
### Clips y casos
### Cine y series
### Para conversar

## 🏆 Pon a prueba
1. …

## 🔑 Respuestas
1. X | 2. Y | …
```
