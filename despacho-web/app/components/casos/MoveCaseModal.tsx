/**
 * Modal para mover casos a carpetas
 * Componente reutilizable extraído de TablaCasos
 */

import type { Caso, CarpetaConConteo } from '@/lib/types/database'

interface MoveCaseModalProps {
  caso: Caso | null
  carpetas: CarpetaConConteo[]
  isOpen: boolean
  onClose: () => void
  onMove: (carpetaId: string | null) => Promise<void>
  isMoving: boolean
}

export function MoveCaseModal({
  caso,
  carpetas,
  isOpen,
  onClose,
  onMove,
  isMoving,
}: MoveCaseModalProps) {
  if (!isOpen || !caso) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Mover Caso a Carpeta</h3>
          <button
            onClick={onClose}
            disabled={isMoving}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {/* Información del caso */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-gray-900">{caso.codigo_estimado}</p>
          <p className="text-sm text-gray-600">{caso.cliente}</p>
        </div>

        {/* Lista de carpetas */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar carpeta de destino:
          </label>

          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-md p-2">
            {/* Opción: Sin carpeta */}
            <button
              onClick={() => onMove(null)}
              disabled={isMoving}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span className="text-lg">💼</span>
              <span className="text-sm">Sin carpeta</span>
            </button>

            {/* Carpetas disponibles */}
            {carpetas.map((carpeta) => (
              <button
                key={carpeta.id}
                onClick={() => onMove(carpeta.id)}
                disabled={isMoving}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: carpeta.color || '#3B82F6' }}
                />
                <span className="text-lg">{carpeta.icono || '📁'}</span>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    {carpeta.nombre}
                  </span>
                  {carpeta.ruta_completa &&
                    carpeta.ruta_completa !== carpeta.nombre && (
                      <p className="text-xs text-gray-500">{carpeta.ruta_completa}</p>
                    )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isMoving && (
          <div className="flex items-center justify-center py-4">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="ml-3 text-sm text-gray-600">Moviendo caso...</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isMoving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
