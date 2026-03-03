/**
 * Utilidades de ordenamiento para casos
 * Funciones PURAS - sin side effects
 */

import type { Caso } from '@/lib/types/database'

export type SortField = 'codigo_estimado' | 'cliente' | 'tipo' | 'estado' | 'created_at'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}

/**
 * Obtiene el valor de un campo para ordenamiento
 */
function getSortValue(caso: Caso, field: SortField): string {
  switch (field) {
    case 'codigo_estimado':
      return caso.codigo_estimado || ''
    case 'cliente':
      return caso.cliente || ''
    case 'tipo':
      return caso.tipo || ''
    case 'estado':
      return caso.estado || ''
    case 'created_at':
      return caso.created_at || ''
    default:
      return ''
  }
}

/**
 * Ordena un array de casos según el campo y dirección especificados
 * 
 * @example
 * const sorted = sortCasos(casos, { field: 'cliente', direction: 'asc' })
 */
export function sortCasos(casos: Caso[], sort: SortConfig): Caso[] {
  // Crear copia para no mutar el original
  const sorted = [...casos]
  
  sorted.sort((a, b) => {
    const aVal = getSortValue(a, sort.field)
    const bVal = getSortValue(b, sort.field)
    
    const comparison = aVal.localeCompare(bVal)
    
    return sort.direction === 'asc' ? comparison : -comparison
  })
  
  return sorted
}

/**
 * Alterna la dirección de ordenamiento
 */
export function toggleSortDirection(currentDirection: SortDirection): SortDirection {
  return currentDirection === 'asc' ? 'desc' : 'asc'
}

/**
 * Calcula la nueva configuración de ordenamiento al hacer click en un campo
 */
export function getNextSortConfig(
  currentSort: SortConfig,
  clickedField: SortField
): SortConfig {
  if (currentSort.field === clickedField) {
    // Mismo campo: alternar dirección
    return {
      field: clickedField,
      direction: toggleSortDirection(currentSort.direction),
    }
  } else {
    // Nuevo campo: ordenar ascendente por defecto
    return {
      field: clickedField,
      direction: 'asc',
    }
  }
}

/**
 * Configuración de ordenamiento por defecto
 */
export function getDefaultSortConfig(): SortConfig {
  return {
    field: 'created_at',
    direction: 'desc',
  }
}
