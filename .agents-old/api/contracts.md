# API Contracts - Sistema de Gestión de Despacho Legal

**Version**: 1.0  
**Last Updated**: 2026-01-22  
**Target**: Frontend Developers, Backend Developers, QA Team

---

## 🎯 API Overview

Este documento especifica todos los endpoints de la API del Sistema de Gestión de Despacho Legal, incluyendo formatos de request/response, autenticación, error handling y ejemplos de uso.

### Base URL

| Environment | Base URL |
|-------------|-----------|
| Development | `http://localhost:3000/api` |
| Staging | `https://staging.despacho-legal.com/api` |
| Production | `https://app.despacho-legal.com/api` |

### API Versioning

- **Current Version**: v1
- **Version Strategy**: URL Path (`/api/v1/...`)
- **Backward Compatibility**: Supported for 1 major version
- **Deprecation Policy**: 6 months notice before removal

---

## 🔐 Authentication & Authorization

### Authentication Methods

All endpoints (except `/auth/login`) require authentication using JWT tokens obtained from Supabase Auth.

```typescript
// Request Headers
{
  "Authorization": "Bearer <supabase_jwt_token>",
  "Content-Type": "application/json",
  "X-API-Version": "v1"
}
```

### Authorization Levels

| Role | Permissions | Description |
|------|-------------|-------------|
| `Admin` | Full access | All operations including user management |
| `Abogado` | Case management | Full case and client access |
| `Asistente` | Limited access | Read-only access to assigned cases |

### Token Validation

```typescript
// Middleware example
export async function validateAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  
  if (!token) {
    throw new AuthError('Missing authorization token', 401)
  }
  
  const { data: user, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new AuthError('Invalid or expired token', 401)
  }
  
  return user
}
```

---

## 📋 Standard Response Format

### Success Response

```typescript
interface ApiResponse<T> {
  success: true
  data: T
  message?: string
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
    requestId: string
  }
}

interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
```

### Error Response

```typescript
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
    timestamp: string
    requestId: string
  }
}
```

### HTTP Status Codes

| Status | Description | Usage |
|--------|-------------|-------|
| 200 | OK | Successful GET/PUT/DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no body |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Authentication required/failed |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🏢 Authentication Endpoints

### POST `/api/auth/login`

Authenticate user and return JWT token.

**Request:**
```typescript
interface LoginRequest {
  email: string
  password: string
}
```

**Response:**
```typescript
interface LoginResponse {
  user: {
    id: string
    email: string
    nombre_completo: string
    rol: 'Admin' | 'Abogado' | 'Asistente'
    activo: boolean
  }
  session: {
    access_token: string
    refresh_token: string
    expires_at: string
  }
}
```

**Example:**
```bash
curl -X POST https://app.despacho-legal.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "abogado@despacho.com",
    "password": "securepassword123"
  }'
```

### POST `/api/auth/refresh`

Refresh JWT token using refresh token.

**Request:**
```typescript
interface RefreshRequest {
  refresh_token: string
}
```

### POST `/api/auth/logout`

Invalidate current session.

**Request:**
```typescript
// No body required, uses Authorization header
```

---

## 📁 Casos (Cases) Endpoints

### GET `/api/v1/casos`

Get list of cases with pagination and filtering.

**Query Parameters:**
```
page?: number = 1
pageSize?: number = 20
search?: string
tipo?: 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
estado?: 'Activo' | 'Inactivo'
carpeta_id?: string
abogado_asignado_id?: string
sort_by?: 'created_at' | 'cliente' | 'fecha_inicio'
sort_order?: 'asc' | 'desc'
```

**Response:**
```typescript
interface CasosResponse {
  success: true
  data: {
    casos: Array<{
      id: string
      codigo_estimado: string
      cliente: string
      patrocinado?: string
      tipo: string
      estado: string
      estado_caso?: string
      created_at: string
      updated_at: string
      abogado?: {
        id: string
        nombre_completo: string
        email: string
      }
      carpeta?: {
        id: string
        nombre: string
        color: string
      }
      _count: {
        notas: number
        eventos: number
        pagos: number
      }
    }>
  }
  meta: PaginationMeta
}
```

**Example:**
```bash
curl -X GET "https://app.despacho-legal.com/api/v1/casos?page=1&pageSize=10&tipo=Penal&sort_by=created_at&sort_order=desc" \
  -H "Authorization: Bearer <token>"
```

### GET `/api/v1/casos/{id}`

Get detailed information about a specific case.

