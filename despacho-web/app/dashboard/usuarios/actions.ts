'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { RolUsuario } from '@/lib/types/database'

interface CreateUserData {
  email: string
  password: string
  nombre_completo: string
  username: string
  rol: RolUsuario
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createUser(_data: CreateUserData) {
  const supabase = await createClient()

  // 1. Verificar que el usuario actual es admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    return { error: 'No autenticado' }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', currentUser.id)
    .single()

  if (currentProfile?.rol !== 'admin') {
    return { error: 'No tienes permisos para crear usuarios' }
  }

  // 2. Crear usuario en auth.users (requiere service role key)
  // NOTA: Esto requiere configurar Supabase Admin API
  // Por ahora, el admin debe crear usuarios manualmente desde Supabase Dashboard
  
  return { 
    error: 'Funcionalidad en desarrollo. Por ahora, crear usuarios desde Supabase Dashboard:\n1. Authentication → Users → Invite user\n2. Luego asignar rol en la tabla profiles' 
  }
}

export async function updateUserRole(userId: string, rol: RolUsuario) {
  const supabase = await createClient()

  // Verificar permisos
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    return { error: 'No autenticado' }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', currentUser.id)
    .single()

  if (currentProfile?.rol !== 'admin') {
    return { error: 'No tienes permisos para modificar usuarios' }
  }

  // Actualizar rol
  const { error } = await supabase
    .from('profiles')
    .update({ rol, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}

export async function toggleUserStatus(userId: string) {
  const supabase = await createClient()

  // Verificar permisos
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    return { error: 'No autenticado' }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', currentUser.id)
    .single()

  if (currentProfile?.rol !== 'admin') {
    return { error: 'No tienes permisos para modificar usuarios' }
  }

  // Obtener estado actual
  const { data: targetUser } = await supabase
    .from('profiles')
    .select('activo')
    .eq('id', userId)
    .single()

  // Cambiar estado
  const { error } = await supabase
    .from('profiles')
    .update({ 
      activo: !targetUser?.activo,
      updated_at: new Date().toISOString() 
    })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}
