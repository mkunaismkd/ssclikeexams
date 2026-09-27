const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
delete process.env.GROQ_API_KEY;
const server = require('../server.js');

function get(port, path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, path, method }, (res) => { let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => resolve({ status: res.statusCode, body: b, type: res.headers['content-type'] })); });
    req.on('error', reject); req.end();
  });
}

test('server serves the app and guards private files', async (t) => {
  await new Promise((r) => server.listen(0, r));
  t.after(() => server.close());
  const port = server.address().port;

  const home = await get(port, '/');
  assert.strictEqual(home.status, 200);
  assert.match(home.body, /ExamPrep/);

  const js = await get(port, '/js/engine.js');
  assert.match(js.type, /javascript/);

  for (const p of ['/server.js', '/lib/ai.js', '/.env', '/package.json', '/js/../server.js', '/js/%2e%2e/lib/ai.js']) {
    const r = await get(port, p);
    assert.ok(!/require\(|GROQ_API_KEY=/.test(r.body), `${p} leaked server code`);
  }

  const health = JSON.parse((await get(port, '/api/health')).body);
  assert.deepStrictEqual(health, { ok: true, ai: false });
  assert.strictEqual((await get(port, '/api/ai')).status, 405);
});
