import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ContenedorTabs from './components/ContenedorTabs'

export default async function CasoDetallesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener el caso
  const { data: caso, error: casoError } = await supabase
    .from('casos')
    .select('*')
    .eq('id', id)
    .single()

  if (casoError || !caso) {
    redirect('/dashboard/casos')
  }

  // Obtener eventos del caso
  const { data: eventos } = await supabase
    .from('eventos')
    .select('*')
    .eq('caso_id', id)
    .order('fecha_evento', { ascending: false })

  // Obtener pagos del caso
  const { data: pagos } = await supabase
    .from('pagos')
    .select('*')
    .eq('caso_id', id)
    .order('fecha_pago', { ascending: false })

  // Obtener notas del caso
  const { data: notas } = await supabase
    .from('notas')
    .select('*')
    .eq('caso_id', id)
    .order('created_at', { ascending: false })

  // Obtener ubicación física si existe
  const { data: ubicacion } = await supabase
    .from('ubicaciones_fisicas')
    .select('*')
    .eq('codigo_caso', caso.codigo_estimado)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/dashboard/casos"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-2 inline-block"
              >
                ← Volver a Casos
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {caso.codigo_estimado} - {caso.cliente}
              </h1>
              <p className="text-gray-500 mt-1">{caso.tipo}</p>
            </div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              caso.estado === 'Activo' ? 'bg-green-100 text-green-800' :
              caso.estado === 'Pausado' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {caso.estado}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs y Contenido */}
      <ContenedorTabs
        caso={caso}
        eventos={eventos || []}
        pagos={pagos || []}
        notas={notas || []}
        ubicacion={ubicacion}
      />
    </div>
  )
}
