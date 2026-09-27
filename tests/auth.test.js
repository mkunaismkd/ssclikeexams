const test = require('node:test');
const assert = require('node:assert');
const { checkAccess, _clearCache } = require('../lib/auth');

const env = {};
const supa = (status, user) => { const calls = []; const f = async (url, opts) => { calls.push({ url, opts }); return { ok: status < 400, status, json: async () => user }; }; f.calls = calls; return f; };

test('no token → 401', async () => {
  const r = await checkAccess(undefined, env, supa(200, {}));
  assert.deepStrictEqual([r.ok, r.status], [false, 401]);
});

test('owner token → allowed (case-insensitive), verified against Supabase Auth', async () => {
  _clearCache();
  const f = supa(200, { email: 'MkUnaisMkd@gmail.com' });
  const r = await checkAccess('Bearer owner-token', env, f);
  assert.strictEqual(r.ok, true);
  assert.match(f.calls[0].url, /xzzuwvlfsanrrwgywlrt\.supabase\.co\/auth\/v1\/user$/);
  assert.strictEqual(f.calls[0].opts.headers.Authorization, 'Bearer owner-token');
  await checkAccess('Bearer owner-token', env, f);
  assert.strictEqual(f.calls.length, 1, 'result is cached');
});

test('another signed-in user (e.g. from the shared app) → 403', async () => {
  _clearCache();
  const r = await checkAccess('Bearer other', env, supa(200, { email: 'someone@else.com' }));
  assert.deepStrictEqual([r.ok, r.status], [false, 403]);
});

test('invalid or expired token → 401', async () => {
  _clearCache();
  const r = await checkAccess('Bearer forged', env, supa(401, { msg: 'invalid JWT' }));
  assert.deepStrictEqual([r.ok, r.status], [false, 401]);
});

test('ALLOWED_EMAILS env overrides the default list', async () => {
  _clearCache();
  const r = await checkAccess('Bearer t', { ALLOWED_EMAILS: 'a@x.com, b@y.com' }, supa(200, { email: 'b@y.com' }));
  assert.strictEqual(r.ok, true);
});
