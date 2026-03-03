# .agents/ - Central de Documentación del Proyecto

**Sistema de Gestión de Despacho Legal**  
**Versión**: 1.0  
**Última actualización**: 26 Enero 2026

---

## 🎯 ¿Qué es esta carpeta?

Esta es la **fuente única de verdad** para todo el equipo de ingeniería. Aquí encontrarás:
- Arquitectura del sistema
- Contratos entre Frontend y Backend
- Planes de ejecución por fase
- Contextos actualizados de cada agente
- Guías para ingenieros

---

## 📁 Estructura de Directorios

```
.agents/
├── README.md                    # ← EMPEZÁ ACÁ
├── architecture/                # Arquitectura y decisiones técnicas
│   ├── overview.md             # Diseño del sistema
│   ├── decisions.md            # ADRs (Architecture Decision Records)
│   └── tech-considerations.md  # Stack tecnológico y justificación
├── contracts/                   # Contratos Frontend ↔ Backend
│   ├── README.md               # Cómo usar contratos
│   ├── api-spec.md             # Especificación de endpoints
│   └── types.md                # TypeScript types compartidos
├── contexts/                    # Estado actual de cada agente
│   ├── architect.context.md    # Context del Arquitecto
│   ├── frontend.context.md     # Context del Frontend Engineer
│   └── backend.context.md      # Context del Backend Engineer
├── guides/                      # Guías para ingenieros
│   ├── frontend-guide.md       # Guía para Frontend
│   └── backend-guide.md        # Guía para Backend
├── plans/                       # Planes de ejecución secuenciales
│   ├── 00-master.md            # Plan maestro completo
│   ├── 01-foundation.md        # Fase 1: Foundation
│   ├── 02-auth.md              # Fase 2: Authentication
│   └── 03-module-X.md          # Fase 3: Módulos
├── diagrams/                    # Diagramas técnicos (Mermaid)
│   ├── architecture.mermaid    # Arquitectura del sistema
│   ├── database.mermaid        # Schema de base de datos
│   ├── dependencies.mermaid    # DAG de dependencias
│   └── flows.mermaid           # Flujos de usuario
├── docs/                        # Documentación general
│   ├── architecture.md         # Arquitectura detallada
│   ├── decisions.md            # Decisiones técnicas
│   ├── security.md             # Políticas de seguridad
│   ├── deployment.md           # Guía de deployment
│   └── wireframes-testing.md   # Wireframes y testing
├── api/                         # Especificaciones de API
│   └── contracts.md            # Contratos de endpoints
└── tasks/                       # Gestión de tareas
    ├── kanban.json             # Board actual de tareas
    └── backlog.md              # Backlog priorizado
```

---

## 🚀 Quick Start

### 👨‍💻 Si sos Frontend Engineer

1. **Leer primero**:
   - `guides/frontend-guide.md` - Tu guía principal
   - `contracts/README.md` - Cómo usar contratos
   - `contracts/api-spec.md` - APIs disponibles
   - `contracts/types.md` - Types compartidos

2. **Workflow diario**:
   - Leer `plans/XX-module.md` → Saber qué hacer
   - Leer `contracts/api-spec.md` → Ver APIs del Backend
   - Implementar feature en `/despacho-web/app`
   - Actualizar `contexts/frontend.context.md` → Registrar progreso

3. **Antes de hacer PR**:
   - `npm run lint` debe pasar (0 errors)
   - `npm run build` debe compilar
   - Actualizar `contexts/frontend.context.md`

### 👨‍💻 Si sos Backend Engineer

1. **Leer primero**:
   - `guides/backend-guide.md` - Tu guía principal
   - `contracts/README.md` - Cómo definir contratos
   - `architecture/overview.md` - Entender el sistema

2. **Workflow diario**:
   - Leer `plans/XX-module.md` → Saber qué implementar
   - Definir contrato en `contracts/api-spec.md` + `contracts/types.md`
   - Implementar en `/despacho-web` (Server Actions o API routes)
   - Actualizar `contexts/backend.context.md` → Registrar cambios

3. **Regla de oro**:
   - **NUNCA implementes sin definir el contrato primero**
   - Frontend depende de que actualices `contracts/`

### 🏗️ Si sos Arquitecto/Tech Lead

1. **Leer primero**:
   - `architecture/overview.md` - Sistema completo
   - `plans/00-master.md` - Roadmap de 24 semanas
   - `architecture/decisions.md` - ADRs

