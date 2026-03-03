'use client'

interface PorHorasFormProps {
  tarifa_hora: number
  horas_trabajadas: number
  onChange: (clave: string, valor: number) => void
}

export default function PorHorasForm({ tarifa_hora, horas_trabajadas, onChange }: PorHorasFormProps) {
  const totalPorHoras = tarifa_hora * horas_trabajadas

  return (
    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
      <h3 className="font-semibold text-orange-900 mb-3">⏱️ Configurar por Horas</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Tarifa por hora</label>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-orange-900">S/</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tarifa_hora}
              onChange={(e) => onChange('tarifa_hora', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              placeholder="150.00"
            />
            <span className="text-sm text-gray-600">/hora</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">Horas trabajadas</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              value={horas_trabajadas}
              onChange={(e) => onChange('horas_trabajadas', parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
              placeholder="0.0"
            />
            <span className="text-sm text-gray-600">horas</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Total por horas trabajadas:</span>
          <span className="text-lg font-bold text-orange-900">S/ {totalPorHoras.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {horas_trabajadas} horas × S/ {tarifa_hora.toFixed(2)}/hora
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Puedes actualizar las horas trabajadas a medida que avanzas en el caso. El total
          se calculará automáticamente.
        </p>
      </div>
    </div>
  )
}
