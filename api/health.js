/* Vercel serverless function: GET /api/health — lets the app know whether AI is configured. */
module.exports = (req, res) => res.status(200).json({ ok: true, ai: Boolean(process.env.GROQ_API_KEY) });
