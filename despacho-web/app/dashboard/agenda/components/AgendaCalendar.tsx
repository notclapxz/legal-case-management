'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { AgendaDia } from '@/lib/types/database'

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface LineaContenido {
  texto: string
  tachado: boolean
}

/**
 * Helper para truncar texto a 1 línea con "..."
 */
function truncarTexto(texto: string, maxLength: number = 25): string {
  if (!texto) return ''
  if (texto.length <= maxLength) return texto
  return texto.substring(0, maxLength).trim() + '...'
}

/**
 * Helper para extraer líneas del contenido HTML respetando la estructura
 */
function obtenerLineasContenido(contenido: string | null | undefined): LineaContenido[] {
  if (!contenido) return []
  if (contenido.trim() === '' || contenido === '<p></p>') return []
  
  if (typeof window === 'undefined') {
    // Server-side: regex simple
    return contenido.replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim()).map(texto => ({ texto, tachado: false }))
  }
  
  try {
    const div = document.createElement('div')
    div.innerHTML = contenido
    const lineas: LineaContenido[] = []
    
    // Procesar cada nodo hijo del contenedor
    const procesarNodo = (nodo: Node) => {
      if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as HTMLElement
        
        // Párrafos normales
        if (elemento.tagName === 'P') {
          const texto = elemento.textContent?.trim()
          if (texto) lineas.push({ texto, tachado: false })
        }
        // Listas de tareas
        else if (elemento.tagName === 'UL' && elemento.getAttribute('data-type') === 'taskList') {
          const items = elemento.querySelectorAll('li')
          items.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]')
            const isChecked = checkbox?.hasAttribute('checked')
            const texto = item.textContent?.trim()
            if (texto) {
              lineas.push({
                texto: `${isChecked ? '☑' : '☐'} ${texto}`,
                tachado: !!isChecked
              })
            }
          })
        }
        // Listas normales
        else if (elemento.tagName === 'UL' || elemento.tagName === 'OL') {
          const items = elemento.querySelectorAll('li')
          items.forEach(item => {
            const texto = item.textContent?.trim()
            if (texto) lineas.push({ texto: `• ${texto}`, tachado: false })
          })
        }
        // Otros elementos: procesar hijos recursivamente
        else {
          elemento.childNodes.forEach(procesarNodo)
        }
      }
    }
    
    div.childNodes.forEach(procesarNodo)
    return lineas
  } catch {
    // Fallback
    return contenido.replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim()).map(texto => ({ texto, tachado: false }))
  }
}

/**
 * Helper para formatear fecha en formato DD-MM-YYYY
 */
function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, '0')
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const anio = fecha.getFullYear()
  return `${dia}-${mes}-${anio}`
}

interface AgendaCalendarProps {
  agendaDias: AgendaDia[]
}

