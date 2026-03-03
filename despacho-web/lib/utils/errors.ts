// =====================================================
// ERROR HANDLING UTILITIES
// =====================================================

/**
 * Type guard para verificar si un error es una instancia de Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Extrae el mensaje de error de forma segura
 * @param error - Error desconocido (unknown)
 * @returns Mensaje de error legible
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'Error desconocido'
}

/**
 * Helper para console.error con type safety
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)
}

/**
 * Crea un mensaje de error formateado para UI
 */
export function formatErrorForUI(error: unknown, defaultMessage = 'Ocurrió un error'): string {
  const message = getErrorMessage(error)
  
  // Errores comunes de Supabase
  if (message.includes('violates foreign key constraint')) {
    return 'No se puede eliminar este registro porque tiene datos relacionados'
  }
  
  if (message.includes('violates not-null constraint')) {
    return 'Faltan campos obligatorios'
  }
  
  if (message.includes('violates unique constraint')) {
    return 'Este registro ya existe'
  }
  
  if (message.includes('violates check constraint')) {
    return 'Valor inválido para este campo'
  }
  
  // JWT/Auth errors
  if (message.includes('JWT') || message.includes('auth')) {
    return 'Sesión expirada. Por favor inicia sesión nuevamente'
  }
  
  // Network errors
  if (message.includes('fetch') || message.includes('network')) {
    return 'Error de conexión. Verifica tu internet'
  }
  
  return message || defaultMessage
}
