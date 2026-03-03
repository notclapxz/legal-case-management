'use client'

import { useState, useRef, ChangeEvent } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { Profile } from '@/lib/types/database'

interface AvatarUploadProps {
  user: Profile
  onUploadSuccess: (avatarUrl: string) => void
  onClose: () => void
}

export default function AvatarUpload({ user, onUploadSuccess, onClose }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG, PNG o WebP')
      return
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      setError('La imagen no puede superar 2 MB')
      return
    }

    setError('')
    setSelectedFile(file)

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      // 1. Eliminar avatar anterior si existe
      if (user.avatar_url) {
        const oldPath = user.avatar_url.split('/').pop()
        if (oldPath) {
          await supabase.storage.from('avatars').remove([oldPath])
        }
      }

      // 2. Generar nombre único: {userId}.{extension}
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}.${fileExt}`

      // 3. Subir archivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true // Sobrescribe si existe
        })

      if (uploadError) throw uploadError

      // 4. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // 5. Actualizar perfil en BD
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      onUploadSuccess(publicUrl)
      onClose()
    } catch (err) {
      logError('AvatarUpload.upload', err)
      setError('Error al subir la imagen. Intentá de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!user.avatar_url) return

    setUploading(true)
    setError('')

    try {
      // 1. Eliminar archivo de storage
      const fileName = user.avatar_url.split('/').pop()
      if (fileName) {
        await supabase.storage.from('avatars').remove([fileName])
      }

      // 2. Actualizar perfil en BD
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      onUploadSuccess('')
      onClose()
    } catch (err) {
      logError('AvatarUpload.remove', err)
      setError('Error al eliminar la imagen.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Preview o Avatar Actual */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {preview ? (
              <Image src={preview} alt="Preview" width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : user.avatar_url ? (
              <Image src={user.avatar_url} alt={user.nombre_completo || user.username} width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold">
                {(user.nombre_completo || user.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null)
                setSelectedFile(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Selector de archivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Botones */}
      <div className="space-y-2">
        {!preview ? (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
              disabled={uploading}
            >
              <Upload className="w-4 h-4" />
              Seleccionar Imagen
            </button>
            {user.avatar_url && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                disabled={uploading}
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </span>
                ) : (
                  'Eliminar Foto'
                )}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleUpload}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            disabled={uploading}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </span>
            ) : (
              'Guardar Foto'
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
          disabled={uploading}
        >
          Cancelar
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Máximo 2 MB • Formatos: JPG, PNG, WebP
      </p>
    </div>
  )
}
