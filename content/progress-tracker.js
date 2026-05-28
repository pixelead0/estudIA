/**
 * Métricas de evaluación medibles en el navegador (cookies + localStorage).
 * Tiempo por página/episodio/sección, scroll, interacciones, vídeos, retos, etc.
 */

export const PROGRESS_REPORT_SLUG = 'informe-avance-estudIA';

const COOKIE_PREFIX = 'estudia_p';
const COOKIE_SID = 'estudia_sid';
const LS_KEY = 'estudia_progress_v4';
const DATA_VERSION = 4;
const MAX_CHUNK = 3600;
const SAVE_DEBOUNCE_MS = 400;
const TICK_MS = 1000;
const FLUSH_EVERY_SEC = 12;
const VIDEO_MIN_FLUSH_SEC = 1;
const MAX_ROUTE_LOG = 40;

const SECTION_LABELS = {
  challenge: 'El reto',
  learn: 'Cómo funciona',
  practice: 'Práctica',
  world: 'En el mundo',
  reflect: 'Para pensar',
  glossary: 'Conceptos clave',
  explore: 'Explora',
  quiz: 'Reto final',
  answers: 'Respuestas',
  media: 'Multimedia',
  default: 'Sección',
};

const PAGE_LABELS = {
  home: 'Inicio (materias)',
  report: 'Informe de evidencia',
  module: 'Episodio',
};

