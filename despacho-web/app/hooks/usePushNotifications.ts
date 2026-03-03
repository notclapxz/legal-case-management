'use client'
import { useEffect, useState } from 'react'
import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from '@/lib/firebase/config'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'

export function usePushNotifications(userId: string) {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    setLoading(true)
    setError(null)

    try {
      // Verificar que el browser soporte notificaciones
      if (!('Notification' in window)) {
        throw new Error('Este navegador no soporta notificaciones')
      }

      // Pedir permiso
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission !== 'granted') {
        throw new Error('Permiso de notificaciones denegado')
      }

      // Obtener messaging instance
      const messagingInstance = await messaging()
      if (!messagingInstance) {
        throw new Error('Firebase Messaging no disponible')
      }

      // Obtener token FCM
      const fcmToken = await getToken(messagingInstance, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!
      })

      if (!fcmToken) {
        throw new Error('No se pudo obtener el token FCM')
      }

      setToken(fcmToken)

      // Guardar token en Supabase
      const { error: dbError } = await supabase.from('fcm_tokens').upsert({
        user_id: userId,
        token: fcmToken,
        device_info: navigator.userAgent,
        last_used: new Date().toISOString()
      })

      if (dbError) {
        throw new Error('Error al guardar el token')
      }
    } catch (err) {
      logError('usePushNotifications', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Escuchar mensajes cuando la app está abierta (foreground)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupForegroundListener = async () => {
      const messagingInstance = await messaging()
      if (!messagingInstance) return

      unsubscribe = onMessage(messagingInstance, (payload) => {
        const event = new CustomEvent('fcm-message', { detail: payload })
        window.dispatchEvent(event)
      })
    }

    setupForegroundListener()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  return { 
    permission, 
    token, 
    loading, 
    error, 
    requestPermission 
  }
}
