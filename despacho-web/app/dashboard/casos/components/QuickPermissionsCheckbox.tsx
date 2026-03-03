'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

interface QuickPermissionsCheckboxProps {
  casoId: string
  usuariosConAcceso: string[]  // IDs de usuarios actuales
  onUpdate: (newUsuarios: string[]) => void
}

export function QuickPermissionsCheckbox({ 
  casoId, 
  usuariosConAcceso, 
  onUpdate 
}: QuickPermissionsCheckboxProps) {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .in('rol', ['abogado', 'secretaria'])
      .eq('activo', true)
      .order('nombre_completo')
      .then(({ data }) => setUsuarios(data || []))
  }, [])
  
  const handleToggle = async (userId: string) => {
    setSaving(true)
    
    const supabase = createClient()
    const newUsuarios = usuariosConAcceso.includes(userId)
      ? usuariosConAcceso.filter(id => id !== userId)
      : [...usuariosConAcceso, userId]
    
    const { error } = await supabase
      .from('casos')
      .update({ usuarios_con_acceso: newUsuarios })
      .eq('id', casoId)
    
    if (!error) {
      onUpdate(newUsuarios)
    }
    
    setSaving(false)
  }
  
  const handleClose = () => setIsOpen(false)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
        title="Compartir caso"
      >
        <span className="text-lg">👥</span>
        {usuariosConAcceso.length > 0 && (
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            {usuariosConAcceso.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={handleClose}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Dar acceso a:
                </h4>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {usuarios.length === 0 ? (
                <p className="text-sm text-gray-500 py-2">
                  No hay usuarios disponibles
                </p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {usuarios.map(usuario => (
                    <label 
                      key={usuario.id}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded transition-colors ${
                        saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={usuariosConAcceso.includes(usuario.id)}
                        onChange={() => handleToggle(usuario.id)}
                        disabled={saving}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {usuario.nombre_completo || usuario.username}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {usuario.rol}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 Los usuarios tendrán acceso al caso pero NO a información financiera
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
