# Frontend Engineer Guide

**Proyecto**: Sistema de Gestión de Despacho Legal  
**Stack**: Next.js 16.1.2 + React 19 + TypeScript + Tailwind CSS  
**Tu workspace**: `/despacho-web` - Trabajá SOLO acá

---

## 🎯 Tu Rol

**Sos responsable de**:
- Implementar UI/UX según designs
- Consumir APIs definidas por Backend
- Escribir componentes React (Server y Client)
- Mantener código limpio y testeado

**NO sos responsable de**:
- Definir contratos de API (eso es Backend)
- Cambiar database schema
- Configurar deployment

---

## 📚 Antes de Empezar

### Leer PRIMERO (orden estricto):

1. **`/AGENTS.md`** (root) - Comandos y convenciones de código ← EMPEZÁ ACÁ
2. **`.agents/contracts/README.md`** - Cómo funcionan los contratos
3. **`.agents/contracts/api-spec.md`** - APIs disponibles
4. **`.agents/contracts/types.md`** - Types compartidos
5. **`.agents/architecture/overview.md`** - Arquitectura del sistema

### Setup Inicial

```bash
cd despacho-web
npm install
cp .env.example .env.local  # Configurar Supabase credentials
npm run dev  # Debe arrancar en http://localhost:3000
```

---

## 🏗️ Estructura Recomendada

```
despacho-web/app/
├── dashboard/
│   ├── casos/                    # Módulo de casos
│   │   ├── page.tsx              # Lista (Server Component)
│   │   ├── nuevo/page.tsx        # Crear (Client Component)
│   │   ├── [id]/                 # Detalle (Dynamic route)
│   │   │   ├── page.tsx          # Vista general
│   │   │   ├── editar/page.tsx   # Editar
│   │   │   └── notas/page.tsx    # Notas del caso
│   │   └── components/           # Componentes de casos
│   │       ├── CasoForm.tsx      # Form reutilizable
│   │       ├── CasoCard.tsx      # Card para lista
│   │       └── TablaCasos.tsx    # Tabla con sorting
│   ├── agenda/                   # Módulo de agenda
│   ├── reportes/                 # Módulo de reportes
│   └── components/               # Componentes compartidos del dashboard
├── components/                   # Componentes globales
│   ├── ui/                       # Primitivos reutilizables
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── modal.tsx
│   └── casos/                    # Componentes de negocio
│       ├── MetodoPagoForm.tsx
│       └── CuotaLitisForm.tsx
└── login/                        # Auth pages
```

### Convenciones de Naming

- **Files**: PascalCase.tsx → `CasoForm.tsx`, `ModalConfirmacion.tsx`
- **Folders**: kebab-case → `casos`, `agenda`, `metodo-pago`
- **Components**: PascalCase → `function CasoForm() {}`
- **Functions**: camelCase → `handleSubmit`, `fetchCasos`
- **Props**: ComponentNameProps → `interface CasoFormProps {}`

---

## 🧩 Patrones de Componentes

### Server Component (Default - Usá SIEMPRE que puedas)

**Cuándo usar**:
- Fetching de datos
- Acceso a database
- SEO es importante
- No necesitás interactividad

```tsx
// app/dashboard/casos/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Caso } from '@/lib/types/database'

export default async function CasosPage() {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch data
  const { data: casos, error } = await supabase
    .from('casos')
    .select('id, cliente, tipo, estado')
    .order('created_at', { ascending: false })

  // 3. Early return for errors
  if (error) {
    return <div className="text-red-600">Error: {error.message}</div>
  }

  // 4. Render
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Casos</h1>
      <CasosList casos={casos || []} />
    </div>
  )
}
```

### Client Component (Solo cuando necesario)

**Cuándo usar**:
- Forms con `useState`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- Hooks de React (`useEffect`, `useCallback`)

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TipoCaso } from '@/lib/types/database'

