'use client'

import { useState } from 'react'
import TabsCaso from './TabsCaso'
import VistaGeneral from './VistaGeneral'
import VistaNotasAppleStyle from './VistaNotasAppleStyle'
import type { Caso, Evento, Pago, Nota, UbicacionFisica } from '@/lib/types/database'

interface ContenedorTabsProps {
  caso: Caso
  eventos: Evento[]
  pagos: Pago[]
  notas: Nota[]
  ubicacion: UbicacionFisica | null
}

export default function ContenedorTabs({ caso, eventos, pagos, notas, ubicacion }: ContenedorTabsProps) {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="min-h-screen bg-gray-50">
      <TabsCaso activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'general' && (
        <div className="px-8 py-8">
          <VistaGeneral
            caso={caso}
            eventos={eventos}
            pagos={pagos}
            notas={notas}
            ubicacion={ubicacion}
          />
        </div>
      )}

      {activeTab === 'notas' && (
        <div className="h-[calc(100vh-140px)]">
          <VistaNotasAppleStyle
            casoId={caso.id}
            notas={notas}
          />
        </div>
      )}

      {activeTab === 'documentos' && (
        <div className="px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Gestión de Documentos</h3>
              <p className="mt-1 text-sm text-gray-500">Esta funcionalidad estará disponible próximamente.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
