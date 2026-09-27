/*
 * Server-side access check for /api/ai. ExamPrep is a personal app, so AI calls (which spend the Groq quota)
 * are only served to a signed-in Supabase user whose email is in ALLOWED_EMAILS.
 *
 * The browser sends its Supabase access token; we ask Supabase Auth who it belongs to (this validates the
 * token server-side), then check the email. Results are cached briefly to avoid a lookup per request.
 */
const DEFAULTS = {
  // Public values (same as js/config.js); override with env vars if the project changes.
  SUPABASE_URL: 'https://xzzuwvlfsanrrwgywlrt.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_izEEKl6jWb178pOCw3DsFA_ul1fzq5N',
  ALLOWED_EMAILS: 'mkunaismkd@gmail.com',
};
const cache = new Map(); // token → { email, until }

const allowedEmails = (env) => String(env.ALLOWED_EMAILS || DEFAULTS.ALLOWED_EMAILS).split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

function deny(status, error) { return { ok: false, status, error }; }

/** Returns { ok: true, email } or { ok: false, status, error }. */
async function checkAccess(authHeader, env = process.env, fetchImpl = fetch) {
  if (String(env.AI_REQUIRE_AUTH).toLowerCase() === 'false') return { ok: true, email: null };
  const m = /^Bearer\s+(.+)$/i.exec(authHeader || '');
  if (!m) return deny(401, 'This is a private app — sign in (☁ at the top) to use the AI features.');
  const token = m[1].trim();

  const hit = cache.get(token);
  let email = hit && hit.until > Date.now() ? hit.email : null;
  if (!email) {
    const url = (env.SUPABASE_URL || DEFAULTS.SUPABASE_URL).replace(/\/$/, '') + '/auth/v1/user';
    let res;
    try {
      res = await fetchImpl(url, { headers: { apikey: env.SUPABASE_PUBLISHABLE_KEY || DEFAULTS.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` } });
    } catch (e) { return deny(503, 'Could not verify your sign-in right now. Please try again.'); }
    if (!res.ok) return deny(401, 'Your sign-in has expired — please sign in again.');
    const user = await res.json().catch(() => ({}));
    email = String(user.email || '').toLowerCase();
    cache.set(token, { email, until: Date.now() + 5 * 60_000 });
    if (cache.size > 500) for (const [k, v] of cache) if (v.until < Date.now()) cache.delete(k);
  }
  if (!allowedEmails(env).includes(email)) return deny(403, 'This is a private app. Your account does not have access.');
  return { ok: true, email };
}

module.exports = { checkAccess, allowedEmails, _clearCache: () => cache.clear() };