function randomId(len = 8) {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let s = '';
  for (let i = 0; i < len; i += 1) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

function readCookie(name) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name, value, days = 400) {
  const maxAge = days * 24 * 60 * 60;
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteCookiePrefix(prefix) {
  document.cookie
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter((n) => n.startsWith(prefix))
    .forEach((n) => {
      document.cookie = `${n}=; path=/; max-age=0`;
    });
}

function loadFromCookies() {
  const countRaw = readCookie(`${COOKIE_PREFIX}_n`);
  if (!countRaw) return null;
  const n = Number(countRaw);
  if (!Number.isFinite(n) || n < 1) return null;
  let raw = '';
  for (let i = 0; i < n; i += 1) {
    const part = readCookie(`${COOKIE_PREFIX}_${i}`);
    if (part == null) return null;
    raw += part;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToCookies(data) {
  const raw = JSON.stringify(data);
  deleteCookiePrefix(COOKIE_PREFIX);
  if (raw.length <= MAX_CHUNK) {
    writeCookie(`${COOKIE_PREFIX}_n`, '1');
    writeCookie(`${COOKIE_PREFIX}_0`, raw);
    return;
  }
  const chunks = [];
  for (let i = 0; i < raw.length; i += MAX_CHUNK) {
    chunks.push(raw.slice(i, i + MAX_CHUNK));
  }
  writeCookie(`${COOKIE_PREFIX}_n`, String(chunks.length));
  chunks.forEach((chunk, i) => writeCookie(`${COOKIE_PREFIX}_${i}`, chunk));
}

function ensureSid() {
  let sid = readCookie(COOKIE_SID);
  if (!sid) {
    sid = randomId(10);
    writeCookie(COOKIE_SID, sid);
  }
  return sid;
}

function emptyStore() {
  return {
    v: DATA_VERSION,
    sid: ensureSid(),
    name: '',
    created: Date.now(),
    updated: Date.now(),
    sessions: 1,
    totals: {
      clicks: 0,
      modules: 0,
      sections: 0,
      videoSec: 0,
      activeSec: 0,
    },
    pages: { home: 0, report: 0 },
    routeLog: [],
    mods: {},
  };
}

function migrateMod(m) {
  return {
    s: m.s,
    m: m.m,
    v: m.v || 0,
    u: m.u || 0,
    sec: m.sec || {},
    ix: m.ix || {},
    quiz: m.quiz || null,
    expected: m.expected || [],
    vids: m.vids || {},
    time: m.time || { a: 0, n: 0 },
    scroll: m.scroll || { m: 0 },
  };
}

function migrateStore(data) {
  if (!data || typeof data !== 'object') return emptyStore();
  const next = emptyStore();
  next.sid = data.sid || ensureSid();
  next.name = data.name || '';
  next.created = data.created || Date.now();
  next.updated = data.updated || Date.now();
  next.sessions = data.sessions || 1;
  if (data.totals) {
    next.totals = { ...next.totals, ...data.totals };
    next.totals.activeSec = next.totals.activeSec || 0;
    next.totals.videoSec = next.totals.videoSec || 0;
  }
  if (data.pages) next.pages = { ...next.pages, ...data.pages };
  if (data.routeLog) next.routeLog = data.routeLog.slice(-MAX_ROUTE_LOG);
  if (data.mods) {
    for (const [k, m] of Object.entries(data.mods)) {
      next.mods[k] = migrateMod(m);
      for (const sk of Object.keys(next.mods[k].sec)) {
        const sec = next.mods[k].sec[sk];
        if (sec && sec.t == null) sec.t = 0;
        if (sec && !sec.det) sec.det = {};
      }
    }
  }
  return next;
}

let store = null;
let saveTimer = null;
let globalTickTimer = null;
let pageDwellPending = 0;
let videoWatchCtx = null;
let pendingVideoSec = 0;
let moduleScrollBound = null;

function modKey(subjectId, moduleId) {
  return `${subjectId}|${moduleId}`;
}

function videoKey(provider, id) {
  return `${provider}:${id}`;
}

function ensureMod(subjectId, moduleId) {
  const k = modKey(subjectId, moduleId);
  if (!store.mods[k]) {
    store.mods[k] = {
      s: subjectId,
      m: moduleId,
      v: 0,
      u: 0,
      sec: {},
      ix: {},
      quiz: null,
      expected: [],
      vids: {},
      time: { a: 0, n: 0 },
      scroll: { m: 0 },
    };
  }
  if (!store.mods[k].vids) store.mods[k].vids = {};
  if (!store.mods[k].time) store.mods[k].time = { a: 0, n: 0 };
  if (!store.mods[k].scroll) store.mods[k].scroll = { m: 0 };
  return store.mods[k];
}

function ensureSec(entry, kind) {
  if (!entry.sec[kind]) entry.sec[kind] = { v: 0, c: 0, t: 0, det: {} };
  if (entry.sec[kind].t == null) entry.sec[kind].t = 0;
  if (!entry.sec[kind].det) entry.sec[kind].det = {};
  return entry.sec[kind];
}

function loadStore() {
  let data = loadFromCookies();
  if (!data) {
    try {
      for (const key of [LS_KEY, 'estudia_progress_v3', 'estudia_progress_v2']) {
        const ls = localStorage.getItem(key);
        if (ls) {
          data = JSON.parse(ls);
          break;
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (!data || data.v !== DATA_VERSION) {
    store = data ? migrateStore(data) : emptyStore();
  } else {
    store = data;
    store.sid = store.sid || ensureSid();
  }
  const gap = Date.now() - (store.updated || 0);
  if (gap > 30 * 60 * 1000) store.sessions = (store.sessions || 1) + 1;
  ensureSid();
  return store;
}

function persist() {
  store.updated = Date.now();
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
  saveToCookies(store);
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(persist, SAVE_DEBOUNCE_MS);
}

export function initProgressTracker() {
  if (!store) loadStore();
  startGlobalMetricsTimer();
}

export function getProgressStore() {
  if (!store) loadStore();
  return store;
}

export function setStudentName(name) {
  if (!store) loadStore();
  store.name = String(name ?? '').trim().slice(0, 80);
  scheduleSave();
}

function pushRouteLog(entry) {
  if (!store.routeLog) store.routeLog = [];
  store.routeLog.push({ ...entry, at: Date.now() });
  if (store.routeLog.length > MAX_ROUTE_LOG) {
    store.routeLog = store.routeLog.slice(-MAX_ROUTE_LOG);
  }
}

/** Cambia la «página» activa y acumula tiempo de la anterior. */
export function setPageContext(ctx) {
  if (!store) loadStore();
  flushAllDwell();

  const prev = store._pageCtx;
  if (prev?.type === 'module' && ctx?.type !== 'module') {
    unbindModuleScroll();
  }

  store._pageCtx = ctx;

  if (!ctx) return;

  if (ctx.type === 'home') {
    pushRouteLog({ p: 'home' });
  } else if (ctx.type === 'report') {
    pushRouteLog({ p: 'report' });
  } else if (ctx.type === 'module') {
    store._ctx = { subjectId: ctx.subjectId, moduleId: ctx.moduleId };
    trackModuleVisit(ctx.subjectId, ctx.moduleId);
    pushRouteLog({ p: 'mod', s: ctx.subjectId, m: ctx.moduleId });
    bindModuleScroll(ctx.subjectId, ctx.moduleId);
  }
  scheduleSave();
}

function getScrollContainer() {
  return document.querySelector('main') || null;
}

function measureScrollDepthPct() {
  const article = document.getElementById('module-article');
  const main = getScrollContainer();
  if (!article || !main) return 0;
  const mainRect = main.getBoundingClientRect();
  const artRect = article.getBoundingClientRect();
  const articleTopInMain = artRect.top - mainRect.top + main.scrollTop;
  const articleH = article.scrollHeight;
  if (articleH <= 0) return 0;
  const scrolledBottom = main.scrollTop + main.clientHeight - articleTopInMain;
  return Math.min(100, Math.max(0, Math.round((scrolledBottom / articleH) * 100)));
}

function bumpScrollDepth(entry) {
  const pct = measureScrollDepthPct();
  if (pct > (entry.scroll.m || 0)) {
    entry.scroll.m = pct;
    scheduleSave();
  }
}

function bindModuleScroll(subjectId, moduleId) {
  unbindModuleScroll();
  const main = getScrollContainer();
  if (!main) return;
  let throttle = 0;
  moduleScrollBound = () => {
    const now = Date.now();
    if (now - throttle < 1500) return;
    throttle = now;
    const entry = ensureMod(subjectId, moduleId);
    bumpScrollDepth(entry);
  };
  main.addEventListener('scroll', moduleScrollBound, { passive: true });
}

function unbindModuleScroll() {
  const main = getScrollContainer();
  if (main && moduleScrollBound) {
    main.removeEventListener('scroll', moduleScrollBound);
  }
  moduleScrollBound = null;
}

function getActiveSectionKind() {
  const sections = document.querySelectorAll('#module-article .study-section');
  let best = null;
  let bestRatio = 0;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  for (const sec of sections) {
    const rect = sec.getBoundingClientRect();
    const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
    if (visible <= 0) continue;
    const ratio = visible / Math.max(rect.height, 1);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      const m = sec.className.match(/study-section--(\w+)/);
      best = m ? m[1] : 'default';
    }
  }
  return bestRatio >= 0.2 ? best : null;
}

function flushPageDwell() {
  if (!store._pageCtx || pageDwellPending < 1) {
    pageDwellPending = 0;
    return;
  }
  const sec = pageDwellPending;
  pageDwellPending = 0;
  const ctx = store._pageCtx;

  if (ctx.type === 'home') {
    store.pages.home = (store.pages.home || 0) + sec;
    store.totals.activeSec = (store.totals.activeSec || 0) + sec;
  } else if (ctx.type === 'report') {
    store.pages.report = (store.pages.report || 0) + sec;
    store.totals.activeSec = (store.totals.activeSec || 0) + sec;
  } else if (ctx.type === 'module') {
    const entry = ensureMod(ctx.subjectId, ctx.moduleId);
    entry.time.a = (entry.time.a || 0) + sec;
    store.totals.activeSec = (store.totals.activeSec || 0) + sec;
    const kind = getActiveSectionKind();
    if (kind) {
      const s = ensureSec(entry, kind);
      s.t = (s.t || 0) + sec;
    }
    bumpScrollDepth(entry);
  }
  scheduleSave();
}

function flushVideoDwell() {
  if (!videoWatchCtx || pendingVideoSec < VIDEO_MIN_FLUSH_SEC) {
    pendingVideoSec = 0;
    return;
  }
  const { subjectId, moduleId, key } = videoWatchCtx;
  const entry = ensureMod(subjectId, moduleId);
  if (!entry.vids[key]) {
    entry.vids[key] = { t: key, n: 0, s: 0, idx: 0, p: '?' };
  }
  entry.vids[key].s += pendingVideoSec;
  store.totals.videoSec = (store.totals.videoSec || 0) + pendingVideoSec;
  pendingVideoSec = 0;
  scheduleSave();
}

function flushAllDwell() {
  flushPageDwell();
  flushVideoDwell();
}

function isVideoPlayerVisible() {
  const hub = document.querySelector('.video-playlist-hub');
  const single = document.querySelector('#module-article .video-embed');
  const el = hub || single;
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  if (rect.height < 80) return false;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
  return visible / rect.height >= 0.25;
}

function globalTick() {
  if (document.hidden) {
    flushAllDwell();
    return;
  }
  pageDwellPending += 1;
  if (pageDwellPending >= FLUSH_EVERY_SEC) flushPageDwell();

  if (videoWatchCtx && isVideoPlayerVisible()) {
    pendingVideoSec += 1;
    if (pendingVideoSec >= FLUSH_EVERY_SEC) flushVideoDwell();
  }
}

function startGlobalMetricsTimer() {
  if (globalTickTimer) return;
  globalTickTimer = setInterval(globalTick, TICK_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flushAllDwell();
  });
  window.addEventListener('pagehide', flushAllDwell);
}

function stopGlobalMetricsTimer() {
  if (globalTickTimer) {
    clearInterval(globalTickTimer);
    globalTickTimer = null;
  }
  flushAllDwell();
  unbindModuleScroll();
}

export function trackClick(kind, detail = '') {
  if (!store) loadStore();
  store.totals.clicks += 1;
  const { subjectId, moduleId } = store._ctx || {};
  if (subjectId && moduleId && kind) {
    const entry = ensureMod(subjectId, moduleId);
    const ixKey = detail ? `${kind}:${detail}` : kind;
    entry.ix[ixKey] = (entry.ix[ixKey] || 0) + 1;
  }
  scheduleSave();
}

export function trackNav(target) {
  trackClick('nav', target);
}

export function trackModuleVisit(subjectId, moduleId) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const now = Date.now();
  if (!entry.v) {
    entry.v = now;
    store.totals.modules += 1;
  }
  entry.u = now;
  entry.time.n = (entry.time.n || 0) + 1;
  scheduleSave();
}

export function registerModuleSections(subjectId, moduleId, sectionKinds) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const unique = [...new Set(sectionKinds.filter((k) => k !== 'answers'))];
  entry.expected = unique;
  for (const kind of unique) ensureSec(entry, kind);
  scheduleSave();
}

export function registerModuleVideoCatalog(subjectId, moduleId, items) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  for (const [i, item] of items.entries()) {
    const k = videoKey(item.provider, item.id);
    if (!entry.vids[k]) {
      entry.vids[k] = {
        t: truncateTitle(item.displayTitle || item.clipTitle || item.title, 48),
        n: 0,
        s: 0,
        idx: i,
        p: item.provider,
      };
    }
  }
  scheduleSave();
}

function truncateTitle(t, max = 48) {
  const s = String(t ?? '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function trackVideoSelected(subjectId, moduleId, item, index) {
  if (!store) loadStore();
  flushVideoDwell();
  const entry = ensureMod(subjectId, moduleId);
  const k = videoKey(item.provider, item.id);
  if (!entry.vids[k]) {
    entry.vids[k] = {
      t: truncateTitle(item.displayTitle || item.clipTitle || item.title),
      n: 0,
      s: 0,
      idx: index,
      p: item.provider,
    };
  }
  entry.vids[k].n += 1;
  trackSection(subjectId, moduleId, 'media', 'video');
  videoWatchCtx = { subjectId, moduleId, key: k };
  pendingVideoSec = 0;
  scheduleSave();
}

export function trackSection(subjectId, moduleId, kind, via = 'view') {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const sec = ensureSec(entry, kind);
  if (via === 'view' && !sec.v) {
    sec.v = Date.now();
    store.totals.sections += 1;
  }
  sec.c = (sec.c || 0) + 1;
  scheduleSave();
}

export function trackReflectAction(subjectId, moduleId, { action, step, total }) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const sec = ensureSec(entry, 'reflect');
  const det = sec.det;
  det.tot = total;
  det.max = Math.max(det.max || 0, step);
  if (action === 'next') det.next = (det.next || 0) + 1;
  else if (action === 'prev') det.prev = (det.prev || 0) + 1;
  else if (action === 'dot') det.dot = (det.dot || 0) + 1;
  else if (action === 'done') det.done = true;
  if (!det.steps) det.steps = [];
  if (!det.steps.includes(step)) det.steps.push(step);
  trackSection(subjectId, moduleId, 'reflect', action);
  scheduleSave();
}

export function trackGlossaryFlip(subjectId, moduleId, { term, index, total, flipped }) {
  if (!store) loadStore();
  if (!flipped) return;
  const entry = ensureMod(subjectId, moduleId);
  const sec = ensureSec(entry, 'glossary');
  const det = sec.det;
  det.tot = total;
  det.flips = (det.flips || 0) + 1;
  if (!det.terms) det.terms = {};
  const key = String(term).slice(0, 60);
  det.terms[key] = (det.terms[key] || 0) + 1;
  if (!det.seen) det.seen = [];
  if (!det.seen.includes(key)) det.seen.push(key);
  trackSection(subjectId, moduleId, 'glossary', 'flip');
  scheduleSave();
}

export function trackPracticeAction(subjectId, moduleId, { action, caseNum, total }) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const sec = ensureSec(entry, 'practice');
  const det = sec.det;
  if (total) det.totCases = total;
  if (action === 'reveal') det.keys = (det.keys || 0) + 1;
  else if (action === 'step_next') det.next = (det.next || 0) + 1;
  else if (action === 'step_prev') det.prev = (det.prev || 0) + 1;
  else if (action === 'step_dot') det.dot = (det.dot || 0) + 1;
  else if (action === 'step_done') det.done = true;
  if (caseNum) det.maxCase = Math.max(det.maxCase || 0, caseNum);
  trackSection(subjectId, moduleId, 'practice', action);
  scheduleSave();
}

/** Cada clic en «Validar» del reto final. */
export function trackQuizValidation(subjectId, moduleId, data) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const {
    question,
    pick,
    correct,
    failed,
    key,
    total,
  } = data;
  const qk = String(question);
  if (!entry.quizLive) entry.quizLive = { val: 0, nav: 0, q: {} };
  entry.quizLive.val = (entry.quizLive.val || 0) + 1;
  entry.quizLive.total = total;
  if (!entry.quizLive.q[qk]) {
    entry.quizLive.q[qk] = { fail: 0, val: 0, tries: [], pick: null, key: key || null, ok: false };
  }
  const q = entry.quizLive.q[qk];
  q.val += 1;
  if (pick) q.tries.push(pick);
  if (q.tries.length > 15) q.tries = q.tries.slice(-15);
  if (key) q.key = key;
  if (correct) {
    q.ok = true;
    q.pick = pick;
    q.fail = failed;
  } else {
    q.fail = failed;
    q.ok = false;
  }
  trackSection(subjectId, moduleId, 'quiz', 'validate');
  scheduleSave();
}

