/* Local progress store (per device). Wrapped in try/catch so the app still works if storage is blocked. */
(function (root) {
  const EP = root.EP || (root.EP = {});
  const KEY = 'examprep:v1';
  const BOX_DAYS = [0, 0, 1, 3, 7, 16, 35]; // Leitner intervals: a new mistake is due today, then 1, 3, 7, 16, 35 days

  const today = (d = new Date()) => {
    const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return z.toISOString().slice(0, 10);
  };
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return today(d); };

  const blank = () => ({
    profile: { track: 'ssc', examDate: '', dailyGoal: 50, name: '' },
    topics: {},    // "subject|topic" → { c, w, ms }
    days: {},      // "YYYY-MM-DD" → { n, c }
    mocks: [],     // results
    mistakes: {},  // id → { q, box, due }
    bookmarks: {}, // id → q
    done: {},      // "subject|topic" → true (syllabus checklist)
    chat: [],
    pyqPapers: {}, // imported previous-year papers: id → { id, examKey, exam, year, shift, source, questions }
  });

  let state;
  try { state = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { state = blank(); }
  state.profile = Object.assign(blank().profile, state.profile);

  let onChange = null; // set by sync.js: called after every local change
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ } };
  const save = () => { persist(); if (onChange) onChange(); };

  /** Replace everything (used when adopting synced cloud data). Does not trigger another sync. */
  function replaceState(obj) {
    state = Object.assign(blank(), obj || {});
    state.profile = Object.assign(blank().profile, state.profile);
    persist();
  }

  /**
   * Merge two progress documents (e.g. this device's offline progress with the cloud copy).
   * Counters take the larger side (or are added when `add` is set — for two separate histories, like a
   * device's offline progress joining an account for the first time), collections are unioned, and `b`
   * wins ties on simple settings.
   */
  function mergeStates(a, b, { add = false } = {}) {
    a = Object.assign(blank(), a || {}); b = Object.assign(blank(), b || {});
    const out = blank();
    out.profile = { ...a.profile };
    for (const [k, v] of Object.entries(b.profile || {})) if (v !== '' && v != null) out.profile[k] = v;
    const bigger = (x, y, size) => (!x ? y : !y ? x : size(y) >= size(x) ? y : x);
    const sum = (x, y) => { const o = { ...(x || {}) }; for (const [k, v] of Object.entries(y || {})) o[k] = (o[k] || 0) + v; return o; };
    for (const k of new Set([...Object.keys(a.topics), ...Object.keys(b.topics)])) out.topics[k] = add ? sum(a.topics[k], b.topics[k]) : bigger(a.topics[k], b.topics[k], (t) => t.c + t.w);
    for (const k of new Set([...Object.keys(a.days), ...Object.keys(b.days)])) out.days[k] = add ? sum(a.days[k], b.days[k]) : bigger(a.days[k], b.days[k], (d) => d.n);
    const mockKey = (m) => [m.date, m.examKey, m.title || '', m.score, Math.round(m.secs || 0)].join('|');
    const mocks = new Map();
    for (const m of [...a.mocks, ...b.mocks]) mocks.set(mockKey(m), m);
    out.mocks = [...mocks.values()].sort((x, y) => String(x.date).localeCompare(String(y.date)));
    for (const k of ['mistakes', 'bookmarks', 'pyqPapers']) out[k] = { ...a[k], ...b[k] };
    for (const [k, v] of Object.entries({ ...a.done, ...b.done })) out.done[k] = Boolean(a.done[k] || b.done[k] || v);
    out.chat = (b.chat || []).length >= (a.chat || []).length ? b.chat : a.chat;
    if (a.pyqFilter || b.pyqFilter) out.pyqFilter = b.pyqFilter || a.pyqFilter;
    return out;
  }

  /** Keep only what's needed to re-show a question. */
  const slim = (q) => ({ id: q.id, subject: q.subject, topic: q.topic, q: q.q, options: q.options, answer: q.answer, explanation: q.explanation });

  function record(q, chosen, ms) {
    const ok = chosen === q.answer;
    const k = q.subject + '|' + q.topic;
    const t = state.topics[k] || (state.topics[k] = { c: 0, w: 0, ms: 0 });
    if (chosen != null) { ok ? t.c++ : t.w++; t.ms += Math.min(ms || 0, 10 * 60000); }
    const d = state.days[today()] || (state.days[today()] = { n: 0, c: 0 });
    if (chosen != null) { d.n++; if (ok) d.c++; }
    const m = state.mistakes[q.id];
    if (chosen != null && !ok) state.mistakes[q.id] = { q: slim(q), box: 1, due: addDays(today(), BOX_DAYS[1]) };
    else if (ok && m) { m.box = Math.min(m.box + 1, BOX_DAYS.length - 1); m.due = addDays(today(), BOX_DAYS[m.box]); if (m.box === BOX_DAYS.length - 1) delete state.mistakes[q.id]; }
    save();
    return ok;
  }

  function streak() {
    let n = 0, d = today();
    if (!state.days[d]) d = addDays(d, -1); // today not started yet doesn't break the streak
    while (state.days[d] && state.days[d].n > 0) { n++; d = addDays(d, -1); }
    return n;
  }

  function subjectStats(subject) {
    let c = 0, w = 0, ms = 0;
    for (const [k, v] of Object.entries(state.topics)) if (k.startsWith(subject + '|')) { c += v.c; w += v.w; ms += v.ms; }
    return { c, w, n: c + w, acc: c + w ? c / (c + w) : null, avgSec: c + w ? ms / (c + w) / 1000 : null };
  }

  function weakTopics(subjects, limit = 5) {
    return Object.entries(state.topics)
      .map(([k, v]) => { const [subject, topic] = k.split('|'); return { subject, topic, n: v.c + v.w, acc: v.c / Math.max(1, v.c + v.w) }; })
      .filter((t) => subjects.includes(t.subject) && t.n >= 3)
      .sort((a, b) => a.acc - b.acc || b.n - a.n)
      .slice(0, limit);
  }

  function dueMistakes() {
    const t = today();
    return Object.values(state.mistakes).filter((m) => m.due <= t).map((m) => m.q);
  }

  function toggleBookmark(q) {
    if (state.bookmarks[q.id]) delete state.bookmarks[q.id]; else state.bookmarks[q.id] = slim(q);
    save();
    return Boolean(state.bookmarks[q.id]);
  }

  function exportData() { return JSON.stringify(state, null, 2); }
  function importData(json) { const s = JSON.parse(json); if (!s || typeof s !== 'object' || !s.profile) throw new Error('Not an ExamPrep backup file'); state = Object.assign(blank(), s); save(); }
  function reset() { state = blank(); save(); }
  function clearLocal() { state = blank(); persist(); }

  EP.store = {
    get state() { return state; }, save, replaceState, mergeStates, blank,
    set onChange(fn) { onChange = fn; }, record, streak, subjectStats, weakTopics, dueMistakes, toggleBookmark,
    exportData, importData, reset, clearLocal, today, addDays,
  };
})(typeof window !== 'undefined' ? window : globalThis);
