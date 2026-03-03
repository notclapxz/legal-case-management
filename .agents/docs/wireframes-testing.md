# Wireframe Requirements & Testing Priorities

**Version**: 1.0  
**Last Updated**: 2026-01-22  
**Author**: UX & Testing Team

---

## ⚠️ WIREFRAME REQUIRED: Dashboard Principal

**Must include:**
- Header con logo del despacho, usuario logueado y notificaciones
- Sidebar navegación con menú jerárquico (Casos, Agenda, Reportes)
- Área principal con cards de métricas:
  * Casos activos (con icono y color)
  * Eventos próximos (3 días)
  * Alertas críticas (rojo/naranja/amarillo)
  * Búsqueda flotante integrada
- Breadcrumbs para navegación actual
- Footer con información de versión y soporte

**Estados a mostrar:**
- Vacío: Sin datos iniciales
- Loading: Skeleton loaders para todas las métricas
- Error: Mensaje de error con retry button
- Con datos: Métricas completas con interacciones

**Responsive considerations:**
- Mobile: Sidebar colapsado, cards apilados verticalmente
- Tablet: Sidebar reducido, grid 2 columnas para métricas  
- Desktop: Sidebar completo, grid 3-4 columnas

**Components needed:**
- `shadcn/ui`: Card, Badge, Button, Input, Skeleton
- Custom: MetricCard, NotificationDropdown, FloatingSearch
- Layout: DashboardLayout, Sidebar, Header

**Priority**: CRITICAL  
**Blocking**: Dashboard implementation (Fase 1, Semana 3)

---

## ⚠️ WIREFRAME REQUIRED: Sistema de Casos

**Must include:**
- Header con botones "Nuevo Caso" y filtros avanzados
- Vista de carpetas jerárquicas con drag & drop
- Lista de casos con columns:
  * Código estimado
  * Cliente/Patrocinado
  * Tipo de caso (con badge de color)
  * Estado actual
  * Próximo evento (con countdown)
  * Acciones rápidas (ver, editar, archivar)
- Panel de búsqueda con filtros por tipo, estado, carpeta
- Modo vista: Cards vs Tabla
- Paginación con información de resultados

**Estados a mostrar:**
- Vacío: "No hay casos, crea el primero"
- Loading: Skeleton rows para casos
- Búsqueda: Resultados con highlight de términos
- Error: Error de carga con opción de reintentar
- Con datos: Lista interactiva con hover states

**Responsive considerations:**
- Mobile: Lista simplificada, swipe actions, filters en modal
- Tablet: 2-columnas para información del caso
- Desktop: Vista completa con todos los detalles

**Components needed:**
- `shadcn/ui`: Table, Card, Button, Badge, Input, Select
- Custom: CasoCard, CarpetaTree, DragDropContainer, FilterPanel
- Features: Drag & Drop, Virtual Scrolling, Infinite Scroll

**Priority**: CRITICAL  
**Blocking**: Casos module implementation (Fase 1, Semana 4)

---

## ⚠️ WIREFRAME REQUIRED: Sistema de Notas (Apple Notes Style)

**Must include:**
- Layout dividido: Sidebar izquierdo + Editor derecho
- **Sidebar:**
  * Lista de notas con título y preview
  * Botón "Nueva Nota" flotante
  * Búsqueda instantánea en notas
  * Categorías con iconos y colores
  * Indicadores de prioridad (Alta/Media/Baja)
- **Editor:**
  * Título editable inline
  * Rich text editor con toolbar
  * Soporte para imágenes arrastrables
  * Botón de exportación a PowerPoint
  * Timestamp de última modificación
  * Botones de guardado/auto-save indicator

**Estados a mostrar:**
- Sin notas: "Crea tu primera nota"
- Editor vacío: Placeholder text + toolbar
- Loading: Skeleton en sidebar, spinner en editor
- Error: Error de guardado con opción de recuperar
- Con datos: Notas cargadas, editor funcional

**Responsive considerations:**
- Mobile: Sidebar oculto behind button, editor full-width
- Tablet: Sidebar colapsable, editor optimizado
- Desktop: Split view 30/70, drag images entre paneles

**Components needed:**
- `shadcn/ui`: Input, Button, ScrollArea, Separator
- Custom: NotaSidebar, RichTextEditor, DraggableImage, ExportButton
- Features: Auto-save, Image Resize, Text Formatting