/** Navegación entre preguntas del reto (anterior / siguiente). */
export function trackQuizNav(subjectId, moduleId, { action, from, to, total }) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  if (!entry.quizLive) entry.quizLive = { val: 0, nav: 0, q: {} };
  entry.quizLive.nav = (entry.quizLive.nav || 0) + 1;
  if (!entry.quizLive.navDet) entry.quizLive.navDet = { prev: 0, next: 0 };
  if (action === 'prev') entry.quizLive.navDet.prev += 1;
  else if (action === 'next') entry.quizLive.navDet.next += 1;
  entry.quizLive.lastNav = { action, from, to, total, at: Date.now() };
  trackClick('quiz_nav', `${action}:${from}->${to}`);
  scheduleSave();
}

export function trackQuizResult(subjectId, moduleId, payload) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const prevQuiz = entry.quiz || null;
  const basePerQ = prevQuiz?.perQ || {};
  const nextPerQ = payload.perQ || entry.quizLive?.q || {};
  const perQ = {};
  const perQKeys = new Set([...Object.keys(basePerQ), ...Object.keys(nextPerQ)]);
  for (const qk of perQKeys) {
    perQ[qk] = { ...(basePerQ[qk] || {}), ...(nextPerQ[qk] || {}) };
  }
  const validations =
    payload.validations ??
    entry.quizLive?.val ??
    prevQuiz?.validations ??
    Object.values(perQ).reduce((n, q) => n + (q.val || 0), 0);
  entry.quiz = {
    done: true,
    at: payload.finishedAt || prevQuiz?.at || Date.now(),
    total: payload.total,
    perfect: payload.perfect,
    wrong: payload.wrong,
    failed: payload.failed || [],
    picks: payload.picks || [],
    keys: payload.keys || [],
    validations,
    nav: payload.nav ?? entry.quizLive?.nav ?? prevQuiz?.nav ?? 0,
    navDet: payload.navDet ?? entry.quizLive?.navDet ?? prevQuiz?.navDet ?? null,
    results: payload.resultsViewed || prevQuiz?.results || false,
    resultsAt: payload.resultsViewed ? Date.now() : (prevQuiz?.resultsAt || 0),
    perQ,
  };
  delete entry.quizLive;
  trackSection(subjectId, moduleId, 'quiz', 'done');
  scheduleSave();
}

