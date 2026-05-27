/**
 * Etiquetas de sección para la vista web.
 * El .md puede usar títulos genéricos (PDF/estructura); la web muestra copy más vivo.
 */

/** Kicker encima del título en tarjetas web (tono directo, no escolar) */
export const SECTION_KICKER = {
  challenge: 'Para empezar',
  learn: 'Lo esencial',
  practice: 'Practica esto',
  world: 'En tu mundo',
  reflect: 'Para pensar',
  glossary: 'Repaso rápido',
  explore: 'Mira esto',
  quiz: 'Pon a prueba',
  default: '',
};

/** Títulos genéricos del esquema v2/v3 → ignorar en web si no hay título propio */
export const SECTION_GENERIC_TITLES = {
  challenge: ['el reto'],
  learn: ['entiende', '¿cómo funciona esto?', 'como funciona esto'],
  practice: ['practica', 'manos a la obra'],
  world: ['en la vida real', 'en tu mundo'],
  reflect: ['reflexiona', 'pausa para pensar'],
  glossary: ['palabras clave', 'glosario maestro'],
  explore: ['explora', 'zona de descubrimiento'],
  quiz: ['pon a prueba', 'reto final'],
};

/** Fallback web cuando el H2 sigue siendo genérico */
export const SECTION_WEB_FALLBACK_TITLE = {
  challenge: '¿Te suena familiar?',
  learn: 'Así funciona',
  practice: 'Ponlo en acción',
  world: 'En tu día a día',
  reflect: 'Un momento…',
  glossary: 'Conceptos clave',
  explore: 'Clips y curiosidades',
  quiz: '¿Lo dominas?',
};

export function normalizeSectionTitle(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function webSectionKicker(kind) {
  return SECTION_KICKER[kind] || SECTION_KICKER.default;
}

/** Título visible en la tarjeta web */
export function webSectionHeadline(mdTitle, kind) {
  const raw = String(mdTitle ?? '').trim();
  const norm = normalizeSectionTitle(raw);
  const generics = SECTION_GENERIC_TITLES[kind] || [];
  if (generics.includes(norm)) {
    return SECTION_WEB_FALLBACK_TITLE[kind] || raw;
  }
  return raw;
}
