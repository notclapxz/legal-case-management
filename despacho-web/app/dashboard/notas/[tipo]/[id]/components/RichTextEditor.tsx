'use client'

import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import { useEffect, useRef, useCallback } from 'react'
import imageCompression from 'browser-image-compression'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import ResizableImage from './ResizableImage'

interface RichTextEditorProps {
  contenido: string
  onChange: (html: string) => void
  onBlur?: () => void
  casoId: string
}

export default function RichTextEditor({ contenido, onChange, onBlur, casoId }: RichTextEditorProps) {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            x: {
              default: 0,
              parseHTML: element => parseInt(element.getAttribute('data-x') || '0'),
              renderHTML: attributes => {
                return { 'data-x': String(attributes.x || 0) }
              },
            },
            y: {
              default: 0,
              parseHTML: element => parseInt(element.getAttribute('data-y') || '0'),
              renderHTML: attributes => {
                return { 'data-y': String(attributes.y || 0) }
              },
            },
            width: {
              default: 500,
              parseHTML: element => parseInt(element.getAttribute('width') || '500'),
              renderHTML: attributes => {
                if (!attributes.width) return {}
                return { width: String(attributes.width) }
              },
            },
            height: {
              default: 'auto',
              parseHTML: element => element.getAttribute('height') || 'auto',
              renderHTML: attributes => {
                if (!attributes.height || attributes.height === 'auto') return {}
                return { height: String(attributes.height) }
              },
            },
          }
        },
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImage)
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
    ],
    content: contenido || '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-full text-gray-900',
        style: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      },
    },
    onUpdate: ({ editor }) => {
      try {
        let html = editor.getHTML()
        
        // Buscar todas las imágenes en el documento ProseMirror
        editor.state.doc.descendants((node) => {
          if (node.type.name === 'image') {
            const { src, x, y } = node.attrs
            
            // Escapar caracteres especiales en la URL para regex
            const escapedSrc = src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            
            // Buscar la imagen en el HTML serializado
            const imgRegex = new RegExp(`<img([^>]*src="${escapedSrc}"[^>]*)>`, 'g')
            
            html = html.replace(imgRegex, (match, attrs) => {
              let newAttrs = attrs
              
              // Remover data-x y data-y existentes (si los hay)
              newAttrs = newAttrs.replace(/\s*data-x="[^"]*"/g, '')
              newAttrs = newAttrs.replace(/\s*data-y="[^"]*"/g, '')
              
              // Agregar los valores actuales del modelo
              newAttrs += ` data-x="${x || 0}" data-y="${y || 0}"`
              
              return `<img${newAttrs}>`
            })
          }
        })
        
        onChange(html)
      } catch (error) {
        logError('RichTextEditor.onUpdate', error)
        onChange(editor.getHTML())
      }
    },
    onBlur: () => {
      queueMicrotask(() => {
        onBlur?.()
      })
    },
  })

  // Actualizar contenido cuando cambia la nota seleccionada
  useEffect(() => {
    if (editor && contenido !== editor.getHTML()) {
      queueMicrotask(() => {
        editor.commands.setContent(contenido || '<p></p>')
      })
    }
  }, [contenido, editor])

  // Función para comprimir y subir imagen
  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const options = {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' as const,
      }

      const compressedFile = await imageCompression(file, options)

      const fileName = `${casoId}/${Date.now()}-${compressedFile.name.replace(/\.[^/.]+$/, '')}.webp`
      
      const { data, error } = await supabase.storage
        .from('notas-imagenes')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('notas-imagenes')
        .getPublicUrl(data.path)

      editor?.chain().focus().setImage({ src: publicUrl }).run()

    } catch (error) {
      logError('RichTextEditor.uploadImage', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al subir imagen:\n\n${errorMessage}`)
    }
  }, [editor, casoId, supabase])

  // Manejar paste de imágenes
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault()
          const file = items[i].getAsFile()
          if (file) {
            await handleImageUpload(file)
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handleImageUpload])

  if (!editor) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-[#f5f5f5] border-b border-gray-200 p-2 flex flex-wrap gap-1">
        {/* Texto */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Negrita (Ctrl+B)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z" />
            </svg>
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Cursiva (Ctrl+I)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M11 5h6M7 19h6m1-14l-4 14" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('underline') ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Subrayado (Ctrl+U)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v10a5 5 0 0 0 10 0V3M5 21h14" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('highlight') ? 'bg-yellow-200 text-gray-900' : 'text-gray-700'
            }`}
            title="Resaltar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256">
              <path d="M252.49 107.51a12 12 0 0 0-17 0L192 151l-79-79l43.52-43.51a12 12 0 0 0-17-17L93.17 57.86a20 20 0 0 0-4.72 20.72L69.17 97.86a20 20 0 0 0 0 28.28L71 128l-55.49 55.51a12 12 0 0 0 4.7 19.87l72 24A11.8 11.8 0 0 0 96 228a12 12 0 0 0 8.49-3.52L136 193l1.86 1.86a20 20 0 0 0 28.28 0l19.27-19.27a20.3 20.3 0 0 0 6.59 1.13a19.86 19.86 0 0 0 14.14-5.86l46.35-46.34a12 12 0 0 0 0-17.01M92.76 202.27l-46.55-15.51L88 145l31 31ZM152 175l-55.51-55.48L89 112l15-15l63 63Z" />
            </svg>
          </button>
        </div>

        {/* Títulos */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-2 py-1 rounded text-sm font-bold hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Título 1"
          >
            H1
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 rounded text-sm font-semibold hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Título 2"
          >
            H2
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 rounded text-sm hover:bg-gray-200 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Título 3"
          >
            H3
          </button>
        </div>

        {/* Alineación */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Alinear izquierda"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Centrar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Alinear derecha"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Lista con viñetas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-gray-300 text-blue-600' : 'text-gray-700'
            }`}
            title="Lista numerada"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6v1m0 0v1m0-1h1M3 12v1m0 0v1m0-1h1M3 18v1m0 0v1m0-1h1" />
            </svg>
          </button>
        </div>

        {/* Imagen */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-700"
            title="Insertar imagen (o pega con Ctrl+V)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageUpload(file)
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />
      </div>

      {/* Estilos para listas y formateo */}
      <style jsx global>{`
        .ProseMirror {
          position: relative;
          min-height: 100%;
        }
        
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror li p {
          margin: 0;
        }
        
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.2;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.875rem 0 0.5rem 0;
          line-height: 1.3;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.75rem 0 0.5rem 0;
          line-height: 1.4;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        
        .ProseMirror mark {
          background-color: #fef08a;
          padding: 0.125rem 0.25rem;
          border-radius: 0.125rem;
        }
        
        .ProseMirror strong {
          font-weight: bold;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