/** Guarda estado parcial del quiz para retomar tras recarga. */
export function saveQuizDraft(subjectId, moduleId, draft) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  entry.quizDraft = {
    ...draft,
    at: Date.now(),
  };
  scheduleSave();
}

/** Lee estado parcial del quiz guardado (si coincide con el tamaño actual). */
export function getQuizDraft(subjectId, moduleId, expectedTotal = 0) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const d = entry.quizDraft || null;
  if (!d) return null;
  if (expectedTotal > 0 && Number(d.total || 0) !== Number(expectedTotal)) return null;
  return d;
}

export function clearQuizDraft(subjectId, moduleId) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  if (entry.quizDraft) {
    delete entry.quizDraft;
    scheduleSave();
  }
}

export function teardownModuleObserver() {
  flushAllDwell();
  unbindModuleScroll();
  videoWatchCtx = null;
  pendingVideoSec = 0;
}

export function setupModuleProgressTracking(article, subjectId, moduleId) {
  if (!store) loadStore();
  setPageContext({ type: 'module', subjectId, moduleId });

  const sections = [...article.querySelectorAll('.study-section')];
  const kinds = sections.map((s) => {
    const m = s.className.match(/study-section--(\w+)/);
    return m ? m[1] : 'default';
  });
  registerModuleSections(subjectId, moduleId, kinds);

  const seen = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (!ent.isIntersecting || ent.intersectionRatio < 0.35) continue;
        const sec = ent.target;
        const kindM = sec.className.match(/study-section--(\w+)/);
        const kind = kindM ? kindM[1] : 'default';
        const token = `${moduleId}:${kind}`;
        if (seen.has(token)) continue;
        seen.add(token);
        trackSection(subjectId, moduleId, kind, 'view');
      }
    },
    { threshold: [0.35, 0.55] },
  );

  for (const sec of sections) observer.observe(sec);

  article.addEventListener(
    'click',
    (e) => {
      const sec = e.target.closest('.study-section');
      if (!sec || !article.contains(sec)) return;
      const kindM = sec.className.match(/study-section--(\w+)/);
      const kind = kindM ? kindM[1] : 'default';
      trackSection(subjectId, moduleId, kind, 'click');

      if (e.target.closest('.practica-caso-reveal-btn')) {
        trackPracticeAction(subjectId, moduleId, { action: 'reveal' });
      }
      if (e.target.closest('.practica-stepper-btn--next')) {
        trackPracticeAction(subjectId, moduleId, { action: 'step_next' });
      }
      if (e.target.closest('.practica-stepper-btn--prev')) {
        trackPracticeAction(subjectId, moduleId, { action: 'step_prev' });
      }
      if (e.target.closest('.practica-stepper-dot')) {
        trackPracticeAction(subjectId, moduleId, { action: 'step_dot' });
      }
      if (e.target.closest('.quiz-option, .quiz-challenge-btn')) trackClick('quiz_ui');
      if (e.target.closest('.video-jump-btn, .playlist-chip, .playlist-nav-btn')) {
        trackClick('video_nav');
      }
      if (e.target.closest('.explore-fact-card, .explore-conversation')) trackClick('explore');
      if (e.target.closest('.callout')) trackClick('callout');
      if (e.target.closest('.wisdom-quote')) trackClick('quote');
      if (e.target.closest('.scenario-card')) trackClick('scenario');
    },
    { passive: true },
  );
}

