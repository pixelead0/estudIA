import './style.css';
import { marked } from 'marked';

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
  sidebar.innerHTML =
    '<p class="sidebar-hint" id="sidebar-hint">Selecciona una materia para ver sus módulos.</p>';
}

function renderSidebar(subject, activeModuleId) {
  const listId = 'module-list-nav';
  const items = subject.modules
    .map((m) => {
      const hash = `#/${encodeURIComponent(subject.id)}/${encodeURIComponent(m.id)}`;
      const cls = m.id === activeModuleId ? 'module-link active' : 'module-link';
      return `<li><a class="${cls}" href="${hash}" data-subject="${subject.id}" data-module="${m.id}" id="nav-mod-${encodeURIComponent(m.id).replace(/%/g, '')}">${escapeHtml(m.title)}</a></li>`;
    })
    .join('');

  sidebar.innerHTML = `
    <nav class="sidebar-nav" aria-label="Módulos de la materia" id="subject-module-nav">
      <a class="back-home" href="#/" id="back-home-link">← Todas las materias</a>
      <p class="subject-label" id="sidebar-subject-label">${escapeHtml(subject.name)}</p>
      <ul class="module-list" id="${listId}">${items}</ul>
    </nav>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function enhanceCallouts(container) {
  container.querySelectorAll('.markdown-body blockquote').forEach((bq) => {
    const p = bq.querySelector('p');
    if (!p) return;
    const m = p.textContent.trim().match(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\]$/i);
    if (!m) return;
    bq.classList.add('callout', `callout-${m[1].toLowerCase()}`);
    p.remove();
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

/** `@usuario` desde URL tipo `tiktok.com/@usuario/video/...` (URLs cortas pueden no traer handle). */
function extractTikTokHandleFromUrl(url) {
  try {
    const m = new URL(url).pathname.match(/^\/@([^/]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

const TIKTOK_EMBED_SRC = 'https://www.tiktok.com/embed.js';

/** Asegura la etiqueta <script> de embed.js; la librería `lib.render` se espera aparte. */
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

/**
 * embed.js carga un segundo bundle (embed_lib); `lib.render` puede tardar cientos de ms.
 * Sin esperar a esto, el blockquote queda solo con el fallback (enlace + texto).
 */
/** Espera al objeto `lib` de TikTok (`render` usa `this`, no se puede invocar suelto). */
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

/** Solo nodos aún no procesados (TikTok asigna `id` al blockquote al renderizar). */
function collectFreshTikTokBlockquotes(root) {
  return [...root.querySelectorAll('blockquote.tiktok-embed')].filter((el) => !el.id);
}

/** Tras inyectar HTML en cliente, el embed a veces no se hidrata; recargar el script fuerza un nuevo escaneo. */
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
  const fresh = collectFreshTikTokBlockquotes(root);
  if (!fresh.length) return;

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
    requestTiktokPlaybackWithSound(root);
  } catch (e) {
    console.warn('TikTok embed:', e);
  }
}

/**
 * Marca oficial de TikTok (oEmbed / pegar en página): blockquote + embed.js.
 * Sin miniatura hasta que embed.js sustituya el bloque por el iframe (comportamiento normal).
 */
function createTikTokEmbedBlockquote(videoId, citeUrl, linkLabel) {
  const bq = document.createElement('blockquote');
  bq.className = 'tiktok-embed';
  bq.setAttribute('cite', citeUrl);
  bq.setAttribute('data-video-id', videoId);
  bq.setAttribute('style', 'max-width: 605px; min-width: 325px;');

  const section = document.createElement('section');
  const handle = extractTikTokHandleFromUrl(citeUrl);
  const profileHref = handle
    ? `https://www.tiktok.com/@${handle}?refer=embed`
    : citeUrl;
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

/**
 * Intenta reproducir el iframe de TikTok y quitar el mute vía postMessage (API del reproductor embebido).
 * Los navegadores suelen bloquear audio sin interacción previa del usuario (políticas de autoplay).
 */
function requestTiktokPlaybackWithSound(root) {
  if (!root) return;

  const send = (iframe) => {
    const w = iframe.contentWindow;
    if (!w) return;
    try {
      w.postMessage({ type: 'play', 'x-tiktok-player': true }, '*');
      w.postMessage({ type: 'unMute', 'x-tiktok-player': true }, '*');
    } catch {
      /* cross-origin restrictions */
    }
  };

  const hookIframe = (iframe) => {
    if (!iframe.src || !iframe.src.includes('tiktok.com')) return;
    if (iframe.dataset.estudiaTtAudioHook) return;
    iframe.dataset.estudiaTtAudioHook = '1';
    iframe.addEventListener('load', () => {
      send(iframe);
      setTimeout(() => send(iframe), 400);
      setTimeout(() => send(iframe), 1200);
    });
    setTimeout(() => send(iframe), 0);
  };

  const scan = () => {
    root.querySelectorAll('iframe').forEach(hookIframe);
  };
  scan();

  const obs = new MutationObserver(() => scan());
  obs.observe(root, { childList: true, subtree: true });
  setTimeout(() => {
    obs.disconnect();
    scan();
  }, 8000);
}

function scheduleHydrateTikTokEmbeds(root) {
  if (!root || !root.querySelector('blockquote.tiktok-embed')) return;
  requestAnimationFrame(() => {
    void hydrateTikTokEmbedsIn(root);
  });
}

function createYouTubeIframe(id, title) {
  const iframe = document.createElement('iframe');
  /* autoplay/mute: el navegador puede ignorar audio sin gesto del usuario */
  iframe.src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1&mute=0`;
  iframe.title = String(title ?? '').trim() || 'Vídeo de YouTube';
  iframe.setAttribute('allowfullscreen', '');
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  return iframe;
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

function fillPlaylistContextPanel(panel, item) {
  panel.innerHTML = '';
  const hasTitle = (item.sectionTitle || '').trim();
  const hasRef = (item.reflectionText || '').trim();
  if (!hasTitle && !hasRef) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  if (hasTitle) {
    const h = document.createElement('h4');
    h.className = 'playlist-context-title';
    h.textContent = hasTitle;
    panel.appendChild(h);
  }
  if (hasRef) {
    const body = document.createElement('div');
    body.className = 'playlist-context-analysis';
    hasRef
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((para) => {
        const p = document.createElement('p');
        p.textContent = para.replace(/\n/g, ' ');
        body.appendChild(p);
      });
    panel.appendChild(body);
  }
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

function insertCourseVideoContextBefore(targetEl, ctx) {
  const rawTitle = (ctx.sectionTitle || '').trim();
  const hasRef = (ctx.reflectionText || '').trim();
  const showTitle = rawTitle && !shouldSkipInjectedHeading(targetEl, rawTitle);
  if (!showTitle && !hasRef) return;

  const sec = document.createElement('section');
  sec.className = 'course-video-context';
  sec.setAttribute('aria-label', 'Mirada pedagógica');

  if (showTitle) {
    const h = document.createElement('h3');
    h.className = 'course-video-context-title';
    h.textContent = rawTitle;
    sec.appendChild(h);
  }

  if (hasRef) {
    const body = document.createElement('div');
    body.className = 'course-video-context-body';
    hasRef
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((para) => {
        const p = document.createElement('p');
        p.textContent = para.replace(/\n/g, ' ');
        body.appendChild(p);
      });
    sec.appendChild(body);
  }

  targetEl.parentElement?.insertBefore(sec, targetEl);
}

function buildVideoSlot(provider, id, linkLabel, originalHref) {
  const el = document.createElement('div');
  el.className = 'video-embed-slot';
  el.dataset.provider = provider;
  el.dataset.id = id;
  el.dataset.href = originalHref;
  el.dataset.title = linkLabel.trim() || (provider === 'youtube' ? 'YouTube' : 'TikTok');
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
    const ctx = extractVideoAdjacentContext(slots[0]);
    hydrateSingleVideoSlot(slots[0]);
    const embed = article.querySelector('.video-embed');
    if (embed) insertCourseVideoContextBefore(embed, ctx);
    return;
  }

  const hubId = `video-playlist-hub-${videoPlaylistSerial++}`;
  const items = slots.map((s, i) => {
    const raw = s.dataset.title || `Vídeo ${i + 1}`;
    const { sectionTitle, reflectionText } = extractVideoAdjacentContext(s);
    const fallback = humanClipTitle(raw, s.dataset.href, s.dataset.provider, i);
    return {
      provider: s.dataset.provider,
      id: s.dataset.id,
      href: s.dataset.href,
      title: raw,
      sectionTitle,
      reflectionText,
      displayTitle: (sectionTitle && sectionTitle.trim()) || fallback,
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
    const label = item.displayTitle || item.title;
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
      const iframe = createYouTubeIframe(item.id, item.displayTitle || item.title);
      frame.appendChild(iframe);
    } else {
      frame.appendChild(
        createTikTokEmbedBlockquote(item.id, item.href, item.displayTitle || item.title)
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
    titleEl.textContent = item.displayTitle || item.title;
    meta.appendChild(badgeEl);
    meta.appendChild(titleEl);
    btn.appendChild(n);
    btn.appendChild(meta);
    const chipLabel = item.displayTitle || item.title;
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
    const label = a.textContent || '';
    const yt = extractYouTubeId(abs);
    if (yt) {
      a.replaceWith(buildVideoSlot('youtube', yt, label, href));
      continue;
    }
    const tt = extractTikTokVideoId(abs);
    if (tt) {
      a.replaceWith(buildVideoSlot('tiktok', tt, label, href));
    }
  }
  return container.innerHTML;
}

async function loadModuleHtml(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`No se pudo cargar el módulo (${res.status})`);
  const md = await res.text();
  const html = transformVideoLinks(marked.parse(md));
  return html;
}

function renderHome(subjects) {
  renderSidebarEmpty();
  const cards = subjects
    .map(
      (s) => `
      <a class="subject-card" href="#/${encodeURIComponent(s.id)}" id="card-${s.id}">
        <h2 class="subject-card-title">${escapeHtml(s.name)}</h2>
        <span class="module-count">${s.modules.length} módulos</span>
      </a>`
    )
    .join('');

  contentView.innerHTML = `
    <section class="welcome-screen" id="home-welcome">
      <h1 class="welcome-title">Cursos</h1>
      <p class="welcome-lead">Materiales de estudio organizados por materia. Elige una para comenzar.</p>
      <div class="subject-grid" id="subject-grid">${cards}</div>
    </section>
  `;
}

async function renderSubjectView(subjects, subjectId, moduleId) {
  const subject = subjects.find((x) => x.id === subjectId);
  if (!subject) {
    contentView.innerHTML = `<div class="error-screen" role="alert"><p>Materia no encontrada.</p><a href="#/">Volver al inicio</a></div>`;
    renderSidebarEmpty();
    return;
  }

  let mid = moduleId;
  if (!mid && subject.modules.length) {
    const firstId = subject.modules[0].id;
    window.location.hash = `#/${encodeURIComponent(subjectId)}/${encodeURIComponent(firstId)}`;
    return;
  }

  const mod = subject.modules.find((m) => m.id === mid);
  if (!mod) {
    contentView.innerHTML = `<div class="error-screen" role="alert"><p>Módulo no encontrado.</p><a href="#/${encodeURIComponent(subjectId)}">Ver esta materia</a></div>`;
    renderSidebar(subject, null);
    return;
  }

  renderSidebar(subject, mod.id);

  contentView.innerHTML = `<div class="loading" id="module-loading">Cargando…</div>`;

  try {
    const body = await loadModuleHtml(mod.path);
    const crumb = `
      <nav class="breadcrumb" aria-label="Ubicación" id="content-breadcrumb">
        <a href="#/">Inicio</a>
        <span class="bc-sep">/</span>
        <a href="#/${encodeURIComponent(subject.id)}">${escapeHtml(subject.name)}</a>
        <span class="bc-sep">/</span>
        <span>${escapeHtml(mod.title)}</span>
      </nav>`;
    contentView.innerHTML = `
      ${crumb}
      <article class="content-wrapper markdown-body" id="module-article">${body}</article>
    `;
    enhanceCallouts(contentView);
    const article = document.getElementById('module-article');
    if (article) {
      enhanceVideoPlaylist(article);
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
