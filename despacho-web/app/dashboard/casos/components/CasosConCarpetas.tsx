'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import { useModal } from '@/app/hooks/useModal'
import type { Caso, Carpeta, CarpetaConConteo } from '@/lib/types/database'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import SidebarCarpetas from './SidebarCarpetas'
import ModalCarpeta from './ModalCarpeta'
import CasosContenido from './CasosContenido'
import ModalConfirmacion from '@/app/components/ModalConfirmacion'

interface CasosConCarpetasProps {
  casosIniciales: Caso[]
  carpetasIniciales: Carpeta[]
}

export default function CasosConCarpetas({ casosIniciales, carpetasIniciales }: CasosConCarpetasProps) {
  const router = useRouter()
  const supabase = createClient()

  const [casos, setCasos] = useState<Caso[]>(casosIniciales)
  const [carpetas, setCarpetas] = useState<Carpeta[]>(carpetasIniciales)
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string | null>(null)
  
  // Modales usando useModal hook
  const modalCarpeta = useModal<Carpeta>()
  const modalEliminar = useModal<CarpetaConConteo>()
  
  // Estados para drag & drop
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [activeDragType, setActiveDragType] = useState<'caso' | 'carpeta' | null>(null)
  
  // Fix hydration error: solo habilitar DnD después de montar en cliente
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Configurar sensores para drag & drop (requiere mover 2px antes de activar - más responsivo)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
      },
    })
  )

  // Calcular conteos para cada carpeta
  const carpetasConConteo: CarpetaConConteo[] = carpetas.map(carpeta => {
    // Contar casos directamente en esta carpeta
    const casos_directos = casos.filter(c => c.carpeta_id === carpeta.id).length
    
    // Contar casos en subcarpetas (recursivo simple)
    const contarEnSubcarpetas = (carpetaId: string): number => {
      const subcarpetas = carpetas.filter(c => c.carpeta_padre_id === carpetaId)
      let total = casos.filter(c => c.carpeta_id === carpetaId).length
      
      subcarpetas.forEach(sub => {
        total += contarEnSubcarpetas(sub.id)
      })
      
      return total
    }
    
    const total_casos = contarEnSubcarpetas(carpeta.id)

    // Generar ruta completa
    const getRuta = (carpetaId: string): string => {
      const carp = carpetas.find(c => c.id === carpetaId)
      if (!carp) return ''
      if (!carp.carpeta_padre_id) return carp.nombre
      return getRuta(carp.carpeta_padre_id) + ' / ' + carp.nombre
    }

    return {
      ...carpeta,
      casos_directos,
      total_casos,
      ruta_completa: getRuta(carpeta.id)
    }
  })

  // Filtrar casos según carpeta seleccionada (SOLO casos directos, NO subcarpetas)
  const casosFiltrados = casos.filter(caso => {
    if (carpetaSeleccionada === null) {
      // Todos los casos
      return true
    } else if (carpetaSeleccionada === 'sin_carpeta') {
      // Solo casos sin carpeta
      return !caso.carpeta_id
    } else {
      // ✅ FIX: Solo casos DIRECTAMENTE en esta carpeta (no incluir subcarpetas)
      return caso.carpeta_id === carpetaSeleccionada
    }
  })

  // Obtener subcarpetas de la carpeta seleccionada
  const subcarpetasActuales = carpetaSeleccionada && carpetaSeleccionada !== 'sin_carpeta'
    ? carpetasConConteo.filter(c => c.carpeta_padre_id === carpetaSeleccionada)
    : []

  // Construir breadcrumb (ruta de carpetas)
  const construirBreadcrumb = (carpetaId: string | null): CarpetaConConteo[] => {
    if (!carpetaId || carpetaId === 'sin_carpeta') return []
    
    const ruta: CarpetaConConteo[] = []
    let carpetaActual = carpetasConConteo.find(c => c.id === carpetaId)
    
    while (carpetaActual) {
      ruta.unshift(carpetaActual)
      carpetaActual = carpetaActual.carpeta_padre_id 
        ? carpetasConConteo.find(c => c.id === carpetaActual!.carpeta_padre_id)
        : undefined
    }
    
    return ruta
  }

  const breadcrumb = construirBreadcrumb(carpetaSeleccionada)

  const casosSinCarpeta = casos.filter(c => !c.carpeta_id).length

  const recargarDatos = useCallback(async () => {
    const { data: casosData } = await supabase
      .from('casos')
      .select('id, codigo_estimado, cliente, patrocinado, descripcion, expediente, tipo, estado, estado_caso, ubicacion_fisica, created_at, carpeta_id')
      .order('created_at', { ascending: false })

    const { data: carpetasData } = await supabase
      .from('carpetas')
      .select('*')
      .order('orden', { ascending: true })

    if (casosData) setCasos(casosData)
    if (carpetasData) setCarpetas(carpetasData)
    
    router.refresh()
  }, [supabase, router])

  const handleNuevaCarpeta = () => {
    modalCarpeta.open(null as unknown as Carpeta) // null indica crear nueva
  }

  const handleCerrarModal = () => {
    modalCarpeta.close()
  }

  const handleSuccessModal = () => {
    recargarDatos()
  }

  const handleEditarCarpeta = (carpeta: CarpetaConConteo) => {
    modalCarpeta.open(carpeta as Carpeta)
  }

  const handleEliminarCarpeta = (carpeta: CarpetaConConteo) => {
    modalEliminar.open(carpeta)
  }

  const confirmarEliminarCarpeta = async () => {
    if (!modalEliminar.data) return
    
    try {
      // Eliminar carpeta (CASCADE eliminará subcarpetas, casos quedarán con carpeta_id = null por SET NULL)
      const { error } = await supabase
        .from('carpetas')
        .delete()
        .eq('id', modalEliminar.data.id)
      
      if (error) throw error
      
      // Si estaba seleccionada, deseleccionar
      if (carpetaSeleccionada === modalEliminar.data.id) {
        setCarpetaSeleccionada(null)
      }
      
      await recargarDatos()
      modalEliminar.close()
    } catch (err) {
      logError('CasosConCarpetas.eliminarCarpeta', err)
      alert('Error al eliminar la carpeta.')
    }
  }

  const handleMoverCarpetaArriba = async (carpeta: CarpetaConConteo) => {
    // Obtener carpetas del mismo nivel (mismo padre)
    const carpetasHermanas = carpetas
      .filter(c => c.carpeta_padre_id === carpeta.carpeta_padre_id)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    
    const index = carpetasHermanas.findIndex(c => c.id === carpeta.id)
    
    if (index <= 0) return // Ya está arriba del todo
    
    const carpetaAnterior = carpetasHermanas[index - 1]
    
    try {
      // Intercambiar órdenes
      await supabase.from('carpetas').update({ orden: carpetaAnterior.orden }).eq('id', carpeta.id)
      await supabase.from('carpetas').update({ orden: carpeta.orden }).eq('id', carpetaAnterior.id)
      
      await recargarDatos()
    } catch (err) {
      logError('CasosConCarpetas.moverArriba', err)
      alert('Error al cambiar orden de carpeta.')
    }
  }

  const handleMoverCarpetaAbajo = async (carpeta: CarpetaConConteo) => {
    // Obtener carpetas del mismo nivel (mismo padre)
    const carpetasHermanas = carpetas
      .filter(c => c.carpeta_padre_id === carpeta.carpeta_padre_id)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    
    const index = carpetasHermanas.findIndex(c => c.id === carpeta.id)
    
    if (index === -1 || index >= carpetasHermanas.length - 1) return // Ya está abajo del todo
    
    const carpetaSiguiente = carpetasHermanas[index + 1]
    
    try {
      // Intercambiar órdenes
      await supabase.from('carpetas').update({ orden: carpetaSiguiente.orden }).eq('id', carpeta.id)
      await supabase.from('carpetas').update({ orden: carpeta.orden }).eq('id', carpetaSiguiente.id)
      
      await recargarDatos()
    } catch (err) {
      logError('CasosConCarpetas.moverAbajo', err)
      alert('Error al cambiar orden de carpeta.')
    }
  }

  // Validación de loops infinitos
  const esLoopInfinito = useCallback((carpetaId: string, nuevoPadreId: string): boolean => {
    // Verificar si nuevoPadreId es descendiente de carpetaId
    const esDescendiente = (buscarId: string, ancestroId: string): boolean => {
      const carpeta = carpetas.find(c => c.id === buscarId)
      if (!carpeta || !carpeta.carpeta_padre_id) return false
      if (carpeta.carpeta_padre_id === ancestroId) return true
      return esDescendiente(carpeta.carpeta_padre_id, ancestroId)
    }
    
    return esDescendiente(nuevoPadreId, carpetaId)
  }, [carpetas])

  // Drag & Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string
    setActiveDragId(id)
    setActiveDragType(id.startsWith('carpeta-') ? 'carpeta' : 'caso')
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragId(null)
    setActiveDragType(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string
    
    // Detectar si es caso o carpeta
    const esCarpeta = activeId.startsWith('carpeta-')
    
    if (esCarpeta) {
      // MOVER CARPETA A OTRA CARPETA
      const carpetaId = activeId.replace('carpeta-', '')
      const nuevoPadreId = overId === 'sin_carpeta' ? null : overId.replace('carpeta-', '')
      
      // Si soltó sobre la misma carpeta (elemento visual), cancelar silenciosamente
      if (activeId === overId) {
        return
      }
      
      // Obtener carpeta actual para comparar con nuevo padre
      const carpetaActual = carpetas.find(c => c.id === carpetaId)
      
      // Si soltó sobre la misma carpeta padre donde ya está, no hacer nada
      if (carpetaActual?.carpeta_padre_id === nuevoPadreId) {
        return
      }
      
      // Validar: no mover carpeta como subcarpeta de sí misma (después de limpiar prefijos)
      if (carpetaId === nuevoPadreId) {
        alert('❌ No puedes convertir una carpeta en subcarpeta de sí misma.')
        return
      }
      
      // Validar: no crear loop infinito (carpeta padre dentro de subcarpeta)
      if (nuevoPadreId && esLoopInfinito(carpetaId, nuevoPadreId)) {
        alert('❌ No puedes mover una carpeta dentro de una de sus subcarpetas.')
        return
      }
      
      try {
        const { error } = await supabase
          .from('carpetas')
          .update({ carpeta_padre_id: nuevoPadreId })
          .eq('id', carpetaId)

        if (error) throw error

        // Actualizar estado local
        setCarpetas(prev => prev.map(c => 
          c.id === carpetaId ? { ...c, carpeta_padre_id: nuevoPadreId } : c
        ))

        router.refresh()
      } catch (err) {
        logError('CasosConCarpetas.dragEnd.carpeta', err)
        alert('Error al mover la carpeta.')
      }
    } else {
      // MOVER CASO A CARPETA (lógica original)
      const casoId = activeId
      const carpetaId = overId === 'sin_carpeta' ? null : overId.replace('carpeta-', '')

      // Obtener caso actual para comparar
      const casoActual = casos.find(c => c.id === casoId)
      
      // Si soltó en la misma carpeta donde ya está, no hacer nada (cancelar silenciosamente)
      if (casoActual?.carpeta_id === carpetaId) {
        return
      }

      try {
        const { error } = await supabase
          .from('casos')
          .update({ carpeta_id: carpetaId })
          .eq('id', casoId)

        if (error) throw error

        // Actualizar estado local
        setCasos(prev => prev.map(c => 
          c.id === casoId ? { ...c, carpeta_id: carpetaId } : c
        ))

        router.refresh()
      } catch (err) {
        logError('CasosConCarpetas.dragEnd.caso', err)
        alert('Error al mover el caso a la carpeta.')
      }
    }
  }

  const handleDragCancel = () => {
    setActiveDragId(null)
    setActiveDragType(null)
  }

  // Obtener elemento que se está arrastrando
  const activeCaso = activeDragId && activeDragType === 'caso' 
    ? casos.find(c => c.id === activeDragId) 
    : null
  
  const activeCarpeta = activeDragId && activeDragType === 'carpeta'
    ? carpetasConConteo.find(c => `carpeta-${c.id}` === activeDragId)
    : null

  // Nombre de carpeta seleccionada para mostrar en header
  const nombreCarpetaActual = carpetaSeleccionada === null
    ? 'Todos los Casos'
    : carpetaSeleccionada === 'sin_carpeta'
    ? 'Sin Carpeta'
    : carpetasConConteo.find(c => c.id === carpetaSeleccionada)?.nombre || 'Carpeta'

  // Si no está montado, renderizar versión sin DnD (evita hydration error)
  if (!mounted) {
    return (
      <div className="flex h-screen bg-gray-50">
        <SidebarCarpetas
          carpetas={carpetasConConteo}
          carpetaSeleccionada={carpetaSeleccionada}
          onSeleccionarCarpeta={setCarpetaSeleccionada}
          onNuevaCarpeta={handleNuevaCarpeta}
          onEditarCarpeta={handleEditarCarpeta}
          onEliminarCarpeta={handleEliminarCarpeta}
          onMoverArriba={handleMoverCarpetaArriba}
          onMoverAbajo={handleMoverCarpetaAbajo}
          totalCasos={casos.length}
          casosSinCarpeta={casosSinCarpeta}
        />

        <CasosContenido
          nombreCarpetaActual={nombreCarpetaActual}
          breadcrumb={breadcrumb}
          subcarpetasActuales={subcarpetasActuales}
          casosFiltrados={casosFiltrados}
          carpetasConConteo={carpetasConConteo}
          carpetaSeleccionada={carpetaSeleccionada}
          onSeleccionarCarpeta={setCarpetaSeleccionada}
          onCambiarCarpeta={recargarDatos}
        />

        <ModalCarpeta
          isOpen={modalCarpeta.isOpen}
          onClose={handleCerrarModal}
          onSuccess={handleSuccessModal}
          carpetaEditar={modalCarpeta.data}
          carpetas={carpetasConConteo}
        />

        <ModalConfirmacion
          isOpen={modalEliminar.isOpen}
          onClose={modalEliminar.close}
          onConfirm={confirmarEliminarCarpeta}
          titulo="Eliminar carpeta"
          mensaje={`¿Estás seguro de eliminar la carpeta "${modalEliminar.data?.nombre}"?`}
          advertencias={(() => {
            if (!modalEliminar.data) return []
            const carpeta = modalEliminar.data
            const advs: string[] = []
            const casosEnCarpeta = casos.filter(c => c.carpeta_id === carpeta.id).length
            const subcarpetas = carpetas.filter(c => c.carpeta_padre_id === carpeta.id)
            
            if (casosEnCarpeta > 0) {
              advs.push(`Contiene ${casosEnCarpeta} ${casosEnCarpeta === 1 ? 'caso' : 'casos'}. Los casos quedarán sin carpeta.`)
            }
            if (subcarpetas.length > 0) {
              advs.push(`Contiene ${subcarpetas.length} ${subcarpetas.length === 1 ? 'subcarpeta' : 'subcarpetas'}. También se eliminarán.`)
            }
            return advs
          })()}
          textoConfirmar="Eliminar"
          textoCancelar="Cancelar"
          tipo="peligro"
        />
      </div>
    )
  }

  // Una vez montado, renderizar con DndContext completo
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen bg-gray-50">
        <SidebarCarpetas
          carpetas={carpetasConConteo}
          carpetaSeleccionada={carpetaSeleccionada}
          onSeleccionarCarpeta={setCarpetaSeleccionada}
          onNuevaCarpeta={handleNuevaCarpeta}
          onEditarCarpeta={handleEditarCarpeta}
          onEliminarCarpeta={handleEliminarCarpeta}
          onMoverArriba={handleMoverCarpetaArriba}
          onMoverAbajo={handleMoverCarpetaAbajo}
          totalCasos={casos.length}
          casosSinCarpeta={casosSinCarpeta}
        />

        <CasosContenido
          nombreCarpetaActual={nombreCarpetaActual}
          breadcrumb={breadcrumb}
          subcarpetasActuales={subcarpetasActuales}
          casosFiltrados={casosFiltrados}
          carpetasConConteo={carpetasConConteo}
          carpetaSeleccionada={carpetaSeleccionada}
          onSeleccionarCarpeta={setCarpetaSeleccionada}
          onCambiarCarpeta={recargarDatos}
        />

        <ModalCarpeta
          isOpen={modalCarpeta.isOpen}
          onClose={handleCerrarModal}
          onSuccess={handleSuccessModal}
          carpetaEditar={modalCarpeta.data}
          carpetas={carpetasConConteo}
        />

        <ModalConfirmacion
          isOpen={modalEliminar.isOpen}
          onClose={modalEliminar.close}
          onConfirm={confirmarEliminarCarpeta}
          titulo="Eliminar carpeta"
          mensaje={`¿Estás seguro de eliminar la carpeta "${modalEliminar.data?.nombre}"?`}
          advertencias={(() => {
            if (!modalEliminar.data) return []
            const carpeta = modalEliminar.data
            const advs: string[] = []
            const casosEnCarpeta = casos.filter(c => c.carpeta_id === carpeta.id).length
            const subcarpetas = carpetas.filter(c => c.carpeta_padre_id === carpeta.id)
            
            if (casosEnCarpeta > 0) {
              advs.push(`Contiene ${casosEnCarpeta} ${casosEnCarpeta === 1 ? 'caso' : 'casos'}. Los casos quedarán sin carpeta.`)
            }
            if (subcarpetas.length > 0) {
              advs.push(`Contiene ${subcarpetas.length} ${subcarpetas.length === 1 ? 'subcarpeta' : 'subcarpetas'}. También se eliminarán.`)
            }
            return advs
          })()}
          textoConfirmar="Eliminar"
          textoCancelar="Cancelar"
          tipo="peligro"
        />
      </div>

      {/* Overlay de drag & drop - profesional y compacto */}
      <DragOverlay dropAnimation={null} modifiers={[snapCenterToCursor]}>
        {activeCaso ? (
          <div 
            className="bg-white shadow-2xl rounded-lg px-4 py-2 border border-gray-200 cursor-grabbing opacity-90 flex items-center gap-2 max-w-xs"
            style={{ pointerEvents: 'none' }}
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">💼</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-900 truncate">{activeCaso.cliente}</span>
              <span className="text-[10px] text-gray-500">{activeCaso.codigo_estimado}</span>
            </div>
          </div>
        ) : activeCarpeta ? (
          <div 
            className="bg-white shadow-2xl rounded-lg px-4 py-2 border border-gray-200 cursor-grabbing opacity-90 flex items-center gap-2 max-w-xs"
            style={{ pointerEvents: 'none' }}
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm">📁</span>
            </div>
            <span className="text-xs font-bold text-gray-900 truncate">{activeCarpeta.nombre}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
