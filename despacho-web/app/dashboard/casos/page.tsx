import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CasosConCarpetas from './components/CasosConCarpetas'

export default async function CasosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Cargar TODOS los casos siempre (simple y directo)
  const [casosResult, carpetasResult] = await Promise.all([
    supabase
      .from('casos')
      .select('id, codigo_estimado, cliente, patrocinado, descripcion, expediente, tipo, estado, estado_caso, ubicacion_fisica, created_at, carpeta_id, usuarios_con_acceso')
      .order('created_at', { ascending: false }),
    supabase
      .from('carpetas')
      .select('*, usuarios_con_acceso')
      .order('orden', { ascending: true })
  ])

  const { data: casos, error: casosError } = casosResult
  const { data: carpetas, error: carpetasError } = carpetasResult

  if (casosError || carpetasError) {
    return (
      <div className="p-4 text-red-600">
        Error al cargar datos: {casosError?.message || carpetasError?.message}
      </div>
    )
  }

  return (
    <CasosConCarpetas 
      casosIniciales={casos || []} 
      carpetasIniciales={carpetas || []}
    />
  )
}
