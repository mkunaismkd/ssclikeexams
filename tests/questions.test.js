const test = require('node:test');
const assert = require('node:assert');
const EP = require('./load.js');

function check(q, where) {
  assert.ok(q.q && typeof q.q === 'string', `${where}: missing text`);
  assert.ok(Array.isArray(q.options) && q.options.length >= 4, `${where}: needs ≥4 options, got ${q.options && q.options.length}: ${q.q}`);
  assert.strictEqual(new Set(q.options).size, q.options.length, `${where}: duplicate options ${JSON.stringify(q.options)} for ${q.q}`);
  assert.ok(q.answer >= 0 && q.answer < q.options.length, `${where}: answer out of range`);
  for (const o of q.options) assert.ok(!/NaN|undefined|Infinity/.test(o), `${where}: bad option ${o} in ${q.q}`);
  assert.ok(!/NaN|undefined|Infinity/.test(q.q + q.explanation), `${where}: bad text ${q.q} / ${q.explanation}`);
}

for (const subject of ['quant', 'reasoning']) {
  const topics = subject === 'quant' ? EP.quantTopics : EP.reasoningTopics;
  for (const [topic, fns] of Object.entries(topics)) {
    test(`${subject} / ${topic} generators produce valid MCQs`, () => {
      for (const fn of fns) for (let i = 0; i < 400; i++) check(fn(), `${subject}/${topic}`);
    });
  }
}

test('every bank question is well formed', () => {
  for (const subject of Object.keys(EP.SUBJECTS)) {
    for (const row of EP.bankRows(subject)) {
      const [topic, q, options, answer] = row;
      check({ q, options, answer, explanation: row[4] }, `${subject}/${topic}`);
    }
  }
});

test('every mock can be built at full length with unique questions', () => {
  for (const key of Object.keys(EP.EXAMS)) {
    const mock = EP.buildMock(key);
    for (const s of mock.sections) {
      assert.strictEqual(s.questions.length, s.count, `${key}/${s.subject}: ${s.questions.length}/${s.count}`);
      assert.strictEqual(new Set(s.questions.map((q) => q.id)).size, s.count, `${key}/${s.subject}: duplicate ids`);
    }
  }
});

test('quadratic comparison answer matches brute force', () => {
  for (let i = 0; i < 500; i++) {
    const q = EP.quantTopics['Quadratic Equations'][0]();
    const nums = q.explanation.match(/x = (-?\d+), (-?\d+)\. II gives y = (-?\d+), (-?\d+)/).slice(1).map(Number);
    const [x1, x2, y1, y2] = nums;
    const d = [x1 - y1, x1 - y2, x2 - y1, x2 - y2];
    let exp = 4;
    if (d.every((v) => v > 0)) exp = 0; else if (d.every((v) => v >= 0) && !d.every((v) => v === 0)) exp = 1;
    else if (d.every((v) => v < 0)) exp = 2; else if (d.every((v) => v <= 0) && !d.every((v) => v === 0)) exp = 3;
    assert.strictEqual(q.answer, exp, q.q);
  }
});

test('clock angles are within 0–180', () => {
  for (let i = 0; i < 300; i++) {
    const q = EP.reasoningTopics.Clock[0]();
    const v = parseFloat(q.options[q.answer]);
    assert.ok(v >= 0 && v <= 180, q.q + ' → ' + v);
  }
});
