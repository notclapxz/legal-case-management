'use client'
import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/app/hooks/usePushNotifications'
import { X, Bell, AlertCircle } from 'lucide-react'

interface Props {
  userId: string
}

export function NotificationPermissionPrompt({ userId }: Props) {
  const { permission, requestPermission, loading, error } = usePushNotifications(userId)
  const [dismissed, setDismissed] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Mostrar prompt después de 5 segundos si el usuario NO ha dado permiso
    const timer = setTimeout(() => {
      if (permission === 'default') {
        setShowPrompt(true)
      }
    }, 5000)

    return () => clearTimeout(timer)
  }, [permission])

  const handleDismiss = () => {
    // Solo oculta temporalmente (vuelve a aparecer al refrescar la página)
    setDismissed(true)
  }

  const handleActivate = async () => {
    await requestPermission()
    
    // Si se activó correctamente, cerrar el prompt después de 2 segundos
    setTimeout(() => {
      setDismissed(true)
    }, 2000)
  }

  // No mostrar si:
  // - Usuario cerró el prompt
  // - No es el momento de mostrar
  // - Rechazó permiso (denied)
  if (dismissed || !showPrompt || permission === 'denied') {
    return null
  }
  
  // Si ya dio permiso, no mostrar el prompt (ya activado)
  if (permission === 'granted') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Activar Notificaciones
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Recomendado
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          Recibí recordatorios de <strong>audiencias y reuniones</strong> aunque no estés en la app.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={handleActivate}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Activar
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            disabled={loading}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm font-medium transition-colors"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  )
}
