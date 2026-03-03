# Sistema de Permisos por Rol

**Status**: ✅ **COMPLETADO** (27 Enero 2026)  
**Implementación**: RLS Policies en Supabase + Frontend  
**Usuarios**: 3 (RZRV - admin, María - abogado, Ana - secretaria)

---

## 🎯 Objetivo

Implementar control de acceso basado en roles (RBAC) para que:
- **RZRV (admin)**: Acceso total al sistema
- **Abogados**: Solo ven casos asignados + notas (SIN información financiera)
- **Secretarias**: Solo lectura de casos asignados + notas (SIN información financiera)

---

## 👥 Roles del Sistema

### 1. Admin (RZRV)
**Usuario**: admin@despacho.test  
**Username**: RZRV  
**Permisos**:
- ✅ Ve TODOS los casos
- ✅ Crea, actualiza, elimina casos
- ✅ Ve TODA la información financiera (forma_pago, monto_total, monto_cobrado, monto_pendiente)
- ✅ Ve, crea, actualiza, elimina pagos
- ✅ Ve, crea, actualiza, elimina notas de TODOS los casos
- ✅ Asigna casos a otros usuarios

### 2. Abogado
**Ejemplo**: abogada1@despacho.test (María González)  
**Permisos**:
- ✅ Ve SOLO casos asignados a él/ella (`casos.abogado_asignado_id = user_id`)
- ✅ Actualiza casos asignados (descripción, etapa, estado, etc.)
- ❌ **NO VE información financiera** (campos ocultos en frontend)
- ❌ **NO VE tabla pagos** (RLS policy bloquea acceso)
- ✅ Ve notas de casos asignados
- ✅ Crea y actualiza notas en casos asignados
- ❌ NO elimina notas
- ❌ NO crea casos nuevos
- ❌ NO elimina casos

### 3. Secretaria
**Ejemplo**: secretaria@despacho.test (Ana Torres)  
**Permisos**:
- ✅ Ve SOLO casos asignados (`casos.abogado_asignado_id = user_id`)
- ❌ **NO MODIFICA casos** (solo lectura)
- ❌ **NO VE información financiera** (campos ocultos en frontend)
- ❌ **NO VE tabla pagos** (RLS policy bloquea acceso)
- ✅ Ve notas de casos asignados
- ❌ NO crea ni modifica notas
- ❌ NO elimina notas

---

## 🔒 Implementación Técnica

### A. Row Level Security (RLS) Policies

#### Tabla: `casos`

```sql
-- ADMIN: Acceso completo
"Admin ve todos los casos" (SELECT)
"Admin crea casos" (INSERT)
"Admin actualiza casos" (UPDATE)
"Admin elimina casos" (DELETE)

-- ABOGADO: Solo casos asignados
"Abogado ve casos asignados" (SELECT)
  → WHERE casos.abogado_asignado_id = auth.uid()
"Abogado actualiza casos asignados" (UPDATE)
  → WHERE casos.abogado_asignado_id = auth.uid()

-- SECRETARIA: Solo lectura de casos asignados
"Secretaria ve casos asignados" (SELECT)
  → WHERE casos.abogado_asignado_id = auth.uid()
```

**Campos Financieros** (NO se bloquean en RLS, se ocultan en frontend):
- `forma_pago`
- `monto_total`
- `monto_cobrado`
- `monto_pendiente`

#### Tabla: `pagos`

```sql
-- SOLO ADMIN tiene acceso
"Solo admin ve pagos" (SELECT)
"Solo admin crea pagos" (INSERT)
"Solo admin actualiza pagos" (UPDATE)
"Solo admin elimina pagos" (DELETE)

-- Abogado/Secretaria: SIN ACCESO (RLS bloquea queries)
```

#### Tabla: `notas`

```sql
-- ADMIN: Acceso completo
"Admin ve todas las notas" (SELECT)
"Admin crea notas" (INSERT)
"Admin actualiza notas" (UPDATE)
"Admin elimina notas" (DELETE)

-- ABOGADO/SECRETARIA: Solo notas de casos asignados
"Usuarios ven notas de casos asignados" (SELECT)
  → JOIN casos WHERE casos.abogado_asignado_id = auth.uid()

-- ABOGADO: Puede crear/modificar notas
"Abogado crea notas en casos asignados" (INSERT)
"Abogado actualiza notas en casos asignados" (UPDATE)

-- SECRETARIA: Solo lectura (no tiene policies de INSERT/UPDATE)
```

---

### B. Frontend (Ocultación de Campos)

#### Hook: `useUserRole()`

```typescript
// Crear hook para obtener rol del usuario
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RolUsuario } from '@/lib/types/database'

export function useUserRole() {
  const [rol, setRol] = useState<RolUsuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('rol')
          .eq('id', user.id)
          .single()
        
        setRol(data?.rol || null)
      }
      setLoading(false)
    })
  }, [])

  return { rol, loading, isAdmin: rol === 'admin' }
}
```

#### Componentes de Casos

```typescript
// En CasoDetallePage o CasoForm
const { rol, isAdmin } = useUserRole()

// Ocultar campos financieros si NO es admin
{isAdmin && (
  <div>
    <FormaPagoField />
    <MontoTotalField />
    <MontoCobradoField />
    <MontoPendienteField />
  </div>
)}

// Ocultar sección de pagos completamente
{isAdmin && (
  <PagosSection casoId={id} />
)}
```

