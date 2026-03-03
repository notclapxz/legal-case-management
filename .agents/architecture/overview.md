# Arquitectura del Sistema - Legal Case Management

**Versión**: 1.0  
**Última actualización**: 26 Enero 2026  
**Estado**: Production Ready (MVP)

---

## Resumen Ejecutivo

Sistema de gestión de casos legales construido con **Next.js 16.1.2 + React 19 + Supabase**.

**Arquitectura**: Next.js App Router con Server Components (SSR) + Supabase Backend  
**Pattern**: Container/Presentational + Server/Client Component separation  
**Estado**: React Server Components (default) + Client Components (cuando necesario)

---

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 16.1.2 (App Router)
- **UI Library**: React 19 con React Server Components
- **Lenguaje**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3.4
- **Componentes**: shadcn/ui (Radix UI primitives)
- **Rich Text**: TipTap (para notas y documentos)
- **Iconos**: Lucide React
- **Drag & Drop**: @dnd-kit

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage (para archivos)
- **Realtime**: Supabase Realtime (para colaboración)
- **API**: Next.js Server Actions + API Routes

### DevOps
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **Testing**: Playwright (E2E)
- **Linting**: ESLint (Next.js config)
- **Type Checking**: TypeScript compiler

---

## Arquitectura de Componentes

### Estructura de Carpetas

```
despacho-web/
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Auth group
│   │   └── login/                    # Login page
│   ├── dashboard/                    # Protected routes
│   │   ├── layout.tsx                # Dashboard layout (Server Component)
│   │   ├── page.tsx                  # Dashboard home (Server Component)
│   │   ├── casos/                    # Cases module
│   │   │   ├── page.tsx              # Cases list (Server Component)
│   │   │   ├── nuevo/                # Create case
│   │   │   ├── [id]/                 # Case detail (dynamic route)
│   │   │   │   ├── page.tsx          # Case detail (Server Component)
│   │   │   │   ├── editar/           # Edit case
│   │   │   │   └── notas/            # Notes subpage
│   │   │   └── components/           # Cases-specific components
│   │   ├── agenda/                   # Calendar module
│   │   ├── reportes/                 # Reports module
│   │   └── ubicaciones/              # Physical locations
│   ├── components/                   # Shared components
│   │   ├── ui/                       # Reusable UI primitives
│   │   └── casos/                    # Business logic components
│   └── api/                          # API routes (cuando necesario)
├── lib/
│   ├── supabase/
│   │   ├── server.ts                 # Server-side Supabase client
│   │   └── client.ts                 # Client-side Supabase client
│   ├── types/
│   │   └── database.ts               # **SOURCE OF TRUTH** - DB types
│   ├── utils/                        # Helper functions
│   │   ├── helpers.ts
│   │   └── errors.ts
│   └── validaciones/                 # Business logic validation
│       └── financieras.ts
├── e2e/                              # Playwright tests
├── public/                           # Static assets
└── next.config.ts                    # Next.js configuration
```

---

## Patrones de Diseño

### 1. Server Components (Default)

**Usar para**:
- Fetching de datos
- Autenticación
- Renderizado inicial
- SEO

```tsx
// app/dashboard/casos/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CasosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: casos } = await supabase.from('casos').select('*')
  return <CasosList casos={casos} />
}
```

**Ventajas**:
- ✅ Zero JavaScript en el cliente
- ✅ Fast initial load
- ✅ SEO-friendly
- ✅ Menos bundle size

### 2. Client Components (Solo cuando necesario)

**Usar para**:
- Interactividad (`onClick`, `onChange`)
- Hooks de React (`useState`, `useEffect`)
- Browser APIs (`localStorage`, `window`)
- Third-party client libraries

```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CasoForm() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const handleSubmit = async () => {
    setLoading(true)
    await supabase.from('casos').insert([...])
    setLoading(false)
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

**Regla**: Preferir Server Components siempre. Usar Client Components solo cuando sea estrictamente necesario.

### 3. Container/Presentational Pattern

**Container** (Smart Component):
- Maneja estado
- Fetching de datos
- Lógica de negocio
- Event handlers

**Presentational** (Dumb Component):
- Recibe props
- Solo UI
- No tiene estado
- Reusable

```tsx
// Container (Client Component)
'use client'
export default function CasosConCarpetas({ casosIniciales }) {
  const [casos, setCasos] = useState(casosIniciales)
  const handleDrag = () => { /* logic */ }
  return <TablaCasos casos={casos} onDrag={handleDrag} />
}

