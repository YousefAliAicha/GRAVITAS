/* GRAVITAS offline shell — GitHub Pages project scope */
const CACHE = "gravitas-shell-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./offline.html",
  "./404.html",
  "./css/variables.css",
  "./css/base.css",
  "./css/hero.css",
  "./css/app.css",
  "./css/responsive.css",
  "./js/router.js",
  "./assets/og-image.png",
  "./assets/Yousef-Ali-Aicha-Resume.pdf",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () {
        // Partial cache is fine if some assets fail (CDN fonts, etc.)
        return Promise.all(
          ASSETS.map(function (url) {
            return cache.add(url).catch(function () {});
          }),
        );
      });
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE) return caches.delete(key);
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then(function (res) {
        return res;
      })
      .catch(function () {
        return caches.match(req).then(function (cached) {
          if (cached) return cached;
          if (req.mode === "navigate") {
            return caches.match("./offline.html");
          }
          return caches.match("./offline.html");
        });
      }),
  );
});
