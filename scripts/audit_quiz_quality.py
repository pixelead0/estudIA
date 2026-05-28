#!/usr/bin/env python3
"""
Flags quiz quality issues in «Pon a prueba» / «Reto Final» — read-only, no rewrites.

Checks per module:
  - (N) references in A–D options
  - Silly / joke distractor patterns
  - Generic shuffle-style phrases («Para una consecuencia…», reserva-, etc.)
  - Answer key: >50% one letter, or 3+ identical letters in a row

Usage:
  python3 scripts/audit_quiz_quality.py
  python3 scripts/audit_quiz_quality.py 1/
  python3 scripts/audit_quiz_quality.py --root 1/Filosofia_I
"""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

QUIZ_START = re.compile(r"^## 🏆 (?:Pon a prueba|Reto Final)\s*$", re.M)
ANSWERS_START = re.compile(r"^## 🔑 (?:Respuestas|Respuestas Correctas)\s*$", re.M)
OPTION_RE = re.compile(r"^\s+-\s+([A-D])\)\s*(.+)$")
REF_IN_OPTION = re.compile(r"\(\d+\)")
KEY_RE = re.compile(r"(\d+)\s*[.)]\s*([A-D])\b", re.I)

SILLY_RE = re.compile(
    r"|".join(
        [
            r"sin que hagas nada",
            r"no tiene ninguna ventaja",
            r"eran mejores",
            r"gritar más",
            r"se va a borrar sola",
            r"más bonita y especial",
            r"dibujos decorativos",
            r"video musical",
            r"no terminaste la tarea",
            r"chip de computadora",
            r"todo lo que vivimos es en realidad una mentira",
            r"funciona conectado a Internet todo el día",
            r"valores son eléctricos",
            r"cambian de humor",
            r"nombre del detective",
            r"para respirar mejor antes de un examen",
            r"neuronas se apagan",
            r"limpiar el polvo",
            r"limpiar la pantalla táctil",
            r"inventar mejores excusas",
            r"hacer siempre lo que nosotros queremos",
            r"físicamente está construido con cables",
            r"se rompe si caminamos",
            r"lista de precios",
            r"regla del ejército",
            r"más grande físicamente",
            r"se puede comprar",
            r"traducida automáticamente de otro idioma",
            r"únicamente la tecla Esc",
            r"Ctrl \+ Alt \+ Suprimir",
            r"olvidar intencionalmente",
            r"mentira que usamos",
            r"repetir de memoria lo que dice un libro",
            r"dejar de pensar y rendirnos",
            r"opinión que no tiene ninguna relación",
            r"satélite que nos vigila",
            r"resfriado que le da",
            r"videos se vean más bonitos",
            r"películas gratis sin que salgan",
            r"virus.*apagar",
            r"Batman,\s*Superman",
            r"Spiderman",
            r"Son exactamente lo mismo",
            r"Para nada\.",
        ]
    ),
    re.I,
)

GENERIC_RE = re.compile(
    r"|".join(
        [
            r"reserva-",
            r"Para una consecuencia secundaria",
            r"Para una interpretación coloquial del término",
            r"Para un concepto cercano que se aplica en otro tipo de problema",
            r"Para confundir el término con una herramienta distinta",
            r"Para un uso parcial del concepto que omite",
            r"Para una práctica habitual pero incorrecta según la definición del módulo",
        ]
    ),
    re.I,
)

DEFAULT_ROOTS = [
    "1/Computacion_Basica_I",
    "1/Desarrollo_de_Habilidades_del_Pensamiento",
    "1/Filosofia_I",
]


def lesson_files(root: Path) -> list[Path]:
    if root.is_file() and root.suffix == ".md":
        return [root]
    skip_prefix = ("00_",)
    files = sorted(root.rglob("*.md") if root.is_dir() else [])
    out: list[Path] = []
    for f in files:
        if any(f.name.startswith(p) for p in skip_prefix):
            continue
        out.append(f)
    return out


def extract_quiz_block(text: str) -> tuple[str, str] | tuple[None, None]:
    m_q = QUIZ_START.search(text)
    if not m_q:
        return None, None
    m_a = ANSWERS_START.search(text, m_q.end())
    if not m_a:
        return None, None
    return text[m_q.end() : m_a.start()], text[m_a.start() :]


