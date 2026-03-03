'use client'

import { useEffect } from 'react'

interface ModalConfirmacionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  mensaje: string
  advertencias?: string[]
  textoConfirmar?: string
  textoCancelar?: string
  tipo?: 'peligro' | 'advertencia' | 'info'
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  advertencias = [],
  textoConfirmar = 'Aceptar',
  textoCancelar = 'Cancelar',
  tipo = 'peligro'
}: ModalConfirmacionProps) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const colorIcono = tipo === 'peligro' ? 'text-red-600' : tipo === 'advertencia' ? 'text-yellow-600' : 'text-blue-600'
  const colorBoton = tipo === 'peligro' ? 'bg-red-600 hover:bg-red-700' : tipo === 'advertencia' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Icono */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-full ${tipo === 'peligro' ? 'bg-red-100' : tipo === 'advertencia' ? 'bg-yellow-100' : 'bg-blue-100'} flex items-center justify-center`}>
              <span className={`text-2xl ${colorIcono}`}>
                {tipo === 'peligro' ? '⚠️' : tipo === 'advertencia' ? '⚡' : 'ℹ️'}
              </span>
            </div>

            {/* Título y mensaje */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {titulo}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {mensaje}
              </p>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Advertencias */}
        {advertencias.length > 0 && (
          <div className="px-6 pb-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
              {advertencias.map((adv, idx) => (
                <p key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{adv}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Footer - Botones */}
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            {textoCancelar}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${colorBoton}`}
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
