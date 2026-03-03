import { z } from 'zod'

// Schema para detalles de pago por etapas
const etapaSchema = z.object({
  numero: z.number().int().positive(),
  monto: z.number().min(0, 'El monto debe ser mayor o igual a 0')
})

// Schema para detalles de pago (opcional, depende de forma_pago)
export const detallesPagoSchema = z.object({
  cuotas: z.number().int().min(1, 'Debe haber al menos 1 cuota').default(1),
  periodo: z.enum(['Mensual', 'Quincenal', 'Semanal', 'Trimestral', 'Semestral', 'Anual']).default('Mensual'),
  honorario_exito: z.number().min(0).default(0),
  numero_etapas: z.number().int().min(1).default(1),
  etapas: z.array(etapaSchema).default([{ numero: 1, monto: 0 }]),
  porcentaje_litis: z.number().min(0).max(100, 'El porcentaje debe estar entre 0 y 100').default(20),
  condicion_litis: z.string().default(''),
  caso_ganado: z.boolean().default(false),
  tipo_caso: z.string().default('Penal'),
  tarifa_hora: z.number().min(0, 'La tarifa por hora debe ser mayor o igual a 0').default(150),
  horas_trabajadas: z.number().min(0, 'Las horas trabajadas deben ser mayor o igual a 0').default(0),
  horas_estimadas: z.number().min(0).optional()
})

// Schema principal del caso
export const casoSchema = z.object({
  cliente: z.string()
    .min(1, 'El nombre del cliente es obligatorio')
    .trim(),
  
  patrocinado: z.string()
    .min(1, 'El nombre del patrocinado es obligatorio')
    .trim(),
  
  descripcion: z.string()
    .trim()
    .default(''),
  
  tipo: z.enum(['Penal', 'Civil', 'Laboral', 'Administrativo'] as const).default('Penal'),
  
  etapa: z.string()
    .min(1, 'La etapa es obligatoria')
    .default('Preliminar'),
  
  abogado_asignado_id: z.string()
    .uuid('ID de abogado inválido')
    .optional(),
  
  forma_pago: z.enum(['Por hora', 'Por etapas', 'Monto fijo', 'Cuota litis'] as const)
    .default('Monto fijo'),
  
  monto_total: z.number()
    .min(0, 'El monto total no puede ser negativo')
    .default(0),
  
  monto_cobrado: z.number()
    .min(0, 'El monto cobrado no puede ser negativo')
    .default(0),
  
  fecha_inicio: z.string()
    .min(1, 'La fecha de inicio es obligatoria')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  
  estado: z.enum(['Activo', 'Pausado', 'Cerrado'] as const).default('Activo'),
  
  estado_caso: z.enum(['En proceso', 'Ganado', 'Perdido'] as const).default('En proceso'),
  
  ubicacion_fisica: z.string()
    .trim()
    .default(''),
  
  expediente: z.string()
    .trim()
    .optional(),
  
  usuarios_con_acceso: z.array(z.string().uuid()).default([]),
  
  detalles_pago: detallesPagoSchema.optional()
})
.refine(
  (data) => {
    // Validación: monto_cobrado no puede ser mayor que monto_total
    if (data.forma_pago !== 'Por hora' && data.forma_pago !== 'Cuota litis') {
      return data.monto_cobrado <= data.monto_total
    }
    return true
  },
  {
    message: 'El monto cobrado no puede ser mayor que el monto total',
    path: ['monto_cobrado']
  }
)
.refine(
  (data) => {
    // Validación específica para "Por etapas"
    if (data.forma_pago === 'Por etapas' && data.detalles_pago?.etapas) {
      const totalEtapas = data.detalles_pago.etapas.reduce((sum, etapa) => sum + (etapa.monto || 0), 0)
      if (data.monto_total > 0) {
        return Math.abs(totalEtapas - data.monto_total) < 0.01
      }
    }
    return true
  },
  {
    message: 'El total de etapas debe coincidir con el monto total del caso',
    path: ['detalles_pago', 'etapas']
  }
)
.refine(
  (data) => {
    // Validación específica para "Cuota litis"
    if (data.forma_pago === 'Cuota litis') {
      return (
        data.detalles_pago?.porcentaje_litis &&
        data.detalles_pago.porcentaje_litis > 0 &&
        data.detalles_pago.condicion_litis?.trim()
      )
    }
    return true
  },
  {
    message: 'En Cuota Litis debes especificar porcentaje y condición',
    path: ['detalles_pago']
  }
)
.refine(
  (data) => {
    // Validación específica para "Cuota litis" - monto cobrado debe ser bajo
    if (data.forma_pago === 'Cuota litis') {
      return data.monto_cobrado <= 1000
    }
    return true
  },
  {
    message: 'En Cuota Litis, el monto cobrado debe ser mínimo (gastos iniciales, máx $1000)',
    path: ['monto_cobrado']
  }
)
.refine(
  (data) => {
    // Validación específica para "Por hora"
    if (data.forma_pago === 'Por hora') {
      return (
        data.detalles_pago?.tarifa_hora &&
        data.detalles_pago.tarifa_hora > 0 &&
        data.detalles_pago.horas_trabajadas !== undefined &&
        data.detalles_pago.horas_trabajadas >= 0
      )
    }
    return true
  },
  {
    message: 'En Por Hora debes especificar tarifa y horas trabajadas',
    path: ['detalles_pago']
  }
)

// Tipos inferidos
export type CasoFormData = z.infer<typeof casoSchema>
export type DetallesPagoFormData = z.infer<typeof detallesPagoSchema>

// Schema para edición (incluye campos readonly como codigo_estimado)
export const casoEditSchema = casoSchema.extend({
  codigo_estimado: z.string().optional()
})

export type CasoEditFormData = z.infer<typeof casoEditSchema>
