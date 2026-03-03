import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

import { casoSchema, casoEditSchema } from '@/lib/casos/validation'
import type { CasoFormData, CasoEditFormData } from '@/lib/casos/validation'
import type { Resolver } from 'react-hook-form'
import { logError } from '@/lib/utils/errors'

type CasoFormUnion = CasoFormData | CasoEditFormData

interface UseCasoFormOptions {
  mode: 'create' | 'edit'
  casoId?: string
  onSuccess?: () => void
}

export function useCasoForm(options: UseCasoFormOptions) {
  const { mode, casoId, onSuccess } = options
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const schema = mode === 'edit' ? casoEditSchema : casoSchema
  
  const form = useForm<CasoFormUnion>({
    resolver: zodResolver(schema) as Resolver<CasoFormUnion>,
    defaultValues: {
      cliente: '',
      patrocinado: '',
      descripcion: '',
      tipo: 'Penal',
      etapa: 'Preliminar',
      forma_pago: 'Monto fijo',
      monto_total: 0,
      monto_cobrado: 0,
      fecha_inicio: new Date().toISOString().split('T')[0],
      estado: 'Activo',
      estado_caso: 'En proceso',
      ubicacion_fisica: '',
      usuarios_con_acceso: [],
      detalles_pago: {
        cuotas: 1,
        periodo: 'Mensual',
        honorario_exito: 0,
        numero_etapas: 1,
        etapas: [{ numero: 1, monto: 0 }],
        porcentaje_litis: 20,
        condicion_litis: '',
        caso_ganado: false,
        tipo_caso: 'Penal',
        tarifa_hora: 150,
        horas_trabajadas: 0
      }
    },
    mode: 'onChange'
  })
  
  const handleSubmit = form.handleSubmit(async (data) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }
      
      // Preparar datos para la BD (solo campos que existen en la tabla)
      const casoData = {
        cliente: data.cliente.trim(),
        patrocinado: data.patrocinado.trim(),
        descripcion: data.descripcion?.trim() || '',
        tipo: data.tipo,
        etapa: data.etapa,
        abogado_asignado_id: data.abogado_asignado_id || user.id,
        forma_pago: data.forma_pago,
        monto_total: data.monto_total,
        monto_cobrado: data.monto_cobrado,
        fecha_inicio: data.fecha_inicio,
        estado: data.estado,
        estado_caso: data.estado_caso,
        ubicacion_fisica: data.ubicacion_fisica?.trim() || '',
        usuarios_con_acceso: data.usuarios_con_acceso || [],
        ...(mode === 'edit' && 'expediente' in data && data.expediente ? { expediente: data.expediente } : {})
      }
      
      if (mode === 'create') {
        // Crear nuevo caso
        const { error: insertError } = await supabase
          .from('casos')
          .insert([casoData])
        
        if (insertError) throw insertError
        
        setSuccess(true)
        if (onSuccess) {
          onSuccess()
        } else {
          setTimeout(() => {
            router.push('/dashboard/casos')
            router.refresh()
          }, 2000)
        }
      } else {
        // Editar caso existente
        if (!casoId) throw new Error('ID de caso no proporcionado')
        
        const { error: updateError } = await supabase
          .from('casos')
          .update(casoData)
          .eq('id', casoId)
        
        if (updateError) throw updateError
        
        setSuccess(true)
        if (onSuccess) {
          onSuccess()
        } else {
          setTimeout(() => {
            router.push('/dashboard/casos')
            router.refresh()
          }, 2000)
        }
      }
      
    } catch (err: unknown) {
      logError('useCasoForm', err)
      
      // Manejo de errores de Supabase
      if (err && typeof err === 'object' && 'message' in err) {
        const supabaseError = err as { message?: string; code?: string }
        
        let errorMessage = `Error al ${mode === 'create' ? 'crear' : 'actualizar'} el caso`
        
        if (supabaseError.code === '23505') {
          errorMessage = 'El código de caso ya existe. Usa otro código.'
        } else if (supabaseError.code === '23514') {
          errorMessage = 'Datos inválidos. Verifica los valores permitidos.'
        } else if (supabaseError.code === '23502') {
          errorMessage = 'Faltan campos obligatorios.'
        } else if (supabaseError.message) {
          errorMessage = supabaseError.message
        }
        
        setError(errorMessage)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(`Error inesperado al ${mode === 'create' ? 'crear' : 'actualizar'} el caso`)
      }
    } finally {
      setLoading(false)
    }
  })
  
  const loadCaso = async (id: string) => {
    try {
      setLoading(true)
      
      const { data: caso, error: casoError } = await supabase
        .from('casos')
        .select('id, codigo_estimado, cliente, patrocinado, descripcion, expediente, tipo, etapa, estado, estado_caso, forma_pago, monto_total, monto_cobrado, fecha_inicio, ubicacion_fisica, abogado_asignado_id, usuarios_con_acceso, detalles_pago')
        .eq('id', id)
        .single()
      
      if (casoError) throw casoError
      if (!caso) throw new Error('Caso no encontrado')
      
      // Cargar datos en el formulario
      form.reset({
        ...(mode === 'edit' && { codigo_estimado: caso.codigo_estimado || '' }),
        cliente: caso.cliente || '',
        patrocinado: caso.patrocinado || '',
        descripcion: caso.descripcion || '',
        expediente: caso.expediente || '',
        tipo: caso.tipo || 'Penal',
        etapa: caso.etapa || 'Preliminar',
        estado: caso.estado || 'Activo',
        estado_caso: caso.estado_caso || 'En proceso',
        forma_pago: caso.forma_pago || 'Monto fijo',
        monto_total: caso.monto_total || 0,
        monto_cobrado: caso.monto_cobrado || 0,
        ubicacion_fisica: caso.ubicacion_fisica || '',
        fecha_inicio: caso.fecha_inicio || '',
        abogado_asignado_id: caso.abogado_asignado_id || '',
        usuarios_con_acceso: caso.usuarios_con_acceso || []
      })
      
    } catch (err: unknown) {
      logError('useCasoForm.loadCaso', err)
      setError(err instanceof Error ? err.message : 'Error al cargar el caso')
    } finally {
      setLoading(false)
    }
  }
  
  return {
    form,
    loading,
    error,
    success,
    handleSubmit,
    loadCaso,
    setError
  }
}
