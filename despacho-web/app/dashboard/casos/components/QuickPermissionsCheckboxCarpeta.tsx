'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

interface QuickPermissionsCheckboxCarpetaProps {
  carpetaId: string
  nombreCarpeta: string
  usuariosConAcceso: string[]  // IDs de usuarios actuales
  onUpdate: (newUsuarios: string[]) => void
}

export function QuickPermissionsCheckboxCarpeta({ 
  carpetaId,
  nombreCarpeta,
  usuariosConAcceso, 
  onUpdate 
}: QuickPermissionsCheckboxCarpetaProps) {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  
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
      .from('carpetas')
      .update({ usuarios_con_acceso: newUsuarios })
      .eq('id', carpetaId)
    
    if (!error) {
      onUpdate(newUsuarios)
    }
    
    setSaving(false)
  }
  
  const handleClose = () => setIsOpen(false)
  
  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.top,
        left: rect.right + 8 // 8px de separación
      })
    }
  }, [isOpen])
  
  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation() // Evitar que se propague al click de la carpeta
          setIsOpen(!isOpen)
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-green-50 transition-colors text-gray-700"
        title={`Compartir carpeta "${nombreCarpeta}"`}
      >
        <span className="text-lg">👥</span>
        <span className="flex-1 text-left">Compartir carpeta</span>
        {usuariosConAcceso.length > 0 && (
          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
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
          
          {/* Dropdown - Posicionamiento fijo para evitar cortes */}
          <div 
            className="fixed w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Compartir carpeta
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5 truncate" title={nombreCarpeta}>
                    📁 {nombreCarpeta}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 ml-2"
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
                        saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={usuariosConAcceso.includes(usuario.id)}
                        onChange={() => handleToggle(usuario.id)}
                        disabled={saving}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
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
                  🌳 <strong>Permisos heredados:</strong> El usuario tendrá acceso a esta carpeta y TODOS los casos dentro (incluyendo subcarpetas).
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
