'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface AccionesDelCasoProps {
  casoId: string
  estadoActual: string
}

export default function AccionesDelCaso({ casoId, estadoActual }: AccionesDelCasoProps) {
  const router = useRouter()
  const supabase = createClient()
  const [mostrarCambiarEstado, setMostrarCambiarEstado] = useState(false)
  const [mostrarArchivar, setMostrarArchivar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState(estadoActual)

  const handleEditarCaso = () => {
    router.push(`/dashboard/casos/${casoId}/editar`)
  }

  const handleCambiarEstado = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('casos')
        .update({ estado: nuevoEstado })
        .eq('id', casoId)

      if (updateError) throw updateError

      router.refresh()
      setMostrarCambiarEstado(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const handleArchivarCaso = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from('casos')
        .update({ estado: 'Cerrado' })
        .eq('id', casoId)

      if (updateError) throw updateError

      router.push('/dashboard/casos')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err) || "Error desconocido")
      setLoading(false)
    }
  }

  const handleVerDocumentos = () => {
    // Por ahora solo navegar a la sección de documentos o mostrar un mensaje
    alert('Funcionalidad de documentos próximamente')
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h2>
        <div className="space-y-2">
          <button
            onClick={handleEditarCaso}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Editar Caso
          </button>
          <button
            onClick={() => setMostrarCambiarEstado(true)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cambiar Estado
          </button>
          <button
            onClick={handleVerDocumentos}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Ver Documentos
          </button>
          <button
            onClick={() => setMostrarArchivar(true)}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
          >
            Archivar Caso
          </button>
        </div>
      </div>

      {/* Modal Cambiar Estado */}
      {mostrarCambiarEstado && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Cambiar Estado del Caso</h3>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo Estado
                </label>
                <select
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setMostrarCambiarEstado(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCambiarEstado}
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : (
                    'Cambiar Estado'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Archivar Caso */}
      {mostrarArchivar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Archivar Caso</h3>
                <p className="text-sm text-gray-600 mt-1">¿Estás seguro de que quieres archivar este caso?</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              El caso se marcará como &quot;Cerrado&quot; y serás redirigido a la lista de casos.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMostrarArchivar(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleArchivarCaso}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Archivando...
                  </>
                ) : (
                  'Archivar Caso'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
