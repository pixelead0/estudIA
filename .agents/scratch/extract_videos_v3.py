import glob, re

MODULE_LABELS = {
    "01_procesos_basicos":   "01 · Procesos Básicos",
    "02_tipos_pensamiento":  "02 · Tipos de Pensamiento",
    "03_camino_idea":        "03 · El Camino de la Idea",
    "04_observacion_atencion": "04 · Observación y Atención",
    "05_memoria":            "05 · La Memoria",
    "06_orden_comparacion":  "06 · Orden y Comparación",
    "07_razonamiento_logico":"07 · Razonamiento Lógico",
    "08_creatividad":        "08 · Creatividad",
    "09_pensamiento_lateral":"09 · Pensamiento Lateral",
    "10_expansion_ideas":    "10 · Expansión de Ideas",
    "11_contraccion_ideas":  "11 · Contracción de Ideas",
    "12_proyecto_final":     "12 · Proyecto Final",
}

files = sorted(glob.glob('/home/kubrick/www/estudIA/1/Desarrollo_de_Habilidades_del_Pensamiento/*.md'))
rows = []

for f in files:
    if '00_' in f.split('/')[-1]:
        continue
    key = f.split('/')[-1].replace('.md','')
    label = MODULE_LABELS.get(key, key)

    with open(f, 'r', encoding='utf-8') as fh:
        content = fh.read()

    # Match individual bullet lines inside the multimedia section:
    # "    - **Title**: Description. https://url"
    # Title must NOT start with emoji (🎥 🎬) — those are section headers
    pattern = re.compile(
        r'^\s{4,}-\s+\*\*(?!🎥|🎬)(.*?)\*\*:\s*(.*?)\s+(https?://[^\s\n]+)',
        re.MULTILINE
    )
    for m in pattern.finditer(content):
        title = m.group(1).strip()
        reflexion = m.group(2).strip().rstrip('.')
        url = m.group(3).strip()
        vtype = "🎵 TikTok" if "tiktok.com" in url else "▶️ YouTube"
        rows.append(f"| {label} | {vtype} | {title} | {reflexion} | [Ver]({url}) |")

header = (
    "# 🎬 Índice de Multimedia — Desarrollo de Habilidades del Pensamiento\n\n"
    "Catálogo completo de los **96 recursos multimedia** curados para los 12 módulos "
    "(estándar **2 YouTube + 2 TikTok** por sección). "
    "Cada recurso incluye su reflexión pedagógica original.\n\n"
    "| Módulo | Plataforma | Título | 💡 Reflexión pedagógica | Enlace |\n"
    "| :--- | :--- | :--- | :--- | :--- |\n"
)

output = header + "\n".join(rows) + "\n"

out_path = '/home/kubrick/www/estudIA/.agents/scratch/videos_reflexion.md'
with open(out_path, 'w', encoding='utf-8') as fh:
    fh.write(output)

print(f"Total rows: {len(rows)}")
print("Saved →", out_path)
