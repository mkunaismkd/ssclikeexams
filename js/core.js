/* Shared helpers. Loaded as a classic script (window.EP) and as a CommonJS module in tests. */
(function (root) {
  const EP = root.EP || (root.EP = {});

  const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  const fmt = (n) => {
    const r = round(n, 2);
    return Number.isInteger(r) ? r.toLocaleString('en-IN') : r.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };
  const frac = (n, d) => {
    const g = gcd(n, d);
    n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    return d === 1 ? String(n) : `${n}/${d}`;
  };

  /**
   * Build a multiple-choice question. `correct` and `distractors` are display strings (or numbers
   * run through `render`). Duplicates are dropped and, if needed, filled from `fallback()`.
   */
  function mcq({ topic, subject, q, correct, distractors, explanation, render = String, fallback, count = 4, difficulty = 2 }) {
    const c = render(correct);
    const seen = new Set([c]);
    const wrong = [];
    for (const d of distractors) {
      const s = render(d);
      if (!seen.has(s)) { seen.add(s); wrong.push(s); }
      if (wrong.length === count - 1) break;
    }
    // Numeric answers get an automatic nearby-value fallback so every question has `count` options.
    if (!fallback && typeof correct === 'number') {
      const step = Math.max(1, Math.round(Math.abs(correct) * 0.08));
      fallback = () => correct + pick([-4, -3, -2, -1, 1, 2, 3, 4, 5]) * step;
    }
    let guard = 0;
    while (wrong.length < count - 1 && fallback && guard++ < 50) {
      const s = render(fallback());
      if (!seen.has(s)) { seen.add(s); wrong.push(s); }
    }
    const options = shuffle([c, ...wrong]);
    return { subject, topic, q, options, answer: options.indexOf(c), explanation, difficulty };
  }

  /** Numeric distractors near the true value. */
  function near(v, { step = 1, spread = 4, integer = true } = {}) {
    const out = [];
    const deltas = shuffle([1, 2, 3, 4, 5, -1, -2, -3, -4].slice(0, spread + 4));
    for (const k of deltas) {
      let x = v + k * step;
      if (integer) x = Math.round(x);
      if (x > 0 && x !== v) out.push(x);
    }
    return out;
  }

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const letterAt = (i) => LETTERS[((i % 26) + 26) % 26];
  const posOf = (ch) => LETTERS.indexOf(ch.toUpperCase());

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0).toString(36);
  }

  Object.assign(EP, { ri, pick, shuffle, gcd, lcm, round, fmt, frac, mcq, near, LETTERS, letterAt, posOf, hash });

  if (typeof module !== 'undefined' && module.exports) module.exports = EP;
})(typeof window !== 'undefined' ? window : globalThis);
