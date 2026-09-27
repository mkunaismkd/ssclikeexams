#!/usr/bin/env node
/* Zero-dependency server: serves the app and the Groq-backed /api/ai endpoint. Usage: node server.js */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleAI, rateLimiter } = require('./lib/ai');

// Minimal .env loader (KEY=value lines) so no npm install is needed.
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const PUBLIC = new Set(['index.html', 'manifest.webmanifest', 'sw.js', 'icon.svg']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const allow = rateLimiter({ limit: Number(process.env.AI_RATE_LIMIT) || 30 });

function send(res, status, body, type = 'application/json') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 100_000) { reject(Object.assign(new Error('Request too large'), { status: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(Object.assign(new Error('Invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/health') return send(res, 200, { ok: true, ai: Boolean(process.env.GROQ_API_KEY) });

  if (url.pathname === '/api/ai') {
    if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    if (!allow(ip)) return send(res, 429, { error: 'Too many AI requests — please wait a minute.' });
    try {
      const body = await readJson(req);
      const out = await handleAI(body);
      return send(res, out.status, out.body);
    } catch (e) {
      return send(res, e.status || 500, { error: e.message });
    }
  }

  // Static files: only the app's own assets, never server code or .env.
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const allowed = !rel.includes('..') && (PUBLIC.has(rel) || /^(js|css)\/[\w\-/.]+\.(js|css)$/.test(rel));
  const file = path.join(ROOT, rel);
  if (!allowed || !file.startsWith(ROOT + path.sep) || !fs.existsSync(file)) {
    rel = 'index.html';
    if (url.pathname.startsWith('/js/') || url.pathname.startsWith('/css/')) return send(res, 404, 'Not found', 'text/plain');
  }
  const target = path.join(ROOT, rel);
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`ExamPrep running at http://localhost:${PORT}`);
    console.log(process.env.GROQ_API_KEY ? `AI: Groq enabled (model ${process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'})` : 'AI: disabled — add GROQ_API_KEY to .env (free key: https://console.groq.com/keys)');
  });
}

module.exports = server;