export default function CasoForm() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Single state object (NO multiple useState)
  const [formData, setFormData] = useState({
    cliente: '',
    tipo: 'Penal' as TipoCaso,
    descripcion: ''
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('casos')
        .insert([formData])
      
      if (insertError) throw insertError
      
      router.push('/dashboard/casos')
      router.refresh()  // ← IMPORTANTE: Refresh Server Components
    } catch (err) {
      console.error('Error creating caso:', err)
      setError('Error al crear el caso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">
          {error}
        </div>
      )}
      
      <input
        type="text"
        value={formData.cliente}
        onChange={(e) => handleChange('cliente', e.target.value)}
        placeholder="Nombre del cliente"
        className="w-full px-3 py-2 border rounded"
      />
      
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
```

---

## 📋 Import Order (ESTRICTO)

```tsx
// 1. 'use client' directive (si es necesario)
'use client'

// 2. React hooks
import { useState, useEffect, useCallback } from 'react'

// 3. Next.js imports
import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// 4. Third-party libraries (alphabetical)
import { format } from 'date-fns'
import { ChevronRight } from 'lucide-react'

// 5. Supabase client (context-specific)
import { createClient } from '@/lib/supabase/client'   // Client Components
import { createClient } from '@/lib/supabase/server'  // Server Components

// 6. Local components (alphabetical)
import MetodoPagoForm from '@/app/components/casos/MetodoPagoForm'
import ModalConfirmacion from '@/app/components/ModalConfirmacion'

// 7. Utils and helpers
import { validarMontoCobrado } from '@/lib/validaciones/financieras'

// 8. Types (ALWAYS last, use 'import type')
import type { Caso, TipoCaso, FormaPago } from '@/lib/types/database'
```

---

## 🗄️ Trabajar con Database Types

### Source of Truth

**`despacho-web/lib/types/database.ts`** es la ÚNICA fuente de verdad.

**SIEMPRE**:
1. Importar types desde ahí
2. Verificar column names antes de usar
3. Respetar nullable/non-nullable fields

```typescript
import type { Caso, TipoCaso, EstadoCaso } from '@/lib/types/database'

// ✅ BIEN
const caso: Caso = {
  cliente: 'Juan Pérez',
  tipo: 'Penal',  // Exact enum value
  descripcion: data.descripcion || '',  // NOT NULL field
  estado: 'Activo'
}

// ❌ MAL
const caso = {
  cliente: 'Juan Pérez',
  tipo: 'penal',  // ❌ Case-sensitive!
  descripcion: undefined,  // ❌ NOT NULL field
  estado: 'activo'  // ❌ Case-sensitive!
}
```

### Enum Values (Copy-Paste)

```typescript
type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
type EstadoCaso = 'Activo' | 'Inactivo'
type EstadoProcesal = 'En proceso' | 'Ganado' | 'Perdido'
type FormaPago = 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'
type CategoriaNota = 'General' | 'Urgente' | 'Legal' | 'Administrativa' | 'Financiera'
```

### Common Mistakes

```typescript
// ❌ WRONG → ✅ CORRECT
abogada_asignada_id → abogado_asignado_id
'por hora' → 'Por hora'
descripcion: undefined → descripcion: ''
patrocinado: '' → patrocinado: null  // NULLABLE field
```

---

## 🎨 Styling con Tailwind

### Utility Classes

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-lg font-semibold text-gray-900">
    Título
  </h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
    Acción
  </button>
</div>
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
</div>
```

### Conditional Classes (con clsx)

```tsx
import clsx from 'clsx'

<button
  className={clsx(
    'px-4 py-2 rounded font-medium',
    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700',
    error && 'ring-2 ring-red-500'
  )}
>
  Guardar
</button>
```

---

## 🔗 Consumir APIs desde Contratos

### 1. Leer el Contrato

Ver `.agents/contracts/api-spec.md`:

```markdown
### POST /api/v1/casos
Request: { cliente: string, tipo: TipoCaso }
Response: { data: Caso }
```

### 2. Importar Types

```tsx
import type { Caso, TipoCaso } from '@/lib/types/database'
```

### 3. Implementar

```tsx
const { data, error } = await supabase
  .from('casos')
  .insert([{ cliente: 'Juan', tipo: 'Penal' }])
  .select()
  .single()

if (error) {
  console.error('Error:', error)
  return
}

console.log('Caso creado:', data)
```

---

## ✅ Pre-Commit Checklist

Antes de hacer commit:

- [ ] `npm run lint` pasa (0 errors, 0 warnings)
- [ ] `npm run build` compila exitosamente
- [ ] Column names verificados en `lib/types/database.ts`
- [ ] Enum values respetan case-sensitive
- [ ] Imports en orden correcto
- [ ] No hay `any` types
- [ ] No hay `console.log` residual
- [ ] `router.refresh()` después de mutations
- [ ] Loading states implementados
- [ ] Error handling con try/catch
- [ ] NOT NULL fields usan `|| ''`
- [ ] NULLABLE fields usan `|| null`

---

## 📝 Actualizar Context

Después de cada tarea, actualizar `.agents/contexts/frontend.context.md`:

```markdown
## Completed
- [x] Implementé CasoForm.tsx
- [x] Agregué validación de campos
- [x] Conecté con API POST /casos

## In Progress
- [ ] Agregar edición inline en TablaCasos (50%)

## Blockers
- Backend aún no implementó GET /casos/:id

## Tech Decisions
- Usé TipTap para rich text editor
- State management con useState (suficiente para MVP)
```

---

## 🆘 Troubleshooting

### Error: "Column does not exist"

**Causa**: Column name incorrecto  
**Solución**: Verificar en `lib/types/database.ts`

### Error: "violates check constraint"

**Causa**: Enum value incorrecto (case-sensitive!)  
**Solución**: Usar exact values de `database.ts`

### Error: "Cannot read properties of undefined"

**Causa**: No validaste `error` de Supabase  
**Solución**: Siempre check `if (error) throw error`

### UI no se actualiza después de mutation

**Causa**: Falta `router.refresh()`  
**Solución**: Agregar después de `supabase.from().insert()`

---

## 📚 Recursos

- **Next.js Docs**: https://nextjs.org/docs
- **React 19 Docs**: https://react.dev
- **Supabase Client**: https://supabase.com/docs/reference/javascript
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Mantenido por**: Frontend Engineering Team  
**Última actualización**: 26 Enero 2026  
**¿Dudas?**: Slack #frontend-support
