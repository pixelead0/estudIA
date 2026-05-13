const fs = require('fs-extra');
const path = require('path');
const { chromium } = require('playwright');
const MarkdownIt = require('markdown-it');
const { glob } = require('glob');

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
});

// Transform paths and embed images as Base64 to bypass browser security
async function transformImages(content) {
    const rootPath = '/home/kubrick/www/estudIA/';
    const imageRegex = /!\[(.*?)\]\((file:\/\/.*?)\)/g;
    let transformed = content;
    const matches = [...content.matchAll(imageRegex)];

    for (const match of matches) {
        const altText = match[1];
        const fullUrl = match[2];
        const filePath = fullUrl.replace('file://', '');
        
        if (await fs.pathExists(filePath)) {
            const ext = path.extname(filePath).substring(1).toLowerCase();
            const imageBuffer = await fs.readFile(filePath);
            const base64 = imageBuffer.toString('base64');
            
            // Detect actual MIME type from Base64 header
            let mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
            if (base64.startsWith('/9j/')) mimeType = 'image/jpeg';
            else if (base64.startsWith('iVBORw')) mimeType = 'image/png';
            else if (base64.startsWith('R0lGOD')) mimeType = 'image/gif';
            else if (base64.startsWith('UklGR')) mimeType = 'image/webp';

            const dataUrl = `data:${mimeType};base64,${base64}`;
            // Replace the entire markdown image syntax with an HTML img tag
            transformed = transformed.replace(match[0], `<img src="${dataUrl}" alt="${altText}">`);
        }
    }
    return transformed;
}

// Custom transformation for GitHub-style alerts: > [!TIP]
function transformAlerts(content) {
    const alertTypes = ['TIP', 'IMPORTANT', 'WARNING', 'CAUTION', 'NOTE'];
    let transformed = content;
    
    alertTypes.forEach(type => {
        // Regex to match > [!TYPE] followed by multiple lines starting with >
        const regex = new RegExp(`> \\[\\!${type}\\](?:\\n> (.*))+`, 'g');
        transformed = transformed.replace(regex, (match) => {
            const lines = match.split('\n').map(l => l.replace(/^> /, '').trim());
            lines.shift(); // Remove the [!TYPE] line
            const alertContent = lines.join(' ');
            return `<div class="alert alert-${type.toLowerCase()}">${alertContent}</div>`;
        });
    });
    
    return transformed;
}

async function generatePDF(semester, subject) {
    const subjectDir = path.join(__dirname, '..', semester.toString(), subject);
    const outputDir = path.join(__dirname, '..', 'exports');
    const pdfPath = path.join(outputDir, `${subject}.pdf`);
    const cssPath = path.join(__dirname, '..', 'assets', 'premium-pdf.css');
    
    await fs.ensureDir(outputDir);
    
    if (!await fs.pathExists(subjectDir)) {
        console.error(`Subject directory not found: ${subjectDir}`);
        process.exit(1);
    }

    console.log(`🔍 Scanning modules in ${subjectDir}...`);
    const files = await glob(path.join(subjectDir, '*.md'));
    files.sort(); // Ensure alphanumeric order (01, 02, etc.)

    let fullMarkdown = '';
    
    // Add Cover Page
    fullMarkdown += `<div class="cover-page">
        <h1 class="cover-title">${subject.replace(/_/g, ' ')}</h1>
        <p class="cover-subtitle">Semestre ${semester} | estudIA</p>
    </div>\n\n`;

    for (const file of files) {
        const filename = path.basename(file, '.md');
        let displayTitle = filename
            .replace(/^(\d+(?:\.\d+)?)/, 'Módulo $1:')
            .replace(/_/g, ' ');
        
        // Capitalize each word safely
        displayTitle = displayTitle.split(' ').map(word => {
            if (word.toLowerCase().startsWith('módulo')) return word;
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');

        console.log(`📄 Processing ${filename}...`);
        let content = await fs.readFile(file, 'utf8');
        
        content = await transformImages(content);
        content = transformAlerts(content);
        
        // Add Module Title
        fullMarkdown += `# ${displayTitle}\n\n`;
        fullMarkdown += content + '\n\n<div class="page-break"></div>\n\n';
    }

    const bodyHtml = md.render(fullMarkdown);
    const cssContent = await fs.readFile(cssPath, 'utf8');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <style>${cssContent}</style>
    </head>
    <body>
        ${bodyHtml}
    </body>
    </html>
    `;

    const tempHtmlPath = path.join(outputDir, `temp_${subject}.html`);
    await fs.writeFile(tempHtmlPath, htmlContent);

    console.log(`🚀 Rendering PDF to ${pdfPath}...`);
    
    const browser = await chromium.launch({
        args: ['--allow-file-access-from-files']
    });
    const page = await browser.newPage();
    
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle' });
    
    // Ensure all images are loaded (Data URLs don't trigger networkidle)
    await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(imgs.map(img => {
            if (img.complete) return;
            return new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
        }));
    });
    
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '2cm',
            bottom: '2cm',
            left: '2cm',
            right: '2cm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: `
            <div style="font-size: 10px; color: #6b7280; width: 100%; text-align: right; padding-right: 2cm;">
                <span class="pageNumber"></span> / <span class="totalPages"></span>
            </div>
        `
    });

    await browser.close();
    await fs.remove(tempHtmlPath); // Cleanup
    console.log(`✅ PDF generated successfully: ${pdfPath}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node generate-pdf.js <semester> <subject>');
    process.exit(1);
}

generatePDF(args[0], args[1]).catch(err => {
    console.error('❌ Error generating PDF:', err);
    process.exit(1);
});
