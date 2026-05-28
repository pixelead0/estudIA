#!/usr/bin/env python3
"""Migración estructural Filosofía I v2 → v3 (sin tocar reactivos ni URLs)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILO = ROOT / "1" / "Filosofia_I"

GANCHO_BY_STEM = {
    "01_quien_decide": "¿Quién decide por ti?",
    "02.01_etica_moral": "Lo que está bien y lo que no",
    "02.02_socrates_ciencias": "El maestro de la verdad",
    "03.01_doctrinas_eticas": "Grandes ideas para vivir mejor",
    "03.02_historia_moral": "Las reglas han cambiado",
    "04.01_familia_parentesco": "El equipo original",
    "04.02_equidad_violencia": "Vivir con dignidad",
    "05.01_acto_moral": "El piloto de tu vida",
    "05.02_libertad_dilemas": "¿Soy realmente libre?",
    "06_internet_valores": "El futuro y el planeta",
    "07.01_axiologia_valores": "¿Qué es valioso para ti?",
    "07.02_objetivismo_subjetivismo": "¿De quién es la verdad?",
    "08_prioridades_valores": "Mi edificio de valores",
    "09_todos_iguales": "Todos somos iguales",
    "10_quien_soy": "¿Quién soy yo?",
    "11_mi_casa": "Mi casa y mi orgullo",
    "12_mi_plan_de_vida": "Mi plan de vida",
}

PRACTICA_INTRO_DEFAULT = """**Objetivo:** Aplicar lo del módulo en situaciones reales — no memorizar etiquetas.

**Cómo practicar (siempre en este orden):**

1. Lee la situación.
2. Pregúntate qué concepto o postura encaja mejor.
3. Recién entonces abre la **clave** y compara con tu idea.

> [!TIP]
> No busques la respuesta “perfecta” a la primera. El aprendizaje está en **acertar, dudar o corregirte**.
"""

PRACTICA_INTRO_MITO = """**Objetivo:** Clasificar situaciones como Mito, Magia o Logos antes de ver la clave.

**Cómo practicar (siempre en este orden):**

1. Lee la situación.
2. Pregúntate: ¿es **mito**, **magia** o **logos**?
3. Recién entonces abre la **clave** y compara.

> [!TIP]
> No busques la etiqueta “perfecta” a la primera. El aprendizaje está en **acertar, dudar o corregirte**.
"""

PRACTICA_INTRO_WORKSHEET = """**Objetivo:** Ordenar tus prioridades con honestidad — no copiar la lista de otro.

**Cómo practicar (siempre en este orden):**

1. Lee cada valor.
2. Asigna un nivel del 1 (más importante) al 4 (importante, pero no vital).
3. Escribe **por qué** antes de comparar con un compañero o en clase.

> [!TIP]
> No hay una sola respuesta correcta: lo que importa es que puedas **defender** tu orden con razones.
"""


def strip_md_bold(cell: str) -> str:
    return re.sub(r"\*\*([^*]+)\*\*", r"\1", cell.strip())


def parse_table_rows(table_text: str) -> list[list[str]]:
    rows = []
    for line in table_text.splitlines():
        line = line.strip()
        if not line.startswith("|") or re.match(r"^\|\s*:?-+", line):
            continue
        cells = [c.strip() for c in line.strip("|").split("|")]
        if len(cells) < 2:
            continue
        if all(re.match(r"^:?-+:?$", c.replace(" ", "")) for c in cells):
            continue
        rows.append(cells)
    if len(rows) <= 1:
        return []
    return rows[1:]  # skip header


def short_title_from_situation(sit: str, max_len: int = 48) -> str:
    s = strip_md_bold(sit)
    s = s.strip('"“”')
    if len(s) <= max_len:
        return s
    return s[: max_len - 1].rstrip() + "…"


def rows_to_casos(rows: list[list[str]], worksheet: bool = False) -> str:
    blocks = []
    for i, cells in enumerate(rows, 1):
        sit = cells[0] if cells else ""
        if not sit or sit.startswith(":"):
            continue
        title = short_title_from_situation(sit)
        if worksheet:
            tu_turno = f"¿Qué nivel del 1 al 4 le darías a **{strip_md_bold(sit)}**? Escríbelo y una razón breve."
            clave = "(Reflexión personal — compara en clase o con alguien de confianza.)"
            porque = (
                cells[2].strip()
                if len(cells) > 2 and cells[2].strip()
                else "Ordenar valores te ayuda a decidir cuando dos cosas importantes chocan."
            )
        elif len(cells) >= 4:
            tu_turno = f"Analiza la situación: ¿qué motivo, medio y resultado identificas?"
            clave = f"**Motivo:** {cells[1].strip()} · **Medio:** {cells[2].strip()} · **Resultado:** {cells[3].strip()}"
            porque = "Descomponer el acto moral evita confundir buenas intenciones con buenos resultados."
        elif len(cells) >= 3:
            col2, col3 = cells[1].strip(), cells[2].strip()
            if not col2 and not col3:
                tu_turno = f"¿Qué nivel (1–4) y por qué le pondrías a **{strip_md_bold(sit)}**?"
                clave = "(Reflexión personal — no hay una sola respuesta correcta.)"
                porque = "Tu jerarquía de valores guía decisiones cuando todo parece urgente."
            else:
                tu_turno = "¿Qué concepto o postura encaja mejor? Escríbelo antes de abrir la clave."
                clave = col2
                porque = col3
        else:
            continue

        blocks.append(
            f"""### 🔍 Caso {i} — {title}

**Tu turno:** {tu_turno}

**Clave:** {clave}

**Por qué importa:** {porque}

