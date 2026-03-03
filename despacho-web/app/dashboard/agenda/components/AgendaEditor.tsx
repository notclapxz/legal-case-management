'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { AgendaDia } from '@/lib/types/database'
import AgendaRichEditor from './AgendaRichEditor'

interface AgendaEditorProps {
  fecha: string
  diaSeleccionado: number
  mes: number
  anio: number
  agendaDia: AgendaDia | null
  onContentChange: (fecha: string, contenido: string) => void
}

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function AgendaEditor({
  fecha,
  diaSeleccionado,
  mes,
  anio,
  agendaDia,
  onContentChange,
}: AgendaEditorProps) {
  const supabase = createClient()
  const [contenido, setContenido] = useState('<p></p>')
  const [guardando, setGuardando] = useState(false)
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null)
  const contenidoRef = useRef('<p></p>')
  const guardandoRef = useRef(false)

  // Cargar contenido cuando cambia agendaDia
  useEffect(() => {
    const nuevoContenido = agendaDia?.contenido || '<p></p>'
    setContenido(nuevoContenido)
    contenidoRef.current = nuevoContenido
  }, [agendaDia, fecha])

  // Manejar cambios en el contenido
  const handleContenidoChange = (nuevoContenido: string) => {
    setContenido(nuevoContenido)
    contenidoRef.current = nuevoContenido
    // Actualizar preview en tiempo real
    onContentChange(fecha, nuevoContenido)
  }

  // Auto-guardar con debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      await guardarContenido()
    }, 1000)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenido])

  const guardarContenido = async () => {
    // Evitar guardados concurrentes
    if (guardandoRef.current) return

    const contenidoAGuardar = contenidoRef.current
    guardandoRef.current = true
    setGuardando(true)
    
    try {
      const { error } = await supabase
        .from('agenda_dias')
        .upsert({
          fecha,
          contenido: contenidoAGuardar,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'fecha'
        })
        .select()

      if (error) throw error
      
      setUltimoGuardado(new Date())
    } catch (error) {
      logError('AgendaEditor.guardarContenido', error)
    } finally {
      guardandoRef.current = false
      setGuardando(false)
    }
  }

  const fechaObjeto = new Date(fecha + 'T00:00:00')
  const diaSemana = DIAS_SEMANA[fechaObjeto.getDay()]

  return (
    <div className="h-full bg-[#2d2d2d] flex flex-col">
      {/* Header del editor */}
      <div className="p-4 border-b border-[#1f1f1f]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {String(diaSeleccionado).padStart(2, '0')} - {MESES[mes]}
            </h2>
            <p className="text-sm text-gray-400">
              {diaSemana} {anio}
            </p>
          </div>
          <div className="text-right">
            {guardando ? (
              <span className="text-xs text-yellow-400 flex items-center gap-1.5">
                <svg className="animate-spin h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : ultimoGuardado ? (
              <span className="text-xs text-green-400">
                ✓ Guardado {ultimoGuardado.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="flex-1 overflow-hidden">
        <AgendaRichEditor
          contenido={contenido}
          onChange={handleContenidoChange}
          onBlur={guardarContenido}
        />
      </div>
    </div>
  )
}
