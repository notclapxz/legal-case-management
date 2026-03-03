# 🎯 PROJECT STATUS - Sistema Gestión Legal

**Última actualización**: 2026-01-20 (Sesión actual)  
**Usuario**: RZRV - Rolando Zagret Risco Sanchez  
**Versión**: 2.5.0

---

## ✅ COMPLETADO Y VERIFICADO

### Base de Datos
- [x] Trigger código automático ejecutado (`generar_codigo_caso()`)
- [x] Campo `patrocinado` agregado a tabla `casos`
- [x] Verificado: Trigger funciona correctamente
- [x] Verificado: Columna existe y acepta NULL

### Features Implementadas
- [x] Dashboard redesign (Apple-style UI)
- [x] Saludo dinámico + fecha español
- [x] Privacidad financiera (sin montos en listas)
- [x] Campo cliente vs patrocinado
- [x] Checkbox "Misma persona" con auto-sync
- [x] Código automático (1 cliente: `X.APELLIDO-N`, múltiples: `X.APELLIDO-NC-M`)
- [x] Delete button con modal confirmación
- [x] Notas CRUD funcionando
- [x] Método pago (4 tipos)
- [x] Ubicaciones físicas

### Testing
- [x] Test: Crear caso 1 cliente → Código generado correctamente
- [x] Test: Crear caso 2+ clientes → Sufijo `NC` correcto
- [x] Test: Cliente ≠ Patrocinado → Tabla muestra ambos
- [x] Test: Checkbox auto-sync → Funciona
- [x] Test: Dashboard → Saludo + métricas OK

### Código & Build
- [x] Build exitoso: 0 errors, 0 warnings
- [x] TypeScript strict mode
- [x] ESLint passing
- [x] Code cleanup ejecutado (1,800 líneas eliminadas)
- [x] 13 routes generadas

### Documentación
- [x] `PASOS-SIGUIENTES.md` creado
- [x] `ARQUITECTURA-ACTUAL.md` creado
- [x] `AGENTS.md` actualizado
- [x] `CHANGELOG.md` actualizado (v2.5.0)
- [x] `CAMPO-PATROCINADO-IMPLEMENTADO.md` creado
- [x] `STATUS.md` creado (este archivo)

---

## 🚧 PENDIENTE (Backlog Priorizado)

### 🔴 Alta Prioridad (Refactoring - Deuda Técnica)

#### 1. Extraer Validaciones Financieras
**Archivo**: `app/dashboard/casos/nuevo/page.tsx` (líneas 200-265)  
**Problema**: Funciones `getMontoCobradoAyuda()` y `validarMontoCobrado()` hardcoded (65 líneas)  
**Solución**: Crear `lib/validaciones/financieras.ts`  
**Impacto**: Reutilización en `editar/page.tsx`, testing más fácil  
**Esfuerzo**: 2 horas

#### 2. Type Safety - Database Interfaces
**Problema**: Múltiples `any` types, no hay interfaces centralizadas  
**Solución**: Crear `lib/types/database.ts` con interfaces completas  
**Incluir**: 
```typescript
interface Caso { ... }
interface Nota { ... }
interface Evento { ... }
interface Pago { ... }
interface UbicacionFisica { ... }
interface Profile { ... }
```
**Impacto**: Type safety end-to-end, autocomplete, menos bugs  
**Esfuerzo**: 3 horas

#### 3. Split MetodoPagoForm
**Archivo**: `app/components/casos/MetodoPagoForm.tsx` (520 líneas)  
**Problema**: Componente monolítico, difícil de mantener  
**Solución**: Dividir en 4 componentes:
- `MontoFijoForm.tsx`
- `PorEtapasForm.tsx`
- `PorHorasForm.tsx`
- `CuotaLitisForm.tsx`
**Impacto**: Código más limpio, testing unitario posible  
**Esfuerzo**: 4 horas

#### 4. Fix Tipo Caso Validation Mismatch
**Archivo**: `app/dashboard/casos/[id]/editar/page.tsx`  
**Problema**: Frontend permite "Familia" y "Otro" pero DB solo acepta: 'Penal', 'Civil', 'Laboral', 'Administrativo'  
**Solución**: Sincronizar frontend con CHECK constraint de BD  
**Impacto**: Evitar errores de validación  
**Esfuerzo**: 30 minutos

---

### 🟡 Media Prioridad (Features Nuevas)

