'use client'

import { useState } from 'react'
import FormularioPago from './FormularioPago'
import type { Pago } from '@/lib/types/database'

interface SeccionPagosProps {
  casoId: string
  pagos: Pago[]
}

export default function SeccionPagos({ casoId, pagos }: SeccionPagosProps) {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Pagos</h2>
          <button
            onClick={() => setMostrarForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
          >
            + Registrar Pago
          </button>
        </div>
        {pagos && pagos.length > 0 ? (
          <div className="space-y-3">
            {pagos.map((pago) => (
              <div key={pago.id} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">S/ {pago.monto?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(pago.fecha_pago).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">{pago.metodo_pago}</span>
                </div>
                {pago.notas && (
                  <p className="mt-1 text-sm text-gray-600">{pago.notas}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay pagos registrados</p>
        )}
      </div>

      {mostrarForm && (
        <FormularioPago
          casoId={casoId}
          onClose={() => setMostrarForm(false)}
        />
      )}
    </>
  )
}
