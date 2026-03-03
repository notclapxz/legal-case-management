/**
 * Hook para manejar estado de modales
 * 
 * Evita tener múltiples useState para cada modal
 * y proporciona una API consistente
 * 
 * @example
 * const deleteModal = useModal<Caso>()
 * 
 * // Abrir modal con datos
 * <button onClick={() => deleteModal.open(caso)}>Eliminar</button>
 * 
 * // En el modal
 * <DeleteModal 
 *   isOpen={deleteModal.isOpen}
 *   data={deleteModal.data}
 *   onClose={deleteModal.close}
 * />
 */

import { useState, useCallback } from 'react'

interface UseModalResult<T> {
  isOpen: boolean
  data: T | null
  open: (data: T) => void
  close: () => void
  toggle: () => void
}

export function useModal<T = unknown>(): UseModalResult<T> {
  const [isOpen, setIsOpen] = useState(false)
  const [data, setData] = useState<T | null>(null)
  
  const open = useCallback((modalData: T) => {
    setData(modalData)
    setIsOpen(true)
  }, [])
  
  const close = useCallback(() => {
    setIsOpen(false)
    // Limpiar data después de cerrar (con delay para animación)
    setTimeout(() => setData(null), 300)
  }, [])
  
  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])
  
  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  }
}

/**
 * Hook para manejar múltiples modales
 * 
 * Nota: Para evitar violar las reglas de hooks,
 * es mejor crear múltiples instancias directamente:
 * 
 * @example
 * const deleteModal = useModal<Caso>()
 * const moveModal = useModal<Caso>()
 * const editModal = useModal<Caso>()
 */
