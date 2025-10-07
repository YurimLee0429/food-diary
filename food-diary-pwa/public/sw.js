self.addEventListener('install', (e) => {
  console.log('📦 Service Worker installed');
});

self.addEventListener('fetch', (e) => {
  // 네트워크 요청 가로채서 캐시 로직 추가 가능
});
