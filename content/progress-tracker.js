/**
 * Seguimiento de avance del curso (cookies + respaldo en localStorage).
 * Los datos viven en el navegador del alumno; la página secreta muestra el informe para captura.
 */

export const PROGRESS_REPORT_SLUG = 'informe-avance-estudIA';

const COOKIE_PREFIX = 'estudia_p';
const COOKIE_SID = 'estudia_sid';
const LS_KEY = 'estudia_progress_v2';
const DATA_VERSION = 2;
const MAX_CHUNK = 3600;
const SAVE_DEBOUNCE_MS = 400;

const SECTION_LABELS = {
  challenge: 'El reto',
  learn: 'Cómo funciona',
  practice: 'Práctica',
  world: 'En el mundo',
  reflect: 'Para pensar',
  glossary: 'Palabras clave',
  explore: 'Explora',
  quiz: 'Reto final',
  answers: 'Respuestas',
  media: 'Multimedia',
  default: 'Sección',
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
  const names = document.cookie
    .split(';')
    .map((c) => c.trim().split('=')[0])
    .filter((n) => n.startsWith(prefix));
  for (const n of names) {
    document.cookie = `${n}=; path=/; max-age=0`;
  }
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
    totals: { clicks: 0, modules: 0, sections: 0 },
    mods: {},
  };
}

let store = null;
let saveTimer = null;
let currentModuleObserver = null;

function modKey(subjectId, moduleId) {
  return `${subjectId}|${moduleId}`;
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
    };
  }
  return store.mods[k];
}

function loadStore() {
  let data = loadFromCookies();
  if (!data) {
    try {
      const ls = localStorage.getItem(LS_KEY);
      if (ls) data = JSON.parse(ls);
    } catch {
      /* ignore */
    }
  }
  if (!data || data.v !== DATA_VERSION) {
    store = emptyStore();
    if (data?.name) store.name = data.name;
  } else {
    store = data;
    store.sid = store.sid || ensureSid();
  }
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
  store._ctx = { subjectId, moduleId };
  const entry = ensureMod(subjectId, moduleId);
  const now = Date.now();
  if (!entry.v) {
    entry.v = now;
    store.totals.modules += 1;
  }
  entry.u = now;
  scheduleSave();
}

export function registerModuleSections(subjectId, moduleId, sectionKinds) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  const unique = [...new Set(sectionKinds.filter((k) => k !== 'answers'))];
  entry.expected = unique;
  for (const kind of unique) {
    if (!entry.sec[kind]) entry.sec[kind] = { v: 0, c: 0 };
  }
  scheduleSave();
}

export function trackSection(subjectId, moduleId, kind, via = 'view') {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  if (!entry.sec[kind]) entry.sec[kind] = { v: 0, c: 0 };
  const sec = entry.sec[kind];
  if (via === 'view' && !sec.v) {
    sec.v = Date.now();
    store.totals.sections += 1;
  }
  sec.c = (sec.c || 0) + 1;
  scheduleSave();
}

export function trackQuizResult(subjectId, moduleId, payload) {
  if (!store) loadStore();
  const entry = ensureMod(subjectId, moduleId);
  entry.quiz = {
    done: true,
    at: Date.now(),
    total: payload.total,
    perfect: payload.perfect,
    wrong: payload.wrong,
    picks: payload.picks,
    results: payload.resultsViewed || false,
  };
  trackSection(subjectId, moduleId, 'quiz', 'quiz');
  scheduleSave();
}

export function teardownModuleObserver() {
  currentModuleObserver?.disconnect();
  currentModuleObserver = null;
}

