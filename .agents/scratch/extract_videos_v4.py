import glob, re

MODULE_LABELS = {
    "01_procesos_basicos":     ("01", "Procesos Básicos del Pensamiento"),
    "02_tipos_pensamiento":    ("02", "Tipos de Pensamiento"),
    "03_camino_idea":          ("03", "El Camino de una Idea"),
    "04_observacion_atencion": ("04", "Observación y Atención"),
    "05_memoria":              ("05", "La Memoria"),
    "06_orden_comparacion":    ("06", "Orden y Comparación"),
    "07_razonamiento_logico":  ("07", "Razonamiento Lógico"),
    "08_creatividad":          ("08", "Creatividad"),
    "09_pensamiento_lateral":  ("09", "Pensamiento Lateral"),
    "10_expansion_ideas":      ("10", "Expansión de Ideas"),
    "11_contraccion_ideas":    ("11", "Contracción de Ideas"),
    "12_proyecto_final":       ("12", "Proyecto Final"),
}

files = sorted(glob.glob('/home/kubrick/www/estudIA/1/Desarrollo_de_Habilidades_del_Pensamiento/*.md'))

output_lines = [
    "# 🎬 Índice de Multimedia",
    "## Desarrollo de Habilidades del Pensamiento",
    "",
    "> Catálogo completo de los **96 recursos multimedia** curados para los 12 módulos (estándar **2+2 YouTube + TikTok**). Cada recurso incluye su reflexión pedagógica original.",
    "",
    "---",
    ""
]

pattern = re.compile(
    r'^\s{4,}-\s+\*\*(?!🎥|🎬)(.*?)\*\*:\s*(.*?)\s+(https?://[^\s\n]+)',
    re.MULTILINE
)

for f in files:
    key = f.split('/')[-1].replace('.md', '')
    if key not in MODULE_LABELS:
        continue

    num, title = MODULE_LABELS[key]

    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()

    matches = list(pattern.finditer(content))
    if not matches:
        continue

    output_lines.append(f"## Módulo {num} — {title}")
    output_lines.append("")

    for m in matches:
        vtitle    = m.group(1).strip()
        reflexion = m.group(2).strip().rstrip('.')
        url       = m.group(3).strip()
        badge     = "🎵 **TikTok**" if "tiktok.com" in url else "▶️ **YouTube**"

        output_lines.append(f"### {vtitle}")
        output_lines.append(f"{badge} &nbsp; [{vtitle}]({url})")
        output_lines.append(f"> {reflexion}")
        output_lines.append("")

    output_lines.append("---")
    output_lines.append("")

out_path = '/home/kubrick/www/estudIA/.agents/scratch/videos_reflexion.md'
with open(out_path, 'w', encoding='utf-8') as fh:
    fh.write("\n".join(output_lines))

print(f"Entries: {sum(1 for l in output_lines if l.startswith('###'))}")
print("Saved →", out_path)
