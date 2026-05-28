#!/usr/bin/env python3
"""Repara sección Explora v3 en módulos Filosofía I (dedupe vídeos)."""

from __future__ import annotations

import re
from pathlib import Path

FILO = Path(__file__).resolve().parents[1] / "1" / "Filosofia_I"


def fix_explora(content: str) -> str:
    m = re.search(
        r"## 🌟 Explora\n\n(.*?)(?=\n## 🏆|\Z)",
        content,
        re.DOTALL,
    )
    if not m:
        return content

    body = m.group(1)
    datos = []
    video_lines = []
    conversar = ""

    for line in body.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("- **Dato curioso"):
            datos.append(s)
        elif "Para conversar" in s:
            conversar = re.sub(r"^- \*\*Para conversar\*\*:\s*", "", s)
        elif re.search(r"https?://", s) and s.startswith("-") and "🎥" not in s and "🎬" not in s:
            video_lines.append(s)

    seen_urls: set[str] = set()
    unique_videos: list[str] = []
    for line in video_lines:
        url_m = re.search(r"https?://\S+", line)
        if not url_m:
            continue
        url = url_m.group(0).rstrip(").,]")
        if url in seen_urls:
            continue
        seen_urls.add(url)
        unique_videos.append(line)

    clips = unique_videos[:4]
    cine = unique_videos[4:8]

    new_body = "### Datos que sorprenden\n\n" + "\n".join(datos) + "\n\n"
    new_body += "### Clips y casos\n\n" + "\n".join(clips) + "\n\n"
    new_body += "### Cine y series\n\n" + "\n".join(cine) + "\n\n"
    new_body += "### Para conversar\n\n" + conversar + "\n\n"

    return content[: m.start()] + "## 🌟 Explora\n\n" + new_body + content[m.end() :]


def main() -> None:
    for path in sorted(FILO.glob("*.md")):
        if not re.match(r"^\d", path.name):
            continue
        text = path.read_text(encoding="utf-8")
        fixed = fix_explora(text)
        if fixed != text:
            path.write_text(fixed, encoding="utf-8")
            print(f"fixed {path.name}")


if __name__ == "__main__":
    main()
