'use client'

import { useState } from 'react'
import Split from 'react-split'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import NotasSidebar from './NotasSidebar'
import NotasList from './NotasList'
import NotasEditor from './NotasEditor'
import Link from 'next/link'
import type { Caso, Carpeta, Nota } from '@/lib/types/database'
import pptxgen from 'pptxgenjs'
import { parseHTML, convertTextRunsToPptxFormat } from '@/lib/html-to-pptx-parser'

interface TakeNoteLayoutProps {
  tipo: 'caso' | 'carpeta'
  id: string
  entidad: Caso | Carpeta
  notas: Nota[]
}

export default function TakeNoteLayout({ tipo, id, entidad, notas: initialNotas }: TakeNoteLayoutProps) {
  const supabase = createClient()
  const [notas, setNotas] = useState(initialNotas)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    initialNotas.length > 0 ? initialNotas[0].id : null
  )
  const [busqueda, setBusqueda] = useState('')

  // Extraer datos comunes de caso o carpeta
  const codigo = tipo === 'caso' ? (entidad as Caso).codigo_estimado : (entidad as Carpeta).nombre
  const nombre = tipo === 'caso' ? (entidad as Caso).cliente : (entidad as Carpeta).descripcion || ''
  const descripcion = tipo === 'caso' ? (entidad as Caso).descripcion : ''
  const tipoCaso = tipo === 'caso' ? (entidad as Caso).tipo : undefined

  // Filtrar notas solo por búsqueda
  const notasFiltradas = notas.filter((nota) => {
    if (busqueda && !nota.contenido.toLowerCase().includes(busqueda.toLowerCase())) {
      return false
    }
    return true
  })

  const selectedNota = notas.find((n) => n.id === selectedNoteId)

  // Función para actualizar una nota en el estado
  const updateNotaInState = (notaId: string, updates: Partial<Nota>) => {
    setNotas(prevNotas =>
      prevNotas.map(nota =>
        nota.id === notaId ? { ...nota, ...updates } : nota
      )
    )
  }

  // Función para crear nueva nota
  const handleNuevaNota = async () => {
    try {
      const insertData = tipo === 'caso'
        ? { caso_id: id, carpeta_id: null }
        : { caso_id: null, carpeta_id: id }

      const { data, error } = await supabase
        .from('notas')
        .insert([{
          ...insertData,
          contenido: '',
          categoria: 'General',
          prioridad: 'Media',
          completado: false,
        }])
        .select()
        .single()

      if (error) throw error

      // Agregar la nota al estado local
      if (data) {
        setNotas(prevNotas => [data, ...prevNotas])
        setSelectedNoteId(data.id)
      }
    } catch (error) {
      logError('TakeNoteLayout.crear', error)
      alert('Error al crear la nota')
    }
  }

  // Función para eliminar nota
  const handleEliminarNota = async (notaId: string) => {
    try {
      const { error } = await supabase
        .from('notas')
        .delete()
        .eq('id', notaId)

      if (error) throw error

      // Eliminar del estado local
      setNotas(prevNotas => prevNotas.filter(n => n.id !== notaId))
      setSelectedNoteId(null)
    } catch (error) {
      logError('TakeNoteLayout.eliminar', error)
      alert('Error al eliminar la nota')
    }
  }

  // Función para exportar notas a PowerPoint (Estilo Profesional)
  const handleExportarPPT = async () => {
    try {
      const pptx = new pptxgen()
      
      // Configuración general
      pptx.author = 'MLP Abogados'
      pptx.company = 'MLP Abogados'
      pptx.title = `${codigo} - ${nombre}`
      pptx.subject = descripcion || 'Presentación'
      
      // Definir tema de colores
      const COLORES = {
        azulPrimario: '1e40af',
        azulHeader: '3b82f6',
        textoOscuro: '1f2937',
        textoClaro: 'ffffff',
        textoGris: '6b7280',
        fondoClaro: 'f9fafb'
      }

      // SLIDE 1: PORTADA
      const slidePortada = pptx.addSlide()
      slidePortada.background = { color: COLORES.azulPrimario }
      
      slidePortada.addText(tipoCaso || (tipo === 'carpeta' ? 'CARPETA' : 'CASO LEGAL'), {
        x: 0.5,
        y: 1.8,
        w: '90%',
        h: 0.5,
        fontSize: 16,
        color: '93c5fd',
        bold: true,
        align: 'center'
      })
      
      slidePortada.addText(codigo, {
        x: 0.5,
        y: 2.5,
        w: '90%',
        h: 1.0,
        fontSize: 40,
        color: COLORES.textoClaro,
        bold: true,
        align: 'center'
      })
      
      slidePortada.addText(nombre, {
        x: 0.5,
        y: 3.7,
        w: 9,
        h: 0.6,
        fontSize: 22,
        color: 'e5e7eb',
        align: 'center'
      })
      
      if (descripcion) {
        slidePortada.addText(descripcion, {
          x: 1,
          y: 4.5,
          w: 8,
          h: 0.6,
          fontSize: 14,
          color: 'd1d5db',
          italic: true,
          align: 'center'
        })
      }
      
      slidePortada.addText('MLP Abogados', {
        x: 0.5,
        y: 5.5,
        w: 9,
        h: 0.3,
        fontSize: 16,
        color: 'ffffff',
        bold: true,
        align: 'center'
      })
      
      slidePortada.addText(new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), {
        x: 0.5,
        y: 5.9,
        w: '90%',
        h: 0.3,
        fontSize: 11,
        color: '9ca3af',
        align: 'center'
      })

      // PROCESAR NOTAS
      const notasOrdenadas = [...notas].sort((a, b) => 
        new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime()
      )
      
      let slideNumber = 1
      
      for (const nota of notasOrdenadas) {
        const elements = parseHTML(nota.contenido)
        let currentSlide: pptxgen.Slide | null = null
        let currentY = 1.2
        
        for (let i = 0; i < elements.length; i++) {
          const el = elements[i]
          
          if (el.type === 'heading' && (el.level === 1 || el.level === 2 || el.level === 3)) {
            currentSlide = pptx.addSlide()
            slideNumber++
            currentY = 1.2
            
            currentSlide.addShape(pptx.ShapeType.rect, {
              x: 0,
              y: 0,
              w: '100%',
              h: 0.8,
              fill: { color: COLORES.azulHeader }
            })
            
            currentSlide.addText(el.content || '', {
              x: 0.5,
              y: 0.15,
              w: 9,
              h: 0.5,
              fontSize: el.level === 1 ? 28 : el.level === 2 ? 24 : 20,
              color: COLORES.textoClaro,
              bold: true,
              valign: 'middle'
            })
            
            currentSlide.addText(`${codigo}`, {
              x: 0.5,
              y: 7,
              w: 4,
              h: 0.3,
              fontSize: 10,
              color: COLORES.textoGris
            })
            
            currentSlide.addText(`Pág. ${slideNumber}`, {
              x: 5.5,
              y: 7,
              w: 4,
              h: 0.3,
              fontSize: 10,
              color: COLORES.textoGris,
              align: 'right'
            })
            
            continue
          }
          
          if (!currentSlide) {
            currentSlide = pptx.addSlide()
            slideNumber++
            currentY = 0.8
            
            currentSlide.addText('Contenido', {
              x: 0.5,
              y: 0.3,
              w: 9,
              h: 0.4,
              fontSize: 24,
              color: COLORES.azulPrimario,
              bold: true
            })
            
            currentSlide.addText(`${codigo}`, {
              x: 0.5,
              y: 7,
              w: 4,
              h: 0.3,
              fontSize: 10,
              color: COLORES.textoGris
            })
            
            currentSlide.addText(`Pág. ${slideNumber}`, {
              x: 5.5,
              y: 7,
              w: 4,
              h: 0.3,
              fontSize: 10,
              color: COLORES.textoGris,
              align: 'right'
            })
          }
          
          if (el.type === 'paragraph' && el.textRuns) {
            currentSlide.addText(convertTextRunsToPptxFormat(el.textRuns), {
              x: 0.5,
              y: currentY,
              w: 9,
              fontSize: 18,
              color: COLORES.textoOscuro,
              lineSpacing: 24
            })
            currentY += 0.5
          }
          
          if (el.type === 'list' && el.children) {
            for (const child of el.children) {
              if (child.textRuns) {
                currentSlide.addText(convertTextRunsToPptxFormat(child.textRuns), {
                  x: 1,
                  y: currentY,
                  w: 8.5,
                  fontSize: 16,
                  color: COLORES.textoOscuro,
                  bullet: { type: el.ordered ? 'number' : 'bullet' }
                })
                currentY += 0.4
              }
            }
          }
          
          if (currentY > 6.5) break
        }
      }

      const fileName = `${codigo.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pptx`
      await pptx.writeFile({ fileName })
      
      alert(`✅ Presentación generada exitosamente\n\n${slideNumber} slides creadas`)
    } catch (error) {
      logError('TakeNoteLayout.generarPPT', error)
      alert('❌ Error al generar la presentación PowerPoint')
    }
  }

  const volverUrl = tipo === 'caso' ? `/dashboard/casos/${id}` : `/dashboard/casos`

  return (
    <div className="h-screen flex flex-col bg-[#2d2d2d] overflow-hidden">
      <div className="h-9 bg-[#2d2d2d] border-b border-[#1f1f1f] flex items-center px-3">
        <Link
          href={volverUrl}
          className="text-gray-400 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver {tipo === 'caso' ? 'al caso' : 'a carpetas'}
        </Link>
        <div className="flex-1 text-center">
          <span className="text-gray-500 text-xs">{codigo} {nombre && `- ${nombre}`}</span>
        </div>
        <div className="w-20"></div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Split
          sizes={[12, 18, 70]}
          minSize={[140, 200, 400]}
          gutterSize={4}
          className="flex h-full"
          gutterStyle={() => ({
            backgroundColor: '#1a1a1a',
            cursor: 'col-resize',
          })}
        >
          <div className="h-full overflow-hidden">
            <NotasSidebar
              totalNotas={notas.length}
              tipo={tipo}
              entidad={entidad}
              onNuevaNota={handleNuevaNota}
              onExportarPPT={handleExportarPPT}
            />
          </div>

          <div className="h-full overflow-hidden">
            <NotasList
              notas={notasFiltradas}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              busqueda={busqueda}
              setBusqueda={setBusqueda}
            />
          </div>

          <div className="h-full overflow-hidden">
            <NotasEditor
              nota={selectedNota ?? null}
              tipo={tipo}
              id={id}
              onNoteChange={updateNotaInState}
              onDelete={handleEliminarNota}
            />
          </div>
        </Split>
      </div>

      <style jsx global>{`
        .gutter {
          background-color: #1a1a1a;
          background-repeat: no-repeat;
          background-position: 50%;
        }

        .gutter:hover {
          background-color: #4a90e2;
        }

        .gutter.gutter-horizontal {
          cursor: col-resize;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
          background: #2d2d2d;
        }

        ::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 0;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #4d4d4d;
        }
      `}</style>
    </div>
  )
}
