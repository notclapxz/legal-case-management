'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { Profile } from '@/lib/types/database'

interface Props {
  usuariosSeleccionados: string[]  // IDs de usuarios con acceso
  onChange: (usuarios: string[]) => void
}

export function UsuariosConAccesoCheckboxes({ usuariosSeleccionados, onChange }: Props) {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    async function cargarUsuarios() {
      setLoading(true)
      setError('')
      
      try {
        const supabase = createClient()
        
        // Cargar lista de abogados y secretarias (excluyendo admin)
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .in('rol', ['abogado', 'secretaria'])
          .eq('activo', true)
          .order('nombre_completo')

        if (fetchError) throw fetchError
        
        setUsuarios(data || [])
      } catch (err) {
        logError('UsuariosConAccesoCheckboxes', err)
        setError('Error al cargar usuarios')
      } finally {
        setLoading(false)
      }
    }
    
    cargarUsuarios()
  }, [])

  const handleToggle = (userId: string) => {
    if (usuariosSeleccionados.includes(userId)) {
      onChange(usuariosSeleccionados.filter(id => id !== userId))
    } else {
      onChange([...usuariosSeleccionados, userId])
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dar acceso a:
        </label>
        <div className="text-sm text-gray-500">Cargando usuarios...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dar acceso a:
        </label>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    )
  }

  if (usuarios.length === 0) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Dar acceso a:
        </label>
        <div className="text-sm text-gray-500">
          No hay otros usuarios disponibles (abogados/secretarias)
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1">
          Dar acceso a otros usuarios
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Los usuarios seleccionados podrán ver el caso, notas y eventos, pero NO información financiera
        </p>
      </div>
      
      <div className="space-y-2 pl-1">
        {usuarios.map(usuario => (
          <label 
            key={usuario.id} 
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              checked={usuariosSeleccionados.includes(usuario.id)}
              onChange={() => handleToggle(usuario.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900">
              {usuario.nombre_completo || usuario.username}
              <span className="text-gray-500 ml-1.5 text-xs">
                ({usuario.rol === 'abogado' ? 'Abogado' : 'Secretaria'})
              </span>
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}
