# 📖 Sistema de Gestión de Despacho Legal - Guía de Documentación

**Versión**: 1.0  
**Última actualización**: 2026-01-22  
**Target**: Equipos de desarrollo, QA, DevOps

---

## 🎯 Propósito de esta Documentación

Esta estructura de documentación está diseñada para guiar a los equipos de desarrollo a través de la transformación del MVP actual del Sistema de Gestión de Despacho Legal en una solución production-ready, escalable y mantenible.

## 🗺️ Mapa de Navegación

### 📋 `/agents/docs/` - Documentación General

#### 📄 [`agents.md`](./docs/agents.md) - **START HERE** 
**Propósito**: Especificación completa del proyecto, stack técnico, y convenciones de código  
**Para quién**: Todo el equipo (desarrolladores, QA, DevOps)  
**Cuándo leer**: Antes de comenzar cualquier trabajo en el proyecto  
**Key takeaways**: Comandos esenciales, patrones de código, schema de BD, estilos

#### 🏗️ [`architecture.md`](./docs/architecture.md)
**Propósito**: Análisis completo de arquitectura actual vs propuesta  
**Para quién**: Arquitectos, desarrolladores senior, Tech Lead  
**Cuándo leer**: Durante la planificación de Fase 1-2  
**Key takeaways**: Critical path, componentes refactorizar, métricas de impacto

#### 📜 [`decisions.md`](./docs/decisions.md)
**Propósito**: Architecture Decision Records (ADRs) para decisiones críticas  
**Para quién**: Arquitectos, desarrolladores senior, stakeholders técnicos  
**Cuándo leer**: Antes de implementar cambios arquitectónicos importantes  
**Key takeaways**: Por qué Zustand vs Redux, Jest vs Vitest, Redis strategy

#### 🔒 [`security.md`](./docs/security.md)
**Propósito**: Políticas y procedimientos de seguridad completos  
**Para quién**: Equipo de desarrollo, DevOps, Security Team  
**Cuándo leer**: ANTES del deployment a producción  
**Key takeaways**: Vulnerabilidades críticas, implementación paso a paso, checklist

#### 🚀 [`deployment.md`](./docs/deployment.md)
**Propósito**: Guía completa de despliegue y operaciones  
**Para quién**: DevOps, SysAdmins, Equipo de desarrollo  
**Cuándo leer**: Antes de configurar CI/CD o producción  
**Key takeaways**: Estrategias de despliegue, rollback procedures, monitoreo

#### 🎨 [`wireframes-testing.md`](./docs/wireframes-testing.md)
**Propósito**: Especificaciones de UI/UX y estrategia de testing  
**Para quién**: Frontend developers, UX/UI designers, QA team  
**Cuándo leer**: Durante desarrollo de nuevas features  
**Key takeaways**: Wireframes requeridos, testing priorities, métricas de calidad

---

### 📈 `/agents/plans/` - Planes de Ejecución

#### 🗓️ [`00_master_plan.md`](./plans/00_master_plan.md) - **CRITICAL**
**Propósito**: Roadmap completo 24 semanas con todas las tareas detalladas  
**Para quién**: Project Manager, Tech Lead, todo el equipo  
**Cuándo leer**: ANTES de comenzar Fase 1  
**Key takeaways**: Critical path, dependencias, KPIs, riesgo assessment

#### 🏗️ [`01_foundation.md`](./plans/01_foundation.md) - **CRITICAL**
**Propósito**: Detalle de Fase 1 (Semanas 1-4) - Estabilización crítica  
**Para quién**: Equipo de desarrollo, QA, DevOps  
**Cuándo leer**: Al inicio del proyecto (Week 1)  
**Key takeaways**: Environment validation, rate limiting, error handling

#### 🗂️ [`02_state_management.md`](./plans/02_state_management.md) - **HIGH**
**Propósito**: Detalle de refactorización de estado a Zustand  
**Para quién**: Frontend developers, Tech Lead  
**Cuándo leer**: Durante Fase 2 (Semanas 5-8)  
**Key takeaways**: Migration strategy, store patterns, testing approach

#### 🧪 [`03_testing.md`](./plans/03_testing.md) - **HIGH**
**Propósito**: Estrategia completa de testing unitario y E2E  
**Para quién**: QA team, Frontend developers, DevOps  
**Cuándo leer**: Durante Fase 2-3 (Semanas 6-10)  
**Key takeaways**: Jest setup, coverage targets, E2E scenarios

