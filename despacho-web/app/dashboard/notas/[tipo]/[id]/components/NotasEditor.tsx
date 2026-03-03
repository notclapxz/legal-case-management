'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { Nota } from '@/lib/types/database'
import RichTextEditor from './RichTextEditor'

interface NotasEditorProps {
  nota: Nota | null
  tipo: 'caso' | 'carpeta'
  id: string
  onNoteChange: (notaId: string, updates: Partial<Nota>) => void
  onDelete: (notaId: string) => void
}

export default function NotasEditor({ nota, tipo, id, onNoteChange, onDelete }: NotasEditorProps) {

  const supabase = createClient()
  const [contenido, setContenido] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ultimaEdicion, setUltimaEdicion] = useState<Date | null>(null)

  // Referencias para guardar el contenido más reciente
  const contenidoRef = useRef('')
  const notaIdRef = useRef<string | null>(null)

  // Helper: Extraer texto plano del HTML (sin tags) - solo en cliente
  const getPlainText = (html: string): string => {
    if (typeof window === 'undefined') {
      // En servidor, hacer un simple strip de tags HTML con regex
      return html
        .replace(/<[^>]*>/g, '') // Remover tags HTML
        .replace(/&nbsp;/g, ' ') // Reemplazar nbsp
        .replace(/&amp;/g, '&')  // Reemplazar &
        .replace(/&lt;/g, '<')   // Reemplazar <
        .replace(/&gt;/g, '>')   // Reemplazar >
        .trim()
    }
    
    // En cliente, usar DOM API
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  useEffect(() => {
    // Guardar la nota anterior antes de cambiar (solo si existe y tiene ID válido)
    const guardarNotaAnterior = async () => {
      if (notaIdRef.current && notaIdRef.current !== '' && contenidoRef.current !== nota?.contenido) {
        // Verificar que la nota aún existe antes de guardar (maybeSingle no lanza error si no existe)
        const { data: notaExiste, error: errorExiste } = await supabase
          .from('notas')
          .select('id')
          .eq('id', notaIdRef.current)
          .maybeSingle()
        
        if (errorExiste) {
          logError('NotasEditor.guardarAnterior', errorExiste)
          return
        }
        
        if (notaExiste) {
          const { error } = await supabase
            .from('notas')
            .update({ contenido: contenidoRef.current })
            .eq('id', notaIdRef.current)
          
          if (error) {
            logError('NotasEditor.guardarAnterior', error)
          }
        }
      }
    }

    guardarNotaAnterior()

    if (nota) {
      setContenido(nota.contenido || '')
      contenidoRef.current = nota.contenido || ''
      notaIdRef.current = nota.id
    } else {
      setContenido('')
      contenidoRef.current = ''
      notaIdRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nota?.id])

  // Actualizar la lista instantáneamente cuando cambia el contenido
  const handleContenidoChange = (nuevoContenido: string) => {
    setContenido(nuevoContenido)
    contenidoRef.current = nuevoContenido
    setUltimaEdicion(new Date())
    if (nota) {
      onNoteChange(nota.id, { contenido: nuevoContenido })
    }
  }

  // Auto-save con debounce optimizado:
  // - 500ms para typing (suave, sin lag visual)
  // - Solo guarda cuando realmente hay cambios
  useEffect(() => {
    // Validar que la nota existe y tiene un ID válido (UUID)
    if (!nota || !nota.id || nota.id === '') return

    const timeoutId = setTimeout(async () => {
      await guardarNota()
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenido])

  // Función para guardar inmediatamente
  const guardarInmediato = async () => {
    // Validar que hay un ID válido (no vacío)
    if (notaIdRef.current && notaIdRef.current !== '' && contenidoRef.current) {
      // Verificar que la nota existe antes de guardar (maybeSingle no lanza error si no existe)
      const { data: notaExiste } = await supabase
        .from('notas')
        .select('id')
        .eq('id', notaIdRef.current)
        .maybeSingle()
      
      if (notaExiste) {
        const { error } = await supabase
          .from('notas')
          .update({ contenido: contenidoRef.current })
          .eq('id', notaIdRef.current)

        if (error) {
          logError('NotasEditor.guardarInmediato', error)
        }
      }
    }
  }

  // CAPA DE SEGURIDAD FINAL: Guardar cuando el usuario navega fuera o cierra
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (notaIdRef.current && notaIdRef.current !== '' && contenidoRef.current) {
        // Guardar síncronamente usando el cliente de Supabase
        // NO usar keepalive porque getSession() es async - simplemente guardar directo
        supabase
          .from('notas')
          .update({ contenido: contenidoRef.current })
          .eq('id', notaIdRef.current)
      }
    }

    const handleVisibilityChange = async () => {
      // Guardar cuando el usuario cambia de tab (solo si hay ID válido)
      if (document.visibilityState === 'hidden' && notaIdRef.current && notaIdRef.current !== '' && contenidoRef.current) {
        const { data: notaExiste } = await supabase
          .from('notas')
          .select('id')
          .eq('id', notaIdRef.current)
          .maybeSingle()
        
        if (notaExiste) {
          await supabase
            .from('notas')
            .update({ contenido: contenidoRef.current })
            .eq('id', notaIdRef.current)
        }
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Guardar cuando el componente se desmonte (cambio de nota)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      
      // Guardar cuando el componente se desmonte (cambio de nota, solo si hay ID válido)
      if (notaIdRef.current && notaIdRef.current !== '' && contenidoRef.current) {
        // Guardar síncronamente (sin await)
        supabase
          .from('notas')
          .update({ contenido: contenidoRef.current })
          .eq('id', notaIdRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const guardarNota = async () => {
    // Validar que la nota existe y tiene un ID válido (UUID)
    if (!nota || !nota.id || nota.id === '') return

    setGuardando(true)
    try {
      const { error } = await supabase
        .from('notas')
        .update({
          contenido: contenido,
        })
        .eq('id', nota.id)
        .select()

      if (error) {
        throw error
      }

      onNoteChange(nota.id, { contenido })
    } catch (error) {
      logError('NotasEditor.guardarNota', error)
    } finally {
      setGuardando(false)
    }
  }

  if (!nota) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">Selecciona una nota</p>
          <p className="text-gray-400 text-sm mt-1">o crea una nueva para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="h-10 bg-[#2a2a2a] border-b border-[#1f1f1f] flex items-center justify-between px-3">
        <div className="flex items-center gap-1.5">
          {guardando && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded transition-colors"
            title="Favorito"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/10 rounded transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="flex-1 overflow-hidden">
        <RichTextEditor
          contenido={contenido}
          onChange={handleContenidoChange}
          onBlur={guardarInmediato}
          casoId={tipo === 'caso' ? id : ''}
        />
      </div>

      {/* Footer con info */}
      <div className="h-7 bg-[#f5f5f5] border-t border-gray-200 flex items-center justify-between px-3 text-xs text-gray-500">
        <div className="flex items-center gap-3">
          <span>{getPlainText(contenido).length} caracteres</span>
          <span>{getPlainText(contenido).split(/\s+/).filter(Boolean).length} palabras</span>
          {guardando && (
            <span className="flex items-center gap-1.5 text-blue-600">
              <svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>
            <span className="text-gray-400">Creado:</span>{' '}
            {nota.created_at ? new Date(nota.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) : 'Sin fecha'}
          </span>
          {ultimaEdicion && (
            <span>
              <span className="text-gray-400">Editado:</span>{' '}
              {ultimaEdicion.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-[#2d2d2d] rounded-lg shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-3">Eliminar nota</h3>
            <p className="text-gray-300 mb-6">¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (nota) {
                    onDelete(nota.id)
                    setShowDeleteModal(false)
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
