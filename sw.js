/* Service worker: deixa o app funcionar offline (cache-first). */
const CACHE = "controle-financeiro-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (ev) => {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(ev.request).then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(ev.request, copia));
          return resp;
        }).catch(() => caches.match("./index.html"))
    )
  );
});