---
"""
        )
    return "\n".join(blocks)


def convert_practica_section(section: str, stem: str) -> str:
    intro_match = re.search(
        r"(## ✍️[^\n]*\n\n)(.*?)(\n\n\|)",
        section,
        re.DOTALL,
    )
    if not intro_match:
        return section.replace("## ✍️ Manos a la obra", "## ✍️ Practica")

    old_intro = intro_match.group(2).strip()
    table_match = re.search(r"(\|[^\n]+\|\n\|[^\n]+\|\n(?:\|[^\n]+\|\n?)+)", section)
    if not table_match:
        return section.replace("## ✍️ Manos a la obra", "## ✍️ Practica")

    table_text = table_match.group(1)
    rows = parse_table_rows(table_text)
    worksheet = stem == "08_prioridades_valores" or any(
        len(r) > 1 and not (r[1].strip() if len(r) > 1 else "") for r in rows
    ) and stem == "08_prioridades_valores"

    if stem == "01_quien_decide":
        intro = PRACTICA_INTRO_MITO
    elif stem == "08_prioridades_valores":
        intro = PRACTICA_INTRO_WORKSHEET
        worksheet = True
    else:
        intro = PRACTICA_INTRO_DEFAULT
        if old_intro and "Objetivo" not in old_intro:
            intro = intro + "\n" + old_intro + "\n"

    casos = rows_to_casos(rows, worksheet=worksheet)
    rest = section[table_match.end() :].lstrip("\n")
    return f"## ✍️ Practica\n\n{intro}\n\n{casos}\n{rest}"


def convert_explora_section(content: str) -> str:
    m = re.search(
        r"## 🌟 Zona de Descubrimiento\n\n(.*?)(?=\n## 🏆|\Z)",
        content,
        re.DOTALL,
    )
    if not m:
        return content

    body = m.group(1)
    datos = []
    clips = []
    cine = []
    conversar = ""

    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("- **Dato curioso"):
            datos.append(stripped)
        elif "Para conversar" in stripped:
            conversar = re.sub(r"^- \*\*Para conversar\*\*:\s*", "", stripped)
        elif re.match(r"^- \*\*🎥", stripped) or (
            stripped.startswith("- **") and "tiktok.com" in stripped.lower() and len(cine) < 2
        ):
            if stripped.startswith("- **🎥"):
                continue
            clips.append(stripped)
        elif stripped.startswith("- **🎬"):
            continue
        elif stripped.startswith("- **") and ("youtube.com" in stripped or "tiktok.com" in stripped):
            if len(clips) < 4:
                clips.append(stripped)
            else:
                cine.append(stripped)

    # Re-parse nested lists under 🎥 and 🎬 blocks
    clips_block = re.search(
        r"- \*\*🎥 Para ver.*?\*\*:\s*\n((?:\s+- .+\n)+)",
        body,
        re.DOTALL | re.IGNORECASE,
    )
    if clips_block:
        clips = [ln.strip() for ln in clips_block.group(1).splitlines() if ln.strip().startswith("-")]

    cine_block = re.search(
        r"- \*\*🎬 Para ver.*?\*\*:\s*\n((?:\s+- .+\n)+)",
        body,
        re.DOTALL | re.IGNORECASE,
    )
    if cine_block:
        cine = [ln.strip() for ln in cine_block.group(1).splitlines() if ln.strip().startswith("-")]

    if not conversar:
        conv_m = re.search(r"^- \*\*Para conversar\*\*:\s*(.+)$", body, re.MULTILINE)
        if conv_m:
            conversar = conv_m.group(1).strip()

    new_explora = "## 🌟 Explora\n\n### Datos que sorprenden\n\n"
    new_explora += "\n".join(datos) + "\n\n### Clips y casos\n\n"
    new_explora += "\n".join(clips) + "\n\n### Cine y series\n\n"
    new_explora += "\n".join(cine) + "\n\n### Para conversar\n\n"
    new_explora += conversar + "\n\n"

    return content[: m.start()] + new_explora + content[m.end() :]


def migrate_file(path: Path) -> None:
    stem = path.stem
    text = path.read_text(encoding="utf-8")
    gancho = GANCHO_BY_STEM.get(stem, stem.replace("_", " ").title())

    text = re.sub(
        r"^## 🎯 El Reto\s*$",
        f"## 🎯 {gancho}",
        text,
        count=1,
        flags=re.MULTILINE,
    )
    text = text.replace("## 💡 ¿Cómo funciona esto?", "## 💡 Entiende")
    text = text.replace("## 🌍 En tu mundo", "## 🌍 En la vida real")
    text = text.replace("## 🏁 Pausa para pensar", "## 🏁 Reflexiona")
    text = text.replace("## 📚 Glosario Maestro", "## 📚 Palabras clave")
    text = text.replace("## 🏆 Reto Final", "## 🏆 Pon a prueba")
    text = text.replace("## 🔑 Respuestas Correctas", "## 🔑 Respuestas")

    text = re.sub(r"^### \d+\.\s+", "### ", text, flags=re.MULTILINE)

    practica_m = re.search(
        r"## ✍️ Manos a la obra.*?(?=\n## 🌍|\n## 🏁|\Z)",
        text,
        re.DOTALL,
    )
    if practica_m:
        new_pr = convert_practica_section(practica_m.group(0), stem)
        text = text[: practica_m.start()] + new_pr + text[practica_m.end() :]

    text = convert_explora_section(text)
    path.write_text(text, encoding="utf-8")
    print(f"OK {path.name}")


def main() -> None:
    files = sorted(
        p
        for p in FILO.glob("*.md")
        if re.match(r"^\d", p.name) and not p.name.startswith("00_")
    )
    for path in files:
        migrate_file(path)
    print(f"Migrados {len(files)} módulos.")


if __name__ == "__main__":
    main()
