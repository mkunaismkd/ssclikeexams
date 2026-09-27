/* Vercel serverless function: POST /api/ai (set GROQ_API_KEY in the Vercel project settings). */
const { handleAI, rateLimiter } = require('../lib/ai');
const { checkAccess } = require('../lib/auth');

const allow = rateLimiter({ limit: Number(process.env.AI_RATE_LIMIT) || 30 });

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (!allow(ip)) return res.status(429).json({ error: 'Too many AI requests — please wait a minute.' });
  const access = await checkAccess(req.headers.authorization);
  if (!access.ok) return res.status(access.status).json({ error: access.error });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'Invalid JSON' }); } }
  const out = await handleAI(body || {});
  res.status(out.status).json(out.body);
};
