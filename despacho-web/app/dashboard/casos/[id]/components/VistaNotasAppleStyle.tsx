'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/app/dashboard/components/DashboardLayoutWrapper'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { Nota } from '@/lib/types/database'

interface VistaNotasAppleStyleProps {
  casoId: string
  notas: Nota[]
}

export default function VistaNotasAppleStyle({ casoId, notas }: VistaNotasAppleStyleProps) {
  const router = useRouter()
  const supabase = createClient()
  const { collapseSidebar } = useSidebar()

  const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')

  // Form data para editar/crear nota
  const [formData, setFormData] = useState({
    contenido: '',
    categoria: 'General',
    prioridad: 'Media',
    fecha_recordatorio: '',
  })

  // Filtrar notas
  const notasFiltradas = notas.filter((nota) => {
    if (busqueda && !nota.contenido.toLowerCase().includes(busqueda.toLowerCase())) {
      return false
    }
    if (filtroCategoria !== 'todas' && nota.categoria !== filtroCategoria) {
      return false
    }
    return true
  })

  // Agrupar notas por fecha
  const agruparPorFecha = (notas: Nota[]) => {
    const ahora = new Date()
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)

    const grupos: { [key: string]: Nota[] } = {
      'Últimos 7 días': [],
      'Últimos 30 días': [],
      'Anteriores': [],
    }

    notas.forEach((nota) => {
      if (!nota.created_at) {
        grupos['Anteriores'].push(nota)
        return
      }
      const fechaNota = new Date(nota.created_at)
      if (fechaNota >= hace7Dias) {
        grupos['Últimos 7 días'].push(nota)
      } else if (fechaNota >= hace30Dias) {
        grupos['Últimos 30 días'].push(nota)
      } else {
        grupos['Anteriores'].push(nota)
      }
    })

    return grupos
  }

  const gruposNotas = agruparPorFecha(notasFiltradas)

  const handleNuevanota = () => {
    collapseSidebar()
    setModoEdicion(true)
    setNotaSeleccionada(null)
    setFormData({
      contenido: '',
      categoria: 'General',
      prioridad: 'Media',
      fecha_recordatorio: '',
    })
  }

  const handleSeleccionarNota = (nota: Nota) => {
    setNotaSeleccionada(nota)
    setModoEdicion(false)
    setFormData({
      contenido: nota.contenido,
      categoria: nota.categoria || 'General',
      prioridad: nota.prioridad || 'Media',
      fecha_recordatorio: nota.fecha_recordatorio ? new Date(nota.fecha_recordatorio).toISOString().slice(0, 16) : '',
    })
  }

  const handleEditarNota = () => {
    setModoEdicion(true)
  }

  const handleGuardar = async () => {
    try {
      if (notaSeleccionada) {
        // Editar nota existente
        const { error } = await supabase
          .from('notas')
          .update({
            contenido: formData.contenido,
            categoria: formData.categoria,
            prioridad: formData.prioridad,
            fecha_recordatorio: formData.fecha_recordatorio || null,
          })
          .eq('id', notaSeleccionada.id)

        if (error) throw error
      } else {
        // Crear nueva nota
        const { error } = await supabase
          .from('notas')
          .insert([{
            caso_id: casoId,
            contenido: formData.contenido,
            categoria: formData.categoria,
            prioridad: formData.prioridad,
            fecha_recordatorio: formData.fecha_recordatorio || null,
            completado: false,
          }])

        if (error) throw error
      }

      router.refresh()
      setModoEdicion(false)
    } catch (error) {
      logError('VistaNotasAppleStyle.guardar', error)
      alert('Error al guardar la nota')
    }
  }

  const handleEliminar = async () => {
    if (!notaSeleccionada) return

    if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      try {
        const { error } = await supabase
          .from('notas')
          .delete()
          .eq('id', notaSeleccionada.id)

        if (error) throw error

        setNotaSeleccionada(null)
        setModoEdicion(false)
        router.refresh()
      } catch (error) {
        logError('VistaNotasAppleStyle.eliminar', error)
        alert('Error al eliminar la nota')
      }
    }
  }

  const handleToggleCompletado = async () => {
    if (!notaSeleccionada) return

    try {
      const { error } = await supabase
        .from('notas')
        .update({ completado: !notaSeleccionada.completado })
        .eq('id', notaSeleccionada.id)

      if (error) throw error

      router.refresh()
    } catch (error) {
      logError('VistaNotasAppleStyle.actualizar', error)
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta':
        return 'text-red-600'
      case 'Media':
        return 'text-yellow-600'
      case 'Baja':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="flex h-[calc(100vh-140px)] bg-gray-50">
      {/* Columna 1: Lista de Notas */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header con título y botón nueva nota */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Notas & Recordatorios</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/dashboard/casos/${casoId}/notas`)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Modo inmersivo"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <button
                onClick={handleNuevanota}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Nueva Nota"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Búsqueda */}
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en notas"
            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
          />

          {/* Filtro Categoría */}
          <div className="mt-3">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todas">Todas las categorías</option>
              <option value="Procesal">Procesal</option>
              <option value="Cliente">Cliente</option>
              <option value="Interno">Interno</option>
              <option value="General">General</option>
            </select>
          </div>

          <p className="text-xs text-gray-500 mt-2">{notasFiltradas.length} notas</p>
        </div>

        {/* Lista de notas con grupos */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(gruposNotas).map(([grupo, notasGrupo]) => {
            if (notasGrupo.length === 0) return null

            return (
              <div key={grupo}>
                <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                  {grupo}
                </h3>
                <div className="divide-y divide-gray-100">
                  {notasGrupo.map((nota) => (
                    <button
                      key={nota.id}
                      onClick={() => handleSeleccionarNota(nota)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        notaSeleccionada?.id === nota.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {nota.contenido.split('\n')[0] || 'Sin título'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {nota.contenido.split('\n').slice(1).join(' ') || 'Sin contenido adicional'}
                          </p>
                        </div>
                        {nota.prioridad && (
                          <span className={`ml-2 text-xs ${getPrioridadColor(nota.prioridad)}`}>
                            {nota.prioridad === 'Alta' ? '🔴' : nota.prioridad === 'Media' ? '🟡' : '🟢'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {nota.created_at ? new Date(nota.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          }) : 'Sin fecha'}
                        </span>
                        <span className="text-xs text-gray-400">{nota.categoria}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {notasFiltradas.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">No hay notas</p>
              <p className="text-xs text-gray-400 mt-1">Crea una nueva nota para comenzar</p>
            </div>
          )}
        </div>
      </div>

      {/* Columna 2: Contenido de la Nota */}
      <div className="flex-1 flex flex-col bg-white">
        {notaSeleccionada || modoEdicion ? (
          <>
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!modoEdicion && notaSeleccionada && (
                  <>
                    <button
                      onClick={handleEditarNota}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleToggleCompletado}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={notaSeleccionada.completado ? 'Marcar como pendiente' : 'Marcar como completada'}
                    >
                      {notaSeleccionada.completado ? (
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={handleEliminar}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
                {modoEdicion && (
                  <>
                    <button
                      onClick={handleGuardar}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setModoEdicion(false)
                        if (!notaSeleccionada) {
                          setFormData({ contenido: '', categoria: 'General', prioridad: 'Media', fecha_recordatorio: '' })
                        }
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
              {notaSeleccionada && (
                <span className="text-xs text-gray-500">
                  {notaSeleccionada.created_at ? new Date(notaSeleccionada.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'Sin fecha'}
                </span>
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {modoEdicion ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Contenido */}
                  <div>
                    <textarea
                      value={formData.contenido}
                      onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                      placeholder="Escribe el contenido de la nota..."
                      className="w-full min-h-[400px] px-0 py-2 text-gray-900 text-lg border-0 focus:outline-none focus:ring-0 resize-none placeholder:text-gray-400"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#000000' }}
                    />
                  </div>

                  {/* Metadatos */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                      <select
                        value={formData.categoria}
                        onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="General">General</option>
                        <option value="Procesal">Procesal</option>
                        <option value="Cliente">Cliente</option>
                        <option value="Interno">Interno</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                      <select
                        value={formData.prioridad}
                        onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Baja">Baja</option>
                        <option value="Media">Media</option>
                        <option value="Alta">Alta</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Recordatorio (Opcional)</label>
                      <input
                        type="datetime-local"
                        value={formData.fecha_recordatorio}
                        onChange={(e) => setFormData({ ...formData, fecha_recordatorio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {notaSeleccionada && (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          notaSeleccionada.categoria === 'Urgente' ? 'bg-red-100 text-red-800' :
                          notaSeleccionada.categoria === 'Legal' ? 'bg-blue-100 text-blue-800' :
                          notaSeleccionada.categoria === 'Administrativa' ? 'bg-purple-100 text-purple-800' :
                          notaSeleccionada.categoria === 'Financiera' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notaSeleccionada.categoria || 'General'}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          notaSeleccionada.prioridad === 'Alta' ? 'bg-red-100 text-red-800' :
                          notaSeleccionada.prioridad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {notaSeleccionada.prioridad}
                        </span>
                        {notaSeleccionada.fecha_recordatorio && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {notaSeleccionada.fecha_recordatorio ? new Date(notaSeleccionada.fecha_recordatorio).toLocaleDateString('es-ES') : 'Sin fecha'}
                          </span>
                        )}
                      </div>
                      <div className={`prose max-w-none ${notaSeleccionada.completado ? 'line-through opacity-60' : ''}`}>
                        <p className="text-lg text-gray-900 whitespace-pre-wrap" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                          {notaSeleccionada.contenido}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">Selecciona una nota o crea una nueva</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
