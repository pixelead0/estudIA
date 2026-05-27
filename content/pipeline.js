/**
 * Fuente única de contenido: archivos .md en 1/<Materia>/.
 * La web y el PDF leen los mismos archivos; cada canal aplica su “vista” (transformaciones).
 */

/** Carpeta de materias (semestre 1) relativa a la raíz del repo */
export const CONTENT_SEMESTER = '1';

/** Prefijo de apéndices (índice multimedia, resumen temario, etc.) */
export const APPENDIX_PREFIX = '00_';

/** Archivos auxiliares que no son módulos numerados */
export const SUPPLEMENT_NAME_PATTERN = /^(Resumen_|Mission_)/i;

export const APPENDIX_TITLES = {
  '00_resumen_temario': 'Resumen del temario',
  '00_indice_videos': 'Índice de multimedia',
};

export const CALLOUT_TYPES = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];

/**
 * @typedef {'module' | 'appendix' | 'supplement'} ModuleKind
 */

/**
 * @param {string} filename - p. ej. `04_observacion_atencion.md`
 * @returns {{ kind: ModuleKind, base: string }}
 */
export function classifyMarkdownFile(filename) {
  const base = filename.replace(/\.md$/i, '');
  if (base.startsWith(APPENDIX_PREFIX)) {
    return { kind: 'appendix', base };
  }
  if (SUPPLEMENT_NAME_PATTERN.test(base)) {
    return { kind: 'supplement', base };
  }
  return { kind: 'module', base };
}

/**
 * Título legible alineado con la lógica del PDF (Módulo NN: …).
 * @param {string} filename
 * @param {{ kind?: ModuleKind }} [hint]
 */
export function formatModuleDisplayTitle(filename, hint = {}) {
  const base = filename.replace(/\.md$/i, '');
  const kind = hint.kind ?? classifyMarkdownFile(filename).kind;

  if (kind === 'appendix') {
    return APPENDIX_TITLES[base] || humanizeUnderscores(base);
  }

  let title = base.replace(/^(\d+(?:\.\d+)?)_/, (_, num) => `Módulo ${num}: `);
  title = title.replace(/_/g, ' ');
  return title
    .split(' ')
    .map((word) => {
      if (/^módulo$/i.test(word)) return 'Módulo';
      if (/^\d+(?:\.\d+)?:$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function humanizeUnderscores(slug) {
  return slug
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function humanizeSubjectId(subjectId) {
  return subjectId.replace(/_/g, ' ');
}

/**
 * Orden de archivos: numérico natural (01, 02.01, …).
 */
export function compareModuleFiles(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Metadatos de un .md para índice web / navegación.
 * @param {string} subjectId
 * @param {string} filename
 * @param {string} path - ruta relativa repo, p. ej. 1/Filosofia_I/01_foo.md
 */
export function buildModuleEntry(subjectId, filename, path) {
  const { kind, base } = classifyMarkdownFile(filename);
  return {
    id: filename,
    kind,
    base,
    title: formatModuleDisplayTitle(filename, { kind }),
    path,
    subjectId,
  };
}

/** Módulos “de estudio” (excluye apéndices y suplementos). */
export function isStudyModule(entry) {
  return entry.kind === 'module';
}

/** Orden sugerido para PDF: módulos primero, apéndices al final. */
export function partitionForPdf(filenames) {
  const sorted = [...filenames].sort(compareModuleFiles);
  const modules = sorted.filter((f) => !f.replace(/\.md$/i, '').startsWith(APPENDIX_PREFIX));
  const appendices = sorted.filter((f) => f.replace(/\.md$/i, '').startsWith(APPENDIX_PREFIX));
  return { modules, appendices };
}