#### ⚡ [`04_performance.md`](./plans/04_performance.md) - **MEDIUM**
**Propósito**: Optimización de performance y caching strategy  
**Para quién**: Frontend developers, DevOps, Database administrators  
**Cuándo leer**: Durante Fase 3 (Semanas 13-16)  
**Key takeaways**: Redis implementation, bundle optimization, monitoring

#### 🔐 [`05_security.md`](./plans/05_security.md) - **MEDIUM**
**Propósito**: Implementación de seguridad en producción  
**Para quién**: DevOps, Security team, Backend developers  
**Cuándo leer**: Durante Fase 3-4 (Semanas 15-20)  
**Key takeaways**: Security hardening, audit procedures, incident response

---

### 🔌 `/agents/api/` - Especificaciones de API

#### 📋 [`contracts.md`](./api/contracts.md) - **CRITICAL**
**Propósito**: Especificación completa de endpoints con OpenAPI format  
**Para quién**: Backend developers, Frontend developers, QA team  
**Cuándo leer**: ANTES de desarrollar cualquier API endpoint  
**Key takeaways**: Request/response formats, authentication, error handling

#### 🔐 [`authentication.md`](./api/authentication.md) - **HIGH**
**Propósito**: Flujo completo de autenticación y autorización  
**Para quién**: Backend developers, Frontend developers, Security team  
**Cuándo leer**: Durante implementación de auth features  
**Key takeaways**: JWT flow, session management, refresh tokens

---

### 📊 `/agents/diagrams/` - Diagramas Técnicos

#### 🏗️ [`architecture.mermaid`](./diagrams/architecture.md) - **INCLUDED**
**Propósito**: Diagramas de arquitectura actual vs propuesta  
**Para quién**: Arquitectos, desarrolladores senior, stakeholders  
**Cuándo leer**: Durante planning sessions  
**Key takeaways**: Component relationships, data flow, integration points

#### 🗄️ [`database.mermaid`](./diagrams/database.mermaid) - **NEW**
**Propósito**: Esquema completo de base de datos con relaciones  
**Para quién**: Database administrators, Backend developers  
**Cuándo leer**: Antes de modificar schema o queries  
**Key takeaways**: Table relationships, indexes, constraints

#### 🔗 [`dependencies.mermaid`](./diagrams/dependencies.mermaid) - **INCLUDED**
**Propósito**: DAG completo de dependencias entre tareas  
**Para quién**: Project Manager, Tech Lead, Equipo de desarrollo  
**Cuándo leer**: Durante planificación de sprints  
**Key takeaways**: Critical path, parallel work, blocking tasks

#### 🌊 [`flows.mermaid`](./diagrams/flows.mermaid) - **NEW**
**Propósito**: Flujos de usuario clave del sistema  
**Para quién**: UX designers, QA team, Frontend developers  
**Cuándo leer**: Al diseñar user journeys o E2E tests  
**Key takeaways**: User paths, interaction patterns, edge cases

#### 🚀 [`deployment.mermaid`](./diagrams/deployment.mermaid) - **NEW**
**Propósito**: Pipeline de CI/CD completo  
**Para quién**: DevOps, SysAdmins, Tech Lead  
**Cuándo leer**: Al configurar deployment pipeline  
**Key takeaways**: Build stages, deployment strategy, rollback procedures

---

### ✅ `/agents/tasks/` - Gestión de Tareas

#### 📋 [`kanban.json`](./tasks/kanban.json) - **CURRENT**
**Propósito**: Board de tareas actual para Fase 1 con metadata completa  
**Para quién**: Project Manager, Equipo de desarrollo  
**Cuándo leer**: Daily - para tracking de progreso  
**Key takeaways**: Current tasks, dependencies, assignees, due dates

#### 📝 [`backlog.md`](./tasks/backlog.md) - **NEW**
**Propósito**: Backlog completo y priorizado de todas las fases  
**Para quién**: Project Manager, Product Owner, Stakeholders  
**Cuándo leer**: Durante sprint planning y roadmap review  
**Key takeaways**: All tasks, priorities, effort estimates, business value

#### 🧪 [`testing-priority.md`](./tasks/testing-priority.md) - **NEW**
**Propósito**: Prioridades detalladas de testing por componente y flujo  
**Para quién**: QA team, Frontend developers, Tech Lead  
**Cuándo leer**: Al planificar testing strategy  
**Key takeaways**: Critical components, E2E flows, coverage targets

---

## 🚀 Flujo de Trabajo Recomendado

### Para Nuevo Desarrollo:

