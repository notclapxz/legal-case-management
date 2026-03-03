# Shared TypeScript Types

**Proyecto**: Sistema de Gestión de Despacho Legal  
**Versión**: 1.0  
**Última actualización**: 26 Enero 2026

---

## ⚠️ IMPORTANTE

Este archivo define los **types compartidos** entre Frontend y Backend.

**Backend Engineer**: Definir types ANTES de implementar  
**Frontend Engineer**: Importar types desde `@/lib/types/database`

**Source of Truth**: `/despacho-web/lib/types/database.ts`

---

## Enums

### TipoCaso
```typescript
export type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
```

### EstadoCaso
```typescript
export type EstadoCaso = 'Activo' | 'Inactivo'
```

### EstadoProcesal
```typescript
export type EstadoProcesal = 'En proceso' | 'Ganado' | 'Perdido'
```

### FormaPago
```typescript
export type FormaPago = 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'
```

### CategoriaNota
```typescript
export type CategoriaNota = 'General' | 'Urgente' | 'Legal' | 'Administrativa' | 'Financiera'
```

### PrioridadNota
```typescript
export type PrioridadNota = 'Alta' | 'Media' | 'Baja'
```

### TipoEvento
```typescript
export type TipoEvento = 'Audiencia' | 'Plazo' | 'Reunión' | 'Otro'
```

### MetodoPago
```typescript
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Otro'
```

---

## Database Entities

### Caso (Case)

```typescript
export interface Caso {
  // IDs y referencias
  id: string                        // uuid, NOT NULL, PK
  codigo_estimado: string           // text, NOT NULL, UNIQUE (auto-generado)
  
  // Personas
  cliente: string                   // text, NOT NULL (quien paga)
  patrocinado?: string | null       // text, NULLABLE (quien es defendido)
  abogado_asignado_id?: string | null   // uuid, NULLABLE, FK → profiles(id)
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
  
  // Información del caso
  descripcion?: string | null       // text, NULLABLE
  expediente?: string | null        // text, NULLABLE
  tipo: TipoCaso                    // text, NOT NULL
  etapa?: string | null             // text, NULLABLE
  
  // Estados
  estado: EstadoCaso                // text, NOT NULL, DEFAULT 'Activo'
  estado_caso?: EstadoProcesal | null   // varchar(50), NULLABLE, DEFAULT 'En proceso'
  
  // Financiero
  forma_pago?: FormaPago | null     // text, NULLABLE
  monto_total?: number | null       // numeric, NULLABLE, DEFAULT 0
  monto_cobrado?: number | null     // numeric, NULLABLE, DEFAULT 0
  monto_pendiente?: number | null   // numeric, NULLABLE (calculado)
  
  // Ubicación y fechas
  ubicacion_fisica?: string | null  // text, NULLABLE
  fecha_inicio?: string | null      // date, NULLABLE (formato: YYYY-MM-DD)
  
  // Carpeta (organización)
  carpeta_id?: string | null        // uuid, NULLABLE, FK → carpetas(id)
  
  // Timestamps
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
}
```

### Nota (Note)

```typescript
export interface Nota {
  id: string                        // uuid, NOT NULL, PK
  caso_id: string                   // uuid, NOT NULL, FK → casos(id)
  titulo: string                    // text, NOT NULL
  contenido?: string | null         // text, NULLABLE (HTML format)
  categoria?: CategoriaNota | null  // text, NULLABLE
  prioridad?: PrioridadNota | null  // text, NULLABLE
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
  created_at?: string | null        // timestamptz, DEFAULT now()
  updated_at?: string | null        // timestamptz, DEFAULT now()
}
```

### Evento (Calendar Event)

```typescript
export interface Evento {
  id: string                        // uuid, NOT NULL, PK
  caso_id?: string | null           // uuid, NULLABLE, FK → casos(id)
  titulo: string                    // text, NOT NULL
  tipo: TipoEvento                  // text, NOT NULL
  fecha: string                     // date, NOT NULL (YYYY-MM-DD)
  hora?: string | null              // time, NULLABLE (HH:MM:SS)
  notas?: string | null             // text, NULLABLE
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
  created_at?: string | null        // timestamptz, DEFAULT now()
}
```

### Pago (Payment)

```typescript
export interface Pago {
  id: string                        // uuid, NOT NULL, PK
  caso_id: string                   // uuid, NOT NULL, FK → casos(id)
  monto: number                     // numeric, NOT NULL
  metodo: MetodoPago                // text, NOT NULL
  fecha_pago: string                // date, NOT NULL (YYYY-MM-DD)
  comprobante?: string | null       // text, NULLABLE (URL o número)
  notas?: string | null             // text, NULLABLE
  created_by?: string | null        // uuid, NULLABLE, FK → profiles(id)
  created_at?: string | null        // timestamptz, DEFAULT now()
}
```

### Profile (User)

```typescript
export interface Profile {
  id: string                        // uuid, NOT NULL, PK (matches auth.users)
  email: string                     // text, NOT NULL
  full_name?: string | null         // text, NULLABLE
  role?: string | null              // text, NULLABLE
  created_at?: string | null        // timestamptz, DEFAULT now()
}
```

---

