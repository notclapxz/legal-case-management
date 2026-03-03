/**
 * Modal de confirmación para eliminar casos
 * Componente reutilizable extraído de TablaCasos
 */

import type { Caso } from '@/lib/types/database'

interface DeleteCaseModalProps {
  caso: Caso | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function DeleteCaseModal({
  caso,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteCaseModalProps) {
  if (!isOpen || !caso) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header con ícono de advertencia */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Eliminar Caso</h3>
            <p className="text-sm text-gray-600 mt-1">
              ¿Estás seguro de que quieres eliminar este caso?
            </p>
          </div>
        </div>

        {/* Información del caso */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-gray-900">{caso.codigo_estimado}</p>
          <p className="text-sm text-gray-600">{caso.cliente}</p>
          {caso.descripcion && (
            <p className="text-xs text-gray-500 mt-1">{caso.descripcion}</p>
          )}
        </div>

        {/* Advertencia */}
        <p className="text-sm text-red-600 font-medium mb-6">
          ⚠️ Esta acción no se puede deshacer. Se eliminarán todos los datos relacionados
          (notas, eventos, pagos).
        </p>

        {/* Acciones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
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
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
