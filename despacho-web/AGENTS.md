# AGENTS.md - Legal Case Management System

**Stack**: Next.js 16.1.2 + React 19 + TypeScript (strict) + Supabase + Tailwind CSS

---

## 🚀 Commands

```bash
npm run dev              # → http://localhost:3000 (Turbopack)
npm run lint             # ESLint + TypeScript - 0 errors required
npm run build            # Production build - MUST succeed
npm run start            # Production server
npm run test:e2e         # All E2E tests
npm run test:e2e:ui      # Interactive UI runner
npm run test:e2e:headed  # Visible browser
npx playwright test e2e/notas.spec.ts --headed    # Single file
npx playwright test --grep "test name"              # By name
```

**CRITICAL**: Always run `npm run lint` and `npm run build` before declaring work complete.

---

## 📦 Imports (Strict Order)

```tsx
// 1. 'use client' (if needed)
// 2. React hooks (useState, useEffect)
// 3. Next.js (useRouter, Link, redirect)
// 4. Third-party (supabase, date-fns, lucide-react)
// 5. Local components (@/app/components/...)
// 6. Types (@/lib/types/database)
```

---

## 🎯 Code Style

**General**: No `any` types, use `@/` imports, early returns, descriptive naming.

### Server Component (Default)
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CasosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: casos, error } = await supabase
    .from('casos').select('id, cliente').order('created_at', { ascending: false })
  if (error) return <div className="text-red-600">Error: {error.message}</div>
  return <div>{casos?.map(c => <div key={c.id}>{c.cliente}</div>)}</div>
}
```

### Client Component (Only When Necessary)
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CasoForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.from('casos').insert([data])
      if (error) throw error
      router.push('/dashboard/casos')
      router.refresh()
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

### State & Error Patterns
```tsx
// ✅ Single state object
const [formData, setFormData] = useState({ cliente: '', tipo: 'Penal' as const })
const handleChange = (field: string, value: any) => setFormData(p => ({ ...p, [field]: value }))

// ✅ Error handling (REQUIRED)
try {
  const { error } = await supabase.from('casos').insert([data])
  if (error) throw error
  router.push('/dashboard/casos')
} catch (err) { console.error('Error:', err); setError('Error al crear caso') }
```

---

## 🗄️ Database Schema

**CRITICAL**: Verify column names against `DATABASE-SCHEMA.md` before INSERT/UPDATE.

### Common Mistakes
- ❌ `abogada_asignada_id` → ✅ `abogado_asignado_id`
- ❌ `'por hora'` → ✅ `'Por hora'` (case-sensitive!)
- ❌ `descripcion: undefined` → ✅ `descripcion: data || ''`

### Enum Types (EXACT values)
```typescript
type FormaPago = 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'
type EstadoCaso = 'En proceso' | 'Ganado' | 'Perdido'
type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
```

---

## 📋 Pre-Commit Checklist

- [ ] `npm run lint` passes (0 errors, 0 warnings)
- [ ] `npm run build` compiles
- [ ] Verify column names with `DATABASE-SCHEMA.md`
- [ ] All async operations have try/catch
- [ ] Loading states implemented
- [ ] Enum values match CHECK constraints
- [ ] NOT NULL strings use `|| ''`
- [ ] `'use client'` only when necessary
- [ ] Imports follow strict order
- [ ] `router.refresh()` after mutations

---

## 🐛 Common Errors

**Database**: "column does not exist" → Check `DATABASE-SCHEMA.md`, "violates check constraint" → Exact enum values, "violates not-null" → Use `data || ''`

**Types**: "Cannot read properties of undefined" → Check Supabase `error` + use `data?.field`

**UI**: After mutations → Call `router.refresh()`

---

**Version**: 4.0 (Concise) • Updated: Jan 2026
