/* Browser client for the Groq-backed /api/ai endpoint. */
(function (root) {
  const EP = root.EP || (root.EP = {});
  let status = null; // null = unknown, true/false after /api/health
  let reason = '';    // why AI is unavailable, shown to the user

  async function available() {
    if (status !== null) return status;
    if (location.protocol === 'file:') { reason = 'AI needs the server. Run "node server.js" and open http://localhost:3000.'; return (status = false); }
    try {
      const r = await fetch('api/health', { cache: 'no-store' });
      const data = r.ok ? await r.json().catch(() => null) : null;
      if (!data) reason = `The AI endpoint /api/health is not reachable (HTTP ${r.status}). Check that the api/ folder is deployed.`;
      else if (!data.ai) reason = 'The server is running but GROQ_API_KEY is empty. Paste your key (starts with gsk_) into the GROQ_API_KEY environment variable and redeploy.';
      status = Boolean(data && data.ai);
    } catch (e) { reason = 'Could not reach the AI server: ' + e.message; status = false; }
    return status;
  }

  async function call(payload) {
    if (!(await available())) throw new Error(reason);
    const token = EP.sync && EP.sync.accessToken ? await EP.sync.accessToken() : null;
    if (!token) throw new Error('This is a private app — sign in (☁ at the top) to use the AI features.');
    const r = await fetch('api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(payload) });
    let data = {};
    try { data = await r.json(); } catch { /* non-JSON error page */ }
    if (!r.ok) throw new Error(data.error || `AI request failed (${r.status})`);
    return data;
  }

  const pyqLabel = (p) => [p.exam, p.shift || p.year].filter(Boolean).join(', ');
  EP.pyqLabel = pyqLabel;
  const examName = () => (EP.TRACKS[EP.store.state.profile.track] || {}).name || 'SSC CGL';

  EP.ai = {
    available,
    tutor: (messages) => call({ mode: 'tutor', exam: examName(), messages }).then((d) => d.text),
    explain: (question, chosen) => call({ mode: 'explain', exam: examName(), question, chosen }).then((d) => d.text),
    analyze: (stats) => call({ mode: 'analyze', exam: examName(), stats }).then((d) => d.text),
    /** Questions modelled on a PYQ (same concept and difficulty, new numbers/wording). */
    similar: async (question, count = 5) => {
      const d = await call({ mode: 'similar', exam: examName(), count, question: { q: question.q, options: question.options, answer: question.answer, topic: question.topic, source: question.pyq ? pyqLabel(question.pyq) : '' } });
      return d.questions.map((q, i) => ({ ...q, id: 'ai-' + EP.hash(q.q + i + Date.now()), subject: question.subject, topic: question.topic, source: 'ai', similarTo: question.pyq ? pyqLabel(question.pyq) : '' }));
    },
    /** Turn pasted question-paper text into structured questions. */
    extract: (text, exam) => call({ mode: 'extract', exam, text }).then((d) => d.questions),
    generate: async ({ subject, topic, count, difficulty }) => {
      const d = await call({ mode: 'generate', exam: examName(), subject, topic, count, difficulty });
      return d.questions.map((q, i) => ({ ...q, id: 'ai-' + EP.hash(q.q + i + Date.now()), subject, topic: topic || 'AI Mixed', source: 'ai' }));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
