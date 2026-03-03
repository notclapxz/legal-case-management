'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import { useUserRole } from '@/app/hooks/useUserRole'
import { useCasosTable } from '@/app/hooks/casos/useCasosTable'
import { useModal } from '@/app/hooks/useModal'
import { DeleteCaseModal } from '@/app/components/casos/DeleteCaseModal'
import { MoveCaseModal } from '@/app/components/casos/MoveCaseModal'
import type { Caso, CarpetaConConteo } from '@/lib/types/database'
import type { SortField } from '@/lib/casos/sorting'
import FilaCasoDraggable from './FilaCasoDraggable'

interface TablaCasosProps {
  casos: Caso[]
  carpetas?: CarpetaConConteo[]
  onCambiarCarpeta?: () => void
}

export default function TablaCasos({ casos, carpetas = [], onCambiarCarpeta }: TablaCasosProps) {
  const router = useRouter()
  const supabase = createClient()
  const { isAdmin } = useUserRole()
  
  // Hooks para lógica de tabla (filtrado, sorting, paginación)
  const table = useCasosTable(casos)
  
  // Hooks para modales
  const deleteModal = useModal<Caso>()
  const moveModal = useModal<Caso>()
  
  // Estado local de casos para actualizaciones de permisos
  const [casosState, setCasosState] = useState(casos)
  
  // Sincronizar cuando cambien los casos recibidos
  useEffect(() => {
    setCasosState(casos)
  }, [casos])
  
  // Estados de loading para operaciones
  const [eliminando, setEliminando] = useState(false)
  const [moviendoCarpeta, setMoviendoCarpeta] = useState(false)

  // Handler: Actualizar permisos localmente
  const handlePermissionsUpdate = (casoId: string, newUsuarios: string[]) => {
    setCasosState(prev => prev.map(c => 
      c.id === casoId ? { ...c, usuarios_con_acceso: newUsuarios } : c
    ))
  }

  // Handler: Eliminar caso
  const handleEliminar = async () => {
    if (!deleteModal.data) return

    setEliminando(true)
    try {
      const { error } = await supabase
        .from('casos')
        .delete()
        .eq('id', deleteModal.data.id)

      if (error) throw error

      router.refresh()
      deleteModal.close()
      if (onCambiarCarpeta) onCambiarCarpeta()
    } catch (error) {
      logError('TablaCasos.eliminar', error)
      alert('Error al eliminar el caso. Puede que tenga datos relacionados (notas, eventos, pagos).')
    } finally {
      setEliminando(false)
    }
  }

  // Handler: Mover caso a carpeta
  const handleMoverACarpeta = async (carpetaId: string | null) => {
    if (!moveModal.data) return

    setMoviendoCarpeta(true)
    try {
      const { error } = await supabase
        .from('casos')
        .update({ carpeta_id: carpetaId })
        .eq('id', moveModal.data.id)

      if (error) throw error

      router.refresh()
      moveModal.close()
      if (onCambiarCarpeta) onCambiarCarpeta()
    } catch (error) {
      logError('TablaCasos.moverACarpeta', error)
      alert('Error al mover el caso a la carpeta.')
    } finally {
      setMoviendoCarpeta(false)
    }
  }

  // Componente: Ícono de sorting
  const SortIcon = ({ field }: { field: SortField }) => {
    if (table.sort.field !== field) {
      return <span className="text-gray-400 ml-1">⇅</span>
    }
    return <span className="text-blue-600 ml-1">{table.sort.direction === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="space-y-4">
      {/* Buscador y Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar
            </label>
            <input
              type="text"
              placeholder="Código, cliente, patrocinado, descripción, expediente..."
              value={table.filters.busqueda}
              onChange={(e) => table.setFilter('busqueda', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              value={table.filters.estado}
              onChange={(e) => table.setFilter('estado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Pausado">Pausado</option>
              <option value="Cerrado">Cerrado</option>
            </select>
          </div>

          {/* Filtro Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={table.filters.tipo}
              onChange={(e) => table.setFilter('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="Penal">Penal</option>
              <option value="Civil">Civil</option>
              <option value="Laboral">Laboral</option>
              <option value="Administrativo">Administrativo</option>
            </select>
          </div>
        </div>

        {/* Filtros adicionales (segunda fila) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro Estado Procesal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado Procesal
            </label>
            <select
              value={table.filters.estadoCaso}
              onChange={(e) => table.setFilter('estadoCaso', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="En proceso">En proceso</option>
              <option value="Ganado">Ganado</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>

          {/* Filtro Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo
            </label>
            <select
              value={table.filters.ubicacion}
              onChange={(e) => table.setFilter('ubicacion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos</option>
              <option value="Con ubicación">📦 Con archivo físico</option>
              <option value="Solo virtuales">💻 Solo virtuales</option>
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={table.filters.fechaDesde}
              onChange={(e) => table.setFilter('fechaDesde', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={table.filters.fechaHasta}
              onChange={(e) => table.setFilter('fechaHasta', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Contador y botón limpiar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando <span className="font-semibold text-gray-900">{table.paginatedCasos.length}</span> de{' '}
            <span className="font-semibold text-gray-900">{table.filteredCasos.length}</span> casos filtrados
            {table.filteredCasos.length !== casosState.length && (
              <span className="text-gray-500"> (total: {casosState.length})</span>
            )}
          </div>
          
          {table.hasActiveFilters && (
            <button
              onClick={table.clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Patrocinado
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => table.handleSort('cliente')}
                >
                  Cliente <SortIcon field="cliente" />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Descripción
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => table.handleSort('tipo')}
                >
                  Tipo <SortIcon field="tipo" />
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => table.handleSort('estado')}
                >
                  Estado <SortIcon field="estado" />
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ubicación
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => table.handleSort('created_at')}
                >
                  Creado <SortIcon field="created_at" />
                </th>
                {isAdmin && (
                  <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    👥 Compartir
                  </th>
                )}
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {table.paginatedCasos.length > 0 ? (
                table.paginatedCasos.map((caso) => (
                  <FilaCasoDraggable
                    key={caso.id}
                    caso={caso}
                    onEliminar={deleteModal.open}
                    onMover={moveModal.open}
                    tieneCarpetas={carpetas.length > 0}
                    isAdmin={isAdmin}
                    onPermissionsUpdate={handlePermissionsUpdate}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-4xl">🔍</span>
                      <p className="font-medium">No se encontraron casos</p>
                      <p className="text-xs">Intentá cambiar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {table.pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Página <span className="font-semibold text-gray-900">{table.pagination.currentPage}</span> de{' '}
              <span className="font-semibold text-gray-900">{table.pagination.totalPages}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botón Primera Página */}
              <button
                onClick={table.firstPage}
                disabled={!table.pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Primera página"
              >
                «
              </button>

              {/* Botón Anterior */}
              <button
                onClick={table.prevPage}
                disabled={!table.pagination.hasPrevPage}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹ Anterior
              </button>

              {/* Números de página */}
              <div className="hidden sm:flex gap-1">
                {table.pagination.pageRange.map((num, idx, arr) => {
                  const items = []
                  
                  // Agregar "..." si hay salto
                  if (idx > 0 && num - arr[idx - 1] > 1) {
                    items.push(
                      <span key={`ellipsis-${num}`} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    )
                  }
                  
                  items.push(
                    <button
                      key={num}
                      onClick={() => table.setPage(num)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        table.pagination.currentPage === num
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {num}
                    </button>
                  )
                  
                  return items
                })}
              </div>

              {/* Botón Siguiente */}
              <button
                onClick={table.nextPage}
                disabled={!table.pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente ›
              </button>

              {/* Botón Última Página */}
              <button
                onClick={table.lastPage}
                disabled={!table.pagination.hasNextPage}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Última página"
              >
                »
              </button>
            </div>

            {/* Ir a página específica */}
            <div className="hidden md:flex items-center gap-2">
              <label className="text-sm text-gray-600">Ir a:</label>
              <input
                type="number"
                min="1"
                max={table.pagination.totalPages}
                value={table.pagination.currentPage}
                onChange={(e) => {
                  const num = parseInt(e.target.value)
                  if (num >= 1 && num <= table.pagination.totalPages) {
                    table.setPage(num)
                  }
                }}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Resumen */}
      {table.filteredCasos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumen de Casos Filtrados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Total de Casos</p>
              <p className="text-3xl font-bold text-gray-900">{table.stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Casos Activos</p>
              <p className="text-3xl font-bold text-green-600">{table.stats.activos}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">En Proceso</p>
              <p className="text-3xl font-bold text-blue-600">{table.stats.enProceso}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modales - Componentes extraídos */}
      <DeleteCaseModal
        caso={deleteModal.data}
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleEliminar}
        isDeleting={eliminando}
      />

      <MoveCaseModal
        caso={moveModal.data}
        carpetas={carpetas}
        isOpen={moveModal.isOpen}
        onClose={moveModal.close}
        onMove={handleMoverACarpeta}
        isMoving={moviendoCarpeta}
      />
    </div>
  )
}
