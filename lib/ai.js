/*
 * Groq-backed AI features. Shared by the local server (server.js) and the Vercel function (api/ai.js).
 * Groq exposes an OpenAI-compatible Chat Completions API and has a free tier: https://console.groq.com
 *
 * The client never sends raw prompts: it picks a `mode` and sends data; prompts are built here so the
 * endpoint can't be used as a general-purpose free LLM proxy.
 */
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

const SUBJECT_NAMES = {
  quant: 'Quantitative Aptitude', reasoning: 'Reasoning & General Intelligence', english: 'English Language',
  ga: 'General Awareness (static GK, current affairs, banking awareness)', esi: 'Economic & Social Issues', fm: 'Finance & Management',
};

const BASE_SYSTEM = `You are ExamPrep Coach, an expert tutor for Indian government recruitment exams — SSC CGL (Tier 1 & 2) and RBI Grade B (Phase 1 & 2).
Be accurate, concise and exam-oriented. Prefer shortcut methods used by toppers, and show the key steps.
Use simple English (the student may be a Hindi-medium learner; add a Hindi term in brackets only when it truly helps).
For facts that may have changed recently (current affairs, policy rates, office holders), say so and advise checking the official source (RBI, PIB, SSC website).
Format with short paragraphs, bullet points and **bold** for key formulas. Never invent exam dates or cut-offs.`;

const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

function buildRequest(body) {
  const mode = body && body.mode;
  const exam = clip(body.exam || 'SSC CGL and RBI Grade B', 60);

  if (mode === 'tutor') {
    const history = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
    const messages = history
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: clip(m.content, 4000) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') throw badRequest('The last message must be from the user.');
    return {
      messages: [{ role: 'system', content: `${BASE_SYSTEM}\nThe student is preparing for: ${exam}. Stay on exam preparation, study planning and motivation; politely decline unrelated requests.` }, ...messages],
      temperature: 0.4, max_tokens: 1200,
    };
  }

  if (mode === 'explain') {
    const q = body.question || {};
    const opts = (Array.isArray(q.options) ? q.options : []).slice(0, 6).map((o, i) => `${String.fromCharCode(65 + i)}. ${clip(o, 300)}`).join('\n');
    const correct = Number.isInteger(q.answer) ? String.fromCharCode(65 + q.answer) : '?';
    const chosen = Number.isInteger(body.chosen) ? String.fromCharCode(65 + body.chosen) : 'not answered';
    return {
      messages: [
        { role: 'system', content: BASE_SYSTEM },
        {
          role: 'user', content: `Explain this ${clip(q.topic, 80)} question for ${exam}.

Question: ${clip(q.q, 2000)}
${opts}
Correct answer: ${correct}
Student chose: ${chosen}

1. Solve it step by step (fastest exam method first).
2. If the student was wrong, explain the likely mistake in one or two lines.
3. End with one "Remember:" line — a rule or shortcut to reuse.
Keep it under 200 words.` },
      ],
      temperature: 0.2, max_tokens: 700,
    };
  }

  if (mode === 'generate') {
    const subject = SUBJECT_NAMES[body.subject] ? body.subject : 'ga';
    const count = Math.max(1, Math.min(10, parseInt(body.count, 10) || 5));
    const level = ['easy', 'moderate', 'hard'].includes(body.difficulty) ? body.difficulty : 'moderate';
    const topic = clip(body.topic || 'mixed topics', 100);
    return {
      json: true,
      messages: [
        { role: 'system', content: `${BASE_SYSTEM}\nYou write original multiple-choice questions in the style of recent ${exam} papers. Every question must have exactly 4 options and exactly one correct answer. Double-check each answer before writing it. Respond with JSON only.` },
        {
          role: 'user', content: `Write ${count} ${level} MCQs on "${topic}" (${SUBJECT_NAMES[subject]}) for ${exam}.
${subject === 'ga' || subject === 'esi' ? 'Prefer stable, verifiable facts. If you include recent events, only use ones you are confident about and mention the year in the explanation.' : ''}
Return JSON: {"questions":[{"q":"question text","options":["A","B","C","D"],"answer":0,"explanation":"short worked solution"}]}
"answer" is the 0-based index of the correct option.` },
      ],
      temperature: 0.7, max_tokens: 3500,
    };
  }

  if (mode === 'analyze') {
    const stats = clip(JSON.stringify(body.stats || {}), 6000);
    return {
      messages: [
        { role: 'system', content: BASE_SYSTEM },
        {
          role: 'user', content: `Here is my performance data from my practice platform for ${exam} (accuracy by subject/topic, mock scores, time spent, days to exam):
${stats}

Give me:
1. A 3-line diagnosis (strongest area, weakest areas, speed vs accuracy).
2. A concrete 7-day plan (day-wise, 2–4 tasks per day, with topic names and question counts).
3. Three exam-strategy tips specific to my numbers (question selection, negative marking, time per section).
Be specific and brief.` },
      ],
      temperature: 0.4, max_tokens: 1400,
    };
  }

  throw badRequest('Unknown mode. Use one of: tutor, explain, generate, analyze.');
}