**Response:**
```typescript
interface CasoDetailResponse {
  success: true
  data: {
    id: string
    codigo_estimado: string
    cliente: string
    patrocinado?: string
    descripcion?: string
    expediente?: string
    tipo: string
    etapa?: string
    estado: string
    estado_caso?: string
    forma_pago?: string
    monto_total?: number
    monto_cobrado?: number
    monto_pendiente?: number
    ubicacion_fisica?: string
    fecha_inicio?: string
    created_at: string
    updated_at: string
    abogado?: Profile
    created_by?: Profile
    carpeta?: Carpeta
    notas?: Nota[]
    eventos?: Evento[]
    pagos?: Pago[]
  }
}
```

### POST `/api/v1/casos`

Create a new case.

**Request:**
```typescript
interface CreateCasoRequest {
  cliente: string
  patrocinado?: string
  tipo: 'Penal' | 'Civil' | 'Laboral' | 'Administrativo'
  descripcion?: string
  expediente?: string
  etapa?: string
  forma_pago?: 'Por hora' | 'Por etapas' | 'Monto fijo' | 'Cuota litis'
  monto_total?: number
  ubicacion_fisica?: string
  fecha_inicio?: string
  abogado_asignado_id?: string
  carpeta_id?: string
}
```

**Response:**
```typescript
interface CreateCasoResponse {
  success: true
  data: {
    id: string
    codigo_estimado: string
    created_at: string
    updated_at: string
  }
}
```

### PUT `/api/v1/casos/{id}`

Update an existing case.

**Request:**
```typescript
interface UpdateCasoRequest {
  cliente?: string
  patrocinado?: string
  descripcion?: string
  expediente?: string
  etapa?: string
  estado?: 'Activo' | 'Inactivo'
  estado_caso?: string
  forma_pago?: string
  monto_total?: number
  monto_cobrado?: number
  ubicacion_fisica?: string
  fecha_inicio?: string
  abogado_asignado_id?: string
  carpeta_id?: string
}
```

### DELETE `/api/v1/casos/{id}`

Delete a case (soft delete by changing estado to 'Inactivo').

---

## 📝 Notas (Notes) Endpoints

### GET `/api/v1/casos/{caso_id}/notas`

Get all notes for a specific case.

**Query Parameters:**
```
page?: number = 1
pageSize?: number = 20
categoria?: 'General' | 'Urgente' | 'Legal' | 'Administrativa' | 'Financiera'
prioridad?: 'Alta' | 'Media' | 'Baja'
completado?: boolean
```

**Response:**
```typescript
interface NotasResponse {
  success: true
  data: {
    notas: Array<{
      id: string
      contenido: string
      categoria: string
      prioridad: string
      fecha_recordatorio?: string
      completado: boolean
      created_at: string
      updated_at: string
      created_by?: Profile
    }>
  }
  meta: PaginationMeta
}
```

### POST `/api/v1/casos/{caso_id}/notas`

Create a new note for a case.

**Request:**
```typescript
interface CreateNotaRequest {
  contenido: string
  categoria?: 'General' | 'Urgente' | 'Legal' | 'Administrativa' | 'Financiera'
  prioridad?: 'Alta' | 'Media' | 'Baja'
  fecha_recordatorio?: string
}
```

### PUT `/api/v1/notas/{id}`

Update an existing note.

### DELETE `/api/v1/notas/{id}`

Delete a note.

---

## 📅 Eventos (Events) Endpoints

### GET `/api/v1/casos/{caso_id}/eventos`

Get all events for a specific case.

**Query Parameters:**
```
page?: number = 1
pageSize?: number = 20
tipo?: 'Audiencia' | 'Plazo' | 'Reunión' | 'Otro'
completado?: boolean
start_date?: string
end_date?: string
```

**Response:**
```typescript
interface EventosResponse {
  success: true
  data: {
    eventos: Array<{
      id: string
      tipo: string
      titulo: string
      descripcion?: string
      fecha_evento: string
      ubicacion?: string
      completado: boolean
      alerta_7_dias: boolean
      alerta_3_dias: boolean
      alerta_1_dia: boolean
      alerta_dia_evento: boolean
      created_at: string
      updated_at: string
      created_by?: Profile
    }>
  }
  meta: PaginationMeta
}
```

### POST `/api/v1/casos/{caso_id}/eventos`

Create a new event for a case.

**Request:**
```typescript
interface CreateEventoRequest {
  tipo: 'Audiencia' | 'Plazo' | 'Reunión' | 'Otro'
  titulo: string
  descripcion?: string
  fecha_evento: string
  ubicacion?: string
  alerta_7_dias?: boolean
  alerta_3_dias?: boolean
  alerta_1_dia?: boolean
  alerta_dia_evento?: boolean
}
```

---

## 💰 Pagos (Payments) Endpoints

### GET `/api/v1/casos/{caso_id}/pagos`

