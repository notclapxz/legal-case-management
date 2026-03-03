# Contracts Directory - Sistema de Coordinación Frontend ↔ Backend

**Versión**: 1.0  
**Actualizado**: 26 Enero 2026

---

## ¿Qué son los Contratos?

Los **contratos** son la **única fuente de verdad** para la comunicación entre Frontend y Backend.

**Contrato** = Especificación exacta de:
- Qué endpoints existen
- Qué datos enviar (request)
- Qué datos recibir (response)
- Qué types usar (TypeScript)

---

## 📁 Archivos en este Directorio

### `api-spec.md` - Especificación de APIs
**Dueño**: Backend Engineer  
**Consumidor**: Frontend Engineer

Contiene:
- Todos los endpoints (GET, POST, PUT, DELETE)
- Request body format
- Response body format
- HTTP status codes
- Ejemplos completos

### `types.md` - Types Compartidos
**Dueño**: Backend Engineer  
**Consumidor**: Frontend Engineer

Contiene:
- Interfaces TypeScript compartidas
- Enums (TipoCaso, EstadoCaso, etc.)
- Types de request/response
- Validation schemas (Zod)

---

## 🔄 Workflow de Contratos

### Paso 1: Backend Define Contrato

```
1. Backend lee plan → .agents/plans/03-cases.md
2. Backend define contrato:
   - api-spec.md → Agrega POST /api/v1/casos
   - types.md → Agrega interface Caso
3. Backend implementa → despacho-web/app/dashboard/casos/
4. Backend actualiza context → .agents/contexts/backend.context.md
```

### Paso 2: Frontend Consume Contrato

```
1. Frontend lee contrato:
   - api-spec.md → Ver POST /api/v1/casos
   - types.md → Importar interface Caso
2. Frontend implementa UI → despacho-web/app/dashboard/casos/
3. Frontend actualiza context → .agents/contexts/frontend.context.md
```

---

## ✅ Reglas del Sistema de Contratos

### Regla #1: Backend ES DUEÑO de los Contratos
❌ Frontend NO puede cambiar contratos  
✅ Backend define y mantiene contratos  
✅ Frontend solo lee y consume

### Regla #2: NUNCA Implementar Sin Contrato
❌ Backend NO puede implementar sin definir contrato primero  
✅ Definir contrato → Implementar → Actualizar context

### Regla #3: Cambios Requieren Coordinación
❌ NO cambiar contrato sin avisar  
✅ Documentar cambio en `change-requests.md`  
✅ Coordinar con Frontend antes de breaking changes

### Regla #4: Contratos Son Immutables (Casi)
❌ NO borrar endpoints sin deprecation period  
✅ Agregar nuevos endpoints libremente  
✅ Versionar APIs si hay breaking changes (v1, v2)

---

## 📝 Template para Nuevos Endpoints

### En `api-spec.md`

```markdown
### POST /api/v1/casos

**Descripción**: Crea un nuevo caso legal

**Authentication**: Required (JWT)

**Request**:
```json
{
  "cliente": "string",
  "tipo": "Penal" | "Civil" | "Laboral" | "Administrativo",
  "descripcion": "string"
}
```

**Response (201 Created)**:
```json
{
  "data": {
    "id": "uuid",
    "cliente": "string",
    "tipo": "Penal",
    "created_at": "2026-01-26T10:30:00Z"
  },
  "meta": {
    "message": "Caso creado exitosamente"
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campo 'cliente' es requerido",
    "details": {
      "field": "cliente",
      "issue": "required"
    }
  }
}
```

**Status Codes**:
- `201`: Caso creado exitosamente
- `400`: Datos inválidos
- `401`: No autenticado
- `403`: Sin permisos
- `500`: Error del servidor
```

### En `types.md`

