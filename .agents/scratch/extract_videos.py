import glob
import re

files = sorted(glob.glob('/home/kubrick/www/estudIA/1/Desarrollo_de_Habilidades_del_Pensamiento/*.md'))
table = "| Módulo | Tipo | Título | Enlace |\n| :--- | :--- | :--- | :--- |\n"

for f in files:
    if '00_resumen_temario.md' in f:
        continue
    module_name = f.split('/')[-1].replace('.md', '')
    with open(f, 'r', encoding='utf-8') as file:
        content = file.readlines()
        
    for line in content:
        if 'youtube.com' in line or 'tiktok.com' in line:
            # Lines look like: - **Title**: Description. https://link
            # Or - **Title (TikTok)**: Description. https://link
            url_match = re.search(r'(https?://[^\s]+)', line)
            if url_match:
                url = url_match.group(1)
                # Try to extract title: between ** and **
                title_match = re.search(r'\*\*(.*?)\*\*', line)
                title = title_match.group(1) if title_match else "Video"
                vtype = "TikTok" if "tiktok.com" in url else "YouTube"
                table += f"| {module_name} | {vtype} | {title} | [Ver]({url}) |\n"

with open('/home/kubrick/www/estudIA/.agents/scratch/videos_table.md', 'w') as out:
    out.write(table)
print("Done")
