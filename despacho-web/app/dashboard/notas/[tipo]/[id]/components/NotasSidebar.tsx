'use client'

import type { Caso, Carpeta } from '@/lib/types/database'

interface NotasSidebarProps {
  totalNotas: number
  tipo: 'caso' | 'carpeta'
  entidad: Caso | Carpeta
  onNuevaNota: () => void
  onExportarPPT: () => void
}

export default function NotasSidebar({
  totalNotas,
  tipo,
  entidad,
  onNuevaNota,
  onExportarPPT,
}: NotasSidebarProps) {
  // Extraer datos según el tipo
  const codigo = tipo === 'caso' ? (entidad as Caso).codigo_estimado : (entidad as Carpeta).nombre
  const nombre = tipo === 'caso' ? (entidad as Caso).cliente : (entidad as Carpeta).descripcion || ''

  return (
    <div className="h-full bg-[#2d2d2d] border-r border-[#1f1f1f] flex flex-col">
      {/* Header con info */}
      <div className="p-3 border-b border-[#1f1f1f]">
        <div className="text-xs mb-3">
          <p className="font-semibold text-gray-300 text-sm mb-0.5">{codigo}</p>
          <p className="text-gray-400 text-xs truncate">{nombre}</p>
        </div>
        <div className="space-y-2">
          <button
            onClick={onNuevaNota}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full bg-[#4a90e2] hover:bg-[#5a9ff5] text-white rounded text-xs transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva nota
          </button>
          
          <button
            onClick={onExportarPPT}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full bg-[#ff6b35] hover:bg-[#ff7e4f] text-white rounded text-xs transition-colors font-medium"
            title="Exportar notas a PowerPoint para audiencia"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Exportar PPT
          </button>
        </div>
      </div>

      {/* Contador de notas */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{totalNotas} {totalNotas === 1 ? 'nota' : 'notas'}</span>
        </div>
      </div>
    </div>
  )
}