#### 5. Paginación en Tabla Casos
**Problema**: Query trae TODOS los casos (`SELECT * FROM casos`)  
**Impacto Performance**: 50ms con 10 casos, 500ms con 1000 casos  
**Solución**: Implementar paginación con `LIMIT/OFFSET`  
**Features**: 
- Botones "Anterior/Siguiente"
- Select "Mostrar 10/25/50/100"
- Contador "Mostrando X-Y de Z"
**Esfuerzo**: 3 horas

#### 6. Filtros y Búsqueda
**Features deseadas**:
- Búsqueda por: Cliente, Código, Expediente
- Filtro por: Tipo, Estado, Fecha rango
- Ordenar por: Fecha creación, Cliente, Monto
**Solución**: Query params + Supabase filters  
**Esfuerzo**: 4 horas

#### 7. Soft Delete
**Problema**: Hard delete (`DELETE FROM casos WHERE id = ?`) pierde datos para auditoría  
**Problema conocido**: FK constraint error si caso tiene notas/eventos  
**Solución**: 
```sql
-- Agregar columna a todas las tablas
ALTER TABLE casos ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE notas ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE eventos ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE pagos ADD COLUMN deleted_at TIMESTAMPTZ;

-- Modificar queries
WHERE deleted_at IS NULL
```
**Features**:
- Botón "Papelera" para ver eliminados
- Botón "Restaurar"
- Auto-cleanup después 90 días
**Esfuerzo**: 5 horas

#### 8. Optimizar Queries
**Cambios necesarios**:
```typescript
// ❌ Actual
const { data } = await supabase.from('casos').select('*')

// ✅ Optimizado
const { data } = await supabase
  .from('casos')
  .select('id, codigo_estimado, cliente, patrocinado, tipo, estado')
  .eq('estado', 'Activo')
  .order('created_at', { ascending: false })
  .limit(20)
```
**Agregar índices**:
```sql
CREATE INDEX idx_casos_estado ON casos(estado);
CREATE INDEX idx_casos_created_at ON casos(created_at DESC);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX idx_notas_caso_id ON notas(caso_id);
```
**Esfuerzo**: 2 horas

---

### 🟢 Baja Prioridad (Nice to Have)

#### 9. Testing Automatizado
**Framework**: Playwright (E2E)  
**Coverage objetivo**: 80% happy paths  
**Tests críticos**:
- Login → Dashboard
- Crear caso → Ver en lista → Editar → Eliminar
- Crear nota → Marcar completada
- Validaciones de formulario
**Esfuerzo**: 8 horas (setup + tests)

#### 10. Exportar Casos a CSV/PDF
**Feature**: Dashboard → Reportes → Exportar  
**Filtros**: Por fecha, tipo, estado  
**Formatos**: CSV, PDF  
**Librería**: `jspdf` + `jspdf-autotable`  
**Esfuerzo**: 6 horas

#### 11. Sistema de Notificaciones (Eventos)
**Infraestructura existente**: Tabla `eventos` tiene columnas `alerta_7_dias`, `alerta_3_dias`, etc.  
**Falta implementar**:
- Cron job que verifica fechas próximas
- Envío email/SMS (Supabase Edge Functions)
- Panel de notificaciones en dashboard
**Esfuerzo**: 12 horas

#### 12. Row Level Security (RLS)
**Problema actual**: Todos los usuarios ven todos los datos  
**Solución**: Configurar RLS en Supabase  
**Policies**:
```sql
-- Solo ver casos asignados
CREATE POLICY "Users see assigned cases" ON casos
  FOR SELECT USING (
    abogado_asignado_id = auth.uid() OR
    created_by = auth.uid() OR
    auth.jwt()->>'rol' = 'Admin'
  );

-- Solo editar propios casos
CREATE POLICY "Users edit own cases" ON casos
  FOR UPDATE USING (
    created_by = auth.uid() OR
    auth.jwt()->>'rol' = 'Admin'
  );
```
**Esfuerzo**: 4 horas

---

## 🐛 ISSUES CONOCIDOS (No Bloqueantes)

### 1. FK Constraint al Eliminar Casos
**Síntoma**: Error `violates foreign key constraint` al eliminar caso con notas/eventos  
**Causa**: Foreign keys sin `ON DELETE CASCADE`  
**Workaround**: Eliminar notas/eventos/pagos primero manualmente  
**Fix permanente**: Ver item #7 (Soft Delete) o agregar CASCADE

