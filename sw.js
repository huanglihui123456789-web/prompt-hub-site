/* PROMPT 提示词库 Service Worker
   - install：预缓存应用外壳（含 chunk-1，首屏必需）
   - 导航请求：网络优先，离线回退缓存（保证拿到最新 HTML）
   - 其他同源/跨域资源：stale-while-revalidate（缓存优先 + 后台更新）
   - 缓存键含版本号，升级时旧缓存自动清理
   版本号请与 index.html 的 app-version 保持一致。 */
const CACHE = 'prompt-hub-v20260905q';
const PRECACHE = [
  './',
  './index.html',
  './404.html',
  './manifest.json',
  './favicon.svg',
  './assets/js/data/chunk-1.js?v=20260905q',
  './assets/js/data/chunk-2.js?v=20260905q',
  './assets/js/data/chunk-3.js?v=20260905q',
  './assets/js/data/chunk-4.js?v=20260905q',
  './assets/js/data/chunk-5.js?v=20260905q',
  './assets/img/og-cover.jpg',
  './assets/img/app-icon-512.jpg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 导航请求：网络优先，失败（离线）回退缓存
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) { return hit || caches.match('./index.html'); });
      })
    );
    return;
  }

  // 静态资源：缓存优先 + 后台更新（stale-while-revalidate）
  event.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && (res.status === 200 || res.type === 'opaque')) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