**Priority**: HIGH  
**Blocking**: Notas system implementation (Fase 2, Semana 6)

---

## ⚠️ WIREFRAME REQUIRED: Formulario de Creación de Casos

**Must include:**
- Multi-step wizard con progreso indicator
- **Paso 1: Información Básica**
  * Cliente (autocomplete con búsqueda)
  * Patrocinado (opcional)
  * Tipo de caso (dropdown con iconos)
  * Descripción del caso
  * Número de expediente
- **Paso 2: Información Financiera**  
  * Forma de pago (selector visual)
  * Monto total (con validación)
  * Configuración según forma de pago:
    - Por hora: tarifa, horas estimadas
    - Por etapas: lista de etapas con montos
    - Monto fijo: monto único
    - Cuota litis: porcentaje y monto base
  * Banner de privacidad para datos financieros
- **Paso 3: Ubicación y Fechas**
  * Ubicación física (selector de carpetas)
  * Fecha de inicio
  * Asignación de abogado (opcional)
- Actions: Guardar borrador, Vista previa, Crear caso

**Estados a mostrar:**
- Validación errors inline
- Loading en cada paso
- Preview del caso antes de crear
- Confirmación después de crear

**Responsive considerations:**
- Mobile: Steps como tabs bottom navigation
- Tablet: 2-column layout para forms largos
- Desktop: Full wizard con sidebar navigation

**Components needed:**
- `shadcn/ui`: Form, Input, Select, Button, Card, Progress
- Custom: WizardStep, MetodoPagoForm, CarpetaSelector, PreviewCard
- Validation: Real-time validation con Zod

**Priority**: HIGH  
**Blocking**: Casos creation flow (Fase 1, Semana 4)

---

## ⚠️ WIREFRAME REQUIRED: Sistema de Agenda/Calendario

**Must include:**
- Vista de calendario mensual con eventos marcados
- Vista semanal con timeline detallado
- Vista diaria con slots de tiempo
- Sidebar con filtros:
  * Tipos de eventos (audiencia, plazo, reunión)
  * Abogados asignados
  * Estados (completado, pendiente)
- Botón "Nuevo Evento" con modal rápido
- Sistema de alertas visuales:
  * Eventos de hoy (rojo)
  * Próximos 3 días (naranja)  
  * Esta semana (amarillo)
- Drag & drop para reprogramar eventos

**Estados a mostrar:**
- Calendario vacío: "No hay eventos programados"
- Loading: Skeleton calendar
- Evento creation modal
- Event details modal con acciones

**Responsive considerations:**
- Mobile: Vista diaria por defecto, swipe para cambiar día
- Tablet: Vista semanal con sidebar colapsable
- Desktop: Vista mensual con detalles al hover

**Components needed:**
- `shadcn/ui`: Calendar, Button, Modal, Badge, Select
- Custom: EventCalendar, TimelineView, EventModal, AlertBadge
- Features: Drag & Drop, Recurring Events, Notifications

**Priority**: MEDIUM  
**Blocking**: Agenda implementation (Fase 2, Semana 8)

---

## ⚠️ WIREFRAME REQUIRED: Sistema de Pagos

**Must include:**
- Dashboard financiero con resumen:
  * Total cobrado vs pendiente
  * Gráfica de pagos por mes
  * Casos con pagos atrasados
- Lista de pagos con columns:
  * Fecha de pago
  * Caso asociado
  * Monto (formateado)
  * Método de pago (con iconos)
  * Estado (confirmado, pendiente)
- Botón "Registrar Pago" con modal
- Filtros por rango de fechas, casos, método
- Exportación a Excel/CSV

**Estados a mostrar:**
- Sin pagos: "No hay pagos registrados"
- Loading payments: Skeleton rows
- Payment form con validación
- Success confirmation

**Responsive considerations:**
- Mobile: Cards verticales para cada pago
- Tablet: Tabla simplificada con swipe actions  
- Desktop: Vista completa con charts detallados

**Components needed:**
- `shadcn/ui`: Table, Card, Button, Input, Select, Badge
- Custom: PaymentChart, PaymentForm, MetodoPagoIcon
- Charts: Recharts para visualizaciones financieras

**Priority**: MEDIUM  
**Blocking**: Pagos system (Fase 2, Semana 7)

---

