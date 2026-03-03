'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'

interface AlertaUrgente {
  id: string
  titulo: string
  cliente: string
  codigo_caso: string
  dias_restantes: number
  tipo_evento: string
  fecha_evento: string
  descripcion: string
}

export default function SistemaAlertas() {
  const [alertas, setAlertas] = useState<AlertaUrgente[]>([])
  const [cargando, setCargando] = useState(true)
  const supabase = createClient()

  const cargarAlertas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('eventos_proximos')
        .select('*')
        .lte('dias_restantes', 7) // Solo eventos próximos 7 días
        .order('dias_restantes', { ascending: true })
        .limit(10)

      if (error) throw error
      setAlertas(data || [])
    } catch (error) {
      logError('SistemaAlertas.cargarAlertas', error)
    } finally {
      setCargando(false)
    }
  }, [supabase])

  useEffect(() => {
    cargarAlertas()
    
    // Refrescar cada 30 segundos
    const interval = setInterval(cargarAlertas, 30000)
    return () => clearInterval(interval)
  }, [cargarAlertas])

  const getAlertaConfig = (dias: number) => {
    if (dias === 0) return {
      color: 'bg-red-600',
      textColor: 'text-white',
      borderColor: 'border-red-800',
      icon: '🔴',
      animacion: 'animate-pulse',
      prioridad: 'CRÍTICA',
      descripcion: 'HOY - No puedes perderlo'
    }
    if (dias <= 3) return {
      color: 'bg-orange-500',
      textColor: 'text-white',
      borderColor: 'border-orange-700',
      icon: '🟠',
      animacion: 'animate-bounce',
      prioridad: 'URGENTE',
      descripcion: `En ${dias} día${dias > 1 ? 's' : ''}`
    }
    return {
      color: 'bg-yellow-400',
      textColor: 'text-gray-900',
      borderColor: 'border-yellow-600',
      icon: '🟡',
      animacion: '',
      prioridad: 'PRÓXIMO',
      descripcion: `En ${dias} días`
    }
  }

  const reproducirSonido = (tipo: string) => {
    // Crear sonido de alerta usando Web Audio API
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioContext = new AudioContextClass()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    if (tipo === 'crítico') {
      // Sonido de emergencia (3 beeps rápidos)
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.3
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.1)
      
      setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.value = 800
        gain2.gain.value = 0.3
        osc2.start()
        osc2.stop(audioContext.currentTime + 0.1)
      }, 150)
      
      setTimeout(() => {
        const osc3 = audioContext.createOscillator()
        const gain3 = audioContext.createGain()
        osc3.connect(gain3)
        gain3.connect(audioContext.destination)
        osc3.frequency.value = 800
        gain3.gain.value = 0.3
        osc3.start()
        osc3.stop(audioContext.currentTime + 0.1)
      }, 300)
    } else {
      // Sonido normal (1 beep)
      oscillator.frequency.value = 600
      gainNode.gain.value = 0.2
      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.2)
    }
  }

  if (cargando) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const alertasCriticas = alertas.filter(a => a.dias_restantes <= 3)

  if (alertasCriticas.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <span className="text-2xl mr-3">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-green-800">Sin alertas urgentes</h3>
            <p className="text-green-600">No hay eventos críticos en los próximos 3 días</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Alertas Críticas</h2>
        <div className="flex items-center gap-2">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            {alertasCriticas.length} {alertasCriticas.length === 1 ? 'urgente' : 'urgentes'}
          </span>
          <button 
            onClick={() => reproducirSonido('crítico')}
            className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors"
            title="Probar sonido de alerta"
          >
            🔔
          </button>
        </div>
      </div>

      {/* Alertas individuales */}
      <div className="space-y-3">
        {alertasCriticas.map((alerta) => {
          const config = getAlertaConfig(alerta.dias_restantes)
          
          return (
            <div
              key={alerta.id}
              className={`
                ${config.color} ${config.textColor} ${config.borderColor}
                border-2 rounded-lg p-4 shadow-lg transform transition-all duration-300
                hover:scale-105 hover:shadow-xl cursor-pointer
                ${config.animacion}
              `}
              onClick={() => {
                // Navegar al detalle del caso
                window.location.href = `/dashboard/casos/${alerta.id}`
                // Reproducir sonido al hacer click
                reproducirSonido(alerta.dias_restantes === 0 ? 'crítico' : 'normal')
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Prioridad e icono */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{config.icon}</span>
                    <span className="text-xs font-bold bg-white bg-opacity-20 px-2 py-1 rounded">
                      {config.prioridad}
                    </span>
                  </div>
                  
                  {/* Título y cliente */}
                  <h3 className="font-bold text-lg mb-1">{alerta.titulo}</h3>
                  <p className="text-sm opacity-90 mb-2">
                    {alerta.cliente} • {alerta.codigo_caso}
                  </p>
                  
                  {/* Descripción */}
                  <p className="text-sm opacity-80 mb-2">{alerta.descripcion}</p>
                  
                  {/* Fecha */}
                  <div className="flex items-center gap-2 text-xs">
                    <span>📅</span>
                    <span>
                      {new Date(alerta.fecha_evento).toLocaleDateString('es-PE', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                {/* Indicador de tiempo */}
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold">
                    {alerta.dias_restantes === 0 ? 'HOY' : `${alerta.dias_restantes}d`}
                  </div>
                  <div className="text-xs opacity-80">
                    {config.descripcion}
                  </div>
                </div>
              </div>
              
              {/* Barra de progreso de tiempo */}
              <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: alerta.dias_restantes === 0 ? '100%' : `${Math.max(10, (7 - alerta.dias_restantes) / 7 * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 mt-1">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Sistema de Alertas Activado</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>🔴 Rojo = Evento HOY (crítico)</li>
              <li>🟠 Naranja = 1-3 días (urgente)</li>
              <li>🟡 Amarillo = 4-7 días (próximo)</li>
              <li>Click en cualquier alerta para ver detalles del caso</li>
              <li>Las alertas se refrescan automáticamente cada 30 segundos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}