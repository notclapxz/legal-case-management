import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TakeNoteLayout from './components/TakeNoteLayout'

interface NotasPageProps {
  params: Promise<{
    tipo: 'caso' | 'carpeta'
    id: string
  }>
}

export default async function NotasPage({ params }: NotasPageProps) {
  const { tipo, id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Validar tipo
  if (tipo !== 'caso' && tipo !== 'carpeta') {
    redirect('/dashboard/casos')
  }

  if (tipo === 'caso') {
    // Obtener el caso
    const { data: caso, error: casoError } = await supabase
      .from('casos')
      .select('*')
      .eq('id', id)
      .single()

    if (casoError || !caso) {
      redirect('/dashboard/casos')
    }

    // Obtener notas del caso
    const { data: notas } = await supabase
      .from('notas')
      .select('*')
      .eq('caso_id', id)
      .is('carpeta_id', null)
      .order('created_at', { ascending: false })

    return (
      <TakeNoteLayout
        tipo="caso"
        id={id}
        entidad={caso}
        notas={notas || []}
      />
    )
  } else {
    // Obtener la carpeta
    const { data: carpeta, error: carpetaError } = await supabase
      .from('carpetas')
      .select('*')
      .eq('id', id)
      .single()

    if (carpetaError || !carpeta) {
      redirect('/dashboard/casos')
    }

    // Obtener notas de la carpeta
    const { data: notas } = await supabase
      .from('notas')
      .select('*')
      .eq('carpeta_id', id)
      .is('caso_id', null)
      .order('created_at', { ascending: false })

    return (
      <TakeNoteLayout
        tipo="carpeta"
        id={id}
        entidad={carpeta}
        notas={notas || []}
      />
    )
  }
}