// Presentational (puede ser Server o Client)
export function TablaCasos({ casos, onDrag }) {
  return <table>...</table>
}
```

---

## Flujo de Datos

### Authentication Flow

```
1. Usuario visita /dashboard
2. Server Component verifica session (supabase.auth.getUser())
3. Si no hay session → redirect('/login')
4. Si hay session → render página
```

### Data Fetching Flow (Server Component)

```
1. Server Component ejecuta en servidor
2. Fetch data desde Supabase
3. Renderiza HTML con datos
4. Envía HTML al cliente (no JSON)
5. Hydrate interactivo (si necesario)
```

### Data Mutation Flow (Client Component)

```
1. Usuario interactúa con form
2. Client Component captura evento
3. Envía mutation a Supabase
4. Actualiza UI optimistically (opcional)
5. Llama router.refresh() para re-fetch Server Components
```

---

## Database Schema

Ver `/docs/database/DOCUMENTACION_BD.md` para schema completo.

### Tablas Principales

- **casos**: Casos legales
- **notas**: Notas de casos
- **eventos**: Eventos de agenda
- **pagos**: Pagos de casos
- **carpetas**: Organización de casos
- **profiles**: Usuarios (abogados)

### Relaciones Clave

```
casos → pagos (1:N)
casos → notas (1:N)
casos → eventos (1:N)
casos → carpetas (N:1)
casos → profiles (N:1) [abogado_asignado]
```

---

## Seguridad

### Row Level Security (RLS)

**Supabase RLS** asegura que usuarios solo vean sus propios datos.

```sql
-- Ejemplo: Solo abogados pueden ver casos de su despacho
CREATE POLICY "Users can view own cases"
ON casos FOR SELECT
USING (auth.uid() = created_by OR auth.uid() = abogado_asignado_id);
```

### Authentication

- JWT tokens via Supabase Auth
- Session management automático
- Refresh tokens manejados por Supabase SDK

### Input Validation

- Zod schemas para validación de forms
- TypeScript types estrictos
- Validaciones de negocio en `/lib/validaciones`

---

## Performance

### Optimizaciones Aplicadas

1. **Server Components**: Reducir JavaScript en cliente
2. **Code Splitting**: Automático por Next.js
3. **Image Optimization**: next/image
4. **Font Optimization**: next/font
5. **Lazy Loading**: Dynamic imports cuando necesario

### Métricas Target

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## Testing Strategy

### E2E Tests (Playwright)

- **Ubicación**: `/despacho-web/e2e/`
- **Cobertura**: Flujos críticos (login, crear caso, notas)
- **Ejecución**: `npm run test:e2e`

### Pruebas Manuales

- Ver `/docs/users/INSTRUCCIONES_USUARIOS_PRUEBA.md`

---

## Deployment

### Vercel (Production)

```bash
# Automático en push a main
git push origin main

# Vercel auto-deploy y ejecuta:
1. npm run build
2. Deploy a production
3. Invalidate CDN cache
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Solo servidor

# Opcionales
ANALYZE=true # Para bundle analysis
```

---

## Escalabilidad

### Limitaciones Actuales (MVP)

- **Usuarios concurrentes**: ~100
- **Casos en sistema**: ~5,000
- **Archivos storage**: 5GB (Supabase free tier)

### Path to Scale (Futuro)

1. **Database**: Upgrade a Supabase Pro ($25/mo)
2. **Caching**: Redis para queries frecuentes
3. **CDN**: Vercel Edge Network (ya incluido)
4. **Monitoring**: Sentry + Vercel Analytics

---

## Decisiones Arquitectónicas (ADRs)

Ver `architecture/decisions.md` para decisiones detalladas.

### ADR-001: Next.js App Router vs Pages Router
**Decisión**: App Router  
**Razón**: Server Components, mejor DX, futuro de Next.js

### ADR-002: Supabase vs Backend Custom
**Decisión**: Supabase  
**Razón**: Velocidad de desarrollo, auth built-in, RLS

### ADR-003: Server Components vs Client Components
**Decisión**: Server Components por default  
**Razón**: Menor JavaScript, mejor performance, SEO

---

## Roadmap Técnico

### Fase 1: Foundation (Semanas 1-4)
- ✅ Setup inicial
- ✅ Auth flow
- ✅ CRUD de casos
- ✅ Testing E2E básico

### Fase 2: Features (Semanas 5-12)
- ✅ Sistema de notas
- ✅ Agenda/calendario
- ✅ Sistema de pagos
- ✅ Carpetas para organización

### Fase 3: Production (Semanas 13-20)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Monitoring + alertas
- [ ] Testing completo (70% coverage)

### Fase 4: Scale (Semanas 21-24)
- [ ] Redis caching
- [ ] Advanced analytics
- [ ] Multi-tenancy
- [ ] API pública

---

## Recursos

- **Documentación Next.js**: https://nextjs.org/docs
- **Documentación Supabase**: https://supabase.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Mantenido por**: Solution Architecture Team  
**Revisión**: Cada sprint (2 semanas)
