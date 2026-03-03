# 📚 Documentación - Sistema de Gestión Legal

Este directorio contiene toda la documentación organizada del proyecto.

---

## 🗂️ Estructura

### 📖 **Documentación Principal** (Root Directory)
- `AGENTS.md` - Guía rápida para comenzar (START AQUÍ)
- `README.md` - Descripción general del proyecto
- `STATUS.md` - Estado actual del proyecto
- `CHANGELOG.md` - Historial de cambios principales

---

### 🏗️ `docs/architecture/` - Arquitectura del Sistema
Documentación técnica del stack y estructura del proyecto.

**Archivos**:
- `ARQUITECTURA-ACTUAL.md` - Stack tecnológico y patrones de arquitectura
- `PLAN_PROYECTO.md` - Plan general del proyecto
- `PLAN-TECNICO-FEATURES-CRITICAS.md` - Features críticas para monetización
- `STACK_TECNOLOGICO.md` - Detalles del stack tecnológico

**Cuándo leer**:
- Antes de empezar a trabajar en el proyecto
- Al diseñar nuevas features
- Al tomar decisiones de arquitectura

---

### 🗄️ `docs/database/` - Base de Datos
Documentación del modelo de datos y scripts SQL.

**Archivos**:
- `DATABASE-SCHEMA.md` - **SOURCE OF TRUTH del esquema** (CRÍTICO)
- `DOCUMENTACION_BD.md` - Documentación adicional de BD
- `SUPABASE-STORAGE-SETUP.sql` - Script de setup de Storage
- `SUPABASE-STORAGE-SIMPLE.sql` - Script simplificado de Storage

**Cuándo leer**:
- **SIEMPRE** antes de cambiar la BD
- Al consultar nombres de columnas o tipos
- Al crear nuevas tablas o relaciones

---

### ✨ `docs/features/` - Especificaciones de Features
Documentación detallada de features existentes y planificadas.

**Archivos**:
- `FEATURE-CALENDAR.md` - Especificación del sistema de agenda

**Cuándo leer**:
- Al implementar nuevas features
- Al entender el alcance de una feature existente

---

### 🐛 `docs/troubleshooting/` - Troubleshooting
Guías para resolver problemas comunes.

**Archivos**:
- `ERRORES_COMUNES.md` - Errores frecuentes y sus soluciones
- `AUDITORIA-CRITICA.md` - Auditoría de problemas encontrados

**Cuándo leer**:
- Al encontrar errores en el código
- Al hacer debugging de la aplicación

---

### 💬 `docs/sessions/` - Sesiones y Workshops
Reportes de sesiones de trabajo, brainstorming y workshops.

**Archivos**:
- `SESION_2026-01-15.md` - Reporte de sesión del 15 de enero 2026
- `ANALISIS_LIMITES_GRATIS.md` - Análisis de límites del plan gratuito
- `PREGUNTAS_PAPA.md` - Preguntas y respuestas frecuentes

**Cuándo leer**:
- Para entender el contexto de decisiones anteriores
- Para ver el proceso de toma de decisiones

---

### 📜 `docs/history/` - Historial de Cambios
Documentación de cambios, fixes y refactorings realizados.

**Archivos**:
- `CAMPO-PATROCINADO-IMPLEMENTADO.md` - Implementación del campo patrocinado
- `EDITAR_CASO_FIX_SUMMARY.md` - Fix de edición de casos
- `DRAG_AND_DROP_ETAPA2_SUMMARY.md` - Implementación de drag & drop
- `PAGINACION_FILTROS_SUMMARY.md` - Implementación de paginación y filtros
- `PERFORMANCE_OPTIMIZATION_SUMMARY.md` - Optimizaciones de performance
- `SISTEMA_CARPETAS_ETAPA1_SUMMARY.md` - Implementación de carpetas
- `LIMPIEZA-EJECUTADA.md` - Limpieza de código
- `REFACTORING-COMPLETO.md` - Refactoring completo

**Cuándo leer**:
- Para entender por qué se tomaron ciertas decisiones
- Para ver el proceso de implementación de features
- Para aprender de refactorings anteriores

---

### 👥 `docs/users/` - Guías de Usuario
Documentación para usuarios finales del sistema.

**Archivos**:
- `INSTRUCCIONES_USUARIOS_PRUEBA.md` - Guía para usuarios de prueba
- `GUIA_MAPEO_ALMACEN.md` - Guía de mapeo del almacén físico
- `MAPEO_FISICO_REAL.md` - Mapeo físico real del almacén

**Cuándo leer**:
- Al hacer testing con usuarios reales
- Para entender el flujo de trabajo de usuarios

---

### 🗺️ `docs/roadmap/` - Roadmap y Planificación
Documentación de planes futuros y pasos siguientes.

**Archivos**:
- `PASOS-SIGUIENTES.md` - Próximos pasos del proyecto

**Cuándo leer**:
- Para ver qué se va a desarrollar después
- Al planificar nuevas features

---

### 📦 `docs/organization/` - Organización
Documentación sobre la organización del código y estructura de archivos.

**Archivos**:
- `ORGANIZACION-COMPLETADA.md` - Resumen de organización de código

**Cuándo leer**:
- Para entender la estructura del proyecto
- Al agregar nuevos archivos o módulos

---

## 🎯 ¿Por dónde empezar?

### 🚀 **Soy nuevo** → Empieza aquí:
1. `AGENTS.md` (root) - Resumen rápido
2. `INGENIEROS-GUIA.md` - Guía específica para ingenieros
3. `docs/architecture/ARQUITECTURA-ACTUAL.md` - Stack y arquitectura

### 💻 **Voy a editar UI** → Lee:
1. `AGENTS.md` (despacho-web) - Patrones de código
2. `lib/types/database.ts` - Tipos de datos
3. `docs/architecture/ARQUITECTURA-ACTUAL.md` - Arquitectura

### 🗄️ **Voy a editar BD** → Lee:
1. `docs/database/DATABASE-SCHEMA.md` - **CRÍTICO**
2. `lib/types/database.ts` - Tipos TypeScript
3. Ver ejemplos en `sql-archives/`

### ✨ **Voy a crear feature** → Lee:
1. `INGENIEROS-GUIA.md` - Feature path
2. `docs/features/` - Ejemplos de features
3. `docs/roadmap/PASOS-SIGUIENTES.md` - Roadmap

---

## 📋 Referencias Rápidas

| Tarea | Documentación principal |
|------|------------------------|
| Comenzar el proyecto | `AGENTS.md` + `INGENIEROS-GUIA.md` |
| Entender arquitectura | `docs/architecture/` |
| Consultar schema BD | `docs/database/DATABASE-SCHEMA.md` |
| Resolver errores | `docs/troubleshooting/` |
| Ver cambios previos | `docs/history/` |
| Planificar futuro | `docs/roadmap/` |

---

## 🔄 Mantener Actualizada

Esta documentación debe mantenerse sincronizada con el código:

1. **Cambios en BD** → Actualizar `docs/database/` y `lib/types/database.ts`
2. **Nuevas features** → Agregar spec a `docs/features/`
3. **Bugs/fixes** → Agregar reporte a `docs/history/` o `docs/troubleshooting/`
4. **Cambios arquitectónicos** → Actualizar `docs/architecture/`

---

**Última actualización**: 23 Enero 2026
**Versión**: 1.0