1. **Leer agents.md** → Entender stack y convenciones
2. **Revisar architecture.md** → Entender patrones arquitectónicos  
3. **Consultar decisions.md** → Ver ADRs relevantes
4. **Revisar api/contracts.md** → Para endpoints nuevos
5. **Ver kanban.json** → Para tareas actuales

### Para Feature Development:

1. **Leer wireframes-testing.md** → Para UI requirements
2. **Revisar flows.mermaid** → Para user journey
3. **Consultar relevant plan file** → Para fase específica
4. **Ver testing-priority.md** → Para testing requirements

### Para Deployment:

1. **Leer deployment.md** → Para procedures completos
2. **Revisar security.md** → Para checklist de seguridad
3. **Consultar deployment.mermaid** → Para pipeline understanding

### Para Planning:

1. **Revisar 00_master_plan.md** → Para roadmap completo
2. **Consultar backlog.md** → Para todas las tareas
3. **Ver dependencies.mermaid** → Para critical path

---

## 🎯 Roles y Responsabilidades

### 👨‍💻 **Desarrolladores**
**Documentación esencial**: `agents.md`, `architecture.md`, `api/contracts.md`, `decisions.md`
**Focus**: Code patterns, component structure, API integration
**Reading frequency**: Daily reference

### 🏗️ **Arquitectos/Tech Leads**
**Documentación esencial**: `architecture.md`, `decisions.md`, `00_master_plan.md`, `dependencies.mermaid`
**Focus**: Technical decisions, system design, migration strategy
**Reading frequency**: Planning sessions, decision points

### 🧪 **QA Team**
**Documentación esencial**: `wireframes-testing.md`, `testing-priority.md`, `api/contracts.md`, `flows.mermaid`
**Focus**: Test planning, user scenarios, acceptance criteria
**Reading frequency**: Test planning, feature development

### 🚀 **DevOps**
**Documentación esencial**: `deployment.md`, `security.md`, `deployment.mermaid`, `architecture.md`
**Focus**: Infrastructure, deployment, monitoring, security
**Reading frequency**: Setup changes, deployment planning

### 📊 **Project Managers**
**Documentación esencial**: `00_master_plan.md`, `kanban.json`, `backlog.md`, `dependencies.mermaid`
**Focus**: Timeline, resources, dependencies, risk management
**Reading frequency**: Daily tracking, planning sessions

---

## ⚡ Quick Start Guide

### Si eres **NUEVO** en el proyecto:

1. **Día 1**: Leer `agents.md` + `architecture.md`
2. **Día 2**: Revisar `00_master_plan.md` + `kanban.json`
3. **Día 3**: Setup local environment según `agents.md`
4. **Día 4**: Revisar `decisions.md` relevantes + `api/contracts.md`

### Si eres **DEVELOPER** trabajando en feature:

1. **Before coding**: `wireframes-testing.md` + `flows.mermaid`
2. **During development**: `agents.md` + `decisions.md`
3. **Before PR**: `testing-priority.md` + `api/contracts.md`

### Si eres **QA** testeando:

1. **Test planning**: `testing-priority.md` + `flows.mermaid`
2. **Test execution**: `api/contracts.md` + `wireframes-testing.md`
3. **Regression**: `decisions.md` + `architecture.md`

---

## 📞 Soporte y Contribuciones

### Para reportar issues en documentación:
- **GitHub Issues**: Tag con `documentation`
- **Slack**: #docs-support
- **Email**: docs@despacho-legal.com

### Para sugerir mejoras:
- **Pull Requests**: Siguiendo template de contribución
- **Discusiones**: GitHub Discussions para decisiones
- **Reuniones**: Weekly doc review (Miercoles 10am)

### Para preguntas urgentes:
- **Tech Lead**: Direct message
- **Architecture Team**: Weekly office hours (Jueves 2-4pm)
- **DevOps**: #infrastructure Slack channel

---

## 📈 Métricas de Documentación

### **Coverage Goals**:
- **Documentación técnica**: 95% de componentes/features cubiertas
- **API Documentation**: 100% de endpoints documentados
- **User Flows**: 100% de flujos críticos diagramados
- **Decision Records**: 100% de decisiones arquitectónicas documentadas

### **Quality Metrics**:
- **Actualización**: Todos los documentos actualizados en últimas 2 semanas
- **Accesibilidad**: Documentos accesibles via múltiples canales
- **Usabilidad**: Tiempo promedio para encontrar información < 2 minutos
- **Feedback**: NPS de documentación > 8/10

---

**Documentación mantenido por**: Solution Architecture Team  
**Última revisión**: 2026-01-22  
**Próxima actualización**: 2026-02-22  
**Versión**: 1.0