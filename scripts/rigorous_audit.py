import os
import re

# Reglas configurables desde decisiones.md y standards
FORBIDDEN_WORDS = [r'NEM', r'RAP', r'Competencia', r'Metacognición', r'Metacognicion']
INSTITUTIONAL_BRANDS = [r'IPN', r'CECyT', r'Politécnico', r'Politecnico']

def audit_module(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    issues = []
    
    # 1. Secciones Obligatorias
    mandatory_sections = [
        r'## 🎯 El Reto',
        r'## 💡 ¿Cómo funciona esto\?',
        r'## ✍️ Manos a la obra',
        r'## 🌍 En tu mundo',
        r'## 🏁 Pausa para pensar',
        r'## 📚 Glosario Maestro',
        r'## 🌟 Zona de Descubrimiento',
        r'## 🏆 Reto Final',
        r'## 🔑 Respuestas Correctas'
    ]
    for section in mandatory_sections:
        if not re.search(section, content):
            section_name = section.replace('\\', '')
            issues.append(f"Falta sección: {section_name}")

    # 2. Palabras Prohibidas (excepto en Filosofía Módulo 11 que es de Identidad IPN)
    is_filo_11 = "Filosofia_I" in file_path and "11_" in os.path.basename(file_path)
    
    for word in FORBIDDEN_WORDS:
        if re.search(rf'\b{word}\b', content, re.IGNORECASE):
            issues.append(f"Palabra prohibida encontrada: {word}")
            
    if not is_filo_11:
        for brand in INSTITUTIONAL_BRANDS:
            if re.search(rf'\b{brand}\b', content, re.IGNORECASE):
                issues.append(f"Marca institucional prohibida: {brand}")

    # 3. Densidad de Citas (Mínimo 4)
    quotes = re.findall(r'^> .*', content, re.MULTILINE)
    if len(quotes) < 4:
        issues.append(f"Baja densidad de citas: {len(quotes)} encontradas (mínimo 4)")

    # 4. Densidad de Ejemplos (Mínimo 6 en tablas o listas de Manos a la Obra)
    # Buscamos la sección Manos a la Obra y contamos filas de tabla o ítems de lista
    manos_section = re.search(r'## ✍️ Manos a la obra(.*?)(##|$)', content, re.DOTALL)
    if manos_section:
        table_rows = re.findall(r'^\|.*\|$', manos_section.group(1), re.MULTILINE)
        list_items = re.findall(r'^- .*', manos_section.group(1), re.MULTILINE)
        # Restamos 2 a las filas de tabla por el header y el separador
        example_count = max(0, len(table_rows) - 2) + len(list_items)
        if example_count < 6:
            issues.append(f"Pocos ejemplos en Manos a la Obra: {example_count} encontrados (mínimo 6)")

    # 5. Etiquetas de Referencia (N)
    # El Reto Final debe tener al menos 6 preguntas, y el texto debe tener (1) al (6)
    questions = re.findall(r'^\d+\. ', content, re.MULTILINE)
    if len(questions) < 6:
        issues.append(f"Reto Final insuficiente: {len(questions)} preguntas (mínimo 6)")
    else:
        for i in range(1, 7):
            if f"({i})" not in content:
                issues.append(f"Falta etiqueta de referencia: ({i})")

    # 6. No H1 manual
    if re.search(r'^# ', content, re.MULTILINE):
        issues.append("Contiene título H1 manual (prohibido, el generador lo añade)")

    return issues

def main():
    paths = [
        "1/Filosofia_I",
        "1/Desarrollo_de_Habilidades_del_Pensamiento",
        "1/Computacion_Basica_I"
    ]
    
    print("# Informe de Auditoría Rigurosa 2.0\n")
    
    all_pass = True
    for path in paths:
        full_path = os.path.join("/home/kubrick/www/estudIA", path)
        if not os.path.exists(full_path): continue
        
        print(f"## Materia: {os.path.basename(path).replace('_', ' ')}")
        print("| Archivo | Estado | Observaciones |")
        print("| :--- | :--- | :--- |")
        
        files = sorted([f for f in os.listdir(full_path) if f.endswith('.md') and not f.startswith('00_')])
        for file in files:
            file_issues = audit_module(os.path.join(full_path, file))
            if not file_issues:
                print(f"| {file} | ✅ PASS | |")
            else:
                all_pass = False
                print(f"| {file} | ❌ FAIL | {', '.join(file_issues)} |")
        print("\n")
    
    if all_pass:
        print("🎉 **¡Todo el contenido cumple con los estándares 2.0!**")
    else:
        print("⚠️ **Se encontraron fallos de cumplimiento. Revisar la tabla superior.**")

if __name__ == "__main__":
    main()
