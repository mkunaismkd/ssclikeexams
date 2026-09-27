/* Browser client for the Groq-backed /api/ai endpoint. */
(function (root) {
  const EP = root.EP || (root.EP = {});
  let status = null; // null = unknown, true/false after /api/health

  async function available() {
    if (status !== null) return status;
    if (location.protocol === 'file:') return (status = false);
    try {
      const r = await fetch('api/health', { cache: 'no-store' });
      status = r.ok && (await r.json()).ai === true;
    } catch { status = false; }
    return status;
  }

  async function call(payload) {
    if (!(await available())) throw new Error(location.protocol === 'file:'
      ? 'AI needs the server. Run "node server.js" and open http://localhost:3000.'
      : 'AI is not configured. Add GROQ_API_KEY on the server (free key at console.groq.com).');
    const r = await fetch('api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    let data = {};
    try { data = await r.json(); } catch { /* non-JSON error page */ }
    if (!r.ok) throw new Error(data.error || `AI request failed (${r.status})`);
    return data;
  }

  const examName = () => (EP.TRACKS[EP.store.state.profile.track] || {}).name || 'SSC CGL';

  EP.ai = {
    available,
    tutor: (messages) => call({ mode: 'tutor', exam: examName(), messages }).then((d) => d.text),
    explain: (question, chosen) => call({ mode: 'explain', exam: examName(), question, chosen }).then((d) => d.text),
    analyze: (stats) => call({ mode: 'analyze', exam: examName(), stats }).then((d) => d.text),
    generate: async ({ subject, topic, count, difficulty }) => {
      const d = await call({ mode: 'generate', exam: examName(), subject, topic, count, difficulty });
      return d.questions.map((q, i) => ({ ...q, id: 'ai-' + EP.hash(q.q + i + Date.now()), subject, topic: topic || 'AI Mixed', source: 'ai' }));
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
