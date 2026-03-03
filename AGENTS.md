# AGENTS.md — Despacho Legal · Sistema de Gestión

**Stack**: Next.js 16.1.2 · React 19 · TypeScript (strict) · Supabase (`@supabase/ssr`) · Tailwind 3.4 · Playwright  
**Working directory for ALL commands**: `despacho-web/`  
**Path alias**: `@/` maps to `despacho-web/` root (see `tsconfig.json` `paths`)

---

## Commands

```bash
# Dev / build
npm run dev              # Turbopack dev server → http://localhost:3000
npm run build            # Production build — MUST succeed before commit
npm run start            # Production server
npm run lint             # ESLint (next/core-web-vitals + next/typescript) — 0 errors required

# E2E (Playwright · chromium only · workers: 1 · auto-starts dev server)
npm run test:e2e         # Full suite
npm run test:e2e:headed  # With visible browser
npm run test:e2e:ui      # Interactive UI runner

# Single-test commands
npx playwright test e2e/notas.spec.ts                   # Single file
npx playwright test e2e/notas.spec.ts --headed          # Single file, visible browser
npx playwright test --grep "Crear una nota nueva"       # By test name (regex)
npx playwright test --grep "(?!.*imagen)"               # Exclude pattern
```

---

## Project Layout

```
despacho-web/
├─ app/
│  ├─ components/          # Shared components (casos/, ui/)
│  ├─ dashboard/           # Route pages + co-located feature components
│  ├─ hooks/               # Custom hooks (useModal, useUserRole, useCasosTable …)
│  ├─ login/page.tsx
│  └─ layout.tsx
├─ lib/
│  ├─ supabase/            # client.ts (browser) · server.ts (SSR)
│  ├─ tipos/database.ts    # Single source of truth: all DB types + enums + helpers
│  ├─ casos/               # Pure logic: filters.ts, sorting.ts, pagination.ts, validation.ts
│  ├─ utils/               # errors.ts, helpers.ts
│  └─ validaciones/        # Business-rule validators (financieras.ts)
├─ e2e/                    # Playwright specs (agenda.spec.ts, notas.spec.ts)
└─ playwright.config.ts
```

---

## Import Order (strict — enforced by ESLint)

```tsx
'use client'                                              // 1. Directive — ONLY when needed

import { useState, useEffect, useCallback } from 'react'  // 2. React
import { useRouter } from 'next/navigation'               // 3. Next.js
import { redirect } from 'next/navigation'
import { format } from 'date-fns'                         // 4. Third-party (alphabetical)
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'     // 5. Supabase — client OR server, never both
import { useModal } from '@/app/hooks/useModal'           // 6. Custom hooks
import ModalCarpeta from '@/app/dashboard/casos/…'       // 7. Local components (@/ alias, alphabetical)
import { formatErrorForUI } from '@/lib/utils/errors'    // 8. Utilities
import type { Caso, CasoInsert } from '@/lib/types/database'  // 9. Types LAST — always use `type` keyword
```

---

## Component Patterns

### Server Component (default — prefer this)
```tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CasosPage() {
  const supabase = await createClient()                        // await — it's async
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')                                // early-return auth guard

  const [casosRes, carpetasRes] = await Promise.all([          // parallel queries
    supabase.from('casos').select('id, cliente, tipo').order('created_at', { ascending: false }),
    supabase.from('carpetas').select('id, nombre, color').order('orden')
  ])
  if (casosRes.error) return <div className="text-red-600">Error: {casosRes.error.message}</div>

  return <ClientComponent casosIniciales={casosRes.data ?? []} />
}
```

### Client Component (only for interactivity)
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'          // browser client — no await
import { formatErrorForUI } from '@/lib/utils/errors'
import type { CarpetaInsert } from '@/lib/types/database'

interface Props { onSuccess: () => void }

