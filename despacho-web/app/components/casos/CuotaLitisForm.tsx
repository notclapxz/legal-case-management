'use client'

import type { EstadoProcesal } from '@/lib/types/database'

interface CuotaLitisFormProps {
  porcentaje_litis: number
  condicion_litis: string
  estado_caso: EstadoProcesal | string
  onChange: (clave: string, valor: number | string) => void
}

export default function CuotaLitisForm({
  porcentaje_litis,
  condicion_litis,
  estado_caso,
  onChange,
}: CuotaLitisFormProps) {
  if (estado_caso !== 'Ganado') {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3">🏆 Cuota Litis</h3>

        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <p className="text-sm text-gray-700 text-center">
            ⚠️ La cuota litis solo aplica para casos <strong>ganados</strong>. Para activar esta opción,
            selecciona &quot;Ganado&quot; en el estado del caso.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 bg-green-50 rounded-lg">
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">🏆</span>
        <h3 className="font-semibold text-green-900">Caso Ganado - Configurar Cuota Litis</h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Porcentaje de ganancia
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            value={porcentaje_litis}
            onChange={(e) => onChange('porcentaje_litis', parseFloat(e.target.value) || 0)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
          />
          <span className="text-xl font-bold text-green-900">%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Porcentaje del resultado favorable que recibirás</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Condición favorable
        </label>
        <textarea
          value={condicion_litis}
          onChange={(e) => onChange('condicion_litis', e.target.value)}
          placeholder="Ej: Si se absuelve completamente al cliente o si se logra reducción de pena..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
        />
        <p className="text-xs text-gray-500 mt-1">Describe en qué consiste una victoria en este caso</p>
      </div>

      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>✅ Caso Ganado:</strong> Recibirás el {porcentaje_litis}% del monto recuperado o beneficio
          económico obtenido por la victoria.
        </p>
      </div>
    </div>
  )
}