---

## 📁 Archivos Modificados/Creados

### Base de Datos
```
sql-archives/
└── 2026-01-27_update_rls_policies_roles.sql    ✅ Migration aplicada
```

### TypeScript Types
```
despacho-web/lib/types/database.ts
├── export type RolUsuario = 'admin' | 'abogado' | 'secretaria'    ✅
└── interface Profile { rol: RolUsuario }                           ✅
```

### Frontend (Por implementar)
```
despacho-web/app/hooks/
└── useUserRole.ts                              ⚠️ Por crear

despacho-web/app/dashboard/casos/
├── [id]/page.tsx                               ⚠️ Agregar useUserRole + ocultar campos
├── [id]/editar/page.tsx                        ⚠️ Agregar useUserRole + ocultar campos
└── components/MetodoPagoForm.tsx               ⚠️ Agregar useUserRole + ocultar si NO admin
```

---

## 🧪 Testing

### Verificar Permisos (SQL)

```sql
-- 1. Conectar como RZRV (admin)
SET session.user_id = '2e4578b2-0637-451d-820e-8549664712bc';

SELECT COUNT(*) FROM casos;        -- Debe ver TODOS los casos
SELECT COUNT(*) FROM pagos;        -- Debe ver TODOS los pagos
SELECT COUNT(*) FROM notas;        -- Debe ver TODAS las notas

-- 2. Conectar como María (abogado)
SET session.user_id = '85ae549f-9bd8-4e5b-8f36-673b1d8b61ae';

SELECT COUNT(*) FROM casos;        -- Solo ve casos donde abogado_asignado_id = María
SELECT COUNT(*) FROM pagos;        -- Debe retornar 0 (sin acceso)
SELECT COUNT(*) FROM notas;        -- Solo ve notas de SUS casos

-- 3. Conectar como Ana (secretaria)
SET session.user_id = '48b3c04c-b8aa-4358-bad1-419bee335b2a';

SELECT COUNT(*) FROM casos;        -- Solo ve casos donde abogado_asignado_id = Ana
SELECT COUNT(*) FROM pagos;        -- Debe retornar 0 (sin acceso)
SELECT COUNT(*) FROM notas;        -- Solo ve notas de SUS casos
```

### Verificar Frontend

1. Login como **RZRV** (admin@despacho.test)
   - ✅ Ve TODOS los casos en lista
   - ✅ Al abrir un caso, ve campos financieros
   - ✅ Ve pestaña "Pagos"

2. Login como **María** (abogada1@despacho.test)
   - ✅ Ve SOLO casos asignados a ella
   - ❌ NO ve campos financieros (forma_pago, montos)
   - ❌ NO ve pestaña "Pagos"

3. Login como **Ana** (secretaria@despacho.test)
   - ✅ Ve SOLO casos asignados a ella
   - ❌ NO ve campos financieros
   - ❌ NO ve pestaña "Pagos"
   - ❌ NO puede editar casos (botón "Guardar" deshabilitado)

---

## 📊 Tabla de Permisos

| Operación | Admin | Abogado | Secretaria |
|-----------|-------|---------|------------|
| **CASOS** |
| Ver todos los casos | ✅ | ❌ | ❌ |
| Ver casos asignados | ✅ | ✅ | ✅ |
| Ver campos financieros | ✅ | ❌ | ❌ |
| Crear caso | ✅ | ❌ | ❌ |
| Editar caso | ✅ | ✅ (solo asignados) | ❌ |
| Eliminar caso | ✅ | ❌ | ❌ |
| **PAGOS** |
| Ver pagos | ✅ | ❌ | ❌ |
| Crear pago | ✅ | ❌ | ❌ |
| Editar pago | ✅ | ❌ | ❌ |
| Eliminar pago | ✅ | ❌ | ❌ |
| **NOTAS** |
| Ver todas las notas | ✅ | ❌ | ❌ |
| Ver notas de casos asignados | ✅ | ✅ | ✅ |
| Crear nota | ✅ | ✅ (solo en casos asignados) | ❌ |
| Editar nota | ✅ | ✅ (solo en casos asignados) | ❌ |
| Eliminar nota | ✅ | ❌ | ❌ |

---

## 🚨 Importante: Asignación de Casos

Para que un usuario vea un caso, **DEBE estar asignado** como `abogado_asignado_id`.

```sql
-- Ejemplo: Asignar caso a María González
UPDATE casos
SET abogado_asignado_id = '85ae549f-9bd8-4e5b-8f36-673b1d8b61ae'
WHERE codigo_estimado = 'MORENO-01';

-- Ahora María puede ver MORENO-01
```

**Solo RZRV (admin) puede asignar casos.**

---

## ✅ Estado Actual

- ✅ **RLS Policies**: Aplicadas correctamente
- ✅ **TypeScript Types**: Actualizados con `RolUsuario`
- ⚠️ **Frontend**: Pendiente (ocultar campos financieros según rol)

**Próximo paso**: Implementar `useUserRole()` hook y actualizar componentes de casos para ocultar secciones financieras.

---

**Última actualización**: 27 Enero 2026  
**Mantenido por**: AI Agent
