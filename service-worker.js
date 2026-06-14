// Nightfall — Service Worker
// Minimal service worker required for PWA installability.
// Caches the app shell so it loads instantly and works offline (the UI;
// live data still needs a connection).

const CACHE = "nightfall-v1";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Never cache API/proxy/data calls — always go to network
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("raider.io") ||
    url.hostname.includes("wowhead.com") ||
    url.hostname.includes("zamimg.com")
  ) {
    return; // let the browser handle it normally
  }

  // App shell: cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
