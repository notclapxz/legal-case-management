'use client'

import { useState } from 'react'
import FormularioEvento from './FormularioEvento'
import type { Evento } from '@/lib/types/database'

interface SeccionEventosProps {
  casoId: string
  codigoCaso: string
  cliente: string
  eventos: Evento[]
}

export default function SeccionEventos({ casoId, codigoCaso, cliente, eventos }: SeccionEventosProps) {
  const [mostrarForm, setMostrarForm] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Eventos y Audiencias</h2>
          <button
            onClick={() => setMostrarForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md"
          >
            + Nuevo Evento
          </button>
        </div>
        {eventos && eventos.length > 0 ? (
          <div className="space-y-3">
            {eventos.map((evento) => (
              <div key={evento.id} className="border-l-4 border-orange-500 pl-4 py-2 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{evento.titulo}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(evento.fecha_evento).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {evento.tipo}
                  </span>
                </div>
                {evento.descripcion && (
                  <p className="mt-1 text-sm text-gray-600">{evento.descripcion}</p>
                )}
                {evento.ubicacion && (
                  <p className="mt-1 text-xs text-gray-500">📍 {evento.ubicacion}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay eventos registrados</p>
        )}
      </div>

      {mostrarForm && (
        <FormularioEvento
          casoId={casoId}
          codigoCaso={codigoCaso}
          cliente={cliente}
          onClose={() => setMostrarForm(false)}
        />
      )}
    </>
  )
}
