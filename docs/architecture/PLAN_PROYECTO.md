# 📋 PLAN DE PROYECTO - Sistema de Gestión Despacho de Abogados

**Fecha de inicio**: 12 de Enero, 2026
**Cliente**: Despacho de abogados (Padre - Abogado Principal)
**Desarrollador**: Sebastián Risco (Hijo - Analista de Datos)

---

## 🎯 Visión del Proyecto

Crear un **sistema web** que permita al despacho:
1. ✅ **Nunca perder una audiencia** (alertas visuales efectivas)
2. ✅ **Proyectar ingresos con confianza** (flujo de caja predecible)
3. ✅ **Encontrar expedientes en segundos** (ubicación física digitalizada)
4. ✅ **Prepararse rápido para reuniones** (fichas ejecutivas)

---

## 📊 Estado Actual del Despacho

### Casos
- **~250 casos totales** (activos + cerrados)
- **~100 casos eliminados/cerrados**
- **~150 casos activos estimados**
- **2 clientes recurrentes principales**: Carlos Moreno (20+ casos), Carlos Aguirre (15+ casos)

### Almacenamiento Físico
- **5 FILAS** (estantes horizontales en forma de U) organizados por zonas de clientes
- **NO hay orden alfabético estricto**
- **Muchos casos multi-tomo** (I, II, III, IV, V)
- **Ubicaciones sin registro digital**
- Sistema de coordenadas: **#-Columna** (ej: 1-A, 3-C)

### Equipo
- 1 Abogado principal (tablet como dispositivo principal)
- 2 Abogadas asistentes
- 1 Secretaria
- 1 Analista (tú)

### Tecnología Actual
- Agenda digital en tablet (papá)
- Notas en computadora
- Seguimiento mental + mensajes dispersos
- Word con lista de casos (sin estructura)

---

## 🚦 FASES DEL PROYECTO

### ✅ FASE 0: PREPARACIÓN (ACTUAL) - 1 semana

**Objetivo**: Reunir toda la información necesaria antes de codear

#### Tareas completadas:
- [x] Documento de contexto completo (`claude.md`)
- [x] CSV con 250+ casos (`casos_despacho.csv`)
- [x] Guía de mapeo de almacén (`GUIA_MAPEO_ALMACEN.md`)
- [x] Análisis del documento ARCHIVADORE1.docx

#### Tareas pendientes:
- [ ] **Recibir segundo documento** con información adicional de casos
- [ ] **Mapear ubicaciones físicas** del almacén (3-4 horas en oficina)
- [ ] **Completar CSV** con datos faltantes:
  - [ ] Monto total y monto cobrado (por caso)
  - [ ] Forma de pago (por caso)
  - [ ] Fecha de inicio aproximada
  - [ ] Abogada asignada
  - [ ] Etapa actual del proceso
- [ ] **Validar casos activos vs eliminados** con tu papá
- [ ] **Obtener credenciales para infraestructura**:
  - [ ] Crear cuenta Supabase (base de datos)
  - [ ] Crear cuenta Vercel (hosting)
  - [ ] Crear repositorio GitHub

#### Decisiones pendientes:
1. ¿Quién hará la carga inicial de datos al sistema? (secretaria/tú/abogadas)
2. ¿Qué eventos próximos hay actualmente? (audiencias, plazos, reuniones)
3. ¿Hay algún caso con audiencia en los próximos 7 días? (URGENTE para probar alertas)

---

### 🏗️ FASE 1: MVP - DESARROLLO (2-3 semanas)

**Objetivo**: Sistema funcional básico que resuelva los 3 problemas críticos

#### Semana 1: Infraestructura y Casos
- [ ] Configurar proyecto Next.js + TypeScript + Tailwind
- [ ] Crear base de datos en Supabase (5 tablas)
- [ ] Implementar autenticación (NextAuth)
- [ ] CRUD completo de casos
- [ ] Importar casos desde CSV
- [ ] Buscador de casos

