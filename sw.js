/* Service worker: deixa o app funcionar offline (cache-first). */
const CACHE = "controle-financeiro-v3";
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
  // Página (navegação): tenta a rede primeiro, para atualizações chegarem
  // automaticamente; cai para o cache quando estiver offline.
  if (ev.request.mode === "navigate") {
    ev.respondWith(
      // "no-cache" ignora o cache HTTP de 10 min do GitHub Pages e
      // revalida com o servidor — atualizações aparecem na hora
      fetch(ev.request, { cache: "no-cache" })
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copia));
          return resp;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // Demais arquivos (ícones, manifest): cache primeiro.
  ev.respondWith(
    caches.match(ev.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(ev.request).then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(ev.request, copia));
          return resp;
        })
    )
  );
});
