/**
 * Modal para Crear/Editar Carpetas
 *
 * Componente Client que permite crear nuevas carpetas o editar existentes.
 * Soporta jerarquía de carpetas (carpetas padre/hijas).
 *
 * @example
 * ```tsx
 * import ModalCarpeta from '@/app/dashboard/casos/components/ModalCarpeta'
 *
 * <ModalCarpeta
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onSuccess={() => cargarCarpetas()}
 *   carpetaEditar={carpetaSeleccionada}
 *   carpetas={carpetas}
 * />
 * ```
 */
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { Carpeta, CarpetaConConteo } from '@/lib/types/database'

interface ModalCarpetaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  carpetaEditar?: Carpeta | null
  carpetas: CarpetaConConteo[] // Para selector de carpeta padre
}

const COLORES_PREDEFINIDOS = [
  { hex: '#EF4444', nombre: 'Rojo' },
  { hex: '#F59E0B', nombre: 'Naranja' },
  { hex: '#10B981', nombre: 'Verde' },
  { hex: '#3B82F6', nombre: 'Azul' },
  { hex: '#8B5CF6', nombre: 'Violeta' },
  { hex: '#EC4899', nombre: 'Rosa' },
  { hex: '#6B7280', nombre: 'Gris' },
]

const ICONOS_PREDEFINIDOS = ['📁', '⚖️', '📋', '👔', '📦', '🔒', '🚨', '💼', '📄', '🏛️']

export default function ModalCarpeta({
  isOpen,
  onClose,
  onSuccess,
  carpetaEditar,
  carpetas
}: ModalCarpetaProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    icono: '📁',
    carpeta_padre_id: '' as string | null,
  })

  useEffect(() => {
    if (carpetaEditar) {
      setFormData({
        nombre: carpetaEditar.nombre,
        descripcion: carpetaEditar.descripcion || '',
        color: carpetaEditar.color || '#3B82F6',
        icono: carpetaEditar.icono || '📁',
        carpeta_padre_id: carpetaEditar.carpeta_padre_id || '',
      })
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        color: '#3B82F6',
        icono: '📁',
        carpeta_padre_id: '',
      })
    }
    setError(null)
  }, [carpetaEditar, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const carpetaData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        color: formData.color,
        icono: formData.icono,
        carpeta_padre_id: formData.carpeta_padre_id || null,
        created_by: user.id,
      }

      if (carpetaEditar) {
        // Actualizar carpeta existente
        const { error: updateError } = await supabase
          .from('carpetas')
          .update(carpetaData)
          .eq('id', carpetaEditar.id)

        if (updateError) throw updateError
      } else {
        // Crear nueva carpeta
        const { error: insertError } = await supabase
          .from('carpetas')
          .insert([carpetaData])

        if (insertError) throw insertError
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      logError('ModalCarpeta.guardar', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar carpetas para evitar seleccionar carpetas hijas como padre
  const carpetasDisponibles = carpetaEditar
    ? carpetas.filter(c => c.id !== carpetaEditar.id && !c.carpeta_padre_id?.startsWith(carpetaEditar.id))
    : carpetas

  const carpetasRaiz = carpetasDisponibles.filter(c => !c.carpeta_padre_id)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {carpetaEditar ? 'Editar Carpeta' : 'Nueva Carpeta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la carpeta *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Casos Penales 2024"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={2}
              placeholder="Descripción breve de la carpeta"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Carpeta padre (para subcarpetas) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </label>
            <select
              value={formData.carpeta_padre_id || ''}
              onChange={(e) => setFormData({ ...formData, carpeta_padre_id: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">📂 Nivel superior (carpeta raíz)</option>
              {carpetasRaiz.map(carpeta => (
                <option key={carpeta.id} value={carpeta.id}>
                  {carpeta.icono} {carpeta.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Elegí una carpeta padre para crear una subcarpeta
            </p>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORES_PREDEFINIDOS.map(color => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.hex })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color.hex
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.nombre}
                />
              ))}
            </div>
          </div>

          {/* Icono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icono
            </label>
            <div className="flex gap-2 flex-wrap">
              {ICONOS_PREDEFINIDOS.map(icono => (
                <button
                  key={icono}
                  type="button"
                  onClick={() => setFormData({ ...formData, icono })}
                  className={`w-10 h-10 text-xl rounded-md border-2 transition-all ${
                    formData.icono === icono
                      ? 'border-blue-500 bg-blue-50 scale-110'
                      : 'border-gray-300 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {icono}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <span className="text-lg">{formData.icono}</span>
              <span className="text-sm font-medium text-gray-900">
                {formData.nombre || 'Nombre de carpeta'}
              </span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                carpetaEditar ? '💾 Guardar Cambios' : '✨ Crear Carpeta'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
