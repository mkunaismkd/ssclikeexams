/* Procedural Reasoning / General Intelligence generators. */
(function (root) {
  const EP = root.EP || require('./core.js');
  const { ri, pick, mcq, near, shuffle, letterAt, posOf, LETTERS } = EP;
  const S = 'reasoning';
  const Q = (topic, o) => mcq({ subject: S, topic, ...o });
  const G = {};

  G.numberSeries = () => {
    const kind = pick(['ap', 'gp', 'sq', 'cube', 'alt', 'fib']);
    let seq, rule;
    if (kind === 'ap') { const a = ri(1, 40), d = ri(3, 15); seq = [0, 1, 2, 3, 4, 5].map((i) => a + i * d); rule = `add ${d} each time`; }
    else if (kind === 'gp') { const a = ri(1, 6), r = ri(2, 4); seq = [0, 1, 2, 3, 4, 5].map((i) => a * r ** i); rule = `multiply by ${r}`; }
    else if (kind === 'sq') { const s = ri(1, 10); seq = [0, 1, 2, 3, 4, 5].map((i) => (s + i) ** 2); rule = `squares of ${s}, ${s + 1}, …`; }
    else if (kind === 'cube') { const s = ri(1, 5); seq = [0, 1, 2, 3, 4, 5].map((i) => (s + i) ** 3); rule = `cubes of ${s}, ${s + 1}, …`; }
    else if (kind === 'alt') { const a = ri(2, 20), p = ri(2, 9), m = ri(1, p - 1); seq = [a]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + (i % 2 ? p : -m)); rule = `alternately +${p} and −${m}`; }
    else { const a = ri(1, 5), b = ri(a, 8); seq = [a, b]; for (let i = 2; i < 6; i++) seq.push(seq[i - 1] + seq[i - 2]); rule = `each term = sum of previous two`; }
    const ans = seq[5];
    return Q('Number Series', {
      q: `What comes next? ${seq.slice(0, 5).join(', ')}, ?`,
      correct: ans, distractors: near(ans, { step: Math.max(1, Math.round(ans / 15)) }),
      explanation: `Pattern: ${rule}. Next term = ${ans}.`,
      difficulty: kind === 'fib' || kind === 'alt' ? 2 : 1,
    });
  };

  G.letterSeries = () => {
    const start = ri(0, 10), step = ri(2, 4);
    const grp = [0, 1, 2, 3, 4].map((i) => letterAt(start + i * step) + letterAt(start + i * step + 1));
    const ans = grp[4];
    return Q('Alphabet Series', {
      q: `What comes next? ${grp.slice(0, 4).join(', ')}, ?`,
      correct: ans,
      distractors: [letterAt(start + 4 * step + 1) + letterAt(start + 4 * step + 2), letterAt(start + 4 * step - 1) + letterAt(start + 4 * step), letterAt(start + 4 * step) + letterAt(start + 4 * step + 2), letterAt(start + 5 * step) + letterAt(start + 5 * step + 1)],
      explanation: `The first letters move ${step} places each time (${grp.map((g) => g[0]).join(' → ')}), and each pair is two consecutive letters. Next: ${ans}.`,
    });
  };

  const WORDS = ['BANK', 'MONEY', 'PAPER', 'TRAIN', 'EXAM', 'CLOCK', 'GREEN', 'PLANT', 'RIVER', 'STONE', 'LIGHT', 'WATER', 'MANGO', 'CHAIR', 'TABLE', 'SMART', 'NORTH', 'QUICK', 'FRESH', 'DREAM'];
  const shift = (w, k) => w.split('').map((c) => letterAt(posOf(c) + k)).join('');

  G.coding = () => {
    const k = pick([1, 2, 3, -1, -2]);
    const [w1, w2] = shuffle(WORDS);
    const kind = Math.random() < 0.7 ? 'shift' : 'reverse';
    const enc = (w) => (kind === 'shift' ? shift(w, k) : shift(w.split('').reverse().join(''), k));
    const ans = enc(w2);
    const desc = kind === 'shift' ? `each letter is shifted ${Math.abs(k)} place(s) ${k > 0 ? 'forward' : 'backward'}` : `the word is reversed and then each letter shifted ${Math.abs(k)} place(s) ${k > 0 ? 'forward' : 'backward'}`;
    return Q('Coding-Decoding', {
      q: `If ${w1} is coded as ${enc(w1)}, how is ${w2} coded in that language?`,
      correct: ans,
      distractors: [shift(w2, k + 1), shift(w2, -k), shift(w2.split('').reverse().join(''), k === 1 ? 2 : 1), kind === 'shift' ? shift(w2.split('').reverse().join(''), k) : shift(w2, k)],
      explanation: `In ${w1} → ${enc(w1)}, ${desc}. Applying the same rule: ${w2} → ${ans}.`,
    });
  };

  G.analogy = () => {
    const rules = [
      [(x) => x * x, 'square'], [(x) => x ** 3, 'cube'], [(x) => x * x + 1, 'square + 1'], [(x) => x * x - 1, 'square − 1'], [(x) => x * (x + 1), 'n × (n + 1)'], [(x) => 2 * x + 3, '2n + 3'],
    ];
    const [f, name] = pick(rules);
    const [a, b] = shuffle([2, 3, 4, 5, 6, 7, 8, 9, 11, 12]);
    const ans = f(b);
    return Q('Analogy', {
      q: `${a} : ${f(a)} :: ${b} : ?`,
      correct: ans, distractors: near(ans, { step: Math.max(1, Math.round(ans / 12)) }).concat([b * b, b ** 3]),
      explanation: `Rule: ${name}. ${a} → ${f(a)}, so ${b} → ${ans}.`,
      difficulty: 1,
    });
  };

  G.oddOne = () => {
    const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
    const kind = pick(['prime', 'square', 'mult']);
    let group, odd, why;
    if (kind === 'prime') {
      const primes = shuffle([11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73]).slice(0, 3);
      odd = pick([21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 87, 91]);
      group = primes; why = `${primes.join(', ')} are prime; ${odd} is composite`;
    } else if (kind === 'square') {
      const sq = shuffle([4, 5, 6, 7, 8, 9, 11, 12, 13, 14]).slice(0, 3).map((x) => x * x);
      do { odd = ri(20, 200); } while (Number.isInteger(Math.sqrt(odd)));
      group = sq; why = `${sq.join(', ')} are perfect squares; ${odd} is not`;
    } else {
      const m = pick([6, 7, 8, 9, 11, 13]);
      group = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3).map((x) => x * m);
      do { odd = ri(20, 110); } while (odd % m === 0);
      why = `${group.join(', ')} are multiples of ${m}; ${odd} is not`;
    }
    if (kind === 'prime' && isPrime(odd)) return G.oddOne();
    return Q('Classification (Odd One Out)', {
      q: 'Find the odd one out.', correct: odd, distractors: group,
      explanation: `${why}.`, difficulty: 1,
    });
  };

  G.letterPosition = () => {
    const n = ri(3, 12);
    const fromRight = Math.random() < 0.5;
    const idx = fromRight ? 26 - n : n - 1;
    const ans = LETTERS[idx];
    const kth = (k) => k + (['th', 'st', 'nd', 'rd'][(k % 100 > 10 && k % 100 < 14) ? 0 : k % 10 < 4 ? k % 10 : 0] || 'th');
    return Q('Alphabet Test', {
      q: `Which letter is ${kth(n)} from the ${fromRight ? 'right' : 'left'} end of the English alphabet?`,
      correct: ans, distractors: [LETTERS[idx + 1] || 'A', LETTERS[idx - 1] || 'Z', LETTERS[fromRight ? n - 1 : 26 - n], LETTERS[idx + 2] || 'B'],
      explanation: fromRight ? `nth from right = (27 − n)th from left = ${27 - n}th from left = ${ans}.` : `Counting from A: ${kth(n)} letter is ${ans}.`,
      difficulty: 1,
    });
  };

  G.direction = () => {
    const DIRS = ['North', 'East', 'South', 'West'];
    const vec = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let tries = 0; tries < 200; tries++) {
      let d = ri(0, 3), x = 0, y = 0;
      const steps = [];
      const n = ri(3, 4);
      for (let i = 0; i < n; i++) {
        const dist = ri(1, 8) * 5;
        if (i > 0) { const turn = pick(['right', 'left']); d = (d + (turn === 'right' ? 1 : 3)) % 4; steps.push(`turns ${turn} and walks ${dist} m`); }
        else steps.push(`walks ${dist} m towards ${DIRS[d]}`);
        x += vec[d][0] * dist; y += vec[d][1] * dist;
      }
      const dist = Math.sqrt(x * x + y * y);
      if (!dist || !Number.isInteger(dist)) continue;
      const ns = y > 0 ? 'North' : y < 0 ? 'South' : '';
      const ew = x > 0 ? 'East' : x < 0 ? 'West' : '';
      const dir = ns && ew ? `${ns}-${ew}` : ns || ew;
      const flip = { North: 'South', South: 'North', East: 'West', West: 'East' };
      const wrongDir = dir.split('-').map((p) => flip[p]).join('-');
      return Q('Direction Sense', {
        q: `Ravi ${steps.join(', then ')}. How far and in which direction is he from his starting point?`,
        correct: `${dist} m, ${dir}`,
        distractors: [`${dist} m, ${wrongDir}`, `${Math.abs(x) + Math.abs(y)} m, ${dir}`, `${dist + 5} m, ${dir}`, `${Math.abs(x) + Math.abs(y)} m, ${wrongDir}`],
        fallback: () => `${dist + pick([10, 15, 20, -5])} m, ${pick([dir, wrongDir])}`,
        explanation: `Take start as origin (East = +x, North = +y). Final position = (${x}, ${y}). Distance = √(${x}² + ${y}²) = ${dist} m, direction ${dir} of start.`,
        difficulty: 2,
      });
    }
    return G.numberSeries();
  };

  G.ranking = () => {
    const l = ri(5, 30), r = ri(5, 30);
    if (Math.random() < 0.5) {
      const total = l + r - 1;
      return Q('Order & Ranking', {
        q: `In a row of students, Meena is ${l}th from the left and ${r}th from the right. How many students are in the row?`,
        correct: total, distractors: [l + r, l + r + 1, l + r - 2, total + 3],
        explanation: `Total = left rank + right rank − 1 = ${l} + ${r} − 1 = ${total}.`,
        difficulty: 1,
      });
    }
    const total = l + r - 1 + ri(0, 10);
    const ans = total - l + 1;
    return Q('Order & Ranking', {
      q: `In a class of ${total} students, Arun ranks ${l}th from the top. What is his rank from the bottom?`,
      correct: ans, distractors: [total - l, ans + 1, total - l + 2, ans + 2],
      explanation: `Rank from bottom = total − rank from top + 1 = ${total} − ${l} + 1 = ${ans}.`,
      difficulty: 1,
    });
  };

  G.clock = () => {
    const h = ri(1, 12), m = pick([0, 10, 12, 15, 20, 24, 30, 36, 40, 45, 48, 50]);
    let a = Math.abs(30 * (h % 12) - 5.5 * m);
    if (a > 180) a = 360 - a;
    return Q('Clock', {
      q: `What is the angle between the hour and minute hands at ${h}:${String(m).padStart(2, '0')}?`,
      correct: a, render: (x) => EP.fmt(x) + '°',
      distractors: [Math.abs(30 * h - 6 * m) % 360, a + 15, Math.abs(a - 15), 360 - a, a + 30],
      explanation: `Angle = |30H − 5.5M| = |30 × ${h % 12} − 5.5 × ${m}| = ${Math.abs(30 * (h % 12) - 5.5 * m)}°${Math.abs(30 * (h % 12) - 5.5 * m) > 180 ? ` → reflex, so 360 − that = ${a}°` : ''}.`,
    });
  };

  G.calendar = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const t = ri(0, 6), n = ri(15, 400);
    const ans = days[(t + n) % 7];
    return Q('Calendar', {
      q: `If today is ${days[t]}, what day of the week will it be after ${n} days?`,
      correct: ans, distractors: shuffle(days.filter((d) => d !== ans)),
      explanation: `${n} mod 7 = ${n % 7} odd day(s). ${days[t]} + ${n % 7} = ${ans}.`,
      difficulty: 1,
    });
  };

  // Bank-exam style coded inequality (conclusions I & II).
  G.inequality = () => {
    const syms = ['>', '≥', '=', '<', '≤'];
    const flip = { '>': '<', '<': '>', '≥': '≤', '≤': '≥', '=': '=' };
    const L = shuffle('ABCDEFGHJKLMPRSTUVWZ'.split('')).slice(0, 5);
    const chain = [];
    for (let i = 0; i < 4; i++) chain.push(pick(Math.random() < 0.15 ? ['='] : ['>', '≥', '<', '≤']));
    const rel = (i, j) => {
      if (i > j) { const r = rel(j, i); return r && flip[r]; }
      const s = chain.slice(i, j);
      const up = s.every((c) => c === '>' || c === '≥' || c === '=');
      const down = s.every((c) => c === '<' || c === '≤' || c === '=');
      if (up && down) return '=';
      if (up) return s.includes('>') ? '>' : '≥';
      if (down) return s.includes('<') ? '<' : '≤';
      return null;
    };
    const complement = (a, b) => [['≥', '<'], ['≤', '>'], ['<', '≥'], ['>', '≤']].some(([p, q]) => p === a && q === b);
    let concl, i, j;
    do { i = ri(0, 4); j = ri(0, 4); } while (Math.abs(i - j) < 2);
    const d = rel(i, j);
    if (Math.random() < 0.3) {
      // Same-pair pair of conclusions — tests the "either-or" rule.
      if (d === '≥') concl = [[i, '>', j], [i, '=', j]];
      else if (d === '≤') concl = [[i, '<', j], [i, '=', j]];
      else if (d === null) concl = pick([[[i, '≥', j], [i, '<', j]], [[i, '≤', j], [i, '>', j]]]);
    }
    if (!concl) {
      concl = [];
      const pairs = [[i, j]];
      let p, q; do { p = ri(0, 4); q = ri(0, 4); } while (p === q || (p === i && q === j));
      pairs.push([p, q]);
      for (const [a, b] of pairs) {
        const r = rel(a, b);
        // Never offer a conclusion that is true-but-weaker (e.g. A ≥ C when A > C): exams disagree on those.
        const weaker = { '>': ['≥'], '<': ['≤'], '=': ['≥', '≤'] }[r] || [];
        concl.push([a, r && Math.random() < 0.55 ? r : pick(syms.filter((s) => s !== '=' && s !== r && !weaker.includes(s))), b]);
      }
    }
    const follows = concl.map(([a, op, b]) => rel(a, b) === op);
    let ans;
    if (follows[0] && follows[1]) ans = 4;
    else if (follows[0]) ans = 0;
    else if (follows[1]) ans = 1;
    else if (concl[0][0] === concl[1][0] && concl[0][2] === concl[1][2] &&
      ((rel(concl[0][0], concl[0][2]) === null && complement(concl[0][1], concl[1][1])) || (rel(concl[0][0], concl[0][2]) === '≥' && [concl[0][1], concl[1][1]].sort().join() === ['=', '>'].sort().join()) ||
        (rel(concl[0][0], concl[0][2]) === '≤' && [concl[0][1], concl[1][1]].sort().join() === ['<', '='].sort().join()))) ans = 2;
    else ans = 3;
    const stmt = L.map((c, k) => (k < 4 ? `${c} ${chain[k]} ` : c)).join('');
    const cs = concl.map(([a, op, b]) => `${L[a]} ${op} ${L[b]}`);
    const why = concl.map(([a, op, b], k) => {
      const r = rel(a, b);
      return `${k ? 'II' : 'I'}: from the chain, ${L[a]} ${r || '?'} ${L[b]}${r ? '' : ' (no definite relation — the signs point in opposite directions)'} ⇒ "${cs[k]}" ${follows[k] ? 'follows' : 'does not follow'}.`;
    }).join(' ');
    return {
      subject: S, topic: 'Inequality', difficulty: 3,
      q: `Statement: ${stmt}\nConclusions:\nI. ${cs[0]}\nII. ${cs[1]}`,
      options: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither I nor II follows', 'Both I and II follow'],
      answer: ans,
      explanation: why + (ans === 2 ? ' Together the two conclusions cover every possibility for the same pair, so either I or II follows.' : ''),
    };
  };

  G.mathOps = () => {
    const ops = ['+', '−', '×', '÷'];
    const codes = shuffle(['@', '#', '$', '%']);
    const map = Object.fromEntries(ops.map((o, i) => [codes[i], o]));
    const c = ri(2, 9), dd = ri(2, 6);
    const b = c * dd * ri(1, 4);
    const a = ri(10, 60), e = ri(1, 9);
    // expression: a + b ÷ c − e × dd  written in codes
    const code = (o) => codes[ops.indexOf(o)];
    const val = a + b / c - e * dd;
    return Q('Mathematical Operations', {
      q: `If ${codes.map((k) => `'${k}' means '${map[k]}'`).join(', ')}, find the value of:\n${a} ${code('+')} ${b} ${code('÷')} ${c} ${code('−')} ${e} ${code('×')} ${dd}`,
      correct: val, render: EP.fmt,
      distractors: [((a + b) / c) - e * dd, a + b / c - e + dd, val + dd, val - c, (a + b / c - e) * dd],
      fallback: () => val + ri(1, 9),
      explanation: `Decoded: ${a} + ${b} ÷ ${c} − ${e} × ${dd}. BODMAS: ${b} ÷ ${c} = ${b / c}, ${e} × ${dd} = ${e * dd}. Result = ${a} + ${b / c} − ${e * dd} = ${EP.fmt(val)}.`,
    });
  };

  G.dictionary = () => {
    const pool = ['Recount', 'Record', 'Receive', 'Recipe', 'Recite', 'Reckon', 'Recover', 'Recruit', 'Rectify', 'Recycle', 'Reduce', 'Refer', 'Reflect', 'Reform', 'Refuse'];
    const w = shuffle(pool).slice(0, 5);
    const sorted = w.slice().sort();
    const k = ri(1, 5);
    const ans = sorted[k - 1];
    const ord = ['first', 'second', 'third', 'fourth', 'fifth'][k - 1];
    return Q('Word Arrangement', {
      q: `Arrange the words in dictionary order. Which comes ${ord}?\n${w.join(', ')}`,
      correct: ans, distractors: w.filter((x) => x !== ans),
      explanation: `Dictionary order: ${sorted.join(' → ')}. The ${ord} word is ${ans}.`,
      difficulty: 1,
    });
  };

  const TOPICS = {
    'Number Series': [G.numberSeries],
    'Alphabet Series': [G.letterSeries],
    'Coding-Decoding': [G.coding],
    'Analogy': [G.analogy],
    'Classification (Odd One Out)': [G.oddOne],
    'Alphabet Test': [G.letterPosition],
    'Direction Sense': [G.direction],
    'Order & Ranking': [G.ranking],
    'Clock': [G.clock],
    'Calendar': [G.calendar],
    'Inequality': [G.inequality],
    'Mathematical Operations': [G.mathOps],
    'Word Arrangement': [G.dictionary],
  };

  EP.reasoningTopics = TOPICS;
  if (typeof module !== 'undefined' && module.exports) module.exports = TOPICS;
})(typeof window !== 'undefined' ? window : globalThis);
