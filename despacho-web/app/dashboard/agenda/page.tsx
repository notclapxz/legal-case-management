'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import AgendaCalendar from './components/AgendaCalendar'
import type { AgendaDia } from '@/lib/types/database'

export default function AgendaPage() {
  const supabase = createClient()
  const [agendaDias, setAgendaDias] = useState<AgendaDia[]>([])
  const [loading, setLoading] = useState(true)

  const cargarAgendaDias = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('agenda_dias')
        .select('*')
        .order('fecha', { ascending: true })

      setAgendaDias(data || [])
    } catch (error) {
      logError('AgendaPage.cargarAgendaDias', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    cargarAgendaDias()
  }, [cargarAgendaDias])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando agenda...</p>
        </div>
      </div>
    )
  }

  return <AgendaCalendar agendaDias={agendaDias} />
}
