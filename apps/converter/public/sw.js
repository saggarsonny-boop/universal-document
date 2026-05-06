// UD Converter — minimal PWA service worker.
//
// Strategy:
//   - Cache-first for static assets (/_next/static/*, /favicon*, /icon-*,
//     /og.png, /manifest.json, /hive-logo-full.*) so the app shell loads
//     when the user opens it from a home-screen icon with no network.
//   - Network-first for everything else (HTML pages, API routes) so users
//     always see the freshest content; fall back to the cached shell only
//     if the network is fully unreachable.
//   - On `appinstalled` event the browser stores the install state; this
//     SW just keeps the offline shell alive.
//
// Bump CACHE_NAME (e.g. v2 → v3) when the shell needs a clean rebuild.

const CACHE_NAME = "ud-converter-v1";
const SHELL_URLS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/og.png",
  "/hive-logo-full.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // addAll() is atomic — if any URL fails the install rejects, which
      // is fine: the user just doesn't get offline support this session.
      cache.addAll(SHELL_URLS).catch((err) => {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[ud-converter sw] precache failed:", err);
        }
      }),
    ),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Bypass the SW for cross-origin requests (CDNs, analytics).
  if (url.origin !== self.location.origin) return;
  // API routes are always network-first; never serve a stale conversion.
  if (url.pathname.startsWith("/api/")) return;

  // Static assets → cache-first.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/og.png" ||
    url.pathname.startsWith("/apple-touch-icon") ||
    url.pathname.startsWith("/maskable-") ||
    url.pathname.startsWith("/hive-logo-full");

  if (isStatic) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        });
      }),
    );
    return;
  }

  // Pages → network-first, cache-fallback.
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("/"))),
  );
});