export default function AgendaCalendar({ agendaDias }: AgendaCalendarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Obtener mes/año de query params o usar fecha actual
  const mesParam = searchParams.get('mes')
  const anioParam = searchParams.get('anio')
  
  const hoy = new Date()
  const [mesActual, setMesActual] = useState(mesParam ? parseInt(mesParam) : hoy.getMonth())
  const [anioActual, setAnioActual] = useState(anioParam ? parseInt(anioParam) : hoy.getFullYear())
  const [tooltipAbierto, setTooltipAbierto] = useState<string | null>(null)

  // Crear mapa de agenda por fecha para búsqueda rápida
  const agendaPorFecha = new Map<string, AgendaDia>()
  agendaDias.forEach(dia => {
    if (dia.fecha) {
      agendaPorFecha.set(dia.fecha, dia)
    }
  })

  // Obtener el primer día del mes y el último día
  const primerDiaMes = new Date(anioActual, mesActual, 1)
  const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0)
  
  // Ajustar al lunes (Día 0 = Domingo en JS, pero nosotros usamos Lunes como día 0)
  const diaSemanaInicio = primerDiaMes.getDay()
  const diaSemanaAjustado = diaSemanaInicio === 0 ? 6 : diaSemanaInicio - 1

  const totalDiasMes = ultimoDiaMes.getDate()
  const totalCeldas = Math.ceil((totalDiasMes + diaSemanaAjustado) / 7) * 7

  // Navegar al mes/anio
  const navegarMes = (delta: number) => {
    const nuevaFecha = new Date(anioActual, mesActual + delta, 1)
    setMesActual(nuevaFecha.getMonth())
    setAnioActual(nuevaFecha.getFullYear())
  }

  // Navegar a la vista de notas del mes (con día seleccionado)
  const irAVistaMes = (dia: number) => {
    const mesStr = String(mesActual + 1).padStart(2, '0')
    router.push(`/dashboard/agenda/${anioActual}/${mesStr}?dia=${dia}`)
  }

  // Verificar si es el día de hoy
  const esHoy = (dia: number) => {
    const fechaCalendario = new Date(anioActual, mesActual, dia)
    const fechaHoy = new Date()
    return (
      fechaCalendario.getDate() === fechaHoy.getDate() &&
      fechaCalendario.getMonth() === fechaHoy.getMonth() &&
      fechaCalendario.getFullYear() === fechaHoy.getFullYear()
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
              <p className="text-gray-500 mt-1">
                (Fecha de hoy) EJ. {formatearFecha(hoy)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-500">Fecha de hoy</p>
              <p className="text-lg font-semibold text-gray-900">{formatearFecha(hoy)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Controles de navegación del mes */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <button
              onClick={() => navegarMes(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mes anterior"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              {MESES[mesActual]} {anioActual}
            </h2>
            <button
              onClick={() => navegarMes(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Mes siguiente"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Encabezados de días de la semana */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="px-4 py-2 text-center text-sm font-medium text-gray-600">
                {dia}
              </div>
            ))}
          </div>

          {/* Grid del calendario */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCeldas }).map((_, index) => {
              const dia = index - diaSemanaAjustado + 1
              const esDiaValido = dia > 0 && dia <= totalDiasMes
              
              if (!esDiaValido) {
                return <div key={index} className="min-h-32 border-r border-b border-gray-100 bg-gray-50" />
              }

              const fechaStr = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
              const agendaDia = agendaPorFecha.get(fechaStr)
              const lineas = obtenerLineasContenido(agendaDia?.contenido)
              const hoyCheck = esHoy(dia)

              return (
                <button
                  key={index}
                  onClick={() => irAVistaMes(dia)}
                  className={`
                    min-h-32 border-r border-b border-gray-200 p-2 text-left
                    transition-all duration-200
                    ${hoyCheck ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}
                  `}
                >
                  {/* Número del día */}
                  <div className={`
                    font-semibold text-sm
                    ${hoyCheck ? 'bg-blue-600 text-white w-7 h-7 flex items-center justify-center rounded-full' : 'text-gray-900'}
                  `}>
                    {dia}
                  </div>

                  {/* Previsualización de notas */}
                  {lineas.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {lineas.slice(0, 2).map((linea, idx) => (
                        <div
                          key={idx}
                          className={`bg-gray-100 px-2 py-1 rounded text-xs text-gray-700 truncate ${
                            linea.tachado ? 'line-through opacity-60' : ''
                          }`}
                          title={linea.texto}
                        >
                          {truncarTexto(linea.texto, 25)}
                        </div>
                      ))}
                      {lineas.length > 2 && (
                        <div 
                          className="text-xs text-gray-500 hover:text-gray-700 text-center cursor-pointer relative"
                          title="Ver todas las actividades"
                          onClick={(e) => {
                            e.stopPropagation()
                            setTooltipAbierto(tooltipAbierto === fechaStr ? null : fechaStr)
                          }}
                        >
                          +{lineas.length - 2} más
                          {/* Tooltip con todas las líneas */}
                          {tooltipAbierto === fechaStr && (
                            <>
                              {/* Overlay para cerrar al clickear afuera */}
                              <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setTooltipAbierto(null)}
                              />
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
                                <div className="text-xs font-medium text-gray-500 mb-2">Todas las actividades:</div>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {lineas.map((linea, idx) => (
                                    <div 
                                      key={idx}
                                      className={`bg-gray-50 px-3 py-2 rounded text-xs text-gray-700 ${
                                        linea.tachado ? 'line-through opacity-60' : ''
                                      }`}
                                    >
                                      {linea.texto}
                                    </div>
                                  ))}
                                </div>
                                {/* Flecha del tooltip */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                  <div className="border-8 border-transparent border-t-white" style={{ marginTop: '-1px' }}></div>
                                  <div className="border-8 border-transparent border-t-gray-200 absolute top-0 left-1/2 transform -translate-x-1/2" style={{ marginTop: '1px' }}></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
