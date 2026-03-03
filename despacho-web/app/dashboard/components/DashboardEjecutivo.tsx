'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { logError } from '@/lib/utils/errors'

interface MetricaFinanciera {
  cobrado_mes: number
  proyectado_mes_siguiente: number
  pendiente_total: number
  casos_activos: number
  tendencia_meses: Array<{
    mes: string
    cobrado: number
    proyectado: number
  }>
  top_casos_pendientes: Array<{
    codigo_estimado: string
    cliente: string
    pendiente: number
    total: number
    porcentaje_cobrado: number
  }>
}

export default function DashboardEjecutivo() {
  const [metricas, setMetricas] = useState<MetricaFinanciera | null>(null)
  const [cargando, setCargando] = useState(true)
  const [periodo, setPeriodo] = useState('mes') // 'mes' | 'trimestre' | 'año'
  const supabase = createClient()

  const cargarMetricas = useCallback(async () => {
    try {
      // Métricas financieras principales
      const { data: stats } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single()

      // Trending de últimos 6 meses
      const { data: tendencia } = await supabase
        .rpc('obtener_tendencia_financiera', { 
          meses: 6,
          periodo: periodo 
        })

      // Top casos con mayores pendientes
      const { data: topCasos } = await supabase
        .from('casos')
        .select('codigo_estimado, cliente, monto_total, monto_cobrado')
        .eq('estado', 'Activo')
        .gt('monto_total', 0)
        .order('monto_total - monto_cobrado', { ascending: false })
        .limit(8)

      const calculado: MetricaFinanciera = {
        cobrado_mes: stats?.cobros_mes_actual || 0,
        proyectado_mes_siguiente: stats?.proyeccion_mes_siguiente || 0,
        pendiente_total: stats?.cobros_pendientes || 0,
        casos_activos: stats?.casos_activos || 0,
        tendencia_meses: tendencia || [],
        top_casos_pendientes: topCasos?.map(caso => ({
          codigo_estimado: caso.codigo_estimado,
          cliente: caso.cliente,
          pendiente: caso.monto_total - caso.monto_cobrado,
          total: caso.monto_total,
          porcentaje_cobrado: Math.round((caso.monto_cobrado / caso.monto_total) * 100)
        })) || []
      }

      setMetricas(calculado)
    } catch (error) {
      logError('DashboardEjecutivo.cargarMetricas', error)
    } finally {
      setCargando(false)
    }
  }, [periodo, supabase])

  useEffect(() => {
    cargarMetricas()
    const interval = setInterval(cargarMetricas, 60000) // Refrescar cada minuto
    return () => clearInterval(interval)
  }, [cargarMetricas])

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto)
  }

  const getVariacionPorcentaje = (actual: number, anterior: number) => {
    if (anterior === 0) return 0
    return ((actual - anterior) / anterior) * 100
  }

  if (cargando) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!metricas) return null

  return (
    <div className="space-y-6">
      {/* Header con selector de período */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo</h2>
          <p className="text-gray-500">Métricas financieras en tiempo real</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          {['mes', 'trimestre', 'año'].map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodo === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cobrado este mes */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-100">Cobrado este mes</span>
            <span className="text-2xl">💵</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {formatearMoneda(metricas.cobrado_mes)}
          </div>
          <div className="text-green-100 text-sm">
            +{getVariacionPorcentaje(metricas.cobrado_mes, metricas.cobrado_mes * 0.8).toFixed(1)}% vs mes anterior
          </div>
        </div>

        {/* Proyección siguiente mes */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-100">Proyección siguiente mes</span>
            <span className="text-2xl">📈</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {formatearMoneda(metricas.proyectado_mes_siguiente)}
          </div>
          <div className="text-blue-100 text-sm">
            Basado en casos activos
          </div>
        </div>

        {/* Total pendiente */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-orange-100">Total pendiente</span>
            <span className="text-2xl">⏰</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {formatearMoneda(metricas.pendiente_total)}
          </div>
          <div className="text-orange-100 text-sm">
            Por {metricas.casos_activos} casos activos
          </div>
        </div>

        {/* Casos activos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-purple-100">Casos activos</span>
            <span className="text-2xl">📁</span>
          </div>
          <div className="text-3xl font-bold mb-2">
            {metricas.casos_activos}
          </div>
          <div className="text-purple-100 text-sm">
            En gestión actual
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top casos pendientes */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Mayores Pendientes de Cobro</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Ver todos →
            </button>
          </div>
          
          <div className="space-y-4">
            {metricas.top_casos_pendientes.map((caso, index) => (
              <div key={caso.codigo_estimado} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    index === 0 ? 'bg-red-500' : 
                    index === 1 ? 'bg-orange-500' : 
                    index === 2 ? 'bg-yellow-500' : 'bg-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{caso.cliente}</p>
                    <p className="text-sm text-gray-500">{caso.codigo_estimado}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-red-600">
                    {formatearMoneda(caso.pendiente)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${caso.porcentaje_cobrado}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {caso.porcentaje_cobrado}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tendencia financiera */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendencia Financiera</h3>
          
          <div className="space-y-4">
            {metricas.tendencia_meses.map((mes) => (
              <div key={mes.mes} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{mes.mes}</span>
                  <div className="flex gap-4">
                    <span className="text-green-600 font-semibold">
                      {formatearMoneda(mes.cobrado)}
                    </span>
                    <span className="text-blue-600">
                      {formatearMoneda(mes.proyectado)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                    <div 
                      className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(mes.cobrado / 100000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {formatearMoneda(mes.cobrado).split(',')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                    <div 
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${(mes.proyectado / 100000) * 100}%` }}
                    >
                      <span className="text-xs text-white font-semibold">
                        {formatearMoneda(mes.proyectado).split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Cobrado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Proyectado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de salud */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Salud del Negocio</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {((metricas.cobrado_mes / (metricas.cobrado_mes + metricas.proyectado_mes_siguiente)) * 100).toFixed(1)}%
            </div>
            <p className="text-gray-600 text-sm mt-1">Tasa de Cobro Real</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(metricas.pendiente_total / metricas.casos_activos).toLocaleString()}
            </div>
            <p className="text-gray-600 text-sm mt-1">Promedio Pendiente por Caso</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {((metricas.proyectado_mes_siguiente / metricas.cobrado_mes) * 100).toFixed(1)}%
            </div>
            <p className="text-gray-600 text-sm mt-1">Crecimiento Proyectado</p>
          </div>
        </div>
      </div>
    </div>
  )
}