## 🧪 TESTING PRIORITIES

### TOP 10 COMPONENTS CRÍTICOS PARA UNIT TESTS

1. **CasoCard Component** 🔴 **CRITICAL**
   - **Por qué**: Core de la UI principal, usado en listados
   - **Riesgo**: Display incorrecto de datos, broken links
   - **Tests**: Renderizado con props, click handlers, badge variants
   - **Coverage objetivo**: 95%

2. **Sidebar Navigation** 🔴 **CRITICAL**
   - **Por qué**: Navegación principal de toda la app
   - **Riesgo**: Broken navigation, responsive failures
   - **Tests**: Navigation flow, mobile toggle, active states
   - **Coverage objetivo**: 90%

3. **Auth Forms (Login/Signup)** 🔴 **CRITICAL**
   - **Por qué**: Entry point, security sensitive
   - **Riesgo**: Security bypass, UX failures
   - **Tests**: Form validation, error handling, success flows
   - **Coverage objetivo**: 100%

4. **NotasEditor (Rich Text)** 🟡 **HIGH**
   - **Por qué**: Funcionalidad complex, drag & drop
   - **Riesgo**: Data loss, broken editor, image handling
   - **Tests**: Text formatting, image upload, auto-save
   - **Coverage objetivo**: 85%

5. **CasoForm (Multi-step)** 🟡 **HIGH**
   - **Por qué**: Complex form con validación
   - **Riesgo**: Data validation errors, broken wizard
   - **Tests**: Step navigation, form validation, data flow
   - **Coverage objetivo**: 90%

6. **Dashboard Metrics** 🟡 **HIGH**
   - **Por qué**: Landing page, performance critical
   - **Riesgo**: Wrong data display, loading states
   - **Tests**: Data fetching, loading, error states
   - **Coverage objetivo**: 85%

7. **RateLimiting Middleware** 🔴 **CRITICAL**
   - **Por qué**: Security infrastructure
   - **Riesgo**: Security bypass, performance issues
   - **Tests**: Rate limiting logic, header setting, fallback
   - **Coverage objetivo**: 100%

8. **Input Validation Layer** 🔴 **CRITICAL**
   - **Por qué**: Security & data integrity
   - **Riesgo**: Injection attacks, data corruption
   - **Tests**: Schema validation, sanitization, error messages
   - **Coverage objetivo**: 100%

9. **Supabase Client Wrapper** 🟡 **HIGH**
   - **Por qué**: Data layer, error handling
   - **Riesgo**: Connection failures, data leakage
   - **Tests**: Query building, error handling, retry logic
   - **Coverage objetivo**: 90%

10. **ErrorBoundary Component** 🔴 **CRITICAL**
    - **Por qué**: Error handling infrastructure
    - **Riesgo**: Unhandled errors, poor UX
    - **Tests**: Error catching, fallback rendering, logging
    - **Coverage objetivo**: 95%

### TOP 5 FLUJOS E2E CRÍTICOS

1. **Authentication Flow** 🔴 **CRITICAL**
   - **Path**: Login → Dashboard → Logout
   - **Riesgo**: Broken authentication, security bypass
   - **Tests**: Valid/invalid credentials, session persistence, logout
   - **Browsers**: Chrome, Firefox, Safari
   - **Devices**: Desktop, Tablet, Mobile

2. **Case Creation Complete Flow** 🔴 **CRITICAL**
   - **Path**: New Case → Form Steps → Dashboard → Case Detail
   - **Riesgo**: Data loss, validation failures, broken workflow
   - **Tests**: Complete wizard, form validation, data persistence
   - **Edge Cases**: Network errors, refresh mid-form, validation errors

3. **Notas Creation & Management** 🟡 **HIGH**
   - **Path**: Caso Detail → Notas → Create → Edit → Export
   - **Riesgo**: Data corruption, broken editor, export failures
   - **Tests**: Rich text editing, image upload, auto-save, PowerPoint export
   - **Edge Cases**: Large content, concurrent editing, network issues

4. **Search & Filtering System** 🟡 **HIGH**
   - **Path**: Dashboard → Search → Filters → Results → Detail
   - **Riesgo**: Wrong results, performance issues, broken filters
   - **Tests**: Search accuracy, filter combinations, performance under load
   - **Edge Cases**: Empty results, special characters, large datasets

