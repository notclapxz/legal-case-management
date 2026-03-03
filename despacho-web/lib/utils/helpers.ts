// =====================================================
// HELPER FUNCTIONS - Sistema Gestión Legal
// =====================================================
// Funciones de utilidad comunes usadas en toda la app
// =====================================================

/**
 * Obtiene el saludo apropiado según la hora del día
 * @returns Saludo: "Buenos días", "Buenas tardes", o "Buenas noches"
 */
export function obtenerSaludo(): string {
  const hora = new Date().getHours()
  
  if (hora < 12) {
    return 'Buenos días'
  } else if (hora < 19) {
    return 'Buenas tardes'
  } else {
    return 'Buenas noches'
  }
}

/**
 * Formatea una fecha a formato español completo
 * @param date - Fecha a formatear
 * @returns Fecha formateada (ej: "sábado, 17 de enero de 2026")
 */
export function formatearFechaCompleta(date: Date | string = new Date()): string {
  const fecha = typeof date === 'string' ? new Date(date) : date
  
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatea una fecha a formato corto
 * @param date - Fecha a formatear
 * @returns Fecha formateada (ej: "17/01/2026")
 */
export function formatearFechaCorta(date: Date | string | null | undefined): string {
  if (!date) return 'Sin fecha'
  
  const fecha = typeof date === 'string' ? new Date(date) : date
  
  return fecha.toLocaleDateString('es-ES')
}

/**
 * Formatea una fecha con hora
 * @param date - Fecha a formatear
 * @returns Fecha y hora formateadas (ej: "17/01/2026 14:30")
 */
export function formatearFechaHora(date: Date | string | null | undefined): string {
  if (!date) return 'Sin fecha'
  
  const fecha = typeof date === 'string' ? new Date(date) : date
  
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Calcula los días entre dos fechas
 * @param fecha1 - Primera fecha
 * @param fecha2 - Segunda fecha (default: hoy)
 * @returns Número de días de diferencia
 */
export function diasEntre(
  fecha1: Date | string,
  fecha2: Date | string = new Date()
): number {
  const f1 = typeof fecha1 === 'string' ? new Date(fecha1) : fecha1
  const f2 = typeof fecha2 === 'string' ? new Date(fecha2) : fecha2
  
  const diffTime = Math.abs(f2.getTime() - f1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Verifica si una fecha está próxima (dentro de N días)
 * @param fecha - Fecha a verificar
 * @param dias - Número de días de proximidad (default: 7)
 * @returns true si la fecha está dentro del rango
 */
export function estaProxima(
  fecha: Date | string | null | undefined,
  dias: number = 7
): boolean {
  if (!fecha) return false
  
  const fechaEvento = typeof fecha === 'string' ? new Date(fecha) : fecha
  const hoy = new Date()
  const limite = new Date()
  limite.setDate(hoy.getDate() + dias)
  
  return fechaEvento >= hoy && fechaEvento <= limite
}

/**
 * Trunca un texto a una longitud máxima
 * @param texto - Texto a truncar
 * @param maxLength - Longitud máxima
 * @param sufijo - Sufijo a agregar (default: "...")
 * @returns Texto truncado
 */
export function truncarTexto(
  texto: string,
  maxLength: number,
  sufijo: string = '...'
): string {
  if (texto.length <= maxLength) return texto
  return texto.substring(0, maxLength - sufijo.length) + sufijo
}

/**
 * Capitaliza la primera letra de un string
 * @param texto - Texto a capitalizar
 * @returns Texto capitalizado
 */
export function capitalizar(texto: string): string {
  if (!texto) return ''
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase()
}

/**
 * Genera iniciales de un nombre
 * @param nombre - Nombre completo
 * @returns Iniciales (ej: "Juan Pérez" → "JP")
 */
export function obtenerIniciales(nombre: string): string {
  if (!nombre) return ''
  
  const palabras = nombre.trim().split(/\s+/)
  
  if (palabras.length === 1) {
    return palabras[0].substring(0, 2).toUpperCase()
  }
  
  return palabras
    .slice(0, 2)
    .map(p => p.charAt(0).toUpperCase())
    .join('')
}

/**
 * Limpia y normaliza un string para búsqueda
 * @param texto - Texto a normalizar
 * @returns Texto normalizado (sin acentos, minúsculas)
 */
export function normalizarParaBusqueda(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .trim()
}

/**
 * Verifica si un string incluye otro (búsqueda insensible a acentos/mayúsculas)
 * @param textoCompleto - Texto donde buscar
 * @param busqueda - Texto a buscar
 * @returns true si encuentra coincidencia
 */
export function incluyeInsensitive(textoCompleto: string, busqueda: string): boolean {
  return normalizarParaBusqueda(textoCompleto).includes(
    normalizarParaBusqueda(busqueda)
  )
}

/**
 * Espera un tiempo determinado (útil para delays)
 * @param ms - Milisegundos a esperar
 * @returns Promise que se resuelve después del tiempo
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Genera un ID único simple
 * @returns String único basado en timestamp + random
 */
export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Clona profundo de un objeto (solo para objetos JSON-serializables)
 * @param obj - Objeto a clonar
 * @returns Copia profunda del objeto
 */
export function clonarObjeto<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Verifica si un valor está vacío (null, undefined, "", [], {})
 * @param valor - Valor a verificar
 * @returns true si está vacío
 */
export function estaVacio(valor: unknown): boolean {
  if (valor === null || valor === undefined) return true
  if (typeof valor === 'string') return valor.trim() === ''
  if (Array.isArray(valor)) return valor.length === 0
  if (typeof valor === 'object') return Object.keys(valor).length === 0
  return false
}

/**
 * Agrupa un array por una propiedad
 * @param array - Array a agrupar
 * @param propiedad - Propiedad por la cual agrupar
 * @returns Objeto con arrays agrupados
 */
export function agruparPor<T>(
  array: T[],
  propiedad: keyof T
): Record<string, T[]> {
  return array.reduce((grupos, item) => {
    const clave = String(item[propiedad])
    if (!grupos[clave]) {
      grupos[clave] = []
    }
    grupos[clave].push(item)
    return grupos
  }, {} as Record<string, T[]>)
}

/**
 * Ordena un array de objetos por una propiedad
 * @param array - Array a ordenar
 * @param propiedad - Propiedad por la cual ordenar
 * @param ascendente - true para ascendente, false para descendente
 * @returns Array ordenado (nueva copia)
 */
export function ordenarPor<T>(
  array: T[],
  propiedad: keyof T,
  ascendente: boolean = true
): T[] {
  const copia = [...array]
  
  return copia.sort((a, b) => {
    const valorA = a[propiedad]
    const valorB = b[propiedad]
    
    if (valorA < valorB) return ascendente ? -1 : 1
    if (valorA > valorB) return ascendente ? 1 : -1
    return 0
  })
}

/**
 * Remueve duplicados de un array
 * @param array - Array con posibles duplicados
 * @param propiedad - Propiedad por la cual verificar unicidad (opcional)
 * @returns Array sin duplicados
 */
export function removerDuplicados<T>(
  array: T[],
  propiedad?: keyof T
): T[] {
  if (!propiedad) {
    return Array.from(new Set(array))
  }
  
  const vistos = new Set<unknown>()
  return array.filter(item => {
    const valor = item[propiedad]
    if (vistos.has(valor)) return false
    vistos.add(valor)
    return true
  })
}
