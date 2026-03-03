/**
 * Hook para manejar tabla de casos con filtrado, sorting y paginación
 * 
 * Este hook ENCAPSULA toda la lógica de:
 * - Filtrado por múltiples campos
 * - Ordenamiento por columnas
 * - Paginación
 * - Estadísticas
 * 
 * @example
 * const table = useCasosTable(casos)
 * 
 * // Usar en el componente:
 * <input value={table.filters.busqueda} onChange={e => table.setFilter('busqueda', e.target.value)} />
 * <button onClick={() => table.handleSort('cliente')}>Cliente</button>
 * {table.paginatedCasos.map(caso => ...)}
 */

import { useState, useMemo, useCallback } from 'react'
import type { Caso } from '@/lib/types/database'
import {
  filterCasos,
  getCasosStats,
  getDefaultFilters,
  hasActiveFilters,
  type CasosFilters,
} from '@/lib/casos/filters'
import {
  sortCasos,
  getNextSortConfig,
  getDefaultSortConfig,
  type SortField,
  type SortConfig,
} from '@/lib/casos/sorting'
import {
  paginateItems,
  getPageRange,
  getResetPage,
  getNextPage,
  getPrevPage,
  getPaginationInfo,
  getDefaultPaginationConfig,
  type PaginationConfig,
} from '@/lib/casos/pagination'

interface UseCasosTableResult {
  // Datos procesados
  paginatedCasos: Caso[]
  filteredCasos: Caso[]
  allCasos: Caso[]
  
  // Filtros
  filters: CasosFilters
  setFilter: (key: keyof CasosFilters, value: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
  
  // Sorting
  sort: SortConfig
  handleSort: (field: SortField) => void
  
  // Paginación
  pagination: {
    currentPage: number
    totalPages: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
    pageRange: number[]
    info: ReturnType<typeof getPaginationInfo>
  }
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  firstPage: () => void
  lastPage: () => void
  
  // Estadísticas
  stats: ReturnType<typeof getCasosStats>
}

export function useCasosTable(casos: Caso[]): UseCasosTableResult {
  // Estado de filtros
  const [filters, setFilters] = useState<CasosFilters>(getDefaultFilters())
  
  // Estado de ordenamiento
  const [sort, setSort] = useState<SortConfig>(getDefaultSortConfig())
  
  // Estado de paginación
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>(
    getDefaultPaginationConfig()
  )
  
  // Procesar datos: filtrar -> ordenar -> paginar
  const { filteredCasos, paginationResult } = useMemo(() => {
    // 1. Filtrar
    const filtered = filterCasos(casos, filters)
    
    // 2. Ordenar
    const sorted = sortCasos(filtered, sort)
    
    // 3. Paginar
    const paginated = paginateItems(sorted, paginationConfig)
    
    return {
      filteredCasos: filtered,
      paginationResult: paginated,
    }
  }, [casos, filters, sort, paginationConfig])
  
  // Estadísticas
  const stats = useMemo(() => getCasosStats(filteredCasos), [filteredCasos])
  
  // Página range para el paginador
  const pageRange = useMemo(
    () => getPageRange(paginationConfig.currentPage, paginationResult.totalPages),
    [paginationConfig.currentPage, paginationResult.totalPages]
  )
  
  // Información de paginación
  const paginationInfo = useMemo(
    () =>
      getPaginationInfo(
        paginationConfig.currentPage,
        paginationConfig.itemsPerPage,
        filteredCasos.length
      ),
    [paginationConfig.currentPage, paginationConfig.itemsPerPage, filteredCasos.length]
  )
  
  // Handler: Cambiar un filtro
  const setFilter = useCallback((key: keyof CasosFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    // Resetear a página 1 cuando cambian los filtros
    setPaginationConfig(prev => ({ ...prev, currentPage: getResetPage() }))
  }, [])
  
  // Handler: Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters(getDefaultFilters())
    setPaginationConfig(prev => ({ ...prev, currentPage: getResetPage() }))
  }, [])
  
  // Handler: Cambiar ordenamiento
  const handleSort = useCallback((field: SortField) => {
    setSort(prev => getNextSortConfig(prev, field))
    // Resetear a página 1 cuando cambia el ordenamiento
    setPaginationConfig(prev => ({ ...prev, currentPage: getResetPage() }))
  }, [])
  
  // Handler: Ir a página específica
  const setPage = useCallback((page: number) => {
    setPaginationConfig(prev => ({ ...prev, currentPage: page }))
  }, [])
  
  // Handler: Página siguiente
  const nextPage = useCallback(() => {
    setPaginationConfig(prev => ({
      ...prev,
      currentPage: getNextPage(prev.currentPage, paginationResult.totalPages),
    }))
  }, [paginationResult.totalPages])
  
  // Handler: Página anterior
  const prevPage = useCallback(() => {
    setPaginationConfig(prev => ({
      ...prev,
      currentPage: getPrevPage(prev.currentPage),
    }))
  }, [])
  
  // Handler: Primera página
  const firstPage = useCallback(() => {
    setPaginationConfig(prev => ({ ...prev, currentPage: 1 }))
  }, [])
  
  // Handler: Última página
  const lastPage = useCallback(() => {
    setPaginationConfig(prev => ({
      ...prev,
      currentPage: paginationResult.totalPages,
    }))
  }, [paginationResult.totalPages])
  
  return {
    // Datos
    paginatedCasos: paginationResult.items,
    filteredCasos,
    allCasos: casos,
    
    // Filtros
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters: hasActiveFilters(filters),
    
    // Sorting
    sort,
    handleSort,
    
    // Paginación
    pagination: {
      currentPage: paginationConfig.currentPage,
      totalPages: paginationResult.totalPages,
      itemsPerPage: paginationConfig.itemsPerPage,
      hasNextPage: paginationResult.hasNextPage,
      hasPrevPage: paginationResult.hasPrevPage,
      pageRange,
      info: paginationInfo,
    },
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    
    // Estadísticas
    stats,
  }
}
