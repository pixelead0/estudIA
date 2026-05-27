#!/usr/bin/env python3
"""
Reemplaza TikTok inválidos (oEmbed falla o /photo/) en Filosofía I.

Construye mapa vídeo_id -> URL nueva a partir del pool válido ya presente en
DHP + lecciones de Filosofía (oEmbed). Idempotente.

Uso (desde la raíz del repo):
  python3 scripts/fix_filosofia_tiktok.py
"""

from __future__ import annotations

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

RAW_TT = re.compile(r"https://www\.tiktok\.com[^\s\)]+")

UA = {
    "User-Agent": (
        "estudIA-fix-filosofia-tiktok/1.1 "
        "(educational; +https://github.com/)"
    )
}


def base_url(raw: str) -> str:
    return raw.rstrip(").,;]").split("?")[0]


def video_id(url: str) -> str | None:
    m = re.search(r"/(?:video|photo)/(\d+)", base_url(url))
    return m.group(1) if m else None


def oembed_ok(url: str, ctx: ssl.SSLContext) -> bool:
    u = base_url(url)
    if "/photo/" in u:
        return False
    if not re.search(r"/video/\d+", u):
        return False
    enc = urllib.parse.quote(u, safe="")
    oembed = "https://www.tiktok.com/oembed?url=" + enc
    try:
        req = urllib.request.Request(oembed, headers=UA)
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            return r.status == 200
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError):
        return False


def collect_urls(paths: list[Path]) -> set[str]:
    out: set[str] = set()
    for p in paths:
        if not p.is_file():
            continue
        for raw in RAW_TT.findall(p.read_text(encoding="utf-8")):
            vid = video_id(raw)
            if vid:
                out.add(base_url(raw))
    return out


def all_course_md(course: Path) -> list[Path]:
    """Incluye 00_* (índices con enlaces TikTok válidos útiles como pool)."""
    return sorted(
        p for p in course.glob("*.md") if not p.name.startswith("Resumen_")
    )


def filo_audited_files() -> list[Path]:
    """Lecciones + índices 00_* de Filosofía I."""
    return all_course_md(FILO)


def build_pool_valid(ctx: ssl.SSLContext) -> list[str]:
    paths = all_course_md(DHP) + all_course_md(FILO)
    pool = sorted(collect_urls(paths))
    ok: list[str] = []
    for u in pool:
        if oembed_ok(u, ctx):
            ok.append(base_url(u))
    # únicos por orden estable
    seen: set[str] = set()
    uniq: list[str] = []
    for u in ok:
        v = video_id(u)
        if not v or v in seen:
            continue
        seen.add(v)
        uniq.append(u)
    return uniq


def main() -> int:
    if not FILO.is_dir():
        print(f"ERROR: no existe {FILO}", file=sys.stderr)
        return 2

    ctx = ssl.create_default_context()
    targets = filo_audited_files()
    texts = {p: p.read_text(encoding="utf-8") for p in targets}

    urls_in_targets: set[str] = set()
    for t in texts.values():
        for raw in RAW_TT.findall(t):
            vi = video_id(raw)
            if vi:
                urls_in_targets.add(base_url(raw))

    bad_ids: set[str] = set()
    ok_ids_in_filo: set[str] = set()
    for u in urls_in_targets:
        vid = video_id(u)
        if not vid:
            continue
        if oembed_ok(u, ctx):
            ok_ids_in_filo.add(vid)
        else:
            bad_ids.add(vid)

    pool_sorted = build_pool_valid(ctx)

    replacement_by_id: dict[str, str] = {}
    used = set(ok_ids_in_filo)
    for pid in sorted(bad_ids, key=int):
        chosen = None
        for cand in pool_sorted:
            cid = video_id(cand)
            if not cid or cid in used:
                continue
            chosen = cand
            break
        if chosen is None:
            print(
                f"ERROR: sin pool suficiente para reemplazar video/{pid}",
                file=sys.stderr,
            )
            return 1
        replacement_by_id[pid] = chosen
        nv = video_id(chosen)
        assert nv
        used.add(nv)

    def rewrite_line(text: str) -> str:
        def repl(m: re.Match[str]) -> str:
            url = base_url(m.group(0))
            vid = video_id(url)
            if not vid:
                return m.group(0)
            nw = replacement_by_id.get(vid)
            return nw if nw else m.group(0)

        return RAW_TT.sub(lambda m: repl(m), text)

    changed = 0
    for p in targets:
        new = rewrite_line(texts[p])
        if new != texts[p]:
            p.write_text(new, encoding="utf-8")
            print(p.name)
            changed += 1

    print(
        f"OK: sustituidos {len(replacement_by_id)} IDs defectuosos; "
        f"{changed} archivos tocados.",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
