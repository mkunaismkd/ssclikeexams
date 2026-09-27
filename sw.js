/* Offline support: cache the app shell; network-first so updates show up, never cache /api calls. */
const CACHE = 'examprep-v3';
const SHELL = ['./', 'index.html', 'css/styles.css', 'icon.svg', 'manifest.webmanifest',
  'js/core.js', 'js/gen-quant.js', 'js/gen-reasoning.js', 'js/bank/english.js', 'js/bank/ga.js', 'js/bank/rbi.js',
  'js/bank/reasoning.js', 'js/bank/pyq.js', 'js/exams.js', 'js/notes.js', 'js/engine.js', 'js/store.js', 'js/config.js', 'js/sync.js', 'js/ai-client.js', 'js/app.js'];

self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  e.respondWith(
    fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))),
  );
});
