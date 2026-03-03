import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function UbicacionesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener ubicaciones físicas (solo columnas necesarias)
  const { data: ubicaciones } = await supabase
    .from('ubicaciones_fisicas')
    .select('id, codigo_estimado, ubicacion, fila, columna, seccion, posicion, cliente, descripcion, expediente, tomo')
    .order('ubicacion', { ascending: true })

  // Agrupar por fila
  const ubicacionesPorFila = ubicaciones?.reduce((acc: Record<string, typeof ubicaciones>, ub) => {
    const fila = ub.ubicacion.split('-')[0] // Extraer el número de fila
    if (!acc[fila]) {
      acc[fila] = []
    }
    acc[fila].push(ub)
    return acc
  }, {} as Record<string, typeof ubicaciones>) || {}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ubicaciones Físicas</h1>
              <p className="text-gray-500 mt-1">Gestión del archivo físico del despacho</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total de archivadores</p>
              <p className="text-2xl font-bold text-blue-600">{ubicaciones?.length || 0}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        {/* Buscador */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <input
            type="text"
            placeholder="Buscar por código de caso o ubicación..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ubicaciones por Fila */}
        <div className="space-y-6">
          {Object.entries(ubicacionesPorFila)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([fila, ubicacionesFila]) => (
              <div key={fila} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Fila {fila}
                    <span className="ml-3 text-sm font-normal text-gray-600">
                      ({Array.isArray(ubicacionesFila) ? ubicacionesFila.length : 0} archivadores)
                    </span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(ubicacionesFila) && ubicacionesFila.map((ub) => (
                      <div
                        key={ub.id}
                        className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              📍 {ub.ubicacion}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Código: <span className="font-medium text-gray-700">{ub.codigo_estimado}</span>
                            </p>
                            {ub.descripcion && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {ub.descripcion}
                              </p>
                            )}
                            {ub.cliente && (
                              <p className="text-xs text-gray-500 mt-1">
                                Cliente: {ub.cliente}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Vista de Mapa del Archivo */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mapa del Archivo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ubicacionesPorFila)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([fila, ubicacionesFila]) => {
                // Agrupar por columna
                const porColumna = Array.isArray(ubicacionesFila) 
                  ? ubicacionesFila.reduce((acc: Record<string, number>, ub) => {
                      const col = ub.ubicacion.split('-')[1]
                      if (!acc[col]) acc[col] = 0
                      acc[col]++
                      return acc
                    }, {} as Record<string, number>)
                  : {}

                return (
                  <div key={fila} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-center">Fila {fila}</h3>
                    <div className="space-y-2">
                      {Object.entries(porColumna)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([columna, cantidad]) => (
                          <div key={columna} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Columna {columna}:</span>
                            <span className="font-medium text-blue-600">{cantidad as number}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total de Filas</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {Object.keys(ubicacionesPorFila).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total de Archivadores</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {ubicaciones?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Promedio por Fila</h3>
            <p className="mt-2 text-3xl font-bold text-orange-600">
              {Object.keys(ubicacionesPorFila).length > 0
                ? Math.round((ubicaciones?.length || 0) / Object.keys(ubicacionesPorFila).length)
                : 0}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
