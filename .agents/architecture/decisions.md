# Architecture Decision Records (ADRs)

**Repository**: Sistema de Gestión de Despacho Legal  
**Maintainers**: Solution Architecture Team  
**Last Updated**: 2026-01-22

---

## ADR-001: Migración a Zustand para Estado Global

**Date**: 2026-01-22  
**Status**: Accepted  
**Deciders**: CTO, Lead Developer, Solution Architect

### Context

El sistema actual tiene un manejo de estado fragmentado con múltiples ContextProviders sin centralización:

- SidebarContext para estado de UI
- useState local分散 en componentes
- Props drilling excesivo entre componentes
- Dificultad para debugging y testing
- Performance issues por re-renders innecesarios

### Decision

Migrar a **Zustand** como solución de estado global centralizado:

1. **Crear un único appStore** con Zustand
2. **Centralizar todo el estado global** en el store
3. **Implementar slices de estado** por dominio (UI, datos, preferencias)
4. **Mantener estado local** solo para UI transitorio
5. **Integrar DevTools** para debugging

```typescript
// lib/stores/appStore.ts
import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'

interface AppState {
  sidebar: SidebarState
  casos: CasosState  
  notas: NotasState
  preferences: PreferencesState
}

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      sidebar: { isCollapsed: false, isMobile: false },
      casos: { data: [], loading: false, error: null },
      notas: { active: {}, editing: null },
      preferences: { theme: 'light', language: 'es' },
      
      // Actions para mutar estado
      toggleSidebar: () => set(state => ({
        sidebar: { ...state.sidebar, isCollapsed: !state.sidebar.isCollapsed }
      })),
      
      setCasos: (casos) => set(state => ({
        casos: { ...state.casos, data: casos, loading: false }
      })),
      
      // ... más actions
    })),
    { name: 'app-store' }
  )
)
```

### Consequences

**Positive**:
- Estado centralizado y predecible
- Eliminación de props drilling
- Performance mejorada con selectores granulares
- Debugging más fácil con DevTools
- Testing más sencillo con store mocking
- Type safety mejorado

**Negative**:
- Curva de aprendizaje para equipo
- Adicional dependency Zustand
- Requiere refactorización de componentes existentes
- Testing strategy necesita adaptación

**Neutral**:
- Mismo tamaño de bundle (+7KB gzipped)
- Mantenibilidad de código mejorada
- Desarrollo más rápido a largo plazo

### Alternatives Considered

1. **Redux Toolkit**: Complejo para tamaño actual del proyecto
2. **Context API + useReducer**: Verbose para state complejo
3. **Jotai**: Menos documentación y community adoption
4. **Valtio**: similar a Zustand pero con diferentes trade-offs

**Chosen**: Zustand por su simplicidad, performance y excelente TypeScript support.

---

## ADR-002: Implementación de Error Boundaries Centralizados

**Date**: 2026-01-22  
**Status**: Accepted  
**Deciders**: Lead Developer, Solution Architect

### Context

El manejo de errores actual es inconsistente y problemático:

- Try/catch blocks dispersos sin estrategia unificada
- Pérdida de contexto del error original
- Sin logging estructurado para debugging
- Error states no manejados consistentemente en UI
- Dificultad para tracking de errores en producción

### Decision

Implementar **Error Boundaries con sistema jerárquico**:

1. **Root Error Boundary** en app/layout.tsx
2. **Feature-specific boundaries** para módulos críticos
3. **Component Error Boundary** reutilizable
4. **Integration con Sentry** para tracking
5. **Structured logging** para debugging

