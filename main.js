import './style.css';
import { marked } from 'marked';
import { isStudyModule } from './content/pipeline.js';
import { webSectionHeadline, webSectionKicker } from './content/section-labels.js';

const BASE = import.meta.env.BASE_URL;

const contentView = document.getElementById('content-view');
const sidebar = document.getElementById('sidebar');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const logoEl = document.querySelector('.logo');

marked.setOptions({
  gfm: true,
  breaks: false,
});

const renderer = new marked.Renderer();

renderer.image = ({ href, title, text }) => {
  let src = href ?? '';
  if (src.startsWith('../../assets/')) {
    src = `${BASE}${src.slice(6)}`;
  } else if (src.startsWith('../assets/')) {
    src = `${BASE}${src.slice(3)}`;
  }
  const safe = String(src).replace(/"/g, '&quot;');
  const alt = String(text ?? '').replace(/"/g, '&quot;');
  const tit = title ? ` title="${String(title).replace(/"/g, '&quot;')}"` : '';
  return `<img src="${safe}" alt="${alt}"${tit} class="md-img" loading="lazy" decoding="async" />`;
};

marked.use({ renderer });

function loadTheme() {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  syncThemeIcon();
}

function syncThemeIcon() {
  const t = document.documentElement.getAttribute('data-theme');
  themeIcon.textContent = t === 'light' ? '🌙' : '☀️';
  themeToggle.setAttribute(
    'aria-label',
    t === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'
  );
}

themeToggle.addEventListener('click', () => {
  const next =
    document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  syncThemeIcon();
});

logoEl.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.hash = '#/';
});

async function loadSubjects() {
  const res = await fetch(`${BASE}subjects.json`);
  if (!res.ok) throw new Error('No se pudo cargar subjects.json');
  return res.json();
}

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  if (!raw) return { subjectId: null, moduleId: null };
  const i = raw.indexOf('/');
  if (i === -1) {
    return { subjectId: decodeURIComponent(raw), moduleId: null };
  }
  return {
    subjectId: decodeURIComponent(raw.slice(0, i)),
    moduleId: decodeURIComponent(raw.slice(i + 1)),
  };
}

function renderSidebarEmpty() {
  setAppView('view-home');
  sidebar.innerHTML =
    '<p class="sidebar-hint" id="sidebar-hint">Elige una materia en el panel principal para ver los módulos.</p>';
}

function shortModuleLabel(title) {
  const t = String(title ?? '').trim();
  const m = t.match(/^Módulo\s+[\d.]+:\s*(.+)$/i);
  return m ? m[1] : t.replace(/^Módulo\s+[\d.]+\s*/i, '') || t;
}

function moduleNavItem(m, index, subjectId, activeModuleId) {
  const hash = `#/${encodeURIComponent(subjectId)}/${encodeURIComponent(m.id)}`;
  const num = String(index + 1).padStart(2, '0');
  const label = m.title || m.id;
  return {
    id: m.id,
    hash,
    num,
    label,
    short: shortModuleLabel(label),
    active: m.id === activeModuleId,
  };
}

function renderEpisodeStepper(study, subjectId, activeModuleId) {
  const items = study.map((m, i) => moduleNavItem(m, i, subjectId, activeModuleId));
  const activeIdx = Math.max(0, items.findIndex((x) => x.active));
  const prev = items[activeIdx - 1];
  const next = items[activeIdx + 1];
  const cur = items[activeIdx];

  const prevEl = prev
    ? `<a class="episode-step episode-step--prev" href="${prev.hash}" id="episode-nav-prev" aria-label="Episodio anterior: ${escapeHtml(prev.num)} ${escapeHtml(prev.short)}"><span class="episode-step-arrow" aria-hidden="true">←</span><span class="episode-step-text"><span class="episode-step-num">${prev.num}</span> ${escapeHtml(prev.short)}</span></a>`
    : `<span class="episode-step episode-step--prev episode-step--ghost" aria-hidden="true"></span>`;

  const nextEl = next
    ? `<a class="episode-step episode-step--next" href="${next.hash}" id="episode-nav-next" aria-label="Episodio siguiente: ${escapeHtml(next.num)} ${escapeHtml(next.short)}"><span class="episode-step-text"><span class="episode-step-num">${next.num}</span> ${escapeHtml(next.short)}</span><span class="episode-step-arrow" aria-hidden="true">→</span></a>`
    : `<span class="episode-step episode-step--next episode-step--ghost" aria-hidden="true"></span>`;

  return `
    <nav class="episode-stepper" id="episode-stepper" aria-label="Anterior y siguiente episodio">
      ${prevEl}
      <button type="button" class="episode-step episode-step--index" id="sidebar-episodes-toggle" aria-expanded="false" aria-controls="sidebar-episodes-panel">
        <span class="episode-step-num episode-step-num--current">${cur?.num ?? '—'}</span>
        <span class="episode-step-label">Índice</span>
      </button>
      ${nextEl}
    </nav>`;
}

function renderModuleNavList(modules, subjectId, activeModuleId, startIndex = 0) {
  return modules
    .map((m, i) => {
      const hash = `#/${encodeURIComponent(subjectId)}/${encodeURIComponent(m.id)}`;
      const cls = m.id === activeModuleId ? 'module-link active' : 'module-link';
      const num = String(startIndex + i + 1).padStart(2, '0');
      const label = m.title || m.id;
      const short = shortModuleLabel(label);
      return `<li><a class="${cls}" href="${hash}" data-subject="${subjectId}" data-module="${m.id}" id="nav-mod-${encodeURIComponent(m.id).replace(/%/g, '')}"><span class="module-link-num" aria-hidden="true">${num}</span><span class="module-link-title">${escapeHtml(label)}</span><span class="module-link-short">${escapeHtml(short)}</span></a></li>`;
    })
    .join('');
}

