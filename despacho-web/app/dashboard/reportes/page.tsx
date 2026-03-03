import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ReportesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener casos (solo columnas necesarias para reportes)
  const { data: casos } = await supabase
    .from('casos')
    .select('id, codigo_estimado, cliente, tipo, estado, forma_pago, monto_total, monto_cobrado')

  // Obtener pagos (solo columnas necesarias)
  const { data: pagos } = await supabase
    .from('pagos')
    .select('id, monto, fecha_pago')
    .order('fecha_pago', { ascending: false })

  // Calcular estadísticas
  const totalCasos = casos?.length || 0
  const casosActivos = casos?.filter(c => c.estado === 'Activo').length || 0
  const casosPausados = casos?.filter(c => c.estado === 'Pausado').length || 0
  const casosCerrados = casos?.filter(c => c.estado === 'Cerrado').length || 0

  // Por tipo
  const casosPorTipo = {
    Penal: casos?.filter(c => c.tipo === 'Penal').length || 0,
    Civil: casos?.filter(c => c.tipo === 'Civil').length || 0,
    Laboral: casos?.filter(c => c.tipo === 'Laboral').length || 0,
    Familia: casos?.filter(c => c.tipo === 'Familia').length || 0,
    Administrativo: casos?.filter(c => c.tipo === 'Administrativo').length || 0,
    Otro: casos?.filter(c => c.tipo === 'Otro').length || 0,
  }

  // Cálculos financieros
  const montoTotalAcordado = casos?.reduce((sum, c) => sum + (c.monto_total || 0), 0) || 0
  const montoTotalCobrado = casos?.reduce((sum, c) => sum + (c.monto_cobrado || 0), 0) || 0
  const montoPendiente = montoTotalAcordado - montoTotalCobrado

  // Pagos este mes
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const pagosEsteMes = pagos?.filter(p => new Date(p.fecha_pago) >= inicioMes) || []
  const totalCobradoEsteMes = pagosEsteMes.reduce((sum, p) => sum + (p.monto || 0), 0)

  // Por forma de pago
  const casosPorFormaPago = {
    'Por etapas': casos?.filter(c => c.forma_pago === 'Por etapas').length || 0,
    'Monto fijo': casos?.filter(c => c.forma_pago === 'Monto fijo').length || 0,
    'Por honorarios': casos?.filter(c => c.forma_pago === 'Por honorarios').length || 0,
    'Otro': casos?.filter(c => c.forma_pago === 'Otro').length || 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
              <p className="text-gray-500 mt-1">Análisis general del despacho</p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        {/* Resumen General */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen General</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total de Casos</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalCasos}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Casos Activos</h3>
              <p className="mt-2 text-3xl font-bold text-green-600">{casosActivos}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Casos Pausados</h3>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{casosPausados}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Casos Cerrados</h3>
              <p className="mt-2 text-3xl font-bold text-gray-600">{casosCerrados}</p>
            </div>
          </div>
        </div>

        {/* Estadísticas Financieras */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas Financieras</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Monto Total Acordado</h3>
              <p className="mt-2 text-2xl font-bold text-blue-600">S/ {montoTotalAcordado.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Monto Total Cobrado</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">S/ {montoTotalCobrado.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Monto Pendiente</h3>
              <p className="mt-2 text-2xl font-bold text-orange-600">S/ {montoPendiente.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Cobrado Este Mes</h3>
              <p className="mt-2 text-2xl font-bold text-purple-600">S/ {totalCobradoEsteMes.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{pagosEsteMes.length} pagos</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Casos por Tipo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Casos por Tipo</h2>
            <div className="space-y-3">
              {Object.entries(casosPorTipo).map(([tipo, cantidad]) => (
                <div key={tipo} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{tipo}</span>
                      <span className="text-sm text-gray-500">{cantidad} casos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${totalCasos > 0 ? ((cantidad as number) / totalCasos) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Casos por Forma de Pago */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Casos por Forma de Pago</h2>
            <div className="space-y-3">
              {Object.entries(casosPorFormaPago).map(([forma, cantidad]) => (
                <div key={forma} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{forma}</span>
                      <span className="text-sm text-gray-500">{cantidad} casos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${totalCasos > 0 ? ((cantidad as number) / totalCasos) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Casos con Mayor Pendiente */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Casos con Mayor Pendiente de Cobro</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobrado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Cobrado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {casos
                  ?.filter(c => (c.monto_total || 0) - (c.monto_cobrado || 0) > 0)
                  .sort((a, b) => ((b.monto_total || 0) - (b.monto_cobrado || 0)) - ((a.monto_total || 0) - (a.monto_cobrado || 0)))
                  .slice(0, 10)
                  .map((caso) => {
                    const pendiente = (caso.monto_total || 0) - (caso.monto_cobrado || 0)
                    const porcentajeCobrado = caso.monto_total > 0 ? (caso.monto_cobrado / caso.monto_total) * 100 : 0
                    return (
                      <tr key={caso.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {caso.codigo_estimado}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {caso.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          S/ {caso.monto_total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          S/ {caso.monto_cobrado?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                          S/ {pendiente.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${porcentajeCobrado}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{Math.round(porcentajeCobrado)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
