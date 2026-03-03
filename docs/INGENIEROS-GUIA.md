# 📚 Guía para Ingenieros - Sistema de Gestión Legal

Esta guía te dice **qué leer y en qué orden** según lo que vayas a hacer.

---

## 🎯 ¿Qué vas a hacer?

### 🚀 Soy nuevo en el proyecto → **START AQUÍ**

1. **Leer primero** (10 min):
   - `AGENTS.md` (root) - Resumen rápido del proyecto
   - `despacho-web/AGENTS.md` - Guía de desarrollo completa

2. **Configurar entorno** (15 min):
   ```bash
   cd despacho-web
   npm install
   cp .env.example .env.local  # Configurar Supabase
   npm run dev  # Verificar que funciona
   ```

3. **Entender arquitectura** (30 min):
   - `docs/architecture/ARQUITECTURA-ACTUAL.md` - Stack y estructura
   - `docs/database/DATABASE-SCHEMA.md` - Modelo de datos

---

### 💻 Voy a editar componentes UI → **UI PATH**

**1. Conceptos básicos** (leer estos primero):
- `despacho-web/AGENTS.md` → Sección "Code Style"
- `despacho-web/AGENTS.md` → Sección "Import Order"
- `despacho-web/AGENTS.md` → Sección "Tailwind CSS Style"

**2. Tipos de datos** (referencia constante):
- `lib/types/database.ts` - TODOS los tipos de la BD
  - Buscar `interface Caso`, `interface Nota`, etc.
  - Ver enums: `TipoCaso`, `EstadoCaso`, `FormaPago`, etc.

**3. Componentes similares** (para ejemplos):
- `app/components/ui/loading.tsx` - Componente de loading simple
- `app/components/ModalConfirmacion.tsx` - Modal reutilizable

**4. Patrones a seguir**:
```tsx
// ✅ Client Component (cuando necesitas interactividad)
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ✅ Server Component (por defecto)
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() { }
```

**Archivos que probablemente editarás**:
- `app/components/ui/` - Componentes reutilizables
- `app/dashboard/components/` - Componentes del dashboard
- `app/dashboard/casos/components/` - Componentes de casos
- `app/dashboard/casos/[id]/components/` - Componentes de detalle de caso

---

### 🗄️ Voy a editar la base de datos → **DB PATH**

**1. Entender el esquema** (OBLIGATORIO):
- `docs/database/DATABASE-SCHEMA.md` - **ESTE ES EL SOURCE OF TRUTH**
- `lib/types/database.ts` - Tipos TypeScript del esquema

**2. Scripts de migración**:
- `sql-archives/` - Historial de cambios en BD
- `docs/database/` - Documentación de BD

**3. Antes de cambiar la BD**:
1. Verificar si el tipo ya existe en `lib/types/database.ts`
2. Actualizar el tipo si cambias la BD
3. Correr migración en Supabase SQL Editor
4. Probar en desarrollo antes de producción

**Archivos que probablemente editarás**:
- `lib/types/database.ts` - Tipos TypeScript (MANTENER SINCRONIZADO CON BD)
- Archivos SQL en `sql-archives/`

**ADVERTENCIA**: Nunca cambies la BD sin actualizar `lib/types/database.ts`

---

### 🔌 Voy a crear nuevos endpoints API → **API PATH**

**1. Patrones de Next.js**:
- `despacho-web/AGENTS.md` → Sección "Server Components"
- Revisar endpoint existente: `app/api/auth/signout/route.ts`

**2. Cuando usar API routes** vs Server Actions:
- ✅ **Usar API routes**: Para integraciones externas, webhooks
- ❌ **NO usar API routes**: Para CRUD de Supabase (usa Server Components directamente)

**Ejemplo correcto**:
```tsx
// ❌ MAL - API route innecesario
// app/api/casos/route.ts
export async function GET() {
  const supabase = await createClient()
  return Response.json(await supabase.from('casos').select('*'))
}

// ✅ BIEN - Server Component directo
// app/dashboard/casos/page.tsx
export default async function Page() {
  const supabase = await createClient()
  const casos = await supabase.from('casos').select('*')
  return <CasosList casos={casos} />
}
```

---

### 📊 Voy a crear nuevas features → **FEATURE PATH**

**1. Documentación de feature** (crear primero):
- Ver ejemplos: `docs/features/FEATURE-CALENDAR.md`
- Template para nuevas features

**2. Planificación**:
- `docs/roadmap/PASOS-SIGUIENTES.md` - Roadmap del proyecto
- `docs/architecture/PLAN-TECNICO-FEATURES-CRITICAS.md` - Features críticas

**3. Checklist para nuevas features**:
- [ ] Leído `AGENTS.md`
- [ ] Verificado tipos en `lib/types/database.ts`
- [ ] Creado Server Component para data fetching
- [ ] Creado Client Component solo cuando necesario
- [ ] Agregado JSDoc al componente
- [ ] Probado en desarrollo
- [ ] Verificado `npm run lint` pasa
- [ ] Verificado `npm run build` compila
- [ ] Creado E2E test si es feature crítica

---

### 🐛 Voy a arreglar bugs → **DEBUG PATH**

**1. Herramientas**:
- Browser DevTools (F12) - Console, Network, Elements
- `despacho-web/AGENTS.md` → Sección "Common Errors"
- `docs/troubleshooting/ERRORES_COMUNES.md`

