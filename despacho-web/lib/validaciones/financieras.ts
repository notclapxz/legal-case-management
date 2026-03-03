// =====================================================
// VALIDACIONES FINANCIERAS - Sistema Gestión Legal
// =====================================================
// Funciones de validación para métodos de pago y montos
// Recreado de: app/dashboard/casos/nuevo/page.tsx
// Recreado por: Claude (Recreación por pérdida de contenido)
// =====================================================

import type { FormaPago } from '@/lib/types/database'

/**
 * Interfaz para detalles de pago (estructura flexible según método)
 */
export interface DetallesPagoValidacion {
  // Monto fijo
  numero_etapas?: number

  // Por etapas
  etapas?: Array<{ numero: number; monto: number }>
  
  // Por hora
  tarifa_hora?: number
  horas_trabajadas?: number
  
  // Otros
  [key: string]: unknown
}

/**
 * Resultado de validación
 */
export interface ResultadoValidacion {
  valido: boolean
  mensaje: string
}

/**
 * Obtiene el texto de ayuda para el campo "Monto Cobrado" según el método de pago
 * @param forma_pago - Método de pago seleccionado
 * @returns Texto explicativo para mostrar debajo del campo
 */
export function getMontoCobradoAyuda(forma_pago: FormaPago | ''): string {
  switch (forma_pago) {
    case 'Monto fijo':
      return 'Cuotas pagadas hasta la fecha'
    case 'Por etapas':
      return 'Suma de etapas completadas y pagadas'
    case 'Por hora':
      return 'Total facturado por horas trabajadas'
    case 'Cuota litis':
      return 'Generalmente S/ 0 (solo gastos iniciales)'
    default:
      return 'Monto recibido hasta la fecha'
  }
}

/**
 * Valida que el monto cobrado sea coherente con el método de pago seleccionado
 * @param forma_pago - Método de pago
 * @param monto_total - Monto total del caso
 * @param monto_cobrado - Monto ya cobrado
 * @param detalles - Detalles específicos del método de pago
 * @returns Resultado de la validación con mensaje si hay error
 */
export function validarMontoCobrado(
  forma_pago: FormaPago | '',
  monto_total: number,
  monto_cobrado: number,
  detalles: DetallesPagoValidacion
): ResultadoValidacion {
  // Validación base: no negativos
  if (monto_cobrado < 0) {
    return {
      valido: false,
      mensaje: 'El monto cobrado no puede ser negativo'
    }
  }

  switch (forma_pago) {
    case 'Monto fijo': {
      const numeroEtapas = detalles.numero_etapas || 1
      const cuotaMensual = numeroEtapas > 0 ? monto_total / numeroEtapas : 0
      const maxCobradoFijo = numeroEtapas * cuotaMensual

      if (monto_cobrado > maxCobradoFijo) {
        return {
          valido: false,
          mensaje: `No puede cobrar más de S/ ${maxCobradoFijo.toFixed(2)} (${numeroEtapas} cuotas × S/ ${cuotaMensual.toFixed(2)})`
        }
      }

      return { valido: true, mensaje: '' }
    }

    case 'Por etapas': {
      const maxCobradoEtapas = detalles.etapas?.reduce(
        (sum, etapa) => sum + (etapa.monto || 0),
        0
      ) || 0

      if (monto_cobrado > maxCobradoEtapas) {
        return {
          valido: false,
          mensaje: `No puede cobrar más de S/ ${maxCobradoEtapas.toFixed(2)} (suma de todas las etapas)`
        }
      }

      return { valido: true, mensaje: '' }
    }

    case 'Por hora': {
      const tarifaHora = detalles.tarifa_hora || 0
      const horasTrabajadas = detalles.horas_trabajadas || 0
      const maxCobradoHoras = tarifaHora * horasTrabajadas

      if (monto_cobrado > maxCobradoHoras) {
        return {
          valido: false,
          mensaje: `No puede cobrar más de S/ ${maxCobradoHoras.toFixed(2)} (${horasTrabajadas} horas × S/ ${tarifaHora.toFixed(2)})`
        }
      }

      return { valido: true, mensaje: '' }
    }

    case 'Cuota litis': {
      // En cuota litis, el monto cobrado inicial debe ser mínimo (solo gastos)
      if (monto_cobrado > 1000) {
        return {
          valido: false,
          mensaje: 'En cuota litis, el monto cobrado debe ser mínimo (solo gastos iniciales)'
        }
      }

      return { valido: true, mensaje: '' }
    }

    default:
      return { valido: true, mensaje: '' }
  }
}

/**
 * Valida que las etapas tengan montos válidos
 * @param etapas - Array de etapas con montos
 * @returns Resultado de la validación
 */
