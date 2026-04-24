import os
import re

def audit_subject(subject_path, target_path):
    map_path = os.path.join(subject_path, "curriculum_map.md")
    if not os.path.exists(map_path):
        return {"error": f"Missing curriculum_map.md in {subject_path}"}

    with open(map_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find modules like "- **Módulo 01**: Name"
    modules = re.findall(r'- \*\*Módulo (\d+)\*\*: (.*)', content)
    
    results = []
    
    # Get all .md files in target path to match by prefix
    target_files = [f for f in os.listdir(target_path) if f.endswith('.md')]

    for mod_num, mod_name in modules:
        # Find the file that starts with the module number
        matching_files = [f for f in target_files if f.startswith(mod_num)]
        
        if not matching_files:
            results.append({"module": mod_num, "name": mod_name, "status": "FAIL", "reason": "File not found"})
            continue
        
        file_path = os.path.join(target_path, matching_files[0])
        with open(file_path, 'r', encoding='utf-8') as f:
            module_content = f.read()
        
        # Check mandatory sections
        mandatory_sections = [
            r'## 🎯 El Reto',
            r'## 💡 ¿Cómo funciona esto\?',
            r'## ✍️ Manos a la obra',
            r'## 🌍 En tu mundo',
            r'## 🏆 Reto Final',
            r'## 🏁 Pausa para pensar',
            r'## 📚 Glosario Maestro',
            r'## 🌟 Zona de Descubrimiento',
            r'## 🔑 Respuestas Correctas'
        ]
        
        missing_sections = []
        for section in mandatory_sections:
            if not re.search(section, module_content):
                missing_sections.append(section.replace('\\', ''))
        
        # Check for at least 6 questions in Reto Final
        # Usually formatted as "1. ", "2. ", etc. or "- 1. "
        questions = re.findall(r'^\d+\. ', module_content, re.MULTILINE)
        if len(questions) < 6:
            # Fallback for "1) " or similar
            questions = re.findall(r'^\d+\) ', module_content, re.MULTILINE)
        
        # Check Discovery Zone sub-sections
        discovery_missing = []
        for ds in ["Para ver", "Para explorar", "Dato curioso"]:
            if ds not in module_content:
                discovery_missing.append(ds)

        if missing_sections or len(questions) < 6 or discovery_missing:
            reason = []
            if missing_sections: reason.append(f"Missing sections: {', '.join(missing_sections)}")
            if len(questions) < 6: reason.append(f"Only {len(questions)} questions found (min 6)")
            if discovery_missing: reason.append(f"Discovery Zone missing: {', '.join(discovery_missing)}")
            
            results.append({"module": mod_num, "name": mod_name, "status": "FAIL", "reason": " | ".join(reason)})
        else:
            results.append({"module": mod_num, "name": mod_name, "status": "PASS", "reason": ""})

    return results

def main():
    base_subjects = "/home/kubrick/www/estudIA/.agents/subjects/1"
    base_target = "/home/kubrick/www/estudIA/1"
    
    subjects = [d for d in os.listdir(base_subjects) if os.path.isdir(os.path.join(base_subjects, d))]
    
    print("# Auditoría de Módulos Educativos\n")
    
    for subject in subjects:
        print(f"## Materia: {subject.replace('_', ' ')}")
        subject_path = os.path.join(base_subjects, subject)
        target_path = os.path.join(base_target, subject)
        
        if not os.path.exists(target_path):
            print(f"❌ Error: Directorio de destino {target_path} no existe.\n")
            continue
            
        report = audit_subject(subject_path, target_path)
        
        if isinstance(report, dict) and "error" in report:
            print(f"❌ {report['error']}\n")
            continue
            
        print("| Módulo | Nombre | Estado | Observaciones |")
        print("| :--- | :--- | :--- | :--- |")
        for item in report:
            status_emoji = "✅" if item['status'] == "PASS" else "❌"
            print(f"| {item['module']} | {item['name']} | {status_emoji} {item['status']} | {item['reason']} |")
        print("\n")

if __name__ == "__main__":
    main()
