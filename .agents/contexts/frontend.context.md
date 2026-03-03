# Frontend Engineer Context

**Última actualización**: 26 Enero 2026  
**Sprint actual**: Foundation - Week 3  
**Asignado a**: Frontend Team

---

## Current Task

**Refactoring componentes de Casos para mejor reusabilidad**  
**Status**: 40% completado  
**Estimado**: 3 días restantes  
**Priority**: P1 (High)

### Subtasks

- [x] Extraer CasoForm como componente reutilizable
- [x] Separar lógica de presentación en TablaCasos
- [ ] Crear hook personalizado `useCasos` para data fetching
- [ ] Documentar props de componentes con JSDoc
- [ ] Escribir tests E2E para create/edit flows

---

## Completed ✅

### This Week (22-26 Ene)
- [x] Implementé validación de forms con estado local
- [x] Agregué loading states en todos los botones de submit
- [x] Refactoricé ModalConfirmacion para ser más reutilizable
- [x] Actualicé tipos según nuevo contrato de Backend

### Last Week (15-19 Ene)
- [x] Implementé drag-and-drop para carpetas (usando @dnd-kit)
- [x] Agregué filtros de búsqueda en lista de casos
- [x] Mejoré responsive design en mobile (<768px)
- [x] Configuré E2E tests con Playwright

---

## In Progress 🚧

### Main Task
**Hook `useCasos` para data fetching** (50%)

```tsx
// app/hooks/useCasos.ts (DRAFT)
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Caso } from '@/lib/types/database'

export function useCasos() {
  const [casos, setCasos] = useState<Caso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCasos() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('casos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setCasos(data || [])
      }
      setLoading(false)
    }
    fetchCasos()
  }, [])

  return { casos, loading, error }
}
```

**Pendiente**:
- [ ] Agregar refresh function
- [ ] Manejar cache invalidation
- [ ] Agregar filters support

---

## Blockers 🚫

### High Priority
**Backend aún no actualizó tipos en contracts/types.md**  
**Impacto**: No puedo implementar nuevo campo `email` en CasoForm  
**Acción**: Contactar a Backend Team (Slack #backend-support)  
**Esperado**: Hoy 26 Ene EOD

### Medium Priority
Ninguno

---

## Tech Decisions 📋

### Decision #1: Usar @dnd-kit para drag-and-drop
**Fecha**: 18 Ene 2026  
**Razón**: Más ligero que react-beautiful-dnd, mejor soporte para touch  
**Alternativas**: react-beautiful-dnd (deprecated), react-dnd (complejo)  
**Resultado**: Implementado exitosamente en carpetas

### Decision #2: Estado local vs Zustand
**Fecha**: 20 Ene 2026  
**Razón**: Para MVP, `useState` es suficiente. No justifica Zustand todavía  
**Review**: Re-evaluar en Fase 2 si hay state compartido complejo

### Decision #3: Server Components por default
**Fecha**: 15 Ene 2026  
**Razón**: Mejor performance, menos JavaScript en cliente  
**Aplicación**: Solo usar 'use client' cuando estrictamente necesario

---

## Components Created/Modified

### New Components
- `app/components/ui/loading.tsx` - Loading spinner reutilizable
- `app/hooks/useCasos.ts` - Hook para data fetching (WIP)

### Modified Components
- `app/dashboard/casos/components/TablaCasos.tsx` - Separé lógica de UI
- `app/components/ModalConfirmacion.tsx` - Más props customizables
- `app/dashboard/casos/nuevo/page.tsx` - Usé nuevo CasoForm

---

## Testing Coverage

### E2E Tests (Playwright)
- ✅ `e2e/casos.spec.ts` - CRUD completo de casos
- ✅ `e2e/notas.spec.ts` - Create, edit, delete notas
- ⏸️ `e2e/agenda.spec.ts` - Pendiente (próxima semana)

### Coverage Stats
- **Total**: 25% (↑ desde 20%)
- **Target**: 70% (Fase 2-3)

---

## Performance Notes

### Bundle Size
- **Current**: 245 KB (gzipped)
- **Target**: <300 KB
- **Status**: ✅ Dentro del target

### Improvements Made
- Lazy load TipTap editor (solo en páginas de notas)
- Optimicé imports de lucide-react (tree-shaking)

---

## Learnings & Notes 📝

### What Went Well
- Server Components reducen significativamente JavaScript
- `router.refresh()` funciona bien para re-fetch después de mutations
- TipTap es excelente para rich text, pero bundle size alto

### What Could Be Better
- Necesitamos mejor estrategia de error handling global
- Tipos de Supabase a veces están out-of-sync con DB
- Tailwind clases se repiten mucho (considerar componentes)

### Tips for Future
- Siempre leer `contracts/api-spec.md` ANTES de implementar
- Verificar column names en `lib/types/database.ts`
- Usar `router.refresh()` después de cada mutation

---

## Next Tasks (Prioritized)

### P0 - Critical
Ninguno

### P1 - High
- [ ] Completar hook `useCasos` con filters
- [ ] Agregar tests E2E para agenda module
- [ ] Documentar componentes con JSDoc

### P2 - Medium
- [ ] Implementar error boundary global
- [ ] Mejorar loading states (skeletons)
- [ ] Optimizar re-renders innecesarios

### P3 - Low
- [ ] Dark mode support
- [ ] Storybook para componentes
- [ ] i18n (multi-language)

---

## Questions / Need Help ❓

1. **¿Deberíamos usar Zod para validación de forms?**  
   - Actualmente usando validación manual
   - Zod daría mejor DX y type safety
   - **Action**: Discutir en próximo sync

2. **¿Cómo manejar optimistic updates?**  
   - Actualmente esperamos response de Supabase
   - ¿Usar optimistic updates para mejor UX?
   - **Action**: Ver si es necesario para MVP

---

## Contact & Coordination

**Slack**: @frontend-team  
**Daily Standup**: 9:30am  
**Weekly Sync**: Miércoles 10am  
**Code Reviews**: GitHub PRs (tag @tech-lead)

---

**Mantenido por**: Frontend Engineering Team  
**Review frequency**: Daily updates  
**Last sync with Backend**: 24 Ene 2026
