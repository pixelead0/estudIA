#!/usr/bin/env python3
"""Inserta vídeos tutoriales (Premium 2.0) en Explora de Computación Básica I."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from computacion_video_data import VIDEOS  # noqa: E402

CBI = ROOT / "1" / "Computacion_Basica_I"


def format_bullets(items: list[tuple[str, str, str]]) -> str:
    lines = []
    for title, reflection, url in items:
        lines.append(f"    - **{title}**: {reflection} {url}")
    return "\n".join(lines)


def apply_to_file(path: Path, mod: str) -> None:
    data = VIDEOS[mod]
    text = path.read_text(encoding="utf-8")

    clips = format_bullets(data["clips"])
    cine = format_bullets(data["cine"])

    text = re.sub(
        r"(### Clips y casos\n\n)(?:<!-- videos -->|.*?)(\n\n### Cine y series)",
        rf"\1{clips}\2",
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r"(### Cine y series\n\n)(?:<!-- videos -->|.*?)(\n\n### Para conversar)",
        rf"\1{cine}\2",
        text,
        count=1,
        flags=re.DOTALL,
    )
    path.write_text(text, encoding="utf-8")
    print(f"Videos OK {path.name}")


def main() -> None:
    for path in sorted(CBI.glob("[0-9][0-9]_*.md")):
        mod = path.name[:2]
        if mod in VIDEOS:
            apply_to_file(path, mod)


if __name__ == "__main__":
    main()
