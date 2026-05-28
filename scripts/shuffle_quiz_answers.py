#!/usr/bin/env python3
"""
Redistribuye opciones de «Pon a prueba»: claves variadas (A–D) y distractores menos obvios.

Uso:
  python3 scripts/shuffle_quiz_answers.py           # aplica cambios
  python3 scripts/shuffle_quiz_answers.py --dry-run # solo informe
"""

from __future__ import annotations

import argparse
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LETTERS = ("A", "B", "C", "D")

QUIZ_START = re.compile(r"^## 🏆 (?:Pon a prueba|Reto Final)\s*$", re.M)
ANSWERS_START = re.compile(r"^## 🔑 (?:Respuestas|Respuestas Correctas)\s*$", re.M)
QUESTION_RE = re.compile(r"^(\d+)\.\s+(.+)$")
OPTION_RE = re.compile(r"^(\s+)-\s+([A-D])\)\s*(.+)$")
REF_RE = re.compile(r"\((\d+)\)\.?\s*$")
KEY_LINE_RE = re.compile(
    r"^(\d+)\.\s*([A-D])\s*(?:\||$)|(?:^|\|\s*)(\d+)\.\s*([A-D])\b",
    re.I,
)

# Distractores claramente burlones o absurdos
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
        ]
    ),
    re.I,
)


def strip_ref(text: str) -> tuple[str, str | None]:
    body = text.strip()
    ref = None
    while True:
        m = REF_RE.search(body)
        if not m:
            break
        ref = m.group(1)
        body = REF_RE.sub("", body).strip().rstrip(".")
    return body, ref


def parse_answer_key(block: str) -> dict[int, str]:
    key: dict[int, str] = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        for m in re.finditer(r"(\d+)\s*[.)]\s*([A-D])\b", line, re.I):
            key[int(m.group(1))] = m.group(2).upper()
    return key


def is_silly(text: str) -> bool:
    return bool(SILLY_RE.search(text))


def fallback_distractor(question: str, correct: str, salt: int) -> str:
    variants = [
        "Para un concepto cercano que se aplica en otro tipo de problema, no en este.",
        "Para una interpretación coloquial del término que no coincide con la definición del módulo.",
        "Para una consecuencia secundaria del proceso, no su función principal.",
        "Para confundir el término con una herramienta distinta de la misma suite.",
        "Para un uso parcial del concepto que omite la condición clave del enunciado.",
        "Para una práctica habitual pero incorrecta según la definición del módulo.",
    ]
    h = int(hashlib.md5(f"{question}:{correct}:{salt}".encode()).hexdigest(), 16)
    return variants[h % len(variants)]