#### Semana 2: Calendario y Alertas
- [ ] Sistema de eventos (audiencias, plazos, reuniones)
- [ ] Calendario visual (react-big-calendar)
- [ ] Dashboard con alertas por color (rojo/naranja/amarillo)
- [ ] Notificaciones de eventos próximos
- [ ] Crear 10-15 eventos de prueba

#### Semana 3: Finanzas y Pulido
- [ ] Proyección financiera (3 algoritmos según forma de pago)
- [ ] Historial de pagos
- [ ] Fichas ejecutivas para reuniones
- [ ] Diseño responsive (tablet como prioridad)
- [ ] Testing completo
- [ ] Deploy a producción

#### Entregables Fase 1:
- ✅ Dashboard con alertas funcionales
- ✅ Lista y detalle de casos
- ✅ Calendario de eventos
- ✅ Proyección de cobros (mes actual y siguiente)
- ✅ Buscador de expedientes con ubicación física
- ✅ Login seguro (5 usuarios)
- ✅ Sistema en producción (URL accesible)

---

### ⚡ FASE 2: OPTIMIZACIÓN (1-2 meses)

**Objetivo**: Mejorar experiencia y agregar features solicitadas

#### Features:
- [ ] Análisis de rentabilidad por tipo de caso
- [ ] Control de cobranzas detallado
- [ ] Alertas por email/WhatsApp (Twilio API)
- [ ] Exportar fichas a PDF
- [ ] Registro de tiempo invertido por caso
- [ ] Permisos granulares por rol
- [ ] Dashboard visual con gráficos avanzados (recharts)
- [ ] Historial de cambios detallado (auditoría)
- [ ] Fotos de expedientes en el sistema

#### Decisión posterior: Priorizar según feedback de Fase 1

---

### 🤖 FASE 3: AUTOMATIZACIÓN (2-3 meses)

**Objetivo**: Funcionalidades "mágicas" que ahorren tiempo

#### Features:
- [ ] Generador automático Word → PowerPoint (alegatos)
- [ ] Sistema de dictado a texto (Speech-to-Text API)
- [ ] Reporte matutino automático por email
- [ ] Templates de documentos legales
- [ ] Importación masiva Excel/CSV
- [ ] Notificaciones push (PWA)
- [ ] Modo offline

---

### 📊 FASE 4: ANALYTICS (6+ meses)

**Objetivo**: Inteligencia de negocio y predicciones

#### Features:
- [ ] Análisis histórico completo
- [ ] Predicción de duración de casos (ML)
- [ ] Identificación de cuellos de botella
- [ ] Clientes más rentables
- [ ] Estacionalidad y tendencias
- [ ] Dashboard ejecutivo

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgo 1: Datos incompletos/incorrectos
**Probabilidad**: Alta
**Impacto**: Alto
**Mitigación**:
- Fase 0 extendida para validar toda la información
- Sistema de importación flexible que permita correcciones
- Campo de "notas" para casos con info incompleta

### Riesgo 2: Resistencia al cambio (equipo no usa el sistema)
**Probabilidad**: Media
**Impacto**: Crítico
**Mitigación**:
- Diseño intuitivo que no requiera capacitación
- Empezar solo con el abogado principal (early adopter)
- Demostrar valor inmediato (alertas que funcionan)

### Riesgo 3: Información sensible mal protegida
**Probabilidad**: Baja
**Impacto**: Crítico
**Mitigación**:
- HTTPS obligatorio desde día 1
- Autenticación robusta (NextAuth + bcrypt)
- Backup automático (Supabase)
- No committear variables de entorno

### Riesgo 4: Sistema lento o caído
**Probabilidad**: Baja
**Impacto**: Alto
**Mitigación**:
- Hosting en Vercel (99.9% uptime)
- Supabase con backup diario
- Caché inteligente de consultas frecuentes
- Monitoreo con Vercel Analytics

### Riesgo 5: Segundo documento nunca llega
**Probabilidad**: Media
**Impacto**: Medio
**Mitigación**:
- Proceder con información actual
- Diseñar sistema flexible para agregar campos después
- Dejar campos opcionales en el MVP