export default function ModalCarpeta({ onSuccess }: Props) {
  const supabase = createClient()
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [formData, setFormData] = useState({ nombre: '', color: '#3B82F6' })  // single state object

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { error } = await supabase.from('carpetas').insert([formData])
      if (error) throw error
      onSuccess()
      router.refresh()                                         // REQUIRED after any mutation
    } catch (err) {
      setError(formatErrorForUI(err))                          // use shared error formatter
    } finally { setLoading(false) }
  }
  // …render
}
```

---

## Naming & Conventions

| What | Convention | Example |
|------|-----------|---------|
| Files | PascalCase | `ModalCarpeta.tsx`, `CasoFormFields.tsx` |
| Folders | lowercase | `casos/`, `agenda/`, `ui/` |
| Functions | camelCase | `handleSubmit`, `cargarDatos` |
| Types / Interfaces | PascalCase | `Caso`, `CasoInsert`, `ModalCarpetaProps` |
| Constants | UPPER_SNAKE_CASE | `COLORES_PREDEFINIDOS`, `TEST_EMAIL` |
| Exports | default export per file | one component per file |

---

## TypeScript Rules

- **NO `any`** — use types from `@/lib/types/database` or `unknown`
- **Always `@/` aliases** — never `../../../`
- **Null safety**: `data?.field || fallback` (NOT NULL) / `data?.field ?? null` (NULLABLE)
- **Type imports**: `import type { … }` for anything that is purely a type
- **Single state object** for forms: `useState({ campo1: '', campo2: '' })`
- **Catch-clause typing**: `catch (err: unknown)` then use `err instanceof Error`

---

## Database — Critical Rules

**Source of truth**: `lib/types/database.ts` — verify column names & enums BEFORE every INSERT/UPDATE.

### Enum values are CASE-SENSITIVE (CHECK constraints)
```typescript
type TipoCaso      = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
type EstadoCaso    = 'Activo' | 'Inactivo'
type EstadoProcesal= 'En proceso' | 'Ganado' | 'Perdido'
type FormaPago     = 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'
type CategoriaNota = 'General' | 'Urgente' | 'Legal' | 'Administrativa' | 'Financiera'
type TipoEvento    = 'Audiencia' | 'Plazo' | 'Reunión' | 'Otro'
type MetodoPago    = 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Otro'
type RolUsuario    = 'admin' | 'abogado' | 'secretaria'
```

### Common mistakes to avoid
```
❌ abogada_asignada_id   →  ✅ abogado_asignado_id
❌ 'por hora'            →  ✅ 'Por hora'
❌ .select('*')          →  ✅ .select('id, cliente, tipo')   // specific fields
❌ descripcion: undefined→  ✅ descripcion: value || ''       // NOT NULL
❌ patrocinado: ''       →  ✅ patrocinado: value || null     // NULLABLE
```

### Insert pattern
```typescript
import type { CasoInsert } from '@/lib/types/database'
// Use the dedicated helper when available:
import { casoFormDataToInsert } from '@/lib/types/database'
const payload = casoFormDataToInsert(formData, financiero, user.id)
const { error } = await supabase.from('casos').insert([payload])
```

---

## Error Handling

Use the shared utilities in `lib/utils/errors.ts`:
```typescript
import { formatErrorForUI, logError } from '@/lib/utils/errors'

try { … }
catch (err: unknown) {
  logError('ModalCarpeta', err)            // structured log
  setError(formatErrorForUI(err))          // translates Supabase errors → Spanish UI messages
}
```

---

## E2E Test Conventions

- Credentials via env: `TEST_EMAIL` / `TEST_PASSWORD` (fallback hard-coded in spec)
- Extract reusable helpers at module level (`login`, `navigateToNotas`, etc.)
- `waitForLoadState('networkidle')` after navigation
- Unique titles per run: `` `Test Nota ${Date.now()}` ``
- Clean up after yourself: create → assert → delete → assert gone

---

## Pre-Commit Checklist

- [ ] `npm run lint` → 0 errors, 0 warnings
- [ ] `npm run build` → compiles successfully
- [ ] Column names verified against `lib/types/database.ts`
- [ ] Enum values match CHECK constraints (case-sensitive!)
- [ ] All `async` operations wrapped in `try/catch`; errors surface via `setError`
- [ ] Loading states on every submit button (`disabled={loading}`)
- [ ] `router.refresh()` called after every mutation in Client Components
- [ ] No `console.log` left (use `logError` from utils)
- [ ] No `any` types; `import type` used for type-only imports
- [ ] `'use client'` only where state/effects/event-handlers exist
- [ ] NOT NULL fields → `|| ''`; NULLABLE fields → `|| null`
