#!/usr/bin/env python3
"""Migración estructural Computación Básica I v2 → v3 (sin tocar reactivos ni URLs de vídeo)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CBI = ROOT / "1" / "Computacion_Basica_I"

GANCHO_BY_STEM = {
    "01_hardware_software": "Tu cocina digital",
    "02_entorno_so": "Toma el control del escritorio",
    "03_gestion_archivos": "Ordena tu mundo digital",
    "04_fundamentos_red": "Navega con seguridad",
    "05_busqueda_informacion": "Encuentra la verdad en la red",
    "06_comunicacion_digital": "Habla bien en la red",
    "07_procesador_textos_inicio": "Arquitecto de palabras",
    "08_diseno_pagina": "Diseña páginas que se lean solas",
    "09_objetos_tablas": "Tablas, imágenes y diagramas",
    "10_presentaciones_inicio": "Cuenta tu historia en diapositivas",
    "11_animaciones_transiciones": "Dale movimiento a tus ideas",
    "12_interactividad": "Presentaciones que responden",
    "13_proyecto_final": "Tu proyecto integrador",
}

PRACTICA_INTRO = """**Objetivo:** Aplicar la herramienta o el concepto del módulo en situaciones reales — no memorizar definiciones.

**Cómo practicar (siempre en este orden):**

1. Lee la situación.
2. Pregúntate qué harías o qué concepto encaja.
3. Recién entonces abre la **clave** y compara.

> [!TIP]
> Imagina que estás frente a la computadora: el aprendizaje está en **decidir antes de mirar la solución**.
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
    return rows[1:]


def short_title_from_situation(sit: str, max_len: int = 48) -> str:
    s = strip_md_bold(sit)
    s = s.strip('"“”')
    if len(s) <= max_len:
        return s
    return s[: max_len - 1].rstrip() + "…"


def rows_to_casos(rows: list[list[str]], stem: str) -> str:
    blocks = []
    for i, cells in enumerate(rows, 1):
        if len(cells) < 3:
            continue
        sit, clave, porque = cells[0], cells[1], cells[2]
        if not sit.strip():
            continue
        title = short_title_from_situation(sit)

        if stem == "07_procesador_textos_inicio":
            tu_turno = (
                f"Sin mirar la tabla: ¿qué atajo o acción usarías para: "
                f"**{strip_md_bold(sit)}**?"
            )
        else:
            tu_turno = (
                "¿Qué respuesta encaja mejor? Escríbela antes de abrir la clave."
            )

        blocks.append(
            f"""### 🔍 Caso {i} — {title}

**Tu turno:** {tu_turno}

**Clave:** {clave.strip()}

**Por qué importa:** {porque.strip()}

---
"""
        )
    return "\n".join(blocks)


def convert_practica_section(section: str, stem: str) -> str:
    if "## ✍️ Practica" in section:
        return section

    table_match = re.search(
        r"(\|[^\n]+\|\n\|[^\n]+\|\n(?:\|[^\n]+\|\n?)+)",
        section,
    )
    if not table_match:
        return section.replace("## ✍️ Manos a la obra", "## ✍️ Practica")

    intro_match = re.search(
        r"(## ✍️[^\n]*\n\n)(.*?)(\n\n\|)",
        section,
        re.DOTALL,
    )
    old_intro = intro_match.group(2).strip() if intro_match else ""
    table_text = table_match.group(1)
    rows = parse_table_rows(table_text)

    intro = PRACTICA_INTRO
    if old_intro and "Objetivo" not in old_intro and not old_intro.startswith("|"):
        intro = intro + "\n" + old_intro + "\n"

    casos = rows_to_casos(rows, stem)
    rest = section[table_match.end() :].lstrip("\n")
    return f"## ✍️ Practica\n\n{intro}\n\n{casos}\n{rest}"


def convert_explora_section(content: str) -> str:
    m = re.search(
        r"## 🌟 (?:Zona de Descubrimiento|Explora)\n\n(.*?)(?=\n## 🏆|\Z)",
        content,
        re.DOTALL,
    )
    if not m:
        return content

    body = m.group(1)
    datos = []
    conversar = ""

    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("- **Dato curioso"):
            datos.append(stripped)
        elif "Para conversar" in stripped:
            conversar = re.sub(r"^- \*\*Para conversar\*\*:\s*", "", stripped)
        elif re.match(r"^- \*\*", stripped) and (
            "youtube.com" in stripped or "tiktok.com" in stripped
        ):
            pass  # keep existing video bullets if any
        elif stripped.startswith("- **Para ver") or stripped.startswith("- **Para explorar"):
            continue

    if not conversar:
        conv_m = re.search(r"^- \*\*Para conversar\*\*:\s*(.+)$", body, re.MULTILINE)
        if conv_m:
            conversar = conv_m.group(1).strip()

    # Preserve existing structured video bullets
    clips = []
    cine = []
    for line in body.splitlines():
        s = line.strip()
        if s.startswith("- **") and ("youtube.com" in s or "tiktok.com" in s):
            if len(clips) < 4:
                clips.append(s)
            elif len(cine) < 4:
                cine.append(s)

    new_explora = "## 🌟 Explora\n\n### Datos que sorprenden\n\n"
    new_explora += "\n".join(datos) + "\n\n### Clips y casos\n\n"
    new_explora += ("\n".join(clips) if clips else "<!-- videos -->") + "\n\n### Cine y series\n\n"
    new_explora += ("\n".join(cine) if cine else "<!-- videos -->") + "\n\n### Para conversar\n\n"
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
        for p in CBI.glob("*.md")
        if re.match(r"^\d{2}_", p.name) and not p.name.startswith("00_")
    )
    for path in files:
        migrate_file(path)
    print(f"Migrados {len(files)} módulos.")


if __name__ == "__main__":
    main()