export function validarEtapas(
  etapas: Array<{ numero: number; monto: number }>
): ResultadoValidacion {
  if (!etapas || etapas.length === 0) {
    return {
      valido: false,
      mensaje: 'Debe haber al menos una etapa'
    }
  }

  // Verificar que todas las etapas tengan monto mayor a 0
  const etapasSinMonto = etapas.filter(e => !e.monto || e.monto <= 0)

  if (etapasSinMonto.length > 0) {
    return {
      valido: false,
      mensaje: 'Todas las etapas deben tener un monto mayor a 0'
    }
  }

  return { valido: true, mensaje: '' }
}

/**
 * Valida configuración de método "Monto fijo"
 * @param numeroEtapas - Número de cuotas
 * @param montoTotal - Monto total del caso
 * @returns Resultado de la validación
 */
export function validarMontoFijo(
  numeroEtapas: number,
  montoTotal: number
): ResultadoValidacion {
  if (numeroEtapas <= 0) {
    return {
      valido: false,
      mensaje: 'El número de cuotas debe ser mayor a 0'
    }
  }

  if (montoTotal <= 0) {
    return {
      valido: false,
      mensaje: 'El monto total debe ser mayor a 0'
    }
  }

  return { valido: true, mensaje: '' }
}

/**
 * Valida configuración de método "Por hora"
 * @param tarifaHora - Tarifa por hora
 * @param horasTrabajadas - Horas trabajadas (opcional)
 * @returns Resultado de la validación
 */
export function validarPorHora(
  tarifaHora: number,
  horasTrabajadas?: number
): ResultadoValidacion {
  if (!tarifaHora || tarifaHora <= 0) {
    return {
      valido: false,
      mensaje: 'La tarifa por hora debe ser mayor a 0'
    }
  }

  if (horasTrabajadas !== undefined && horasTrabajadas < 0) {
    return {
      valido: false,
      mensaje: 'Las horas trabajadas no pueden ser negativas'
    }
  }

  return { valido: true, mensaje: '' }
}

/**
 * Valida configuración de método "Cuota litis"
 * @param porcentajeLitis - Porcentaje de la cuota (ej: 20 para 20%)
 * @returns Resultado de la validación
 */
export function validarCuotaLitis(
  porcentajeLitis: number
): ResultadoValidacion {
  if (porcentajeLitis <= 0 || porcentajeLitis > 100) {
    return {
      valido: false,
      mensaje: 'El porcentaje debe estar entre 1 y 100'
    }
  }

  return { valido: true, mensaje: '' }
}

/**
 * Calcula el monto pendiente de cobro
 * @param montoTotal - Monto total del caso
 * @param montoCobrado - Monto ya cobrado
 * @returns Monto pendiente
 */
export function calcularMontoPendiente(
  montoTotal: number,
  montoCobrado: number
): number {
  const pendiente = montoTotal - montoCobrado
  return pendiente < 0 ? 0 : pendiente
}

/**
 * Calcula el porcentaje de cobro
 * @param montoTotal - Monto total del caso
 * @param montoCobrado - Monto ya cobrado
 * @returns Porcentaje cobrado (0-100)
 */
export function calcularPorcentajeCobrado(
  montoTotal: number,
  montoCobrado: number
): number {
  if (montoTotal <= 0) return 0
  const porcentaje = (montoCobrado / montoTotal) * 100
  return Math.min(Math.max(porcentaje, 0), 100) // Clamp entre 0 y 100
}

/**
 * Formatea un monto a formato de moneda peruana
 * @param monto - Monto a formatear
 * @returns String formateado (ej: "S/ 1,234.56")
 */
export function formatearMonto(monto: number): string {
  return `S/ ${monto.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Valida que un valor numérico sea válido
 * @param valor - Valor a validar
 * @param nombreCampo - Nombre del campo (para mensaje de error)
 * @param min - Valor mínimo permitido (opcional)
 * @param max - Valor máximo permitido (opcional)
 * @returns Resultado de la validación
 */
export function validarNumero(
  valor: number,
  nombreCampo: string,
  min?: number,
  max?: number
): ResultadoValidacion {
  if (isNaN(valor)) {
    return {
      valido: false,
      mensaje: `${nombreCampo} debe ser un número válido`
    }
  }

  if (min !== undefined && valor < min) {
    return {
      valido: false,
      mensaje: `${nombreCampo} debe ser mayor o igual a ${min}`
    }
  }

  if (max !== undefined && valor > max) {
    return {
      valido: false,
      mensaje: `${nombreCampo} debe ser menor o igual a ${max}`
    }
  }

  return { valido: true, mensaje: '' }
}
