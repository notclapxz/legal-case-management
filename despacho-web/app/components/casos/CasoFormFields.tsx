import type { UseFormReturn } from 'react-hook-form'

interface CasoFormFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  mismaPersona: boolean
  onMismaPersonaChange: (value: boolean) => void
  showCodigoEstimado?: boolean
}

export function CasoFormFields({ 
  form, 
  mismaPersona, 
  onMismaPersonaChange,
  showCodigoEstimado = false
}: CasoFormFieldsProps) {
  const { register, formState: { errors }, watch, setValue } = form
  
  // Helper para obtener mensaje de error
  const getErrorMessage = (field: string): string | undefined => {
    const error = errors[field]
    if (!error) return undefined
    if (typeof error === 'object' && 'message' in error) {
      return error.message as string
    }
    return undefined
  }
  
  // Auto-sync patrocinado con cliente si checkbox activado
  const clienteValue = watch('cliente')
  
  const handleMismaPersonaChange = (checked: boolean) => {
    onMismaPersonaChange(checked)
    if (checked) {
      setValue('patrocinado', clienteValue)
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Código Estimado (solo en editar) */}
      {showCodigoEstimado && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código Estimado
          </label>
          <input
            type="text"
            {...register('codigo_estimado')}
            disabled
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </div>
      )}
      
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cliente <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('cliente')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.cliente ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Nombre del cliente"
        />
        {errors.cliente && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("cliente")}</p>
        )}
      </div>
      
      {/* Checkbox "Cliente y patrocinado son la misma persona" */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="misma-persona"
          checked={mismaPersona}
          onChange={(e) => handleMismaPersonaChange(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="misma-persona" className="text-sm text-gray-700">
          Cliente y patrocinado son la misma persona
        </label>
      </div>
      
      {/* Patrocinado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patrocinado <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('patrocinado')}
          disabled={mismaPersona}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.patrocinado ? 'border-red-500' : 'border-gray-300'
          } ${mismaPersona ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          placeholder="Nombre del patrocinado"
        />
        {errors.patrocinado && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("patrocinado")}</p>
        )}
      </div>
      
      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          {...register('descripcion')}
          rows={4}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.descripcion ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descripción del caso"
        />
        {errors.descripcion && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("descripcion")}</p>
        )}
      </div>
      
      {/* Tipo de Caso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Caso <span className="text-red-500">*</span>
        </label>
        <select
          {...register('tipo')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.tipo ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="Penal">Penal</option>
          <option value="Civil">Civil</option>
          <option value="Laboral">Laboral</option>
          <option value="Administrativo">Administrativo</option>
        </select>
        {errors.tipo && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("tipo")}</p>
        )}
      </div>
      
      {/* Etapa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Etapa <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register('etapa')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.etapa ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Etapa del caso"
        />
        {errors.etapa && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("etapa")}</p>
        )}
      </div>
      
      {/* Fecha de Inicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de Inicio <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          {...register('fecha_inicio')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.fecha_inicio ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.fecha_inicio && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("fecha_inicio")}</p>
        )}
      </div>
      
      {/* Estado del Caso */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estado del Caso <span className="text-red-500">*</span>
        </label>
        <select
          {...register('estado_caso')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.estado_caso ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="En proceso">En proceso</option>
          <option value="Ganado">Ganado</option>
          <option value="Perdido">Perdido</option>
        </select>
        {errors.estado_caso && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("estado_caso")}</p>
        )}
      </div>
      
      {/* Ubicación Física */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación Física
        </label>
        <input
          type="text"
          {...register('ubicacion_fisica')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.ubicacion_fisica ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ubicación del expediente físico"
        />
        {errors.ubicacion_fisica && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("ubicacion_fisica")}</p>
        )}
      </div>
      
      {/* Forma de Pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Forma de Pago <span className="text-red-500">*</span>
        </label>
        <select
          {...register('forma_pago')}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.forma_pago ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="Monto fijo">Monto fijo</option>
          <option value="Por etapas">Por etapas</option>
          <option value="Por hora">Por hora</option>
          <option value="Cuota litis">Cuota litis</option>
        </select>
        {errors.forma_pago && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("forma_pago")}</p>
        )}
      </div>
      
      {/* Monto Total */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Total <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          {...register('monto_total', { valueAsNumber: true })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.monto_total ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0.00"
        />
        {errors.monto_total && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("monto_total")}</p>
        )}
      </div>
      
      {/* Monto Cobrado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monto Cobrado <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          {...register('monto_cobrado', { valueAsNumber: true })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
            errors.monto_cobrado ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0.00"
        />
        {errors.monto_cobrado && (
          <p className="text-red-500 text-sm mt-1">{getErrorMessage("monto_cobrado")}</p>
        )}
      </div>
    </div>
  )
}
