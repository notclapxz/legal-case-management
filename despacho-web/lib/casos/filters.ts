/**
 * Utilidades de filtrado para casos
 * Funciones PURAS - sin side effects
 * Testeables independientemente
 */

import type { Caso } from '@/lib/types/database'

export interface CasosFilters {
  busqueda: string
  estado: string
  tipo: string
  estadoCaso: string
  ubicacion: string
  fechaDesde: string
  fechaHasta: string
}

/**
 * Verifica si un caso coincide con el término de búsqueda
 */
function matchesSearch(caso: Caso, busqueda: string): boolean {
  if (!busqueda.trim()) return true
  
  const searchTerm = busqueda.toLowerCase()
  const fields = [
    caso.codigo_estimado,
    caso.cliente,
    caso.patrocinado,
    caso.descripcion,
    caso.expediente,
  ]
  
  return fields.some(field => 
    field?.toLowerCase().includes(searchTerm)
  )
}

/**
 * Verifica si un caso tiene ubicación física
 */
function hasUbicacionFisica(caso: Caso): boolean {
  return !!(caso.ubicacion_fisica && caso.ubicacion_fisica.trim() !== '')
}

/**
 * Verifica si un caso coincide con el filtro de ubicación
 */
function matchesUbicacion(caso: Caso, filtro: string): boolean {
  if (filtro === 'Todos') return true
  if (filtro === 'Con ubicación') return hasUbicacionFisica(caso)
  if (filtro === 'Solo virtuales') return !hasUbicacionFisica(caso)
  return true
}

/**
 * Verifica si un caso está dentro del rango de fechas
 */
function matchesFechaRange(
  caso: Caso,
  fechaDesde?: string,
  fechaHasta?: string
): boolean {
  if (!caso.fecha_inicio) return !fechaDesde && !fechaHasta
  
  const cumpleDesde = !fechaDesde || caso.fecha_inicio >= fechaDesde
  const cumpleHasta = !fechaHasta || caso.fecha_inicio <= fechaHasta
  
  return cumpleDesde && cumpleHasta
}

/**
 * Filtra un array de casos según los filtros especificados
 * 
 * @example
 * const filtered = filterCasos(casos, {
 *   busqueda: 'Juan',
 *   estado: 'Activo',
 *   tipo: 'Todos',
 *   estadoCaso: 'Todos',
 *   ubicacion: 'Todos',
 *   fechaDesde: '',
 *   fechaHasta: ''
 * })
 */
export function filterCasos(casos: Caso[], filters: CasosFilters): Caso[] {
  return casos.filter(caso => {
    const matchesBusqueda = matchesSearch(caso, filters.busqueda)
    const matchesEstado = filters.estado === 'Todos' || caso.estado === filters.estado
    const matchesTipo = filters.tipo === 'Todos' || caso.tipo === filters.tipo
    const matchesEstadoCaso = filters.estadoCaso === 'Todos' || caso.estado_caso === filters.estadoCaso
    const matchesUbicacionFilter = matchesUbicacion(caso, filters.ubicacion)
    const matchesFechas = matchesFechaRange(caso, filters.fechaDesde, filters.fechaHasta)
    
    return (
      matchesBusqueda &&
      matchesEstado &&
      matchesTipo &&
      matchesEstadoCaso &&
      matchesUbicacionFilter &&
      matchesFechas
    )
  })
}

/**
 * Cuenta casos activos
 */
export function countActiveCasos(casos: Caso[]): number {
  return casos.filter(c => c.estado === 'Activo').length
}

/**
 * Cuenta casos en proceso
 */
export function countCasosEnProceso(casos: Caso[]): number {
  return casos.filter(c => c.estado_caso === 'En proceso').length
}

/**
 * Genera estadísticas de casos
 */
export function getCasosStats(casos: Caso[]) {
  return {
    total: casos.length,
    activos: countActiveCasos(casos),
    enProceso: countCasosEnProceso(casos),
    pausados: casos.filter(c => c.estado === 'Pausado').length,
    cerrados: casos.filter(c => c.estado === 'Cerrado').length,
    ganados: casos.filter(c => c.estado_caso === 'Ganado').length,
    perdidos: casos.filter(c => c.estado_caso === 'Perdido').length,
  }
}

/**
 * Inicializa filtros con valores por defecto
 */
export function getDefaultFilters(): CasosFilters {
  return {
    busqueda: '',
    estado: 'Todos',
    tipo: 'Todos',
    estadoCaso: 'Todos',
    ubicacion: 'Todos',
    fechaDesde: '',
    fechaHasta: '',
  }
}

/**
 * Verifica si hay filtros activos
 */
export function hasActiveFilters(filters: CasosFilters): boolean {
  const defaults = getDefaultFilters()
  return Object.keys(filters).some(
    key => filters[key as keyof CasosFilters] !== defaults[key as keyof CasosFilters]
  )
}