function renderSidebar(subject, activeModuleId) {
  const study = subject.modules.filter(isStudyModule);
  const extras = subject.modules.filter((m) => !isStudyModule(m));

  const studyList = renderModuleNavList(study, subject.id, activeModuleId, 0);
  const extrasList =
    extras.length > 0
      ? renderModuleNavList(extras, subject.id, activeModuleId, study.length)
      : '';

  const stepper = renderEpisodeStepper(study, subject.id, activeModuleId);

  sidebar.innerHTML = `
    <nav class="sidebar-nav sidebar-nav--subject" aria-label="Módulos de la materia" id="subject-module-nav">
      <div class="sidebar-top">
        <a class="back-home" href="#/" id="back-home-link">← Materias</a>
      </div>
      <div class="sidebar-subject-chip">
        <span class="sidebar-subject-icon" aria-hidden="true">${subjectIcon(subject.id)}</span>
        <p class="subject-label" id="sidebar-subject-label">${escapeHtml(subject.name)}</p>
      </div>
      ${stepper}
      <div class="sidebar-episodes-panel" id="sidebar-episodes-panel">
        <p class="sidebar-episodes-label sidebar-episodes-label--desktop">Episodios</p>
        <p class="sidebar-episodes-label sidebar-episodes-label--index">Todos los episodios</p>
        <ul class="module-list" id="module-list-nav">${studyList}</ul>
        ${
          extras.length
            ? `<p class="sidebar-episodes-label sidebar-episodes-label--extras">Extras</p><ul class="module-list module-list--extras" id="module-list-extras">${extrasList}</ul>`
            : ''
        }
      </div>
    </nav>
  `;
  setupMobileSidebar();
}