function moduleCompletion(entry) {
  const expected = entry.expected || [];
  if (!expected.length) return entry.v ? 50 : 0;
  let secScore = 0;
  for (const kind of expected) {
    const s = entry.sec[kind];
    if (s && (s.v || (s.c && s.c > 0) || (s.t && s.t > 0))) secScore += 1;
  }
  const secPct = (secScore / expected.length) * 70;
  const visitPct = entry.v ? 15 : 0;
  const hasQuiz = expected.includes('quiz');
  const quizPct = hasQuiz ? (entry.quiz?.done ? 15 : 0) : 15;
  const scrollPct = Math.min(10, Math.round((entry.scroll?.m || 0) / 10));
  const timePct = entry.time?.a >= 60 ? 5 : entry.time?.a >= 20 ? 3 : 0;
  return Math.round(Math.min(100, visitPct + secPct + quizPct + scrollPct + timePct));
}

export function formatDuration(sec) {
  const n = Math.max(0, Math.round(sec || 0));
  if (n < 60) return `${n} s`;
  const m = Math.floor(n / 60);
  const r = n % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return rm > 0 ? `${h} h ${rm} min` : `${h} h`;
  }
  return r > 0 ? `${m} min ${r} s` : `${m} min`;
}

function summarizeVideos(vids) {
  const list = Object.values(vids || {});
  if (!list.length) return null;
  const watched = list.filter((v) => v.n > 0 || v.s > 0);
  const totalSec = list.reduce((n, v) => n + (v.s || 0), 0);
  return { list, watched: watched.length, total: list.length, totalSec };
}

function quizBadge(ok, perfect) {
  if (ok && perfect) return '<span class="progress-quiz-cell progress-quiz-cell--perfect">A la 1ª</span>';
  if (ok) return '<span class="progress-quiz-cell progress-quiz-cell--ok">Correcta</span>';
  return '<span class="progress-quiz-cell progress-quiz-cell--bad">Incorrecta</span>';
}

function renderQuizDetailHtml(quiz) {
  if (!quiz) return '<p class="progress-detail-muted">Sin datos de reto</p>';
  const total = quiz.total || 0;
  const perfect = quiz.perfect ?? 0;
  const wrong = quiz.wrong ?? 0;
  const validations = quiz.validations ?? 0;
  const nav = quiz.nav ?? 0;
  const done = quiz.done ? 'Completado' : 'En progreso';
  const resultsLine = quiz.results
    ? ` · Panel de resultados visto${quiz.resultsAt ? ` (${formatDate(quiz.resultsAt)})` : ''}`
    : quiz.done
      ? ' · <span class="progress-detail-warn">No abrió «Ver resultados»</span>'
      : '';

  const perQ = quiz.perQ || {};
  const nums = Object.keys(perQ)
    .map(Number)
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  const fallbackNums =
    nums.length > 0
      ? nums
      : (quiz.picks || []).map((_, i) => i + 1);

  const rows = fallbackNums
    .map((n) => {
      const d = perQ[String(n)] || {};
      const fail = d.fail ?? quiz.failed?.[n - 1] ?? 0;
      const val = d.val ?? fail + (d.ok ? 1 : 0);
      const pick = d.pick ?? quiz.picks?.[n - 1] ?? '—';
      const key = d.key ?? quiz.keys?.[n - 1] ?? '—';
      const ok = d.ok ?? (pick && key && pick === key);
      const tries = (d.tries || []).map((t) => escapeHtml(t)).join(' → ') || escapeHtml(pick);
      const totalAttempts = Math.max(1, fail + (ok ? 1 : 0));
      const keyLabel = key && key !== '—' ? escapeHtml(key) : '<span class="progress-detail-muted">Sin clave</span>';
      return `<tr>
        <td>${String(n).padStart(2, '0')}</td>
        <td>${quizBadge(ok, fail === 0)}</td>
        <td><strong>${escapeHtml(pick)}</strong></td>
        <td>${keyLabel}</td>
        <td>${fail}</td>
        <td>${val}</td>
        <td>${totalAttempts}</td>
        <td class="progress-quiz-tries">${tries}</td>
      </tr>`;
    })
    .join('');

  return `
    <p class="progress-detail-p">
      <strong>${done}</strong>${resultsLine}
    </p>
    <ul class="progress-quiz-summary-stats">
      <li><strong>${perfect}/${total}</strong> correctas a la primera</li>
      <li><strong>${wrong}</strong> validaciones fallidas (total)</li>
      <li><strong>${validations}</strong> clics en «Validar»</li>
      <li><strong>${nav}</strong> cambios de pregunta (ant./sig.)${quiz.navDet ? ` (${quiz.navDet.prev} ant. · ${quiz.navDet.next} sig.)` : ''}</li>
    </ul>
    ${
      rows
        ? `<div class="progress-table-wrap progress-table-wrap--quiz">
        <table class="progress-mini-table progress-quiz-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Estado</th>
              <th>Eligió</th>
              <th>Clave</th>
              <th>Fallos</th>
              <th>Validar</th>
              <th>Intentos</th>
              <th>Secuencia al validar</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`
        : ''
    }`;
}

