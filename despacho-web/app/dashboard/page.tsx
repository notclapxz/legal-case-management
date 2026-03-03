'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { logError } from '@/lib/utils/errors'
import type { Evento, Profile } from '@/lib/types/database'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalCasos, setTotalCasos] = useState(0)
  const [eventosProximos, setEventosProximos] = useState<Evento[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
         
        if (!user) {
          if (mounted) router.push('/login')
          return
        }

        // Solo cargar datos esenciales (columnas específicas para mejor performance)
        const [profileResult, casosResult, eventosResult] = await Promise.all([
          supabase.from('profiles').select('id, username, nombre_completo, rol').eq('id', user.id).single(),
          supabase.from('casos').select('id', { count: 'exact', head: false }).eq('estado', 'Activo'),
          supabase.from('eventos').select('id, caso_id, titulo, descripcion, fecha_evento, tipo, completado').gte('fecha_evento', new Date().toISOString()).eq('completado', false).order('fecha_evento', { ascending: true }).limit(10)
        ])

        if (!mounted) return

        setProfile(profileResult.data)
        setTotalCasos(casosResult.data?.length || 0)
        setEventosProximos(eventosResult.data || [])
        
      } catch (err) {
        if (!mounted) return
        logError('DashboardPage.loadData', err)
        setError('Error al cargar datos del dashboard.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const eventosHoy = eventosProximos?.filter(evento => {
    const eventDate = new Date(evento.fecha_evento).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  }) || []

  // Obtener saludo según hora
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Obtener fecha formateada
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date().toLocaleDateString('es-ES', options)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con saludo y perfil */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {getGreeting()}, {profile?.username || 'Usuario'}
              </h1>
              <p className="text-gray-600 mt-1">{getFormattedDate()}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-gray-800">
                  {profile?.nombre_completo || profile?.username || 'Usuario'}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {profile?.rol || 'Sin rol'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-600">
                {(profile?.nombre_completo || profile?.username || 'U').charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
            <p className="text-gray-600 text-sm font-medium mb-2">Casos Activos</p>
            <p className="text-4xl font-bold text-gray-800">{totalCasos}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium mb-2">Eventos Próximos</p>
            <p className="text-4xl font-bold text-blue-600">{eventosProximos?.length || 0}</p>
          </div>
        </div>

        {/* Acciones Rápidas - Cards grandes con gradientes sutiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dashboard/casos"
            className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-lg p-6 text-white transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Todos los Casos</h3>
              <span className="text-4xl">📂</span>
            </div>
            <p className="text-blue-100">{totalCasos} casos activos</p>
          </Link>

          <Link
            href="/dashboard/agenda"
            className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-lg shadow-lg p-6 text-white transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Agenda</h3>
              <span className="text-4xl">📅</span>
            </div>
            <p className="text-green-100">{eventosProximos?.length || 0} eventos próximos</p>
          </Link>

          <Link
            href="/dashboard/casos/nuevo"
            className="bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 rounded-lg shadow-lg p-6 text-white transition-all transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold">Nuevo Caso</h3>
              <span className="text-4xl">➕</span>
            </div>
            <p className="text-yellow-100">Crear expediente</p>
          </Link>
        </div>

        {/* Eventos de Hoy */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📢 Eventos de Hoy</h2>
          {eventosHoy.length > 0 ? (
            <div className="space-y-3">
              {eventosHoy.map((evento) => (
                <div key={evento.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        🏛️ {evento.descripcion}
                      </p>
                      <p className="text-sm text-gray-600">
                        ⏰ {new Date(evento.fecha_evento).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay eventos para hoy</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}