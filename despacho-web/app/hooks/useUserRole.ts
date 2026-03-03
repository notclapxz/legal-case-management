'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'
import type { RolUsuario } from '@/lib/types/database'

interface UseUserRoleReturn {
  rol: RolUsuario | null
  loading: boolean
  isAdmin: boolean
  isAbogado: boolean
  isSecretaria: boolean
}

/**
 * Hook para obtener el rol del usuario actual
 * Útil para mostrar/ocultar elementos según permisos
 */
export function useUserRole(): UseUserRoleReturn {
  const [rol, setRol] = useState<RolUsuario | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function cargarRol() {
      try {
        const supabase = createClient()
        
        // Obtener usuario actual
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setRol(null)
          return
        }
        
        // Obtener perfil con el rol
        const { data: profile } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', user.id)
          .single()
        
        setRol(profile?.rol || null)
      } catch (error) {
        logError('useUserRole', error)
        setRol(null)
      } finally {
        setLoading(false)
      }
    }
    
    cargarRol()
  }, [])

  return {
    rol,
    loading,
    isAdmin: rol === 'admin',
    isAbogado: rol === 'abogado',
    isSecretaria: rol === 'secretaria',
  }
}
