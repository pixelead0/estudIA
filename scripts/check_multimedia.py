#!/usr/bin/env python3
"""
Valida multimedia en módulos markdown (estudIA).

Comprueba:
  - IDs de YouTube duplicados entre lecciones (archivos distintos).
  - IDs de TikTok duplicados entre lecciones.
  - Solapamiento heurístico YouTube↔TikTok en el mismo archivo (misma “franquicia”
    según el título del bullet, tras quitar sufijos entre paréntesis).

Modo de archivos:
  - Por defecto: lecciones `NN_nombre.md` o `NN.MM_nombre.md` (excluye `00_*` y
    `Resumen_*`).
  - Con --strict-modules: solo `NN_nombre.md` con N=01..12 (una lección por número).

Opcional (--check-http):
  - YouTube y TikTok vía oEmbed.

Uso:
  python3 scripts/check_multimedia.py
  python3 scripts/check_multimedia.py \
    --root 1/Desarrollo_de_Habilidades_del_Pensamiento
  python3 scripts/check_multimedia.py --root 1/Filosofia_I
  python3 scripts/check_multimedia.py --check-http
"""

from __future__ import annotations

import argparse
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

YT_RE = re.compile(
    r"(?:https?://(?:www\.)?youtube\.com/watch\?v=|"
    r"https?://youtu\.be/)([A-Za-z0-9_-]{11})"
)
TT_URL_RE = re.compile(r"https://www\.tiktok\.com[^\s\)\]]+")
# Modo estricto (DHP clásico): exactamente 01_foo.md … 12_foo.md
STRICT_LESSON_RE = re.compile(r"^(\d{2})_[^/]+\.md$")
# Modo flexible (p. ej. Filosofía I): 02.01_etica.md, 10_quien_soy.md, …
FLEX_LESSON_RE = re.compile(r"^(?!00_|Resumen_)(\d{2})(?:\.\d{2})?_.+\.md$")

# Doble handle en path: @user/@user/video/…
TT_DOUBLE_HANDLE = re.compile(r"tiktok\.com/@[^/]+/@[^/]+/video/")


def iter_lesson_paths(root: Path, strict_modules: bool) -> list[Path]:
    if strict_modules:
        out: list[Path] = []
        for p in sorted(root.glob("*.md")):
            m = STRICT_LESSON_RE.match(p.name)
            if not m:
                continue
            n = int(m.group(1))
            if 1 <= n <= 12:
                out.append(p)
        return out
    return sorted(
        p for p in root.glob("*.md") if FLEX_LESSON_RE.match(p.name)
    )


def title_key_from_bullet(line: str) -> str | None:
    m = re.search(r"\*\*(.+?)\*\*", line)
    if not m:
        return None
    key = m.group(1)
    key = re.sub(r"\s*\([^)]*\)", "", key)
    key = key.split(":")[0].strip().lower()
    return key or None


def extract_media_bullets(text: str) -> list[str]:
    return [
        ln.strip()
        for ln in text.splitlines()
        if ln.strip().startswith("- **") and "http" in ln
    ]


def youtube_ids_in_text(text: str) -> set[str]:
    return set(YT_RE.findall(text))


def tiktok_video_ids_in_text(text: str) -> set[str]:
    ids: set[str] = set()
    for url in TT_URL_RE.findall(text):
        url = url.rstrip(").,;]")
        vm = re.search(r"/video/(\d+)", url)
        if vm:
            ids.add(vm.group(1))
    return ids


def collect_issues(
    root: Path,
    strict_modules: bool,
) -> tuple[list[str], list[Path]]:
    errors: list[str] = []
    lesson_paths = iter_lesson_paths(root, strict_modules)

    if strict_modules:
        by_num: dict[int, Path] = {}
        for p in lesson_paths:
            m = STRICT_LESSON_RE.match(p.name)
            if m:
                by_num[int(m.group(1))] = p
        for mod_num in range(1, 13):
            if mod_num not in by_num:
                errors.append(f"Falta módulo {mod_num:02d}_*.md en {root}")
        lesson_paths = [by_num[n] for n in range(1, 13) if n in by_num]

    yt_where: dict[str, list[str]] = defaultdict(list)
    tt_where: dict[str, list[str]] = defaultdict(list)

    for p in lesson_paths:
        text = p.read_text(encoding="utf-8")
        label = p.name
        for vid in youtube_ids_in_text(text):
            yt_where[vid].append(label)
        for tid in tiktok_video_ids_in_text(text):
            tt_where[tid].append(label)

        if TT_DOUBLE_HANDLE.search(text):
            errors.append(
                f"{p.name}: posible URL TikTok mal formada "
                "(@user/@user/video/…)"
            )

        bullets = extract_media_bullets(text)
        yt_titles: set[str] = set()
        tt_titles: set[str] = set()
        for ln in bullets:
            k = title_key_from_bullet(ln)
            if not k:
                continue
            if "youtube.com" in ln or "youtu.be" in ln:
                yt_titles.add(k)
            if "tiktok.com" in ln:
                tt_titles.add(k)
        overlap = sorted(yt_titles & tt_titles)
        if overlap:
            errors.append(
                f"{p.name}: mismo tema en YouTube y TikTok "
                f"(revisar): {', '.join(overlap)}"
            )

    for vid, files in sorted(yt_where.items()):
        u = sorted(set(files))
        if len(u) > 1:
            errors.append(
                f"YouTube duplicado entre lecciones {u}: watch?v={vid}"
            )

    for tid, files in sorted(tt_where.items()):
        u = sorted(set(files))
        if len(u) > 1:
            errors.append(
                f"TikTok duplicado entre lecciones {u}: video/{tid}"
            )

    return errors, lesson_paths


