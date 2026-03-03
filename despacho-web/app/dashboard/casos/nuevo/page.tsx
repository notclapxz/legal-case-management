'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'

import { useCasoForm } from '@/app/hooks/casos/useCasoForm'
import { CasoFormFields } from '@/app/components/casos/CasoFormFields'
import MetodoPagoForm from '@/app/components/casos/MetodoPagoForm'
import { UsuariosConAccesoCheckboxes } from '@/app/dashboard/casos/components/UsuariosConAccesoCheckboxes'
import { useUserRole } from '@/app/hooks/useUserRole'

function NuevoCasoContent() {
  const { isAdmin } = useUserRole()
  const { form, loading, error, success, handleSubmit } = useCasoForm({
    mode: 'create'
  })
  
  const [mismaPersona, setMismaPersona] = useState(false)
  const [usuariosConAcceso, setUsuariosConAcceso] = useState<string[]>([])
  
  const { watch, setValue } = form
  const formaPago = watch('forma_pago')
  const clienteValue = watch('cliente')
  
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
  
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-2">¡Caso Creado!</h1>
          <p className="text-green-700 mb-4">
            El caso ha sido creado exitosamente.
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
          
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Caso</h1>
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
            
            {/* Info: Código Automático */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    ℹ️ Código Automático
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    El código del caso se generará automáticamente al guardar, basado en el nombre del cliente. Formato: <strong>INICIAL.APELLIDO-NUMERO</strong> (ej: C.AGUIRRE-15)
                  </p>
                </div>
              </div>
            </div>
            
            <CasoFormFields
              form={form}
              mismaPersona={mismaPersona}
              onMismaPersonaChange={setMismaPersona}
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
                'Crear Caso'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NuevoCasoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <NuevoCasoContent />
    </Suspense>
  )
}
