'use client'

import Link from 'next/link'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

interface AgendaSidebarProps {
  mes: number
  anio: number
  onDayClick?: (dia: number) => void
}

export default function AgendaSidebar({ mes, anio }: AgendaSidebarProps) {
  return (
    <div className="h-full bg-[#2d2d2d] flex flex-col">
      {/* Header del sidebar */}
      <div className="p-4 border-b border-[#1f1f1f]">
        <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
          Calendario
        </h2>
      </div>

      {/* Información del mes/año */}
      <div className="flex-1 p-4">
        <div className="bg-[#1f1f1f] rounded-lg p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Mes y Año
          </p>
          <h3 className="text-xl font-bold text-white">
            {MESES[mes]}
          </h3>
          <p className="text-lg font-semibold text-gray-400">
            {anio}
          </p>
        </div>
      </div>

      {/* Botón volver al calendario */}
      <div className="p-4 border-t border-[#1f1f1f]">
        <Link
          href="/dashboard/agenda"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Volver al Calendario
        </Link>
      </div>
    </div>
  )
}
