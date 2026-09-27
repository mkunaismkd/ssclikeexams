/* Question engine: one API over procedural generators and static banks. */
(function (root) {
  const EP = root.EP || require('./core.js');
  const BANK = root.EP_BANK || {};
  const { pick, shuffle, hash } = EP;

  const GEN = { quant: EP.quantTopics || {}, reasoning: EP.reasoningTopics || {}, ...(EP.aiGen || {}) };
  // Share of hand-written questions in a practice set for subjects that also have generators.
  const BANK_SHARE = { mlfund: 0.6, dl: 0.6, genai: 0.7 };

  function fromBank(subject, row) {
    const [topic, q, options, answer, explanation] = row;
    return { id: 'b-' + hash(subject + q + options.join('|')), subject, topic, q, options: options.slice(), answer, explanation, source: 'bank' };
  }

  /** Options are shuffled for bank questions too, except "A/B/C/D"-style and "No error/improvement" answers that must stay in order. */
  function shuffleOptions(q) {
    const ordered = q.options.some((o) => /^(No error|No improvement|[A-D])$/.test(o)) || /Only I follows|Neither/.test(q.options.join('|'));
    if (ordered) return q;
    const correct = q.options[q.answer];
    const options = shuffle(q.options);
    return { ...q, options, answer: options.indexOf(correct) };
  }

  function bankRows(subject, topic) {
    const rows = BANK[subject] || [];
    return topic ? rows.filter((r) => r[0] === topic) : rows;
  }

  function topics(subject) {
    const set = new Set(Object.keys(GEN[subject] || {}));
    for (const r of BANK[subject] || []) set.add(r[0]);
    return [...set];
  }

  function generate(subject, topic) {
    const fns = (GEN[subject] || {})[topic];
    if (!fns) return null;
    const q = pick(fns)();
    q.id = 'g-' + hash(q.q + q.options.join('|'));
    q.source = 'generated';
    return q;
  }

  /** Draw n distinct questions for a subject (optionally a topic), avoiding ids in `exclude`. */
  function draw(subject, n, { topic, exclude = new Set() } = {}) {
    const out = [];
    const seen = new Set(exclude);
    const genTopics = topic ? ((GEN[subject] || {})[topic] ? [topic] : []) : Object.keys(GEN[subject] || {});
    const bank = shuffle(bankRows(subject, topic)).map((r) => fromBank(subject, r)).filter((q) => !seen.has(q.id));
    // For generated subjects, mix in ~25% hand-written questions (syllogisms, seating, …).
    const bankShare = genTopics.length ? Math.min(bank.length, Math.round(n * (BANK_SHARE[subject] || 0.25))) : n;
    for (const q of bank.slice(0, bankShare)) { out.push(shuffleOptions(q)); seen.add(q.id); }
    let guard = 0;
    while (out.length < n && genTopics.length && guard++ < n * 20) {
      const q = generate(subject, topic || pick(genTopics));
      if (q && !seen.has(q.id)) { out.push(q); seen.add(q.id); }
    }
    return shuffle(out);
  }

  function buildMock(examKey) {
    const exam = EP.EXAMS[examKey];
    const sections = exam.sections.map((s) => {
      // A section may draw from several subject pools (e.g. RBI GA = static GK + economy/banking).
      const qs = s.pool
        ? shuffle(s.pool.flatMap((sub) => draw(sub, s.count))).slice(0, s.count)
        : draw(s.subject, s.count);
      return { ...s, questions: qs, short: qs.length < s.count };
    });
    return { examKey, exam, sections };
  }

  Object.assign(EP, { topics, draw, generate, buildMock, bankRows });
  if (typeof module !== 'undefined' && module.exports) module.exports = EP;
})(typeof window !== 'undefined' ? window : globalThis);
