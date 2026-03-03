'use client'

import { memo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { QuickPermissionsCheckbox } from './QuickPermissionsCheckbox'
import type { Caso } from '@/lib/types/database'

interface FilaCasoDraggableProps {
  caso: Caso
  onEliminar: (caso: Caso) => void
  onMover: (caso: Caso) => void
  tieneCarpetas: boolean
  isAdmin?: boolean
  onPermissionsUpdate?: (casoId: string, newUsuarios: string[]) => void
}

function FilaCasoDraggableComponent({ 
  caso, 
  onEliminar, 
  onMover, 
  tieneCarpetas, 
  isAdmin, 
  onPermissionsUpdate 
}: FilaCasoDraggableProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: caso.id,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.15 : 1,
    willChange: isDragging ? 'transform' : 'auto',
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${isDragging ? 'cursor-grabbing shadow-lg' : 'cursor-grab'}`}
      {...attributes}
      {...listeners}
    >
      <td className="px-4 py-4 text-xs text-gray-900">
        {caso.patrocinado ? (
          <span className="font-medium">⚖️ {caso.patrocinado}</span>
        ) : (
          <span className="text-gray-400">Sin patrocinado</span>
        )}
      </td>
      <td className="px-4 py-4 text-xs text-gray-900">
        <div>
          <p className="font-medium">💼 {caso.cliente}</p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {caso.codigo_estimado}
          </p>
        </div>
      </td>
      <td className="px-4 py-4 text-xs text-gray-700 max-w-xs truncate">
        {caso.descripcion}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-xs">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
          {caso.tipo}
        </span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-xs">
        <div className="flex items-center gap-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
            caso.estado === 'Activo' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {caso.estado}
          </span>
          {caso.estado_caso && (
            <span className="text-[10px] text-gray-600">
              {caso.estado_caso === 'En proceso' && '⏳'}
              {caso.estado_caso === 'Ganado' && '✅'}
              {caso.estado_caso === 'Perdido' && '❌'}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-700">
        {caso.ubicacion_fisica ? (
          <span className="flex items-center gap-1">
            <span>📦</span>
            <span className="text-[10px]">{caso.ubicacion_fisica}</span>
          </span>
        ) : (
          <span className="text-gray-400 text-[10px]">💻 Virtual</span>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-500">
        {caso.created_at 
          ? new Date(caso.created_at).toLocaleDateString('es-ES')
          : '-'}
      </td>
      {isAdmin && (
        <td 
          className="px-4 py-4 whitespace-nowrap"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <QuickPermissionsCheckbox
            casoId={caso.id}
            usuariosConAcceso={caso.usuarios_con_acceso || []}
            onUpdate={(newUsuarios) => onPermissionsUpdate?.(caso.id, newUsuarios)}
          />
        </td>
      )}
      <td 
        className="px-4 py-4 whitespace-nowrap text-xs font-medium"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/casos/${caso.id}`}
            className="text-blue-600 hover:text-blue-900 text-xs font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Ver
          </Link>
          {tieneCarpetas && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMover(caso)
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="text-green-600 hover:text-green-900 text-xs font-medium hover:underline"
              title="Mover a carpeta"
            >
              Mover
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEliminar(caso)
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-1 rounded transition-colors"
            title="Eliminar caso"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// Memoizar para evitar re-renders innecesarios
export default memo(FilaCasoDraggableComponent, (prevProps, nextProps) => {
  // Solo re-renderizar si el caso cambió o tieneCarpetas cambió o permisos cambiaron
  const usuariosIguales = JSON.stringify(prevProps.caso.usuarios_con_acceso) === 
                          JSON.stringify(nextProps.caso.usuarios_con_acceso)
  
  return (
    prevProps.caso.id === nextProps.caso.id &&
    prevProps.caso.carpeta_id === nextProps.caso.carpeta_id &&
    prevProps.tieneCarpetas === nextProps.tieneCarpetas &&
    prevProps.isAdmin === nextProps.isAdmin &&
    usuariosIguales
  )
})