```typescript
// app/components/ErrorBoundary.tsx
'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { logger } from '@/lib/utils/logger'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<Props, { hasError: boolean; error?: Error }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to structured logger
    logger.error('React Error Boundary', { 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    })

    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })

    // Custom error handler
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return (
        <FallbackComponent 
          error={this.state.error!} 
          reset={() => this.setState({ hasError: false, error: undefined })}
        />
      )
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error Inesperado</h2>
        <p className="text-gray-600 mb-4">Ha ocurrido un error inesperado.</p>
        <details className="mb-4">
          <summary className="text-sm text-gray-500 cursor-pointer">Detalles técnicos</summary>
          <pre className="text-xs text-gray-400 mt-2 overflow-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
```

### Consequences

**Positive**:
- Error handling consistente en toda la aplicación
- Mejor experiencia de usuario con graceful degradation
- Tracking completo de errores para debugging
- React errors no crashean la aplicación completa
- Más fácil debugging con contexto adicional

**Negative**:
- Complejidad adicional en componente hierarchy
- Requires testing de error boundaries
- Performance overhead mínimo (~1-2%)
- Learning curve para equipo

**Neutral**:
- More robust system overall
- Better developer experience
- Improved system reliability

### Alternatives Considered

1. **Manual try/catch everywhere**: Code duplication, inconsistent
2. **React Query error boundaries**: Limited to async operations
3. **Custom error handling system**: More development effort
4. **No error boundaries**: Unacceptable for production

**Chosen**: React Error Boundaries con Sentry integration por robustez y ecosystem support.

---

## ADR-003: Estrategia de Caching con Redis

**Date**: 2026-01-22  
**Status**: Accepted  
**Deciders**: CTO, DevOps Engineer, Solution Architect

### Context

El sistema actual sufre de performance issues debido a:

- Queries repetitivas a Supabase sin caché
- Estado de datos compartido recargado constantemente
- No hay estrategia de caché para datos frecuentes
- Response times inconsistent (200ms-2s)
- Server load innecesario en operations de lectura

### Decision

Implementar **multi-layer caching strategy con Redis**:

1. **Application Layer Cache** (Redis) para datos de negocio
2. **Query-level caching** para resultados de base de datos
3. **Session-based caching** para datos de usuario
4. **Cache invalidation** estratégica basada en eventos
5. **Fallback mechanism** cuando Redis no está disponible

```typescript
// lib/cache/redis.ts
import Redis from 'ioredis'

interface CacheConfig {
  ttl: number // Time to live in seconds
  namespace: string // Key prefix
}

class CacheService {
  private redis: Redis
  private fallbackCache = new Map<string, { data: any; expiry: number }>()
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })
  }

  async get<T>(key: string, config: CacheConfig): Promise<T | null> {
    const fullKey = `${config.namespace}:${key}`
    
    try {
      const value = await this.redis.get(fullKey)
      return value ? JSON.parse(value) : null
    } catch (error) {
      // Fallback to memory cache
      return this.getFallback<T>(fullKey)
    }
  }

  async set<T>(key: string, value: T, config: CacheConfig): Promise<void> {
    const fullKey = `${config.namespace}:${key}`
    
    try {
      await this.redis.setex(
        fullKey, 
        config.ttl, 
        JSON.stringify(value)
      )
    } catch (error) {
      // Fallback to memory cache
      this.setFallback(fullKey, value, config.ttl)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`*${pattern}*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      // Clear fallback cache
      this.clearFallback(pattern)
    }
  }

  // Private fallback methods...
  private getFallback<T>(key: string): T | null {
    const cached = this.fallbackCache.get(key)
    if (cached && Date.now() < cached.expiry) {
      return cached.data
    }
    this.fallbackCache.delete(key)
    return null
  }

  private setFallback<T>(key: string, value: T, ttl: number): void {
    this.fallbackCache.set(key, {
      data: value,
      expiry: Date.now() + (ttl * 1000)
    })
  }
}

export const cache = new CacheService()