def parse_key(key_block: str) -> dict[int, str]:
    key: dict[int, str] = {}
    for line in key_block.splitlines():
        for m in KEY_RE.finditer(line):
            key[int(m.group(1))] = m.group(2).upper()
    return key


def audit_file(path: Path) -> dict | None:
    text = path.read_text(encoding="utf-8")
    quiz, key_block = extract_quiz_block(text)
    if quiz is None:
        return None

    flags: list[str] = []
    q_num = 0

    for i, line in enumerate(quiz.splitlines(), start=1):
        stripped = line.strip()
        qm = re.match(r"^(\d+)\.\s+", stripped)
        if qm:
            q_num = int(qm.group(1))
        om = OPTION_RE.match(line)
        if not om:
            continue
        letter, body = om.group(1), om.group(2).strip()
        if REF_IN_OPTION.search(body):
            flags.append(f"L{i} P{q_num} {letter}: (N) en opción")
        if SILLY_RE.search(body):
            snippet = body[:65] + ("…" if len(body) > 65 else "")
            flags.append(f"L{i} P{q_num} {letter}: distractor obvio — {snippet}")
        if GENERIC_RE.search(body):
            snippet = body[:65] + ("…" if len(body) > 65 else "")
            flags.append(f"L{i} P{q_num} {letter}: plantilla genérica — {snippet}")

    key = parse_key(key_block)
    if key:
        letters = [key[i] for i in sorted(key)]
        n = len(letters)
        counts = Counter(letters)
        dominant, dom_n = counts.most_common(1)[0]
        if dom_n / n > 0.5:
            flags.append(f"Clave: {dominant} en {dom_n}/{n} ({100 * dom_n // n}%) — >50%")
        streak = 1
        max_streak = 1
        prev = letters[0]
        for letter in letters[1:]:
            if letter == prev:
                streak += 1
                max_streak = max(max_streak, streak)
            else:
                streak = 1
            prev = letter
        if max_streak >= 3:
            flags.append(f"Clave: racha de {max_streak} letras {prev} seguidas")

    return {
        "file": str(path.relative_to(ROOT)),
        "flags": flags,
        "ok": len(flags) == 0,
        "questions": len(key),
    }


def resolve_roots(args: argparse.Namespace) -> list[Path]:
    if args.paths:
        return [ROOT / p for p in args.paths]
    return [ROOT / r for r in args.root]


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit Pon a prueba quality (flags only).")
    parser.add_argument(
        "paths",
        nargs="*",
        help="Carpeta o archivo .md (ej. 1/ o 1/Filosofia_I)",
    )
    parser.add_argument(
        "--root",
        action="append",
        dest="roots",
        help="Materia(s) bajo el repo (por defecto: las tres de 1/)",
    )
    args = parser.parse_args()
    args.root = args.roots if args.roots else DEFAULT_ROOTS

    all_results: list[dict] = []
    no_quiz = 0

    for root in resolve_roots(args):
        if not root.exists():
            print(f"SKIP missing: {root.relative_to(ROOT)}", file=sys.stderr)
            continue
        for path in lesson_files(root):
            result = audit_file(path)
            if result is None:
                no_quiz += 1
                continue
            all_results.append(result)

    failed = [r for r in all_results if not r["ok"]]
    passed = [r for r in all_results if r["ok"]]

    print("# Auditoría de calidad — Pon a prueba (solo lectura)\n")
    print(
        f"Módulos con cuestionario: {len(all_results)} · "
        f"sin bloque quiz: {no_quiz} · "
        f"OK: {len(passed)} · "
        f"con flags: {len(failed)}\n"
    )

    for r in sorted(failed, key=lambda x: x["file"]):
        print(f"## {r['file']} ({r.get('questions', '?')} preguntas)\n")
        for flag in r["flags"]:
            print(f"- {flag}")
        print()

    if not failed and passed:
        print("✅ Sin flags en los módulos revisados.\n")
        for r in sorted(passed, key=lambda x: x["file"]):
            print(f"  PASS  {r['file']} ({r.get('questions', '?')} q)")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