def improve_distractor(text: str, correct: str, question: str) -> str:
    if not is_silly(text):
        return text
    c = strip_ref(correct)[0]
    q = question.lower()
    t = text.lower()

    if "repetir de memoria" in t:
        return "Para recitar definiciones sin vincularlas con los datos del problema."
    if "olvidar intencionalmente" in t:
        return "Para ignorar datos del enunciado que parecen secundarios."
    if "mentira" in t and "oponente" in t:
        return "Para confundir con afirmaciones que no funcionan como premisas."
    if "rendirnos" in t:
        return "Para cerrar el análisis antes de revisar las premisas disponibles."
    if "gritar más" in t:
        return "Para imponer una idea por la insistencia, no por la lógica del argumento."
    if "dibujos decorativos" in t:
        return "Para insertar viñetas decorativas sin texto en los elementos de la lista."
    if "video musical" in t:
        return "Para incrustar un archivo de audio como fondo del párrafo."
    if "no terminaste la tarea" in t:
        return "Para justificar márgenes irregulares cuando el texto es corto."
    if "sin que hagas nada" in t:
        return "Para generar borradores solo si el documento ya tiene estilos predefinidos."
    if "no tiene ninguna ventaja" in t or "eran mejores" in t:
        return "Para trabajar solo en pantalla, sin posibilidad de revisión posterior."
    if "justificado" in q or "alinee parejo" in c.lower():
        return "Para alinear el texto solo al margen izquierdo, dejando el derecho irregular."
    if "negrita" in q or "resaltar un título" in q:
        return "Para reducir el tamaño de fuente del título hasta que pase desapercibido."
    if "guardar" in q or "ctrl + s" in c.lower():
        if "ctrl \\+ c" in t or "ctrl + c" in t:
            return "Para copiar el formato visual sin copiar el texto seleccionado."
        if "esc" in t or "únicamente la tecla" in t:
            return "Para salir del programa sin que el sistema pregunte si deseas guardar."
        if "ctrl+o" in t.replace(" ", "") or "ctrl+o" in t.lower():
            return "Para abrir un archivo distinto sin guardar los cambios del actual."
        return "Para duplicar el archivo con otro nombre sin sobrescribir el original (Ctrl+O)."
    if "viñeta" in q or "numeración" in q:
        return "Para numerar automáticamente las páginas del documento en el pie de página."
    if "ortografía" in q or "línea roja" in q:
        return "Para marcar palabras que el diccionario sugiere como sinónimos opcionales."
    if "procesador de textos" in q or "máquina de escribir" in q:
        return "Para imprimir en papel sin poder editar el contenido después de imprimir."
    if "memoria ram" in q or "mesa de trabajo" in c.lower():
        return "Para almacenar archivos de forma permanente aunque apagues el equipo."
    if "procesador" in q or "cpu" in q.lower():
        return "Para proyectar la imagen del escritorio en la pantalla con más brillo."
    if "software de aplicación" in c.lower():
        return "Para enfriar el interior del gabinete y evitar sobrecalentamiento."
    if "disco duro" in c.lower() or "ssd" in c.lower():
        return "Para ejecutar programas mientras están abiertos, borrándose al cerrarlos."
    if "sistema operativo" in c.lower():
        return "Para diseñar diapositivas y animaciones en presentaciones."
    if "hardware" in q and "software" in q:
        return "Para encender la pantalla y mostrar el logo del fabricante sin programas instalados."
    if "premisa" in q and "idea final" in t:
        return "Para la conclusión que ya se tenía antes de analizar los datos."
    if "premisa" in q:
        return "Para la conclusión que ya se tenía antes de analizar los datos."
    if "conclusión" in q and "lógica" in q:
        return "Para la opinión personal que no depende de los datos del enunciado."
    if "válido" in q or "válido" in t:
        return "Para que la conclusión suene convincente aunque no siga de las premisas."
    if "jerarquía" in q:
        return "Para un listado de valores sin orden de prioridad entre ellos."
    if "bipolaridad" in q:
        return "Para afirmar que cada valor solo puede ser bueno, nunca tiene polo negativo."
    if "crisis de valores" in q:
        return "Para cuando los valores suben de precio en la economía global."
    if "sinapsis" in q:
        return "Para el espacio entre dos neuronas donde no hay comunicación eléctrica."
    if "neocórtex" in c.lower() or "neocortex" in c.lower():
        return "Para las reacciones automáticas de supervivencia sin planificación."
    if "hemisferio" in q:
        return "Para el hemisferio encargado del arte, la intuición y la creatividad espacial."
    return fallback_distractor(question, correct, hash(text) % 1000)