// Cache configurations
export const CacheConfig = {
  casos: { ttl: 300, namespace: 'casos' }, // 5 minutes
  notas: { ttl: 600, namespace: 'notas' }, // 10 minutes
  eventos: { ttl: 1800, namespace: 'eventos' }, // 30 minutes
  userSession: { ttl: 3600, namespace: 'session' }, // 1 hour
} as const
```

### Consequences

**Positive**:
- Response times mejorados 60-80%
- Reducción de load en base de datos
- Mejor用户体验 con datos rápidos
- Escalabilidad mejorada para más usuarios
- Offline capability básica con fallback

**Negative**:
- Complejidad adicional en infraestructura
- Redis como dependency crítica
- Cache invalidation complexity
- Memory overhead para fallback cache
- Cost adicional de Redis hosting

**Neutral**:
- Requires monitoring y maintenance
- Team necesita aprender cache patterns
- Development complexity aumenta

### Alternatives Considered

1. **In-memory cache only**: Lost on restart, no shared state
2. **Database query cache**: Limited flexibility, database dependent
3. **CDN caching**: Not suitable for dynamic data
4. **No caching**: Unacceptable performance

**Chosen**: Redis con fallback por balance de performance, reliability, y complexity management.

---

## ADR-004: Testing Strategy con Jest vs Vitest

**Date**: 2026-01-22  
**Status**: Accepted  
**Deciders**: Lead Developer, QA Engineer, Solution Architect

### Context

El proyecto actualmente tiene solo E2E tests con Playwright, faltando testing comprehensivo:

- No unit tests para components y utilities
- No integration tests para API y database
- Coverage desconocido
- Testing development experience poor
- Dificultad para debugging y refactoring

### Decision

Adoptar **Jest + React Testing Library** como estrategia principal de testing:

1. **Jest** como test runner principal
2. **React Testing Library** para component testing
3. **MSW** para API mocking
4. **Jest-DOM** para DOM assertions extendidas
5. **Coverage reporting** con threshold enforcement

```typescript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/index.ts',
    '!lib/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'app/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
}

module.exports = createJestConfig(customJestConfig)

// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './__tests__/mocks/server'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  })),
}))

// Start MSW server
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Consequences

**Positive**:
- Testing coverage comprehensivo
- Developer experience mejorada
- Refactoring seguro con tests
- CI/CD puede validar calidad
- Debugging más fácil con buen error messages
- Industry standard con gran community

**Negative**:
- Setup complexity inicial
- Learning curve para equipo
- Additional dependency bundle
- Maintenance overhead para tests
- Development time inicial aumenta

**Neutral**:
- Code quality mejorada
- Confidence en cambios
- Documentation mejorada via tests
- Onboarding más fácil con tests como examples

### Alternatives Considered

1. **Vitest**: Más rápido pero menos maduro, smaller community
2. **Testing Library + Cypress**: Similar a E2E, not for unit testing
3. **Mocha + Chai**: More setup required, less opinionated
4. **No unit testing**: Unacceptable para production code

**Chosen**: Jest por maturity, Next.js integration, ecosystem support, y team familiarity.

---

## ADR-005: Rate Limiting con Upstash Redis

**Date**: 2026-01-22  
**Status**: Accepted  
**Deciders**: CTO, DevOps Engineer, Security Engineer

### Context

El sistema necesita protección contra abuse y sobrecarga:

- APIs sin rate limiting exposed
- Risk de DDoS attacks
- Server sobrecarga potencial
- No hay granular control por endpoint
- Need for different limits por user type

### Decision

Implementar **rate limiting con Upstash Redis** como edge solution:

1. **Edge-rate limiting** con Upstash Redis
2. **Different limits** por endpoint y user type
3. **Sliding window** algorithm para accurate limiting
4. **Headers estándar** (X-RateLimit-*)
5. **Fallback handling** when service unavailable

