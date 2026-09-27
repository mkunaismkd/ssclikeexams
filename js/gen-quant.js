/* Procedural Quantitative Aptitude generators. Every call returns a fresh question with a worked solution. */
(function (root) {
  const EP = root.EP || require('./core.js');
  const { ri, pick, fmt, mcq, near, gcd, lcm, frac, round, shuffle } = EP;
  const S = 'quant';
  const Q = (topic, o) => mcq({ subject: S, topic, ...o });
  const rs = (n) => '₹' + fmt(n);

  const G = {};

  G.percentage = () => {
    const p = pick([5, 10, 12.5, 15, 16, 20, 25, 30, 35, 37.5, 40, 45, 60, 62.5, 75, 120, 150]);
    const base = ri(2, 40) * 40;
    const ans = (p * base) / 100;
    return Q('Percentage', {
      q: `What is ${p}% of ${fmt(base)}?`,
      correct: ans, render: fmt,
      distractors: [ans * 1.1, ans * 0.9, (p + 5) * base / 100, (p - 5) * base / 100, ans + 10],
      explanation: `${p}% of ${fmt(base)} = ${p}/100 × ${fmt(base)} = ${fmt(ans)}.`,
      difficulty: 1,
    });
  };

  G.successivePct = () => {
    const a = pick([10, 20, 25, 30, 40, 50]);
    const b = pick([10, 20, 25, 30, 40]);
    const net = a - b - (a * b) / 100;
    const word = net >= 0 ? 'increase' : 'decrease';
    const show = (x) => `${fmt(Math.abs(x))}% ${x >= 0 ? 'increase' : 'decrease'}`;
    return Q('Percentage', {
      q: `The price of an article is first increased by ${a}% and then decreased by ${b}%. What is the net percentage change?`,
      correct: net, render: show,
      distractors: [a - b, -(a - b) || 1, net + 2, net - 2, -net, a + b - (a * b) / 100],
      explanation: `Net change = a + b + ab/100 = ${a} + (−${b}) + (${a} × −${b})/100 = ${fmt(net)}%, i.e. a ${fmt(Math.abs(net))}% ${word}.`,
    });
  };

  G.profitLoss = () => {
    const cp = ri(4, 60) * 50;
    const p = pick([5, 8, 10, 12, 15, 20, 25, 30, -5, -10, -12, -15, -20, -25]);
    const sp = cp * (1 + p / 100);
    const pl = p >= 0 ? 'profit' : 'loss';
    if (Math.random() < 0.5) {
      return Q('Profit & Loss', {
        q: `An article bought for ${rs(cp)} is sold at a ${pl} of ${Math.abs(p)}%. Find the selling price.`,
        correct: sp, render: rs,
        distractors: [cp * (1 - p / 100), sp + 50, sp - 50, cp + Math.abs(p), sp + 25],
        explanation: `SP = CP × (100 ${p >= 0 ? '+' : '−'} ${Math.abs(p)})/100 = ${fmt(cp)} × ${100 + p}/100 = ${rs(sp)}.`,
        difficulty: 1,
      });
    }
    return Q('Profit & Loss', {
      q: `An article bought for ${rs(cp)} is sold for ${rs(sp)}. Find the profit or loss percent.`,
      correct: `${Math.abs(p)}% ${pl}`,
      distractors: [`${Math.abs(p)}% ${p >= 0 ? 'loss' : 'profit'}`, `${Math.abs(p) + 5}% ${pl}`, `${Math.abs(p) + 2}% ${pl}`, `${round((Math.abs(sp - cp) / sp) * 100)}% ${pl}`],
      explanation: `${pl === 'profit' ? 'Profit' : 'Loss'} = |${fmt(sp)} − ${fmt(cp)}| = ${fmt(Math.abs(sp - cp))}. % = ${fmt(Math.abs(sp - cp))}/${fmt(cp)} × 100 = ${Math.abs(p)}% (always on CP).`,
    });
  };

  G.discount = () => {
    const mp = ri(4, 40) * 100;
    const d1 = pick([10, 20, 25, 30]);
    const d2 = pick([5, 10, 15, 20]);
    const sp = mp * (1 - d1 / 100) * (1 - d2 / 100);
    const single = 100 - (100 - d1) * (100 - d2) / 100;
    if (Math.random() < 0.5) {
      return Q('Discount', {
        q: `A shopkeeper offers successive discounts of ${d1}% and ${d2}% on an article marked at ${rs(mp)}. What is the selling price?`,
        correct: sp, render: rs,
        distractors: [mp * (1 - (d1 + d2) / 100), sp + 20, sp - 20, sp + 50],
        explanation: `SP = ${fmt(mp)} × ${(100 - d1)}/100 × ${(100 - d2)}/100 = ${rs(sp)}.`,
      });
    }
    return Q('Discount', {
      q: `Successive discounts of ${d1}% and ${d2}% are equivalent to a single discount of:`,
      correct: single, render: (x) => fmt(x) + '%',
      distractors: [d1 + d2, single + 1, single - 1, single + 2.5],
      explanation: `Single discount = a + b − ab/100 = ${d1} + ${d2} − ${d1 * d2}/100 = ${fmt(single)}%.`,
    });
  };

  G.simpleInterest = () => {
    const P = ri(2, 30) * 500;
    const R = pick([4, 5, 6, 8, 10, 12, 12.5, 15]);
    const T = ri(2, 6);
    const si = (P * R * T) / 100;
    if (Math.random() < 0.5) {
      return Q('Simple Interest', {
        q: `Find the simple interest on ${rs(P)} at ${R}% per annum for ${T} years.`,
        correct: si, render: rs,
        distractors: [si + P * R / 100, si - P * R / 100, (P * R * (T + 0.5)) / 100, si * 1.2],
        explanation: `SI = PRT/100 = ${fmt(P)} × ${R} × ${T}/100 = ${rs(si)}.`,
        difficulty: 1,
      });
    }
    return Q('Simple Interest', {
      q: `A sum of ${rs(P)} amounts to ${rs(P + si)} in ${T} years at simple interest. Find the rate of interest per annum.`,
      correct: R, render: (x) => fmt(x) + '%',
      distractors: [R + 1, R - 1, R + 2, R * 1.5, R + 0.5],
      explanation: `SI = ${fmt(P + si)} − ${fmt(P)} = ${fmt(si)}. R = SI × 100/(P × T) = ${fmt(si)} × 100/(${fmt(P)} × ${T}) = ${R}%.`,
    });
  };

  G.compoundInterest = () => {
    const P = pick([1000, 2000, 4000, 5000, 8000, 10000, 12000, 15000, 16000, 20000]);
    const R = pick([5, 10, 20]);
    const T = pick([2, 2, 3]);
    const A = P * (1 + R / 100) ** T;
    const ci = A - P;
    const si = (P * R * T) / 100;
    if (T === 2 && Math.random() < 0.4) {
      const diff = (P * R * R) / 10000;
      return Q('Compound Interest', {
        q: `What is the difference between compound interest and simple interest on ${rs(P)} for 2 years at ${R}% per annum?`,
        correct: diff, render: rs,
        distractors: [diff * 2, diff + 10, diff / 2, (P * R) / 100],
        explanation: `For 2 years, CI − SI = P(R/100)² = ${fmt(P)} × (${R}/100)² = ${rs(diff)}.`,
      });
    }
    return Q('Compound Interest', {
      q: `Find the compound interest on ${rs(P)} at ${R}% per annum for ${T} years, compounded annually.`,
      correct: ci, render: rs,
      distractors: [si, ci + (P * R) / 100, ci - 10, A],
      explanation: `A = P(1 + R/100)^T = ${fmt(P)} × (${fmt(1 + R / 100)})^${T} = ${fmt(A)}. CI = A − P = ${rs(ci)}.`,
    });
  };

  G.ratio = () => {
    const a = ri(1, 7), b = ri(1, 7), c = ri(1, 7);
    const sum = a + b + c;
    const total = sum * ri(5, 60) * 10;
    const share = (total * b) / sum;
    return Q('Ratio & Proportion', {
      q: `${rs(total)} is divided among A, B and C in the ratio ${a} : ${b} : ${c}. What is B's share?`,
      correct: share, render: rs,
      distractors: [(total * a) / sum, (total * c) / sum, share + total / sum, share - total / sum / 2, total / 3],
      fallback: () => share + ri(1, 9) * 10,
      explanation: `B's share = ${b}/(${a}+${b}+${c}) × ${fmt(total)} = ${b}/${sum} × ${fmt(total)} = ${rs(share)}.`,
      difficulty: 1,
    });
  };

  G.average = () => {
    const n = ri(5, 15);
    const avg = ri(20, 60);
    const newAvg = avg + pick([1, 2, 3, -1, -2]);
    const added = newAvg * (n + 1) - avg * n;
    return Q('Average', {
      q: `The average of ${n} numbers is ${avg}. When one more number is included, the average becomes ${newAvg}. What is the new number?`,
      correct: added, render: fmt,
      distractors: near(added, { step: n > 8 ? 2 : 1 }).concat([newAvg, avg + n]),
      explanation: `New number = new total − old total = ${newAvg} × ${n + 1} − ${avg} × ${n} = ${newAvg * (n + 1)} − ${avg * n} = ${added}.`,
    });
  };

  G.timeWork = () => {
    const pairs = [[10, 15], [12, 24], [20, 30], [15, 10], [6, 12], [12, 18], [18, 36], [20, 60], [24, 40], [30, 45], [8, 24], [14, 21]];
    const [a, b] = pick(pairs);
    const t = (a * b) / (a + b);
    return Q('Time & Work', {
      q: `A can finish a work in ${a} days and B can finish it in ${b} days. In how many days can they finish it working together?`,
      correct: t, render: (x) => fmt(x) + ' days',
      distractors: [(a + b) / 2, t + 1, t - 1, t + 2, Math.abs(a - b)].filter((x) => x > 0),
      explanation: `Together = ab/(a+b) = ${a} × ${b}/(${a}+${b}) = ${a * b}/${a + b} = ${fmt(t)} days.`,
    });
  };

  G.pipes = () => {
    const sets = [[10, 15], [6, 12], [12, 20], [8, 12], [15, 20], [20, 30], [4, 6], [9, 12], [18, 36]];
    const [f, e] = pick(sets);
    const t = (f * e) / (e - f);
    return Q('Pipes & Cisterns', {
      q: `Pipe A can fill a tank in ${f} hours and pipe B can empty the full tank in ${e} hours. If both are opened together on an empty tank, in how many hours will it be filled?`,
      correct: t, render: (x) => fmt(x) + ' hours',
      distractors: [(f * e) / (f + e), t + 2, t - 2, e - f, t * 2],
      explanation: `Net filling per hour = 1/${f} − 1/${e} = ${e - f}/${f * e}. Time = ${f * e}/${e - f} = ${fmt(t)} hours.`,
    });
  };

  G.train = () => {
    const kmph = pick([36, 45, 54, 72, 90, 108, 126, 144]);
    const ms = (kmph * 5) / 18;
    const len = ri(6, 30) * 10;
    if (Math.random() < 0.5) {
      const t = len / ms;
      if (!Number.isInteger(t * 2)) return G.train();
      return Q('Speed, Time & Distance', {
        q: `A train ${len} m long runs at ${kmph} km/h. How long will it take to cross a pole?`,
        correct: t, render: (x) => fmt(x) + ' s',
        distractors: [t + 2, t - 2, len / kmph, t * 2, t + 4],
        explanation: `${kmph} km/h = ${kmph} × 5/18 = ${fmt(ms)} m/s. Time = length/speed = ${len}/${fmt(ms)} = ${fmt(t)} s.`,
        difficulty: 1,
      });
    }
    const plat = ri(5, 40) * 10;
    const t = (len + plat) / ms;
    if (!Number.isInteger(t * 2)) return G.train();
    return Q('Speed, Time & Distance', {
      q: `A train ${len} m long running at ${kmph} km/h crosses a platform ${plat} m long. Find the time taken.`,
      correct: t, render: (x) => fmt(x) + ' s',
      distractors: [len / ms, plat / ms, t + 3, t - 3, t + 6],
      explanation: `Distance = train + platform = ${len + plat} m. Speed = ${fmt(ms)} m/s. Time = ${len + plat}/${fmt(ms)} = ${fmt(t)} s.`,
    });
  };

  G.boats = () => {
    const b = ri(8, 20), s = ri(1, 6);
    const d = (b * b - s * s) * pick([1, 2]) / gcd(b * b - s * s, 1);
    const tDown = d / (b + s), tUp = d / (b - s);
    return Q('Boats & Streams', {
      q: `A boat's speed in still water is ${b} km/h and the stream flows at ${s} km/h. How long will the boat take to go ${fmt(d)} km downstream and return?`,
      correct: tDown + tUp, render: (x) => fmt(x) + ' hours',
      distractors: [(2 * d) / b, tUp * 2, tDown * 2, tDown + tUp + 1],
      fallback: () => round(tDown + tUp + ri(2, 6) / 2, 2),
      explanation: `Downstream speed = ${b + s}, upstream = ${b - s}. Time = ${fmt(d)}/${b + s} + ${fmt(d)}/${b - s} = ${fmt(tDown)} + ${fmt(tUp)} = ${fmt(tDown + tUp)} hours.`,
    });
  };

  G.alligation = () => {
    const c1 = ri(3, 8) * 10, c2 = c1 + ri(2, 6) * 10;
    const m = c1 + ri(1, (c2 - c1) / 10 - 1) * 10;
    const r1 = c2 - m, r2 = m - c1, g = gcd(r1, r2);
    const ans = `${r1 / g} : ${r2 / g}`;
    return Q('Mixture & Alligation', {
      q: `In what ratio must rice at ₹${c1}/kg be mixed with rice at ₹${c2}/kg so that the mixture costs ₹${m}/kg?`,
      correct: ans,
      distractors: [`${r2 / g} : ${r1 / g}`, `${c1 / 10} : ${c2 / 10}`, `${r1 / g + 1} : ${r2 / g}`, `1 : 1`, `${r1 / g} : ${r2 / g + 1}`],
      explanation: `By alligation: (dearer − mean) : (mean − cheaper) = (${c2} − ${m}) : (${m} − ${c1}) = ${r1} : ${r2} = ${ans}.`,
    });
  };

  G.hcfLcm = () => {
    const h = ri(2, 12);
    let a = ri(2, 9), b = ri(2, 9);
    while (gcd(a, b) !== 1 || a === b) { a = ri(2, 9); b = ri(2, 9); }
    const x = h * a, y = h * b;
    if (Math.random() < 0.5) {
      return Q('Number System', {
        q: `Find the HCF of ${x} and ${y}.`,
        correct: h, distractors: [h * 2, h + 1, Math.max(1, h - 1), a, b, h * 3],
        explanation: `${x} = ${h} × ${a}, ${y} = ${h} × ${b}; ${a} and ${b} are co-prime, so HCF = ${h}.`,
        difficulty: 1,
      });
    }
    const l = lcm(x, y);
    return Q('Number System', {
      q: `The HCF of two numbers is ${h} and their LCM is ${l}. If one number is ${x}, find the other.`,
      correct: y, distractors: [y + h, y - h, l / h, x + h].filter((v) => v > 0),
      explanation: `Product of numbers = HCF × LCM ⇒ other = ${h} × ${l}/${x} = ${y}.`,
    });
  };

  G.unitDigit = () => {
    const base = ri(12, 99), exp = ri(20, 199);
    const d = base % 10;
    const cyc = [];
    let v = d;
    do { cyc.push(v); v = (v * d) % 10; } while (v !== cyc[0] && cyc.length < 5);
    const ans = cyc[(exp - 1) % cyc.length];
    return Q('Number System', {
      q: `What is the unit digit of ${base}^${exp}?`,
      correct: ans, distractors: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== ans)),
      explanation: `Unit digits of powers of ${d} repeat as (${cyc.join(', ')}) — cycle length ${cyc.length}. ${exp} mod ${cyc.length} = ${exp % cyc.length || cyc.length} ⇒ unit digit ${ans}.`,
      difficulty: 2,
    });
  };

  G.remainder = () => {
    const d = pick([7, 9, 11, 13]);
    const n = ri(1000, 99999);
    const r = n % d;
    return Q('Number System', {
      q: `What is the remainder when ${n} is divided by ${d}?`,
      correct: r, distractors: shuffle(Array.from({ length: d }, (_, i) => i).filter((x) => x !== r)),
      explanation: `${n} = ${d} × ${Math.floor(n / d)} + ${r}.${d === 9 ? ` (Shortcut: digit sum ${String(n).split('').reduce((s, c) => s + +c, 0)} mod 9 = ${r}.)` : ''}`,
    });
  };

  G.simplify = () => {
    const a = ri(2, 20), b = ri(2, 12), c = ri(2, 9), d = ri(1, 30), e = ri(2, 6);
    const val = a + b * c - d + e * e;
    return Q('Simplification', {
      q: `Simplify: ${a} + ${b} × ${c} − ${d} + ${e}²`,
      correct: val,
      distractors: [(a + b) * c - d + e * e, a + b * c - d + 2 * e, val + 10, val - 10, a + b * (c - d) + e * e],
      explanation: `BODMAS: ${e}² = ${e * e}, ${b} × ${c} = ${b * c}. So ${a} + ${b * c} − ${d} + ${e * e} = ${val}.`,
      difficulty: 1,
    });
  };

  G.algebraReciprocal = () => {
    const k = ri(3, 9);
    if (Math.random() < 0.5) {
      const ans = k * k - 2;
      return Q('Algebra', {
        q: `If x + 1/x = ${k}, find the value of x² + 1/x².`,
        correct: ans, distractors: [k * k, k * k + 2, k * k - 1, 2 * k],
        explanation: `(x + 1/x)² = x² + 1/x² + 2 ⇒ x² + 1/x² = ${k}² − 2 = ${ans}.`,
      });
    }
    const ans = k ** 3 - 3 * k;
    return Q('Algebra', {
      q: `If x + 1/x = ${k}, find the value of x³ + 1/x³.`,
      correct: ans, distractors: [k ** 3, k ** 3 + 3 * k, k ** 3 - k, ans - 3],
      explanation: `x³ + 1/x³ = (x + 1/x)³ − 3(x + 1/x) = ${k ** 3} − ${3 * k} = ${ans}.`,
      difficulty: 3,
    });
  };

  G.algebraIdentity = () => {
    const a = ri(2, 9), b = ri(1, 8);
    const s = a + b, p = a * b;
    const ans = s * s - 2 * p;
    return Q('Algebra', {
      q: `If a + b = ${s} and ab = ${p}, find a² + b².`,
      correct: ans, distractors: [s * s + 2 * p, s * s - p, s * s, ans + 2],
      explanation: `a² + b² = (a + b)² − 2ab = ${s * s} − ${2 * p} = ${ans}.`,
    });
  };

  const triples = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [12, 16, 20]];

  G.triangle = () => {
    const [a, b, c] = pick(triples);
    const k = pick([1, 2, 3]);
    const A = a * k, B = b * k, C = c * k;
    if (Math.random() < 0.5) {
      const area = (A * B) / 2;
      return Q('Geometry & Mensuration', {
        q: `The sides of a triangle are ${A} cm, ${B} cm and ${C} cm. Find its area.`,
        correct: area, render: (x) => fmt(x) + ' cm²',
        distractors: [A * B, (B * C) / 2, (A * C) / 2, area + A],
        explanation: `${A}² + ${B}² = ${C}², so it is right-angled. Area = ½ × ${A} × ${B} = ${fmt(area)} cm².`,
      });
    }
    const x = ri(30, 80), y = ri(20, 150 - x);
    return Q('Geometry & Mensuration', {
      q: `Two angles of a triangle are ${x}° and ${y}°. Find the third angle.`,
      correct: 180 - x - y, render: (v) => v + '°',
      distractors: [360 - x - y, 180 - x, 180 - y, 90 - (x + y) / 2 > 0 ? 90 : 100, 190 - x - y].filter((v) => v > 0),
      explanation: `Sum of angles = 180°. Third angle = 180 − ${x} − ${y} = ${180 - x - y}°.`,
      difficulty: 1,
    });
  };

  G.circle = () => {
    const r = ri(1, 6) * 7;
    const kind = pick(['area', 'circ', 'cyl']);
    if (kind === 'area') {
      const ans = (22 / 7) * r * r;
      return Q('Geometry & Mensuration', {
        q: `Find the area of a circle of radius ${r} cm. (Use π = 22/7)`,
        correct: ans, render: (x) => fmt(x) + ' cm²',
        distractors: [2 * (22 / 7) * r, ans * 2, (22 / 7) * r * r * 4, ans + 22],
        explanation: `Area = πr² = 22/7 × ${r} × ${r} = ${fmt(ans)} cm².`,
        difficulty: 1,
      });
    }
    if (kind === 'circ') {
      const ans = 2 * (22 / 7) * r;
      return Q('Geometry & Mensuration', {
        q: `Find the circumference of a circle of radius ${r} cm. (Use π = 22/7)`,
        correct: ans, render: (x) => fmt(x) + ' cm',
        distractors: [(22 / 7) * r, ans * 2, (22 / 7) * r * r, ans + 22],
        explanation: `Circumference = 2πr = 2 × 22/7 × ${r} = ${fmt(ans)} cm.`,
        difficulty: 1,
      });
    }
    const h = ri(2, 20);
    const ans = (22 / 7) * r * r * h;
    return Q('Geometry & Mensuration', {
      q: `Find the volume of a cylinder with radius ${r} cm and height ${h} cm. (Use π = 22/7)`,
      correct: ans, render: (x) => fmt(x) + ' cm³',
      distractors: [2 * (22 / 7) * r * h, ans / 3, ans * 2, (22 / 7) * r * h * h],
      explanation: `V = πr²h = 22/7 × ${r}² × ${h} = ${fmt(ans)} cm³.`,
    });
  };

  G.trig = () => {
    const vals = {
      'sin 30°': [1, 2], 'cos 60°': [1, 2], 'tan 45°': [1, 1], 'sin 90°': [1, 1], 'cos 0°': [1, 1],
      'sin² 45°': [1, 2], 'cos² 30°': [3, 4], 'tan² 60°': [3, 1], 'sin² 60°': [3, 4], 'cot 45°': [1, 1], 'sec² 45°': [2, 1],
    };
    const keys = shuffle(Object.keys(vals));
    const k1 = keys[0], k2 = keys[1];
    const m = ri(1, 4);
    const [n1, d1] = vals[k1], [n2, d2] = vals[k2];
    const num = m * n1 * d2 + n2 * d1, den = d1 * d2;
    const ans = frac(num, den);
    return Q('Trigonometry', {
      q: `Find the value of ${m === 1 ? '' : m}${k1} + ${k2}.`,
      correct: ans,
      distractors: [frac(num + den, den), frac(num, den * 2), frac(Math.abs(m * n1 * d2 - n2 * d1) || 2, den), frac(num + 1, den), '0'],
      explanation: `${k1} = ${frac(n1, d1)}, ${k2} = ${frac(n2, d2)}. So ${m === 1 ? '' : m + ' × '}${frac(n1, d1)} + ${frac(n2, d2)} = ${ans}.`,
      difficulty: 2,
    });
  };

  G.ages = () => {
    const son = ri(5, 15), k = pick([2, 3, 4]);
    const father = son * k;
    const n = ri(3, 10);
    const ratioNum = father + n, ratioDen = son + n, g = gcd(ratioNum, ratioDen);
    return Q('Ages', {
      q: `A father is ${k} times as old as his son. After ${n} years the ratio of their ages will be ${ratioNum / g} : ${ratioDen / g}. What is the son's present age?`,
      correct: son, render: (x) => x + ' years',
      distractors: [son + 2, son - 2, son + n, father, son + 5].filter((x) => x > 0),
      explanation: `Let son = x, father = ${k}x. (${k}x + ${n})/(x + ${n}) = ${ratioNum / g}/${ratioDen / g}. Solving, x = ${son}. Check: ${father + n} : ${son + n} = ${ratioNum / g} : ${ratioDen / g}.`,
    });
  };

  G.partnership = () => {
    const a = ri(2, 9) * 1000, b = ri(2, 9) * 1000;
    const ta = 12, tb = pick([4, 6, 8, 9]);
    const wa = a * ta, wb = b * tb, g = gcd(wa, wb);
    const unit = ri(2, 20) * 100;
    const profit = (wa / g + wb / g) * unit;
    const bShare = (wb / g) * unit;
    return Q('Partnership', {
      q: `A starts a business with ${rs(a)}. After ${12 - tb} months B joins with ${rs(b)}. At the end of the year the profit is ${rs(profit)}. Find B's share.`,
      correct: bShare, render: rs,
      distractors: [(wa / g) * unit, (profit * b) / (a + b), bShare + unit, profit / 2],
      fallback: () => bShare + ri(1, 5) * 50,
      explanation: `Ratio = ${fmt(a)} × 12 : ${fmt(b)} × ${tb} = ${wa / g} : ${wb / g}. B's share = ${wb / g}/${wa / g + wb / g} × ${fmt(profit)} = ${rs(bShare)}.`,
    });
  };

  // RBI / bank-exam staple: compare roots of two quadratics.
  G.quadratic = () => {
    const roots = () => { let r1 = ri(-9, 9), r2 = ri(-9, 9); while (!r1 || !r2) { r1 = ri(-9, 9); r2 = ri(-9, 9); } return [r1, r2]; };
    const eq = (v, [r1, r2]) => {
      const b = -(r1 + r2), c = r1 * r2;
      const t = (n, s) => (n === 0 ? '' : ` ${n > 0 ? '+' : '−'} ${Math.abs(n) === 1 && s ? '' : Math.abs(n)}${s}`);
      return `${v}²${t(b, v)}${t(c, '')} = 0`;
    };
    const X = roots(), Y = roots();
    const pairs = [];
    for (const x of X) for (const y of Y) pairs.push(Math.sign(x - y));
    const opts = ['x > y', 'x ≥ y', 'x < y', 'x ≤ y', 'x = y or relationship cannot be established'];
    let ans;
    if (pairs.every((s) => s > 0)) ans = 0;
    else if (pairs.every((s) => s >= 0)) ans = pairs.every((s) => s === 0) ? 4 : 1;
    else if (pairs.every((s) => s < 0)) ans = 2;
    else if (pairs.every((s) => s <= 0)) ans = 3;
    else ans = 4;
    return {
      subject: S, topic: 'Quadratic Equations', difficulty: 3,
      q: `Solve both equations and find the relation between x and y:\nI. ${eq('x', X)}\nII. ${eq('y', Y)}`,
      options: opts, answer: ans,
      explanation: `I gives x = ${X[0]}, ${X[1]}. II gives y = ${Y[0]}, ${Y[1]}. Comparing every pair (x, y): ${opts[ans]}.`,
    };
  };

  G.missingSeries = () => {
    const kind = pick(['diff', 'mult', 'sq']);
    let seq, rule;
    if (kind === 'diff') {
      const a = ri(5, 50), d = ri(2, 9), dd = ri(1, 4);
      seq = [a]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] + d + dd * (i - 1));
      rule = `differences increase by ${dd}: ${seq.slice(1).map((v, i) => v - seq[i]).join(', ')}`;
    } else if (kind === 'mult') {
      const a = ri(2, 12), m = ri(2, 3), add = ri(1, 5);
      seq = [a]; for (let i = 1; i < 6; i++) seq.push(seq[i - 1] * m + add);
      rule = `each term = previous × ${m} + ${add}`;
    } else {
      const s = ri(2, 8), add = pick([1, -1, 2]);
      seq = []; for (let i = 0; i < 6; i++) seq.push((s + i) ** 2 + add);
      rule = `n² ${add > 0 ? '+' : '−'} ${Math.abs(add)} for n = ${s}…${s + 5}`;
    }
    const miss = ri(1, 5);
    const ans = seq[miss];
    const shown = seq.map((v, i) => (i === miss ? '?' : v)).join(', ');
    return Q('Number Series', {
      q: `Find the missing number: ${shown}`,
      correct: ans, distractors: near(ans, { step: Math.max(1, Math.round(ans / 20)) }),
      explanation: `Pattern: ${rule}. Missing term = ${ans}.`,
    });
  };

  G.dataInterpretation = () => {
    const years = ['2019', '2020', '2021', '2022', '2023'];
    const prod = years.map(() => ri(20, 90) * 10);
    const sale = prod.map((p) => p - ri(1, 15) * 10);
    const table = `Year  | Production | Sales\n` + years.map((y, i) => `${y}  | ${String(prod[i]).padStart(10)} | ${String(sale[i]).padStart(5)}`).join('\n');
    const kind = pick(['avg', 'pct', 'ratio']);
    if (kind === 'avg') {
      const avg = prod.reduce((a, b) => a + b, 0) / prod.length;
      return Q('Data Interpretation', {
        q: `Production and sales (in thousand units) of a company:\n\n${table}\n\nWhat is the average production over the five years?`,
        correct: avg, render: fmt,
        distractors: [sale.reduce((a, b) => a + b, 0) / 5, avg + 10, avg - 10, avg + 4],
        explanation: `Sum = ${prod.join(' + ')} = ${prod.reduce((a, b) => a + b, 0)}. Average = sum/5 = ${fmt(avg)}.`,
      });
    }
    const i = ri(1, 4);
    if (kind === 'pct') {
      const pct = ((prod[i] - prod[i - 1]) / prod[i - 1]) * 100;
      const show = (x) => `${fmt(Math.abs(x))}% ${x >= 0 ? 'increase' : 'decrease'}`;
      return Q('Data Interpretation', {
        q: `Production and sales (in thousand units) of a company:\n\n${table}\n\nWhat is the percentage change in production from ${years[i - 1]} to ${years[i]}?`,
        correct: pct, render: show,
        distractors: [-pct, ((prod[i] - prod[i - 1]) / prod[i]) * 100, pct + 5, pct - 5],
        explanation: `% change = (${prod[i]} − ${prod[i - 1]})/${prod[i - 1]} × 100 = ${show(pct)}.`,
      });
    }
    const g = gcd(sale[i], prod[i]);
    return Q('Data Interpretation', {
      q: `Production and sales (in thousand units) of a company:\n\n${table}\n\nWhat is the ratio of sales to production in ${years[i]}?`,
      correct: `${sale[i] / g} : ${prod[i] / g}`,
      distractors: [`${prod[i] / g} : ${sale[i] / g}`, `${sale[i] / g + 1} : ${prod[i] / g}`, `${sale[i - 1] / gcd(sale[i - 1], prod[i - 1])} : ${prod[i - 1] / gcd(sale[i - 1], prod[i - 1])}`, `${sale[i] / g} : ${prod[i] / g + 1}`],
      fallback: () => `${sale[i] / g + ri(2, 5)} : ${prod[i] / g + ri(2, 5)}`,
      explanation: `Sales : Production = ${sale[i]} : ${prod[i]} = ${sale[i] / g} : ${prod[i] / g}.`,
    });
  };

  const TOPICS = {
    'Percentage': [G.percentage, G.successivePct],
    'Profit & Loss': [G.profitLoss],
    'Discount': [G.discount],
    'Simple Interest': [G.simpleInterest],
    'Compound Interest': [G.compoundInterest],
    'Ratio & Proportion': [G.ratio],
    'Average': [G.average],
    'Time & Work': [G.timeWork],
    'Pipes & Cisterns': [G.pipes],
    'Speed, Time & Distance': [G.train],
    'Boats & Streams': [G.boats],
    'Mixture & Alligation': [G.alligation],
    'Number System': [G.hcfLcm, G.unitDigit, G.remainder],
    'Simplification': [G.simplify],
    'Algebra': [G.algebraReciprocal, G.algebraIdentity],
    'Geometry & Mensuration': [G.triangle, G.circle],
    'Trigonometry': [G.trig],
    'Ages': [G.ages],
    'Partnership': [G.partnership],
    'Quadratic Equations': [G.quadratic],
    'Number Series': [G.missingSeries],
    'Data Interpretation': [G.dataInterpretation],
  };

  EP.quantTopics = TOPICS;
  if (typeof module !== 'undefined' && module.exports) module.exports = TOPICS;
})(typeof window !== 'undefined' ? window : globalThis);
