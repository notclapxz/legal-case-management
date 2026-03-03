# Backend Engineer Context

**Última actualización**: 26 Enero 2026  
**Sprint actual**: Foundation - Week 3  
**Asignado a**: Backend Team

---

## Current Task

**Implementando Row Level Security (RLS) policies para multi-tenancy**  
**Status**: 60% completado  
**Estimado**: 2 días restantes  
**Priority**: P0 (Critical - Security)

### Subtasks

- [x] Diseñar modelo de RLS para casos
- [x] Implementar policy "Users can view own cases"
- [x] Implementar policy "Users can create cases"
- [ ] Implementar policy "Users can update own cases"
- [ ] Implementar policy "Users can delete own cases"
- [ ] Testing de RLS con diferentes usuarios
- [ ] Documentar RLS policies en security.md

---

## Completed ✅

### This Week (22-26 Ene)
- [x] Creé Server Action `createCaso` en `app/actions/casos.ts`
- [x] Actualicé contratos en `.agents/contracts/api-spec.md`
- [x] Agregué validación de input con checks manuales
- [x] Implementé auth check en todos los endpoints

### Last Week (15-19 Ene)
- [x] Definí contratos para módulo de Casos (POST, GET, PUT, DELETE)
- [x] Actualicé `lib/types/database.ts` con tipos completos
- [x] Migré de API Routes a Server Actions (mejor DX)
- [x] Configuré RLS básico en tabla `casos`

---

## In Progress 🚧

### Main Task
**RLS Policies para tabla `casos`** (60%)

```sql
-- COMPLETADO ✅
CREATE POLICY "Users can view own cases"
ON casos FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  auth.uid() = abogado_asignado_id
);

CREATE POLICY "Users can create cases"
ON casos FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- EN PROGRESO 🚧
CREATE POLICY "Users can update own cases"
ON casos FOR UPDATE
USING (
  auth.uid() = created_by 
  OR 
  auth.uid() = abogado_asignado_id
)
WITH CHECK (
  auth.uid() = created_by 
  OR 
  auth.uid() = abogado_asignado_id
);

-- PENDIENTE ⏸️
CREATE POLICY "Users can delete own cases"
ON casos FOR DELETE
USING (auth.uid() = created_by);
```

**Pendiente**:
- [ ] Testing de UPDATE policy con múltiples usuarios
- [ ] Implementar DELETE policy
- [ ] Extender RLS a tablas relacionadas (notas, pagos, eventos)

---

## Contracts Updated 📄

### Recent Updates

#### api-spec.md
- [x] **POST /api/v1/casos** - Crear caso (22 Ene)
- [x] **GET /api/v1/casos** - Lista de casos (22 Ene)
- [x] **GET /api/v1/casos/:id** - Detalle de caso (23 Ene)
- [ ] **PUT /api/v1/casos/:id** - Actualizar caso (WIP - 26 Ene)
- [ ] **DELETE /api/v1/casos/:id** - Eliminar caso (Pending)

#### types.md
- [x] `Caso` interface (22 Ene)
- [x] `CreateCasoDTO` (22 Ene)
- [x] `UpdateCasoDTO` (23 Ene)
- [x] `CasoResponse` (22 Ene)
- [x] `CasoListResponse` (22 Ene)

---

## Blockers 🚫

### High Priority
Ninguno actualmente

### Medium Priority
**Testing strategy para RLS no está clara**  
**Impacto**: No sé cómo verificar que policies funcionan correctamente  
**Acción**: Investigar best practices para testing RLS  
**Deadline**: Antes de declarar RLS "done"

---

## Tech Decisions 📋

### Decision #1: Server Actions vs API Routes
**Fecha**: 18 Ene 2026  
**Decisión**: Usar Server Actions como default  
**Razón**: Menos boilerplate, mejor DX, integración automática con Next.js  
**Resultado**: Implementado en módulo de Casos, más rápido de desarrollar

### Decision #2: Validación con checks manuales (temporal)
**Fecha**: 20 Ene 2026  
**Decisión**: Validación manual primero, Zod después  
**Razón**: Más rápido para MVP, migrar a Zod en Fase 2  
**Review**: Migrar a Zod en próximas 2 semanas

### Decision #3: RLS como capa de seguridad principal
**Fecha**: 22 Ene 2026  
**Decisión**: Implementar RLS en todas las tablas sensibles  
**Razón**: Seguridad a nivel de DB, no depende de lógica de app  
**Aplicación**: Prioridad P0, bloquea otras features

---

## Database Changes

### Migrations Ejecutadas

```sql
-- 2026-01-20: Agregado campo 'patrocinado'
ALTER TABLE casos ADD COLUMN patrocinado TEXT;

-- 2026-01-22: Enable RLS en tabla casos
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;

-- 2026-01-23: Creadas policies SELECT e INSERT
-- (Ver sección "In Progress" para código)
```