export function setupModuleProgressTracking(article, subjectId, moduleId) {
  if (!store) loadStore();
  teardownModuleObserver();

  trackModuleVisit(subjectId, moduleId);

  const sections = [...article.querySelectorAll('.study-section')];
  const kinds = sections.map((s) => {
    const m = s.className.match(/study-section--(\w+)/);
    return m ? m[1] : 'default';
  });
  registerModuleSections(subjectId, moduleId, kinds);

  const seen = new Set();
  currentModuleObserver = new IntersectionObserver(
    (entries) => {
      for (const ent of entries) {
        if (!ent.isIntersecting || ent.intersectionRatio < 0.35) continue;
        const sec = ent.target.closest('.study-section');
        if (!sec) continue;
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

  for (const sec of sections) {
    currentModuleObserver.observe(sec);
  }

  article.addEventListener(
    'click',
    (e) => {
      const sec = e.target.closest('.study-section');
      if (!sec || !article.contains(sec)) return;
      const kindM = sec.className.match(/study-section--(\w+)/);
      const kind = kindM ? kindM[1] : 'default';
      trackSection(subjectId, moduleId, kind, 'click');

      if (e.target.closest('.glossary-flashcard')) trackClick('glossary');
      if (e.target.closest('.practica-caso-reveal-btn')) trackClick('practice_key');
      if (e.target.closest('.reflect-stepper-btn, .reflect-stepper-dot')) trackClick('reflect');
      if (e.target.closest('.practica-stepper-btn, .practica-stepper-dot')) trackClick('practice_step');
      if (e.target.closest('.quiz-option, .quiz-challenge-btn')) trackClick('quiz_ui');
      if (e.target.closest('.video-jump-btn, .playlist-chip')) trackClick('video');
      if (e.target.closest('.explore-fact-card, .explore-conversation')) trackClick('explore');
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
    if (s && (s.v || (s.c && s.c > 0))) secScore += 1;
  }
  const secPct = (secScore / expected.length) * 70;
  const visitPct = entry.v ? 15 : 0;
  const hasQuiz = expected.includes('quiz');
  let quizPct = 0;
  if (hasQuiz) {
    quizPct = entry.quiz?.done ? 15 : 0;
  } else {
    quizPct = 15;
  }
  const ixCount = Object.keys(entry.ix || {}).length;
  const ixPct = Math.min(15, ixCount * 3);
  return Math.round(Math.min(100, visitPct + secPct + quizPct + ixPct + interactPct));
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
      const ok = Boolean(s && (s.v || (s.c && s.c > 0)));
      return { kind, label: SECTION_LABELS[kind] || kind, ok, clicks: s?.c || 0 };
    });
    return {
      id: mod.id,
      title: mod.title,
      visited,
      pct,
      sections,
      quiz: entry?.quiz || null,
      interactives: entry?.ix || {},
    };
  });
  const avg =
    rows.length > 0
      ? Math.round(rows.reduce((n, r) => n + r.pct, 0) / rows.length)
      : 0;
  const visitedCount = rows.filter((r) => r.visited).length;
  return { subject, rows, avg, visitedCount, total: rows.length };
}

