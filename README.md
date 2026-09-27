# ExamPrep — SSC CGL, RBI Grade B & AI/ML careers

A learn → practise → mock → revise platform for **SSC CGL** (Tier 1 & 2) and **RBI Grade B** (Phase 1 & 2), with a free AI tutor powered by **Groq**.

## Features

| | |
|---|---|
| **Learn** | Concise notes, formulas and shortcuts for every major Quant, Reasoning, English, GA, ESI and F&M topic. Topics without notes open in the AI tutor. |
| **Practice** | Topic-wise or mixed sets with instant feedback and worked solutions. Quant and Reasoning questions are **generated fresh every time** (22 quant and 13 reasoning topic generators), so you never run out. Plus hand-written banks for English, GA, banking, ESI, F&M, syllogisms, seating and blood relations. |
| **Mock tests** | Exam-pattern mocks with negative marking, a question palette, mark-for-review, and **sectional timing** for RBI Phase 1. Includes SSC CGL Tier 1, Tier 2 (both sections), RBI Phase 1, RBI Phase 2 ESI/F&M objective, and a 15-minute daily "Quick 20". |
| **PYQs** | Previous-year papers tagged with exam, date/shift and source. Practise with instant answers, attempt as a timed paper, or hit **✨ Similar questions** on any PYQ (or a whole paper) to get new AI questions on the same pattern. Add real papers with the **AI importer**: paste text from an official SSC answer key or a solved paper and it becomes structured questions; answers taken from the key vs. solved by AI are labelled. (The RBI does not publish papers, so RBI PYQs are memory-based.) |
| **Revision** | Every wrong answer goes into a spaced-repetition mistake book (today → 1 → 3 → 7 → 16 → 35 days). Bookmark any question. |
| **AI (Groq)** | ✨ *Explain with AI* on any question · AI tutor chat for doubts · AI question generator for any topic (great for current affairs and banking awareness) · AI performance coach that reads your stats and builds a 7-day plan. |
| **Plan & progress** | Exam countdown, phase-wise plan, daily time split weighted towards weak subjects, syllabus checklist, streaks, activity heatmap, topic accuracy, mock score trend. Export/import your progress. |

| **AI / ML & GenAI career track** | A third track for upskilling: ML fundamentals, deep learning, GenAI & LLMs, and MLOps. Notes and roadmaps, interview-style concept questions, fresh calculation questions (confusion-matrix metrics, parameter counts, CNN output sizes, attention cost, RAG chunking, token cost, embedding memory), interview mocks without negative marking, a learning roadmap with 8 portfolio projects, and an AI tutor that acts as a senior AI/ML mentor. |
| **Cloud sync** | Sign in with just your email (no password) and progress syncs automatically between phone, laptop and any other device. Works offline too — changes upload when you're back online. |

Works on phones, supports dark mode, and installs as an app (PWA) with offline practice.

## Private app (owner only)

ExamPrep is locked to one account, `mkunaismkd@gmail.com`, at three levels:

1. **Database:** row-level-security policies on `public.examprep_progress` only allow that email (checked from the signed-in user's token), so other users of the shared Supabase project can't read or write anything.
2. **AI:** `/api/ai` verifies the caller's Supabase sign-in with Supabase Auth and only serves the allowed email, so nobody else can use the Groq quota. Change the list with the `ALLOWED_EMAILS` env var (comma-separated). `AI_REQUIRE_AUTH=false` turns the check off for local development only.
3. **App:** anyone who isn't signed in as the owner sees a lock screen; sign-in links are only sent to the allowed email, and other accounts are signed straight out. (The page's code and built-in questions are public files, like any website; your data and the AI are what's protected.)

To allow another email later, add it in `js/config.js` (`allowedEmails`), in `ALLOWED_EMAILS` on Vercel, and in the four policies on `public.examprep_progress`.

## Cloud sync (Supabase)

Progress is stored in the `public.examprep_progress` table (one JSON document per user, protected by row-level security so each user can only read and write their own row). The browser uses the Supabase **publishable** key in `js/config.js`, which is designed to be public.

One-time setup in the Supabase dashboard (project `upsccurrent`):

1. **Authentication → URL Configuration → Redirect URLs**: add `https://ssclikeexams.vercel.app/**` (and `http://localhost:3000/**` for local use). Without this, sign-in links send people to the other app's Site URL.
2. Supabase's built-in mailer is rate-limited (a few emails per hour), which is fine for one person.

How sync behaves: every change is pushed ~1.5 s later; the app pulls when it opens, when you return to it, when the network comes back, and every minute. Writes are conditional on the version last seen, so two devices can't overwrite each other — on a conflict the app merges both and retries. Progress made on a device before signing in is added to the account on first sign-in. Signing out removes the progress from that device (it stays in the cloud).

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

You don't need to pick a model. The server tries `GROQ_MODEL` (default `llama-3.3-70b-versatile`), and if Groq has retired it, it asks Groq which models your key can use and switches to the best available one automatically. Set `GROQ_MODEL` only if you want a specific model from <https://console.groq.com/docs/models>.

Without a key everything except the ✨ AI features still works. You can even open `index.html` directly (no server) for offline practice.

## Deploy free on Vercel

1. Import this repo in Vercel. `vercel.json` already sets the preset to **Other** with no build step, and `.vercelignore` keeps the local-only `server.js` out of the deployment.
2. In **Settings → Environment Variables** add `GROQ_API_KEY` (and optionally `GROQ_MODEL`).
3. Deploy. `api/ai.js` and `api/health.js` run as serverless functions; everything else is static.

## Project layout

```
index.html, css/, icon.svg, manifest.webmanifest, sw.js   – the app (plain JS, no build step)
js/gen-quant.js, js/gen-reasoning.js, js/gen-ai.js – procedural question generators with worked solutions
js/notes-ai.js, js/bank/ai.js         – AI/ML career track notes, roadmap projects and questions
js/bank/*.js                           – hand-written question banks; bank/pyq.js holds built-in previous-year papers
js/exams.js                            – exam patterns (sections, timing, marking)
js/notes.js                            – study notes
js/engine.js                           – question drawing and mock assembly
js/store.js                            – progress, streaks, spaced repetition (localStorage) and merge logic
js/sync.js, js/config.js               – Supabase sign-in and cloud sync
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
