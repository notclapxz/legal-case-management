'use client'

import type { EstadoProcesal } from '@/lib/types/database'

interface MontoFijoFormProps {
  numero_etapas: number
  periodo: string
  honorario_exito: number
  monto_total: number
  monto_cobrado: number
  estado_caso: EstadoProcesal | string
  onChange: (clave: string, valor: number | string | boolean) => void
}

export default function MontoFijoForm({
  numero_etapas,
  periodo,
  honorario_exito,
  monto_total,
  monto_cobrado,
  estado_caso,
  onChange,
}: MontoFijoFormProps) {
  const cuotaPeriodica = numero_etapas > 0 ? monto_total / numero_etapas : 0

  return (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-3">💰 Configurar Monto Fijo</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Número de cuotas
          </label>
          <input
            type="number"
            min="1"
            value={numero_etapas}
            onChange={(e) => onChange('numero_etapas', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Período de pago
          </label>
          <select
            value={periodo}
            onChange={(e) => onChange('periodo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
          >
            <option value="Semanal">Semanal</option>
            <option value="Quincenal">Quincenal</option>
            <option value="Mensual">Mensual</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Semestral">Semestral</option>
            <option value="Anual">Anual</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-3 rounded border border-gray-200">
        {monto_cobrado > 0 ? (
          <>
            <p className="text-sm font-medium text-gray-900">
              Estado actual de cuotas:
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Cuota 1:{' '}
              <span className="text-green-600 font-bold">
                S/ {Math.min(cuotaPeriodica, monto_cobrado).toFixed(2)}
              </span>{' '}
              {monto_cobrado >= cuotaPeriodica ? '(completa)' : '(parcial)'}
            </p>
            {numero_etapas > 1 && monto_cobrado < cuotaPeriodica * numero_etapas && (
              <p className="text-xs text-gray-500 mt-1">
                Cuota 2:{' '}
                <span className="text-orange-600 font-bold">
                  S/ {Math.max(0, monto_total - monto_cobrado).toFixed(2)}
                </span>{' '}
                (pendiente)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Total del caso: <span className="text-blue-900">S/ {monto_total.toFixed(2)}</span>
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900">
              Cuota {periodo.toLowerCase()}:{' '}
              <span className="text-blue-900 font-bold ml-2">
                S/ {cuotaPeriodica.toFixed(2)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {numero_etapas} cuotas • Total: S/ {(cuotaPeriodica * numero_etapas).toFixed(2)}
            </p>
          </>
        )}
      </div>

      {monto_cobrado > 0 && (
        <div className="p-3 rounded border bg-blue-50 border-blue-200">
          <div className="text-sm">
            <p className="font-medium text-gray-900 mb-2">Estado del pago:</p>
            <div className="space-y-1">
              <p className="text-gray-700">
                Cuotas pagadas:{' '}
                <span className="font-bold text-blue-900">
                  {(monto_cobrado / cuotaPeriodica).toFixed(2)}
                </span>{' '}
                de {numero_etapas}
              </p>
              <p className="text-gray-700">
                Monto registrado:{' '}
                <span className="font-bold text-blue-900">S/ {monto_cobrado.toFixed(2)}</span>
              </p>
              <p className="text-gray-700">
                Porcentaje pagado:{' '}
                <span className="font-bold text-blue-900">
                  {((monto_cobrado / monto_total) * 100).toFixed(1)}%
                </span>
              </p>
              <p className="text-gray-700">
                Saldo pendiente:{' '}
                <span className="font-bold text-orange-600">
                  S/ {Math.max(0, monto_total - monto_cobrado).toFixed(2)}
                </span>
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <p className="text-xs text-blue-800">
                📅 Para completar la siguiente cuota:{' '}
                S/ {(Math.ceil(monto_cobrado / cuotaPeriodica) * cuotaPeriodica - monto_cobrado).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Honorario de Éxito - Solo si el caso está ganado */}
      {estado_caso === 'Ganado' && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center mb-3">
            <span className="text-lg mr-2">🏆</span>
            <span className="text-sm font-bold text-green-900">Caso Ganado - Honorarios Adicionales</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={honorario_exito > 0}
                  onChange={(e) => onChange('honorario_exito', e.target.checked ? 5000 : 0)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-900">Honorario de éxito</span>
              </label>
              <p className="text-xs text-green-700 ml-7 mt-1">Monto adicional por ganar el caso</p>
            </div>

            {honorario_exito > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Monto de honorario de éxito
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={honorario_exito}
                  onChange={(e) => onChange('honorario_exito', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {estado_caso !== 'Ganado' && (
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            💡 Los honorarios de éxito estarán disponibles cuando el caso se marque como
            &quot;Ganado&quot;
          </p>
        </div>
      )}
    </div>
  )
}
