/* Procedural generators for the AI / ML & GenAI career track. Numbers change every time; each has a worked solution. */
(function (root) {
  const EP = root.EP || require('./core.js');
  const { ri, pick, fmt, mcq, shuffle, round } = EP;
  const Q = (subject, topic, o) => mcq({ subject, topic, ...o });
  const f2 = (x) => Number(x).toFixed(2);
  const clamp01 = (x) => Math.min(0.99, Math.max(0.01, x));
  const nearProb = (c) => () => clamp01(round(c + pick([-0.18, -0.12, -0.07, -0.04, 0.04, 0.07, 0.12, 0.18]), 2));

  // ---------------- ML fundamentals ----------------
  const ML = {};

  ML.metrics = () => {
    const TP = ri(20, 90), FP = ri(5, 40), FN = ri(5, 40), TN = ri(20, 120);
    const P = TP / (TP + FP), R = TP / (TP + FN), F1 = (2 * P * R) / (P + R), A = (TP + TN) / (TP + FP + FN + TN), Sp = TN / (TN + FP);
    const table = `              Predicted +   Predicted −\nActual +      TP = ${TP}       FN = ${FN}\nActual −      FP = ${FP}       TN = ${TN}`;
    const kind = pick(['precision', 'recall', 'f1', 'accuracy', 'specificity']);
    const val = { precision: P, recall: R, f1: F1, accuracy: A, specificity: Sp }[kind];
    const formula = {
      precision: `Precision = TP / (TP + FP) = ${TP} / ${TP + FP}`,
      recall: `Recall = TP / (TP + FN) = ${TP} / ${TP + FN}`,
      f1: `Precision = ${TP}/${TP + FP} = ${f2(P)}, Recall = ${TP}/${TP + FN} = ${f2(R)}. F1 = 2PR / (P + R)`,
      accuracy: `Accuracy = (TP + TN) / total = ${TP + TN} / ${TP + FP + FN + TN}`,
      specificity: `Specificity = TN / (TN + FP) = ${TN} / ${TN + FP}`,
    }[kind];
    return Q('mlfund', 'Evaluation Metrics', {
      q: `A binary classifier gives this confusion matrix:\n\n${table}\n\nWhat is the ${kind === 'f1' ? 'F1 score' : kind}? (2 decimals)`,
      correct: round(val, 2), render: f2,
      distractors: [P, R, F1, A, Sp, TP / (TP + FN + FP)].map((x) => round(x, 2)),
      fallback: nearProb(val),
      explanation: `${formula} = ${f2(val)}.`,
    });
  };

  ML.linreg = () => {
    if (Math.random() < 0.5) {
      const w = pick([-4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9]), b = ri(-20, 30), x = ri(1, 15);
      const y = w * x + b;
      return Q('mlfund', 'Linear Regression', {
        q: `A trained linear regression model is ŷ = ${w}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)}. What does it predict for x = ${x}?`,
        correct: y, distractors: [w * x, y + w, y - w, w + b + x, -y],
        explanation: `ŷ = ${w} × ${x} ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${y}.`,
        difficulty: 1,
      });
    }
    const errs = [ri(-4, 4), ri(-4, 4), ri(-4, 4), ri(-4, 4)];
    const mse = errs.reduce((a, e) => a + e * e, 0) / errs.length;
    const mae = errs.reduce((a, e) => a + Math.abs(e), 0) / errs.length;
    const ys = errs.map(() => ri(10, 50));
    return Q('mlfund', 'Linear Regression', {
      q: `Actual values: ${ys.join(', ')}\nPredictions:   ${ys.map((y, i) => y - errs[i]).join(', ')}\nWhat is the Mean Squared Error (MSE)?`,
      correct: mse, render: fmt,
      distractors: [mae, Math.sqrt(mse), mse * errs.length, errs.reduce((a, e) => a + e, 0) / 4, mse + 1],
      explanation: `Errors = ${errs.join(', ')}. Squares = ${errs.map((e) => e * e).join(', ')}. MSE = ${errs.reduce((a, e) => a + e * e, 0)} / 4 = ${fmt(mse)}. (MAE would be ${fmt(mae)}; RMSE = √MSE = ${fmt(Math.sqrt(mse))}.)`,
    });
  };

  ML.gini = () => {
    const a = ri(1, 30), b = ri(1, 30), n = a + b;
    const g = 1 - (a / n) ** 2 - (b / n) ** 2;
    return Q('mlfund', 'Decision Trees', {
      q: `A decision-tree node contains ${a} samples of class A and ${b} samples of class B. What is its Gini impurity? (2 decimals)`,
      correct: round(g, 2), render: f2,
      distractors: [round(1 - g, 2), round(a / n, 2), round(b / n, 2), round(2 * g, 2) > 0.99 ? 0.25 : round(2 * g, 2), 0.5],
      fallback: nearProb(g),
      explanation: `Gini = 1 − p_A² − p_B² = 1 − (${a}/${n})² − (${b}/${n})² = ${f2(g)}. (0 = pure node; 0.5 is the maximum for two classes.)`,
    });
  };

  ML.distance = () => {
    const [dx, dy, d] = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15]]);
    const x1 = ri(-5, 5), y1 = ri(-5, 5);
    const p2 = [x1 + dx * pick([1, -1]), y1 + dy * pick([1, -1])];
    if (Math.random() < 0.6) {
      return Q('mlfund', 'Distance & Similarity', {
        q: `In k-NN, what is the Euclidean distance between points (${x1}, ${y1}) and (${p2[0]}, ${p2[1]})?`,
        correct: d, distractors: [dx + dy, d * d, Math.abs(dx - dy), d + 1],
        explanation: `√((Δx)² + (Δy)²) = √(${dx}² + ${dy}²) = √${d * d} = ${d}. (Manhattan distance would be ${dx + dy}.)`,
        difficulty: 1,
      });
    }
    const a = [ri(-3, 5), ri(-3, 5), ri(1, 5)], b = [ri(-3, 5), ri(-3, 5), ri(1, 5)];
    const dot = a.reduce((s, v, i) => s + v * b[i], 0);
    const na = Math.hypot(...a), nb = Math.hypot(...b);
    const cos = dot / (na * nb);
    return Q('mlfund', 'Distance & Similarity', {
      q: `Cosine similarity between embedding vectors a = [${a.join(', ')}] and b = [${b.join(', ')}]? (2 decimals)`,
      correct: round(cos, 2), render: f2,
      distractors: [round(dot / (na * na), 2), round(-cos, 2), round(dot / 10, 2), round(cos / 2, 2)],
      fallback: () => round(Math.max(-0.99, Math.min(0.99, cos + pick([-0.2, -0.1, 0.1, 0.2]))), 2),
      explanation: `a·b = ${dot}; ‖a‖ = √${a.reduce((s, v) => s + v * v, 0)} = ${f2(na)}; ‖b‖ = √${b.reduce((s, v) => s + v * v, 0)} = ${f2(nb)}. cos θ = ${dot} / (${f2(na)} × ${f2(nb)}) = ${f2(cos)}.`,
    });
  };

  ML.steps = () => {
    const N = ri(10, 200) * 500, B = pick([16, 32, 64, 128, 256]), E = ri(2, 20);
    const per = Math.ceil(N / B);
    if (Math.random() < 0.5) {
      return Q('mlfund', 'Training Loops', {
        q: `A dataset has ${N.toLocaleString('en-IN')} training examples and the batch size is ${B}. How many optimizer steps are there per epoch (the last partial batch is kept)?`,
        correct: per, distractors: [Math.floor(N / B), per * 2, Math.round(N / (B * 2)), per + B],
        explanation: `Steps per epoch = ⌈N / B⌉ = ⌈${N} / ${B}⌉ = ${per}.`,
        difficulty: 1,
      });
    }
    return Q('mlfund', 'Training Loops', {
      q: `${N.toLocaleString('en-IN')} examples, batch size ${B}, trained for ${E} epochs (last partial batch kept). Total optimizer steps?`,
      correct: per * E, distractors: [Math.floor(N / B) * E, per + E, per * (E - 1), N * E],
      explanation: `Per epoch ⌈${N}/${B}⌉ = ${per}; total = ${per} × ${E} = ${per * E}.`,
    });
  };

  // ---------------- Deep learning ----------------
  const DL = {};

  DL.dense = () => {
    const sizes = [pick([4, 8, 10, 16, 32, 64, 128, 784]), pick([8, 16, 32, 64, 128, 256]), pick([2, 3, 5, 10])];
    if (Math.random() < 0.5) {
      const [i, o] = [sizes[0], sizes[1]];
      return Q('dl', 'Neural Network Parameters', {
        q: `How many trainable parameters does a fully connected (Dense) layer with ${i} inputs and ${o} outputs have (with bias)?`,
        correct: i * o + o, distractors: [i * o, i * o + i, (i + 1) * (o + 1), i + o],
        explanation: `Weights = ${i} × ${o} = ${i * o}; biases = ${o}. Total = ${i * o + o}.`,
        difficulty: 1,
      });
    }
    const total = sizes[0] * sizes[1] + sizes[1] + sizes[1] * sizes[2] + sizes[2];
    return Q('dl', 'Neural Network Parameters', {
      q: `An MLP has layer sizes ${sizes.join(' → ')} (input → hidden → output), all Dense with biases. Total trainable parameters?`,
      correct: total, distractors: [sizes[0] * sizes[1] + sizes[1] * sizes[2], total + sizes[0], total - sizes[2], sizes.reduce((a, b) => a * b, 1)],
      explanation: `Layer 1: ${sizes[0]}×${sizes[1]} + ${sizes[1]} = ${sizes[0] * sizes[1] + sizes[1]}. Layer 2: ${sizes[1]}×${sizes[2]} + ${sizes[2]} = ${sizes[1] * sizes[2] + sizes[2]}. Total = ${total}.`,
    });
  };

  DL.conv = () => {
    for (let t = 0; t < 50; t++) {
      const W = pick([28, 32, 64, 128, 224]), K = pick([1, 3, 5, 7]), S = pick([1, 1, 2]), P = pick([0, 1, 2, 3]);
      if ((W - K + 2 * P) % S !== 0 || W - K + 2 * P < 0) continue;
      const out = (W - K + 2 * P) / S + 1;
      if (Math.random() < 0.6) {
        return Q('dl', 'CNN Arithmetic', {
          q: `A ${W}×${W} input goes through a conv layer with kernel ${K}×${K}, stride ${S} and padding ${P}. What is the output width/height?`,
          correct: out, distractors: [W - K + 1, (W - K) / S + 1, out + 2, W / S, out - 1].filter((x) => Number.isInteger(x) && x > 0),
          explanation: `Output = (W − K + 2P) / S + 1 = (${W} − ${K} + ${2 * P}) / ${S} + 1 = ${out}.`,
        });
      }
      const cin = pick([1, 3, 16, 32, 64]), cout = pick([8, 16, 32, 64, 128]);
      const params = (K * K * cin + 1) * cout;
      return Q('dl', 'CNN Arithmetic', {
        q: `How many trainable parameters does a Conv2D layer have with ${cin} input channels, ${cout} filters of size ${K}×${K}, and bias?`,
        correct: params, distractors: [K * K * cin * cout, K * K * cout + cout, (K * K + 1) * cin * cout, params + cin],
        explanation: `Each filter has ${K}×${K}×${cin} = ${K * K * cin} weights + 1 bias. × ${cout} filters = ${params}. (Parameters don't depend on the image size.)`,
      });
    }
    return DL.dense();
  };

  DL.attention = () => {
    const n1 = pick([512, 1024, 2048, 4096]), k = pick([2, 3, 4, 8]);
    return Q('dl', 'Transformers & Attention', {
      q: `In standard (full) self-attention, the attention score matrix is n × n. If the sequence length grows from ${n1.toLocaleString()} to ${(n1 * k).toLocaleString()} tokens, by what factor does the score-matrix memory grow?`,
      correct: `${k * k}×`, distractors: [`${k}×`, `${2 * k}×`, `${k ** 3}×`, `${k + 1}×`],
      explanation: `Memory ∝ n². Scaling n by ${k} scales n² by ${k}² = ${k * k}. This quadratic cost is why long-context models use tricks like FlashAttention, sliding windows or sparse attention.`,
    });
  };

  DL.relu = () => {
    const v = [ri(-9, 9), ri(-9, 9), ri(-9, 9), ri(-9, 9)];
    const out = v.map((x) => Math.max(0, x));
    return Q('dl', 'Activation Functions', {
      q: `Apply ReLU to the vector [${v.join(', ')}]. What is the sum of the outputs?`,
      correct: out.reduce((a, b) => a + b, 0),
      distractors: [v.reduce((a, b) => a + b, 0), v.reduce((a, b) => a + Math.abs(b), 0), out.reduce((a, b) => a + b, 0) + 1],
      explanation: `ReLU(x) = max(0, x) → [${out.join(', ')}]. Sum = ${out.reduce((a, b) => a + b, 0)}.`,
      difficulty: 1,
    });
  };

  // ---------------- GenAI & LLMs ----------------
  const GA = {};

  GA.cost = () => {
    const pin = pick([0.15, 0.5, 1, 2.5, 3]), pout = pin * pick([3, 4, 5]);
    const reqs = pick([1000, 5000, 10000, 50000]), tin = pick([500, 800, 1200, 2000]), tout = pick([200, 300, 500]);
    const cost = (reqs * tin / 1e6) * pin + (reqs * tout / 1e6) * pout;
    const usd = (x) => '$' + (Math.round(x * 100) / 100).toFixed(2);
    return Q('genai', 'Tokens & Cost', {
      q: `Assume an LLM API charges $${pin} per million input tokens and $${pout} per million output tokens (illustrative prices). You make ${reqs.toLocaleString()} requests, each with ${tin} input and ${tout} output tokens. Total cost?`,
      correct: cost, render: usd,
      distractors: [(reqs * (tin + tout) / 1e6) * pin, (reqs * (tin + tout) / 1e6) * pout, cost * 10, cost / 2],
      fallback: () => cost * pick([0.7, 1.3, 1.5, 2]),
      explanation: `Input: ${reqs} × ${tin} = ${(reqs * tin).toLocaleString()} tokens → ${usd((reqs * tin / 1e6) * pin)}. Output: ${reqs} × ${tout} = ${(reqs * tout).toLocaleString()} tokens → ${usd((reqs * tout / 1e6) * pout)}. Total ${usd(cost)}. Output tokens usually cost more, so keep answers concise.`,
    });
  };

  GA.vectors = () => {
    const n = pick([100000, 250000, 1000000, 2000000]), d = pick([384, 768, 1024, 1536, 3072]);
    const bytes = n * d * 4;
    const mb = bytes / 1e6;
    const show = (x) => (x >= 1000 ? fmt(x / 1000) + ' GB' : fmt(x) + ' MB');
    return Q('genai', 'Embeddings & Vector DBs', {
      q: `You store ${n.toLocaleString()} embeddings of dimension ${d} as float32 (4 bytes each), ignoring index overhead. How much memory is needed? (1 MB = 10⁶ bytes)`,
      correct: mb, render: show,
      distractors: [mb / 4, mb * 2, mb * 8, mb / 2],
      explanation: `${n.toLocaleString()} × ${d} × 4 bytes = ${bytes.toLocaleString()} bytes ≈ ${show(mb)}. Using float16 would halve it; int8 quantisation would quarter it.`,
    });
  };

  GA.chunks = () => {
    const C = pick([256, 500, 512, 800, 1000]), O = pick([0, 50, 64, 100, 128].filter((o) => o < C / 2));
    const T = ri(3, 40) * 250 + ri(0, 200);
    const n = T <= C ? 1 : Math.ceil((T - C) / (C - O)) + 1;
    return Q('genai', 'RAG & Chunking', {
      q: `A RAG pipeline splits a ${T.toLocaleString()}-token document into chunks of ${C} tokens with ${O} tokens of overlap (each new chunk starts ${C - O} tokens after the previous one). How many chunks are produced?`,
      correct: n, distractors: [Math.ceil(T / C), Math.floor((T - C) / (C - O)) + 1, n + 1, Math.ceil(T / (C - O))].filter((x) => x > 0),
      explanation: `Stride = C − overlap = ${C - O}. The first chunk covers tokens 0–${C}; we need ⌈(T − C) / stride⌉ more: ⌈(${T} − ${C}) / ${C - O}⌉ = ${n - 1}. Total = ${n}.`,
    });
  };

  GA.context = () => {
    const L = pick([8192, 16384, 32768, 128000]), S = pick([300, 500, 800, 1200]), k = ri(3, 10), c = pick([256, 400, 512]), O = pick([512, 1000, 1024, 2048]);
    const left = L - S - k * c - O;
    return Q('genai', 'Context Windows', {
      q: `A model has a ${L.toLocaleString()}-token context window. Your prompt uses a ${S}-token system prompt and ${k} retrieved chunks of ${c} tokens, and you reserve ${O} tokens for the answer. How many tokens remain for chat history?`,
      correct: left, distractors: [L - S - k * c, L - k * c - O, left - c, L - S - c - O],
      explanation: `${L} − ${S} (system) − ${k}×${c} = ${k * c} (retrieved) − ${O} (output) = ${left}. Input and output share the same context window.`,
    });
  };

  GA.temperature = () => {
    const logits = [ri(1, 4), ri(1, 4), ri(0, 3)];
    const T = pick([0.5, 2]);
    const right = `The ranking of tokens stays the same; the distribution becomes ${T < 1 ? 'sharper (more deterministic)' : 'flatter (more random)'}`;
    const options = shuffle([right, 'The most likely token can change',
      `The distribution becomes ${T < 1 ? 'flatter (more random)' : 'sharper (more deterministic)'}`,
      'Temperature only affects the number of tokens generated']);
    return {
      subject: 'genai', topic: 'Decoding & Sampling', difficulty: 2, options, answer: options.indexOf(right),
      q: `A model's next-token logits are [${logits.join(', ')}]. You change the sampling temperature from 1.0 to ${T}. Which statement is true?`,
      explanation: 'Softmax(logits / T): dividing by T > 0 keeps the order of the logits, so the ranking never changes. T < 1 exaggerates differences (sharper, closer to greedy); T > 1 shrinks them (flatter, more diverse). T → 0 is effectively greedy decoding.',
    };
  };

  EP.aiGen = {
    mlfund: {
      'Evaluation Metrics': [ML.metrics], 'Linear Regression': [ML.linreg], 'Decision Trees': [ML.gini],
      'Distance & Similarity': [ML.distance], 'Training Loops': [ML.steps],
    },
    dl: {
      'Neural Network Parameters': [DL.dense], 'CNN Arithmetic': [DL.conv], 'Transformers & Attention': [DL.attention], 'Activation Functions': [DL.relu],
    },
    genai: {
      'Tokens & Cost': [GA.cost], 'Embeddings & Vector DBs': [GA.vectors], 'RAG & Chunking': [GA.chunks], 'Context Windows': [GA.context],
      'Decoding & Sampling': [GA.temperature],
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = EP.aiGen;
})(typeof window !== 'undefined' ? window : globalThis);
