#!/usr/bin/env python3
"""Quita referencias (N) solo de las opciones A–D en «Pon a prueba» / «Reto Final»."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUIZ_START = re.compile(r"^## 🏆 (?:Pon a prueba|Reto Final)\s*$")
ANSWERS_START = re.compile(r"^## 🔑 (?:Respuestas|Respuestas Correctas)\s*$")
OPTION = re.compile(r"^(\s+- [A-D]\) .+?)\(\d+\)\.?(.*)$")
REF_TAIL = re.compile(r"\(\d+\)\.?\s*$")


def process_file(path: Path) -> int:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    in_quiz = False
    changed = 0
    out: list[str] = []
    for line in lines:
        stripped = line.rstrip("\n")
        if QUIZ_START.match(stripped):
            in_quiz = True
        elif ANSWERS_START.match(stripped):
            in_quiz = False
        if in_quiz and re.match(r"^\s+- [A-D]\)", stripped):
            new = REF_TAIL.sub("", stripped)
            if not new.endswith(".") and not new.endswith("?"):
                new += "."
            if new != stripped:
                changed += 1
            out.append(new + ("\n" if line.endswith("\n") else ""))
        else:
            out.append(line)
    if changed:
        path.write_text("".join(out), encoding="utf-8")
    return changed


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "1"
    total = 0
    for p in sorted(root.rglob("*.md")):
        n = process_file(p)
        if n:
            print(f"  {p.relative_to(ROOT)}: {n} opciones")
            total += n
    print(f"Total: {total} opciones actualizadas")
    return 0


if __name__ == "__main__":
    sys.exit(main())
