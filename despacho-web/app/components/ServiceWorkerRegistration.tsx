'use client'
import { useEffect } from 'react'
import { logError } from '@/lib/utils/errors'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .catch((error) => {
          logError('ServiceWorkerRegistration', error)
        })
    }
  }, [])

  return null
}