function setupMobileSidebar() {
  const toggle = document.getElementById('sidebar-episodes-toggle');
  const panel = document.getElementById('sidebar-episodes-panel');
  if (!toggle || !panel) return;

  const mq = window.matchMedia('(max-width: 880px)');
  const sync = () => {
    if (!mq.matches) {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      return;
    }
    toggle.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
  };

  if (mq.matches) {
    panel.classList.remove('is-open');
  }

  toggle.onclick = () => {
    if (!mq.matches) return;
    panel.classList.toggle('is-open');
    sync();
  };

  panel.querySelectorAll('.module-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (mq.matches) panel.classList.remove('is-open');
      sync();
    });
  });

  mq.addEventListener('change', sync);
  sync();

  if (mq.matches) {
    requestAnimationFrame(() => {
      const active = panel.querySelector('#module-list-nav .module-link.active');
      active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }
}

function setAppView(mode) {
  document.body.classList.remove('view-home', 'view-module', 'view-subject');
  if (mode) document.body.classList.add(mode);
}

/** Primer módulo de estudio (no 00_* ni Resumen_*). */
function defaultStudyModule(subject) {
  return subject.modules.find(isStudyModule) ?? subject.modules[0];
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CALLOUT_META = {
  note: { icon: '📌', label: 'Nota' },
  tip: { icon: '✨', label: 'Tip' },
  important: { icon: '🔥', label: 'Clave' },
  warning: { icon: '⚡', label: 'Ojo' },
};

function enhanceCallouts(container) {
  container.querySelectorAll('.markdown-body blockquote').forEach((bq) => {
    const p = bq.querySelector('p');
    if (!p) return;
    const m = p.textContent.trim().match(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]$/i);
    if (!m) return;
    const kind = m[1].toLowerCase();
    bq.classList.add('callout', `callout-${kind}`);
    p.remove();
    const meta = CALLOUT_META[kind];
    if (!meta || bq.querySelector('.callout-header')) return;
    const hdr = document.createElement('div');
    hdr.className = 'callout-header';
    hdr.innerHTML = `<span class="callout-header-icon" aria-hidden="true">${meta.icon}</span><span class="callout-header-label">${meta.label}</span>`;
    bq.insertBefore(hdr, bq.firstChild);
  });
}

const SECTION_KIND_BY_EMOJI = {
  '🎯': 'challenge',
  '💡': 'learn',
  '✍️': 'practice',
  '🌍': 'world',
  '🏁': 'reflect',
  '📚': 'glossary',
  '🌟': 'explore',
  '🏆': 'quiz',
  '📺': 'media',
  '🎬': 'media',
  '🎥': 'media',
};

function parseEmojiHeading(text) {
  const t = String(text).trim();
  const m = t.match(/^(\p{Extended_Pictographic}+)\s*(.*)/u);
  if (m && m[2]) return { icon: m[1], title: m[2].trim() };
  if (m) return { icon: m[1], title: t };
  return { icon: '', title: t };
}

function detectSectionKind(text) {
  for (const [emoji, kind] of Object.entries(SECTION_KIND_BY_EMOJI)) {
    if (text.includes(emoji)) return kind;
  }
  return 'default';
}

/** Agrupa el MD en tarjetas por cada H2 (🎯 El reto, 💡 Cómo funciona, etc.). */
function enhanceModuleSections(article) {
  if (!article?.classList.contains('module-flow')) return;

  while (
    article.firstElementChild &&
    article.firstElementChild.tagName !== 'H2' &&
    !article.firstElementChild.classList.contains('video-playlist-hub')
  ) {
    let intro = article.querySelector(':scope > .study-intro');
    if (!intro) {
      intro = document.createElement('div');
      intro.className = 'study-intro';
      article.insertBefore(intro, article.firstElementChild);
    }
    intro.appendChild(article.firstElementChild);
  }

  const h2List = [...article.querySelectorAll(':scope > h2')];
  for (const h2 of h2List) {
    const kind = detectSectionKind(h2.textContent);
    const section = document.createElement('section');
    section.className = `study-section study-section--${kind}`;

    const head = document.createElement('header');
    head.className = 'study-section-head';
    const { icon, title } = parseEmojiHeading(h2.textContent);
    const headline = webSectionHeadline(title, kind);
    const kicker = webSectionKicker(kind);
    if (icon) {
      const ic = document.createElement('span');
      ic.className = 'study-section-icon';
      ic.setAttribute('aria-hidden', 'true');
      ic.textContent = icon;
      head.appendChild(ic);
    }
    const titles = document.createElement('div');
    titles.className = 'study-section-titles';
    if (kicker) {
      const kick = document.createElement('span');
      kick.className = 'study-section-kicker';
      kick.textContent = kicker;
      titles.appendChild(kick);
    }
    h2.textContent = headline;
    h2.classList.add('study-section-title');
    titles.appendChild(h2);

    const body = document.createElement('div');
    body.className = 'study-section-body';
    const nodes = [];
    let sib = h2.nextElementSibling;
    while (sib && sib.tagName !== 'H2') {
      const next = sib.nextElementSibling;
      nodes.push(sib);
      sib = next;
    }

    article.insertBefore(section, h2);
    head.appendChild(titles);
    nodes.forEach((node) => body.appendChild(node));
    section.appendChild(head);
    section.appendChild(body);
  }

  article.classList.add('module-flow--sectioned');
}

/** Casos 🔍 en Practica → tarjetas (Tu turno / Clave / Por qué). */
function enhancePracticeCases(container) {
  container.querySelectorAll('.study-section--practice .study-section-body').forEach((body) => {
    if (body.dataset.practiceEnhanced) return;
    body.dataset.practiceEnhanced = '1';

    [...body.querySelectorAll(':scope > h3')].forEach((h3) => {
      const title = h3.textContent.trim();
      const isCaso = /🔍|Caso\s*\d/i.test(title);
      const isEjemplo = /ejemplo resuelto/i.test(title);
      if (!isCaso && !isEjemplo) return;

      const card = document.createElement('article');
      card.className = isEjemplo ? 'practica-ejemplo' : 'practica-caso';

      const nodes = [h3];
      let sib = h3.nextElementSibling;
      while (sib && sib.tagName !== 'H3') {
        if (isCaso && sib.tagName === 'HR') break;
        const next = sib.nextElementSibling;
        nodes.push(sib);
        sib = next;
      }

      body.insertBefore(card, h3);
      nodes.forEach((n) => card.appendChild(n));
    });
  });
}

function enhanceWisdomQuotes(container) {
  container.querySelectorAll('.markdown-body blockquote').forEach((bq) => {
    if (bq.classList.contains('callout') || bq.classList.contains('tiktok-embed')) return;
    const text = bq.textContent.trim();
    if (/^["«“]/.test(text) || /\s—\s*[A-ZÁÉÍÓÚÑ]/.test(text)) {
      bq.classList.add('wisdom-quote');
    }
  });
}

function scenarioTagClass(proceso) {
  const p = String(proceso).toLowerCase();
  if (p.includes('reptil')) return 'scenario-card-tag--reflex';
  if (p.includes('límbic') || p.includes('limbic')) return 'scenario-card-tag--emotion';
  if (p.includes('entrada') || p.includes('input')) return 'scenario-card-tag--input';
  if (p.includes('salida') || p.includes('output')) return 'scenario-card-tag--output';
  if (p.includes('izquierdo')) return 'scenario-card-tag--logic';
  if (p.includes('sinapsis')) return 'scenario-card-tag--learn';
  if (p.includes('imagin')) return 'scenario-card-tag--imagine';
  if (p.includes('procesamiento') || p.includes('neocórtex') || p.includes('neocortex')) {
    return 'scenario-card-tag--think';
  }
  return 'scenario-card-tag--default';
}

/** Tablas de «Practica» → tarjetas de escenario (web); el .md sigue siendo tabla para el PDF. */
function enhanceActivityTables(container) {
  container.querySelectorAll('.markdown-body table').forEach((table) => {
    if (table.closest('.scenario-cards-wrap')) return;

    const rows = [...table.querySelectorAll('tr')];
    const hasHeader = rows[0]?.querySelector('th');
    const dataRows = hasHeader ? rows.slice(1) : rows;

    const grid = document.createElement('div');
    grid.className = 'scenario-cards';
    grid.setAttribute('role', 'list');

    let index = 0;
    dataRows.forEach((tr) => {
      const cells = [...tr.querySelectorAll('td')];
      if (cells.length < 3) return;
      index += 1;

      const situationHtml = cells[0].innerHTML.trim();
      const proceso = cells[1].textContent.trim().replace(/\.$/, '');
      const insight = cells[2].textContent.trim();

      const card = document.createElement('article');
      card.className = 'scenario-card';
      card.setAttribute('role', 'listitem');

      const num = document.createElement('span');
      num.className = 'scenario-card-num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = String(index).padStart(2, '0');

      const body = document.createElement('div');
      body.className = 'scenario-card-body';

      const h4 = document.createElement('h4');
      h4.className = 'scenario-card-situation';
      h4.innerHTML = situationHtml;

      const tag = document.createElement('span');
      tag.className = `scenario-card-tag ${scenarioTagClass(proceso)}`;
      tag.textContent = proceso;

      const p = document.createElement('p');
      p.className = 'scenario-card-insight';
      p.textContent = insight;

      body.append(h4, tag, p);
      card.append(num, body);
      grid.appendChild(card);
    });

    if (!grid.children.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'scenario-cards-wrap';
    wrap.appendChild(grid);
    table.replaceWith(wrap);
  });
}

/** Extrae el ID de vídeo de una URL canónica de YouTube */
function extractYouTubeId(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
    if (h === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split(/[/?#]/)[0];
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (h === 'youtube.com' || h === 'youtube-nocookie.com' || h === 'music.youtube.com') {
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      let m = u.pathname.match(/^\/embed\/([\w-]{11})/);
      if (m) return m[1];
      m = u.pathname.match(/^\/shorts\/([\w-]{11})/);
      if (m) return m[1];
      m = u.pathname.match(/^\/live\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    return null;
  }
  return null;
}

/** Extrae el ID numérico de una URL típica de TikTok (.../video/123...) */
function extractTikTokVideoId(url) {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('tiktok.com')) return null;
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** `@usuario` desde URL tipo `tiktok.com/@usuario/video/...` */
function extractTikTokHandleFromUrl(url) {
  try {
    const m = new URL(url).pathname.match(/^\/@([^/]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

const TIKTOK_EMBED_SRC = 'https://www.tiktok.com/embed.js';

function ensureTikTokEmbedScript() {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${TIKTOK_EMBED_SRC}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = TIKTOK_EMBED_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('TikTok embed.js'));
    document.body.appendChild(s);
  });
}

function waitForTikTokLib(maxMs = 15000) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    function tick() {
      const lib = window.tiktokEmbed?.lib;
      if (lib && typeof lib.render === 'function') {
        resolve(lib);
        return;
      }
      if (Date.now() - t0 >= maxMs) {
        resolve(null);
        return;
      }
      setTimeout(tick, 50);
    }
    tick();
  });
}

function collectFreshTikTokBlockquotes(root) {
  return [...root.querySelectorAll('blockquote.tiktok-embed')].filter((el) => !el.id);
}

function reloadTikTokEmbedScript() {
  document.querySelectorAll(`script[src="${TIKTOK_EMBED_SRC}"]`).forEach((el) => el.remove());
  const s = document.createElement('script');
  s.src = TIKTOK_EMBED_SRC;
  s.async = true;
  document.body.appendChild(s);
  return new Promise((resolve, reject) => {
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('TikTok embed.js reload'));
  });
}

async function hydrateTikTokEmbedsIn(root) {
  if (!root) return;
  if (!collectFreshTikTokBlockquotes(root).length) return;

  try {
    await ensureTikTokEmbedScript();
    let lib = await waitForTikTokLib(15000);
    if (!lib) {
      await reloadTikTokEmbedScript();
      lib = await waitForTikTokLib(10000);
    }
    if (!lib) return;

    const stillFresh = collectFreshTikTokBlockquotes(root);
    if (!stillFresh.length) return;
    await Promise.resolve(lib.render(stillFresh));
  } catch (e) {
    console.warn('TikTok embed:', e);
  }
}

/** Marca TikTok oficial: blockquote + embed.js (`/embed/v2/` dentro del iframe que genera TikTok). */
function createTikTokEmbedBlockquote(videoId, citeUrl, linkLabel) {
  const bq = document.createElement('blockquote');
  bq.className = 'tiktok-embed';
  bq.setAttribute('cite', citeUrl);
  bq.setAttribute('data-video-id', videoId);
  bq.setAttribute('style', 'max-width: 605px; min-width: 325px;');

  const section = document.createElement('section');
  const handle = extractTikTokHandleFromUrl(citeUrl);
  const profileHref = handle ? `https://www.tiktok.com/@${handle}?refer=embed` : citeUrl;
  const authorA = document.createElement('a');
  authorA.target = '_blank';
  authorA.rel = 'noopener noreferrer';
  authorA.title = handle ? `@${handle}` : 'TikTok';
  authorA.href = profileHref;
  authorA.textContent = handle ? `@${handle}` : 'TikTok';
  section.appendChild(authorA);

  const cap = String(linkLabel ?? '').trim();
  if (cap && !/^https?:\/\//i.test(cap)) {
    const p = document.createElement('p');
    p.textContent = cap;
    section.appendChild(p);
  }

  bq.appendChild(section);
  return bq;
}

function scheduleHydrateTikTokEmbeds(root) {
  if (!root || !root.querySelector('blockquote.tiktok-embed')) return;
  requestAnimationFrame(() => void hydrateTikTokEmbedsIn(root));
}

function createYouTubeIframe(id, title) {
  const iframe = document.createElement('iframe');
  /* autoplay sin mute: suele rechazarse; reduce ruido en consola usando mute=1 si hace falta */
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1&mute=0`;
  iframe.title = String(title ?? '').trim() || 'Vídeo de YouTube';
  iframe.setAttribute('allowfullscreen', '');
  /* Firefox marca como “unsupported” varios tokens delegados aquí; keep mínimos */
  iframe.allow = 'fullscreen; encrypted-media';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  return iframe;
}

/**
 * Título + descripción/análisis desde el ítem MD:
 * `- **Título del clip**: Texto de análisis… https://…`
 * o `[Título](https://…)` dentro del mismo bloque.
 */
function extractVideoMetaFromAnchor(anchor) {
  const host = anchor.closest('li, p');
  if (!host) return { clipTitle: '', clipDescription: '' };

  let clipTitle = '';
  const strong = host.querySelector('strong');
  if (strong) {
    const st = strong.textContent.replace(/:\s*$/, '').trim();
    if (st && !/^(TikTok|YouTube)$/i.test(st) && !/para ver/i.test(st)) {
      clipTitle = st;
    }
  }

  const linkLabel = (anchor.textContent || '').trim();
  if (!clipTitle && linkLabel && !/^https?:\/\//i.test(linkLabel)) {
    clipTitle = linkLabel.replace(/\s*\((TikTok|YouTube)\)\s*$/i, '').trim();
  }

  const clone = host.cloneNode(true);
  clone.querySelectorAll('a, strong').forEach((el) => el.remove());
  let clipDescription = clone.textContent
    .replace(/\u00a0/g, ' ')
    .replace(/^[\s🎵🎬📺🎥]+/, '')
    .replace(/^:\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/^(TikTok|YouTube)$/i.test(clipDescription)) clipDescription = '';

  return { clipTitle, clipDescription };
}

function videoItemContext(slotOrItem) {
  const clipTitle = (slotOrItem.clipTitle ?? slotOrItem.dataset?.title ?? '').trim();
  const clipDescription = (
    slotOrItem.clipDescription ??
    slotOrItem.analysisText ??
    slotOrItem.dataset?.description ??
    ''
  ).trim();
  const sectionTitle = (slotOrItem.sectionTitle ?? '').trim();
  const reflectionText = (slotOrItem.reflectionText ?? '').trim();
  return {
    clipTitle,
    clipDescription,
    displayTitle: clipTitle || sectionTitle,
    analysisText: clipDescription || reflectionText,
  };
}

/** Título legible para chips / lista (evita URLs crudas del autolink GFM) */
function humanClipTitle(rawTitle, href, provider, zeroBasedIndex) {
  const t = String(rawTitle ?? '').trim();
  if (t && !/^https?:\/\//i.test(t)) return t;
  if (provider === 'tiktok') {
    try {
      const m = new URL(href).pathname.match(/^\/@([^/]+)\//);
      if (m) return `@${m[1]} · vídeo`;
    } catch {
      /* ignore */
    }
    return `TikTok ${zeroBasedIndex + 1}`;
  }
  try {
    const id = extractYouTubeId(href);
    if (id) return `YouTube · ${id.slice(0, 7)}…`;
  } catch {
    /* ignore */
  }
  return `YouTube ${zeroBasedIndex + 1}`;
}

/**
 * Encabezado (h2–h6) inmediatamente anterior al slot + primer blockquote siguiente
 * que no sea callout pedagógico (`[!TIP]` etc., marcado como `.callout`).
 */
function extractVideoAdjacentContext(slotEl) {
  let sectionTitle = '';
  let prev = slotEl.previousElementSibling;
  while (prev) {
    if (/^H[2-6]$/.test(prev.tagName)) {
      sectionTitle = prev.textContent.replace(/\s+/g, ' ').trim();
      break;
    }
    prev = prev.previousElementSibling;
  }

  let reflectionText = '';
  let next = slotEl.nextElementSibling;
  while (next) {
    if (/^H[1-6]$/.test(next.tagName)) break;
    if (next.matches('blockquote')) {
      if (!next.classList.contains('callout')) {
        reflectionText = next.innerText.replace(/\u00a0/g, ' ').trim();
      } else {
        next = next.nextElementSibling;
        continue;
      }
      break;
    }
    next = next.nextElementSibling;
  }

  return { sectionTitle, reflectionText };
}

function appendAnalysisBlock(parent, className, text) {
  const t = String(text ?? '').trim();
  if (!t) return;
  const body = document.createElement('div');
  body.className = className;
  t.split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para.replace(/\n/g, ' ');
      body.appendChild(p);
    });
  parent.appendChild(body);
}

function fillPlaylistContextPanel(panel, item) {
  panel.innerHTML = '';
  const ctx = videoItemContext(item);
  if (!ctx.displayTitle && !ctx.analysisText) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  if (ctx.displayTitle) {
    const h = document.createElement('h4');
    h.className = 'playlist-context-title';
    h.textContent = ctx.displayTitle;
    panel.appendChild(h);
  }
  appendAnalysisBlock(panel, 'playlist-context-analysis', ctx.analysisText);
}

function shouldSkipInjectedHeading(embedEl, sectionTitle) {
  const want = (sectionTitle || '').trim().replace(/\s+/g, ' ');
  if (!want) return true;
  let el = embedEl.previousElementSibling;
  while (el) {
    if (/^H[2-6]$/.test(el.tagName)) {
      const got = el.textContent.replace(/\s+/g, ' ').trim();
      return got === want;
    }
    el = el.previousElementSibling;
  }
  return false;
}

function insertCourseVideoContextBefore(targetEl, item) {
  const ctx = videoItemContext(item);
  const showTitle =
    ctx.displayTitle && !shouldSkipInjectedHeading(targetEl, ctx.displayTitle);
  if (!showTitle && !ctx.analysisText) return;

  const sec = document.createElement('section');
  sec.className = 'course-video-context';
  sec.setAttribute('aria-label', 'Mirada pedagógica');

  if (showTitle) {
    const h = document.createElement('h3');
    h.className = 'course-video-context-title';
    h.textContent = ctx.displayTitle;
    sec.appendChild(h);
  }

  appendAnalysisBlock(sec, 'course-video-context-body', ctx.analysisText);
  targetEl.parentElement?.insertBefore(sec, targetEl);
}

function buildVideoSlot(provider, id, linkLabel, originalHref, meta = {}) {
  const el = document.createElement('div');
  el.className = 'video-embed-slot';
  el.dataset.provider = provider;
  el.dataset.id = id;
  el.dataset.href = originalHref;
  const clipTitle = (meta.clipTitle || linkLabel || '').trim();
  el.dataset.title =
    clipTitle && !/^https?:\/\//i.test(clipTitle)
      ? clipTitle
      : provider === 'youtube'
        ? 'YouTube'
        : 'TikTok';
  el.dataset.description = (meta.clipDescription || '').trim();
  return el;
}

/** Un solo vídeo: reproductor embebido clásico */
function hydrateSingleVideoSlot(slot) {
  const { provider, id, href, title } = slot.dataset;
  const wrap = document.createElement('div');
  wrap.className =
    provider === 'youtube' ? 'video-embed video-embed--youtube' : 'video-embed video-embed--tiktok';
  const inner = document.createElement('div');
  inner.className =
    provider === 'youtube'
      ? 'video-embed-inner video-embed-inner--youtube'
      : 'video-embed-inner video-embed-inner--tiktok';
  if (provider === 'youtube') {
    const iframe = createYouTubeIframe(id, title);
    iframe.loading = 'lazy';
    inner.appendChild(iframe);
  } else {
    inner.appendChild(createTikTokEmbedBlockquote(id, href, title));
  }
  wrap.appendChild(inner);
  const cap = document.createElement('span');
  cap.className = 'video-embed-caption';
  const ext = document.createElement('a');
  ext.href = href;
  ext.target = '_blank';
  ext.rel = 'noopener noreferrer';
  ext.textContent = provider === 'youtube' ? 'Abrir en YouTube' : 'Abrir en TikTok';
  cap.appendChild(ext);
  wrap.appendChild(cap);
  slot.replaceWith(wrap);
}

let videoPlaylistSerial = 0;

/**
 * Con 2+ vídeos: reproductor único arriba + chips (carrusel horizontal) + botones en contexto.
 */
function enhanceVideoPlaylist(article) {
  const slots = [...article.querySelectorAll('.video-embed-slot')];
  if (slots.length === 0) return;
  if (slots.length === 1) {
    const adjacent = extractVideoAdjacentContext(slots[0]);
    hydrateSingleVideoSlot(slots[0]);
    const embed = article.querySelector('.video-embed');
    if (embed) {
      insertCourseVideoContextBefore(embed, {
        dataset: slots[0].dataset,
        sectionTitle: adjacent.sectionTitle,
        reflectionText: adjacent.reflectionText,
      });
    }
    return;
  }

  const hubId = `video-playlist-hub-${videoPlaylistSerial++}`;
  const items = slots.map((s, i) => {
    const raw = s.dataset.title || `Vídeo ${i + 1}`;
    const adjacent = extractVideoAdjacentContext(s);
    const fallback = humanClipTitle(raw, s.dataset.href, s.dataset.provider, i);
    const merged = videoItemContext({
      dataset: s.dataset,
      sectionTitle: adjacent.sectionTitle,
      reflectionText: adjacent.reflectionText,
    });
    return {
      provider: s.dataset.provider,
      id: s.dataset.id,
      href: s.dataset.href,
      title: raw,
      clipTitle: merged.clipTitle,
      clipDescription: merged.clipDescription,
      sectionTitle: adjacent.sectionTitle,
      reflectionText: adjacent.reflectionText,
      displayTitle: merged.displayTitle || fallback,
      analysisText: merged.analysisText,
    };
  });

  const hub = document.createElement('section');
  hub.className = 'video-playlist-hub';
  hub.id = hubId;
  hub.setAttribute('aria-label', 'Lista de vídeos del módulo');
  hub.tabIndex = -1;

  const inner = document.createElement('div');
  inner.className = 'playlist-hub-inner';

  const playerCard = document.createElement('div');
  playerCard.className = 'playlist-player-card';

  const iframeMount = document.createElement('div');
  iframeMount.className = 'playlist-iframe-mount';

  const toolbar = document.createElement('div');
  toolbar.className = 'playlist-toolbar';
  const btnPrev = document.createElement('button');
  btnPrev.type = 'button';
  btnPrev.className = 'playlist-nav-btn playlist-prev';
  btnPrev.setAttribute('aria-label', 'Vídeo anterior');
  btnPrev.innerHTML = '‹';
  const counter = document.createElement('span');
  counter.className = 'playlist-counter';
  const curSpan = document.createElement('span');
  curSpan.className = 'playlist-current';
  curSpan.textContent = '1';
  counter.appendChild(curSpan);
  counter.appendChild(document.createTextNode(` / ${items.length}`));
  const btnNext = document.createElement('button');
  btnNext.type = 'button';
  btnNext.className = 'playlist-nav-btn playlist-next';
  btnNext.setAttribute('aria-label', 'Vídeo siguiente');
  btnNext.innerHTML = '›';
  toolbar.appendChild(btnPrev);
  toolbar.appendChild(counter);
  toolbar.appendChild(btnNext);

  playerCard.appendChild(iframeMount);
  playerCard.appendChild(toolbar);

  const contextPanel = document.createElement('div');
  contextPanel.className = 'playlist-context-panel';
  contextPanel.hidden = true;
  contextPanel.setAttribute('aria-live', 'polite');

  const chipsWrap = document.createElement('div');
  chipsWrap.className = 'playlist-chips-wrap';
  const chipsLabel = document.createElement('p');
  chipsLabel.className = 'playlist-chips-heading';
  chipsLabel.textContent = 'Lista de reproducción';
  const chips = document.createElement('div');
  chips.className = 'playlist-chips';
  chips.setAttribute('role', 'tablist');
  chips.setAttribute('aria-label', 'Elegir vídeo');
  chipsWrap.appendChild(chipsLabel);
  chipsWrap.appendChild(chips);

  inner.appendChild(playerCard);
  inner.appendChild(contextPanel);
  inner.appendChild(chipsWrap);
  hub.appendChild(inner);

  items.forEach((item, i) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'playlist-chip' + (i === 0 ? ' is-active' : '');
    chip.setAttribute('role', 'tab');
    chip.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    chip.dataset.index = String(i);
    const num = document.createElement('span');
    num.className = 'playlist-chip-num';
    num.textContent = String(i + 1);
    const badge = document.createElement('span');
    badge.className = 'playlist-chip-badge';
    badge.textContent = item.provider === 'youtube' ? 'YT' : 'TT';
    const t = document.createElement('span');
    t.className = 'playlist-chip-title';
    const label = item.displayTitle || item.clipTitle || item.title;
    const short =
      label.length > 72 ? `${label.slice(0, 69).trimEnd()}…` : label;
    t.textContent = short;
    chip.appendChild(num);
    chip.appendChild(badge);
    chip.appendChild(t);
    chips.appendChild(chip);
  });

  let activeIndex = 0;

  function mountAt(index) {
    const item = items[index];
    activeIndex = index;
    iframeMount.innerHTML = '';
    const frame = document.createElement('div');
    frame.className =
      item.provider === 'youtube'
        ? 'video-embed-inner video-embed-inner--youtube playlist-frame'
        : 'video-embed-inner video-embed-inner--tiktok playlist-frame playlist-frame--tiktok';
    if (item.provider === 'youtube') {
      const iframe = createYouTubeIframe(
        item.id,
        item.displayTitle || item.clipTitle || item.title
      );
      frame.appendChild(iframe);
    } else {
      frame.appendChild(
        createTikTokEmbedBlockquote(
          item.id,
          item.href,
          item.displayTitle || item.clipTitle || item.title
        )
      );
    }
    iframeMount.appendChild(frame);

    playerCard.classList.toggle('playlist-player-card--tiktok', item.provider === 'tiktok');
    if (item.provider === 'tiktok') {
      scheduleHydrateTikTokEmbeds(frame);
    }

    curSpan.textContent = String(index + 1);
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === items.length - 1;

    chips.querySelectorAll('.playlist-chip').forEach((c, j) => {
      c.classList.toggle('is-active', j === index);
      c.setAttribute('aria-selected', j === index ? 'true' : 'false');
    });

    const activeChip = chips.querySelector(`.playlist-chip[data-index="${index}"]`);
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    fillPlaylistContextPanel(contextPanel, item);
  }

  function goTo(index, scrollToHub) {
    if (index < 0 || index >= items.length) return;
    mountAt(index);
    if (scrollToHub) {
      hub.scrollIntoView({ behavior: 'smooth', block: 'start' });
      hub.focus({ preventScroll: true });
    }
  }

  btnPrev.addEventListener('click', () => goTo(activeIndex - 1, false));
  btnNext.addEventListener('click', () => goTo(activeIndex + 1, false));

  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.playlist-chip');
    if (!chip) return;
    goTo(Number(chip.dataset.index), false);
  });

  hub.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goTo(activeIndex - 1, false);
      e.preventDefault();
    } else if (e.key === 'ArrowRight') {
      goTo(activeIndex + 1, false);
      e.preventDefault();
    }
  });

  article.insertBefore(hub, article.firstChild);

  slots.forEach((slot, i) => {
    const item = items[i];
    const ref = document.createElement('div');
    ref.className = 'video-playlist-ref';

    const row = document.createElement('div');
    row.className = 'video-playlist-ref-row';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'video-jump-btn';
    btn.dataset.index = String(i);
    const n = document.createElement('span');
    n.className = 'video-jump-num';
    n.textContent = String(i + 1);
    const meta = document.createElement('span');
    meta.className = 'video-jump-meta';
    const badgeEl = document.createElement('span');
    badgeEl.className =
      item.provider === 'youtube' ? 'video-jump-badge video-jump-badge--yt' : 'video-jump-badge video-jump-badge--tt';
    badgeEl.textContent = item.provider === 'youtube' ? 'YouTube' : 'TikTok';
    const titleEl = document.createElement('span');
    titleEl.className = 'video-jump-title';
    titleEl.textContent = item.displayTitle || item.clipTitle || item.title;
    meta.appendChild(badgeEl);
    meta.appendChild(titleEl);
    btn.appendChild(n);
    btn.appendChild(meta);
    const chipLabel = item.displayTitle || item.clipTitle || item.title;
    btn.setAttribute('aria-label', `Reproducir en la lista: ${chipLabel}`);

    const ext = document.createElement('a');
    ext.className = 'video-jump-ext';
    ext.href = item.href;
    ext.target = '_blank';
    ext.rel = 'noopener noreferrer';
    ext.textContent = 'Abrir →';

    row.appendChild(btn);
    row.appendChild(ext);
    ref.appendChild(row);
    slot.replaceWith(ref);
  });

  article.addEventListener('click', function playlistJumpDelegate(e) {
    const jb = e.target.closest('.video-jump-btn');
    if (!jb || !article.contains(jb)) return;
    const idx = Number(jb.dataset.index);
    if (Number.isNaN(idx)) return;
    goTo(idx, true);
  });

  mountAt(0);
}

