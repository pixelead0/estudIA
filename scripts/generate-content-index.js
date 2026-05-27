import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CONTENT_SEMESTER,
  buildModuleEntry,
  compareModuleFiles,
  humanizeSubjectId,
} from '../content/pipeline.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..', CONTENT_SEMESTER);
const subjects = [];

if (!fs.existsSync(rootDir)) {
  console.error(`Directory not found: ${rootDir}`);
  process.exit(1);
}

const subjectDirs = fs
  .readdirSync(rootDir)
  .filter((f) => fs.statSync(path.join(rootDir, f)).isDirectory());

subjectDirs.forEach((subjectDir) => {
  const subjectPath = path.join(rootDir, subjectDir);
  const files = fs
    .readdirSync(subjectPath)
    .filter((f) => f.endsWith('.md'))
    .sort(compareModuleFiles);

  const modules = files.map((file) =>
    buildModuleEntry(subjectDir, file, `${CONTENT_SEMESTER}/${subjectDir}/${file}`)
  );

  subjects.push({
    id: subjectDir,
    name: humanizeSubjectId(subjectDir),
    modules,
  });
});

const outputPath = path.join(__dirname, '..', 'subjects.json');
fs.writeFileSync(outputPath, JSON.stringify(subjects, null, 2));

console.log('Successfully generated subjects.json');
