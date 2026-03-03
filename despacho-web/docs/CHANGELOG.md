# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.1.0] - 2026-01-21

### ✨ Añadido

#### Sistema de Carpetas Jerárquicas
- Sistema completo de carpetas con estructura jerárquica ilimitada
- Tabla `carpetas` en BD con columnas: `id`, `nombre`, `color`, `carpeta_padre_id`, `orden`
- Drag & Drop de casos a carpetas (actualiza `caso.carpeta_id`)
- Drag & Drop de carpetas a otras carpetas (mueve subcarpetas)
- Validaciones anti-loop:
  - No mover carpeta dentro de sí misma
  - No crear ciclos infinitos (carpeta padre → subcarpeta)
  - Permitir mover a nivel raíz (`carpeta_padre_id = null`)

#### Menú Contextual en Carpetas
- Menú contextual (⋮) con 4 opciones:
  - ↑ Subir (reordenar hacia arriba)
  - ↓ Bajar (reordenar hacia abajo)
  - ✏️ Editar (modal de edición)
  - 🗑️ Eliminar (modal de confirmación)
- Modal de confirmación reutilizable (`app/components/ModalConfirmacion.tsx`)
  - Props: `titulo`, `mensaje`, `onConfirmar`, `onCancelar`
  - Diseño profesional con Radix Dialog + Tailwind

#### Exportar Notas a PowerPoint
- Botón "📊 Exportar PPT" en sidebar de notas (`NotasSidebar.tsx`)
- Librería: `pptxgenjs` v4.0.1
- Genera presentación con:
  - **Slide 1**: Portada (código caso, cliente, descripción, fecha)
  - **Slide 2**: Índice de notas con fechas
  - **Slides 3+**: Una nota por slide (categoría, prioridad, contenido)
- Archivo descargable: `{CODIGO}_Notas_{TIMESTAMP}.pptx`
- **Propósito**: Presentar en audiencias judiciales

### 🔧 Modificado

#### Tabla de Casos
- **Columna "Código" → "Patrocinado"** (primera columna)
  - Ahora muestra: `⚖️ Juan Pérez` (nombre del patrocinado)
  - Código del caso aparece debajo del cliente (más discreto)
- Componentes actualizados:
  - `TablaCasos.tsx` (header)
  - `FilaCasoDraggable.tsx` (filas con datos)

#### Formulario de Edición
- Agregado selector de método de pago en edición (`MetodoPagoForm.tsx`)
  - Antes: Solo mostraba el método configurado (sin cambiar)
  - Ahora: Dropdown con 4 opciones (Monto fijo, Por etapas, Cuota litis, Por hora)
- Eliminado campo duplicado "Tipo de caso"
  - Antes: Aparecía en formulario principal Y dentro de "Por etapas"
  - Ahora: Solo en formulario principal

### 🐛 Corregido

#### Buscador Flotante
- **Problema**: Query SQL mal formateado (saltos de línea causaban error)
- **Fix**: Sintaxis `.or()` en una sola línea
- Archivo: `app/dashboard/components/BuscadorFlotante.tsx` (línea 37)
- Búsqueda ahora funciona en: código, cliente, patrocinado, expediente, descripción

#### Hydration Errors
- Fix en `SidebarCarpetas.tsx` usando mounted state pattern
- Previene errores de hidratación en menú contextual

### 📚 Documentación

- Actualizado `AGENTS.md` (447 líneas):
  - Nueva sección "Sistema de Carpetas (Drag & Drop)"
  - Nueva sección "Exportar Notas a PowerPoint"
  - Actualizada estructura de componentes
  - Agregada tabla `carpetas` en referencia de BD
- Actualizado `README.md`:
  - Agregadas nuevas features en características principales
  - Actualizada estructura del proyecto
  - Agregada sección "Últimas Actualizaciones"
  - Actualizado stack tecnológico (pptxgenjs, @dnd-kit)
- Creado `CHANGELOG.md` (este archivo)

### 🔒 Seguridad

- Validaciones de permisos en eliminación de carpetas
- Prevención de loops infinitos en estructura de carpetas
- Type safety completo en drag & drop operations

---

## [2.0.0] - 2026-01-20

### 🎯 Refactoring Completo

#### Centralización de Código
- Creada estructura `lib/` con módulos centralizados:
  - `lib/types/database.ts` (540 líneas) - Interfaces TypeScript
  - `lib/validaciones/financieras.ts` (300 líneas) - Validaciones de pagos
  - `lib/utils/errors.ts` (75 líneas) - Manejo de errores
  - `lib/utils/helpers.ts` (350 líneas) - Helpers comunes

#### Sistema de Notas
- Editor estilo Apple Notes con split panel
- Categorías: General, Evidencia, Alegatos, Testigos
- Prioridades: Alta/Media/Baja con colores
- Ordenamiento automático por fecha
- Componentes:
  - `TakeNoteLayout.tsx` - Layout principal
  - `NotasSidebar.tsx` - Lista de notas
  - `NotaEditor.tsx` - Editor activo

#### Type Safety
- Migración completa de `any` a tipos específicos
- Interfaces centralizadas en `database.ts`
- Validaciones en tiempo de compilación
- Null safety con optional chaining

### 🐛 Fixes Críticos
- Validación de métodos de pago (singular vs plural)
- Prevención de NULL en columnas NOT NULL
- Fix de errores de hidratación en componentes
- Validación de enums en dropdowns

### 📚 Documentación Inicial
- Creado `AGENTS.md` - Guía completa para agentes IA
- Creado `REFACTORING.md` - Detalles del refactoring
- Creado `ARQUITECTURA-ACTUAL.md` - Arquitectura del sistema

---

## [1.0.0] - 2026-01-17

### ✨ Lanzamiento Inicial (MVP)

#### Core Features
- Dashboard ejecutivo con métricas en tiempo real
- Sistema de alertas (rojo/naranja/amarillo)
- Buscador flotante con búsqueda fuzzy
- CRUD completo de casos legales
- Gestión de eventos/audiencias
- Historial de pagos

#### Módulos Implementados
- **Casos**: Crear, editar, listar, eliminar
- **Agenda**: Calendario de eventos
- **Ubicaciones**: Gestión de almacén físico
- **Reportes**: Métricas financieras

#### Tecnología
- Next.js 14 + React 18 + TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS + Framer Motion
- Optimizaciones para tablet Samsung

---

## Tipos de Cambios

- `✨ Añadido` - Nuevas funcionalidades
- `🔧 Modificado` - Cambios en funcionalidades existentes
- `🗑️ Eliminado` - Funcionalidades removidas
- `🐛 Corregido` - Fixes de bugs
- `🔒 Seguridad` - Vulnerabilidades corregidas
- `📚 Documentación` - Cambios en docs
- `⚡ Performance` - Mejoras de rendimiento
- `♻️ Refactor` - Cambios de código sin afectar funcionalidad

---

**Mantenido por**: Claude (Anthropic)  
**Usuario**: RZRV - Rolando Zagret Risco Sanchez