/**
 * Sustituye enlaces a YouTube / TikTok por iframes embebidos (GFM ya convierte URLs en <a>).
 */
function transformVideoLinks(html) {
  const container = document.createElement('div');
  container.innerHTML = html;
  const anchors = [...container.querySelectorAll('a[href]')];
  for (const a of anchors) {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) continue;
    let abs;
    try {
      abs = new URL(href, window.location.href).href;
    } catch {
      continue;
    }
    const meta = extractVideoMetaFromAnchor(a);
    const label = meta.clipTitle || a.textContent || '';
    const yt = extractYouTubeId(abs);
    if (yt) {
      a.replaceWith(buildVideoSlot('youtube', yt, label, href, meta));
      continue;
    }
    const tt = extractTikTokVideoId(abs);
    if (tt) {
      a.replaceWith(buildVideoSlot('tiktok', tt, label, href, meta));
    }
  }
  return container.innerHTML;
}

/**
 * Vista web del .md: mismo archivo fuente que el PDF, con transformaciones solo para pantalla.
 */
function markdownToWebHtml(md) {
  return transformVideoLinks(marked.parse(md));
}

async function loadModuleHtml(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`No se pudo cargar el módulo (${res.status})`);
  const md = await res.text();
  return markdownToWebHtml(md);
}

