# Case Management System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [File Structure](#file-structure)
4. [Core Components](#core-components)
5. [Pages and Routes](#pages-and-routes)
6. [API Integration](#api-integration)
7. [Data Flow](#data-flow)
8. [Form Validation](#form-validation)
9. [Payment Methods](#payment-methods)
10. [File Location System](#file-location-system)
11. [Known Issues & TODOs](#known-issues--todos)
12. [Development Guidelines](#development-guidelines)

---

## Overview

The Case Management System is a comprehensive web application built with Next.js 14, TypeScript, and Supabase for managing legal cases in a law firm. The system handles case creation, editing, payment tracking, event management, and physical file location tracking.

### Key Features
- **Case CRUD Operations**: Create, read, update, and delete legal cases
- **Financial Management**: Track payments, calculate outstanding balances, and manage different payment methods
- **Event Management**: Schedule and track court dates, deadlines, and client meetings
- **Physical File Tracking**: Organize and locate physical case files in storage
- **Notes System**: Add case notes and reminders
- **Advanced Filtering**: Search and filter cases by multiple criteria

---

## Database Schema

### Core Tables

#### `casos` (Cases)
```sql
CREATE TABLE casos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estimado VARCHAR(100) UNIQUE,           -- Case code (e.g., "MORENO-01")
    cliente VARCHAR(255) NOT NULL,                  -- Client name
    descripcion_caso TEXT,                          -- Case description
    numero_expediente VARCHAR(100),                 -- Case file number
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Penal', 'Civil', 'Laboral', 'Administrativo')),
    etapa VARCHAR(50) NOT NULL CHECK (etapa IN ('Preliminar', 'Investigacion preparatoria', 'Etapa intermedia', 'Juicio oral', 'Apelacion', 'Casacion')),
    abogada_asignada_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    forma_pago VARCHAR(50) NOT NULL CHECK (forma_pago IN ('Por hora', 'Por etapas', 'Monto fijo', 'Por honorarios')),
    monto_total DECIMAL(10,2) NOT NULL CHECK (monto_total > 0),
    monto_cobrado DECIMAL(10,2) DEFAULT 0 CHECK (monto_cobrado >= 0),
    fecha_inicio DATE NOT NULL,
    ubicacion_fisica VARCHAR(20),                   -- Physical location (e.g., "1-A")
    expediente VARCHAR(10),                        -- Volume/tome
    tomo VARCHAR(10),                              -- Alternative volume field
    estado VARCHAR(50) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Pausado', 'Cerrado')),
    notas TEXT,                                    -- Case notes
    detalles_pago JSONB,                            -- Payment method details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `eventos` (Events)
```sql
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Audiencia', 'Plazo', 'Reunion con cliente')),
    descripcion TEXT NOT NULL,
    completado BOOLEAN DEFAULT false,
    recordatorio_7_dias BOOLEAN DEFAULT false,
    recordatorio_3_dias BOOLEAN DEFAULT false,
    recordatorio_1_dia BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `pagos` (Payments)
```sql
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    comprobante_sunat VARCHAR(100),
    metodo_pago VARCHAR(50),                        -- Payment method (cash, transfer, etc.)
    notas TEXT,                                     -- Payment notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `notas` (Notes)
```sql
CREATE TABLE notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    creado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `profiles` (Users)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo TEXT,
    rol VARCHAR(50) NOT NULL DEFAULT 'user',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## File Structure

```
app/
├── dashboard/
│   ├── casos/                          # Case management section
│   │   ├── page.tsx                    # Main cases listing page
│   │   ├── nuevo/
│   │   │   └── page.tsx                # New case creation form
│   │   ├── [id]/                       # Dynamic case detail pages
│   │   │   ├── page.tsx                # Case detail main page
│   │   │   ├── editar/
│   │   │   │   └── page.tsx            # Edit case form
│   │   │   ├── notas/
│   │   │   │   ├── page.tsx            # Notes management page
│   │   │   │   └── components/
│   │   │   │       ├── NotasEditor.tsx
│   │   │   │       ├── NotasList.tsx
│   │   │   │       ├── NotasSidebar.tsx
│   │   │   │       └── TakeNoteLayout.tsx
│   │   │   └── components/             # Case detail components
│   │   │       ├── AccionesDelCaso.tsx
│   │   │       ├── ContenedorTabs.tsx
│   │   │       ├── FormularioEvento.tsx
│   │   │       ├── FormularioNota.tsx
│   │   │       ├── FormularioNotaRobusto.tsx
│   │   │       ├── FormularioPago.tsx
│   │   │       ├── SeccionesInteractivas.tsx
│   │   │       ├── SeccionEventos.tsx
│   │   │       ├── SeccionNotas.tsx
│   │   │       ├── SeccionPagos.tsx
│   │   │       ├── TabsCaso.tsx
│   │   │       ├── VistaGeneral.tsx
│   │   │       ├── VistaNotasAppleStyle.tsx
│   │   │       └── VistaNotasRobusto.tsx
│   │   └── components/                  # Cases list components
│   │       ├── MapaArchivo.tsx         # File location help modal
│   │       └── TablaCasos.tsx          # Cases table with filtering
│   └── components/
│       └── casos/
│           └── MetodoPagoForm.tsx      # Payment method configuration
├── components/
│   └── casos/
│       └── MetodoPagoForm.tsx          # Relocated payment form
├── api/
│   ├── auth/
│   │   └── signout/
│   │       └── route.ts                 # Authentication API
│   └── notas/
│       └── [id]/
│           └── route.ts                 # Notes CRUD API
└── lib/
    └── supabase/
        ├── client.ts                    # Supabase client for client-side
        └── server.ts                    # Supabase client for server-side
```

---

## Core Components

### 1. TablaCasos.tsx
**Purpose**: Main cases table with advanced filtering and search capabilities.

**Props**:
```typescript
interface TablaCasosProps {
  casos: any[]     // Array of case objects from database
}
```

**Features**:
- Search by case code, client name, description, or file number
- Filter by state (Active, Paused, Closed)
- Filter by case type (Penal, Civil, Laboral, etc.)
- Filter by physical file location (with/without location)
- Real-time filtering with instant results
- Summary statistics for filtered results
- Responsive design for mobile and desktop

**State Management**:
```typescript
const [busqueda, setBusqueda] = useState('')
const [filtroEstado, setFiltroEstado] = useState('Todos')
const [filtroTipo, setFiltroTipo] = useState('Todos')
const [filtroUbicacion, setFiltroUbicacion] = useState('Todos')
```

### 2. MetodoPagoForm.tsx
**Purpose**: Dynamic form component that renders different payment method configurations based on the selected payment type.

**Props**:
```typescript
interface MetodoPagoFormProps {
  forma_pago: string        // Current payment method
  monto_total: number       // Total case amount
  monto_cobrado: number    // Amount already paid
  estado_caso: string       // Case state (Activo, Ganado, etc.)
  detalles_pago: any        // Payment method specific details
  onChange: (forma_pago: string, detalles_pago: any) => void
}
```

**Payment Methods Supported**:

#### Monto Fijo (Fixed Amount)
- Number of installments
- Payment period (Weekly, Monthly, etc.)
- Progress tracking
- Success fees for won cases

#### Por Etapas (By Stages)
- Dynamic stage creation
- Individual stage amounts
- Stage-based tracking
- Total validation against case amount

#### Por Horas (By Hours)
- Hourly rate configuration
- Hours worked tracking
- Automatic total calculation
- Time logging capabilities

#### Cuota Litis (Contingency Fee)
- Percentage configuration
- Victory conditions
- Only active for "Ganado" (Won) cases
- Conditional fee structure

### 3. VistaGeneral.tsx
**Purpose**: Main case detail view showing comprehensive case information.

**Props**:
```typescript
interface VistaGeneralProps {
  caso: any              // Case object
  eventos: any[]         // Associated events
  pagos: any[]           # Payment history
  notas: any[]           # Case notes
  ubicacion: any         # Physical file location
}
```

**Sections**:
- Case Information (basic details)
- Payment Information (totals, progress bar)
- Payment History (detailed payment list)
- Events/Audiences (upcoming and past events)
- Recent Notes (preview of latest 3 notes)

### 4. SeccionPagos.tsx & FormularioPago.tsx
**Purpose**: Payment management components for tracking and adding payments.

**SeccionPagos.tsx Props**:
```typescript
interface SeccionPagosProps {
  casoId: string         # Case ID for payment association
  pagos: any[]          # Existing payments array
}
```

**FormularioPago.tsx Features**:
- Modal-based payment form
- Multiple payment methods (cash, transfer, Yape/Plin, etc.)
- Date selection for payment date
- Optional notes for payment details
- Real-time form validation

### 5. MapaArchivo.tsx
**Purpose**: Help modal explaining the physical file organization system.

**Features**:
- Visual representation of storage layout
- Explanation of coordinate system (Row-Column-Section-Depth)
- Interactive examples
- Storage distribution by rows
- Front/Back depth explanation

---

## Pages and Routes

### 1. /dashboard/casos/page.tsx (Server Component)
**Purpose**: Main cases listing page with authentication and data fetching.

**Features**:
- Server-side authentication check
- Fetches all cases with related data
- Responsive layout with header and main content
- Integration with TablaCasos component
- Navigation to new case creation

**Data Fetching**:
```typescript
const { data: casos, error } = await supabase
  .from('casos')
  .select('*')
  .order('created_at', { ascending: false })
```

### 2. /dashboard/casos/nuevo/page.tsx (Client Component)
**Purpose**: Comprehensive new case creation form.

**Features**:
- Automatic case code generation
- Advanced form validation
- Payment method integration
- Real-time error feedback
- Success state with redirect

**Form State**:
```typescript
const [caso, setCaso] = useState({
  codigo_estimado: '',
  cliente: '',
  descripcion: '',
  tipo: 'Penal',
  etapa: 'Preliminar',
  // ... other fields
})

const [detalles_pago, setDetallesPago] = useState({
  cuotas: 1,
  periodo: 'Mensual',
  honorario_exito: 0,
  numero_etapas: 1,
  etapas: [{ numero: 1, monto: 0 }],
  // ... other payment details
})
```

**Validation Rules**:
- Client name is required
- Start date is required
- Total amount must be > 0
- Paid amount must be >= 0
- Payment method specific validations
- Total stages must equal case amount (for "Por etapas")

### 3. /dashboard/casos/[id]/page.tsx (Server Component)
**Purpose**: Dynamic case detail page fetching comprehensive case data.

**Data Fetching**:
```typescript
// Main case data
const { data: caso, error: casoError } = await supabase
  .from('casos')
  .select('*')
  .eq('id', id)
  .single()

// Related data
const { data: eventos } = await supabase
  .from('eventos')
  .select('*')
  .eq('caso_id', id)
  .order('fecha_evento', { ascending: false })

const { data: pagos } = await supabase
  .from('pagos')
  .select('*')
  .eq('caso_id', id)
  .order('fecha_pago', { ascending: false })

const { data: notas } = await supabase
  .from('notas')
  .select('*')
  .eq('caso_id', id)
  .order('created_at', { ascending: false })
```

---

## API Integration

### Database Connection
The system uses Supabase as the database backend with two client configurations:

#### Client-side (lib/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Server-side (lib/supabase/server.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Cookie handling logic
        },
      },
    }
  )
}
```

### Authentication
System uses Supabase Auth with automatic session management:

```typescript
// Server-side auth check
const {
  data: { user },
} = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}
```

### CRUD Operations
The system implements direct database operations without custom API routes for most functionality:

#### Creating a Case
```typescript
const { error: insertError } = await supabase
  .from('casos')
  .insert([casoData])
```

#### Updating a Case
```typescript
const { error: updateError } = await supabase
  .from('casos')
  .update(updateData)
  .eq('id', caseId)
```

#### Querying with Relations
```typescript
const { data: caseWithRelations } = await supabase
  .from('casos')
  .select(`
    *,
    eventos (*),
    pagos (*),
    notas (*),
    profiles!casos_abogada_asignada_id_fkey (
      nombre_completo,
      rol
    )
  `)
  .eq('id', caseId)
  .single()
```

---

## Data Flow

### 1. Case Creation Flow
1. User fills new case form
2. Form validation (client-side)
3. Generate automatic case code
4. Prepare case data with payment details
5. Insert into database
6. Handle success/error states
7. Redirect or show feedback

### 2. Payment Registration Flow
1. User clicks "+ Registrar Pago"
2. Show payment modal
3. User fills payment form
4. Validate payment data
5. Insert payment record
6. Close modal and refresh data

### 3. Case Data Retrieval Flow
1. Page request with authentication check
2. Fetch main case data
3. Fetch related events, payments, notes
4. Render comprehensive case view

---

## Form Validation

### New Case Validation Rules

#### Basic Validations
- Client name is required
- Start date is required
- Total amount must be > 0
- Paid amount must be >= 0

#### Payment Method Specific Validations

##### Monto Fijo (Fixed Amount)
- Validate against maximum allowed (installments × amount)
- Ensure non-negative amounts
- Validate installment count

##### Por Etapas (By Stages)
- Total of stages must equal case amount
- Individual stage amounts must be positive
- Validate stage count

##### Por Horas (By Hours)
- Hourly rate must be > 0
- Hours worked must be >= 0
- Total cannot exceed calculated amount

##### Cuota Litis (Contingency Fee)
- Percentage must be > 0 and <= 100
- Victory conditions required
- Only active for won cases
- Initial amount should be minimal (expenses only)

---

## Payment Methods

### 1. Monto Fijo (Fixed Amount)
Fixed total amount divided into installments with configurable payment periods.

**Configuration**:
- Number of installments
- Payment period (Weekly, Bi-weekly, Monthly, Quarterly, Semi-annual, Annual)
- Success fee option for won cases

### 2. Por Etapas (By Stages)
Payment divided by case stages or phases with individual amounts.

**Configuration**:
- Number of stages
- Individual stage amounts
- Case type classification
- Success fee option

### 3. Por Horas (By Hours)
Payment based on hours worked at a configurable hourly rate.

**Configuration**:
- Hourly rate
- Hours worked
- Automatic total calculation

### 4. Cuota Litis (Contingency Fee)
Percentage of recovery amount, only active for won cases.

**Configuration**:
- Success percentage
- Victory conditions
- Case result dependency

---

## File Location System

### Coordinate System
Physical file organization uses a 4-part coordinate system:
`Fila-Columna-Sección-Profundidad`

**Example**: `1-C-FRONTAL`

### Storage Layout
- **Row 1**: Special layout (A-B | C | D-E)
- **Rows 2-5**: Standard layout (A-B | C-D | E-F)

### Implementation
The system stores location in `ubicacion_fisica` field and provides:
- Help modal explaining the system
- Visual representation of storage layout
- Searchable location field
- Filtering by physical/virtual cases

---

## Known Issues & TODOs

### Current Issues
1. **Missing API Routes**: No dedicated API routes for cases CRUD operations
2. **Inconsistent Database Schema**: Some field names don't match between schema and code
3. **Missing Error Handling**: Limited error handling for database operations
4. **No Bulk Operations**: No support for bulk case operations
5. **Limited Search**: Basic search without advanced indexing
6. **No File Uploads**: No support for document attachments
7. **Missing Permissions**: No role-based access control
8. **No Audit Trail**: Limited activity logging

### TODOs

#### High Priority
- Implement dedicated API routes for cases (/api/casos/)
- Add comprehensive error handling
- Implement role-based permissions
- Add case bulk operations
- Implement document upload functionality

#### Medium Priority
- Add advanced search with indexing
- Implement activity audit trail
- Add case templates
- Implement case duplication
- Add export functionality (CSV, PDF)

#### Low Priority
- Add case analytics
- Implement notifications system
- Add mobile app features
- Implement offline functionality
- Add multi-language support

---

## Development Guidelines

### Code Standards
- Use interfaces for all component props
- Implement proper type definitions
- Avoid `any` types when possible
- Always handle error states
- Use proper loading states

### Component Structure
```typescript
interface ComponentProps {
  // Define all props with proper types
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<Type>(initialValue)
  
  useEffect(() => {
    // Effect logic
  }, [dependencies])
  
  const handleEvent = () => {
    // Handler logic
  }
  
  return (
    <div className="proper-classes">
      {/* JSX content */}
    </div>
  )
}
```

### Database Operations
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const handleOperation = async () => {
  setLoading(true)
  setError(null)
  
  try {
    const { data, error } = await supabase
      .from('table')
      .insert([newData])
    
    if (error) throw error
    
    // Success handling
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
  } finally {
    setLoading(false)
  }
}
```

---

## Appendix

### Environment Variables
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Default Values
- **Case Types**: Penal, Civil, Laboral, Administrativo
- **Case Stages**: Preliminar, Investigación preparatoria, Etapa intermedia, Juicio oral, Apelación, Casación
- **Payment Methods**: Monto fijo, Por etapas, Por horas, Cuota litis
- **Case States**: Activo, Pausado, Cerrado

---

*Last Updated: January 18, 2026*
*Version: 1.0.0*
*Generated by: Claude AI Assistant*
