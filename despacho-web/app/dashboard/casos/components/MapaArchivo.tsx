'use client'

import { useState } from 'react'

export default function MapaArchivo() {
  const [mostrar, setMostrar] = useState(false)

  return (
    <>
      <button
        onClick={() => setMostrar(true)}
        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
      >
        ❓ ¿Cómo se organizan los expedientes?
      </button>

      {mostrar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Sistema de Archivo Físico</h2>
              <button
                onClick={() => setMostrar(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Explicación */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">📚 Cómo funciona el sistema</h3>
                <p className="text-blue-800 text-sm">
                  Los expedientes están organizados en estantes con un sistema de coordenadas:
                  <strong> Fila-Columna-Sección-Profundidad</strong>
                </p>
              </div>

              {/* Ejemplo visual */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ejemplo de ubicación</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-blue-600 text-white px-3 py-2 rounded font-mono text-lg">
                      1-C-FRONTAL
                    </div>
                    <span className="text-gray-600">significa:</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white p-4 rounded border border-blue-200">
                      <div className="text-3xl mb-2">1️⃣</div>
                      <div className="font-semibold text-gray-900">Fila 1</div>
                      <div className="text-sm text-gray-600">Primera fila del estante</div>
                    </div>
                    <div className="bg-white p-4 rounded border border-blue-200">
                      <div className="text-3xl mb-2">🅲</div>
                      <div className="font-semibold text-gray-900">Columna C</div>
                      <div className="text-sm text-gray-600">Tercera columna</div>
                    </div>
                    <div className="bg-white p-4 rounded border border-blue-200">
                      <div className="text-3xl mb-2">📦</div>
                      <div className="font-semibold text-gray-900">Frontal</div>
                      <div className="text-sm text-gray-600">Archivador del frente</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Diagrama del archivo */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Vista del archivo físico</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/mapa-archivo.png"
                      alt="Mapa del archivo físico"
                      className="max-w-full h-auto"
                    />
                  </div>
                  <div className="mt-4 text-center text-xs text-gray-600">
                    <p className="font-medium mb-2">Distribución del estante:</p>
                    <div className="space-y-1">
                      <p><strong>Fila 1:</strong> A-B | C | D-E (especial)</p>
                      <p><strong>Filas 2-5:</strong> A-B | C-D | E-F (normal)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profundidad */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">📏 Profundidad del archivador</h3>
                <p className="text-yellow-800 text-sm mb-3">
                  Cada columna puede tener archivadores al frente y al fondo:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded border border-yellow-300">
                    <div className="font-semibold text-gray-900">FRONTAL</div>
                    <div className="text-sm text-gray-600">Archivadores del frente (más accesibles)</div>
                  </div>
                  <div className="bg-white p-3 rounded border border-yellow-300">
                    <div className="font-semibold text-gray-900">TRASERA</div>
                    <div className="text-sm text-gray-600">Archivadores del fondo</div>
                  </div>
                </div>
              </div>

              {/* Ejemplos adicionales */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Más ejemplos</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <code className="bg-blue-600 text-white px-2 py-1 rounded font-mono text-sm">2-A-FRONTAL</code>
                    <span className="text-gray-600">→ Fila 2, Columna A (izquierda), archivador frontal</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <code className="bg-green-600 text-white px-2 py-1 rounded font-mono text-sm">3-D-TRASERA</code>
                    <span className="text-gray-600">→ Fila 3, Columna D (centro), archivador trasero</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <code className="bg-orange-600 text-white px-2 py-1 rounded font-mono text-sm">1-E-FRONTAL</code>
                    <span className="text-gray-600">→ Fila 1, Columna E (derecha), archivador frontal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setMostrar(false)}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
