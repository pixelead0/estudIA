#!/usr/bin/env python3
"""Restaura texto ### Para conversar desde git HEAD."""

import re
import subprocess
from pathlib import Path

FILO = Path(__file__).resolve().parents[1] / "1" / "Filosofia_I"
ROOT = Path(__file__).resolve().parents[1]


def conversar_from_git(rel: str) -> str:
    out = subprocess.check_output(
        ["git", "show", f"HEAD:{rel}"],
        cwd=ROOT,
        text=True,
    )
    m = re.search(r"^- \*\*Para conversar\*\*:\s*(.+)$", out, re.MULTILINE)
    return m.group(1).strip() if m else ""


def main() -> None:
    for path in sorted(FILO.glob("*.md")):
        if not re.match(r"^\d", path.name):
            continue
        rel = path.relative_to(ROOT).as_posix()
        text = conversar_from_git(rel)
        if not text:
            continue
        content = path.read_text(encoding="utf-8")
        content = re.sub(
            r"(### Para conversar\n\n)(?:### Para conversar\n\n)*",
            rf"\1{text}\n\n",
            content,
        )
        path.write_text(content, encoding="utf-8")
        print(path.name)


if __name__ == "__main__":
    main()
