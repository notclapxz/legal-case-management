# Tech Stack - Consideraciones y Justificación

**Proyecto**: Sistema de Gestión de Despacho Legal  
**Versión**: 1.0  
**Actualizado**: 26 Enero 2026

---

## Stack Elegido

```
Frontend:  Next.js 16.1.2 + React 19 + TypeScript
Backend:   Supabase (PostgreSQL + Auth + Storage)
Styling:   Tailwind CSS 3.4 + shadcn/ui
Testing:   Playwright
Deployment: Vercel
```

---

## ¿Por qué Next.js 16?

### Ventajas
✅ **Server Components**: Menos JavaScript en cliente, mejor performance  
✅ **App Router**: Routing moderno, layouts anidados  
✅ **Built-in optimization**: Images, fonts, code splitting  
✅ **Vercel integration**: Deploy en segundos  
✅ **TypeScript first-class**: Excelente DX

### Alternativas Consideradas
- **Remix**: Excelente, pero menos ecosystem y comunidad
- **Astro**: Mejor para sitios estáticos, no para apps complejas
- **CRA (Create React App)**: Obsoleto, no tiene SSR

### Trade-offs
⚠️ **Learning curve**: Server Components son concepto nuevo  
⚠️ **Vendor lock-in**: Optimizado para Vercel (aunque funciona en otros hosts)

---

## ¿Por qué React 19?

### Ventajas
✅ **Server Components**: Paradigma nuevo para apps performantes  
✅ **Actions**: Mutations sin necesidad de API routes  
✅ **use() hook**: Mejor manejo de promises  
✅ **Optimized compiler**: Auto-memoization

### Alternativas Consideradas
- **Vue 3**: Excelente, pero menos librerías enterprise
- **Svelte**: Muy performante, pero ecosystem pequeño
- **Solid**: Muy rápido, pero comunidad tiny

### Trade-offs
⚠️ **Breaking changes**: React 19 es major version  
⚠️ **Ecosystem catching up**: Algunas libs aún no compatibles

---

## ¿Por qué TypeScript?

### Ventajas
✅ **Type safety**: Catch errors antes de runtime  
✅ **IntelliSense**: Mejor DX con autocomplete  
✅ **Refactoring**: Cambios seguros a gran escala  
✅ **Documentation**: Types son documentación viva

### Alternativas Consideradas
- **JavaScript**: Más rápido inicialmente, pero bugs a largo plazo
- **Flow**: Menos adoption, Facebook lo está discontinuando

### Trade-offs
⚠️ **Slower initial**: Más tiempo definiendo types  
⚠️ **Learning curve**: Generics, utility types, etc.

---

## ¿Por qué Supabase?

### Ventajas
✅ **Auth built-in**: JWT, refresh tokens, social login  
✅ **RLS (Row Level Security)**: Seguridad a nivel de base de datos  
✅ **Realtime**: WebSockets para colaboración  
✅ **Storage**: Manejo de archivos integrado  
✅ **Open source**: Basado en PostgreSQL, no lock-in  
✅ **Generous free tier**: Hasta 500MB DB + 1GB storage gratis

### Alternativas Consideradas
- **Firebase**: Excelente, pero NoSQL y vendor lock-in total
- **AWS Amplify**: Potente, pero complejo para MVP
- **Backend custom (Express + Postgres)**: Más control, pero más tiempo

### Trade-offs
⚠️ **Cold starts**: En free tier puede haber latencia inicial  
⚠️ **Límites free tier**: 500MB DB, 2GB bandwidth/mes  
⚠️ **Menos control**: No podés tunear PostgreSQL directamente

---

## ¿Por qué Tailwind CSS?

### Ventajas
✅ **Utility-first**: Rápido desarrollo sin escribir CSS  
✅ **Tree-shaking**: Solo CSS usado en producción  
✅ **Design system**: Spacing, colors consistentes  
✅ **Responsive**: Mobile-first por default  
✅ **Dark mode**: Built-in support

### Alternativas Consideradas
- **CSS Modules**: Más verboso, más archivos
- **Styled Components**: Runtime overhead, peor performance
- **Chakra UI**: Completo, pero más pesado

### Trade-offs
⚠️ **HTML verboso**: Muchas clases en elementos  
⚠️ **Learning curve**: Memorizar utility classes

---

## ¿Por qué shadcn/ui?

### Ventajas
✅ **Headless**: Basado en Radix UI (accesible)  
✅ **Copy-paste**: No es dependencia, copias el código  
✅ **Customizable**: Full control del código  
✅ **Tailwind-based**: Consistente con styling  
✅ **TypeScript**: Fully typed

