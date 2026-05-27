#!/usr/bin/env python3
"""
Asigna un vídeo TikTok distinto por aparición en lecciones de Filosofía I:
la primera vez que aparece un video_id «gana», las siguientes se sustituyen
por URLs tomadas del pool de Desarrollo de Habilidades (lecciones, sin Resumen).

Requiere red solo si se usa --verify (oEmbed). Sin --verify, confía en el pool DHP.

Uso: python3 scripts/dedupe_filosofia_tiktok.py [--dry-run] [--verify]
"""

from __future__ import annotations

import argparse
import re
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
FILO = REPO / "1" / "Filosofia_I"
DHP = REPO / "1" / "Desarrollo_de_Habilidades_del_Pensamiento"

SEG = re.compile(
    r"https://www\.tiktok\.com/@[^\s\)]+\/video\/\d+(?:\?[^\s\)]*)?"
)

UA = {"User-Agent": "estudIA-dedupe-filosofia/1.0 (educational)"}


def filo_lesson_paths() -> list[Path]:
    return sorted(
        p
        for p in FILO.glob("*.md")
        if not p.name.startswith("Resumen_")
        and not p.name.startswith("00_")
        and re.match(r"^(?!00)(\d{2})(?:\.\d{2})?_.+\.md$", p.name)
    )


def filo_paths_for_pass() -> list[Path]:
    """Solo lecciones; el índice se regenera con rebuild_filosofia_indice_videos.py."""
    return filo_lesson_paths()


def dhp_pool_urls() -> list[str]:
    urls: list[str] = []
    for p in sorted(DHP.glob("*.md")):
        if p.name.startswith("Resumen_") or p.name.startswith("00_"):
            continue
        txt = p.read_text(encoding="utf-8")
        for m in SEG.finditer(txt):
            u = m.group(0).rstrip(").,;\]").split("?")[0]
            urls.append(u)
    # estable: primer URL canónico por orden de archivo + aparición
    return urls


def video_id(url: str) -> str | None:
    m = re.search(r"/video/(\d+)", url)
    return m.group(1) if m else None


def oembed_ok(url: str, ctx: ssl.SSLContext) -> bool:
    u = url.split("?")[0]
    if "/photo/" in u:
        return False
    enc = urllib.parse.quote(u, safe="")
    o = "https://www.tiktok.com/oembed?url=" + enc
    try:
        req = urllib.request.Request(o, headers=UA)
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            return r.status == 200
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return False


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--verify", action="store_true", help="Filtrar pool con oEmbed")
    args = ap.parse_args()
    ctx = ssl.create_default_context() if args.verify else None

    lessons = filo_paths_for_pass()
    pool_all = []
    pid_seen_pool: set[str] = set()
    for raw in dhp_pool_urls():
        vid = video_id(raw)
        if not vid or vid in pid_seen_pool:
            continue
        pid_seen_pool.add(vid)
        if args.verify and ctx is not None:
            if not oembed_ok(raw, ctx):
                continue
        pool_all.append(raw.split("?")[0])

    pool_iter = list(pool_all)
    pool_pos = 0

    def next_spare(used: set[str]) -> str | None:
        nonlocal pool_pos
        while pool_pos < len(pool_iter):
            u = pool_iter[pool_pos]
            pool_pos += 1
            v = video_id(u)
            if v and v not in used:
                return u
        return None

    used_glob: set[str] = set()
    # Orden: archivos, luego reemplazos de izquierda a derecha
    plan: list[tuple[Path, str, str]] = []

    for path in lessons:
        text = path.read_text(encoding="utf-8")

        def repl_one(m: re.Match[str]) -> str:
            nonlocal used_glob, pool_pos
            full = m.group(0)
            base = full.rstrip(").,;\]").split("?")[0]
            vid = video_id(base)
            if not vid:
                return full
            if vid not in used_glob:
                used_glob.add(vid)
                return base
            nw = next_spare(used_glob)
            if nw is None:
                print(
                    f"ERROR: pool agotado al deduplicar {path.name}",
                    file=sys.stderr,
                )
                raise RuntimeError("pool agotado")
            plan.append((path, base, nw))
            nvid = video_id(nw)
            assert nvid
            used_glob.add(nvid)
            return nw

        try:
            new_text = SEG.sub(repl_one, text)
        except RuntimeError:
            return 1

        if new_text != text and not args.dry_run:
            path.write_text(new_text, encoding="utf-8")

    if args.dry_run:
        for p, o, n in plan:
            print(f"{p.name}: {video_id(o)} -> {n}")
        print(f"DRY-RUN: {len(plan)} sustituciones previstas", file=sys.stderr)
    else:
        print(f"OK: {len(plan)} sustituciones aplicadas", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
