/**
 * Utilidades de paginación para casos
 * Funciones PURAS - sin side effects
 */

export interface PaginationConfig {
  currentPage: number
  itemsPerPage: number
}

export interface PaginationResult<T> {
  items: T[]
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Pagina un array de elementos
 * 
 * @example
 * const result = paginateItems(casos, { currentPage: 2, itemsPerPage: 20 })
 * // result.items contiene los casos de la página 2
 */
export function paginateItems<T>(
  items: T[],
  config: PaginationConfig
): PaginationResult<T> {
  const totalPages = Math.ceil(items.length / config.itemsPerPage)
  const startIndex = (config.currentPage - 1) * config.itemsPerPage
  const endIndex = startIndex + config.itemsPerPage
  
  return {
    items: items.slice(startIndex, endIndex),
    totalPages,
    hasNextPage: config.currentPage < totalPages,
    hasPrevPage: config.currentPage > 1,
  }
}

/**
 * Calcula el rango de páginas a mostrar en el paginador
 */
export function getPageRange(currentPage: number, totalPages: number): number[] {
  const pages: number[] = []
  
  // Siempre mostrar primera y última página
  // Mostrar página actual y adyacentes
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // Primera
      i === totalPages || // Última
      Math.abs(i - currentPage) <= 1 // Adyacentes
    ) {
      pages.push(i)
    }
  }
  
  return pages
}

/**
 * Calcula la nueva página al cambiar filtros o sorting
 * (resetea a página 1)
 */
export function getResetPage(): number {
  return 1
}

/**
 * Calcula la página siguiente
 */
export function getNextPage(currentPage: number, totalPages: number): number {
  return Math.min(currentPage + 1, totalPages)
}

/**
 * Calcula la página anterior
 */
export function getPrevPage(currentPage: number): number {
  return Math.max(currentPage - 1, 1)
}

/**
 * Valida que una página esté en el rango válido
 */
export function validatePage(page: number, totalPages: number): number {
  if (page < 1) return 1
  if (page > totalPages) return totalPages
  return page
}

/**
 * Configuración de paginación por defecto
 */
export function getDefaultPaginationConfig(): PaginationConfig {
  return {
    currentPage: 1,
    itemsPerPage: 20,
  }
}

/**
 * Calcula información de rango para mostrar "Mostrando X-Y de Z"
 */
export function getPaginationInfo(
  currentPage: number,
  itemsPerPage: number,
  totalItems: number
) {
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)
  
  return {
    start,
    end,
    total: totalItems,
    currentPage,
  }
}