def balanced_targets(n: int, seed: str) -> list[str]:
    h = int(hashlib.sha256(seed.encode()).hexdigest(), 16)
    pool: list[str] = []
    while len(pool) < n + 8:
        batch = list(LETTERS)
        for i in range(3, 0, -1):
            j = (h >> (i * 2)) & 3
            batch[i], batch[j % 4] = batch[j % 4], batch[i]
            h >>= 2
        pool.extend(batch)
        h ^= h >> 7
    result = pool[:n]

    def bad(seq: list[str]) -> bool:
        if len(seq) < 2:
            return False
        # tres iguales seguidas
        for i in range(len(seq) - 2):
            if seq[i] == seq[i + 1] == seq[i + 2]:
                return True
        # patrón aritmético A-B-C-D repetido
        idx = {L: i for i, L in enumerate(LETTERS)}
        for i in range(len(seq) - 2):
            a, b, c = idx[seq[i]], idx[seq[i + 1]], idx[seq[i + 2]]
            if (b - a) % 4 == 1 and (c - b) % 4 == 1:
                if i + 3 < len(seq) and idx[seq[i + 3]] == (c + 1) % 4:
                    return True
        return False

    for attempt in range(64):
        if not bad(result):
            return result
        result = result[1:] + [result[0]]
        h += attempt
    return result


def parse_questions(quiz_block: str) -> list[dict]:
    lines = quiz_block.splitlines()
    questions: list[dict] = []
    i = 0
    while i < len(lines):
        m = QUESTION_RE.match(lines[i])
        if not m:
            i += 1
            continue
        num = int(m.group(1))
        q_lines = [m.group(2)]
        i += 1
        while i < len(lines) and not QUESTION_RE.match(lines[i]):
            if lines[i].strip():
                q_lines.append(lines[i])
            i += 1
        q_text = q_lines[0].strip()
        options = []
        for ln in q_lines[1:]:
            om = OPTION_RE.match(ln)
            if om:
                body, ref = strip_ref(om.group(3))
                options.append(
                    {
                        "indent": om.group(1),
                        "letter": om.group(2).upper(),
                        "body": body,
                        "ref": ref,
                        "raw": om.group(3).strip(),
                    }
                )
        if len(options) == 4:
            questions.append({"num": num, "text": q_text, "options": options})
    return questions


def find_correct_index(options: list[dict], key_letter: str | None) -> int:
    for i, o in enumerate(options):
        if o["ref"]:
            return i
    if key_letter:
        for i, o in enumerate(options):
            if o["letter"] == key_letter:
                return i
    return 1


def rebuild_question(
    q: dict, target_letter: str, improve: bool, key_letter: str | None
) -> list[str]:
    opts = q["options"]
    correct_i = find_correct_index(opts, key_letter)
    correct = opts[correct_i]
    distractors = [o for j, o in enumerate(opts) if j != correct_i]

    if improve:
        seen_bodies: set[str] = set()
        improved = []
        for d in distractors:
            body = (
                improve_distractor(d["body"], correct["body"], q["text"])
                if is_silly(d["body"])
                else d["body"]
            )
            salt = 0
            while body.lower() in seen_bodies and salt < 6:
                body = fallback_distractor(q["text"], correct["body"], salt)
                salt += 1
            seen_bodies.add(body.lower())
            improved.append({**d, "body": body})
        distractors = improved

    import random

    rng = random.Random(f"{q['num']}-{correct['body'][:20]}")
    rng.shuffle(distractors)

    slots = {L: None for L in LETTERS}
    ref = correct["ref"] or str(q["num"])
    body = correct["body"].rstrip(".")
    slots[target_letter] = f"{body}({ref})."

    other_letters = [L for L in LETTERS if L != target_letter]
    used: set[str] = {body.lower()}
    di = 0
    for letter in other_letters:
        while di < len(distractors):
            b = distractors[di]["body"]
            di += 1
            if b.lower() not in used:
                used.add(b.lower())
                break
        else:
            n = 0
            b = fallback_distractor(q["text"], correct["body"], q["num"] * 10 + n)
            while b.lower() in used and n < 8:
                n += 1
                b = fallback_distractor(q["text"], correct["body"], q["num"] * 10 + n)
            used.add(b.lower())
        if not b.endswith("."):
            b += "."
        slots[letter] = b

    indent = opts[0]["indent"]
    out = [f"{q['num']}. {q['text']}"]
    for L in LETTERS:
        out.append(f"{indent}- {L}) {slots[L]}")
    return out


