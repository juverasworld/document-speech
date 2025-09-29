// Background Audio Service Worker
// This helps maintain audio playback when the main thread is suspended

const CACHE_NAME = 'document-reader-audio-v1'

self.addEventListener('install', (event) => {
  console.log('Background audio service worker installed')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Background audio service worker activated')
  event.waitUntil(self.clients.claim())
})

// Handle background audio maintenance
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'MAINTAIN_AUDIO') {
    console.log('Service worker maintaining audio playback')
    
    // Keep the service worker active
    const keepAlive = () => {
      setTimeout(() => {
        if (event.data.shouldMaintain) {
          keepAlive()
        }
      }, 1000)
    }
    
    if (event.data.shouldMaintain) {
      keepAlive()
    }
    
    // Notify main thread to resume if needed
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'RESUME_AUDIO_IF_NEEDED',
          timestamp: Date.now()
        })
      })
    })
  }
})

// Handle fetch events (required for service worker)
self.addEventListener('fetch', (event) => {
  // Let the browser handle all fetch requests normally
  return
})