def check_http_urls(paths: list[Path]) -> list[str]:
    errors: list[str] = []
    ctx = ssl.create_default_context()
    ua = {
        "User-Agent": (
            "estudIA-check-multimedia/1.0 "
            "(educational link check)"
        )
    }

    all_urls: list[tuple[str, Path]] = []
    for p in sorted(paths, key=lambda x: x.name):
        text = p.read_text(encoding="utf-8")
        for m in YT_RE.finditer(text):
            u = m.group(0)
            if u.startswith("http://"):
                u = "https://" + u[len("http://"):]
            all_urls.append((u, p))
        for u in TT_URL_RE.findall(text):
            u = u.rstrip(").,;]")
            if u.startswith("http://"):
                u = "https://" + u[len("http://"):]
            all_urls.append((u, p))

    seen: set[str] = set()
    for url, src in all_urls:
        if url in seen:
            continue
        seen.add(url)

        if "youtube.com" in url or "youtu.be" in url:
            vm = re.search(r"(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})", url)
            if not vm:
                errors.append(f"{src.name}: URL YouTube sin ID válido: {url}")
                continue
            vid = vm.group(1)
            oembed = (
                "https://www.youtube.com/oembed?"
                + urllib.parse.urlencode(
                    {
                        "url": f"https://www.youtube.com/watch?v={vid}",
                        "format": "json",
                    }
                )
            )
            try:
                req = urllib.request.Request(oembed, headers=ua)
                with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
                    if r.status != 200:
                        errors.append(
                            f"{src.name}: YouTube oEmbed HTTP {r.status} ({vid})"
                        )
            except urllib.error.HTTPError as e:
                errors.append(f"{src.name}: YouTube oEmbed falló {e.code} ({vid})")
            except urllib.error.URLError as e:
                errors.append(f"{src.name}: YouTube oEmbed error ({vid}): {e}")
        elif "tiktok.com" in url:
            if "/photo/" in url:
                errors.append(f"{src.name}: TikTok /photo/ no comprobable vía oEmbed: {url}")
                continue
            clean = url.split("?")[0]
            oembed_tt = (
                "https://www.tiktok.com/oembed?url="
                + urllib.parse.quote(clean, safe="")
            )
            try:
                req = urllib.request.Request(oembed_tt, headers=ua)
                with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
                    if r.status != 200:
                        errors.append(
                            f"{src.name}: TikTok oEmbed HTTP {r.status}: {url}"
                        )
            except urllib.error.HTTPError as e:
                errors.append(
                    f"{src.name}: TikTok oEmbed falló {e.code}: {clean}"
                )
            except urllib.error.URLError as e:
                errors.append(f"{src.name}: TikTok oEmbed error: {clean} ({e})")
        else:
            errors.append(f"{src.name}: URL no soportada para --check-http: {url}")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validar enlaces multimedia en archivos lección (.md)."
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path("1/Desarrollo_de_Habilidades_del_Pensamiento"),
        help="Carpeta con archivos .md por lección (excluye 00_* y Resumen_* en modo flexible)",
    )
    parser.add_argument(
        "--strict-modules",
        action="store_true",
        help="Exigir 01–12 con patrón NN_nombre.md (sin NN.MM)",
    )
    parser.add_argument(
        "--check-http",
        action="store_true",
        help="Verificar YouTube y TikTok vía oEmbed; requiere red",
    )
    parser.add_argument(
        "-q",
        "--quiet",
        action="store_true",
        help="Solo código de salida, sin texto OK",
    )
    args = parser.parse_args()

    root = args.root
    if not root.is_dir():
        print(f"ERROR: no existe el directorio: {root}", file=sys.stderr)
        return 2

    errors, lesson_paths = collect_issues(root, args.strict_modules)
    if args.check_http:
        errors.extend(check_http_urls(lesson_paths))

    if errors:
        for line in errors:
            print(line, file=sys.stderr)
        return 1

    if not args.quiet:
        print(
            f"OK: {root} — sin duplicados "
            "ni solapamientos YT/TikTok detectados."
        )
        if args.check_http:
            print("OK: comprobación HTTP completada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
