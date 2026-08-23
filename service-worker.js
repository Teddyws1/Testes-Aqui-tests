// ////////////////////////////////////////
// -003PC : SERVICE WORKER PWA
// ////////////////////////////////////////

const CACHE_NAME = "DívidaZero-04";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./roots.css",
  "./Script.js",
  "./manifest.json",
  "./js-das-versoes.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => cache.addAll(FILES_TO_CACHE))
    .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});