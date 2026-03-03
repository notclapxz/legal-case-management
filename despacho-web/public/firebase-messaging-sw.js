// =====================================================
// Firebase Cloud Messaging Service Worker
// =====================================================
// Este archivo maneja las notificaciones cuando la app está cerrada

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase Configuration (Producción)
firebase.initializeApp({
  apiKey: "AIzaSyDaGvdgDHh3VOyRI4tDSk_F4iiy25T-y3I",
  authDomain: "despacho-legal-79112.firebaseapp.com",
  projectId: "despacho-legal-79112",
  storageBucket: "despacho-legal-79112.firebasestorage.app",
  messagingSenderId: "1014862693034",
  appId: "1:1014862693034:web:ad352ea883d6226789c6d3"
})

const messaging = firebase.messaging()

// Manejar notificaciones cuando la app está en background (cerrada o minimizada)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload)
  
  const notificationTitle = payload.notification?.title || 'Nueva notificación'
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/logo.png',
    badge: '/badge.png',
    data: payload.data,
    tag: payload.data?.evento_id || 'general', // Evita duplicados
    requireInteraction: true, // Queda visible hasta que el usuario la cierre
    actions: [
      {
        action: 'open',
        title: 'Ver evento'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Manejar click en la notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received')
  
  event.notification.close()
  
  if (event.action === 'open') {
    const eventoId = event.notification.data?.evento_id
    const url = eventoId 
      ? `/dashboard/agenda?evento=${eventoId}`
      : '/dashboard/agenda'
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Si ya hay una ventana abierta, usarla
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            return client.focus().then(() => client.navigate(url))
          }
        }
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
    )
  }
  // Si es 'dismiss', solo cierra (ya se cerró arriba)
})

console.log('[firebase-messaging-sw.js] Service Worker loaded')
