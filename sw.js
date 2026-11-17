// Offline support, network first: when online every request goes to the network, so
// the app is always current and nothing needs bumping on release. Each response is also
// saved, and the cache answers when the network can't. The files below are saved at
// install so the app opens offline straight away; anything else is saved on first use.
const CACHE = "bg-v1";
const PRECACHE = [
  "./",
  "./app.js",
  "./board.js",
  "./game.js",
  "./icon.svg",
  "./ice.js",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./manifest.webmanifest",
  "./net.js",
  "./styles.css",
  "./vendor/peerjs.min.js",
  "./index.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // One missing file shouldn't stop the worker from installing.
    await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith("bg-") && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request, { cache: "no-cache" });
      if (response.status === 200 && response.type === "basic") event.waitUntil(cache.put(request, response.clone()));
      return response;
    } catch {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === "navigate") return (await cache.match("./")) ?? Response.error();
      return Response.error();
    }
  })());
});
