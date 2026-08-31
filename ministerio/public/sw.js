// Service worker de la PWA: cache app-shell para lectura offline basica +
// manejo de notificaciones push del itinerario de etapas.
const CACHE_NAME = "ministerio-adolescentes-v1";
const OFFLINE_URL = "/offline";
const APP_SHELL = [OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

// Estrategia: network-first para navegaciones (paginas), cayendo a cache /
// pagina offline si no hay red. El resto de los requests van directo a red.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        return cached ?? caches.match(OFFLINE_URL);
      }),
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title ?? "Ministerio de Adolescentes", {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url ?? "/dashboard" },
      tag: data.tag,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => c.url.includes(targetUrl));
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    }),
  );
});
