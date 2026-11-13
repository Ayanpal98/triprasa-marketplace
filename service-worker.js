const CACHE_NAME = "triprasa-shell-v2";
const APP_SHELL = ["/", "/manifest.webmanifest", "/favicon.svg", "/icons/triprasa-icon.svg"];
const CACHEABLE_DESTINATIONS = new Set(["style", "script", "image", "font"]);

async function storeIfCacheable(cache, request, response) {
  if (!response || !response.ok || response.type !== "basic") return;
  const cacheControl = response.headers.get("Cache-Control") || "";
  if (/no-store/i.test(cacheControl)) return;
  await cache.put(request, response.clone());
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("triprasa-shell-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Never intercept writes, cross-origin requests, or authenticated requests.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    request.headers.has("Authorization")
  ) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await storeIfCacheable(cache, request, response);
          if (url.pathname === "/") {
            await storeIfCacheable(cache, "/", response);
          }
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) ||
          (await caches.match("/")) ||
          Response.error();
      }
    })());
    return;
  }

  if (CACHEABLE_DESTINATIONS.has(request.destination) || url.pathname === "/manifest.webmanifest") {
    // Network-first keeps deployed code and styles fresh; cache is an offline fallback.
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await storeIfCacheable(cache, request, response);
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || Response.error();
      }
    })());
  }
});
