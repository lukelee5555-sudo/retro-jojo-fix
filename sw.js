// 조조전 웹 실행기 — 서비스 워커 (tools/build-pwa.mjs 가 만든다)
// 실행기 껍데기(아래 SHELL)만 기기에 담아 두고 거기서 먼저 꺼낸다 — 인터넷 없이도 열린다.
// 게임 파일은 사용자가 고른 zip 을 기기에서 바로 읽고 세이브는 IndexedDB 에 있다 — 여기서는 받지도 담지도 않는다.
const CACHE = 'retro-jojo-bgmfix-20261120'
const SHELL = ["./index.html","./manifest.webmanifest","./apple-touch-icon.png","./icon-192.png","./icon-512.png"]
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  // 이 실행기의 예전 판만 지운다 (같은 주소에 다른 실행기가 있어도 그쪽 것은 그대로)
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('retro-jojo-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return
  const scope = new URL(self.registration.scope)
  const rel = './' + url.pathname.slice(scope.pathname.length)
  // 실행기 주소(뒤의 ?… 는 무시)는 담아 둔 index.html 로. 그 밖의 주소(README 등)는 그냥 서버에서
  const key = rel === './' ? './index.html' : rel
  if (!SHELL.includes(key)) return
  e.respondWith(caches.open(CACHE).then((c) => c.match(key).then((hit) => hit || fetch(req))))
})
