'use client'

/**
 * Botón simple para alternar entre tarea pendiente [ ] y completada [x]
 */
export default function CheckboxToggle() {
  return (
    <button
      className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
      title="Alternar entre pendiente y completado"
    >
      <span className="text-lg font-bold">⚡ Alternar</span>
    </button>
  )
}
