import glob, re, sys

MODULE_LABEL_PATTERNS = [
    (r'^(\d+)\.(\d+)_(.+)', lambda m: f"{m.group(1)}.{m.group(2)} · {m.group(3).replace('_',' ').title()}"),
    (r'^(\d+)_(.+)',         lambda m: f"{m.group(1)} · {m.group(2).replace('_',' ').title()}"),
    (r'^00_(.+)',            lambda m: f"Resumen · {m.group(1).replace('_',' ').title()}"),
]

def get_label(key):
    for pat, fn in MODULE_LABEL_PATTERNS:
        m = re.match(pat, key)
        if m:
            return fn(m)
    return key

def gen_index(subject_dir, out_path):
    files = sorted(glob.glob(f'{subject_dir}/*.md'))
    pattern = re.compile(
        r'^\s{4,}-\s+\*\*(?!🎥|🎬)(.*?)\*\*:\s*(.*?)\s+(https?://[^\s\n]+)',
        re.MULTILINE
    )

    subject_name = subject_dir.rstrip('/').split('/')[-1].replace('_', ' ')
    lines = [
        f"# 🎬 Índice de Multimedia",
        f"## {subject_name}",
        "",
        "> Catálogo completo de recursos multimedia curados para esta materia. "
        "Cada recurso incluye su reflexión pedagógica original (estándar **2+2 YouTube + TikTok**).",
        "",
        "---",
        ""
    ]

    total = 0
    for f in files:
        key = f.split('/')[-1].replace('.md', '')
        if key.startswith('00_'):
            continue
        label = get_label(key)
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
        matches = list(pattern.finditer(content))
        if not matches:
            continue
        lines.append(f"## Módulo {label}")
        lines.append("")
        for m in matches:
            title     = m.group(1).strip()
            reflexion = m.group(2).strip().rstrip('.')
            url       = m.group(3).strip()
            badge     = "🎵 **TikTok**" if "tiktok.com" in url else "▶️ **YouTube**"
            lines.append(f"### {title}")
            lines.append(f"{badge} &nbsp; [{title}]({url})")
            lines.append(f"> {reflexion}")
            lines.append("")
            total += 1
        lines.append("---")
        lines.append("")

    with open(out_path, 'w', encoding='utf-8') as fh:
        fh.write("\n".join(lines))
    print(f"✅ {total} entries → {out_path}")

if len(sys.argv) < 3:
    print("Usage: python gen_video_index.py <subject_dir> <out_path>")
    sys.exit(1)

gen_index(sys.argv[1], sys.argv[2])
