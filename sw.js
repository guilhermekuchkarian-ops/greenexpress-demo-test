/* GreenExpress V14.2 service worker — network-first; keeps the last good copy so an issued pickup pass opens offline.
   Never caches API calls (Supabase) or anything cross-origin. */
const CACHE = 'gx-demo-r3-1';
const CORE = ['app.html', 'index.html', 'logo.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE).catch(() => {}))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || /supabase|\/rest\/|\/auth\//.test(u.pathname)) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('app.html'))));
});
