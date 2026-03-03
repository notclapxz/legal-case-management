'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Split from 'react-split'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { AgendaDia } from '@/lib/types/database'
import AgendaSidebar from './AgendaSidebar'
import AgendaDayList from './AgendaDayList'
import AgendaEditor from './AgendaEditor'

interface AgendaMonthViewProps {
  mes: number
  anio: number
}

export default function AgendaMonthView({ mes, anio }: AgendaMonthViewProps) {
  return (
    <Suspense fallback={<AgendaMonthViewSkeleton />}>
      <AgendaMonthViewContent mes={mes} anio={anio} />
    </Suspense>
  )
}

function AgendaMonthViewSkeleton() {
  return (
    <div className="h-screen bg-[#2d2d2d] flex items-center justify-center">
      <p className="text-gray-400">Cargando agenda...</p>
    </div>
  )
}

function AgendaMonthViewContent({ mes, anio }: AgendaMonthViewProps) {
  const searchParams = useSearchParams()
  const diaParam = searchParams.get('dia')
  const diaInicial = diaParam ? parseInt(diaParam) : new Date().getDate()

  const supabase = createClient()
  const [agendaDias, setAgendaDias] = useState<AgendaDia[]>([])
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(diaInicial)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [vistaMovil, setVistaMovil] = useState<'lista' | 'editor'>('lista')

  // Detectar si es móvil/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024) // tablets son < 1024px
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Función para actualizar un día específico sin recargar todo
  const handleUpdateDia = useCallback((fecha: string, contenido: string) => {
    setAgendaDias(prev => {
      const index = prev.findIndex(d => d.fecha === fecha)
      if (index >= 0) {
        // Actualizar existente
        const updated = [...prev]
        updated[index] = { ...updated[index], contenido, updated_at: new Date().toISOString() }
        return updated
      } else {
        // Agregar nuevo
        return [...prev, {
          id: crypto.randomUUID(),
          fecha,
          contenido,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null
        }]
      }
    })
  }, [])
  
  // Función para seleccionar día y refrescar datos
  const handleSelectDay = useCallback((dia: number) => {
    setDiaSeleccionado(dia)
    setRefreshKey(prev => prev + 1) // Forzar recarga al cambiar de día
  }, [])

  // Cargar días del mes
  const cargarAgendaDias = useCallback(async () => {
    try {
      const mesStr = String(mes + 1).padStart(2, '0')
      const primerDia = `${anio}-${mesStr}-01`
      
      // Calcular el primer día del siguiente mes
      const siguienteMes = mes === 11 ? 0 : mes + 1
      const siguienteAnio = mes === 11 ? anio + 1 : anio
      const siguienteMesStr = String(siguienteMes + 1).padStart(2, '0')
      const primerDiaSiguienteMes = `${siguienteAnio}-${siguienteMesStr}-01`
      
      const { data, error } = await supabase
        .from('agenda_dias')
        .select('*')
        .gte('fecha', primerDia)
        .lt('fecha', primerDiaSiguienteMes)
        .order('fecha', { ascending: true })

      if (error) {
        logError('AgendaMonthView.cargarAgendaDias', error)
        throw error
      }

      setAgendaDias(data || [])
    } catch (error) {
      logError('AgendaMonthView.cargarAgendaDias', error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, anio, refreshKey])

  useEffect(() => {
    cargarAgendaDias()
  }, [cargarAgendaDias])

  // Obtener nota del día seleccionado
  const fechaSeleccionada = diaSeleccionado !== null
    ? `${anio}-${String(mes + 1).padStart(2, '0')}-${String(diaSeleccionado).padStart(2, '0')}`
    : null

  const agendaDiaSeleccionado = agendaDias.find(dia => dia.fecha === fechaSeleccionada)

  // Vista mobile/tablet
  if (isMobile) {
    const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    return (
      <div className="h-screen flex flex-col bg-[#2d2d2d] overflow-hidden">
        {/* Top bar con navegación */}
        <div className="h-16 bg-[#2d2d2d] border-b border-[#1f1f1f] flex items-center px-4">
          {vistaMovil === 'lista' && (
            <button
              onClick={() => window.location.href = '/dashboard/agenda'}
              className="p-3 hover:bg-[#3a3a3a] rounded-lg mr-3"
              title="Volver al calendario"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          {vistaMovil === 'editor' && (
            <button
              onClick={() => setVistaMovil('lista')}
              className="p-3 hover:bg-[#3a3a3a] rounded-lg mr-3"
              title="Volver a lista de días"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex-1">
            {vistaMovil === 'lista' && (
              <div>
                <h1 className="text-lg font-bold text-white">{MESES[mes]} {anio}</h1>
                <p className="text-xs text-gray-400">Selecciona un día</p>
              </div>
            )}
            {vistaMovil === 'editor' && (
              <div>
                <h1 className="text-lg font-bold text-white">Día {diaSeleccionado}</h1>
                <p className="text-xs text-gray-400">{MESES[mes]} {anio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contenido según vista */}
        <div className="flex-1 overflow-hidden">
          {vistaMovil === 'lista' && (
            <AgendaDayList
              mes={mes}
              anio={anio}
              diaSeleccionado={diaSeleccionado}
              agendaDias={agendaDias}
              onSelectDay={(dia) => {
                handleSelectDay(dia)
                setVistaMovil('editor')
              }}
            />
          )}
          {vistaMovil === 'editor' && diaSeleccionado !== null && fechaSeleccionada && (
            <AgendaEditor
              key={fechaSeleccionada}
              fecha={fechaSeleccionada}
              diaSeleccionado={diaSeleccionado}
              mes={mes}
              anio={anio}
              agendaDia={agendaDiaSeleccionado || null}
              onContentChange={handleUpdateDia}
            />
          )}
        </div>
      </div>
    )
  }

  // Vista desktop (original)
  return (
    <div className="h-screen flex flex-col bg-[#2d2d2d] overflow-hidden">
      {/* Top bar */}
      <div className="h-9 bg-[#2d2d2d] border-b border-[#1f1f1f] flex items-center px-3">
        <div className="flex-1 text-center">
          <span className="text-gray-500 text-xs">Agenda Personal</span>
        </div>
      </div>

      {/* Layout de 3 columnas con paneles redimensionables */}
      <div className="flex-1 overflow-hidden">
        <Split
          sizes={[12, 18, 70]}
          minSize={[140, 200, 400]}
          gutterSize={4}
          className="flex h-full"
          gutterStyle={() => ({
            backgroundColor: '#1a1a1a',
            cursor: 'col-resize',
          })}
        >
          {/* Panel 1: Sidebar */}
          <div className="h-full overflow-hidden">
            <AgendaSidebar mes={mes} anio={anio} />
          </div>

          {/* Panel 2: Lista de días */}
          <div className="h-full overflow-hidden">
            <AgendaDayList
              mes={mes}
              anio={anio}
              diaSeleccionado={diaSeleccionado}
              agendaDias={agendaDias}
              onSelectDay={handleSelectDay}
            />
          </div>

           {/* Panel 3: Editor */}
           <div className="h-full overflow-hidden">
              {diaSeleccionado !== null && fechaSeleccionada ? (
              <AgendaEditor
                key={fechaSeleccionada}
                fecha={fechaSeleccionada}
                diaSeleccionado={diaSeleccionado}
                mes={mes}
                anio={anio}
                agendaDia={agendaDiaSeleccionado || null}
                onContentChange={handleUpdateDia}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>Selecciona un día</p>
              </div>
            )}
          </div>
        </Split>
      </div>

      {/* Estilos personalizados */}
      <style jsx global>{`
        /* Estilos para react-split */
        .gutter {
          background-color: #1a1a1a;
          background-repeat: no-repeat;
          background-position: 50%;
        }

        .gutter:hover {
          background-color: #4a90e2;
        }

        .gutter.gutter-horizontal {
          cursor: col-resize;
        }

        /* Scrollbar personalizado */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background: #2d2d2d;
        }

        ::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4d4d4d;
        }
      `}</style>
    </div>
  )
}