### Alternativas Consideradas
- **Material UI**: Pesado, opinionated styling
- **Ant Design**: Excelente para dashboards, pero pesado
- **Chakra UI**: Bueno, pero menos control

### Trade-offs
⚠️ **Mantenimiento manual**: Updates no son automáticos (copiar código nuevo)

---

## ¿Por qué Playwright?

### Ventajas
✅ **Multi-browser**: Chromium, Firefox, WebKit  
✅ **Auto-wait**: No más `sleep()` en tests  
✅ **Inspector**: Debug tests visualmente  
✅ **CI-friendly**: Screenshots, videos, traces  
✅ **TypeScript native**: Excelente DX

### Alternativas Consideradas
- **Cypress**: Excelente, pero solo Chromium-based browsers
- **Selenium**: Viejo, lento, menos features modernas

### Trade-offs
⚠️ **Más lento**: Tests E2E siempre son lentos  
⚠️ **Flaky tests**: A veces fallan por timing

---

## ¿Por qué Vercel?

### Ventajas
✅ **Zero-config**: Push to deploy  
✅ **Edge network**: CDN global automático  
✅ **Preview deploys**: Cada PR tiene su URL  
✅ **Analytics**: Performance metrics built-in  
✅ **Generous free tier**: Hobby projects gratis

### Alternativas Consideradas
- **Netlify**: Similar, pero menos optimizado para Next.js
- **AWS**: Más barato a escala, pero mucho más complejo
- **DigitalOcean**: Más económico, pero más manual

### Trade-offs
⚠️ **Costo a escala**: Puede ser caro con mucho tráfico  
⚠️ **Vendor lock-in parcial**: Optimizado para Vercel

---

## Decisiones de Estado (State Management)

### Elegido: React Server Components + useState

**Razón**:
- 90% de data fetching es Server Components (gratis)
- Estado local con `useState` para interacciones simples
- NO necesitamos Redux/Zustand para este MVP

### Cuándo agregar state management global

Si el proyecto crece y necesitamos:
- Compartir estado entre muchos componentes distantes
- Sincronización compleja de estado
- Offline-first features

**Entonces**: Zustand (simple) o Redux Toolkit (complejo)

---

## Decisiones de Testing

### E2E: Playwright ✅
**Cobertura**: Flujos críticos (login, CRUD casos, notas)

### Unit: NO (por ahora) ⏸️
**Razón**: Server Components no necesitan unit tests tradicionales  
**Cuándo agregar**: Si creamos mucha lógica de negocio en utils/

### Integration: NO (por ahora) ⏸️
**Razón**: Supabase maneja el backend, no hay custom API  
**Cuándo agregar**: Si creamos API routes custom

---

## Límites del MVP

### Performance
- **Usuarios concurrentes**: ~100
- **Casos en sistema**: ~5,000
- **Response time**: < 500ms (dashboard)

### Seguridad
- Auth via Supabase (JWT)
- RLS en todas las tablas
- No hay rate limiting (usar en producción)

### Escalabilidad
- Free tier Supabase: 500MB DB
- Si crecemos: Upgrade a Pro ($25/mo)

---

## Tech Debt Conocido

### 1. No hay caching
**Impacto**: Queries repetidas a Supabase  
**Solución futura**: Redis para queries frecuentes

### 2. No hay monitoring
**Impacto**: No sabemos si hay errores en prod  
**Solución futura**: Sentry + Vercel Analytics

### 3. Testing coverage bajo
**Impacto**: ~20% coverage (solo E2E)  
**Solución futura**: Unit tests con Vitest

### 4. No hay CI/CD formal
**Impacto**: Deploy manual a veces  
**Solución futura**: GitHub Actions con tests automáticos

---

## Roadmap Técnico

### Corto plazo (3 meses)
- [ ] Agregar Sentry para error tracking
- [ ] Aumentar E2E coverage a 80%
- [ ] Implementar rate limiting

### Mediano plazo (6 meses)
- [ ] Redis caching layer
- [ ] Unit tests con Vitest
- [ ] Storybook para componentes

### Largo plazo (12 meses)
- [ ] Multi-tenancy
- [ ] API pública (REST + GraphQL)
- [ ] Mobile app (React Native)

---

## Referencias

- **Next.js Best Practices**: https://nextjs.org/docs/app/building-your-application
- **Supabase Guides**: https://supabase.com/docs/guides
- **TypeScript Patterns**: https://www.typescriptlang.org/docs/handbook/
- **Tailwind Best Practices**: https://tailwindcss.com/docs/reusing-styles

---

**Mantenido por**: Solution Architecture Team  
**Revisión**: Cada 3 meses
