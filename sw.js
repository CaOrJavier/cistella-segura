// Cistella Segura · modo sin internet
// Solo se instala cuando alguien pulsa «Guardar en este dispositivo» (#/sin-internet).
// Los archivos los descarga la propia página en la caché CACHE; aquí solo se sirven:
//  - fotos y fuentes: primero lo guardado; si una foto grande no está guardada y no hay red, su miniatura;
//  - páginas, código y datos: primero la red (así siempre se ve lo último); si tarda o no hay red, lo guardado.
const CACHE = "cistella-sin-internet";
const ESPERA_RED = 3500;   // ms que se espera a la red antes de servir lo guardado

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

const esEstatico = (p) => /\.(jpe?g|png|webp|gif|woff2?|ttf)$/i.test(p);
// fotos/g/x.jpg → fotos/t/x.jpg · fotos/x.jpg → fotos/t/x.jpg · fotos/montnegre/x.jpg → fotos/montnegre/t/x.jpg
// cuaderno/p01.jpg → cuaderno/t01.jpg · libros/esencial/p001.jpg → libros/esencial/t001.jpg
function miniatura(p) {
  return p.replace(/\/fotos\/g\//, "/fotos/t/")
    .replace(/\/fotos\/([^/]+\.jpe?g)$/i, "/fotos/t/$1")
    .replace(/\/fotos\/montnegre\/([^/]+)$/, "/fotos/montnegre/t/$1")
    .replace(/\/(cuaderno|libros\/[^/]+)\/p(\d+\.jpg)$/, "/$1/t$2");
}

self.addEventListener("fetch", (e) => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET" || u.origin !== self.location.origin) return;
  if (u.searchParams.has("_guardar")) return;   // descargas de la página al guardar: directas a la red
  e.respondWith(responder(req, u));
});

async function responder(req, u) {
  const cache = await caches.open(CACHE);
  if (esEstatico(u.pathname)) {
    const guardado = await cache.match(req, { ignoreSearch: true });
    if (guardado) return guardado;
    try { return await fetch(req); }
    catch (err) {
      const m = miniatura(u.pathname);
      const mini = m !== u.pathname && (await cache.match(m));
      if (mini) return mini;
      throw err;
    }
  }
  const guardado = await cache.match(req, { ignoreSearch: true });
  const red = fetch(req).then((r) => {
    if (r.ok && guardado) cache.put(req, r.clone());   // mantiene al día lo que ya estaba guardado
    return r;
  });
  if (!guardado) return red;
  return Promise.race([
    red.catch(() => guardado),
    new Promise((ok) => setTimeout(() => ok(guardado), ESPERA_RED)),
  ]);
}