---

## 💰 PRESUPUESTO (Fase 1 - MVP)

### Infraestructura (Mes 1-3):
- **Vercel**: GRATIS (100GB/mes suficiente)
- **Supabase**: GRATIS (500MB suficiente para MVP)
- **Dominio**: $0 (subdominio .vercel.app)
- **Total**: **$0/mes**

### Tiempo de Desarrollo:
- **Sebastián**: 2-3 semanas (~60-80 horas)
- **Valor**: Proyecto familiar (sin costo)

### Escalamiento futuro (si crece):
- VPS propio: $5-6/mes
- Dominio personalizado: $10-15/año
- Twilio (SMS/WhatsApp): $0.01/mensaje

---

## 📅 CRONOGRAMA TENTATIVO

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| **Fase 0: Preparación** | 1 semana | 12 Ene 2026 | 19 Ene 2026 |
| **Fase 1: MVP** | 3 semanas | 20 Ene 2026 | 9 Feb 2026 |
| **Testing & Ajustes** | 1 semana | 10 Feb 2026 | 16 Feb 2026 |
| **Lanzamiento Beta** | - | **17 Feb 2026** | - |
| **Fase 2: Optimización** | 4-6 semanas | Mar-Abr 2026 | - |
| **Fase 3: Automatización** | 8-10 semanas | May-Jul 2026 | - |

**Fecha objetivo MVP**: **17 de Febrero, 2026** (5 semanas desde hoy)

---

## ✅ CRITERIOS DE ÉXITO (MVP)

### Técnicos:
- [ ] Sistema accesible 24/7 desde tablet/móvil/desktop
- [ ] Tiempo de carga <2 segundos
- [ ] HTTPS habilitado
- [ ] Backup automático funcional
- [ ] 5 usuarios pueden loguearse simultáneamente

### Funcionales:
- [ ] 150+ casos cargados en el sistema
- [ ] Alertas de eventos próximos funcionan (rojo/naranja/amarillo)
- [ ] Proyección financiera calcula correctamente
- [ ] Buscador encuentra expedientes en <3 segundos
- [ ] Fichas ejecutivas generan información completa

### Experiencia de Usuario:
- [ ] Tu papá puede ver su agenda en <10 segundos tras login
- [ ] Puede buscar un expediente y ver ubicación física en <5 segundos
- [ ] Crear un caso nuevo toma <2 minutos
- [ ] Sistema es intuitivo (no requiere manual)

### Negocio:
- [ ] **NUNCA se pierde una audiencia** (alertas visibles 7 días antes)
- [ ] **Proyección de ingresos visible** (mes actual + siguiente)
- [ ] **Ahorra tiempo** en preparación de reuniones (fichas rápidas)

---

## 📌 SIGUIENTE PASO INMEDIATO

### Para Sebastián (tú):
1. ✅ Esperar segundo documento (si llega)
2. ✅ Ir a la oficina y mapear almacén (GUIA_MAPEO_ALMACEN.md)
3. ✅ Completar CSV con casos reales
4. ✅ Validar información con tu papá
5. ✅ Crear cuentas (Supabase, Vercel, GitHub)
6. 🚀 **EMPEZAR FASE 1 cuando tengas todo listo**

### Para tu papá:
1. Revisar CSV de casos
2. Identificar 5-10 eventos próximos (audiencias, plazos)
3. Validar qué casos están activos vs cerrados
4. Confirmar si hay audiencias urgentes (<7 días)
5. Proporcionar acceso a cualquier documento adicional

### Para la secretaria:
1. Familiarizarse con el CSV
2. Estar lista para ayudar con carga inicial de datos
3. Identificar casos que no aparecen en ARCHIVADORE1.docx

---

## 📞 COMUNICACIÓN

### Reuniones semanales (recomendado):
- **Día**: Domingos (o cuando estés en casa)
- **Duración**: 30 minutos
- **Agenda**:
  1. Demo de avances de la semana
  2. Feedback y ajustes necesarios
  3. Prioridades para la siguiente semana

