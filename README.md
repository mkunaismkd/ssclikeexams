# ExamPrep — SSC CGL & RBI Grade B

A learn → practise → mock → revise platform for **SSC CGL** (Tier 1 & 2) and **RBI Grade B** (Phase 1 & 2), with a free AI tutor powered by **Groq**.

## Features

| | |
|---|---|
| **Learn** | Concise notes, formulas and shortcuts for every major Quant, Reasoning, English, GA, ESI and F&M topic. Topics without notes open in the AI tutor. |
| **Practice** | Topic-wise or mixed sets with instant feedback and worked solutions. Quant and Reasoning questions are **generated fresh every time** (22 quant and 13 reasoning topic generators), so you never run out. Plus hand-written banks for English, GA, banking, ESI, F&M, syllogisms, seating and blood relations. |
| **Mock tests** | Exam-pattern mocks with negative marking, a question palette, mark-for-review, and **sectional timing** for RBI Phase 1. Includes SSC CGL Tier 1, Tier 2 (both sections), RBI Phase 1, RBI Phase 2 ESI/F&M objective, and a 15-minute daily "Quick 20". |
| **Revision** | Every wrong answer goes into a spaced-repetition mistake book (today → 1 → 3 → 7 → 16 → 35 days). Bookmark any question. |
| **AI (Groq)** | ✨ *Explain with AI* on any question · AI tutor chat for doubts · AI question generator for any topic (great for current affairs and banking awareness) · AI performance coach that reads your stats and builds a 7-day plan. |
| **Plan & progress** | Exam countdown, phase-wise plan, daily time split weighted towards weak subjects, syllabus checklist, streaks, activity heatmap, topic accuracy, mock score trend. Export/import your progress. |

Works on phones, supports dark mode, and installs as an app (PWA) with offline practice.

## Run it

Requires **Node.js 18+**. No `npm install` needed — there are no dependencies.

```bash
cp .env.example .env        # then paste your Groq key into .env
node server.js              # → http://localhost:3000
```

### Get a free Groq API key

1. Sign up at <https://console.groq.com> (free tier, no card required).
2. Go to **API Keys → Create API Key** and copy it.
3. Put it in `.env` as `GROQ_API_KEY=gsk_...` and restart the server.

The key stays on the server — the browser only talks to `/api/ai`, which builds the prompts itself (so it can't be used as a general-purpose LLM proxy) and rate-limits each IP (`AI_RATE_LIMIT`, default 30/min) to protect your free quota.

The default model is `llama-3.3-70b-versatile`. Set `GROQ_MODEL` to any model from <https://console.groq.com/docs/models>; if the configured model is retired, the server automatically retries on `llama-3.1-8b-instant`.

Without a key everything except the ✨ AI features still works. You can even open `index.html` directly (no server) for offline practice.

## Deploy free on Vercel

1. Import this repo in Vercel (framework preset: **Other**, no build command).
2. In **Settings → Environment Variables** add `GROQ_API_KEY` (and optionally `GROQ_MODEL`).
3. Deploy. `api/ai.js` and `api/health.js` run as serverless functions; everything else is static.

## Project layout

```
index.html, css/, icon.svg, manifest.webmanifest, sw.js   – the app (plain JS, no build step)
js/gen-quant.js, js/gen-reasoning.js   – procedural question generators with worked solutions
js/bank/*.js                           – hand-written question banks
js/exams.js                            – exam patterns (sections, timing, marking)
js/notes.js                            – study notes
js/engine.js                           – question drawing and mock assembly
js/store.js                            – progress, streaks, spaced repetition (localStorage)
js/ai-client.js, js/app.js             – AI client and the UI
lib/ai.js                              – Groq integration (prompts, validation, fallback, rate limit)
server.js                              – local server (static files + /api)
api/                                   – Vercel serverless functions
tests/                                 – node:test suites
```

## Tests

```bash
npm test
```

Samples every generator hundreds of times (valid options, no duplicates, no `NaN`), cross-checks the quadratic comparison answers by brute force, verifies every mock can be assembled at full length, and tests the Groq integration against a mocked API.

## Adding questions

Bank questions are plain arrays: `[topic, question, [options], answerIndex, explanation]`. Add them to the relevant file in `js/bank/` and run `npm test`.

> Exam patterns follow the latest notified schemes; always confirm with the official SSC / RBI notification. AI answers can be wrong — verify important facts.
