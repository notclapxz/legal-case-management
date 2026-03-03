'use client'

import { useState } from 'react'
import type { Nota } from '@/lib/types/database'

interface NotasListProps {
  notas: Nota[]
  selectedNoteId: string | null
  onSelectNote: (id: string) => void
  busqueda: string
  setBusqueda: (busqueda: string) => void
}

export default function NotasList({
  notas,
  selectedNoteId,
  onSelectNote,
  busqueda,
  setBusqueda,
}: NotasListProps) {
  const [showOptions, setShowOptions] = useState<string | null>(null)

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sin fecha'
    const date = new Date(dateString)
    const now = new Date()

    // Comparar solo las fechas (ignorar horas)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const diffTime = nowOnly.getTime() - dateOnly.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} días`

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  // Helper: Convertir HTML a texto plano (solo en cliente)
  const htmlToText = (html: string): string => {
    if (typeof window === 'undefined') {
      // En servidor, hacer un simple strip de tags HTML con regex
      return html
        .replace(/<\/p>/gi, '\n')        // Convertir </p> en salto de línea
        .replace(/<br\s*\/?>/gi, '\n')   // Convertir <br> en salto de línea
        .replace(/<\/h[1-6]>/gi, '\n')   // Convertir headings en salto de línea
        .replace(/<\/div>/gi, '\n')      // Convertir </div> en salto de línea
        .replace(/<[^>]*>/g, '')         // Remover el resto de tags HTML
        .replace(/&nbsp;/g, ' ')         // Reemplazar nbsp
        .replace(/&amp;/g, '&')          // Reemplazar &
        .replace(/&lt;/g, '<')           // Reemplazar <
        .replace(/&gt;/g, '>')           // Reemplazar >
        .replace(/\n\n+/g, '\n')         // Normalizar saltos múltiples
        .trim()
    }
    
    // En cliente, agregar saltos de línea antes de extraer texto
    const div = document.createElement('div')
    div.innerHTML = html
      .replace(/<\/p>/gi, '\n')        // Convertir </p> en salto de línea
      .replace(/<br\s*\/?>/gi, '\n')   // Convertir <br> en salto de línea
      .replace(/<\/h[1-6]>/gi, '\n')   // Convertir headings en salto de línea
      .replace(/<\/div>/gi, '\n')      // Convertir </div> en salto de línea
    
    return (div.textContent || div.innerText || '').replace(/\n\n+/g, '\n').trim()
  }

  const getTitulo = (nota: Nota) => {
    if (!nota.contenido || nota.contenido.trim() === '') {
      return 'Nueva nota'
    }
    
    // Extraer texto plano del HTML
    const plainText = htmlToText(nota.contenido)
    const firstLine = plainText.split('\n')[0].trim()
    
    // Limitar a 50 caracteres para el título
    return firstLine.substring(0, 50) || 'Nueva nota'
  }

  const getPreview = (nota: Nota) => {
    if (!nota.contenido || nota.contenido.trim() === '') {
      return 'Escribe aquí...'
    }
    
    // Extraer texto plano del HTML
    const plainText = htmlToText(nota.contenido)
    
    // Obtener solo la SEGUNDA línea (índice 1)
    const lines = plainText.split('\n').filter(line => line.trim())
    const segundaLinea = lines[1]?.trim() || ''
    
    // Si no hay segunda línea, dejar vacío
    if (!segundaLinea) {
      return ''
    }
    
    // Limitar a 50 caracteres
    if (segundaLinea.length > 50) {
      return segundaLinea.substring(0, 50) + '...'
    }
    
    return segundaLinea
  }

  return (
    <div className="h-full bg-[#e5e5e5] flex flex-col">
      {/* Header con búsqueda */}
      <div className="p-2 bg-[#d5d5d5] border-b border-[#c5c5c5]">
        <div className="relative">
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en notas"
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#4a90e2] focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de notas */}
      <div className="flex-1 overflow-y-auto">
        {notas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <svg
              className="w-16 h-16 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600 font-medium">No hay notas</p>
            <p className="text-gray-500 text-sm mt-1">Crea una nueva nota para comenzar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-300">
            {notas.map((nota) => (
              <div
                key={nota.id}
                onClick={() => onSelectNote(nota.id)}
                className={`relative p-2.5 cursor-pointer transition-colors border-l-2 ${
                  selectedNoteId === nota.id
                    ? 'bg-[#4a90e2] border-[#4a90e2] text-white'
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-0.5">
                  <h3
                    className={`font-medium text-xs truncate flex-1 ${
                      selectedNoteId === nota.id ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {getTitulo(nota)}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowOptions(showOptions === nota.id ? null : nota.id)
                    }}
                    className={`ml-2 p-0.5 rounded hover:bg-black/10 ${
                      selectedNoteId === nota.id ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>
                </div>

                <p
                  className={`text-xs mb-1 line-clamp-1 ${
                    selectedNoteId === nota.id ? 'text-white/80' : 'text-gray-600'
                  }`}
                >
                  {getPreview(nota)}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      selectedNoteId === nota.id ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {formatDate(nota.created_at)}
                  </span>
                  {nota.categoria && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        selectedNoteId === nota.id
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {nota.categoria}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
