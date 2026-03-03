'use client'

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import { Rnd } from 'react-rnd'

export default function ResizableImage({ node, updateAttributes, selected }: NodeViewProps) {
  // Prevenir drag nativo del navegador
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragStop = (_e: unknown, d: { x: number; y: number }) => {
    updateAttributes({ 
      x: Math.round(d.x), 
      y: Math.round(d.y) 
    })
  }

  const handleResizeStop = (
    _e: unknown,
    _dir: unknown,
    ref: HTMLElement,
    _delta: unknown,
    position: { x: number; y: number }
  ) => {
    updateAttributes({
      width: Math.round(ref.offsetWidth),
      height: Math.round(ref.offsetHeight),
      x: Math.round(position.x),
      y: Math.round(position.y),
    })
  }

  return (
    <NodeViewWrapper 
      as="div" 
      className="image-wrapper"
      onDragStart={handleDragStart}
      style={{ 
        display: 'block',
        margin: '0',
        position: 'relative',
        // Contenedor sin restricciones de altura
        minHeight: '200px',
        width: '100%',
      }}
    >
      <Rnd
        size={{ 
          width: node.attrs.width || 500, 
          height: node.attrs.height || 'auto' 
        }}
        position={{ 
          x: node.attrs.x || 0, 
          y: node.attrs.y || 0 
        }}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        lockAspectRatio={true} // Mantener proporción de aspecto
        // SIN bounds - movimiento libre como Google Slides
        disableDragging={!selected} // Solo drag si está seleccionada
        enableResizing={selected ? {
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        } : false} // Solo resize si está seleccionada
        minWidth={100}
        minHeight={100}
        // SIN maxWidth - puede crecer lo que sea
        className={`${selected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg' : ''}`}
        style={{
          // Estilos del contenedor Rnd
          zIndex: selected ? 10 : 1,
          cursor: selected ? 'move' : 'pointer',
        }}
        // Estilos para los resize handles (solo visibles cuando seleccionado)
        resizeHandleStyles={selected ? {
          top: { cursor: 'n-resize' },
          right: { cursor: 'e-resize' },
          bottom: { cursor: 's-resize' },
          left: { cursor: 'w-resize' },
          topRight: { cursor: 'ne-resize' },
          bottomRight: { cursor: 'se-resize' },
          bottomLeft: { cursor: 'sw-resize' },
          topLeft: { cursor: 'nw-resize' },
        } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          data-x={node.attrs.x || 0}
          data-y={node.attrs.y || 0}
          width={node.attrs.width || 500}
          height={node.attrs.height !== 'auto' ? node.attrs.height : undefined}
          className="block w-full h-auto rounded-md select-none"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none', // Evitar que la imagen capture eventos
            userSelect: 'none',
          }}
          draggable={false}
        />
      </Rnd>
    </NodeViewWrapper>
  )
}
