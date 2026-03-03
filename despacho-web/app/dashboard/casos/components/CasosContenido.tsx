'use client'

import Link from 'next/link'
import type { Caso, CarpetaConConteo } from '@/lib/types/database'
import TablaCasos from './TablaCasos'
import MapaArchivo from './MapaArchivo'

interface CasosContenidoProps {
  nombreCarpetaActual: string
  breadcrumb: CarpetaConConteo[]
  subcarpetasActuales: CarpetaConConteo[]
  casosFiltrados: Caso[]
  carpetasConConteo: CarpetaConConteo[]
  carpetaSeleccionada: string | null
  onSeleccionarCarpeta: (carpetaId: string | null) => void
  onCambiarCarpeta: () => void
}

export default function CasosContenido({
  nombreCarpetaActual,
  breadcrumb,
  subcarpetasActuales,
  casosFiltrados,
  carpetasConConteo,
  carpetaSeleccionada,
  onSeleccionarCarpeta,
  onCambiarCarpeta
}: CasosContenidoProps) {
  // Obtener la carpeta actual seleccionada
  const carpetaActual = carpetaSeleccionada && carpetaSeleccionada !== 'sin_carpeta'
    ? carpetasConConteo.find(c => c.id === carpetaSeleccionada)
    : null

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm z-10">
        <div className="px-8 py-6">
          {/* Breadcrumb de navegación */}
          {breadcrumb.length > 0 && (
            <nav className="mb-4 flex items-center text-sm text-gray-600">
              <button
                onClick={() => onSeleccionarCarpeta(null)}
                className="hover:text-blue-600 transition-colors"
              >
                📁 Todas las carpetas
              </button>
              {breadcrumb.map((carpeta) => (
                <div key={carpeta.id} className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <button
                    onClick={() => onSeleccionarCarpeta(carpeta.id)}
                    className="hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    <span>{carpeta.icono || '📁'}</span>
                    <span>{carpeta.nombre}</span>
                  </button>
                </div>
              ))}
            </nav>
          )}

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{nombreCarpetaActual}</h1>
              <p className="text-gray-500 mt-1">
                {subcarpetasActuales.length > 0 && (
                  <span>{subcarpetasActuales.length} {subcarpetasActuales.length === 1 ? 'subcarpeta' : 'subcarpetas'} • </span>
                )}
                {casosFiltrados.length} {casosFiltrados.length === 1 ? 'caso' : 'casos'}
              </p>
            </div>
            <div className="flex gap-3">
              {/* Botón Notas de Carpeta - Solo visible si hay carpeta seleccionada */}
              {carpetaActual && (
                <Link
                  href={`/dashboard/notas/carpeta/${carpetaActual.id}`}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                >
                  <span>📝</span>
                  Ver Notas de Carpeta
                </Link>
              )}
              <MapaArchivo />
              <Link
                href="/dashboard/casos/nuevo"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                + Nuevo Caso
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content con scroll */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        {/* Lista de subcarpetas (si existen) */}
        {subcarpetasActuales.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">📁 Subcarpetas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {subcarpetasActuales.map(subcarpeta => (
                <button
                  key={subcarpeta.id}
                  onClick={() => onSeleccionarCarpeta(subcarpeta.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-3xl">{subcarpeta.icono || '📁'}</span>
                  <span className="text-sm font-medium text-gray-900 text-center">{subcarpeta.nombre}</span>
                  <span className="text-xs text-gray-500">
                    {subcarpeta.total_casos} {subcarpeta.total_casos === 1 ? 'caso' : 'casos'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tabla de casos */}
        <TablaCasos 
          casos={casosFiltrados} 
          carpetas={carpetasConConteo}
          onCambiarCarpeta={onCambiarCarpeta}
        />
      </main>
    </div>
  )
}
