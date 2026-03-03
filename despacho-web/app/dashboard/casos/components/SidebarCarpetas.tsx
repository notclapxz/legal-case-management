'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

import { QuickPermissionsCheckboxCarpeta } from './QuickPermissionsCheckboxCarpeta'
import { useUserRole } from '@/app/hooks/useUserRole'

import type { CarpetaConConteo } from '@/lib/types/database'

interface SidebarCarpetasProps {
  carpetas: CarpetaConConteo[]
  carpetaSeleccionada: string | null
  onSeleccionarCarpeta: (carpetaId: string | null) => void
  onNuevaCarpeta: () => void
  onEditarCarpeta: (carpeta: CarpetaConConteo) => void
  onEliminarCarpeta: (carpeta: CarpetaConConteo) => void
  onMoverArriba: (carpeta: CarpetaConConteo) => void
  onMoverAbajo: (carpeta: CarpetaConConteo) => void
  totalCasos: number
  casosSinCarpeta: number
}

// Componente wrapper para carpeta con drop zone Y draggable
function CarpetaDropZone({ carpeta, children }: { carpeta: CarpetaConConteo; children: React.ReactNode }) {
  const carpetaId = `carpeta-${carpeta.id}` // ID único con prefijo
  
  // Droppable (puede recibir casos y carpetas)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: carpetaId, // Mismo ID que draggable
    data: { type: 'carpeta', carpeta }
  })

  // Draggable (puede moverse a otras carpetas)
  const { 
    attributes, 
    listeners, 
    setNodeRef: setDragRef, 
    transform, 
    isDragging 
  } = useDraggable({
    id: carpetaId, // Mismo ID que droppable
    data: { type: 'carpeta', carpeta }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.15 : 1,
    willChange: isDragging ? 'transform' : 'auto',
  }

  // Combinar refs (tanto drag como drop)
  const setRefs = (node: HTMLDivElement | null) => {
    setDropRef(node)
    setDragRef(node)
  }

  return (
    <div
      ref={setRefs}
      style={style}
      className={`transition-all duration-200 ${isOver ? 'bg-blue-50 border-2 border-blue-400 rounded-md shadow-md' : ''} ${isDragging ? 'cursor-grabbing opacity-50' : 'cursor-grab'}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

// Componente wrapper para "Sin carpeta" con drop zone
function SinCarpetaDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'sin_carpeta',
  })

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${isOver ? 'bg-gray-100 border-2 border-gray-400 rounded-md shadow-md' : ''}`}
    >
      {children}
    </div>
  )
}

