const CACHE_NAME = 'pokemon-heart-soul-v2-0-2-core-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './refinements.css',
  './app.js',
  './site.webmanifest',
  './config/game-config.js',
  './config/game-overrides.js',
  './sync-config.js',
  './data/guide-data.js',
  './data/items-data.js',
  './data/legendary-data.js',
  './data/acquisition-data.js',
  './data/egg-data.js',
  './data/battle-data.js',
  './data/move-tutor-data.js',
  './data/curated-builds.js',
  './assets/art/steamgriddb-heart-soul-hero.png',
  './assets/art/steamgriddb-heart-soul-logo.png',
  './assets/art/steamgriddb-heart-soul-icon.png',
  './assets/fonts/atlantis-international.ttf',
  './assets/pokemon/ho_oh.png',
  './assets/ui/pokeball.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const url = new URL(event.request.url);
  const shouldRefresh = event.request.mode === 'navigate' || ['style', 'script', 'worker'].includes(event.request.destination)
    || /\/(?:data|config)\//.test(url.pathname);
  if (shouldRefresh) {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request.mode === 'navigate' ? './index.html' : event.request, copy));
      return response;
    }).catch(() => caches.match(event.request.mode === 'navigate' ? './index.html' : event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});
