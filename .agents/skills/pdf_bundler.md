# Skill: PDF Educational Bundler
ID: skill_pdf_bundler
Version: 1.0.0

## Description
Este skill permite a los agentes automatizar la compilación de módulos educativos en formato Markdown a documentos PDF de alta fidelidad, aplicando el sistema de diseño "Mentor Expert" de estudIA.

## Capabilities
- **Fusión de Módulos**: Agrupa archivos Markdown siguiendo un orden alfanumérico por materia y semestre.
- **Transformación de Alertas**: Convierte sintaxis de GitHub (`> [!TIP]`) en componentes HTML estilizados.
- **Incrustación de Imágenes**: Resuelve rutas locales y convierte imágenes a Base64 con detección de MIME-type para máxima compatibilidad.
- **Renderizado Premium**: Utiliza Playwright (Chromium) para generar PDFs con tipografía `Inter`, numeración de páginas y diseño optimizado para impresión.

## Usage
El sistema se invoca a través del script `bin/generate-pdf.js` o mediante el `Makefile` en la raíz.

### CLI Commands
```bash
# Vía Makefile (Recomendado)
make all
make filosofia

# Vía Node.js directamente
node bin/generate-pdf.js <semestre> <nombre_materia>
```

## Infrastructure
- **Script**: `bin/generate-pdf.js`
- **Styles**: `assets/premium-pdf.css`
- **Exports**: `exports/`
- **Dependencies**: `playwright`, `markdown-it`, `fs-extra`, `glob`

## Design Decisions
- **Base64 Encoding**: Se utiliza para evitar bloqueos de seguridad del navegador al acceder a archivos locales (`file://`) durante la generación del PDF.
- **Image Load Wait**: Se inyecta un script en el navegador para asegurar que las imágenes pesadas estén totalmente cargadas antes de llamar a `page.pdf()`.
- **MIME Detection**: El sistema inspecciona los headers de los archivos para corregir desajustes entre extensión y contenido (ej. JPEGs nombrados como .png).