Get all payments for a specific case.

**Query Parameters:**
```
page?: number = 1
pageSize?: number = 20
metodo_pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Otro'
start_date?: string
end_date?: string
```

**Response:**
```typescript
interface PagosResponse {
  success: true
  data: {
    pagos: Array<{
      id: string
      monto: number
      fecha_pago: string
      concepto?: string
      metodo_pago?: string
      notas?: string
      created_at: string
      created_by?: Profile
    }>
    resumen: {
      total_cobrado: number
      total_pendiente: number
      cantidad_pagos: number
    }
  }
  meta: PaginationMeta
}
```

### POST `/api/v1/casos/{caso_id}/pagos`

Create a new payment for a case.

**Request:**
```typescript
interface CreatePagoRequest {
  monto: number
  fecha_pago: string
  concepto?: string
  metodo_pago?: 'Efectivo' | 'Transferencia' | 'Cheque' | 'Tarjeta' | 'Otro'
  notas?: string
}
```

---

## 📁 Carpetas (Folders) Endpoints

### GET `/api/v1/carpetas`

Get all folders in hierarchical structure.

**Query Parameters:**
```
parent_id?: string
include_children?: boolean = true
include_count?: boolean = true
```

**Response:**
```typescript
interface CarpetasResponse {
  success: true
  data: {
    carpetas: Array<{
      id: string
      nombre: string
      descripcion?: string
      color?: string
      icono?: string
      carpeta_padre_id?: string
      orden?: number
      created_at: string
      updated_at: string
      created_by?: Profile
      children?: Array<Carpeta>
      total_casos?: number
      casos_directos?: number
    }>
  }
}
```

### POST `/api/v1/carpetas`

Create a new folder.

**Request:**
```typescript
interface CreateCarpetaRequest {
  nombre: string
  descripcion?: string
  color?: string
  icono?: string
  carpeta_padre_id?: string
  orden?: number
}
```

---

## 👤 Users & Profiles Endpoints

### GET `/api/v1/profiles/me`

Get current user's profile information.

**Response:**
```typescript
interface ProfileResponse {
  success: true
  data: {
    id: string
    username: string
    email: string
    nombre_completo?: string
    rol: 'Admin' | 'Abogado' | 'Asistente'
    activo: boolean
    created_at: string
    updated_at: string
    statistics?: {
      casos_asignados: number
      casos_creados: number
      total_casos: number
    }
  }
}
```

### PUT `/api/v1/profiles/me`

Update current user's profile.

**Request:**
```typescript
interface UpdateProfileRequest {
  nombre_completo?: string
  email?: string
}
```

---

## 🔍 Search Endpoints

### GET `/api/v1/search`

Global search across cases, notes, and events.

**Query Parameters:**
```
q: string (required)
type?: 'casos' | 'notas' | 'eventos' | 'all' = 'all'
page?: number = 1
pageSize?: number = 20
```

**Response:**
```typescript
interface SearchResponse {
  success: true
  data: {
    query: string
    results: {
      casos?: Array<SearchResult<Caso>>
      notas?: Array<SearchResult<Nota>>
      eventos?: Array<SearchResult<Evento>>
    }
    total_results: number
  }
  meta: PaginationMeta
}

interface SearchResult<T> {
  id: string
  title: string
  content: string
  type: string
  score: number
  highlights: string[]
  data: T
}
```

---

## 📊 Dashboard & Analytics Endpoints

### GET `/api/v1/dashboard/metrics`

Get dashboard metrics and KPIs.

**Query Parameters:**
```
period?: '7d' | '30d' | '90d' | '1y' = '30d'
```

**Response:**
```typescript
interface DashboardMetricsResponse {
  success: true
  data: {
    resumen: {
      total_casos: number
      casos_activos: number
      casos_ganados: number
      casos_perdidos: number
    }
    finanzas: {
      total_facturado: number
      total_cobrado: number
      total_pendiente: number
      ingresos_mes_actual: number
    }
    eventos: {
      proximos_7_dias: number
      vencidos: number
      completados_mes: number
    }
    actividad: {
      casos_creados_semana: number
      notas_creadas_semana: number
      pagos_registrados_semana: number
    }
  }
}
```

### GET `/api/v1/analytics/casos`

Get detailed case analytics.

**Query Parameters:**
```
start_date?: string
end_date?: string
group_by?: 'mes' | 'trimestre' | 'año' | 'tipo' | 'estado'
```

---

## 🚨 Error Codes Reference