```typescript
// lib/rate-limit/upstash.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Rate limiters por tipo de endpoint
export const ratelimits = {
  // Auth endpoints - muy restrictivo
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 requests por minuto
    analytics: true,
    prefix: 'rl:auth:',
  }),
  
  // API generales - moderado
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests por minuto
    analytics: true,
    prefix: 'rl:api:',
  }),
  
  // Page views - generoso
  pages: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '60 s'), // 1000 requests por minuto
    analytics: true,
    prefix: 'rl:pages:',
  }),
  
  // Upload endpoints - muy restrictivo
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '300 s'), // 3 requests por 5 minutos
    analytics: true,
    prefix: 'rl:upload:',
  }),
}

// Middleware helper
export async function checkRateLimit(
  identifier: string,
  type: keyof typeof ratelimits
) {
  try {
    const { success, limit, remaining, reset } = await ratelimits[type].limit(identifier)
    
    return {
      success,
      limit,
      remaining,
      reset,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(reset).toISOString(),
      }
    }
  } catch (error) {
    // Fallback: permitir todo si rate limiting service está down
    console.error('Rate limiting error:', error)
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: 0,
      headers: {}
    }
  }
}

// Usage in middleware
export async function rateLimitMiddleware(request: Request) {
  const url = new URL(request.url)
  const identifier = request.ip || 'anonymous'
  
  let rateLimitType: keyof typeof ratelimits = 'pages'
  
  if (url.pathname.startsWith('/api/auth')) {
    rateLimitType = 'auth'
  } else if (url.pathname.startsWith('/api/')) {
    rateLimitType = 'api'
  } else if (url.pathname.startsWith('/api/upload')) {
    rateLimitType = 'upload'
  }
  
  const rateLimit = await checkRateLimit(identifier, rateLimitType)
  
  if (!rateLimit.success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        ...rateLimit.headers,
        'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
      }
    })
  }
  
  return { headers: rateLimit.headers }
}
```

### Consequences

**Positive**:
- Protection contra DDoS y abuse
- Granular control por endpoint
- Server resource protection
- Analytics sobre usage patterns
- Standardized rate limiting headers
- Edge performance con Upstash

**Negative**:
- Additional dependency cost
- Complexity en middleware
- Rate limiting service como SPOF
- Need for error handling when service down
- Configuration overhead

**Neutral**:
- Better system reliability
- Protection cost justified
- Monitoring requirements
- User experience impact (rate limited requests)

### Alternatives Considered

1. **In-memory rate limiting**: Not distributed, reset on restart
2. **Database rate limiting**: Performance overhead, database load
3. **Cloudflare rate limiting**: Less granular control, vendor lock-in
4. **Custom Redis setup**: More infrastructure management required

**Chosen**: Upstash Redis por edge performance, minimal infrastructure, granular control, y good developer experience.

---

## 📋 ADR Template

```markdown
# ADR-XXX: [Decision Title]

**Date**: YYYY-MM-DD  
**Status**: [Accepted/Rejected/Superseded]  
**Deciders**: [List of decision makers]

### Context
[What is the issue we're trying to solve?]

### Decision
[What is the change we're making?]

### Consequences
[What becomes easier or harder as a result?]

### Alternatives Considered
[What other options did we evaluate?]
```

---

## 🔄 ADR Process

1. **Proposal**: Create ADR with context and alternatives
2. **Review**: Technical team reviews proposal
3. **Decision**: Stakeholders approve/reject decision
4. **Implementation**: Execute according to ADR
5. **Review**: ADR effectiveness assessed after implementation

---

## 📊 ADR Status Summary

| ADR | Status | Implementation Date | Review Date |
|-----|--------|-------------------|-------------|
| ADR-001 | Accepted | 2026-02-01 | 2026-03-01 |
| ADR-002 | Accepted | 2026-02-05 | 2026-03-05 |
| ADR-003 | Accepted | 2026-02-10 | 2026-03-10 |
| ADR-004 | Accepted | 2026-02-15 | 2026-03-15 |
| ADR-005 | Accepted | 2026-02-20 | 2026-03-20 |

---

**Next Review**: 2026-02-22  
**Maintainers**: Solution Architecture Team