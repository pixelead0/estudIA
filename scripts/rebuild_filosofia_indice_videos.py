#!/usr/bin/env python3
"""
Regenera `1/Filosofia_I/00_indice_videos.md` a partir del bloque
«## 🌟 Zona de Descubrimiento» de cada lección (NN / NN.MM).
"""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
FILO = REPO / "1" / "Filosofia_I"
OUT = FILO / "00_indice_videos.md"

HEADER = {
    "01_quien_decide": "Módulo 01 · Quien Decide",
    "02.01_etica_moral": "Módulo 02.01 · Etica Moral",
    "02.02_socrates_ciencias": "Módulo 02.02 · Socrates Ciencias",
    "03.01_doctrinas_eticas": "Módulo 03.01 · Doctrinas Eticas",
    "03.02_historia_moral": "Módulo 03.02 · Historia Moral",
    "04.01_familia_parentesco": "Módulo 04.01 · Familia Parentesco",
    "04.02_equidad_violencia": "Módulo 04.02 · Equidad Violencia",
    "05.01_acto_moral": "Módulo 05.01 · Acto Moral",
    "05.02_libertad_dilemas": "Módulo 05.02 · Libertad Dilemas",
    "06_internet_valores": "Módulo 06 · Internet Valores",
    "07.01_axiologia_valores": "Módulo 07.01 · Axiologia Valores",
    "07.02_objetivismo_subjetivismo": "Módulo 07.02 · Objetivismo Subjetivismo",
    "08_prioridades_valores": "Módulo 08 · Prioridades Valores",
    "09_todos_iguales": "Módulo 09 · Todos Iguales",
    "10_quien_soy": "Módulo 10 · Quien Soy",
    "11_mi_casa": "Módulo 11 · Mi Casa",
    "12_mi_plan_de_vida": "Módulo 12 · Mi Plan De Vida",
}

URL_RE = re.compile(r"https?://[^\s\)]+")
BULLET_RE = re.compile(r"^\s*-\s*\*\*(.+?)\*\*:\s*(.+)\s*$")


def lesson_paths() -> list[Path]:
    ps = [
        p
        for p in FILO.glob("*.md")
        if not p.name.startswith("00_")
        and re.match(r"^(?!00)(\d{2})(?:\.\d{2})?_.+\.md$", p.name)
    ]

    def keyfn(p: Path) -> tuple[tuple[int, ...], str]:
        nums = tuple(int(x) for x in re.findall(r"\d+", p.stem))
        return (nums, p.name)

    return sorted(ps, key=keyfn)


def discover_rows(text: str) -> list[tuple[str, str, str]]:
    anchor = "## 🌟 Zona de Descubrimiento"
    if anchor not in text:
        return []
    i = text.index(anchor)
    sub = text[i:]
    cut = len(sub)
    for em in ("\n## 🏆", "\n## 📚", "\n## 🔑", "\n## 🏁"):
        k = sub.find(em)
        if k != -1:
            cut = min(cut, k)
    blob = sub[:cut]
    rows: list[tuple[str, str, str]] = []
    for ln in blob.splitlines():
        m = BULLET_RE.match(ln)
        if not m or "http" not in ln:
            continue
        title = m.group(1).strip()
        rest = m.group(2)
        um = URL_RE.search(rest)
        if not um:
            continue
        url = um.group(0).rstrip(").,;]")
        desc = rest[: um.start()].strip().rstrip("-–—: ")
        rows.append((title, desc, url))
    return rows


def fmt_entry(title: str, desc: str, url: str) -> str:
    if "tiktok.com" in url:
        u = url.split("?")[0]
    elif "youtube.com" in url or "youtu.be" in url:
        u = url
    if "tiktok.com" in u:
        kind = "🎵 **TikTok**"
    elif "youtube.com" in u or "youtu.be" in u:
        kind = "▶️ **YouTube**"
    else:
        kind = "🔗 **Web**"
    lines = [f"### {title}", f"{kind} &nbsp; [{title}]({u})"]
    if desc:
        lines.append(f"> {desc}")
    return "\n".join(lines)


def main() -> None:
    parts: list[str] = [
        "# 🎬 Índice de Multimedia",
        "## Filosofia I",
        "",
        "> Generado desde el bloque «Zona de Descubrimiento» de cada lección.",
        "> Estándar **2+2 YouTube + TikTok** por archivo (más sección de cine).",
        "",
    ]
    for p in lesson_paths():
        stem = p.stem
        h = HEADER.get(stem)
        if not h:
            raise SystemExit(f"No hay encabezado de módulo para {p.name}")
        parts.append(f"## {h}")
        parts.append("")
        for title, desc, url in discover_rows(p.read_text(encoding="utf-8")):
            parts.append(fmt_entry(title, desc, url))
            parts.append("")
        parts.append("---")
        parts.append("")
    OUT.write_text("\n".join(parts).rstrip() + "\n", encoding="utf-8")
    print(f"Escrito {OUT.relative_to(REPO)}")


if __name__ == "__main__":
    main()
