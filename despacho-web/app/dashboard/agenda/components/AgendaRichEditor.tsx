'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect } from 'react'

interface AgendaRichEditorProps {
  contenido: string
  onChange: (html: string) => void
  onBlur?: () => void
}

export default function AgendaRichEditor({ contenido, onChange, onBlur }: AgendaRichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false, // No necesitamos títulos en agenda
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'agenda-task-item',
        },
      }),
    ],
    content: contenido || '<p></p>',
    editorProps: {
      attributes: {
        class: 'agenda-editor prose prose-sm max-w-none focus:outline-none p-4 min-h-full text-white',
        style: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onBlur: () => {
      queueMicrotask(() => {
        onBlur?.()
      })
    },
  })

  // Actualizar contenido cuando cambia externamente
  useEffect(() => {
    if (editor && contenido !== editor.getHTML()) {
      queueMicrotask(() => {
        editor.commands.setContent(contenido || '<p></p>')
      })
    }
  }, [contenido, editor])

  if (!editor) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-[#1f1f1f]">
      {/* Toolbar simple */}
      <div className="bg-[#2a2a2a] border-b border-[#1f1f1f] p-2 flex items-center gap-1">
        {/* Botón de tarea */}
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`px-3 py-1.5 rounded text-sm hover:bg-[#3a3a3a] transition-colors flex items-center gap-2 ${
            editor.isActive('taskList') ? 'bg-[#3b82f6] text-white' : 'text-gray-300'
          }`}
          title="Lista de tareas"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Tarea
        </button>

        <div className="h-6 w-px bg-[#3a3a3a] mx-1"></div>

        {/* Botón de lista con viñetas */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-[#3a3a3a] transition-colors ${
            editor.isActive('bulletList') ? 'bg-[#3a3a3a] text-blue-400' : 'text-gray-400'
          }`}
          title="Lista con viñetas"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        </button>

        {/* Botón de lista numerada */}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-[#3a3a3a] transition-colors ${
            editor.isActive('orderedList') ? 'bg-[#3a3a3a] text-blue-400' : 'text-gray-400'
          }`}
          title="Lista numerada"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13M3 6v1m0 0v1m0-1h1M3 12v1m0 0v1m0-1h1M3 18v1m0 0v1m0-1h1" />
          </svg>
        </button>

        <div className="flex-1"></div>

        <span className="text-xs text-gray-500">
          Tip: Escribe 09:00 - Reunión para eventos con hora
        </span>
      </div>

      {/* Editor */}
      <div 
        className="flex-1 overflow-y-auto cursor-text"
        onMouseDown={(e) => {
          // Solo enfocar si el click es directamente en el contenedor (área vacía)
          if (e.target === e.currentTarget) {
            editor?.commands.focus('end')
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Estilos personalizados */}
      <style jsx global>{`
        .agenda-editor {
          color: #e5e7eb;
          min-height: 100%;
        }

        .agenda-editor p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }
        
        /* Hacer que el editor ocupe todo el espacio */
        .ProseMirror {
          min-height: 100%;
          outline: none;
        }

        .agenda-editor ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }

        .agenda-editor ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin: 0.25rem 0;
          padding-left: 0;
        }

        .agenda-editor ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-right: 0.5rem;
          user-select: none;
          margin-top: 0.15rem;
        }

        .agenda-editor ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 1.1rem;
          height: 1.1rem;
          cursor: pointer;
          accent-color: #3b82f6;
          border-radius: 0.25rem;
        }

        .agenda-editor ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }

        .agenda-editor ul[data-type="taskList"] li[data-checked="true"] > div > p {
          text-decoration: line-through;
          color: #9ca3af;
        }

        .agenda-editor ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .agenda-editor ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .agenda-editor li {
          margin: 0.25rem 0;
        }

        .agenda-editor li p {
          margin: 0;
        }

        /* Destacar horas en el texto (09:00, 14:30, etc) */
        .agenda-editor p:has-text {
          position: relative;
        }
      `}</style>
    </div>
  )
}