def format_key_line(keys: dict[int, str]) -> str:
    nums = sorted(keys)
    return " | ".join(f"{n}. {keys[n]}" for n in nums)


def load_source(path: Path, from_git: bool) -> str:
    if from_git:
        import subprocess

        rel = path.relative_to(ROOT)
        try:
            return subprocess.check_output(
                ["git", "show", f"HEAD:{rel}"],
                cwd=ROOT,
                stderr=subprocess.DEVNULL,
            ).decode("utf-8")
        except subprocess.CalledProcessError:
            pass
    return path.read_text(encoding="utf-8")


def process_file(path: Path, dry_run: bool, from_git: bool = False) -> dict:
    text = load_source(path, from_git)
    m_quiz = QUIZ_START.search(text)
    m_ans = ANSWERS_START.search(text)
    if not m_quiz or not m_ans or m_quiz.start() >= m_ans.start():
        return {"path": str(path), "skipped": True}

    before = text[m_quiz.start() : m_ans.start()]
    after = text[m_ans.start() :]
    ans_match = ANSWERS_START.match(after)
    ans_rest = after[ans_match.end() :]
    ans_lines = ans_rest.splitlines()
    key_block = []
    rest_lines = []
    for i, ln in enumerate(ans_lines):
        if re.search(r"\d+\s*[.)]\s*[A-D]", ln, re.I):
            key_block.append(ln)
        elif key_block and not ln.strip():
            rest_lines = ans_lines[i:]
            break
        elif key_block:
            rest_lines = ans_lines[i:]
            break
    if not key_block:
        key_block = [ln for ln in ans_lines if ln.strip() and not ln.startswith("#")][:3]
        rest_lines = ans_lines[len(key_block) :]

    old_key = parse_answer_key("\n".join(key_block))
    questions = parse_questions(before)
    if not questions:
        return {"path": str(path), "skipped": True}

    targets = balanced_targets(len(questions), str(path.relative_to(ROOT)))
    new_keys: dict[int, str] = {}
    header_line = before.splitlines()[0]
    new_quiz_lines = [header_line, ""]
    for q, tgt in zip(questions, targets):
        new_keys[q["num"]] = tgt
        new_quiz_lines.extend(
            rebuild_question(q, tgt, improve=True, key_letter=old_key.get(q["num"]))
        )

    new_quiz = "\n".join(new_quiz_lines) + "\n\n"
    new_key_line = format_key_line(new_keys)
    header = after[: ans_match.end()]
    new_after = header + "\n" + new_key_line + "\n"
    if rest_lines:
        new_after += "\n".join(rest_lines)
        if not new_after.endswith("\n"):
            new_after += "\n"

    new_text = text[: m_quiz.start()] + new_quiz + new_after

    b_before = sum(1 for v in old_key.values() if v == "B")
    b_after = sum(1 for v in new_keys.values() if v == "B")

    if not dry_run:
        path.write_text(new_text, encoding="utf-8")

    return {
        "path": str(path.relative_to(ROOT)),
        "questions": len(questions),
        "keys": "".join(new_keys[i] for i in sorted(new_keys)),
        "b_before": b_before,
        "b_after": b_after,
        "skipped": False,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--root", type=Path, default=ROOT / "1")
    parser.add_argument(
        "--from-git",
        action="store_true",
        help="Leer módulos desde HEAD (útil para re-aplicar tras un run fallido)",
    )
    args = parser.parse_args()

    files = sorted(args.root.rglob("*.md"))
    stats = []
    for f in files:
        r = process_file(f, args.dry_run, from_git=args.from_git)
        if not r.get("skipped"):
            stats.append(r)

    print(f"{'[dry-run] ' if args.dry_run else ''}Procesados: {len(stats)} archivos\n")
    for s in stats:
        print(
            f"  {s['path']}: {s['questions']} preg — "
            f"clave {s['keys']} (B: {s['b_before']}→{s['b_after']})"
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