### Schema Updates in `lib/types/database.ts`

```typescript
// AGREGADO 20 Ene
export interface Caso {
  // ... campos existentes
  patrocinado?: string | null  // ← NUEVO
}

// AGREGADO 22 Ene
export interface CreateCasoDTO {
  cliente: string
  tipo: TipoCaso
  descripcion?: string
  patrocinado?: string  // ← NUEVO
}
```

---

## API Endpoints Status

### Implemented ✅
- **POST /casos** - Server Action `createCaso` ✅
- **GET /casos** - Server Component fetch ✅
- **GET /casos/:id** - Server Component fetch ✅

### In Progress 🚧
- **PUT /casos/:id** - Server Action `updateCaso` (70%)

### Pending ⏸️
- **DELETE /casos/:id** - Not started
- **GET /casos?filter=...** - Filtering logic pending

---

## Security Implementations

### Authentication
✅ JWT tokens via Supabase Auth  
✅ Auth check en todos los endpoints  
✅ Refresh tokens manejados por Supabase SDK  

### Authorization
✅ RLS policies para casos (SELECT, INSERT)  
🚧 RLS policies para casos (UPDATE, DELETE) - WIP  
⏸️ RLS policies para notas, pagos, eventos - Pending  

### Input Validation
✅ Manual validation en Server Actions  
⏸️ Zod schemas - Planned Fase 2  

### Rate Limiting
⏸️ Not implemented - Planned Fase 3  

---

## Performance Notes

### Query Optimization
- **Casos list**: 45ms avg (Target: <100ms) ✅
- **Caso detail**: 32ms avg (Target: <50ms) ✅
- **Insert caso**: 78ms avg (Target: <100ms) ✅

### Indexes Created
```sql
-- Mejorar lookup por created_by
CREATE INDEX idx_casos_created_by ON casos(created_by);

-- Mejorar lookup por abogado_asignado
CREATE INDEX idx_casos_abogado ON casos(abogado_asignado_id);

-- Mejorar sorting por fecha
CREATE INDEX idx_casos_created_at ON casos(created_at DESC);
```

---

## Testing Coverage

### Manual Testing
✅ Tested POST /casos with valid data  
✅ Tested POST /casos with invalid data  
✅ Tested GET /casos with different users  
⏸️ Testing UPDATE with RLS pending  

### E2E Tests (via Frontend)
✅ Create caso flow  
✅ List casos flow  
⏸️ Update caso flow - Pending  
⏸️ Delete caso flow - Pending  

---

## Learnings & Notes 📝

### What Went Well
- Server Actions son más simples que API Routes
- RLS en Supabase funciona excelente cuando está bien configurado
- Supabase Dashboard es muy útil para debugging

### What Could Be Better
- Necesitamos strategy clara para testing RLS
- Validación manual es verbosa, migrar a Zod
- Documentation de RLS policies podría ser mejor

### Tips for Future
- Siempre definir contrato ANTES de implementar
- Testing de RLS con múltiples usuarios es crítico
- Documentar decisiones de seguridad en decisions.md

---

## Next Tasks (Prioritized)

### P0 - Critical
- [ ] Completar RLS policies (UPDATE, DELETE)
- [ ] Testing de RLS con diferentes usuarios
- [ ] Documentar RLS en security.md

### P1 - High
- [ ] Implementar Server Action `updateCaso`
- [ ] Agregar validación con Zod
- [ ] Extender RLS a tabla `notas`

### P2 - Medium
- [ ] Implementar filtering en GET /casos
- [ ] Optimizar queries con más indexes
- [ ] Agregar API error logging

### P3 - Low
- [ ] Rate limiting
- [ ] API versioning (v1, v2)
- [ ] GraphQL endpoint (long-term)

---

## Questions / Need Help ❓

1. **¿Cómo testear RLS de manera automatizada?**  
   - Actualmente testing manual en Dashboard
   - ¿Existe herramienta para testing RLS?
   - **Action**: Investigar y documentar

2. **¿Cuándo implementar rate limiting?**  
   - No es crítico para MVP
   - ¿Fase 2 o Fase 3?
   - **Action**: Discutir prioridad con Tech Lead

---

## Contact & Coordination

**Slack**: @backend-team  
**Daily Standup**: 9:30am  
**Weekly Sync**: Miércoles 10am  
**Code Reviews**: GitHub PRs (tag @tech-lead)  

**Frontend coordination**: 
- Contratos actualizados en `.agents/contracts/`
- Notificar breaking changes en Slack #backend-updates

---

**Mantenido por**: Backend Engineering Team  
**Review frequency**: Daily updates  
**Last sync with Frontend**: 24 Ene 2026
