import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..', '1');
const subjects = [];

if (!fs.existsSync(rootDir)) {
    console.error(`Directory not found: ${rootDir}`);
    process.exit(1);
}

const subjectDirs = fs.readdirSync(rootDir).filter(f => fs.statSync(path.join(rootDir, f)).isDirectory());

subjectDirs.forEach(subjectDir => {
    const subjectPath = path.join(rootDir, subjectDir);
    const files = fs.readdirSync(subjectPath)
        .filter(f => f.endsWith('.md'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    const modules = files.map(file => {
        const title = file.replace(/^\d+(\.\d+)?_/, '').replace('.md', '').replace(/_/g, ' ');
        return {
            id: file,
            title: title.charAt(0).toUpperCase() + title.slice(1),
            path: `1/${subjectDir}/${file}`
        };
    });

    subjects.push({
        id: subjectDir,
        name: subjectDir.replace(/_/g, ' '),
        modules: modules
    });
});

const outputPath = path.join(__dirname, '..', 'subjects.json');
fs.writeFileSync(outputPath, JSON.stringify(subjects, null, 2));

console.log('Successfully generated subjects.json');
