const test = require('node:test');
const assert = require('node:assert');
require('../js/core.js');
require('../js/store.js');
const S = globalThis.EP.store;

test('merge keeps the larger counters and unions collections', () => {
  const phone = { ...S.blank(),
    profile: { track: 'rbi', examDate: '', dailyGoal: 50, name: 'Asha' },
    topics: { 'quant|Percentage': { c: 8, w: 2, ms: 1 }, 'ga|Polity': { c: 1, w: 0, ms: 1 } },
    days: { '2026-09-01': { n: 10, c: 8 } },
    mocks: [{ date: '2026-09-01', examKey: 'quick', score: 12, secs: 600, sections: [] }],
    mistakes: { a: { box: 1 } }, bookmarks: { b1: {} }, done: { 'quant|Percentage': true },
    pyqPapers: { p1: { id: 'p1', questions: [] } } };
  const laptop = { ...S.blank(),
    profile: { track: 'ssc', examDate: '2027-01-20', dailyGoal: 80, name: '' },
    topics: { 'quant|Percentage': { c: 3, w: 1, ms: 1 }, 'english|Synonyms': { c: 5, w: 5, ms: 1 } },
    days: { '2026-09-01': { n: 4, c: 3 }, '2026-09-02': { n: 7, c: 7 } },
    mocks: [{ date: '2026-09-01', examKey: 'quick', score: 12, secs: 600, sections: [] }, { date: '2026-09-02', examKey: 'ssc-t1', score: 120, secs: 3500, sections: [] }],
    mistakes: { c: { box: 2 } }, bookmarks: { b2: {} }, chat: [{ role: 'user', content: 'hi' }] };
  const m = S.mergeStates(phone, laptop);
  assert.deepStrictEqual(m.topics['quant|Percentage'], { c: 8, w: 2, ms: 1 });
  assert.ok(m.topics['ga|Polity'] && m.topics['english|Synonyms']);
  assert.deepStrictEqual(m.days, { '2026-09-01': { n: 10, c: 8 }, '2026-09-02': { n: 7, c: 7 } });
  assert.strictEqual(m.mocks.length, 2, 'identical mock is not duplicated');
  assert.deepStrictEqual(Object.keys(m.mistakes).sort(), ['a', 'c']);
  assert.deepStrictEqual(Object.keys(m.bookmarks).sort(), ['b1', 'b2']);
  assert.ok(m.pyqPapers.p1);
  assert.strictEqual(m.done['quant|Percentage'], true);
  assert.strictEqual(m.profile.name, 'Asha', 'empty remote field does not erase local one');
  assert.strictEqual(m.profile.examDate, '2027-01-20');
  assert.strictEqual(m.chat.length, 1);
});

test('merge is idempotent', () => {
  const a = { ...S.blank(), topics: { 'x|y': { c: 1, w: 1, ms: 0 } }, mocks: [{ date: 'd', examKey: 'q', score: 1, secs: 1 }] };
  const once = S.mergeStates(a, a);
  assert.deepStrictEqual(S.mergeStates(once, once), once);
});

test('first-time merge of separate histories adds counters', () => {
  const a = { ...S.blank(), topics: { 't|x': { c: 4, w: 0, ms: 10 } }, days: { d: { n: 4, c: 4 } } };
  const b = { ...S.blank(), topics: { 't|x': { c: 2, w: 1, ms: 5 } }, days: { d: { n: 3, c: 2 } } };
  const m = S.mergeStates(a, b, { add: true });
  assert.deepStrictEqual(m.topics['t|x'], { c: 6, w: 1, ms: 15 });
  assert.deepStrictEqual(m.days.d, { n: 7, c: 6 });
});
