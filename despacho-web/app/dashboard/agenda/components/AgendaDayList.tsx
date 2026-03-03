'use client'

import type { AgendaDia } from '@/lib/types/database'
import { useMemo } from 'react'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface PreviewLine {
  texto: string
  tachado: boolean
}

interface AgendaDayListProps {
  mes: number
  anio: number
  diaSeleccionado: number | null
  agendaDias: AgendaDia[]
  onSelectDay: (dia: number) => void
}

// Helper para extraer preview de actividades (max 2 líneas)
function extractPreview(html: string | null | undefined): PreviewLine[] {
  if (!html || html.trim() === '' || html === '<p></p>') return []
  
  if (typeof window === 'undefined') {
    // Server-side: regex simple
    return html.replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim()).slice(0, 2).map(texto => ({ texto, tachado: false }))
  }
  
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    const lineas: PreviewLine[] = []
    
    // Procesar cada nodo hijo del contenedor
    const procesarNodo = (nodo: Node) => {
      if (lineas.length >= 2) return // Máximo 2 líneas
      
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
            if (lineas.length >= 2) return
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
            if (lineas.length >= 2) return
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
    
    // Truncar líneas largas
    return lineas.slice(0, 2).map(line => ({
      texto: line.texto.length > 20 ? line.texto.substring(0, 20) + '...' : line.texto,
      tachado: line.tachado
    }))
  } catch {
    // Fallback
    return html.replace(/<[^>]*>/g, '').split('\n').filter(l => l.trim()).slice(0, 2).map(texto => ({ texto, tachado: false }))
  }
}

export default function AgendaDayList({
  mes,
  anio,
  diaSeleccionado,
  agendaDias,
  onSelectDay,
}: AgendaDayListProps) {
  // Parsear contenido y crear mapa de previews
  const agendaPorDia = useMemo(() => {
    const mapa = new Map<number, PreviewLine[]>()
    
    agendaDias.forEach(dia => {
      const fecha = new Date(dia.fecha + 'T00:00:00')
      const diaNumero = fecha.getDate()
      
      if (dia.contenido) {
        const preview = extractPreview(dia.contenido)
        if (preview.length > 0) {
          mapa.set(diaNumero, preview)
        }
      }
    })
    
    return mapa
  }, [agendaDias])

  // Obtener total de días del mes
  const totalDiasMes = new Date(anio, mes + 1, 0).getDate()

  return (
    <div className="h-full bg-[#2d2d2d] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#1f1f1f]">
        <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Días del Mes
        </h2>
      </div>

      {/* Lista de días */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: totalDiasMes }, (_, index) => {
            const dia = index + 1
            const preview = agendaPorDia.get(dia) || []
            const tieneContenido = preview.length > 0
            const seleccionado = dia === diaSeleccionado
            const fecha = new Date(anio, mes, dia)
            const diaSemana = DIAS_SEMANA[fecha.getDay()]

            return (
              <button
                key={dia}
                onClick={() => onSelectDay(dia)}
                className={`
                  flex flex-col items-start justify-start p-2 rounded-lg
                  transition-all duration-200 min-h-[60px]
                  ${seleccionado
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#1f1f1f] text-gray-300 hover:bg-[#2a2a2a]'
                  }
                `}
              >
                {/* Header del día */}
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-sm font-semibold">
                    {String(dia).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-gray-400">
                    {diaSemana}
                  </span>
                </div>

                {/* Preview de actividades */}
                {tieneContenido && (
                  <div className="w-full space-y-0.5">
                    {preview.map((line, idx) => (
                      <div 
                        key={idx}
                        className={`text-xs truncate w-full text-left ${
                          seleccionado ? 'text-blue-100' : 'text-gray-400'
                        } ${line.tachado ? 'line-through opacity-60' : ''}`}
                      >
                        {line.texto}
                      </div>
                    ))}
                  </div>
                )}

                {/* Indicador de contenido visual si no hay preview */}
                {!tieneContenido && agendaDias.some(d => {
                  const f = new Date(d.fecha + 'T00:00:00')
                  return f.getDate() === dia && d.contenido && d.contenido.trim() !== '' && d.contenido !== '<p></p>'
                }) && (
                  <span
                    className={`
                      mt-1 w-1.5 h-1.5 rounded-full
                      ${seleccionado ? 'bg-white' : 'bg-[#3b82f6]'}
                    `}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