export function buildProgressReport(subjects) {
  if (!store) loadStore();
  const subjectReports = subjects.map((s) => buildSubjectReport(s, store));
  const allStudy = subjects.flatMap((s) => s.modules.filter((m) => m.kind === 'module'));
  const globalPct =
    allStudy.length > 0
      ? Math.round(
          subjectReports.reduce((n, sr) => n + sr.avg * sr.total, 0) /
            Math.max(1, allStudy.length),
        )
      : 0;
  const modulesVisited = Object.values(store.mods).filter((m) => m.v).length;
  return {
    sid: store.sid,
    name: store.name,
    created: store.created,
    updated: store.updated,
    totals: store.totals,
    globalPct,
    modulesVisited,
    modulesTotal: allStudy.length,
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

export function renderProgressReportHtml(report) {
  const subjectBlocks = report.subjects
    .map((sr) => {
      const moduleRows = sr.rows
        .map((row) => {
          const secCells = row.sections
            .map(
              (s) =>
                `<span class="progress-sec-chip ${s.ok ? 'is-done' : ''}" title="${escapeHtml(s.label)}: ${s.clicks} clics">${escapeHtml(s.label.slice(0, 12))}${s.ok ? ' ✓' : ''}</span>`,
            )
            .join('');
          const quizInfo = row.quiz?.done
            ? `<span class="progress-quiz-badge is-done">Reto: ${row.quiz.perfect}/${row.quiz.total} a la 1ª · ${row.quiz.wrong} fallos</span>`
            : row.sections.some((s) => s.kind === 'quiz')
              ? '<span class="progress-quiz-badge">Reto pendiente</span>'
              : '';
          return `<tr>
            <td class="progress-mod-title">${escapeHtml(row.title)}</td>
            <td class="progress-mod-visit">${row.visited ? 'Sí' : 'No'}</td>
            <td class="progress-mod-pct"><span class="progress-pct ${pctClass(row.pct)}">${row.pct}%</span></td>
            <td class="progress-mod-secs"><div class="progress-sec-chips">${secCells || '—'}</div>${quizInfo}</td>
          </tr>`;
        })
        .join('');
      return `
        <section class="progress-subject-block">
          <header class="progress-subject-head">
            <h2>${escapeHtml(sr.subject.name)}</h2>
            <p class="progress-subject-meta">${sr.visitedCount} / ${sr.total} episodios abiertos · <strong class="progress-pct ${pctClass(sr.avg)}">${sr.avg}%</strong> promedio</p>
          </header>
          <div class="progress-table-wrap">
            <table class="progress-table">
              <thead>
                <tr>
                  <th>Episodio</th>
                  <th>Visitado</th>
                  <th>Avance</th>
                  <th>Secciones y reto</th>
                </tr>
              </thead>
              <tbody>${moduleRows}</tbody>
            </table>
          </div>
        </section>`;
    })
    .join('');

  return `
    <article class="progress-report" id="progress-report">
      <header class="progress-report-hero">
        <p class="progress-report-eyebrow">Evidencia de avance · estudIA</p>
        <h1 class="progress-report-title">Informe de recorrido del curso</h1>
        <p class="progress-report-lead">Este informe resume lo registrado en <strong>cookies de tu navegador</strong> mientras navegaste el material. Toma una <strong>captura de pantalla completa</strong> de esta página y envíala como evidencia.</p>
      </header>

      <div class="progress-report-summary">
        <div class="progress-summary-card progress-summary-card--main">
          <span class="progress-summary-label">Completitud global</span>
          <span class="progress-summary-value progress-pct ${pctClass(report.globalPct)}">${report.globalPct}%</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Episodios visitados</span>
          <span class="progress-summary-value">${report.modulesVisited} / ${report.modulesTotal}</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Clics registrados</span>
          <span class="progress-summary-value">${report.totals.clicks}</span>
        </div>
        <div class="progress-summary-card">
          <span class="progress-summary-label">Secciones vistas</span>
          <span class="progress-summary-value">${report.totals.sections}</span>
        </div>
      </div>

      <form class="progress-name-form" id="progress-name-form">
        <label for="progress-student-name">Tu nombre (opcional, aparece en la captura)</label>
        <input type="text" id="progress-student-name" name="name" maxlength="80" placeholder="Nombre y apellidos" value="${escapeHtml(report.name)}" autocomplete="name" />
      </form>

      <dl class="progress-meta-grid">
        <div><dt>ID de seguimiento</dt><dd><code>${escapeHtml(report.sid)}</code></dd></div>
        <div><dt>Primera visita</dt><dd>${formatDate(report.created)}</dd></div>
        <div><dt>Última actividad</dt><dd>${formatDate(report.updated)}</dd></div>
        <div><dt>Generado</dt><dd>${formatDate(Date.now())}</dd></div>
      </dl>

      ${subjectBlocks}

      <footer class="progress-report-foot">
        <p><strong>Instrucciones:</strong> Asegúrate de que se vean el porcentaje global, tu nombre (si lo escribiste) y las tablas de materias. Usa captura de pantalla completa (no solo un recorte).</p>
        <p class="progress-report-note">Los datos se guardan solo en este dispositivo y navegador. Si borras cookies o usas otro equipo, el informe empezará de cero.</p>
        <a class="progress-back-link" href="#/">← Volver al inicio del curso</a>
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
  const report = buildProgressReport(subjects);
  container.innerHTML = renderProgressReportHtml(report);
  const nameInput = container.querySelector('#progress-student-name');
  nameInput?.addEventListener('change', () => setStudentName(nameInput.value));
  nameInput?.addEventListener('blur', () => setStudentName(nameInput.value));
}
