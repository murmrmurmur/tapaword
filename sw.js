const CACHE = 'tapaword-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// 설치
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 활성화
self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// fetch 캐시
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Share Target 수신
  if (url.pathname === '/share' && e.request.method === 'GET') {
    e.respondWith((async () => {
      const text = url.searchParams.get('text') || '';
      const sharedUrl = url.searchParams.get('url') || '';
      const title = url.searchParams.get('title') || '';

      // 앱으로 리다이렉트하면서 파라미터 전달
      const redirectUrl = `/?shared_text=${encodeURIComponent(text)}&shared_url=${encodeURIComponent(sharedUrl)}&shared_title=${encodeURIComponent(title)}`;
      return Response.redirect(redirectUrl, 303);
    })());
    return;
  }

  // 일반 fetch는 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
