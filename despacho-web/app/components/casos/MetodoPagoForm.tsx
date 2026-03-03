'use client'

import { useState } from 'react'
import type { FormaPago, EstadoProcesal } from '@/lib/types/database'
import MontoFijoForm from './MontoFijoForm'
import PorEtapasForm from './PorEtapasForm'
import PorHorasForm from './PorHorasForm'
import CuotaLitisForm from './CuotaLitisForm'

interface MetodoPagoFormProps {
  forma_pago: FormaPago | ''
  monto_total: number
  monto_cobrado: number
  estado_caso: EstadoProcesal | string
  detalles_pago: DetallesPago
  onChange: (forma_pago: FormaPago | '', detalles_pago: DetallesPago) => void
}

/**
 * Tipo para etapa de pago
 */
export interface Etapa {
  numero: number
  monto: number
}

/**
 * Tipo para detalles de pago (estructura flexible según método)
 */
interface DetallesPago {
  // Por cuotas/Monto fijo
  cuotas?: number
  periodo?: 'Mensual' | 'Quincenal' | 'Semanal' | 'Trimestral' | 'Semestral' | 'Anual'

  // Por etapas
  numero_etapas?: number
  etapas?: Etapa[]
  honorario_exito?: number

  // Cuota litis
  porcentaje_litis?: number
  condicion_litis?: string
  caso_ganado?: boolean

  // Por hora
  tarifa_hora?: number
  horas_estimadas?: number
  horas_trabajadas?: number

  // Otros
  tipo_caso?: string
}

export default function MetodoPagoForm({
  forma_pago,
  monto_total,
  monto_cobrado,
  estado_caso,
  detalles_pago,
  onChange,
}: MetodoPagoFormProps) {
  const [formaPagoActual, setFormaPagoActual] = useState<FormaPago | ''>(forma_pago)

  const [datos, setDatos] = useState({
    cuotas: detalles_pago?.cuotas || 1,
    periodo: detalles_pago?.periodo || 'Mensual',
    honorario_exito: detalles_pago?.honorario_exito || 0,
    numero_etapas: detalles_pago?.numero_etapas || 1,
    etapas: detalles_pago?.etapas || [{ numero: 1, monto: 0 }],
    porcentaje_litis: detalles_pago?.porcentaje_litis || 20,
    condicion_litis: detalles_pago?.condicion_litis || '',
    caso_ganado: detalles_pago?.caso_ganado || false,
    tipo_caso: detalles_pago?.tipo_caso || 'Penal',
    tarifa_hora: detalles_pago?.tarifa_hora || 150,
    horas_trabajadas: detalles_pago?.horas_trabajadas || 0,
  })

  const handleCambiarFormaPago = (nuevaFormaPago: FormaPago | '') => {
    setFormaPagoActual(nuevaFormaPago)
    onChange(nuevaFormaPago, datos)
  }

  const actualizarDatos = (clave: string, valor: number | string | boolean) => {
    const nuevosDatos = { ...datos, [clave]: valor }
    setDatos(nuevosDatos)
    onChange(formaPagoActual, nuevosDatos)
  }

  const actualizarDatosEtapa = (clave: string, valor: number | string | boolean | Etapa[]) => {
    const nuevosDatos = { ...datos, [clave]: valor }
    setDatos(nuevosDatos)
    onChange(formaPagoActual, nuevosDatos)
  }

  return (
    <div className="space-y-4">
      {/* Selector de método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago *
        </label>
        <select
          required
          value={formaPagoActual}
          onChange={(e) => handleCambiarFormaPago(e.target.value as FormaPago)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un método</option>
          <option value="Monto fijo">💰 Monto fijo</option>
          <option value="Por etapas">📊 Por etapas</option>
          <option value="Cuota litis">⚖️ Cuota litis</option>
          <option value="Por hora">⏱️ Por hora</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Selecciona cómo se cobra el caso</p>
      </div>

      {/* Formularios específicos por método */}
      {renderFormularioEspecifico()}
    </div>
  )

  function renderFormularioEspecifico() {
    if (formaPagoActual === 'Monto fijo') {
      return (
        <MontoFijoForm
          numero_etapas={datos.numero_etapas}
          periodo={datos.periodo}
          honorario_exito={datos.honorario_exito}
          monto_total={monto_total}
          monto_cobrado={monto_cobrado}
          estado_caso={estado_caso}
          onChange={actualizarDatos}
        />
      )
    }

    if (formaPagoActual === 'Por etapas') {
      return (
        <PorEtapasForm
          numero_etapas={datos.numero_etapas}
          etapas={datos.etapas}
          honorario_exito={datos.honorario_exito}
          monto_total={monto_total}
          onChange={actualizarDatosEtapa}
        />
      )
    }

    if (formaPagoActual === 'Por hora') {
      return (
        <PorHorasForm
          tarifa_hora={datos.tarifa_hora}
          horas_trabajadas={datos.horas_trabajadas}
          onChange={actualizarDatos}
        />
      )
    }

    if (formaPagoActual === 'Cuota litis') {
      return (
        <CuotaLitisForm
          porcentaje_litis={datos.porcentaje_litis}
          condicion_litis={datos.condicion_litis}
          estado_caso={estado_caso}
          onChange={actualizarDatos}
        />
      )
    }

    return null
  }
}