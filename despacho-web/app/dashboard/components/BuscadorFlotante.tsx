'use client'

import { useState } from 'react'
import { Search, X, MapPin, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { logError } from '@/lib/utils/errors'

interface ResultadoBusqueda {
  id: string
  codigo_estimado: string
  cliente: string
  descripcion: string
  ubicacion_fisica: string
  expediente: string
  tipo: string
}

export default function BuscadorFlotante() {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [buscando, setBuscando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const realizarBusqueda = async (termino: string) => {
    if (termino.length < 2) {
      setResultados([])
      return
    }

    setBuscando(true)
    try {
      const { data, error } = await supabase
        .from('casos')
        .select('id, codigo_estimado, cliente, descripcion, ubicacion_fisica, expediente, tipo')
        .or(`codigo_estimado.ilike.%${termino}%,cliente.ilike.%${termino}%,descripcion.ilike.%${termino}%,expediente.ilike.%${termino}%`)
        .eq('estado', 'Activo')
        .limit(8)
        .order('cliente')

      if (error) throw error
      setResultados(data || [])
    } catch (error) {
      logError('BuscadorFlotante.realizarBusqueda', error)
    } finally {
      setBuscando(false)
    }
  }

  const handleInputChange = (value: string) => {
    setBusqueda(value)
    setAbierto(value.length > 0)
    realizarBusqueda(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setAbierto(false)
      setBusqueda('')
    }
  }

  const seleccionarResultado = (resultado: ResultadoBusqueda) => {
    router.push(`/dashboard/casos/${resultado.id}`)
    setAbierto(false)
    setBusqueda('')
  }

  return (
    <div className="relative">
      {/* Botón de búsqueda */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50"
        title="Buscar casos (Ctrl+K)"
      >
        <Search className="w-6 h-6" />
      </button>

      {/* Modal de búsqueda */}
      {abierto && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setAbierto(false)}
          ></div>

          {/* Contenedor de búsqueda */}
          <div className="fixed top-20 left-4 right-4 md:left-1/2 md:right-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
              {/* Input de búsqueda */}
              <div className="flex items-center p-4 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400 mr-3" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar por código, cliente, descripción o expediente..."
                  className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                  autoFocus
                />
                {buscando && (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                )}
                <button
                  onClick={() => {
                    setAbierto(false)
                    setBusqueda('')
                  }}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Resultados */}
              <div className="max-h-96 overflow-y-auto">
                {busqueda.length < 2 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Escribe al menos 2 caracteres para buscar</p>
                  </div>
                ) : buscando ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm">Buscando casos...</p>
                  </div>
                ) : resultados.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No se encontraron casos</p>
                    <p className="text-xs mt-1">Intenta con otros términos de búsqueda</p>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {resultados.length} {resultados.length === 1 ? 'resultado' : 'resultados'}
                    </div>
                    {resultados.map((resultado) => (
                      <button
                        key={resultado.id}
                        onClick={() => seleccionarResultado(resultado)}
                        className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {resultado.codigo_estimado}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {resultado.tipo}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900 truncate mb-1">
                            {resultado.cliente}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {resultado.descripcion}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            {resultado.ubicacion_fisica && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{resultado.ubicacion_fisica}</span>
                              </div>
                            )}
                            {resultado.expediente && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{resultado.expediente}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-400">
                          <Search className="w-4 h-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd> para cerrar
                </div>
                <button
                  onClick={() => {
                    router.push('/dashboard/casos')
                    setAbierto(false)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todos los casos →
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}