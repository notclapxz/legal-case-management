# Backend Engineer Guide

**Proyecto**: Sistema de Gestión de Despacho Legal  
**Stack**: Supabase (PostgreSQL + Auth) + Next.js Server Actions  
**Tu workspace**: `/despacho-web` - Trabajá SOLO acá

---

## 🎯 Tu Rol

**Sos responsable de**:
- Definir contratos de API (ANTES de implementar)
- Implementar Server Actions o API Routes
- Mantener database schema
- Actualizar types de TypeScript
- Escribir RLS (Row Level Security) policies

**NO sos responsable de**:
- Implementar UI (eso es Frontend)
- Decidir qué componentes usar
- Styling con Tailwind

---

## 📚 Antes de Empezar

### Leer PRIMERO (orden estricto):

1. **`/AGENTS.md`** (root) - Comandos y convenciones ← EMPEZÁ ACÁ
2. **`.agents/contracts/README.md`** - Cómo funcionan los contratos
3. **`.agents/architecture/overview.md`** - Arquitectura del sistema
4. **`/docs/database/DOCUMENTACION_BD.md`** - Database schema completo
5. **`despacho-web/lib/types/database.ts`** - Source of truth de types

### Setup Inicial

```bash
cd despacho-web
npm install
cp .env.example .env.local  # Configurar Supabase credentials
npm run dev  # Debe arrancar en http://localhost:3000
```

### Credenciales Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # Solo servidor, NO expongas
```

---

## 🔄 Workflow de Desarrollo

### Paso 1: Leer el Plan

```bash
# Ver qué feature implementar
cat .agents/plans/03-cases-module.md
```

### Paso 2: Definir Contrato

**ANTES de escribir código**, definir en:

1. **`.agents/contracts/api-spec.md`** - Endpoints
2. **`.agents/contracts/types.md`** - Types compartidos

Ejemplo:

```markdown
## api-spec.md

### POST /api/v1/casos

**Description**: Crea un nuevo caso legal

**Authentication**: Required (JWT)

**Request**:
```json
{
  "cliente": "string",
  "tipo": "Penal" | "Civil" | "Laboral" | "Administrativo",
  "descripcion": "string" // opcional
}
```

**Response (201)**:
```json
{
  "data": {
    "id": "uuid",
    "cliente": "Juan Pérez",
    "tipo": "Penal",
    "created_at": "2026-01-26T10:30:00Z"
  }
}
```
```

```typescript
// types.md

export interface CreateCasoDTO {
  cliente: string
  tipo: TipoCaso
  descripcion?: string
}

export interface CasoResponse {
  data: Caso
}
```

### Paso 3: Implementar

En Next.js, hay **3 formas** de implementar backend logic:

#### Opción A: Server Component (Preferido para fetching)

```tsx
// app/dashboard/casos/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CasosPage() {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Fetch data
  const { data: casos, error } = await supabase
    .from('casos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  return <CasosList casos={casos} />
}
```

#### Opción B: Server Action (Preferido para mutations)

```tsx
// app/actions/casos.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CreateCasoDTO } from '@/lib/types/database'

export async function createCaso(data: CreateCasoDTO) {
  const supabase = await createClient()
  
  // Auth check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // Validation
  if (!data.cliente) {
    return { error: 'Cliente es requerido' }
  }
  
  // Insert
  const { data: caso, error } = await supabase
    .from('casos')
    .insert([{
      ...data,
      created_by: user.id
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating caso:', error)
    return { error: error.message }
  }
  
  // Revalidate cache
  revalidatePath('/dashboard/casos')
  
  return { data: caso }
}
```

#### Opción C: API Route (Solo cuando necesario)

```tsx
// app/api/casos/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  
  // Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Parse body
  const body = await request.json()
  
  // Validation
  if (!body.cliente) {
    return NextResponse.json(
      { error: 'Cliente es requerido' },
      { status: 400 }
    )
  }
  
  // Insert
  const { data: caso, error } = await supabase
    .from('casos')
    .insert([body])
    .select()
    .single()
  
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ data: caso }, { status: 201 })
}
```

**Cuándo usar cada uno**:
- **Server Component**: Fetching de datos (GET)
- **Server Action**: Mutations simples (POST, PUT, DELETE)
- **API Route**: Webhooks externos, integraciones third-party

### Paso 4: Actualizar Types

```tsx
// despacho-web/lib/types/database.ts

export interface Caso {
  id: string
  cliente: string
  tipo: TipoCaso
  descripcion?: string | null
  // ... otros campos
}

export type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'

export interface CreateCasoDTO {
  cliente: string
  tipo: TipoCaso
  descripcion?: string
}
```

### Paso 5: Actualizar Context

```markdown
# .agents/contexts/backend.context.md

## Completed
- [x] Definí contrato POST /casos en api-spec.md
- [x] Implementé createCaso server action
- [x] Actualicé types.md con CreateCasoDTO

## Contracts Updated
- [x] api-spec.md - Added POST /casos
- [x] types.md - Added CreateCasoDTO, CasoResponse

## Tech Decisions
- Usé Server Action en vez de API Route (más simple)
- Validación con Zod (futuro)
```

---

## 🗄️ Database Management

### Schema Changes

**NUNCA** cambies el schema directamente en producción.

**Workflow**:

1. Hacer cambio en Supabase Dashboard (SQL Editor)
2. Guardar migration en `/sql-archives/`
3. Actualizar `despacho-web/lib/types/database.ts`
4. Actualizar `.agents/contracts/types.md`
5. Notificar a Frontend

**Ejemplo de Migration**:

```sql
-- sql-archives/2026-01-26_add_email_to_casos.sql