```typescript
export interface Caso {
  id: string
  cliente: string
  tipo: TipoCaso
  descripcion?: string | null
  created_at: string
  updated_at: string
}

export type TipoCaso = 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'

export interface CreateCasoDTO {
  cliente: string
  tipo: TipoCaso
  descripcion?: string
}

export interface CasoResponse {
  data: Caso
  meta?: {
    message: string
  }
}

export interface APIError {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Frontend necesita campo que no existe

**❌ MAL**:
```typescript
// Frontend inventa el campo
const response = await fetch('/api/casos')
const caso = response.data
console.log(caso.email) // ❌ Este campo no está en el contrato!
```

**✅ BIEN**:
1. Frontend documenta en `change-requests.md`
2. Backend evalúa request
3. Backend actualiza contrato si acepta
4. Backend implementa
5. Frontend usa nuevo campo

### Problema 2: Backend cambia response sin avisar

**❌ MAL**:
```typescript
// Backend cambia de:
{ data: { caso: {...} } }
// A:
{ result: { caso: {...} } } // ❌ Breaking change!
```

**✅ BIEN**:
1. Backend documenta breaking change en `api-spec.md`
2. Backend coordina con Frontend
3. Backend crea nuevo endpoint versionado (v2)
4. Frontend migra gradualmente
5. Backend depreca v1 después de grace period

### Problema 3: Types desactualizados

**❌ MAL**:
```typescript
// types.md dice:
interface Caso { cliente: string }

// Pero Backend responde:
{ cliente: null } // ❌ Rompe el contrato!
```

**✅ BIEN**:
1. Backend actualiza `types.md` primero
2. Backend implementa cambio
3. Backend actualiza `backend.context.md`
4. Frontend lee nuevo contrato
5. Frontend ajusta código

---

## 📋 Checklist para Backend

Antes de declarar feature "completa":

- [ ] Endpoint definido en `api-spec.md`
- [ ] Types definidos en `types.md`
- [ ] Request/response formats documentados
- [ ] Status codes listados
- [ ] Ejemplos incluidos
- [ ] `backend.context.md` actualizado con cambios
- [ ] Feature implementada y testeada

---

## 📋 Checklist para Frontend

Antes de implementar feature:

- [ ] Leer `api-spec.md` para endpoint
- [ ] Leer `types.md` para types
- [ ] Importar types correctos
- [ ] Implementar UI según contrato
- [ ] Manejar todos los status codes
- [ ] Actualizar `frontend.context.md`

---

## 🔄 Proceso de Change Requests

### 1. Frontend Necesita Cambio

**Crear**: `change-requests.md`

```markdown
## Request #001: Agregar campo 'email' a Caso

**Solicitado por**: Frontend Engineer  
**Fecha**: 2026-01-26  
**Razón**: Necesitamos mostrar email del cliente en UI

**Cambio propuesto**:
```typescript
interface Caso {
  // ... campos existentes
  email?: string | null // NUEVO
}
```

**Impacto**:
- Backend: Agregar columna a DB
- Frontend: Mostrar email en CasoDetail.tsx
```

### 2. Backend Evalúa

- ✅ Aceptado: Backend implementa y actualiza contratos
- ❌ Rechazado: Backend explica por qué y propone alternativa
- ⏸️ Pendiente: Backend necesita más contexto

### 3. Implementación

Backend actualiza:
1. `api-spec.md` → Documentar nuevo campo
2. `types.md` → Agregar campo al interface
3. Database schema → Agregar columna
4. Implementation → Código real
5. `backend.context.md` → Registrar cambio

---

## 📞 Soporte

**¿Dudas sobre contratos?**  
- Slack: #contracts-support
- Tech Lead: Direct message
- Weekly sync: Miércoles 10am

**¿Reportar inconsistencia?**  
- GitHub Issue con tag `contract-bug`
- Template: `.github/ISSUE_TEMPLATE/contract-bug.md`

---

**Mantenido por**: Backend Engineering Team  
**Revisión**: Semanal  
**Próxima actualización**: Cada feature release