function renderIxList(ix) {
  const keys = Object.keys(ix || {});
  if (!keys.length) return '';
  const items = keys
    .sort()
    .map((k) => `<li>${escapeHtml(k)}: <strong>${ix[k]}</strong></li>`)
    .join('');
  return `<ul class="progress-detail-sublist">${items}</ul>`;
}

function sectionTimeTable(entry) {
  const kinds = entry.expected || Object.keys(entry.sec || {});
  if (!kinds.length) return '';
  const rows = kinds
    .map((kind) => {
      const sec = entry.sec[kind];
      const t = sec?.t || 0;
      const c = sec?.c || 0;
      const seen = Boolean(sec?.v || t > 0 || c > 0);
      return `<tr>
        <td>${escapeHtml(SECTION_LABELS[kind] || kind)}</td>
        <td>${seen ? 'Sí' : 'No'}</td>
        <td><strong>${formatDuration(t)}</strong></td>
        <td>${c}</td>
      </tr>`;
    })
    .join('');
  return `
    <table class="progress-mini-table">
      <thead><tr><th>Sección</th><th>Vista</th><th>Tiempo activo</th><th>Clics</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function sectionDetailLines(entry) {
  const lines = [];

  lines.push({
    kind: 'time',
    label: 'Tiempo en esta página',
    html: `<p class="progress-detail-p">
      <strong>${formatDuration(entry.time?.a)}</strong> con el episodio abierto y pestaña activa ·
      <strong>${entry.time?.n || 0}</strong> visita(s) ·
      scroll máximo <strong>${entry.scroll?.m || 0}%</strong>
    </p>
    ${sectionTimeTable(entry)}`,
  });

  const vids = summarizeVideos(entry.vids);
  if (vids && vids.total > 0) {
    const vidRows = vids.list
      .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))
      .map((v) => {
        const opened = v.n > 0 ? `${v.n}×` : '0';
        const time = formatDuration(v.s);
        return `<li class="progress-detail-sub">${escapeHtml(v.t || 'Vídeo')} (${v.p}): abierto ${opened}, <strong>${time}</strong></li>`;
      })
      .join('');
    lines.push({
      kind: 'media',
      label: 'Vídeos',
      html: `<p class="progress-detail-p">${vids.watched}/${vids.total} con actividad · <strong>${formatDuration(vids.totalSec)}</strong> total</p><ul class="progress-detail-sublist">${vidRows}</ul>`,
    });
  }

  const prac = entry.sec?.practice?.det;
  if (prac && (prac.keys || prac.next || prac.totCases)) {
    lines.push({
      kind: 'practice',
      label: SECTION_LABELS.practice,
      html: `<p class="progress-detail-p">
        Claves reveladas: <strong>${prac.keys || 0}</strong> ·
        Caso máx.: <strong>${prac.maxCase || '—'}</strong>${prac.totCases ? ` / ${prac.totCases}` : ''} ·
        Siguiente: ${prac.next || 0} · Anterior: ${prac.prev || 0}${prac.done ? ' · <span class="progress-detail-ok">Listo ✓</span>' : ''}
      </p>`,
    });
  }

  const refl = entry.sec?.reflect?.det;
  if (refl && refl.tot) {
    lines.push({
      kind: 'reflect',
      label: SECTION_LABELS.reflect,
      html: `<p class="progress-detail-p">
        Siguiente: <strong>${refl.next || 0}</strong> · Anterior: ${refl.prev || 0} · Puntos: ${refl.dot || 0} ·
        Pregunta <strong>${refl.max || 0}/${refl.tot}</strong>
        ${refl.done ? ' · <span class="progress-detail-ok">Listo ✓</span>' : ''}
      </p>`,
    });
  }

  const glo = entry.sec?.glossary?.det;
  if (glo && glo.tot) {
    const seen = (glo.seen || []).length;
    const termList = (glo.seen || []).slice(0, 12).map((t) => escapeHtml(t)).join(', ');
    lines.push({
      kind: 'glossary',
      label: SECTION_LABELS.glossary,
      html: `<p class="progress-detail-p"><strong>${seen}/${glo.tot}</strong> conceptos · <strong>${glo.flips || 0}</strong> volteos</p>${seen ? `<p class="progress-detail-terms">${termList}</p>` : ''}`,
    });
  }

  const quiz = entry.quiz;
  if (quiz?.done || quiz?.validations > 0) {
    lines.push({
      kind: 'quiz',
      label: SECTION_LABELS.quiz,
      html: renderQuizDetailHtml(quiz),
    });
  } else if (entry.quizLive?.val) {
    lines.push({
      kind: 'quiz',
      label: SECTION_LABELS.quiz,
      html: `<p class="progress-detail-p progress-detail-warn">Reto <strong>en progreso</strong>: ${entry.quizLive.val} validación(es) registrada(s)</p>`,
    });
  }

  const ixHtml = renderIxList(entry.ix);
  if (ixHtml) {
    lines.push({
      kind: 'ix',
      label: 'Otras interacciones',
      html: ixHtml,
    });
  }

  return lines;
}

function buildSubjectReport(subject, storeData) {
  const studyMods = subject.modules.filter((m) => m.kind === 'module');
  const rows = studyMods.map((mod) => {
    const k = modKey(subject.id, mod.id);
    const entry = storeData.mods[k] || null;
    const pct = entry ? moduleCompletion(entry) : 0;
    const visited = Boolean(entry?.v);
    const sections = (entry?.expected || []).map((kind) => {
      const s = entry?.sec?.[kind];
      const ok = Boolean(s && (s.v || s.c > 0 || s.t > 0));
      return {
        kind,
        label: SECTION_LABELS[kind] || kind,
        ok,
        clicks: s?.c || 0,
        timeSec: s?.t || 0,
      };
    });

    // "Actividad real" para no ensuciar el informe con episodios abiertos pero sin datos medibles.
    // Se considera actividad si hubo tiempo activo, scroll, clics en secciones,
    // respuestas/reto completado, vídeos con actividad o volteos.
    const hasAnyMeasuredActivity =
      Boolean(entry?.time?.a && entry.time.a > 0) ||
      Boolean(entry?.scroll?.m && entry.scroll.m > 0) ||
      (entry &&
        Object.values(entry.sec || {}).some((s) => Boolean(s?.v || (s?.c || 0) > 0 || (s?.t || 0) > 0))) ||
      Boolean(entry?.quiz?.done) ||
      (entry &&
        Object.values(entry.vids || {}).some((v) => Boolean((v?.n || 0) > 0 || (v?.s || 0) > 0))) ||
      Boolean(entry?.sec?.glossary?.det?.flips && entry.sec.glossary.det.flips > 0) ||
      Boolean(entry?.sec?.reflect?.det?.max && entry.sec.reflect.det.max > 0);

    return {
      id: mod.id,
      title: mod.title,
      visited,
      pct,
      pageTimeSec: entry?.time?.a || 0,
      visits: entry?.time?.n || 0,
      scrollMax: entry?.scroll?.m || 0,
      sections,
      quiz: entry?.quiz || null,
      detailLines: hasAnyMeasuredActivity && entry ? sectionDetailLines(entry) : [],
      hasAnyMeasuredActivity,
    };
  });
  const avg =
    rows.length > 0 ? Math.round(rows.reduce((n, r) => n + r.pct, 0) / rows.length) : 0;
  const visitedCount = rows.filter((r) => r.visited).length;
  const subjectTime = rows.reduce((n, r) => n + r.pageTimeSec, 0);
  const activeRows = rows.filter((r) => r.hasAnyMeasuredActivity);
  return {
    subject,
    rows,
    activeRows,
    avg,
    visitedCount,
    total: rows.length,
    activeTotal: activeRows.length,
    subjectTimeSec: subjectTime,
  };
}

export function buildProgressReport(subjects) {
  if (!store) loadStore();
  flushAllDwell();
  const subjectReports = subjects.map((s) => buildSubjectReport(s, store));
  const allStudy = subjects.flatMap((s) => s.modules.filter((m) => m.kind === 'module'));
  const globalPct =
    allStudy.length > 0
      ? Math.round(
          subjectReports.reduce((n, sr) => n + sr.avg * sr.total, 0) / Math.max(1, allStudy.length),
        )
      : 0;
  const modulesVisited = Object.values(store.mods).filter((m) => m.v).length;
  return {
    sid: store.sid,
    name: store.name,
    created: store.created,
    updated: store.updated,
    sessions: store.sessions || 1,
    totals: store.totals,
    pages: store.pages,
    globalPct,
    modulesVisited,
    modulesTotal: allStudy.length,
    totalVideoSec: store.totals.videoSec || 0,
    totalActiveSec: store.totals.activeSec || 0,
    subjects: subjectReports,
  };
}

function formatDate(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(ts);
  }
}

function pctClass(pct) {
  if (pct >= 90) return 'progress-pct--ok';
  if (pct >= 60) return 'progress-pct--mid';
  return 'progress-pct--low';
}

function renderModuleDetailBlock(row) {
  if (!row.detailLines?.length) {
    return '';
  }
  const blocks = row.detailLines
    .map(
      (d) => `
      <div class="progress-detail-block progress-detail-block--${d.kind}">
        <h4 class="progress-detail-heading">${escapeHtml(d.label)}</h4>
        ${d.html}
      </div>`,
    )
    .join('');
  return `<tr class="progress-mod-detail-row"><td colspan="5"><div class="progress-detail-panel">${blocks}</div></td></tr>`;
}

export function renderProgressReportHtml(report) {
  const activeSubjects = report.subjects.filter((sr) => (sr.activeTotal || 0) > 0);
  const subjectBlocks = activeSubjects
    .map((sr) => {
      const moduleRows = sr.activeRows
        .map((row) => {
          const secCells = row.sections
            .map((s) => {
              const timeHint = s.timeSec > 0 ? ` · ${formatDuration(s.timeSec)}` : '';
              return `<span class="progress-sec-chip ${s.ok ? 'is-done' : ''}" title="${escapeHtml(s.label)}: ${s.clicks} clics${timeHint}">${escapeHtml(s.label.slice(0, 12))}${s.ok ? ' ✓' : ''}</span>`;
            })
            .join('');
          const quizBrief =
            row.quiz?.done
              ? `<span class="progress-quiz-badge is-done" title="Reto final">Reto: ${row.quiz.perfect}/${row.quiz.total} a la 1ª · ${row.quiz.wrong} fallos · ${row.quiz.validations ?? '—'} validaciones${row.quiz.results ? '' : ' (sin panel)'}</span>`
              : '';
          const secsRow = row.hasAnyMeasuredActivity
            ? `<tr class="progress-mod-secs-row"><td colspan="5"><div class="progress-sec-chips">${secCells || '—'}</div>${quizBrief}</td></tr>`
            : '';
          const detailRow = row.hasAnyMeasuredActivity
            ? renderModuleDetailBlock(row)
            : '';
          return `<tr class="progress-mod-row">
            <td class="progress-mod-title">${escapeHtml(row.title)}</td>
            <td class="progress-mod-visit">${row.visited ? 'Sí' : 'No'}</td>
            <td class="progress-mod-time"><strong>${formatDuration(row.pageTimeSec)}</strong><span class="progress-mod-time-sub">${row.visits} visita(s)</span></td>
            <td class="progress-mod-scroll">${row.scrollMax}%</td>
            <td class="progress-mod-pct"><span class="progress-pct ${pctClass(row.pct)}">${row.pct}%</span></td>
          </tr>
          ${secsRow}
          ${detailRow}`;
        })
        .join('');
      return `
        <section class="progress-subject-block">
          <header class="progress-subject-head">
            <h2>${escapeHtml(sr.subject.name)}</h2>
            <p class="progress-subject-meta">
              ${sr.activeTotal}/${sr.total} episodios con actividad ·
              <strong>${formatDuration(sr.subjectTimeSec)}</strong> en esta materia ·
              promedio <strong class="progress-pct ${pctClass(sr.avg)}">${sr.avg}%</strong>
            </p>
          </header>
          <div class="progress-table-wrap">
            <table class="progress-table progress-table--detailed">
              <thead>
                <tr>
                  <th>Episodio</th>
                  <th>Visitado</th>
                  <th>Tiempo en página</th>
                  <th>Scroll máx.</th>
                  <th>Avance</th>
                </tr>
              </thead>
              <tbody>${moduleRows}</tbody>
            </table>
          </div>
        </section>`;
    })
    .join('');

  const emptyState = activeSubjects.length
    ? ''
    : `<section class="progress-empty-state"><p>Aún no hay actividad registrada en episodios. Recorre el curso y vuelve a abrir este informe.</p></section>`;

  return `
    <article class="progress-report" id="progress-report">
      <header class="progress-report-hero">
        <p class="progress-report-eyebrow">Evidencia de evaluación · estudIA</p>
        <h1 class="progress-report-title">Informe completo de actividad</h1>
        <p class="progress-report-lead">Métricas medibles en el navegador: <strong>tiempo por página y sección</strong>, scroll, vídeos, retos, Para pensar, Conceptos clave y más. Captura de pantalla completa de esta página.</p>
        <div class="progress-report-actions">
          <button type="button" class="progress-action-btn" id="progress-save-pdf-btn" aria-label="Guardar este informe en PDF">
            Guardar informe en PDF
          </button>
        </div>
      </header>

      <div class="progress-report-summary">
        <div class="progress-summary-card progress-summary-card--main">
          <span class="progress-summary-label">Completitud</span>
          <span class="progress-summary-value progress-pct ${pctClass(report.globalPct)}">${report.globalPct}%</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Tiempo de estudio activo</span>
          <span class="progress-summary-value">${formatDuration(report.totalActiveSec)}</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Tiempo en vídeos</span>
          <span class="progress-summary-value">${formatDuration(report.totalVideoSec)}</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Episodios / sesiones</span>
          <span class="progress-summary-value">${report.modulesVisited}/${report.modulesTotal} · ${report.sessions} ses.</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Inicio</span>
          <span class="progress-summary-value progress-summary-value--sm">${formatDuration(report.pages?.home || 0)}</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Clics totales</span>
          <span class="progress-summary-value">${report.totals.clicks}</span>
        </div>
      </div>

      <section class="progress-metrics-legend">
        <h2 class="progress-metrics-legend-title">Qué se mide</h2>
        <ul class="progress-metrics-legend-list">
          <li><strong>Tiempo en página:</strong> episodio abierto, pestaña visible (no minimizada).</li>
          <li><strong>Tiempo por sección:</strong> segundos con esa tarjeta visible al menos ~20% en pantalla.</li>
          <li><strong>Scroll máx.:</strong> qué tan abajo llegó en el episodio (0–100%).</li>
          <li><strong>Vídeos:</strong> veces que abrió cada clip + tiempo con reproductor visible.</li>
          <li><strong>Reto final:</strong> por pregunta — respuesta elegida, clave, fallos, clics en Validar, secuencia de intentos.</li>
          <li><strong>Para pensar / Práctica:</strong> clics en navegación, claves y pasos.</li>
        </ul>
      </section>

      <form class="progress-name-form" id="progress-name-form">
        <label for="progress-student-name">Tu nombre (opcional)</label>
        <input type="text" id="progress-student-name" name="name" maxlength="80" placeholder="Nombre y apellidos" value="${escapeHtml(report.name)}" autocomplete="name" />
      </form>

      <dl class="progress-meta-grid">
        <div><dt>ID</dt><dd><code>${escapeHtml(report.sid)}</code></dd></div>
        <div><dt>Primera visita</dt><dd>${formatDate(report.created)}</dd></div>
        <div><dt>Última actividad</dt><dd>${formatDate(report.updated)}</dd></div>
        <div><dt>Informe generado</dt><dd>${formatDate(Date.now())}</dd></div>
      </dl>

      ${emptyState}
      ${subjectBlocks}

      <footer class="progress-report-foot">
        <p>Desplázate por todas las materias antes de capturar. Si falta tiempo en un episodio, el alumno debe abrirlo y permanecer con la pestaña activa.</p>
        <a class="progress-back-link" href="#/">← Volver al curso</a>
      </footer>
    </article>`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function mountProgressReport(container, subjects) {
  initProgressTracker();
  setPageContext({ type: 'report' });
  const report = buildProgressReport(subjects);
  container.innerHTML = renderProgressReportHtml(report);
  const savePdfBtn = container.querySelector('#progress-save-pdf-btn');
  savePdfBtn?.addEventListener('click', () => {
    window.print();
  });
  const nameInput = container.querySelector('#progress-student-name');
  nameInput?.addEventListener('change', () => setStudentName(nameInput.value));
  nameInput?.addEventListener('blur', () => setStudentName(nameInput.value));
}