## DTOs (Data Transfer Objects)

### CreateCasoDTO
```typescript
export interface CreateCasoDTO {
  // Required fields
  cliente: string
  tipo: TipoCaso
  
  // Optional fields
  patrocinado?: string
  descripcion?: string
  expediente?: string
  etapa?: string
  forma_pago?: FormaPago
  monto_total?: number
  fecha_inicio?: string  // YYYY-MM-DD
  ubicacion_fisica?: string
  carpeta_id?: string
  abogado_asignado_id?: string
}
```

### UpdateCasoDTO
```typescript
export interface UpdateCasoDTO {
  cliente?: string
  patrocinado?: string
  tipo?: TipoCaso
  descripcion?: string
  expediente?: string
  etapa?: string
  estado?: EstadoCaso
  estado_caso?: EstadoProcesal
  forma_pago?: FormaPago
  monto_total?: number
  monto_cobrado?: number
  fecha_inicio?: string
  ubicacion_fisica?: string
  carpeta_id?: string
  abogado_asignado_id?: string
}
```

### CreateNotaDTO
```typescript
export interface CreateNotaDTO {
  caso_id: string
  titulo: string
  contenido?: string
  categoria?: CategoriaNota
  prioridad?: PrioridadNota
}
```

### CreateEventoDTO
```typescript
export interface CreateEventoDTO {
  titulo: string
  tipo: TipoEvento
  fecha: string  // YYYY-MM-DD
  hora?: string  // HH:MM:SS
  caso_id?: string
  notas?: string
}
```

---

## API Response Types

### CasoResponse
```typescript
export interface CasoResponse {
  data: Caso
  meta?: {
    message?: string
  }
}
```

### CasoListResponse
```typescript
export interface CasoListResponse {
  data: Caso[]
  meta: {
    page: number
    per_page: number
    total: number
  }
}
```

### APIError
```typescript
export interface APIError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
```

---

## Validation Schemas (Zod)

**Status**: ⏸️ Planned for Fase 2

```typescript
import { z } from 'zod'

export const CasoSchema = z.object({
  cliente: z.string().min(1, 'Cliente es requerido'),
  tipo: z.enum(['Penal', 'Civil', 'Laboral', 'Administrativo']),
  patrocinado: z.string().optional(),
  descripcion: z.string().optional(),
  expediente: z.string().optional(),
  etapa: z.string().optional(),
  forma_pago: z.enum(['Por hora', 'Por etapas', 'Monto fijo', 'Cuota litis']).optional(),
  monto_total: z.number().nonnegative().optional(),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ubicacion_fisica: z.string().optional()
})

export type CreateCasoInput = z.infer<typeof CasoSchema>
```

---

## Usage Examples

### Frontend (Importing Types)

```tsx
import type { Caso, TipoCaso, CreateCasoDTO } from '@/lib/types/database'

function CasoForm() {
  const [formData, setFormData] = useState<CreateCasoDTO>({
    cliente: '',
    tipo: 'Penal'
  })
  
  const caso: Caso | null = data?.caso || null
  
  // ...
}
```

### Backend (Defining API Response)

```tsx
import type { CasoResponse } from '@/lib/types/database'

export async function createCaso(data: CreateCasoDTO): Promise<CasoResponse> {
  // ... implementation
  return { data: caso }
}
```

---

## Common Mistakes

### ❌ Wrong
```typescript
// Case-sensitive enums!
tipo: 'penal'  // ❌ lowercase
estado: 'activo'  // ❌ lowercase
forma_pago: 'por hora'  // ❌ lowercase

// NULL handling
descripcion: undefined  // ❌ NOT NULL field

// Date format
fecha_inicio: '15/01/2026'  // ❌ Wrong format
```

### ✅ Correct
```typescript
// Use exact enum values
tipo: 'Penal'  // ✅ PascalCase
estado: 'Activo'  // ✅ PascalCase
forma_pago: 'Por hora'  // ✅ Title Case

// NULL handling
descripcion: ''  // ✅ NOT NULL field uses empty string
patrocinado: null  // ✅ NULLABLE field can be null

// Date format
fecha_inicio: '2026-01-15'  // ✅ YYYY-MM-DD
```

---

## Type Sync Process

### When Backend Changes Database

1. Update Supabase schema
2. Update `/despacho-web/lib/types/database.ts`
3. Update this file (`contracts/types.md`)
4. Update `backend.context.md` with changes
5. Notify Frontend in Slack #backend-updates

### When Frontend Needs New Field

1. Create request in `contracts/change-requests.md`
2. Backend evaluates
3. If approved: Backend follows "When Backend Changes Database"
4. Frontend imports updated types

---

## Change Log

### 2026-01-26
- ✅ Created initial type definitions
- ✅ Added all enums (TipoCaso, EstadoCaso, etc.)
- ✅ Added main entities (Caso, Nota, Evento, Pago)
- ✅ Added DTOs (Create/Update)
- ✅ Added API response types

### 2026-01-20
- ✅ Added `patrocinado` field to Caso interface

---

**Mantenido por**: Backend Engineering Team  
**Sincronizado con**: `/despacho-web/lib/types/database.ts`  
**Revisión**: Después de cada database schema change