const SUBJECT_CARD_ACCENTS = ['indigo', 'violet', 'cyan', 'rose', 'lime'];

const SUBJECT_ICONS = {
  Filosofia_I: '🧠',
  Filosofia_II: '💭',
  Historia: '🏛️',
  Lengua: '✍️',
  Matematicas: '🔢',
};

function subjectIcon(id) {
  return SUBJECT_ICONS[id] ?? '📚';
}

function renderHome(subjects) {
  setAppView('view-home');
  renderSidebarEmpty();
  const totalEpisodes = subjects.reduce((n, s) => n + s.modules.filter(isStudyModule).length, 0);

  const cards = subjects
    .map(
      (s, i) => `
      <a class="subject-card subject-card--${SUBJECT_CARD_ACCENTS[i % SUBJECT_CARD_ACCENTS.length]}" href="#/${encodeURIComponent(s.id)}" id="card-${s.id}">
        <span class="subject-card-glow" aria-hidden="true"></span>
        <span class="subject-card-icon" aria-hidden="true">${subjectIcon(s.id)}</span>
        <h2 class="subject-card-title">${escapeHtml(s.name)}</h2>
        <span class="subject-card-meta">${s.modules.filter(isStudyModule).length} episodios</span>
        <span class="subject-card-cta">Entrar →</span>
      </a>`
    )
    .join('');

  contentView.innerHTML = `
    <section class="welcome-screen" id="home-welcome">
      <div class="welcome-hero" aria-hidden="true">
        <span class="welcome-blob welcome-blob--a"></span>
        <span class="welcome-blob welcome-blob--b"></span>
        <span class="welcome-blob welcome-blob--c"></span>
      </div>
      <div class="welcome-copy">
        <p class="welcome-eyebrow">Tu espacio de estudio</p>
        <h1 class="welcome-title">Elige materia.<br><span class="welcome-title-accent">Mete play.</span></h1>
        <p class="welcome-lead">Clips, reflexiones y retos cortos — sin tragarte un PDF de 40 páginas.</p>
        <ul class="welcome-stats" aria-label="Resumen">
          <li class="welcome-stat"><span class="welcome-stat-num">${subjects.length}</span><span class="welcome-stat-label">materias</span></li>
          <li class="welcome-stat"><span class="welcome-stat-num">${totalEpisodes}</span><span class="welcome-stat-label">episodios</span></li>
          <li class="welcome-stat welcome-stat--tag"><span class="welcome-stat-label">vídeo + actividades</span></li>
        </ul>
      </div>
      <div class="subject-grid" id="subject-grid">${cards}</div>
    </section>
  `;
}

