// =====================================================
// Firebase Configuration
// =====================================================
// Para notificaciones push (FCM)

import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import { logError } from '@/lib/utils/errors'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!
}

// Inicializar Firebase (solo una vez)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Messaging (solo en browser)
export const messaging = async () => {
  try {
    const isSupportedBrowser = await isSupported()
    if (isSupportedBrowser && typeof window !== 'undefined') {
      return getMessaging(app)
    }
    return null
  } catch (error) {
    logError('firebase.messaging', error)
    return null
  }
}

export { app }