**2. Debugging workflow**:
```bash
# 1. Verificar consola del navegador
# 2. Verificar logs de Supabase (dashboard)
# 3. Verificar que `npm run lint` no tiene errores
# 4. Revisar tipos en lib/types/database.ts
# 5. Verificar DATABASE-SCHEMA.md para columnas correctas
```

**3. Common bugs**:
- "column does not exist" → Verificar `DATABASE-SCHEMA.md`
- "Cannot read properties of undefined" → Revisar Supabase `error` + usar `data?.field`
- UI no actualiza → Call `router.refresh()` después de mutaciones

---

### 🧪 Voy a escribir tests → **TEST PATH**

**1. Configuración**:
- `playwright.config.ts` - Configuración de E2E tests
- `e2e/notas.spec.ts` - Ejemplo de test completo

**2. Patrones de testing**:
- Tests de componentes → Próximamente con Testing Library
- E2E tests → Playwright (ya configurado)

**3. Ejecutar tests**:
```bash
# Todos los tests
npm run test:e2e

# Un solo test
npx playwright test e2e/notas.spec.ts --headed

# Por nombre
npx playwright test --grep "crear una nota nueva"

# UI interactivo
npm run test:e2e:ui
```

---

### 📖 Voy a leer código existente → **CODE READING PATH**

**1. Estructura del proyecto**:
```
despacho-web/
├── app/                    # Páginas y rutas
│   ├── dashboard/          # Dashboard principal
│   │   ├── casos/         # Gestión de casos
│   │   ├── agenda/        # Calendario
│   │   └── reportes/      # Reportes financieros
│   ├── components/        # Componentes compartidos
│   └── api/              # API routes (mínimo)
├── lib/                   # Utilidades reutilizables
│   ├── types/            # Tipos de BD (SOURCE OF TRUTH)
│   ├── utils/            # Helpers (fechas, texto, arrays)
│   ├── validaciones/     # Validaciones financieras
│   └── supabase/        # Clients de Supabase
└── e2e/                 # E2E tests
```

**2. Flujo de datos típico**:
```
1. Usuario interactúa con Client Component
2. Client Component llama a Supabase client
3. Supabase devuelve datos
4. Component actualiza estado con router.refresh()
5. Server Component re-renderiza con nuevos datos
```

**3. Ejemplo: Editar un caso**:
```
app/dashboard/casos/[id]/editar/page.tsx
  → Usa lib/types/database.ts (Caso, CasoUpdate)
  → Usa lib/supabase/client.ts (createClient)
  → Usa lib/utils/errors.ts (formatErrorForUI)
  → Muestra form usando componentes de app/dashboard/casos/[id]/components/
```

---

## 🎓 Rutas de Aprendizaje

### Nivel 1: Junior (primeras 2 semanas)
1. ✅ Leído `AGENTS.md` (root + despacho-web)
2. ✅ Entendido Server vs Client Components
3. ✅ Usado Supabase client correctamente
4. ✅ Seguido patrones de imports y estilos
5. ✅ Creado componente simple con JSDoc

### Nivel 2: Mid-level (primer mes)
1. ✅ Entendido todos los tipos en `lib/types/database.ts`
2. ✅ Creado feature completa (Server + Client components)
3. ✅ Escrito E2E test para feature crítica
4. ✅ Seguido checklist de pre-commit
5. ✅ Entendido patrón de data fetching

### Nivel 3: Senior (2+ meses)
1. ✅ Contribuido a arquitectura del proyecto
2. ✅ Optimizado performance de componentes
3. ✅ Mejorado documentación
4. ✅ Resuelto bugs complejos
5. ✅ Revisado code de otros ingenieros

---

## 📋 Referencias Rápidas

| Lo que buscas | Archivo principal |
|--------------|-------------------|
| Comandos de dev | `AGENTS.md` (root) |
| Patrones de código | `AGENTS.md` (despacho-web) |
| Tipos de BD | `lib/types/database.ts` |
| Schema de BD | `docs/database/DATABASE-SCHEMA.md` |
| Helpers de utilidad | `lib/utils/helpers.ts` |
| Manejo de errores | `lib/utils/errors.ts` |
| Validaciones financieras | `lib/validaciones/financieras.ts` |
| Ejemplos de tests | `e2e/notas.spec.ts` |

---

## ⚠️ Reglas de Oro

1. **NUNCA** uses `any` type
2. **SIEMPRE** verifica `lib/types/database.ts` antes de cambiar BD
3. **SIEMPRE** revisa `DATABASE-SCHEMA.md` para nombres de columnas
4. **SIEMPRE** usa Server Components por defecto
5. **SIEMPRE** corre `npm run lint` y `npm run build` antes de commit
6. **SIEMPRE** agrega JSDoc a funciones/components nuevos
7. **SIEMPRE** sigue el orden de imports especificado en AGENTS.md

---

## 🆘 Ayuda

**Si no entiendes algo**:
1. Lee la sección relevante en `AGENTS.md`
2. Busca ejemplos similares en el código existente
3. Revisa `docs/troubleshooting/ERRORES_COMUNES.md`
4. Pide aclaraciones en el equipo

**Si hay un error**:
1. Verifica consola del navegador
2. Revisa logs de Supabase
3. Verifica `npm run lint`
4. Lee "Common Errors" en `AGENTS.md`

---

**Versión**: 1.0
**Actualizado**: 23 Enero 2026
**Para**: Ingenieros trabajando en Sistema de Gestión Legal
