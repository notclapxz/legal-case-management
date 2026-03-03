'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

import { useCasoForm } from '@/app/hooks/casos/useCasoForm'
import { CasoFormFields } from '@/app/components/casos/CasoFormFields'
import MetodoPagoForm from '@/app/components/casos/MetodoPagoForm'
import { UsuariosConAccesoCheckboxes } from '@/app/dashboard/casos/components/UsuariosConAccesoCheckboxes'
import { useUserRole } from '@/app/hooks/useUserRole'

export default function EditarCasoPage() {
  const params = useParams()
  const id = params.id as string
  const { isAdmin } = useUserRole()
  
  const { form, loading, error, success, handleSubmit, loadCaso } = useCasoForm({
    mode: 'edit',
    casoId: id
  })
  
  const [cargando, setCargando] = useState(true)
  const [mismaPersona, setMismaPersona] = useState(false)
  const [usuariosConAcceso, setUsuariosConAcceso] = useState<string[]>([])
  
  const { watch, setValue } = form
  const formaPago = watch('forma_pago')
  const clienteValue = watch('cliente')
  
  // Cargar caso al montar
  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      await loadCaso(id)
      setCargando(false)
    }
    cargar()
  }, [id, loadCaso])
  
  // Auto-sync patrocinado con cliente si checkbox activado
  useEffect(() => {
    if (mismaPersona && clienteValue) {
      setValue('patrocinado', clienteValue)
    }
  }, [clienteValue, mismaPersona, setValue])
  
  // Sync usuarios_con_acceso con form
  useEffect(() => {
    setValue('usuarios_con_acceso', usuariosConAcceso)
  }, [usuariosConAcceso, setValue])
  
  const handleMetodoPagoChange = (forma_pago: string, detalles: unknown) => {
    setValue('detalles_pago', detalles as never)
  }
  
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Cargando caso...</p>
        </div>
      </div>
    )
  }
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">¡Caso Actualizado!</h1>
          <p className="text-green-700 mb-4">
            Los cambios han sido guardados exitosamente.
          </p>
          <Link
            href="/dashboard/casos"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Ver todos los casos
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard/casos"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a casos
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Editar Caso</h1>
        </div>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Caso</h2>
            
            <CasoFormFields
              form={form}
              mismaPersona={mismaPersona}
              onMismaPersonaChange={setMismaPersona}
              showCodigoEstimado={true}
            />
          </div>
          
          {/* Método de Pago */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalles de Pago</h2>
            <MetodoPagoForm
              forma_pago={formaPago || ''}
              monto_total={watch('monto_total') || 0}
              monto_cobrado={watch('monto_cobrado') || 0}
              estado_caso={watch('estado_caso') || 'En proceso'}
              detalles_pago={watch('detalles_pago') || {}}
              onChange={handleMetodoPagoChange as never}
            />
          </div>
          
          {/* Usuarios con Acceso (solo admin) */}
          {isAdmin && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Usuarios con Acceso</h2>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los usuarios que tendrán acceso a este caso (además del creador).
              </p>
              <UsuariosConAccesoCheckboxes
                usuariosSeleccionados={usuariosConAcceso}
                onChange={setUsuariosConAcceso}
              />
            </div>
          )}
          
          {/* Botones */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/dashboard/casos"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
