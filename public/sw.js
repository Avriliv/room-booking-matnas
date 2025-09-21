// Service Worker for caching
const CACHE_NAME = 'workspace-booking-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/calendar',
  '/rooms',
  '/api/rooms',
  '/api/bookings'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
  )
})
