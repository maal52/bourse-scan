const CACHE = 'bourse-v4';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('query1.finance') || e.request.url.includes('corsproxy') || e.request.url.includes('allorigins')) return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

// Periodic background sync (Android Chrome — minimum ~12h)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'scan-stocks') {
    e.waitUntil(doBackgroundScan());
  }
});

async function doBackgroundScan() {
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.postMessage({ type: 'background-scan-trigger' }));
}
