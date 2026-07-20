const CACHE = 'nuri-images-v1';
const DRIVE_HOSTS = ['drive.google.com', 'lh3.googleusercontent.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', event => {
  const { hostname } = new URL(event.request.url);
  if (!DRIVE_HOSTS.some(h => hostname.includes(h))) return;

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(event.request);
      if (hit) return hit;

      const res = await fetch(event.request);
      if (res.ok || res.type === 'opaque') {
        cache.put(event.request, res.clone());
      }
      return res;
    })
  );
});
