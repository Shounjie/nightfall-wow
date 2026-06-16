// Nightfall — Service Worker v4
// Strategy: Network-first for HTML, cache-first for assets
// This ensures updates always apply immediately without manual cache clearing.

const CACHE = "nightfall-v4";
const ASSETS = ["/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  // Cache only static assets, NOT index.html
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  // Delete all old caches
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Never intercept API calls
  if (
    url.pathname.startsWith("/.netlify/") ||
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("raider.io") ||
    url.hostname.includes("wowhead.com") ||
    url.hostname.includes("zamimg.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("googlesyndication.com")
  ) {
    return;
  }

  // HTML pages — network-first (always get latest version)
  if (e.request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          // Update cache with fresh version
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request)) // offline fallback
    );
    return;
  }

  // Static assets (icons, manifest) — cache-first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