5. **Payment Registration Flow** 🟡 **HIGH**
   - **Path**: Caso Detail → Pagos → Register → Dashboard Update
   - **Riesgo**: Financial data errors, calculation mistakes
   - **Tests**: Payment form, validation, dashboard updates, financial calculations
   - **Edge Cases**: Invalid amounts, edge payment methods, concurrent payments

---

## 📊 TESTING METRICS & ACCEPTANCE CRITERIA

### Unit Testing Acceptance Criteria

**Coverage Requirements:**
- **Critical Components**: >95% coverage
- **High Priority**: >90% coverage  
- **Medium Priority**: >80% coverage
- **Low Priority**: >70% coverage

**Quality Gates:**
- All tests must pass in CI/CD
- No console errors in test runs
- Test execution time < 30 seconds
- Memory usage stable across test runs

**Test Categories:**
- **Rendering Tests**: Component renders with props
- **Interaction Tests**: User interactions work correctly
- **State Tests**: Component state changes as expected
- **Accessibility Tests**: ARIA labels, keyboard navigation
- **Performance Tests**: Render time, re-render optimization

### E2E Testing Acceptance Criteria

**Performance Requirements:**
- Page load time < 3 seconds
- Navigation response < 1 second
- Form submission < 2 seconds
- Search results < 500ms

**Cross-Browser Requirements:**
- Chrome (latest): 100% functionality
- Firefox (latest): 100% functionality  
- Safari (latest): 95% functionality
- Mobile browsers: 90% functionality

**Device Requirements:**
- Desktop (1920x1080): Full functionality
- Tablet (768x1024): Core functionality
- Mobile (375x667): Essential functionality

### Integration Testing Requirements

**API Integration:**
- All API endpoints respond correctly
- Error handling works for all failure scenarios
- Rate limiting functions as expected
- Authentication flow works end-to-end

**Database Integration:**
- CRUD operations work correctly
- Data validation enforced at database level
- Transactions rollback on errors
- Performance meets requirements under load

---

## 🛠️ TESTING INFRASTRUCTURE SETUP

### Local Testing Environment

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev @playwright/test
npm install --save-dev @testing-library/user-event

# Environment variables for testing
echo "NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321" >> .env.test
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key" >> .env.test
```

### Test Data Management

```typescript
// __tests__/fixtures/casos.ts
export const mockCasos = [
  {
    id: '1',
    cliente: 'Juan Pérez',
    tipo: 'Penal',
    estado: 'Activo',
    created_at: '2024-01-15T10:00:00Z'
  },
  // ... more test data
]

// __tests__/helpers/database.ts
export async function setupTestDatabase() {
  // Clear test data
  // Insert test fixtures
  // Return test client
}
```

### Visual Regression Testing Setup

```typescript
// __tests__/visual/visual.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox', 
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
})
```

---

## 📋 TESTING CHECKLISTS

### Pre-Commit Testing Checklist
- [ ] Unit tests pass locally (100% success rate)
- [ ] Component tests coverage meets requirements
- [ ] Linting passes with 0 errors
- [ ] TypeScript compilation successful
- [ ] No console errors or warnings
- [ ] Performance budgets not exceeded

### Pre-Deployment Testing Checklist  
- [ ] All unit tests pass in CI/CD
- [ ] E2E tests pass on all browsers
- [ ] Integration tests with real database
- [ ] Performance tests meet requirements
- [ ] Security tests pass vulnerability scan
- [ ] Accessibility tests meet WCAG 2.1 AA

### Post-Deployment Testing Checklist
- [ ] Smoke tests on production environment
- [ ] Core user journeys functional
- [ ] Monitoring shows no critical errors
- [ ] Performance metrics within acceptable range
- [ ] User feedback collection active
- [ ] Rollback plan tested and documented

---

## 🚀 CONTINUOUS TESTING STRATEGY

### Automated Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Testing Pipeline

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  component-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:component

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
```

### Testing Schedule

**Daily (Automated):**
- Unit tests on every commit
- Component tests on PR
- E2E tests on main branch

**Weekly (Manual):**
- Cross-browser testing
- Mobile device testing
- Performance testing

**Monthly (Manual):**
- Accessibility audit
- Security penetration testing
- User acceptance testing

---

**Last Updated**: 2026-01-22  
**Testing Team**: QA & Frontend Teams  
**Next Review**: 2026-02-22