2. **Responsabilidades**:
   - Crear planes en `plans/`
   - Documentar decisiones en `architecture/decisions.md`
   - Coordinar Frontend y Backend via `contracts/`
   - Actualizar `contexts/architect.context.md`

---

## 📋 Sistema de Contratos

**Los contratos son el corazón de la coordinación Frontend ↔ Backend.**

### Workflow de Contratos

```
1. Backend lee plan → plans/03-cases.md
2. Backend define contrato → contracts/api-spec.md + types.md
3. Backend implementa feature → despacho-web/app/api/ o Server Actions
4. Backend actualiza context → contexts/backend.context.md
5. Frontend lee contrato → contracts/api-spec.md + types.md
6. Frontend implementa UI → despacho-web/app/dashboard/
7. Frontend actualiza context → contexts/frontend.context.md
```

### Reglas de Contratos

✅ **Backend ES DUEÑO de los contratos**  
✅ **Frontend CONSUME los contratos**  
✅ **Nunca cambiar contrato sin coordinación**  
✅ **Actualizar contracts/ antes de implementar**

---

## 📝 Sistema de Contextos

Cada agente mantiene su archivo de contexto para trackear progreso.

### `contexts/architect.context.md`
- Fase actual del proyecto
- Decisiones arquitectónicas
- Blockers del equipo
- Next steps

### `contexts/frontend.context.md`
- Tareas completadas
- Trabajo en progreso
- Blockers técnicos
- Decisiones de implementación

### `contexts/backend.context.md`
- Endpoints implementados
- Contratos actualizados
- Blockers técnicos
- Decisiones de implementación

**Actualizar después de cada tarea significativa.**

---

## 🗺️ Navegación por Rol

### Frontend Engineer
```
START: guides/frontend-guide.md
├─→ contracts/api-spec.md (APIs)
├─→ contracts/types.md (Types)
├─→ plans/XX-module.md (Tasks)
└─→ contexts/frontend.context.md (Update)
```

### Backend Engineer
```
START: guides/backend-guide.md
├─→ plans/XX-module.md (Requirements)
├─→ contracts/api-spec.md (Define APIs)
├─→ contracts/types.md (Define types)
└─→ contexts/backend.context.md (Update)
```

### Arquitecto
```
START: architecture/overview.md
├─→ plans/00-master.md (Roadmap)
├─→ architecture/decisions.md (ADRs)
├─→ contexts/architect.context.md (Coordination)
└─→ diagrams/ (Visualizations)
```

---

## 🔧 Tech Stack (Source of Truth)

**Frontend**: Next.js 16.1.2 + React 19 + TypeScript (strict)  
**Backend**: Supabase (PostgreSQL + Auth + Realtime)  
**Styling**: Tailwind CSS 3.4 + shadcn/ui  
**State**: React Server Components (preferred) + Client Components when needed  
**Testing**: Playwright (E2E)  
**Deployment**: Vercel  

---

## 📚 Documentación Adicional

### En `/docs` (root)
- `docs/INGENIEROS-GUIA.md` - Onboarding para ingenieros
- `docs/database/DOCUMENTACION_BD.md` - Schema de BD
- `docs/architecture/ARQUITECTURA-ACTUAL.md` - Arquitectura legacy

### En `/despacho-web` (working directory)
- `despacho-web/AGENTS.md` - Comandos y convenciones de código
- `despacho-web/lib/types/database.ts` - **SOURCE OF TRUTH** para types

---

## ⚠️ Reglas Importantes

1. **AGENTS.md es la guía de código** → Leer antes de codear
2. **Contracts son source of truth** → Backend define, Frontend consume
3. **Contexts deben actualizarse** → Después de cada tarea
4. **Plans son secuenciales** → Seguir el orden
5. **No cambiar contratos sin avisar** → Coordinación es clave

---

## 🆘 ¿Perdido?

**Si sos nuevo**: Leer `guides/frontend-guide.md` o `guides/backend-guide.md`  
**Si necesitás APIs**: Ver `contracts/api-spec.md`  
**Si necesitás types**: Ver `contracts/types.md`  
**Si tenés dudas de arquitectura**: Ver `architecture/overview.md`  
**Si no sabés qué hacer**: Ver `plans/00-master.md`

---

**Mantenido por**: Solution Architecture Team  
**Próxima revisión**: Cada 2 semanas  
**Feedback**: Abrir issue en GitHub con tag `documentation`
