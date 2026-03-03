'use client'

import { useUserRole } from '@/app/hooks/useUserRole'

import SeccionPagos from './SeccionPagos'
import SeccionEventos from './SeccionEventos'
import AccionesDelCaso from './AccionesDelCaso'

import type { Caso, Evento, Pago, Nota, UbicacionFisica } from '@/lib/types/database'

interface VistaGeneralProps {
  caso: Caso
  eventos: Evento[]
  pagos: Pago[]
  notas: Nota[]
  ubicacion: UbicacionFisica | null
}

export default function VistaGeneral({ caso, eventos, pagos, notas, ubicacion }: VistaGeneralProps) {
  // Detectar rol del usuario
  const { isAdmin, loading } = useUserRole()
  
  // Evitar mostrar contenido mientras se carga el rol
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna Principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Información del Caso */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Caso</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Código</dt>
              <dd className="mt-1 text-sm text-gray-900">{caso.codigo_estimado}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Cliente</dt>
              <dd className="mt-1 text-sm text-gray-900">{caso.cliente}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Descripción</dt>
              <dd className="mt-1 text-sm text-gray-900">{caso.descripcion}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Tipo</dt>
              <dd className="mt-1 text-sm text-gray-900">{caso.tipo}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Expediente</dt>
              <dd className="mt-1 text-sm text-gray-900">{caso.expediente || 'No asignado'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Fecha de Inicio</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {caso.fecha_inicio ? new Date(caso.fecha_inicio).toLocaleDateString('es-ES') : 'No especificada'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Ubicación Física</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {ubicacion ? ubicacion.ubicacion : caso.ubicacion_fisica || 'No asignada'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Información de Pagos - SOLO ADMIN */}
        {isAdmin && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Pagos</h2>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Forma de Pago</dt>
                  <dd className="mt-1 text-sm text-gray-900">{caso.forma_pago}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monto Total</dt>
                  <dd className="mt-1 text-lg font-bold text-blue-600">
                    S/ {caso.monto_total?.toLocaleString() || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Monto Cobrado</dt>
                  <dd className="mt-1 text-lg font-bold text-green-600">
                    S/ {caso.monto_cobrado?.toLocaleString() || 0}
                  </dd>
                </div>
              </dl>
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso de Cobro</span>
                  <span>
                    {(caso.monto_total ?? 0) > 0
                      ? Math.round(((caso.monto_cobrado ?? 0) / (caso.monto_total ?? 1)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${(caso.monto_total ?? 0) > 0 ? ((caso.monto_cobrado ?? 0) / (caso.monto_total ?? 1)) * 100 : 0}%`
                    }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Pendiente: S/ {((caso.monto_total || 0) - (caso.monto_cobrado || 0)).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Historial de Pagos */}
            <SeccionPagos casoId={caso.id} pagos={pagos} />
          </>
        )}

        {/* Eventos/Audiencias */}
        <SeccionEventos
          casoId={caso.id}
          codigoCaso={caso.codigo_estimado}
          cliente={caso.cliente}
          eventos={eventos}
        />
      </div>

      {/* Columna Lateral */}
      <div className="space-y-6">
        {/* Preview de Notas - Solo últimas 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Notas Recientes</h2>
            <span className="text-xs text-gray-500">{notas.length} total</span>
          </div>
          {notas && notas.length > 0 ? (
            <div className="space-y-3">
              {notas.slice(0, 3).map((nota) => (
                <div key={nota.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-3">
                  <p className="text-sm text-gray-900 line-clamp-2">{nota.contenido}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {nota.created_at ? new Date(nota.created_at).toLocaleDateString('es-ES') : 'Sin fecha'}
                  </p>
                </div>
              ))}
              {notas.length > 3 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  + {notas.length - 3} notas más. Ver pestaña &quot;Notas &amp; Recordatorios&quot;
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay notas</p>
          )}
        </div>

        {/* Acciones */}
        <AccionesDelCaso casoId={caso.id} estadoActual={caso.estado} />
      </div>
    </div>
  )
}
