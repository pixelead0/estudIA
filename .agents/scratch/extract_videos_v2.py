import glob
import re

files = sorted(glob.glob('/home/kubrick/www/estudIA/1/Desarrollo_de_Habilidades_del_Pensamiento/*.md'))

rows = []

for f in files:
    if '00_resumen_temario.md' in f or '00_indice_videos.md' in f:
        continue
    module_name = f.split('/')[-1].replace('.md', '')

    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()

    # Match lines like: - **Title**: Description. https://link
    # The description is everything between **: and the URL
    pattern = re.compile(
        r'-\s+\*\*(.*?)\*\*:\s*(.*?)\s+(https?://[^\s\n]+)',
        re.MULTILINE
    )

    for m in pattern.finditer(content):
        title = m.group(1).strip()
        reflexion = m.group(2).strip().rstrip('.')
        url = m.group(3).strip()
        vtype = "🎵 TikTok" if "tiktok.com" in url else "▶️ YouTube"
        rows.append(f"| {module_name} | {vtype} | {title} | {reflexion} | [Ver]({url}) |")

header = (
    "# 🎬 Índice de Multimedia — Desarrollo de Habilidades del Pensamiento\n\n"
    "Catálogo completo de los **96 recursos multimedia** curados para los 12 módulos "
    "(estándar 2+2 YouTube + TikTok por sección). Cada recurso incluye la reflexión "
    "pedagógica que conecta el clip con los objetivos de aprendizaje.\n\n"
    "| Módulo | Plataforma | Título | 💡 Reflexión pedagógica | Enlace |\n"
    "| :--- | :--- | :--- | :--- | :--- |\n"
)

output = header + "\n".join(rows) + "\n"

out_path = '/home/kubrick/www/estudIA/.agents/scratch/videos_reflexion.md'
with open(out_path, 'w', encoding='utf-8') as out:
    out.write(output)

print(f"Total rows: {len(rows)}")
print("Done →", out_path)
