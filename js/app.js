/* ExamPrep single-page app. Hash routes: #/, #/learn, #/practice, #/mock, #/revise, #/tutor, #/plan, #/progress */
(function () {
  const EP = window.EP;
  const S = EP.store;
  const view = document.getElementById('view');
  let cleanups = [];
  let leaveGuard = null; // function returning true if navigation should be blocked

  // ---------- tiny DOM helpers ----------
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'html') el.innerHTML = v; // only used with trusted static strings
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(Infinity)) if (kid != null && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
    return el;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /** Safe mini-markdown for notes and AI replies: escapes first, then formats. */
  function md(text) {
    const inline = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    const out = []; let list = null;
    for (const raw of String(text || '').split('\n')) {
      const line = raw.trimEnd();
      const bullet = line.match(/^\s*[-*•]\s+(.*)/), num = line.match(/^\s*(\d+)[.)]\s+(.*)/), head = line.match(/^#{1,4}\s+(.*)/);
      if (bullet || num) {
        const type = bullet ? 'ul' : 'ol';
        if (!list || list.type !== type) { if (list) out.push(`</${list.type}>`); list = { type }; out.push(`<${type}>`); }
        out.push(`<li>${inline(bullet ? bullet[1] : num[2])}</li>`);
        continue;
      }
      if (list) { out.push(`</${list.type}>`); list = null; }
      if (head) out.push(`<h4>${inline(head[1])}</h4>`);
      else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
    }
    if (list) out.push(`</${list.type}>`);
    const div = h('div', { class: 'md' }); div.innerHTML = out.join(''); return div;
  }
  const pct = (x) => (x == null ? '—' : Math.round(x * 100) + '%');
  const fmtTime = (s) => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const track = () => EP.TRACKS[S.state.profile.track];
  const subj = (k) => EP.SUBJECTS[k];
  const toast = (msg) => { const t = h('div', { class: 'toast' }, msg); document.body.append(t); setTimeout(() => t.remove(), 2600); };
  const daysLeft = () => { const d = S.state.profile.examDate; if (!d) return null; return Math.ceil((new Date(d + 'T00:00:00') - new Date(S.today() + 'T00:00:00')) / 86400000); };
  const go = (hash) => { location.hash = hash; };

  function card(title, ...body) { return h('section', { class: 'card' }, title ? h('h3', null, title) : null, ...body); }
  function bar(value, label) {
    const v = value == null ? 0 : value;
    const cls = value == null ? '' : v >= 0.75 ? 'good' : v >= 0.5 ? 'ok' : 'bad';
    return h('div', { class: 'bar', title: label || '' }, h('span', { class: cls, style: `width:${Math.round(v * 100)}%` }));
  }

  // ---------- AI helpers ----------
  function aiBox(run, label = 'Ask AI') {
    const box = h('div', { class: 'ai-box' });
    const btn = h('button', { class: 'btn ai', onclick: async () => {
      btn.disabled = true; box.replaceChildren(h('div', { class: 'muted pulse' }, 'Thinking…'));
      try { box.replaceChildren(md(await run())); btn.remove(); }
      catch (e) { box.replaceChildren(h('div', { class: 'error' }, e.message)); btn.disabled = false; }
    } }, '✨ ', label);
    return h('div', null, btn, box);
  }

  // ---------- question runner (practice & revision) ----------
  function runSession(container, questions, { title, back = '#/practice', onDone } = {}) {
    let i = 0; const results = []; let started = Date.now(); let tick;
    const timerEl = h('span', { class: 'chip' }, '00:00');
    const sessionStart = Date.now();
    tick = setInterval(() => { timerEl.textContent = fmtTime((Date.now() - started) / 1000); }, 500);
    cleanups.push(() => clearInterval(tick));

    function show() {
      if (i >= questions.length) return finish();
      const q = questions[i]; started = Date.now();
      let answered = false;
      const opts = h('div', { class: 'options' });
      const after = h('div');
      const choose = (k) => {
        if (answered) return; answered = true;
        const ms = Date.now() - started;
        const ok = S.record(q, k, ms);
        results.push({ q, chosen: k, ok, ms });
        [...opts.children].forEach((b, j) => { b.disabled = true; if (j === q.answer) b.classList.add('correct'); else if (j === k) b.classList.add('wrong'); });
        after.replaceChildren(
          h('div', { class: 'feedback ' + (ok ? 'ok' : 'no') }, ok ? '✓ Correct' : `✗ Incorrect — answer: ${String.fromCharCode(65 + q.answer)}`),
          q.explanation ? h('div', { class: 'explain' }, h('strong', null, 'Solution: '), md(q.explanation)) : null,
          pyqNote(q),
          aiBox(() => EP.ai.explain(q, k), 'Explain with AI'),
          similarButton(q),
          h('div', { class: 'row' },
            h('button', { class: 'btn ghost', onclick: (e) => { const on = S.toggleBookmark(q); e.target.textContent = on ? '★ Bookmarked' : '☆ Bookmark'; } }, S.state.bookmarks[q.id] ? '★ Bookmarked' : '☆ Bookmark'),
            h('button', { class: 'btn primary', id: 'next', onclick: () => { i++; show(); } }, i + 1 < questions.length ? 'Next →' : 'Finish')),
        );
        after.querySelector('#next').focus();
      };
      q.options.forEach((o, k) => opts.append(h('button', { class: 'opt', onclick: () => choose(k) }, h('b', null, String.fromCharCode(65 + k)), h('span', null, o))));
      container.replaceChildren(
        h('div', { class: 'qhead' },
          h('a', { href: back, class: 'muted' }, '← Exit'),
          h('span', { class: 'chip' }, `${i + 1} / ${questions.length}`),
          h('span', { class: 'chip soft' }, `${subj(q.subject).short} · ${q.topic}`),
          q.source === 'ai' ? h('span', { class: 'chip ai' }, q.similarTo ? 'AI · like ' + q.similarTo : 'AI') : null,
          q.pyq ? h('span', { class: 'chip pyq' }, 'PYQ · ' + EP.pyqLabel(q.pyq)) : null,
          timerEl),
        h('div', { class: 'progress-line' }, h('span', { style: `width:${(i / questions.length) * 100}%` })),
        h('div', { class: 'question' }, q.q),
        opts, after,
      );
      keyHandler = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const k = '1234abcd'.indexOf(e.key.toLowerCase());
        if (!answered && k >= 0 && k % 4 < q.options.length) choose(k % 4);
      };
    }

    function finish() {
      clearInterval(tick); keyHandler = null;
      const correct = results.filter((r) => r.ok).length;
      const secs = (Date.now() - sessionStart) / 1000;
      const wrong = results.filter((r) => !r.ok);
      container.replaceChildren(
        h('div', { class: 'result-hero' },
          h('div', { class: 'big' }, `${correct}/${results.length}`),
          h('div', null, `${pct(correct / Math.max(1, results.length))} accuracy · ${fmtTime(secs)} total · ${Math.round(secs / Math.max(1, results.length))}s per question`)),
        wrong.length ? card(`Review mistakes (${wrong.length}) — saved to your Revision book`, ...wrong.map((r) => reviewItem(r.q, r.chosen))) : card(null, h('p', null, '🎉 Perfect round!')),
        h('div', { class: 'row' },
          h('a', { class: 'btn', href: back }, '← Back'),
          onDone ? h('button', { class: 'btn primary', onclick: onDone }, 'Practice again') : null),
      );
    }
    show();
  }

  function reviewItem(q, chosen) {
    const d = h('details', { class: 'review' });
    const status = chosen == null ? 'skip' : chosen === q.answer ? 'ok' : 'no';
    d.append(
      h('summary', null, h('span', { class: 'dot ' + status }), h('span', null, q.q.split('\n')[0].slice(0, 140))),
      h('div', { class: 'question small' }, q.q),
      h('ol', { class: 'opt-list', type: 'A' }, q.options.map((o, k) => h('li', { class: k === q.answer ? 'correct' : k === chosen ? 'wrong' : '' }, o))),
      q.explanation ? h('div', { class: 'explain' }, md(q.explanation)) : null,
      pyqNote(q),
      aiBox(() => EP.ai.explain(q, chosen), 'Explain with AI'),
      similarButton(q),
    );
    return d;
  }

  function pyqNote(q) {
    if (!q.pyq) return null;
    return h('div', { class: 'muted small' }, `📄 ${EP.pyqLabel(q.pyq)}`, q.pyq.answerSource === 'ai' ? h('span', { class: 'warn' }, ' · answer solved by AI, not from the official key — verify') : ' · answer from key',
      q.pyq.source ? [' · source: ', /^https?:\/\//.test(q.pyq.source) ? h('a', { href: q.pyq.source, target: '_blank', rel: 'noopener' }, 'link') : q.pyq.source] : null);
  }

  /** "Generate similar questions" — AI questions modelled on this one, practised in a new session. */
  function similarButton(q, count = 5) {
    const err = h('span', { class: 'error small' });
    const btn = h('button', { class: 'btn ai', onclick: async () => {
      btn.disabled = true; btn.textContent = '✨ Generating similar questions…'; err.textContent = '';
      try {
        const qs = await EP.ai.similar(q, count);
        const back = location.hash || '#/pyq';
        const wrap = h('div'); view.replaceChildren(wrap); window.scrollTo(0, 0);
        runSession(wrap, qs, { back });
      } catch (e) { err.textContent = ' ' + e.message; btn.disabled = false; btn.textContent = '✨ Similar questions'; }
    } }, '✨ Similar questions');
    return h('div', { class: 'row' }, btn, err);
  }

  let keyHandler = null;
  document.addEventListener('keydown', (e) => keyHandler && keyHandler(e));

  // ---------- views ----------
  function Dashboard() {
    const p = S.state.profile; const t = track();
    const todayN = (S.state.days[S.today()] || { n: 0 }).n;
    const dl = daysLeft();
    const due = S.dueMistakes().length;
    const weak = S.weakTopics(t.subjects, 4);
    const lastMock = S.state.mocks.filter((m) => t.mocks.includes(m.examKey)).slice(-1)[0];
    const goalPct = Math.min(1, todayN / Math.max(1, p.dailyGoal));

    return [
      h('div', { class: 'hero' },
        h('div', null,
          h('h1', null, p.name ? `Namaste, ${p.name}!` : 'Namaste! 🙏'),
          h('p', { class: 'muted' }, `Preparing for ${t.name}`, dl != null ? ` · ${dl >= 0 ? dl + ' days to go' : 'exam date passed — update it in Plan'}` : ' · set your exam date in Plan')),
        h('div', { class: 'track-switch' }, Object.entries(EP.TRACKS).map(([k, v]) =>
          h('button', { class: 'seg' + (p.track === k ? ' on' : ''), onclick: () => { p.track = k; S.save(); render(); } }, v.name)))),
      h('div', { class: 'stats' },
        stat('🔥', S.streak() + (S.streak() === 1 ? ' day' : ' days'), 'Streak'),
        stat('🎯', `${todayN}/${p.dailyGoal}`, 'Today\'s questions', bar(goalPct)),
        stat('📚', Object.values(S.state.days).reduce((a, d) => a + d.n, 0), 'Questions solved'),
        stat('🔁', due, 'Due for revision')),
      h('div', { class: 'grid2' },
        card('Start now',
          h('div', { class: 'actions' },
            action('⚡', 'Daily Quick 20', 'Mixed mini-mock, 15 min', '#/mock/quick'),
            action('🎯', 'Practice weak topics', weak.length ? weak.map((w) => w.topic).slice(0, 2).join(', ') : 'Solve a few questions first', '#/practice/weak'),
            action('🔁', `Revise mistakes (${due})`, 'Spaced repetition', '#/revise'),
            action('✨', 'Ask the AI tutor', 'Doubts, shortcuts, strategy', '#/tutor'))),
        card('Subject accuracy',
          ...t.subjects.map((s) => { const st = S.subjectStats(s); return h('div', { class: 'subj-row' }, h('a', { href: '#/practice/' + s }, subj(s).short), bar(st.acc), h('span', { class: 'muted' }, st.n ? `${pct(st.acc)} · ${st.n}` : 'not started')); }),
          lastMock ? h('p', { class: 'muted' }, `Last mock: ${EP.EXAMS[lastMock.examKey].name} — ${EP.fmt(lastMock.score)}/${lastMock.max} (${lastMock.date})`) : h('p', { class: 'muted' }, 'No mocks yet — take one from Mock Tests.'))),
      weak.length ? card('Focus areas (lowest accuracy)', ...weak.map((w) => h('div', { class: 'subj-row' }, h('a', { href: `#/practice/${w.subject}/${encodeURIComponent(w.topic)}` }, w.topic), bar(w.acc), h('span', { class: 'muted' }, `${pct(w.acc)} of ${w.n}`)))) : null,
    ];
  }
  function stat(icon, value, label, extra) { return h('div', { class: 'stat' }, h('div', { class: 'icon' }, icon), h('div', { class: 'val' }, value), h('div', { class: 'muted' }, label), extra || null); }
  function action(icon, title, sub, href) { return h('a', { class: 'action', href }, h('span', { class: 'icon' }, icon), h('span', null, h('strong', null, title), h('small', { class: 'muted' }, sub))); }

  function Learn(subject, topic) {
    const t = track();
    subject = subject && t.subjects.includes(subject) ? subject : t.subjects[0];
    const notes = EP.NOTES[subject] || {};
    const tabs = h('div', { class: 'tabs' }, t.subjects.map((s) => h('a', { class: 'tab' + (s === subject ? ' on' : ''), href: '#/learn/' + s }, subj(s).short)));
    if (topic && notes[topic]) {
      const practicable = EP.topics(subject).includes(topic);
      return [tabs, card(topic, md(notes[topic]),
        h('div', { class: 'row' },
          h('a', { class: 'btn', href: '#/learn/' + subject }, '← All topics'),
          practicable ? h('a', { class: 'btn primary', href: `#/practice/${subject}/${encodeURIComponent(topic)}` }, 'Practise this topic →') : null,
          h('a', { class: 'btn ai', href: '#/tutor?q=' + encodeURIComponent(`Teach me ${topic} (${subj(subject).name}) for ${t.name} with 3 solved examples and shortcuts.`) }, '✨ Teach me with AI'),
          h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: S.state.done[subject + '|' + topic], onchange: (e) => { S.state.done[subject + '|' + topic] = e.target.checked; S.save(); } }), ' Mark as studied'))),
      ];
    }
    const noteTopics = Object.keys(notes);
    const extra = EP.topics(subject).filter((x) => !notes[x]);
    return [tabs,
      h('p', { class: 'muted' }, `${subj(subject).name}: concise notes, formulas and shortcuts. Topics without notes can still be learnt with the AI tutor.`),
      h('div', { class: 'topic-grid' },
        noteTopics.map((tp) => h('a', { class: 'topic' + (S.state.done[subject + '|' + tp] ? ' done' : ''), href: `#/learn/${subject}/${encodeURIComponent(tp)}` }, h('strong', null, tp), h('small', { class: 'muted' }, 'Notes'))),
        extra.map((tp) => h('a', { class: 'topic', href: '#/tutor?q=' + encodeURIComponent(`Teach me ${tp} for ${t.name}: key concepts, formulas/rules, 3 solved examples and common traps.`) }, h('strong', null, tp), h('small', { class: 'muted' }, '✨ Learn with AI')))),
    ];
  }

  function Practice(subject, topic) {
    const t = track();
    if (subject === 'weak') {
      const weak = S.weakTopics(t.subjects, 5);
      if (!weak.length) return [card('Practice weak topics', h('p', null, 'Solve at least 3 questions in a few topics so we can find your weak spots.'), h('a', { class: 'btn primary', href: '#/practice' }, 'Go to Practice'))];
      const wrap = h('div');
      const start = () => { const qs = EP.shuffle(weak.flatMap((w) => EP.draw(w.subject, 4, { topic: w.topic }))); runSession(wrap, qs, { title: 'Weak topics', onDone: start }); };
      start();
      return [wrap];
    }
    if (!subject || !EP.SUBJECTS[subject]) {
      return [h('h2', null, 'Practice'), h('p', { class: 'muted' }, 'Pick a subject. Quant and Reasoning questions are generated fresh every time, so you never run out.'),
        h('div', { class: 'topic-grid' }, t.subjects.map((s) => { const st = S.subjectStats(s); return h('a', { class: 'topic big', href: '#/practice/' + s }, h('span', { class: 'icon' }, subj(s).icon), h('strong', null, subj(s).name), bar(st.acc), h('small', { class: 'muted' }, st.n ? `${pct(st.acc)} accuracy · ${st.n} solved` : 'Not started')); }))];
    }
    if (topic != null) return [startPractice(subject, topic === '*' ? null : topic)];

    const topics = EP.topics(subject);
    return [
      h('div', { class: 'qhead' }, h('a', { href: '#/practice', class: 'muted' }, '← Subjects'), h('h2', null, subj(subject).name)),
      card('Mixed practice', h('p', { class: 'muted' }, 'Questions from every topic of this subject.'), h('a', { class: 'btn primary', href: `#/practice/${subject}/*` }, 'Start mixed set →')),
      card('Topic-wise', h('div', { class: 'topic-grid' }, topics.map((tp) => {
        const v = S.state.topics[subject + '|' + tp]; const n = v ? v.c + v.w : 0;
        return h('a', { class: 'topic', href: `#/practice/${subject}/${encodeURIComponent(tp)}` }, h('strong', null, tp), bar(n ? v.c / n : null), h('small', { class: 'muted' }, n ? `${pct(v.c / n)} · ${n} solved` : 'New'));
      }))),
      aiGenerateCard(subject, null),
    ];
  }

  function startPractice(subject, topic) {
    const wrap = h('div');
    const count = Number(sessionStorageGet('ep-count')) || 10;
    const run = () => {
      const qs = EP.draw(subject, count, { topic });
      if (!qs.length) { wrap.replaceChildren(card('No built-in questions yet', h('p', null, 'Use AI to generate questions for this topic.'), aiGenerateCard(subject, topic))); return; }
      runSession(wrap, qs, { back: '#/practice/' + subject, onDone: run });
    };
    const setup = h('div', null,
      h('div', { class: 'qhead' }, h('a', { href: '#/practice/' + subject, class: 'muted' }, '← ' + subj(subject).short), h('h2', null, topic || 'Mixed ' + subj(subject).short)),
      card('Built-in questions', h('div', { class: 'row' }, [5, 10, 20, 30].map((n) => h('button', { class: 'btn' + (n === count ? ' primary' : ''), onclick: () => { sessionStorageSet('ep-count', n); render(); } }, `${n} Qs`))),
        h('button', { class: 'btn primary', onclick: run }, `Start ${count} questions →`)),
      aiGenerateCard(subject, topic),
      EP.NOTES[subject] && EP.NOTES[subject][topic] ? card('Revise first?', h('a', { class: 'btn', href: `#/learn/${subject}/${encodeURIComponent(topic)}` }, '📖 Read notes for ' + topic)) : null);
    wrap.append(setup);
    return wrap;
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* ignore */ } }

  function aiGenerateCard(subject, topic) {
    const topicIn = h('input', { type: 'text', value: topic || '', placeholder: subject === 'ga' ? 'e.g. RBI monetary policy, Indian rivers, Budget 2026' : 'e.g. ' + (EP.topics(subject)[0] || 'any topic') });
    const diff = h('select', null, ['easy', 'moderate', 'hard'].map((d) => h('option', { value: d, selected: d === 'moderate' }, d)));
    const n = h('select', null, [5, 10].map((x) => h('option', { value: x }, x + ' questions')));
    const out = h('div');
    const btn = h('button', { class: 'btn ai', onclick: async () => {
      btn.disabled = true; out.replaceChildren(h('p', { class: 'muted pulse' }, 'Generating fresh questions with Groq…'));
      try {
        const qs = await EP.ai.generate({ subject, topic: topicIn.value.trim() || topic || subj(subject).name, count: Number(n.value), difficulty: diff.value });
        const wrap = h('div'); view.replaceChildren(wrap); runSession(wrap, qs, { back: '#/practice/' + subject });
      } catch (e) { out.replaceChildren(h('p', { class: 'error' }, e.message)); btn.disabled = false; }
    } }, '✨ Generate with AI');
    return card('AI question generator (Groq)',
      h('p', { class: 'muted' }, 'Unlimited fresh questions on any topic — great for current affairs, banking awareness, vocabulary and RBI Phase 2. AI can make mistakes; verify facts that matter.'),
      h('div', { class: 'form-row' }, topicIn, diff, n, btn), out);
  }

  // ---------- mock tests ----------
  function MockList(key) {
    const t = track();
    if (key && EP.EXAMS[key]) return MockIntro(key);
    const past = S.state.mocks.slice().reverse();
    return [h('h2', null, 'Mock Tests'), h('p', { class: 'muted' }, 'Full-length, exam-pattern mocks with negative marking, question palette and sectional timing (RBI).'),
      h('div', { class: 'topic-grid' }, t.mocks.map((k) => { const e = EP.EXAMS[k]; const best = Math.max(...S.state.mocks.filter((m) => m.examKey === k).map((m) => m.score), -Infinity);
        return h('a', { class: 'topic big', href: '#/mock/' + k }, h('strong', null, e.name), h('small', { class: 'muted' }, e.note), best > -Infinity ? h('small', null, `Best: ${EP.fmt(best)}`) : null); })),
      past.length ? card('Your mock history', h('table', null, h('thead', null, h('tr', null, ['Date', 'Test', 'Score', 'Accuracy', 'Time'].map((x) => h('th', null, x)))),
        h('tbody', null, past.slice(0, 15).map((m) => h('tr', null, h('td', null, m.date), h('td', null, m.title || EP.EXAMS[m.examKey]?.name || m.examKey), h('td', null, `${EP.fmt(m.score)}/${m.max}`), h('td', null, pct(m.correct / Math.max(1, m.correct + m.wrong))), h('td', null, fmtTime(m.secs))))))) : null];
  }

  function MockIntro(key) {
    const e = EP.EXAMS[key];
    const total = e.sections.reduce((a, s) => a + s.count, 0);
    const mins = e.sectional ? e.sections.reduce((a, s) => a + s.minutes, 0) : e.minutes;
    return [card(e.name,
      h('p', null, e.note),
      h('table', null, h('thead', null, h('tr', null, h('th', null, 'Section'), h('th', null, 'Questions'), h('th', null, 'Marks'), e.sectional ? h('th', null, 'Time') : null)),
        h('tbody', null, e.sections.map((s) => h('tr', null, h('td', null, subj(s.subject).name), h('td', null, s.count), h('td', null, EP.fmt(s.count * e.plus)), e.sectional ? h('td', null, s.minutes + ' min') : null)))),
      h('ul', null,
        h('li', null, `${total} questions · ${mins} minutes · +${EP.fmt(e.plus)} for correct, −${EP.fmt(e.minus)} for wrong, 0 for unattempted.`),
        e.sectional ? h('li', null, 'Sectional timing: each section locks when its time ends; you cannot go back.') : h('li', null, 'You can move freely between sections.'),
        h('li', null, 'Use "Mark for review" for questions you want to revisit. Marked + answered questions are evaluated.'),
        h('li', null, 'Keyboard: 1–4 to choose, → / ← to move.')),
      h('div', { class: 'row' }, h('a', { class: 'btn', href: '#/mock' }, '← Back'), h('button', { class: 'btn primary', onclick: () => MockRun(key) }, 'Start test →')))];
  }

  function MockRun(key, prebuilt) {
    const mock = prebuilt || EP.buildMock(key); const e = mock.exam;
    const qs = mock.sections.flatMap((s, si) => s.questions.map((q) => ({ q, si, chosen: null, marked: false, visited: false, ms: 0 })));
    let cur = 0, sec = 0, t0 = Date.now(), qStart = Date.now(), done = false;
    const secStart = [Date.now()];
    const total = e.sectional ? null : e.minutes * 60;
    const timerEl = h('span', { class: 'timer' });
    const body = h('div', { class: 'mock' });
    view.replaceChildren(body);
    leaveGuard = () => !done && !confirm('Leave the test? Your answers will be lost.');
    document.body.classList.add('in-test');
    cleanups.push(() => document.body.classList.remove('in-test'));

    const firstOf = (si) => qs.findIndex((x) => x.si === si);
    const remaining = () => e.sectional
      ? mock.sections[sec].minutes * 60 - (Date.now() - secStart[sec]) / 1000
      : total - (Date.now() - t0) / 1000;
    const tick = setInterval(() => {
      const r = remaining();
      timerEl.textContent = '⏱ ' + fmtTime(r);
      timerEl.classList.toggle('low', r < 120);
      if (r <= 0) { if (e.sectional && sec < mock.sections.length - 1) nextSection(true); else submit(true); }
    }, 500);
    cleanups.push(() => clearInterval(tick));

    function leaveQ() { qs[cur].ms += Date.now() - qStart; qStart = Date.now(); }
    function goTo(k) {
      if (k < 0 || k >= qs.length) return;
      if (e.sectional && qs[k].si !== sec) return;
      leaveQ(); cur = k; draw();
    }
    function nextSection(auto) {
      if (!auto && !confirm(`Move to ${subj(mock.sections[sec + 1].subject).name}? You cannot return to this section.`)) return;
      leaveQ(); sec++; secStart[sec] = Date.now(); cur = firstOf(sec); draw();
      if (auto) toast('Section time over — moved to next section');
    }
    function submit(auto) {
      if (done) return;
      if (!auto) {
        const un = qs.filter((x) => x.chosen == null).length;
        if (!confirm(`Submit test?${un ? ` ${un} question(s) unanswered.` : ''}`)) return;
      }
      done = true; leaveQ(); clearInterval(tick); keyHandler = null;
      document.body.classList.remove('in-test');
      const secs = (Date.now() - t0) / 1000;
      const sections = mock.sections.map((s, si) => {
        const items = qs.filter((x) => x.si === si);
        const c = items.filter((x) => x.chosen === x.q.answer).length;
        const w = items.filter((x) => x.chosen != null && x.chosen !== x.q.answer).length;
        return { subject: s.subject, total: items.length, correct: c, wrong: w, score: c * e.plus - w * e.minus, max: items.length * e.plus };
      });
      for (const x of qs) if (x.chosen != null) S.record(x.q, x.chosen, x.ms);
      const result = { examKey: key, title: e.name, date: S.today(), secs, score: EP.round(sections.reduce((a, s) => a + s.score, 0)), max: EP.round(sections.reduce((a, s) => a + s.max, 0)),
        correct: sections.reduce((a, s) => a + s.correct, 0), wrong: sections.reduce((a, s) => a + s.wrong, 0), sections };
      S.state.mocks.push(result); S.save();
      MockResult(result, qs);
    }
    function draw() {
      const x = qs[cur]; x.visited = true;
      const s = mock.sections[x.si];
      const inSec = qs.map((y, k) => [y, k]).filter(([y]) => y.si === x.si);
      const opts = h('div', { class: 'options' }, x.q.options.map((o, k) => h('button', { class: 'opt' + (x.chosen === k ? ' picked' : ''), onclick: () => { x.chosen = k; draw(); } }, h('b', null, String.fromCharCode(65 + k)), h('span', null, o))));
      const last = cur === qs.length - 1 || (e.sectional && qs[cur + 1].si !== sec);
      const answeredN = qs.filter((y) => y.chosen != null).length;
      body.replaceChildren(
        h('div', { class: 'mock-top' },
          h('strong', null, e.name),
          h('div', { class: 'sec-tabs' }, mock.sections.map((ss, si) => h('button', { class: 'seg' + (si === x.si ? ' on' : ''), disabled: e.sectional && si !== sec, onclick: () => goTo(firstOf(si)) }, subj(ss.subject).short))),
          timerEl,
          h('button', { class: 'btn danger', onclick: () => submit(false) }, 'Submit')),
        h('div', { class: 'mock-main' },
          h('div', { class: 'mock-q' },
            h('div', { class: 'qhead' }, h('span', { class: 'chip' }, `Q ${inSec.findIndex(([, k]) => k === cur) + 1} of ${inSec.length}`), h('span', { class: 'chip soft' }, subj(s.subject).name), h('span', { class: 'muted' }, `+${EP.fmt(e.plus)} / −${EP.fmt(e.minus)}`)),
            h('div', { class: 'question' }, x.q.q), opts,
            h('div', { class: 'row' },
              h('button', { class: 'btn', onclick: () => { x.marked = !x.marked; if (!last) goTo(cur + 1); else draw(); } }, x.marked ? 'Unmark' : 'Mark for review & next'),
              h('button', { class: 'btn', onclick: () => { x.chosen = null; draw(); } }, 'Clear'),
              h('button', { class: 'btn', onclick: () => goTo(cur - 1), disabled: cur === 0 || (e.sectional && qs[cur - 1].si !== sec) }, '← Prev'),
              last && e.sectional && sec < mock.sections.length - 1 ? h('button', { class: 'btn primary', onclick: () => nextSection(false) }, 'Next section →')
                : h('button', { class: 'btn primary', onclick: () => (last ? submit(false) : goTo(cur + 1)) }, last ? 'Save & submit' : 'Save & next →'))),
          h('aside', { class: 'palette' },
            h('div', { class: 'muted' }, `${answeredN} answered · ${qs.filter((y) => y.marked).length} marked`),
            h('div', { class: 'pal-grid' }, inSec.map(([y, k], n) => h('button', {
              class: 'pal ' + (y.marked ? 'marked' : y.chosen != null ? 'ans' : y.visited ? 'seen' : '') + (k === cur ? ' cur' : ''),
              onclick: () => goTo(k),
            }, n + 1))),
            h('div', { class: 'legend' }, h('span', { class: 'pal ans' }), 'Answered ', h('span', { class: 'pal seen' }), 'Not answered ', h('span', { class: 'pal marked' }), 'Marked ', h('span', { class: 'pal' }), 'Not visited'))),
      );
      timerEl.textContent = '⏱ ' + fmtTime(remaining());
    }
    keyHandler = (ev) => {
      const k = '1234'.indexOf(ev.key);
      if (k >= 0 && k < qs[cur].q.options.length) { qs[cur].chosen = k; draw(); }
      else if (ev.key === 'ArrowRight') goTo(cur + 1);
      else if (ev.key === 'ArrowLeft') goTo(cur - 1);
    };
    draw();
  }

  function MockResult(r, qs) {
    leaveGuard = null;
    const e = { ...EP.EXAMS[r.examKey], name: r.title || EP.EXAMS[r.examKey].name };
    const attempted = r.correct + r.wrong;
    const filter = h('div', { class: 'tabs' });
    const list = h('div');
    const show = (kind) => {
      [...filter.children].forEach((b) => b.classList.toggle('on', b.dataset.k === kind));
      const items = qs.filter((x) => kind === 'all' || (kind === 'wrong' ? x.chosen != null && x.chosen !== x.q.answer : kind === 'skip' ? x.chosen == null : x.chosen === x.q.answer));
      list.replaceChildren(...items.slice(0, 200).map((x) => reviewItem(x.q, x.chosen)));
    };
    [['wrong', 'Wrong'], ['skip', 'Unattempted'], ['right', 'Correct'], ['all', 'All']].forEach(([k, l]) => filter.append(h('button', { class: 'tab', 'data-k': k, onclick: () => show(k) }, l)));
    view.replaceChildren(
      h('div', { class: 'result-hero' }, h('div', { class: 'muted' }, e.name), h('div', { class: 'big' }, `${EP.fmt(r.score)} / ${r.max}`),
        h('div', null, `${r.correct} correct · ${r.wrong} wrong · ${qs.length - attempted} unattempted · accuracy ${pct(r.correct / Math.max(1, attempted))} · ${fmtTime(r.secs)}`),
        r.wrong ? h('div', { class: 'muted' }, `Negative marking cost you ${EP.fmt(r.wrong * e.minus)} marks.`) : null),
      card('Section-wise', h('table', null, h('thead', null, h('tr', null, ['Section', 'Score', 'Correct', 'Wrong', 'Accuracy'].map((x) => h('th', null, x)))),
        h('tbody', null, r.sections.map((s) => h('tr', null, h('td', null, subj(s.subject).name), h('td', null, `${EP.fmt(s.score)}/${EP.fmt(s.max)}`), h('td', null, s.correct), h('td', null, s.wrong), h('td', null, s.correct + s.wrong ? pct(s.correct / (s.correct + s.wrong)) : '—')))))),
      card('AI performance coach', aiBox(() => EP.ai.analyze(collectStats({ justFinished: r })), 'Analyse this mock & plan my next week')),
      card('Solutions', filter, list),
      h('div', { class: 'row' }, h('a', { class: 'btn', href: '#/mock' }, '← Mock tests'), h('a', { class: 'btn primary', href: '#/revise' }, 'Revise mistakes →')),
    );
    show('wrong');
    window.scrollTo(0, 0);
  }

  function collectStats(extra = {}) {
    const t = track();
    const topics = Object.entries(S.state.topics).map(([k, v]) => ({ topic: k.replace('|', ' / '), attempted: v.c + v.w, accuracy: pct(v.c / Math.max(1, v.c + v.w)), avgSec: Math.round(v.ms / Math.max(1, v.c + v.w) / 1000) }))
      .filter((x) => x.attempted >= 2).sort((a, b) => parseInt(a.accuracy) - parseInt(b.accuracy)).slice(0, 25);
    return {
      exam: t.name, daysToExam: daysLeft(), streakDays: S.streak(), dailyGoal: S.state.profile.dailyGoal,
      subjects: Object.fromEntries(t.subjects.map((s) => { const st = S.subjectStats(s); return [subj(s).short, { attempted: st.n, accuracy: pct(st.acc), avgSec: st.avgSec && Math.round(st.avgSec) }]; })),
      weakestTopics: topics,
      recentMocks: S.state.mocks.slice(-5).map((m) => ({ test: m.title || EP.EXAMS[m.examKey]?.name, score: `${EP.fmt(m.score)}/${m.max}`, correct: m.correct, wrong: m.wrong, minutes: Math.round(m.secs / 60), sections: m.sections.map((s) => `${subj(s.subject).short} ${EP.fmt(s.score)}/${EP.fmt(s.max)}`) })),
      ...extra,
    };
  }


  // ---------- previous year questions ----------
  const allPapers = () => [
    ...(window.EP_BANK.pyqPapers || []).map((p) => ({ ...p, builtIn: true })),
    ...Object.values(S.state.pyqPapers),
  ].sort((a, b) => (b.year || 0) - (a.year || 0) || String(b.shift).localeCompare(String(a.shift)));
  const paperQs = (p) => p.questions.map((q, i) => ({
    ...q, id: `pyq-${p.id}-${i}`, subject: EP.SUBJECTS[q.subject] ? q.subject : 'ga', topic: q.topic || 'PYQ', source: 'pyq',
    pyq: { exam: p.exam, year: p.year, shift: p.shift, source: p.source, answerSource: q.answerSource || 'key' },
  }));
  const paperTitle = (p) => `${p.exam} · ${p.shift || p.year}`;

  function timedPaper(p) {
    const base = EP.EXAMS[p.examKey] || { plus: 1, minus: 0.25, minutes: 60, sections: [] };
    const qs = paperQs(p);
    const order = [...base.sections.map((s) => s.subject), ...Object.keys(EP.SUBJECTS)];
    const subjects = [...new Set(order)].filter((s) => qs.some((q) => q.subject === s));
    const baseCount = base.sections.reduce((a, s) => a + s.count, 0) || qs.length;
    const baseMinutes = base.sectional ? base.sections.reduce((a, s) => a + s.minutes, 0) : base.minutes;
    const minutes = Math.max(5, Math.round((baseMinutes * qs.length) / baseCount));
    const exam = { ...base, name: 'PYQ · ' + paperTitle(p), sectional: false, minutes, note: `${qs.length} questions · ${minutes} min` };
    MockRun(p.examKey || 'quick', { examKey: p.examKey, exam, sections: subjects.map((s) => { const list = qs.filter((q) => q.subject === s); return { subject: s, count: list.length, questions: list }; }) });
  }

  function PYQ(section, id) {
    if (section === 'import') return PYQImport();
    if (section === 'paper') return PYQPaper(id);
    const t = track();
    const f = S.state.pyqFilter || (S.state.pyqFilter = { exam: 'track', year: 'all', subject: 'all' });
    const papers = allPapers().filter((p) =>
      (f.exam === 'all' || (f.exam === 'track' ? t.mocks.includes(p.examKey) : p.examKey === f.exam)) && (f.year === 'all' || String(p.year) === f.year));
    const years = [...new Set(allPapers().map((p) => String(p.year)))].sort().reverse();
    const setF = (k) => (e) => { f[k] = e.target.value; S.save(); render(); };
    const sel = (k, opts) => h('select', { onchange: setF(k) }, opts.map(([v, l]) => h('option', { value: v, selected: f[k] === v }, l)));
    const qs = papers.flatMap(paperQs).filter((q) => f.subject === 'all' || q.subject === f.subject);

    const head = [
      h('div', { class: 'qhead' }, h('h2', null, '📄 Previous Year Questions'), h('a', { class: 'btn primary', href: '#/pyq/import' }, '+ Import a paper')),
      h('p', { class: 'muted' }, 'Real questions from past papers, tagged with exam, date and shift. Practise them one by one or as a timed paper, and use ✨ Similar questions to get new AI questions on the same pattern.'),
    ];
    if (!allPapers().length) {
      return [...head, card('No papers yet — add your first one',
        h('p', null, 'Import a real paper in two minutes:'),
        h('ol', null,
          h('li', null, 'SSC CGL: during the answer-key window SSC publishes each candidate\'s question paper with the official answer key at ', h('a', { href: 'https://ssc.gov.in', target: '_blank', rel: 'noopener' }, 'ssc.gov.in'), '. Solved shift-wise papers are also published by coaching sites.'),
          h('li', null, 'RBI Grade B: the RBI does not release question papers, so all RBI "PYQs" are memory-based compilations from candidates. Import them, but treat them as such.'),
          h('li', null, 'Copy the text of the paper (or one section at a time), paste it into the importer, and the AI turns it into practice questions with the year and shift.')),
        h('a', { class: 'btn primary', href: '#/pyq/import' }, 'Import a paper →'))];
    }
    return [...head,
      h('div', { class: 'form-row filters' },
        sel('exam', [['track', `${t.name} papers`], ['all', 'All exams'], ...Object.entries(EP.EXAMS).filter(([k]) => k !== 'quick').map(([k, e]) => [k, e.name])]),
        sel('year', [['all', 'All years'], ...years.map((y) => [y, y])]),
        sel('subject', [['all', 'All subjects'], ...Object.entries(EP.SUBJECTS).map(([k, v]) => [k, v.short])])),
      papers.length ? h('div', { class: 'topic-grid' }, papers.map((p) => {
        const ai = p.questions.filter((q) => q.answerSource === 'ai').length;
        return h('a', { class: 'topic big', href: '#/pyq/paper/' + encodeURIComponent(p.id) },
          h('span', { class: 'chip pyq' }, p.year), h('strong', null, p.exam), h('span', null, p.shift || ''),
          h('small', { class: 'muted' }, `${p.questions.length} questions${ai ? ` · ${ai} AI-solved` : ' · answers from key'}${p.builtIn ? '' : ' · imported'}`));
      })) : card(null, h('p', { class: 'muted' }, 'No papers match these filters.')),
      qs.length ? card(`Questions (${qs.length})`,
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => { const w = h('div'); view.replaceChildren(w); runSession(w, EP.shuffle(qs).slice(0, 25), { back: '#/pyq' }); } }, `Practise ${Math.min(25, qs.length)} random PYQs →`)),
        h('div', { class: 'spacer' }),
        ...qs.slice(0, 60).map((q) => reviewItem(q, null)),
        qs.length > 60 ? h('p', { class: 'muted' }, `Showing 60 of ${qs.length}. Open a paper or narrow the filters to see the rest.`) : null) : null,
    ];
  }

  function PYQPaper(id) {
    const p = allPapers().find((x) => x.id === id);
    if (!p) return [card('Paper not found', h('a', { class: 'btn', href: '#/pyq' }, '← All PYQs'))];
    const qs = paperQs(p);
    const bySubject = Object.keys(EP.SUBJECTS).map((s) => [s, qs.filter((q) => q.subject === s)]).filter(([, l]) => l.length);
    const out = h('div');
    const bulkSimilar = h('button', { class: 'btn ai', onclick: async () => {
      bulkSimilar.disabled = true; out.replaceChildren(h('p', { class: 'muted pulse' }, 'Generating a similar set from this paper…'));
      try {
        // Pick one question per topic (up to 4) and ask for 3 look-alikes of each, one call at a time to stay within the free quota.
        const seeds = [...new Map(EP.shuffle(qs).map((q) => [q.topic, q])).values()].slice(0, 4);
        const made = [];
        for (const q of seeds) made.push(...await EP.ai.similar(q, 3));
        const w = h('div'); view.replaceChildren(w); runSession(w, EP.shuffle(made), { back: '#/pyq/paper/' + encodeURIComponent(id) });
      } catch (e) { out.replaceChildren(h('p', { class: 'error' }, e.message)); bulkSimilar.disabled = false; }
    } }, '✨ Generate a similar practice set');
    return [
      h('div', { class: 'qhead' }, h('a', { href: '#/pyq', class: 'muted' }, '← All PYQs'), h('h2', null, paperTitle(p))),
      card(null,
        h('p', null, `${qs.length} questions · `, bySubject.map(([s, l]) => `${subj(s).short} ${l.length}`).join(' · ')),
        p.source ? h('p', { class: 'muted small' }, 'Source: ', /^https?:\/\//.test(p.source) ? h('a', { href: p.source, target: '_blank', rel: 'noopener' }, p.source) : p.source) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn primary', onclick: () => { const w = h('div'); view.replaceChildren(w); runSession(w, qs, { back: '#/pyq/paper/' + encodeURIComponent(id) }); } }, 'Practise with instant answers'),
          h('button', { class: 'btn', onclick: () => timedPaper(p) }, '⏱ Attempt as timed paper'),
          bulkSimilar,
          p.builtIn ? null : h('button', { class: 'btn danger', onclick: () => { if (confirm('Delete this imported paper?')) { delete S.state.pyqPapers[p.id]; S.save(); go('#/pyq'); } } }, 'Delete')),
        out),
      ...bySubject.map(([s, l]) => card(`${subj(s).name} (${l.length})`, ...l.map((q) => reviewItem(q, null)))),
    ];
  }

  function PYQImport() {
    const examSel = h('select', null, Object.entries(EP.EXAMS).filter(([k]) => k !== 'quick').map(([k, e]) => h('option', { value: k, selected: track().mocks[0] === k }, e.name)));
    const year = h('input', { type: 'number', min: 2010, max: 2030, value: new Date().getFullYear() - 1 });
    const shift = h('input', { type: 'text', placeholder: 'e.g. 21 Jul 2023, Shift 1' });
    const source = h('input', { type: 'text', placeholder: 'Source URL or "Official answer key" / "Memory-based"' });
    const text = h('textarea', { rows: 12, placeholder: 'Paste the question paper text here (questions, options and — if available — the marked/correct answers). Long papers are processed in parts automatically.' });
    const status = h('div');
    const preview = h('div');
    let extracted = [];

    // Split long pastes at question boundaries so each AI call stays small.
    const chunks = (str, size = 12000) => {
      const out = []; let rest = str.trim();
      while (rest.length > size) {
        let cut = rest.lastIndexOf('\nQ', size); if (cut < size / 2) cut = rest.lastIndexOf('\n', size); if (cut < size / 2) cut = size;
        out.push(rest.slice(0, cut)); rest = rest.slice(cut);
      }
      if (rest) out.push(rest);
      return out;
    };

    const extractBtn = h('button', { class: 'btn ai', onclick: async () => {
      const parts = chunks(text.value);
      if (!parts.length) { status.replaceChildren(h('p', { class: 'error' }, 'Paste the paper text first.')); return; }
      extractBtn.disabled = true; extracted = [];
      try {
        for (let i = 0; i < parts.length; i++) {
          status.replaceChildren(h('p', { class: 'muted pulse' }, `Reading part ${i + 1} of ${parts.length}…`));
          extracted.push(...await EP.ai.extract(parts[i], EP.EXAMS[examSel.value].name));
        }
        status.replaceChildren(h('p', null, `Found ${extracted.length} questions. Untick any that look wrong, then save.`));
        drawPreview();
      } catch (e) { status.replaceChildren(h('p', { class: 'error' }, e.message)); }
      extractBtn.disabled = false;
    } }, '✨ Extract questions with AI');

    function drawPreview() {
      const keep = extracted.map(() => true);
      const fromKey = extracted.filter((q) => q.answerSource === 'key').length;
      preview.replaceChildren(card(`Preview — ${extracted.length} questions (${fromKey} answers from the key, ${extracted.length - fromKey} AI-solved)`,
        ...extracted.map((q, i) => h('details', { class: 'review' },
          h('summary', null, h('input', { type: 'checkbox', checked: true, onclick: (e) => e.stopPropagation(), onchange: (e) => { keep[i] = e.target.checked; } }),
            h('span', { class: 'chip soft' }, `${subj(q.subject || 'ga').short} · ${q.topic || '—'}`),
            q.answerSource === 'ai' ? h('span', { class: 'chip warn' }, 'AI-solved') : h('span', { class: 'chip ok' }, 'key'),
            h('span', null, q.q.split('\n')[0].slice(0, 110))),
          h('div', { class: 'question small' }, q.q),
          h('ol', { class: 'opt-list', type: 'A' }, q.options.map((o, k) => h('li', { class: k === q.answer ? 'correct' : '' }, o))),
          q.explanation ? h('div', { class: 'explain' }, md(q.explanation)) : null)),
        h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: () => {
          const questions = extracted.filter((_, i) => keep[i]);
          if (!questions.length) return toast('Nothing selected');
          const e = EP.EXAMS[examSel.value];
          const id = `${examSel.value}-${year.value}-${EP.hash(shift.value + source.value + Date.now())}`;
          S.state.pyqPapers[id] = { id, examKey: examSel.value, exam: e.name, year: Number(year.value), shift: shift.value.trim() || String(year.value), source: source.value.trim(), questions };
          S.save(); toast(`Saved ${questions.length} questions`); go('#/pyq/paper/' + encodeURIComponent(id));
        } }, 'Save paper'))));
    }

    const fileIn = h('input', { type: 'file', accept: 'application/json', style: 'display:none', onchange: async (e) => {
      try {
        const data = JSON.parse(await e.target.files[0].text());
        const list = Array.isArray(data) ? data : [data];
        let n = 0;
        for (const p of list) if (p && p.id && p.exam && Array.isArray(p.questions)) { S.state.pyqPapers[p.id] = p; n++; }
        S.save(); toast(`Imported ${n} paper(s)`); go('#/pyq');
      } catch (err) { toast('Not a valid PYQ file: ' + err.message); }
    } });
    const imported = Object.values(S.state.pyqPapers);

    return [
      h('div', { class: 'qhead' }, h('a', { href: '#/pyq', class: 'muted' }, '← All PYQs'), h('h2', null, 'Import a previous-year paper')),
      card('1 · Paper details', h('div', { class: 'form-grid' },
        h('label', null, 'Exam', examSel), h('label', null, 'Year', year), h('label', null, 'Date / shift', shift), h('label', null, 'Source', source))),
      card('2 · Paste the paper', h('p', { class: 'muted' }, 'Copy from an official answer key PDF or a solved paper. Include the answers if the source marks them — otherwise the AI solves each question and flags it as "AI-solved" so you know to verify it.'),
        text, h('div', { class: 'row' }, extractBtn), status),
      preview,
      card('Share papers between devices', h('p', { class: 'muted' }, 'Imported papers are saved in this browser. Export them to back up or share, or send the file to be added to the built-in collection (js/bank/pyq.js).'),
        h('div', { class: 'row' },
          h('button', { class: 'btn', disabled: !imported.length, onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(imported, null, 2)], { type: 'application/json' })), download: `pyq-papers-${S.today()}.json` }); a.click(); } }, `⬇ Export ${imported.length} paper(s)`),
          h('button', { class: 'btn', onclick: () => fileIn.click() }, '⬆ Import PYQ file'), fileIn)),
    ];
  }

  // ---------- revision ----------
  function Revise(tab = 'due') {
    const due = S.dueMistakes();
    const all = Object.values(S.state.mistakes).map((m) => m.q);
    const marks = Object.values(S.state.bookmarks);
    const lists = { due, all, bookmarks: marks };
    const cur = lists[tab] ? tab : 'due';
    const wrap = h('div');
    const start = (qs) => runSession(wrap, EP.shuffle(qs).slice(0, 30), { back: '#/revise' });
    wrap.append(
      h('h2', null, 'Revision'),
      h('p', { class: 'muted' }, 'Every question you get wrong goes into your mistake book. Answer it correctly on spaced intervals (today → 1 → 3 → 7 → 16 → 35 days) to retire it.'),
      h('div', { class: 'tabs' },
        h('a', { class: 'tab' + (cur === 'due' ? ' on' : ''), href: '#/revise/due' }, `Due today (${due.length})`),
        h('a', { class: 'tab' + (cur === 'all' ? ' on' : ''), href: '#/revise/all' }, `All mistakes (${all.length})`),
        h('a', { class: 'tab' + (cur === 'bookmarks' ? ' on' : ''), href: '#/revise/bookmarks' }, `Bookmarks (${marks.length})`)),
      lists[cur].length
        ? h('div', null, h('button', { class: 'btn primary', onclick: () => start(lists[cur]) }, `Start revising ${Math.min(30, lists[cur].length)} questions →`), h('div', { class: 'spacer' }), ...lists[cur].slice(0, 50).map((q) => reviewItem(q, null)))
        : card(null, h('p', null, cur === 'due' ? 'Nothing due today. 🎉 Keep practising!' : 'Nothing here yet.')),
    );
    return [wrap];
  }

  // ---------- AI tutor ----------
  function Tutor(prefill) {
    const msgs = S.state.chat;
    const log = h('div', { class: 'chat-log' });
    const input = h('textarea', { rows: 2, placeholder: 'Ask a doubt, paste a question, or ask for a strategy… (Enter to send, Shift+Enter for new line)' });
    const status = h('div', { class: 'muted small' });
    const paint = () => {
      log.replaceChildren(...(msgs.length ? msgs.map((m) => h('div', { class: 'msg ' + m.role }, m.role === 'assistant' ? md(m.content) : h('div', { class: 'pre' }, m.content)))
        : [h('div', { class: 'msg assistant' }, md(`Hi! I'm your **ExamPrep AI tutor** (powered by Groq).\nAsk me anything about ${track().name}: concepts, shortcut tricks, a question you're stuck on, or a study strategy.`))]));
      log.scrollTop = log.scrollHeight;
    };
    const send = async (text) => {
      text = (text ?? input.value).trim(); if (!text) return;
      input.value = ''; msgs.push({ role: 'user', content: text }); paint();
      const thinking = h('div', { class: 'msg assistant pulse' }, 'Thinking…'); log.append(thinking); log.scrollTop = log.scrollHeight;
      try {
        const reply = await EP.ai.tutor(msgs.slice(-12));
        msgs.push({ role: 'assistant', content: reply });
      } catch (e) { msgs.push({ role: 'assistant', content: '⚠️ ' + e.message }); }
      S.state.chat = msgs.slice(-40); S.save(); paint();
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    const t = track();
    const chips = [
      `Make me a 30-day revision plan for ${t.name}`,
      'Explain the shortcut for successive percentage change',
      t.name === 'RBI Grade B' ? 'Explain the LAF corridor: repo, SDF and MSF' : 'Most important static GK topics for SSC CGL',
      'How do I avoid negative marking?',
      t.name === 'RBI Grade B' ? 'Give me a 250-word ESI answer framework' : 'Tricks for syllogism questions',
    ];
    EP.ai.available().then((ok) => { status.textContent = ok ? '● Connected to Groq' : '○ AI offline — start the server with a GROQ_API_KEY (see README).'; status.className = 'small ' + (ok ? 'ok-text' : 'muted'); });
    paint();
    // Send the prefilled prompt once, then drop it from the URL so a refresh doesn't resend it.
    if (prefill) setTimeout(() => { history.replaceState(null, '', '#/tutor'); lastHash = '#/tutor'; send(prefill); }, 0);
    return [
      h('div', { class: 'qhead' }, h('h2', null, '✨ AI Tutor'), status, h('button', { class: 'btn ghost', onclick: () => { msgs.length = 0; S.state.chat = []; S.save(); paint(); } }, 'Clear chat')),
      h('div', { class: 'chips' }, chips.map((c) => h('button', { class: 'chip-btn', onclick: () => send(c) }, c))),
      log, h('div', { class: 'chat-input' }, input, h('button', { class: 'btn primary', onclick: () => send() }, 'Send')),
    ];
  }

  // ---------- study plan ----------
  function Plan() {
    const p = S.state.profile; const t = track();
    const name = h('input', { type: 'text', value: p.name, placeholder: 'Your name' });
    const date = h('input', { type: 'date', value: p.examDate });
    const goal = h('input', { type: 'number', min: 10, max: 500, value: p.dailyGoal });
    const hours = h('input', { type: 'number', min: 1, max: 14, value: p.hours || 4 });
    const save = () => { p.name = name.value.trim(); p.examDate = date.value; p.dailyGoal = Math.max(10, Number(goal.value) || 50); p.hours = Math.max(1, Number(hours.value) || 4); S.save(); render(); toast('Saved'); };
    const dl = daysLeft();

    // Weight subjects by marks share, boosted by weakness.
    const weights = t.subjects.map((s) => { const st = S.subjectStats(s); const base = { quant: 1.3, reasoning: 1.2, english: 1, ga: 1.1, esi: 1, fm: 1 }[s]; return [s, base * (st.acc == null ? 1 : 1.5 - st.acc)]; });
    const W = weights.reduce((a, [, w]) => a + w, 0);
    const hrs = p.hours || 4;
    const split = weights.map(([s, w]) => [s, Math.max(0.5, Math.round((w / W) * hrs * 2) / 2)]);

    let phases = null;
    if (dl != null && dl > 0) {
      const f = Math.round(dl * 0.45), pr = Math.round(dl * 0.35), m = dl - f - pr;
      phases = [
        ['Foundation', f, 'Learn every topic once from notes; 20–30 topic-wise questions per topic; build formula sheets.'],
        ['Practice', pr, 'Mixed sets under time pressure; target accuracy ≥ 80%; one sectional mock every 2 days.'],
        ['Mocks & Revision', m, `Full mock every 1–2 days (${t.mocks.slice(0, 2).map((k) => EP.EXAMS[k].name).join(', ')}); analyse each; revise mistake book daily.`],
      ];
    }
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const rotation = t.subjects;
    return [
      h('h2', null, 'Study Plan'),
      card('Your details', h('div', { class: 'form-grid' },
        h('label', null, 'Name', name), h('label', null, `${t.name} exam date`, date),
        h('label', null, 'Study hours / day', hours), h('label', null, 'Daily question goal', goal)),
        h('button', { class: 'btn primary', onclick: save }, 'Save')),
      phases ? card(`${dl} days to go — your phases`, h('div', { class: 'phases' }, phases.map(([n, d, txt], i) => h('div', { class: 'phase' }, h('div', { class: 'muted' }, `Phase ${i + 1} · ${d} days`), h('strong', null, n), h('p', null, txt)))))
        : card('Set your exam date', h('p', { class: 'muted' }, 'Add the exam date above to get a phase-wise plan.')),
      card(`Daily time split (${hrs} h) — weaker subjects get more time`, ...split.map(([s, hh]) => h('div', { class: 'subj-row' }, h('span', null, subj(s).short), bar(hh / hrs), h('span', { class: 'muted' }, hh + ' h')))),
      card('Weekly rhythm', h('table', null, h('thead', null, h('tr', null, h('th', null, 'Day'), h('th', null, 'Main focus'), h('th', null, 'Also'))),
        h('tbody', null, days.map((d, i) => h('tr', null, h('td', null, d),
          h('td', null, i === 6 ? 'Full mock + analysis' : subj(rotation[i % rotation.length]).name),
          h('td', null, i === 6 ? 'Revise mistake book' : `${subj(rotation[(i + 1) % rotation.length]).short} practice · GA 30 min · Revision 20 min`)))))),
      card('Syllabus checklist', ...t.subjects.map((s) => {
        const topics = [...new Set([...Object.keys(EP.NOTES[s] || {}), ...EP.topics(s)])];
        const doneN = topics.filter((tp) => S.state.done[s + '|' + tp]).length;
        return h('details', { class: 'review' }, h('summary', null, h('strong', null, subj(s).name), h('span', { class: 'muted' }, ` ${doneN}/${topics.length}`)),
          h('div', { class: 'checks' }, topics.map((tp) => h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: S.state.done[s + '|' + tp], onchange: (e) => { S.state.done[s + '|' + tp] = e.target.checked; S.save(); } }), ' ', tp))));
      })),
      card('AI study plan', aiBox(() => EP.ai.analyze(collectStats({ hoursPerDay: hrs })), 'Build my personalised 7-day plan')),
    ];
  }

  // ---------- progress ----------
  function Progress() {
    const t = track();
    const mocks = S.state.mocks.filter((m) => t.mocks.includes(m.examKey));
    const rows = Object.entries(S.state.topics).map(([k, v]) => { const [s, tp] = k.split('|'); return { s, tp, n: v.c + v.w, acc: v.c / Math.max(1, v.c + v.w), sec: v.ms / Math.max(1, v.c + v.w) / 1000 }; })
      .filter((r) => t.subjects.includes(r.s) && r.n).sort((a, b) => a.acc - b.acc);
    const fileIn = h('input', { type: 'file', accept: 'application/json', style: 'display:none', onchange: async (e) => {
      try { S.importData(await e.target.files[0].text()); toast('Progress imported'); render(); } catch (err) { toast(err.message); }
    } });
    return [
      h('h2', null, 'Progress'),
      card('Activity (last 12 weeks)', heatmap()),
      mocks.length ? card('Mock score trend (% of max)', trend(mocks.map((m) => m.score / m.max), mocks.map((m) => m.date))) : null,
      card('Topic accuracy (weakest first)', rows.length ? h('table', null, h('thead', null, h('tr', null, ['Subject', 'Topic', 'Solved', 'Accuracy', 'Avg time'].map((x) => h('th', null, x)))),
        h('tbody', null, rows.map((r) => h('tr', null, h('td', null, subj(r.s).short), h('td', null, h('a', { href: `#/practice/${r.s}/${encodeURIComponent(r.tp)}` }, r.tp)), h('td', null, r.n), h('td', null, bar(r.acc), ' ', pct(r.acc)), h('td', null, Math.round(r.sec) + 's')))))
        : h('p', { class: 'muted' }, 'Start practising to see your analytics.')),
      card('AI performance coach', aiBox(() => EP.ai.analyze(collectStats()), 'Diagnose my preparation')),
      card('Your data', h('p', { class: 'muted' }, 'Progress is saved in this browser. Export a backup to move it to another device.'),
        h('div', { class: 'row' },
          h('button', { class: 'btn', onclick: () => { const a = h('a', { href: URL.createObjectURL(new Blob([S.exportData()], { type: 'application/json' })), download: `examprep-backup-${S.today()}.json` }); a.click(); } }, '⬇ Export'),
          h('button', { class: 'btn', onclick: () => fileIn.click() }, '⬆ Import'), fileIn,
          h('button', { class: 'btn danger', onclick: () => { if (confirm('Erase all progress on this device?')) { S.reset(); render(); } } }, 'Reset'))),
    ];
  }

  function heatmap() {
    const cells = [];
    const start = S.addDays(S.today(), -83);
    for (let i = 0; i < 84; i++) {
      const d = S.addDays(start, i); const n = (S.state.days[d] || { n: 0 }).n;
      const lvl = n === 0 ? 0 : n < 10 ? 1 : n < 30 ? 2 : n < 60 ? 3 : 4;
      cells.push(h('span', { class: 'hm l' + lvl, title: `${d}: ${n} questions` }));
    }
    return h('div', { class: 'heatmap' }, cells);
  }

  function trend(vals, labels) {
    const W = 600, H = 160, P = 24;
    const x = (i) => P + (vals.length === 1 ? (W - 2 * P) / 2 : (i * (W - 2 * P)) / (vals.length - 1));
    const y = (v) => H - P - v * (H - 2 * P);
    const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const svg = `<svg viewBox="0 0 ${W} ${H}" class="trend" role="img" aria-label="Mock score trend">
      ${[0, 0.5, 1].map((g) => `<line x1="${P}" x2="${W - P}" y1="${y(g)}" y2="${y(g)}" class="grid"/><text x="2" y="${y(g) + 4}" class="axis">${g * 100}%</text>`).join('')}
      <polyline points="${pts}" class="line"/>
      ${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" class="pt"><title>${esc(labels[i])}: ${Math.round(v * 100)}%</title></circle>`).join('')}
    </svg>`;
    return h('div', { html: svg });
  }

  // ---------- router ----------
  const routes = {
    '': Dashboard, learn: Learn, practice: Practice, mock: MockList, pyq: PYQ, revise: Revise, plan: Plan, progress: Progress,
    tutor: () => Tutor(new URLSearchParams(location.hash.split('?')[1] || '').get('q')),
  };
  let lastHash = location.hash;
  function render() {
    cleanups.forEach((f) => f()); cleanups = []; keyHandler = null; leaveGuard = null;
    const [path] = location.hash.replace(/^#\/?/, '').split('?');
    const [name, ...args] = path.split('/').map(decodeURIComponent);
    const fn = routes[name] || Dashboard;
    document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === '#/' + (routes[name] ? name : '')));
    const out = fn(...args);
    if (out) view.replaceChildren(...[].concat(out).filter(Boolean));
    lastHash = location.hash;
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', () => {
    if (leaveGuard && leaveGuard()) { history.replaceState(null, '', lastHash); return; }
    render();
  });
  window.addEventListener('beforeunload', (e) => { if (leaveGuard && document.body.classList.contains('in-test')) { e.preventDefault(); e.returnValue = ''; } });

  EP.ai.available().then((ok) => document.body.classList.toggle('ai-on', ok));
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  render();
})();
