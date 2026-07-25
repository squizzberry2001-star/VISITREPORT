const APP_VERSION = 'revamp281-enterprise-features-v36';
const CACHE_NAME = `bestie-visit-revamp281-enterprise-features-v36`;
const LOCAL_ASSETS = [
  './src/theme.css',
  './src/tailwind.generated.css',
  './src/app.js',
  './data.js',
  './store-master-data.js',
  './cloudflare-config.js',
  './convex-config.js',
  './netlify-config.js',
  './email-config.js',
  './push-config.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-128.png',
  './icons/favicon-64.png',
  './icons/favicon-48.png',
  './icons/favicon-32.png',
  './icons/favicon.ico',
  './icons/welcome-handshake-bg.jpg'
];
const CORE_ASSETS = [
  './',
  './index.html',
  './version.json',
  ...LOCAL_ASSETS.map((asset) => `${asset}?v=${APP_VERSION}`)
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME && key.startsWith('bestie-visit-')).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function shouldNetworkFirst(request) {
  if (isNavigationRequest(request)) return true;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (url.pathname.startsWith('/api/')) return true;
  if (url.pathname.startsWith('/.netlify/functions/')) return true;
  if (url.pathname.endsWith('/service-worker.js')) return true;
  if (url.pathname.endsWith('/version.json')) return true;
  return ['script', 'style', 'manifest', 'document'].includes(request.destination);
}

function networkFirst(request) {
  return fetch(request, { cache: 'no-store' })
    .then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
      }
      return response;
    })
    .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')));
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => undefined);
    return response;
  }).catch(() => cached || Response.error()));
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Jangan intercept request ke endpoint luar seperti Cloudflare Workers.
  // Browser harus langsung fetch ke Worker agar status D1 tidak tertahan cache lama.
  if (url.origin !== self.location.origin) return;
  event.respondWith(shouldNetworkFirst(event.request) ? networkFirst(event.request) : cacheFirst(event.request));
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || './';
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('focus' in client) {
        try { await client.focus(); } catch (error) {}
        return;
      }
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});


self.addEventListener('push', (event) => {
  let payload = {
    title: 'Regional Bestie Visit Report',
    body: 'Ada pengingat laporan visit.',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: 'visit-report-reminder',
    data: { url: './' }
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (error) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || './icons/icon-192.png',
      badge: payload.badge || './icons/icon-192.png',
      tag: payload.tag || 'visit-report-reminder',
      renotify: true,
      data: payload.data || { url: './' }
    })
  );
});