function badRequest(message) { const e = new Error(message); e.status = 400; return e; }

function validateQuestions(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    const m = raw.match(/\{[\s\S]*\}/);
    data = JSON.parse(m ? m[0] : raw);
  }
  const list = Array.isArray(data) ? data : data.questions;
  if (!Array.isArray(list)) throw new Error('AI returned no questions.');
  return list
    .filter((x) => x && typeof x.q === 'string' && Array.isArray(x.options) && x.options.length === 4 &&
      Number.isInteger(x.answer) && x.answer >= 0 && x.answer < 4 && new Set(x.options.map(String)).size === 4)
    .map((x) => ({ q: x.q.trim(), options: x.options.map((o) => String(o).trim()), answer: x.answer, explanation: String(x.explanation || '').trim() }));
}

async function callGroq({ messages, temperature, max_tokens, json }, { apiKey, model, fetchImpl = fetch }) {
  const tryModel = async (m) => {
    const res = await fetchImpl(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: m, messages, temperature, max_tokens, ...(json ? { response_format: { type: 'json_object' } } : {}) }),
    });
    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { error: { message: text.slice(0, 300) } }; }
    return { res, data };
  };
  let { res, data } = await tryModel(model);
  // If the configured model was retired or is unavailable, retry once on a smaller always-on model.
  if (!res.ok && (res.status === 404 || (res.status === 400 && /model/i.test(JSON.stringify(data)))) && model !== FALLBACK_MODEL) {
    ({ res, data } = await tryModel(FALLBACK_MODEL));
  }
  if (!res.ok) {
    const e = new Error(res.status === 429
      ? 'The free Groq quota is busy right now — please wait a minute and try again.'
      : `Groq error (${res.status}): ${(data.error && data.error.message) || 'unknown error'}`);
    e.status = res.status === 429 ? 429 : 502;
    throw e;
  }
  return { content: data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '', model: data.model };
}

/** Handle one /api/ai request body. Returns { status, body }. */
async function handleAI(body, env = process.env, fetchImpl = fetch) {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) return { status: 503, body: { error: 'AI is not configured on the server. Set GROQ_API_KEY (free key from https://console.groq.com/keys).' } };
  try {
    const req = buildRequest(body || {});
    const { content, model } = await callGroq(req, { apiKey, model: env.GROQ_MODEL || DEFAULT_MODEL, fetchImpl });
    if (req.json) {
      const questions = validateQuestions(content);
      if (!questions.length) return { status: 502, body: { error: 'The AI response had no valid questions. Please try again.' } };
      return { status: 200, body: { questions, model } };
    }
    return { status: 200, body: { text: content, model } };
  } catch (e) {
    return { status: e.status || 500, body: { error: e.message || 'AI request failed.' } };
  }
}

/** Tiny fixed-window rate limiter (per IP) to protect the free quota. */
function rateLimiter({ limit = 30, windowMs = 60_000 } = {}) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const h = hits.get(key);
    if (!h || now - h.start > windowMs) { hits.set(key, { start: now, n: 1 }); return true; }
    h.n += 1;
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
    return h.n <= limit;
  };
}

module.exports = { handleAI, buildRequest, validateQuestions, rateLimiter, DEFAULT_MODEL };