### Canal de comunicación diaria:
- WhatsApp/Telegram para dudas rápidas
- Evitar llamadas durante horario de oficina (a menos que sea urgente)

---

## 🎯 DEFINICIÓN DE "LISTO" (Definition of Done)

Una feature está "lista" cuando:
- ✅ Código funciona en producción
- ✅ Es responsive (tablet/móvil/desktop)
- ✅ No tiene bugs críticos
- ✅ Tu papá puede usarla sin ayuda
- ✅ Está documentada (si es compleja)

---

## 📚 DOCUMENTACIÓN DEL PROYECTO

### Documentos creados hasta ahora:
1. ✅ `claude.md` - Especificación técnica completa
2. ✅ `casos_despacho.csv` - Base de datos de casos
3. ✅ `GUIA_MAPEO_ALMACEN.md` - Guía para mapear ubicaciones
4. ✅ `PLAN_PROYECTO.md` - Este documento
5. ✅ `armartio MLP.png` - Diagrama del almacén

### Documentos pendientes:
- [ ] Segundo documento con info adicional (esperando)
- [ ] Fotos del almacén (cuando vayas a la oficina)
- [ ] CSV completado con datos reales
- [ ] README.md del proyecto (cuando empiece Fase 1)

---

## 🔄 METODOLOGÍA DE TRABAJO

### Enfoque: Agile simplificado

**Sprints**: Semanal
**Planning**: Domingos (o cada 7 días)
**Review**: Antes del siguiente planning
**Daily**: No necesario (proyecto personal)

### Herramientas:
- **Git/GitHub**: Control de versiones
- **Vercel**: Deploy automático
- **Claude Code**: Asistencia en desarrollo
- **WhatsApp**: Comunicación rápida

---

## ⚡ QUICK WINS (Resultados rápidos)

Estos son features que puedes demostrar rápido para generar entusiasmo:

1. **Dashboard con 3 alertas de prueba** (Semana 1 - Día 3)
   - Mostrar cómo se vería una audiencia HOY (roja)
   - Una en 3 días (naranja)
   - Una en 7 días (amarilla)

2. **Buscador de casos funcional** (Semana 1 - Día 5)
   - Buscar "Carlos Moreno" y ver 20+ resultados
   - Click en uno y ver ubicación física

3. **Calendario con eventos** (Semana 2 - Día 3)
   - Vista mensual con colores
   - 10 eventos de prueba distribuidos

4. **Ficha ejecutiva de un caso** (Semana 2 - Día 5)
   - Generar ficha de Carlos Moreno - Exp 02437-2016
   - Mostrar toda la info relevante en 1 página

---

## 🎓 APRENDIZAJES ESPERADOS

### Para Sebastián (técnicos):
- Next.js 14 con App Router
- Prisma ORM
- NextAuth autenticación
- Supabase (PostgreSQL)
- Deploy en Vercel
- Diseño responsive con Tailwind

### Para el despacho (negocio):
- Gestión digital de casos
- Proyección financiera basada en datos
- Organización física mejorada
- Preparación para escalamiento futuro

---

## 🏁 CONCLUSIÓN

### Estamos listos para empezar cuando:
- [x] Tenemos contexto completo del problema ✅
- [x] Tenemos lista de casos (CSV) ✅
- [ ] Tenemos ubicaciones físicas mapeadas ⏳
- [ ] Tenemos información adicional (segundo doc) ⏳
- [ ] Tenemos casos validados con tu papá ⏳
- [ ] Tenemos eventos próximos identificados ⏳

### NO empezamos hasta:
- Completar Fase 0 (preparación)
- Validar que toda la información es correcta
- Confirmar prioridades con tu papá

---

**Estado actual**: ✅ **Fase 0 - En progreso**
**Próximo hito**: Mapeo de almacén (1 hora en oficina)
**Fecha inicio Fase 1**: Pendiente (estimado: ~19-20 Enero)

---

*Documento vivo - Se actualizará según avance el proyecto*
*Última actualización: 12 de Enero, 2026*