async function renderSubjectView(subjects, subjectId, moduleId) {
  const subject = subjects.find((x) => x.id === subjectId);
  if (!subject) {
    setAppView('view-home');
    contentView.innerHTML = `<div class="error-screen" role="alert"><p>Materia no encontrada.</p><a href="#/">Volver al inicio</a></div>`;
    renderSidebarEmpty();
    return;
  }

  let mid = moduleId;
  if (!mid && subject.modules.length) {
    const first = defaultStudyModule(subject);
    if (first) {
      window.location.hash = `#/${encodeURIComponent(subjectId)}/${encodeURIComponent(first.id)}`;
    }
    return;
  }

  const mod = subject.modules.find((m) => m.id === mid);
  if (!mod) {
    setAppView('view-subject');
    contentView.innerHTML = `<div class="error-screen" role="alert"><p>Módulo no encontrado.</p><a href="#/${encodeURIComponent(subjectId)}">Ver esta materia</a></div>`;
    renderSidebar(subject, null);
    return;
  }

  setAppView('view-module');
  renderSidebar(subject, mod.id);

  contentView.innerHTML = `<div class="loading loading-pulse" id="module-loading" role="status"><span class="loading-label">Cargando módulo…</span></div>`;

  try {
    const body = await loadModuleHtml(mod.path);
    const crumb = `
      <nav class="breadcrumb breadcrumb-pills" aria-label="Ubicación" id="content-breadcrumb">
        <a class="bc-pill" href="#/">Inicio</a>
        <a class="bc-pill" href="#/${encodeURIComponent(subject.id)}">${escapeHtml(subject.name)}</a>
        <span class="bc-pill bc-pill--current">${escapeHtml(mod.title)}</span>
      </nav>`;
    contentView.innerHTML = `
      ${crumb}
      <header class="module-strip" id="module-strip">
        <div class="module-strip-deco" aria-hidden="true"></div>
        <span class="module-strip-tag"><span class="module-strip-emoji" aria-hidden="true">${subjectIcon(subject.id)}</span> ${escapeHtml(subject.name)}</span>
        <h1 class="module-strip-title">${escapeHtml(mod.title || mod.id)}</h1>
      </header>
      <article class="content-wrapper markdown-body module-flow" id="module-article">${body}</article>
    `;
    enhanceCallouts(contentView);
    const article = document.getElementById('module-article');
    if (article) {
      enhanceVideoPlaylist(article);
      enhanceModuleSections(article);
      enhancePracticeCases(contentView);
      enhanceWisdomQuotes(contentView);
      enhanceActivityTables(contentView);
      scheduleHydrateTikTokEmbeds(article);
    }
  } catch (err) {
    console.error(err);
    contentView.innerHTML = `<div class="error-screen" role="alert"><p>Error al cargar el contenido.</p><a href="#/${encodeURIComponent(subject.id)}">Reintentar desde la materia</a></div>`;
  }
}

async function route() {
  let subjects;
  try {
    subjects = await loadSubjects();
  } catch (e) {
    console.error(e);
    contentView.innerHTML =
      '<div class="error-screen" role="alert"><p>No se pudo cargar el índice de materias.</p></div>';
    renderSidebarEmpty();
    return;
  }

  const { subjectId, moduleId } = parseHash();
  if (!subjectId) {
    renderHome(subjects);
    return;
  }
  await renderSubjectView(subjects, subjectId, moduleId);
}

loadTheme();
window.addEventListener('hashchange', route);
route();
