'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, LogOut, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AvatarUpload from './AvatarUpload'
import type { Profile } from '@/lib/types/database'

interface PerfilModalProps {
  user: Profile
  onClose: () => void
}

export default function PerfilModal({ user: initialUser, onClose }: PerfilModalProps) {
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [user, setUser] = useState(initialUser)
  const [loadingLogout, setLoadingLogout] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoadingLogout(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleAvatarSuccess = (avatarUrl: string) => {
    setUser({ ...user, avatar_url: avatarUrl || null })
    setShowAvatarUpload(false)
    router.refresh() // Refresh para actualizar el avatar en toda la app
  }

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin': return 'Administrador'
      case 'abogado': return 'Abogado'
      case 'secretaria': return 'Secretaria'
      default: return rol
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mi Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showAvatarUpload ? (
            <AvatarUpload
              user={user}
              onUploadSuccess={handleAvatarSuccess}
              onClose={() => setShowAvatarUpload(false)}
            />
          ) : (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.nombre_completo || user.username}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-3xl font-bold">
                        {(user.nombre_completo || user.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAvatarUpload(true)}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                    title="Cambiar foto"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Información del Usuario */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Nombre
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {user.nombre_completo || user.username}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Usuario
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    {user.username}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Rol
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRolLabel(user.rol)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Estado
                  </label>
                  <p className="text-base text-gray-900 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              <button
                onClick={handleLogout}
                disabled={loadingLogout}
                className="w-full bg-red-600 text-white py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {loadingLogout ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
