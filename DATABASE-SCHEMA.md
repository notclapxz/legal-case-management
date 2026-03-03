# DATABASE SCHEMA - Despacho Legal

**CRITICAL**: Always verify column names against this schema BEFORE any INSERT/UPDATE operation.

---

## 📋 Verification Query

Run this in Supabase SQL Editor to verify any table schema:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'casos' AND table_schema = 'public'
ORDER BY ordinal_position;
```

---

## 📊 Tables Overview

### `casos` - Legal Cases

```typescript
interface Caso {
  // IDs and references
  id: string                    // uuid, NOT NULL, DEFAULT uuid_generate_v4()
  codigo_estimado: string       // text, NOT NULL, UNIQUE
  cliente: string               // text, NOT NULL
  abogado_asignado_id?: string  // ⚠️ uuid, NULLABLE (NOT "abogada_asignada_id")
  created_by?: string           // uuid, NULLABLE
  
  // Basic information
  descripcion?: string          // text, NULLABLE (NO default '')
  expediente?: string           // text, NULLABLE
  tipo: string                  // text, NOT NULL (e.g., 'Penal', 'Civil')
  etapa?: string                // text, NULLABLE (e.g., "Preliminar", "Juicio oral")
  
  // Status (TWO status columns!)
  estado: string                // text, NOT NULL, DEFAULT 'Activo' (Activo/Inactivo)
  estado_caso?: string          // varchar(50), NULLABLE, DEFAULT 'En proceso'
  
  // Financial information
  forma_pago?: string           // text, NULLABLE
  monto_total?: number          // numeric, NULLABLE, DEFAULT 0
  monto_cobrado?: number        // numeric, NULLABLE, DEFAULT 0
  monto_pendiente?: number      // numeric, NULLABLE (computed?)
  
  // Location and dates
  ubicacion_fisica?: string     // text, NULLABLE
  fecha_inicio?: string         // date, NULLABLE
  
  // Timestamps
  created_at?: string           // timestamptz, DEFAULT now()
  updated_at?: string           // timestamptz, DEFAULT now()
}
```

### `eventos` - Hearings, Deadlines, Meetings

```typescript
interface Evento {
  id: string                    // uuid, NOT NULL, DEFAULT uuid_generate_v4()
  caso_id: string               // uuid, NOT NULL, FK -> casos(id)
  tipo: string                  // text, NOT NULL
  titulo: string                // text, NOT NULL
  descripcion?: string          // text, NULLABLE
  fecha_evento: string          // timestamptz, NOT NULL
  ubicacion?: string            // text, NULLABLE
  completado?: boolean          // boolean, DEFAULT false
  alerta_7_dias?: boolean       // boolean, DEFAULT true
  alerta_3_dias?: boolean       // boolean, DEFAULT true
  alerta_1_dia?: boolean        // boolean, DEFAULT true
  alerta_dia_evento?: boolean   // boolean, DEFAULT true
  created_at?: string           // timestamptz, DEFAULT now()
  updated_at?: string           // timestamptz, DEFAULT now()
  created_by?: string           // uuid, NULLABLE
}
```

### `pagos` - Payment History

```typescript
interface Pago {
  id: string                    // uuid, NOT NULL, DEFAULT uuid_generate_v4()
  caso_id: string               // uuid, NOT NULL, FK -> casos(id)
  monto: number                 // numeric, NOT NULL
  fecha_pago: string            // date, NOT NULL
  concepto?: string             // text, NULLABLE
  metodo_pago?: string          // text, NULLABLE
  notas?: string                // text, NULLABLE
  created_at?: string           // timestamptz, DEFAULT now()
  created_by?: string           // uuid, NULLABLE
}
```

### `notas` - Case Notes (no title!)

```typescript
interface Nota {
  id: string                    // uuid, NOT NULL, DEFAULT uuid_generate_v4()
  caso_id: string               // uuid, NOT NULL, FK -> casos(id)
  contenido: string             // text, NOT NULL
  created_at?: string           // timestamptz, DEFAULT now()
  created_by?: string           // uuid, NULLABLE
  categoria?: string            // varchar(50), DEFAULT 'General'
  prioridad?: string            // varchar(20), DEFAULT 'Media'
  fecha_recordatorio?: string   // timestamptz, NULLABLE
  completado?: boolean          // boolean, DEFAULT false
  updated_at?: string           // timestamptz, DEFAULT now()
}
```

### `ubicaciones_fisicas` - Physical Storage

```typescript
interface UbicacionFisica {
  id: string                    // uuid, NOT NULL, DEFAULT uuid_generate_v4()
  codigo_estimado?: string      // text, NULLABLE
  ubicacion: string             // text, NOT NULL
  fila?: number                 // integer, NULLABLE
  columna?: string              // text, NULLABLE
  seccion?: string              // text, NULLABLE
  posicion?: number             // integer, NULLABLE
  cliente?: string              // text, NULLABLE
  descripcion?: string          // text, NULLABLE
  expediente?: string           // text, NULLABLE
  tomo?: string                 // text, NULLABLE
  created_at?: string           // timestamptz, DEFAULT now()
  updated_at?: string           // timestamptz, DEFAULT now()
}
```

### `profiles` - Users (Supabase Auth)

```typescript
interface Profile {
  id: string                    // uuid, NOT NULL (FK -> auth.users)
  username: string              // text, NOT NULL
  nombre_completo?: string      // text, NULLABLE
  rol: string                   // text, NOT NULL
  activo?: boolean              // boolean, DEFAULT true
  created_at?: string           // timestamptz, DEFAULT now()
  updated_at?: string           // timestamptz, DEFAULT now()
}
```

---

## ⚠️ CHECK Constraints (MUST RESPECT)

### Enum Values

```typescript
// forma_pago - EXACT values only
type FormaPago = 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'

// estado_caso - EXACT values only
type EstadoCaso = 'En proceso' | 'Ganado' | 'Perdido'

// tipo - EXACT values only
type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
```

### Numeric Validations

```sql
monto_total >= 0
monto_cobrado >= 0
```

---

## 🔍 Common Schema Errors

### 1. Wrong column name
```typescript
// ❌ WRONG
abogada_asignada_id  // This column does NOT exist

// ✅ CORRECT
abogado_asignado_id  // This is the actual column name
```

### 2. Wrong enum value
```typescript
// ❌ WRONG
forma_pago: 'por hora'        // lowercase
forma_pago: 'Por Hora'        // wrong capitalization

// ✅ CORRECT
forma_pago: 'Por hora'        // exact match
```

### 3. NULL in NOT NULL column
```typescript
// ❌ WRONG
cliente: undefined  // Will cause "violates not-null constraint"

// ✅ CORRECT
cliente: formData.cliente?.trim() || ''  // Ensure string
```

---

## 📝 Reference Files

- **Full schema JSON**: `database-schema.json` (machine-readable format)
- **Main guide**: `AGENTS.md` (coding patterns and rules)

---

**Last updated**: Jan 2026  
**Source**: Supabase PostgreSQL (information_schema.columns)