### 2. Casos Viejos sin Patrocinado
**Síntoma**: Casos creados antes de v2.5.0 tienen `patrocinado = NULL`  
**Impacto**: Al editar, campo está vacío  
**Solución**: Usuario debe llenar manualmente  
**Migration opcional**:
```sql
UPDATE casos 
SET patrocinado = cliente 
WHERE patrocinado IS NULL OR patrocinado = '';
```

### 3. Validaciones Custom (No Zod)
**Problema**: Validaciones hardcoded en componentes  
**Riesgo**: Difícil mantener, propenso a bugs  
**Solución futura**: Migrar a Zod schemas  
**Esfuerzo**: 6 horas

---

## 📊 MÉTRICAS ACTUALES

### Performance
```
Build time: ~15s (production)
Hot reload: ~200ms (Turbopack)
Cold start: ~1.3s (dev)
First Load JS: ~85 KB
```

### Código
```
Total files: ~50
Total lines: ~13,200
TypeScript coverage: 100%
Test coverage: 0% (pendiente)
Components: ~25
```

### Base de Datos
```
Tables: 6
Triggers: 1 (generar_codigo_caso)
Constraints: 8+ (CHECK, NOT NULL, FK, UNIQUE)
Indexes: 1 (PRIMARY KEYS only) ⚠️ Optimización pendiente
RLS Policies: 0 ⚠️ Pendiente configurar
```

---

## 🎯 ROADMAP SUGERIDO

### Sprint 1 (Semana 1-2): Refactoring
- [ ] Item #1: Validaciones financieras
- [ ] Item #2: Database types
- [ ] Item #4: Fix tipo caso validation
- [ ] Item #8: Optimizar queries + índices

**Objetivo**: Deuda técnica resuelta, código más mantenible

---

### Sprint 2 (Semana 3-4): Features Core
- [ ] Item #5: Paginación
- [ ] Item #6: Filtros y búsqueda
- [ ] Item #3: Split MetodoPagoForm (paralelo)

**Objetivo**: UX mejorada, app escalable

---

### Sprint 3 (Semana 5-6): Quality & Security
- [ ] Item #7: Soft delete
- [ ] Item #9: Testing E2E (crítico)
- [ ] Item #12: RLS policies

**Objetivo**: App production-ready, segura

---

### Sprint 4 (Semana 7-8): Production & Nice-to-Have
- [ ] Deploy Vercel
- [ ] Item #10: Export CSV/PDF
- [ ] Item #11: Notificaciones (si tiempo)
- [ ] Monitoring (Sentry/LogRocket)

**Objetivo**: App en producción, features extra

---

## 🚀 PARA EMPEZAR AHORA (Si Querés Seguir)

### Opción A: Refactoring (Más Técnico)
**Empezar con**: Item #2 (Database Types)  
**Por qué**: Beneficia TODOS los demás items, type safety inmediato  
**Tiempo**: 3 horas  
**Archivos**:
- Crear `lib/types/database.ts`
- Actualizar todos los componentes para usar interfaces
- Eliminar `any` types

### Opción B: Features (Más Visible)
**Empezar con**: Item #5 (Paginación)  
**Por qué**: Impacto inmediato en UX, problema de performance real  
**Tiempo**: 3 horas  
**Archivos**:
- `app/dashboard/casos/page.tsx`
- `app/dashboard/casos/components/TablaCasos.tsx`
- Query con `LIMIT/OFFSET`
- Componente `Pagination.tsx`

### Opción C: Quick Wins (Más Rápido)
**Empezar con**: Item #4 (Fix validation) + Item #8 (Índices DB)  
**Por qué**: Bugs resueltos + performance boost en 1 hora  
**Tiempo**: 1.5 horas  
**Cambios**:
- Sincronizar dropdown tipos
- Ejecutar SQL crear índices
- Cambiar `select('*')` → específico

---

## 📞 NEXT STEPS

**Pregunta para vos**: ¿Qué querés hacer ahora?

1. **Seguir con refactoring** (Type safety, validaciones)
2. **Agregar features nuevas** (Paginación, filtros)
3. **Quick wins** (Fixes + índices en 1 hora)
4. **Otra cosa** (Decime qué necesitás)

**O si estás conforme con lo que tenés**, podemos dejarlo acá y retomar cuando necesites algo más.

---

**Estado**: ✅ MVP Funcional - Listo para usar  
**Build**: ✅ 0 errors, 0 warnings  
**Database**: ✅ Migraciones ejecutadas  
**Tests**: ✅ Manuales pasados  
**Producción**: ⏳ Pendiente deploy

**Creado por**: Claude  
**Para**: RZRV - Sistema de Gestión Despacho Legal
