'use client'

import type { Etapa } from './MetodoPagoForm'

interface PorEtapasFormProps {
  numero_etapas: number
  etapas: Etapa[]
  honorario_exito: number
  monto_total: number
  onChange: (clave: string, valor: number | string | boolean | Etapa[]) => void
}

export default function PorEtapasForm({
  numero_etapas,
  etapas,
  honorario_exito,
  monto_total,
  onChange,
}: PorEtapasFormProps) {
  const actualizarMontoEtapa = (indice: number, monto: number) => {
    const nuevasEtapas = etapas.map((etapa, i) => (i === indice ? { ...etapa, monto } : etapa))
    onChange('etapas', nuevasEtapas)
  }

  const eliminarEtapa = (indice: number) => {
    const nuevasEtapas = etapas.filter((_, i) => i !== indice)
    // Re-numerar etapas
    const etapasRenumeradas = nuevasEtapas.map((etapa, i) => ({ ...etapa, numero: i + 1 }))

    onChange('numero_etapas', etapasRenumeradas.length)
    onChange('etapas', etapasRenumeradas)
  }

  const totalEtapas = etapas.reduce((sum, etapa) => sum + etapa.monto, 0)

  return (
    <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
      <h3 className="font-semibold text-purple-900 mb-3">📋 Configurar por Etapas</h3>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Número de etapas
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={numero_etapas}
          onChange={(e) => {
            const num = parseInt(e.target.value) || 1

            // Primero actualizar el número de etapas
            onChange('numero_etapas', num)

            // Luego sincronizar las etapas con el número
            const nuevasEtapas = Array.from({ length: num }, (_, i) => ({
              numero: i + 1,
              monto: etapas[i]?.monto || 0,
            }))

            onChange('etapas', nuevasEtapas)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-900">Etapas del caso:</label>

        {etapas.map((etapa, index) => (
          <div key={index} className="flex gap-2 items-center bg-white p-3 rounded border">
            <span className="text-sm font-medium text-gray-900 w-16">Etapa {etapa.numero}:</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={etapa.monto}
              onChange={(e) => actualizarMontoEtapa(index, parseFloat(e.target.value) || 0)}
              placeholder="Monto"
              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
            />
            <span className="text-sm font-bold text-purple-900">S/</span>
            {etapas.length > 1 && (
              <button
                type="button"
                onClick={() => eliminarEtapa(index)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded border border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Total de etapas:</span>
          <span className="text-lg font-bold text-purple-900">S/ {totalEtapas.toFixed(2)}</span>
        </div>
        {Math.abs(totalEtapas - monto_total) > 0.01 && (
          <p className="text-xs text-orange-600 mt-2">
            ⚠️ El total de etapas (S/ {totalEtapas.toFixed(2)}) debe coincidir con el monto total
            del caso (S/ {monto_total.toFixed(2)})
          </p>
        )}
      </div>

      {/* Honorario de Éxito */}
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={honorario_exito > 0}
            onChange={(e) => onChange('honorario_exito', e.target.checked ? 5000 : 0)}
            className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
          />
          <span className="text-sm font-medium text-gray-900">Honorario de éxito si gana el caso</span>
        </label>

        {honorario_exito > 0 && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Monto de honorario de éxito
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={honorario_exito}
              onChange={(e) => onChange('honorario_exito', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-gray-900 font-medium"
              placeholder="0.00"
            />
          </div>
        )}
      </div>
    </div>
  )
}