export default function SidebarCarpetas({
  carpetas,
  carpetaSeleccionada,
  onSeleccionarCarpeta,
  onNuevaCarpeta,
  onEditarCarpeta,
  onEliminarCarpeta,
  onMoverArriba,
  onMoverAbajo,
  totalCasos,
  casosSinCarpeta
}: SidebarCarpetasProps) {
  // Hook para verificar si es admin
  const { isAdmin } = useUserRole()
  const router = useRouter()
  
  // Estado para manejar actualización de permisos
  const [carpetasState, setCarpetasState] = useState(carpetas)
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null)
  
  // Sincronizar con props cuando carpetas cambie
  useEffect(() => {
    setCarpetasState(carpetas)
  }, [carpetas])
  
  // Agrupar carpetas por nivel (raíz vs subcarpetas) - usar state local
  const carpetasRaiz = carpetasState.filter(c => !c.carpeta_padre_id)
  const subcarpetas = carpetasState.filter(c => c.carpeta_padre_id)

  // Expandir por defecto todas las carpetas que tienen subcarpetas
  const [expandidas, setExpandidas] = useState<Set<string>>(() => {
    const carpetasConSubcarpetas = carpetas
      .filter(carpeta => subcarpetas.some(sub => sub.carpeta_padre_id === carpeta.id))
      .map(c => c.id)
    return new Set(carpetasConSubcarpetas)
  })

  // Handler para actualizar permisos de carpeta
  const handleUpdatePermisos = (carpetaId: string, newUsuarios: string[]) => {
    setCarpetasState(prev => 
      prev.map(c => 
        c.id === carpetaId 
          ? { ...c, usuarios_con_acceso: newUsuarios }
          : c
      )
    )
  }

  const toggleExpandir = (carpetaId: string) => {
    setExpandidas(prev => {
      const nuevo = new Set(prev)
      if (nuevo.has(carpetaId)) {
        nuevo.delete(carpetaId)
      } else {
        nuevo.add(carpetaId)
      }
      return nuevo
    })
  }

  const getSubcarpetas = (padreId: string) => {
    return subcarpetas.filter(s => s.carpeta_padre_id === padreId)
  }

  const renderCarpeta = (carpeta: CarpetaConConteo, nivel: number = 0) => {
    const subs = getSubcarpetas(carpeta.id)
    const tieneSubcarpetas = subs.length > 0
    const estaExpandida = expandidas.has(carpeta.id)
    const estaSeleccionada = carpetaSeleccionada === carpeta.id

    return (
      <div key={carpeta.id} className="select-none">
        <CarpetaDropZone carpeta={carpeta}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-all group ${
              estaSeleccionada
                ? 'bg-blue-100 text-blue-800 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            style={{ paddingLeft: `${12 + nivel * 16}px` }}
            onClick={() => onSeleccionarCarpeta(carpeta.id)}
          >
            {/* Botón expandir/colapsar */}
            {tieneSubcarpetas && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleExpandir(carpeta.id)
                }}
                className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                {estaExpandida ? '▼' : '▶'}
              </button>
            )}
            {!tieneSubcarpetas && <span className="w-4" />}

            {/* Icono y color */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: carpeta.color || '#3B82F6' }}
            />
            <span className="text-lg flex-shrink-0">{carpeta.icono || '📁'}</span>

            {/* Nombre */}
            <span className="flex-1 text-sm truncate">{carpeta.nombre}</span>

            {/* Contador */}
            <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
              estaSeleccionada
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
            }`}>
              {carpeta.total_casos || 0}
            </span>

            {/* Menú de tres puntitos */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuAbierto(menuAbierto === carpeta.id ? null : carpeta.id)
                }}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-all"
                title="Opciones"
              >
                ⋮
              </button>

              {/* Dropdown menu */}
              {menuAbierto === carpeta.id && (
                <>
                  {/* Backdrop para cerrar al hacer click afuera */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuAbierto(null)}
                  />
                  
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuAbierto(null)
                        onMoverArriba(carpeta)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>↑</span>
                      Subir
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuAbierto(null)
                        onMoverAbajo(carpeta)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>↓</span>
                      Bajar
                    </button>
                    
                    {/* Opción Compartir - SOLO ADMIN */}
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <div className="px-4 py-2">
                          <QuickPermissionsCheckboxCarpeta
                            carpetaId={carpeta.id}
                            nombreCarpeta={carpeta.nombre}
                            usuariosConAcceso={carpeta.usuarios_con_acceso || []}
                            onUpdate={(newUsuarios) => handleUpdatePermisos(carpeta.id, newUsuarios)}
                          />
                        </div>
                      </>
                    )}
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuAbierto(null)
                        router.push(`/dashboard/notas/carpeta/${carpeta.id}`)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📝</span>
                      Notas
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuAbierto(null)
                        onEditarCarpeta(carpeta)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>✏️</span>
                      Editar
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuAbierto(null)
                        onEliminarCarpeta(carpeta)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <span>🗑️</span>
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </CarpetaDropZone>

        {/* Subcarpetas (recursivo) */}
        {tieneSubcarpetas && estaExpandida && (
          <div className="ml-2">
            {subs.map(sub => renderCarpeta(sub, nivel + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Carpetas</h2>
        <p className="text-xs text-gray-500">{totalCasos} casos totales</p>
        <div className="mt-2 px-3 py-2 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-800 font-medium">
            💡 Arrastrá casos a las carpetas
          </p>
        </div>
      </div>

      {/* Lista de carpetas */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Opción "Todos los casos" */}
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
            carpetaSeleccionada === null
              ? 'bg-blue-100 text-blue-800 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => onSeleccionarCarpeta(null)}
        >
          <span className="text-lg">📂</span>
          <span className="flex-1 text-sm">Todos los casos</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            carpetaSeleccionada === null
              ? 'bg-blue-200 text-blue-800'
              : 'bg-gray-200 text-gray-600'
          }`}>
            {totalCasos}
          </span>
        </div>

        <div className="border-t border-gray-200 my-2" />

        {/* Carpetas raíz (con subcarpetas recursivas) */}
        {carpetasRaiz.length > 0 ? (
          carpetasRaiz.map(carpeta => renderCarpeta(carpeta))
        ) : (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            <p className="mb-2">📁</p>
            <p>No hay carpetas</p>
            <p className="text-xs mt-1">Creá tu primera carpeta</p>
          </div>
        )}

        {/* Opción "Sin carpeta" (casos huérfanos) - CON DROP ZONE */}
        {casosSinCarpeta > 0 && (
          <>
            <div className="border-t border-gray-200 my-2" />
            <SinCarpetaDropZone>
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                  carpetaSeleccionada === 'sin_carpeta'
                    ? 'bg-gray-100 text-gray-800 font-medium'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
                onClick={() => onSeleccionarCarpeta('sin_carpeta')}
              >
                <span className="text-lg">💼</span>
                <span className="flex-1 text-sm">Sin carpeta</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  carpetaSeleccionada === 'sin_carpeta'
                    ? 'bg-gray-300 text-gray-800'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {casosSinCarpeta}
                </span>
              </div>
            </SinCarpetaDropZone>
          </>
        )}
      </div>

      {/* Footer - Botón nueva carpeta */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onNuevaCarpeta}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          <span className="text-lg">+</span>
          <span>Nueva Carpeta</span>
        </button>
      </div>
    </div>
  )
}