| Code | Description | HTTP Status | Example |
|------|-------------|-------------|---------|
| `VALIDATION_ERROR` | Request validation failed | 400 | Invalid email format |
| `UNAUTHORIZED` | Authentication required/failed | 401 | Invalid or expired token |
| `FORBIDDEN` | Insufficient permissions | 403 | User cannot access this case |
| `NOT_FOUND` | Resource not found | 404 | Case with ID not found |
| `CONFLICT` | Resource conflict | 409 | Duplicate email address |
| `RATE_LIMITED` | Too many requests | 429 | 100 requests per minute exceeded |
| `INTERNAL_ERROR` | Server error | 500 | Database connection failed |
| `SERVICE_UNAVAILABLE` | External service unavailable | 503 | Supabase is down |

---

## 🧪 Testing Examples

### Using curl

```bash
# Login
LOGIN_RESPONSE=$(curl -s -X POST https://staging.despacho-legal.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@despacho.com", "password": "test123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.session.access_token')

# Get cases
curl -X GET "https://staging.despacho-legal.com/api/v1/casos?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Create case
curl -X POST https://staging.despacho-legal.com/api/v1/casos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Juan Pérez Test",
    "tipo": "Penal",
    "descripcion": "Caso de prueba automatizado"
  }'
```

### Using JavaScript/TypeScript

```typescript
// API client example
class DespachoAPI {
  private baseURL: string
  private token: string

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL
    this.token = token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    return response.json()
  }

  async getCasos(params?: CasosParams): Promise<CasosResponse> {
    const query = new URLSearchParams(params as any).toString()
    const endpoint = `/api/v1/casos${query ? `?${query}` : ''}`
    return this.request<CasosResponse>(endpoint)
  }

  async createCaso(data: CreateCasoRequest): Promise<CreateCasoResponse> {
    return this.request<CreateCasoResponse>('/api/v1/casos', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getCaso(id: string): Promise<CasoDetailResponse> {
    return this.request<CasoDetailResponse>(`/api/v1/casos/${id}`)
  }

  async createNota(casoId: string, data: CreateNotaRequest): Promise<CreateNotaResponse> {
    return this.request<CreateNotaResponse>(`/api/v1/casos/${casoId}/notas`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

// Usage example
const api = new DespachoAPI('https://app.despacho-legal.com', token)

// Get cases
const casos = await api.getCasos({ 
  page: 1, 
  pageSize: 10, 
  tipo: 'Penal' 
})

// Create case
const nuevoCaso = await api.createCaso({
  cliente: 'María González',
  tipo: 'Civil',
  descripcion: 'Caso de divorcio'
})
```

---

## 📚 OpenAPI Specification

### OpenAPI 3.0 Schema

```yaml
openapi: 3.0.0
info:
  title: Sistema de Gestión de Despacho Legal API
  version: 1.0.0
  description: API para el sistema de gestión de casos legales
  contact:
    name: API Support
    email: api@despacho-legal.com
  license:
    name: Private
servers:
  - url: https://app.despacho-legal.com/api/v1
    description: Production server
  - url: https://staging.despacho-legal.com/api/v1
    description: Staging server
  - url: http://localhost:3000/api/v1
    description: Development server

security:
  - bearerAuth: []

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Caso:
      type: object
      required:
        - id
        - codigo_estimado
        - cliente
        - tipo
        - estado
      properties:
        id:
          type: string
          format: uuid
        codigo_estimado:
          type: string
        cliente:
          type: string
        patrocinado:
          type: string
        descripcion:
          type: string
        tipo:
          type: string
          enum: [Penal, Civil, Laboral, Administrativo]
        estado:
          type: string
          enum: [Activo, Inactivo]

paths:
  /casos:
    get:
      summary: Get list of cases
      security:
        - bearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CasosResponse'
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

---

## 🔄 API Versioning Strategy

### Version 1.0 (Current)
- Basic CRUD operations for cases, notes, events, payments
- JWT authentication via Supabase
- Pagination and filtering
- Basic search functionality

### Version 1.1 (Planned)
- Advanced filtering and search
- Bulk operations
- Export functionality
- Real-time notifications

### Version 2.0 (Future)
- GraphQL support
- Advanced analytics
- Webhook support
- Multi-tenant support

---

## 📞 API Support

### Support Channels
- **Email**: api-support@despacho-legal.com
- **Slack**: #api-support
- **Documentation**: https://docs.despacho-legal.com/api
- **Status Page**: https://status.despacho-legal.com

### SLA Commitments
- **API Uptime**: 99.9%
- **Response Time**: < 200ms (95th percentile)
- **Error Rate**: < 1%
- **Incident Response**: < 15 minutes for critical issues

---

**API Maintainers**: Backend Development Team  
**Last Updated**: 2026-01-22  
**Next Review**: 2026-02-22  
**Version**: 1.0