ALTER TABLE casos
ADD COLUMN email TEXT;

COMMENT ON COLUMN casos.email IS 'Email del cliente';
```

### RLS (Row Level Security)

**SIEMPRE** implementar RLS policies.

```sql
-- Los usuarios solo ven casos de su despacho
CREATE POLICY "Users can view own cases"
ON casos FOR SELECT
USING (
  auth.uid() = created_by 
  OR 
  auth.uid() = abogado_asignado_id
);

-- Los usuarios solo pueden crear casos
CREATE POLICY "Users can create cases"
ON casos FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Los usuarios solo pueden actualizar sus casos
CREATE POLICY "Users can update own cases"
ON casos FOR UPDATE
USING (auth.uid() = created_by OR auth.uid() = abogado_asignado_id);
```

---

## 🔐 Authentication & Security

### Auth Check Pattern

```tsx
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  // Server Component
  redirect('/login')
  
  // API Route
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  // Server Action
  throw new Error('Unauthorized')
}
```

### Input Validation

```tsx
import { z } from 'zod'

const CasoSchema = z.object({
  cliente: z.string().min(1, 'Cliente es requerido'),
  tipo: z.enum(['Penal', 'Civil', 'Laboral', 'Administrativo']),
  descripcion: z.string().optional()
})

// En Server Action
export async function createCaso(data: unknown) {
  const validated = CasoSchema.safeParse(data)
  
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors }
  }
  
  // ... usar validated.data
}
```

### Secrets Management

```tsx
// ❌ NUNCA
const apiKey = 'sk-xxx123'

// ✅ SIEMPRE
const apiKey = process.env.API_SECRET_KEY!
```

---

## 📋 Error Handling Pattern

```tsx
try {
  const { data, error } = await supabase.from('casos').insert([...])
  
  if (error) {
    console.error('Database error:', error)
    throw new Error(`Failed to create caso: ${error.message}`)
  }
  
  return { data }
} catch (err) {
  console.error('Unexpected error:', err)
  
  // Server Action
  return { error: err instanceof Error ? err.message : 'Unknown error' }
  
  // API Route
  return NextResponse.json(
    { error: err instanceof Error ? err.message : 'Unknown error' },
    { status: 500 }
  )
}
```

---

## 🧪 Testing Backend Logic

### Manual Testing con Supabase Dashboard

1. Ir a Supabase Dashboard → SQL Editor
2. Ejecutar query directamente
3. Verificar Row Level Security

```sql
-- Test RLS como usuario específico
SET request.jwt.claim.sub = 'user-uuid-here';

SELECT * FROM casos;
```

### Testing Server Actions

```tsx
// e2e/casos.spec.ts
import { test, expect } from '@playwright/test'

test('should create caso', async ({ page }) => {
  await page.goto('/dashboard/casos/nuevo')
  await page.fill('input[name="cliente"]', 'Test Cliente')
  await page.selectOption('select[name="tipo"]', 'Penal')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard/casos')
  await expect(page.locator('text=Test Cliente')).toBeVisible()
})
```

---

## ✅ Pre-Commit Checklist

- [ ] Contrato definido en `.agents/contracts/api-spec.md`
- [ ] Types definidos en `.agents/contracts/types.md`
- [ ] Types actualizados en `lib/types/database.ts`
- [ ] RLS policies implementadas (si aplica)
- [ ] Auth check implementado
- [ ] Input validation con Zod
- [ ] Error handling con try/catch
- [ ] `npm run lint` pasa (0 errors)
- [ ] `npm run build` compila
- [ ] Context actualizado en `.agents/contexts/backend.context.md`

---

## 📝 Actualizar Context

```markdown
# .agents/contexts/backend.context.md

## Current Task
Implementando módulo de Casos (CRUD completo)

## Completed
- [x] POST /casos - Crear caso
- [x] GET /casos - Lista de casos
- [x] GET /casos/:id - Detalle de caso

## In Progress
- [ ] PUT /casos/:id - Actualizar caso (70%)

## Contracts Updated
- [x] api-spec.md - Added POST, GET endpoints
- [x] types.md - Added Caso, CreateCasoDTO, UpdateCasoDTO

## Blockers
Ninguno

## Tech Decisions
- Usé Server Actions para mutations (más simple que API Routes)
- RLS implementado para multi-tenancy
- Zod para validation (reemplazar validaciones manuales)

## Notes
- Frontend puede empezar a consumir POST y GET
- PUT estará listo mañana
```

---

## 🆘 Troubleshooting

### Error: "new row violates row-level security policy"

**Causa**: RLS policy bloquea operación  
**Solución**: Revisar policy en Supabase Dashboard → Authentication → Policies

### Error: "column does not exist"

**Causa**: Column name incorrecto o no existe  
**Solución**: Verificar schema en Dashboard → Table Editor

### Error: "relation does not exist"

**Causa**: Tabla no existe o no está en el schema correcto  
**Solución**: Ejecutar migration faltante

### Error: "Cannot read env variable"

**Causa**: .env.local no configurado  
**Solución**: Copiar .env.example y llenar credentials

---

## 📚 Recursos

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Server Actions**: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security

---

**Mantenido por**: Backend Engineering Team  
**Última actualización**: 26 Enero 2026  
**¿Dudas?**: Slack #backend-support
