'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import FormularioNota from './FormularioNota'
import type { Nota } from '@/lib/types/database'

interface SeccionNotasProps {
  casoId: string
  notas: Nota[]
}

export default function SeccionNotas({ casoId, notas }: SeccionNotasProps) {
  const [mostrarForm, setMostrarForm] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [notaAEliminar, setNotaAEliminar] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleEliminar = async () => {
    if (!notaAEliminar) return

    setEliminando(notaAEliminar)
    try {
      // ✅ Usar Supabase directo en vez de API route
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', notaAEliminar)

      if (error) throw error

      router.refresh()
      setNotaAEliminar(null)
    } catch (error) {
      logError('SeccionNotas.eliminar', error)
      alert('Error al eliminar la nota')
    } finally {
      setEliminando(null)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Notas</h2>
          <button
            onClick={() => setMostrarForm(true)}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            + Nota
          </button>
        </div>
        {notas && notas.length > 0 ? (
          <div className="space-y-3">
            {notas.map((nota) => (
              <div key={nota.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg hover:bg-gray-100 transition-colors group">
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">{nota.contenido}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {nota.created_at ? new Date(nota.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Sin fecha'}
                    </p>
                  </div>
                  <button
                    onClick={() => setNotaAEliminar(nota.id)}
                    disabled={eliminando === nota.id}
                    className="ml-4 flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100"
                    title="Eliminar nota"
                  >
                    {eliminando === nota.id ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay notas</p>
        )}
      </div>

      {mostrarForm && (
        <FormularioNota
          casoId={casoId}
          onClose={() => setMostrarForm(false)}
        />
      )}

      {/* Modal de Confirmación */}
      {notaAEliminar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Nota</h3>
                <p className="text-sm text-gray-600 mt-1">¿Estás seguro de que quieres eliminar esta nota?</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setNotaAEliminar(null)}
                disabled={eliminando === notaAEliminar}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                disabled={eliminando === notaAEliminar}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {eliminando === notaAEliminar ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
      )}
    </>
  )
}
