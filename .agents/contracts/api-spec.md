# API Specification

**Proyecto**: Sistema de Gestión de Despacho Legal  
**Versión**: 1.0  
**Última actualización**: 26 Enero 2026  
**Base URL**: `http://localhost:3000` (dev), `https://despacho.vercel.app` (prod)

---

## ⚠️ IMPORTANTE

Este archivo es la **única fuente de verdad** para APIs.

**Backend Engineer**: Actualizar ANTES de implementar  
**Frontend Engineer**: Leer ANTES de consumir

---

## Authentication

Todos los endpoints protegidos requieren autenticación via Supabase JWT.

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Obtener token**: Supabase SDK maneja automáticamente (via cookies)

---

## Response Format Standard

### Success Response

```json
{
  "data": {
    // ... datos del recurso
  },
  "meta": {
    "message": "Operación exitosa",
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error",
    "details": {
      "field": "campo_invalido",
      "issue": "valor no permitido"
    }
  }
}
```

---

## Status Codes

- **200 OK**: Operación exitosa (GET, PUT, DELETE)
- **201 Created**: Recurso creado exitosamente (POST)
- **400 Bad Request**: Datos inválidos
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: Sin permisos
- **404 Not Found**: Recurso no existe
- **500 Internal Server Error**: Error del servidor

---

## Endpoints

### Authentication

#### POST /auth/login
**Status**: ✅ Implemented (Supabase Auth)

**Description**: Autenticar usuario

**Request**:
```json
{
  "email": "admin@despacho.com",
  "password": "securepassword123"
}
```

**Response (200)**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@despacho.com",
      "created_at": "2026-01-26T10:30:00Z"
    },
    "session": {
      "access_token": "eyJxxx...",
      "refresh_token": "eyJxxx...",
      "expires_at": 1706352000
    }
  }
}
```

---

### Casos (Cases)

#### GET /api/v1/casos
**Status**: ✅ Implemented (Server Component)

**Description**: Listar todos los casos del usuario

**Authentication**: Required

**Query Parameters**:
- `page` (optional): Número de página (default: 1)
- `per_page` (optional): Items por página (default: 20, max: 100)
- `tipo` (optional): Filtrar por tipo de caso
- `estado` (optional): Filtrar por estado
- `search` (optional): Búsqueda por cliente o descripción

**Example**:
```
GET /api/v1/casos?page=1&per_page=20&tipo=Penal&search=Juan
```

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "codigo_estimado": "CASO-2026-001",
      "cliente": "Juan Pérez",
      "patrocinado": "María López",
      "tipo": "Penal",
      "estado": "Activo",
      "estado_caso": "En proceso",
      "descripcion": "Caso de defensa penal",
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-20T14:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

---

#### GET /api/v1/casos/:id
**Status**: ✅ Implemented (Server Component)

**Description**: Obtener detalle de un caso

**Authentication**: Required

**Response (200)**:
```json
{
  "data": {
    "id": "uuid",
    "codigo_estimado": "CASO-2026-001",
    "cliente": "Juan Pérez",
    "patrocinado": "María López",
    "tipo": "Penal",
    "estado": "Activo",
    "estado_caso": "En proceso",
    "descripcion": "Caso de defensa penal",
    "expediente": "EXP-12345",
    "etapa": "Preliminar",
    "forma_pago": "Monto fijo",
    "monto_total": 50000.00,
    "monto_cobrado": 25000.00,
    "ubicacion_fisica": "Archivo A - Fila 1",
    "fecha_inicio": "2026-01-15",
    "created_at": "2026-01-15T10:00:00Z",
    "updated_at": "2026-01-20T14:30:00Z",
    "abogado_asignado": {
      "id": "uuid",
      "email": "abogado@despacho.com",
      "full_name": "Dr. Carlos García"
    }
  }
}
```

**Response (404)**:
```json
{
  "error": {
    "code": "CASO_NOT_FOUND",
    "message": "El caso no existe o no tienes permisos para verlo"
  }
}
```

---

#### POST /api/v1/casos
**Status**: ✅ Implemented (Server Action `createCaso`)

**Description**: Crear un nuevo caso

**Authentication**: Required

**Request**:
```json
{
  "cliente": "Juan Pérez",
  "patrocinado": "María López",
  "tipo": "Penal",
  "descripcion": "Caso de defensa penal",
  "expediente": "EXP-12345",
  "etapa": "Preliminar",
  "forma_pago": "Monto fijo",
  "monto_total": 50000.00,
  "fecha_inicio": "2026-01-15",
  "ubicacion_fisica": "Archivo A - Fila 1"
}
```

**Required fields**:
- `cliente` (string, min 1 char)
- `tipo` (enum: "Penal" | "Civil" | "Laboral" | "Administrativo")

**Optional fields**:
- `patrocinado` (string)
- `descripcion` (string)
- `expediente` (string)
- `etapa` (string)
- `forma_pago` (enum)
- `monto_total` (number)
- `fecha_inicio` (string, format: YYYY-MM-DD)
- `ubicacion_fisica` (string)

**Response (201)**:
```json
{
  "data": {
    "id": "uuid",
    "codigo_estimado": "CASO-2026-002",
    "cliente": "Juan Pérez",
    "tipo": "Penal",
    // ... otros campos
    "created_at": "2026-01-26T15:00:00Z"
  },
  "meta": {
    "message": "Caso creado exitosamente"
  }
}
```

**Response (400)**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos inválidos",
    "details": {
      "cliente": "Campo requerido",
      "tipo": "Debe ser uno de: Penal, Civil, Laboral, Administrativo"
    }
  }
}
```

---

#### PUT /api/v1/casos/:id
**Status**: 🚧 In Progress (Server Action `updateCaso`)

**Description**: Actualizar un caso existente

**Authentication**: Required

**Request**:
```json
{
  "cliente": "Juan Pérez Actualizado",
  "descripcion": "Descripción actualizada",
  "estado_caso": "Ganado"
}
```

**Note**: Solo enviar campos a actualizar (partial update)

**Response (200)**:
```json
{
  "data": {
    "id": "uuid",
    "cliente": "Juan Pérez Actualizado",
    // ... campos actualizados
    "updated_at": "2026-01-26T16:00:00Z"
  },
  "meta": {
    "message": "Caso actualizado exitosamente"
  }
}
```

**Response (403)**:
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permisos para actualizar este caso"
  }
}
```

---

#### DELETE /api/v1/casos/:id
**Status**: ⏸️ Pending

**Description**: Eliminar un caso (soft delete)

**Authentication**: Required

**Response (200)**:
```json
{
  "meta": {
    "message": "Caso eliminado exitosamente"
  }
}
```

---

### Notas (Notes)

#### GET /api/v1/casos/:caso_id/notas
**Status**: ⏸️ Pending

**Description**: Listar notas de un caso

**Authentication**: Required

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "caso_id": "uuid",
      "titulo": "Primera reunión",
      "contenido": "<p>Contenido en HTML</p>",
      "categoria": "General",
      "created_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

---

### Agenda (Calendar)

#### GET /api/v1/eventos
**Status**: ⏸️ Pending

**Description**: Listar eventos del calendario

**Authentication**: Required

**Query Parameters**:
- `start_date` (required): Fecha inicio (YYYY-MM-DD)
- `end_date` (required): Fecha fin (YYYY-MM-DD)

**Response (200)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "titulo": "Audiencia Caso #123",
      "tipo": "Audiencia",
      "fecha": "2026-01-30",
      "hora": "10:00:00",
      "caso_id": "uuid",
      "notas": "Traer documentos X e Y"
    }
  ]
}
```

---

## Backend Engineer Checklist

Antes de declarar endpoint "implemented":

- [ ] Endpoint definido en este archivo con ejemplos completos
- [ ] Types definidos en `contracts/types.md`
- [ ] Authentication implementado
- [ ] Input validation implementado
- [ ] Error handling con try/catch
- [ ] RLS policies configuradas (si aplica)
- [ ] Tested manualmente con diferentes casos
- [ ] `backend.context.md` actualizado

---

## Frontend Engineer Checklist

Antes de consumir endpoint:

- [ ] Leer especificación completa en este archivo
- [ ] Importar types de `contracts/types.md`
- [ ] Manejar todos los status codes posibles
- [ ] Implementar loading states
- [ ] Implementar error states
- [ ] Llamar `router.refresh()` después de mutations
- [ ] `frontend.context.md` actualizado

---

## Change Log

### 2026-01-26
- ✅ Agregado GET /casos
- ✅ Agregado GET /casos/:id
- ✅ Agregado POST /casos
- 🚧 PUT /casos/:id en progreso

### 2026-01-22
- ✅ Creado este archivo (api-spec.md)
- ✅ Definido formato de response standard

---

**Mantenido por**: Backend Engineering Team  
**Revisión**: Después de cada feature release  
**¿Cambios?**: Documentar en este archivo ANTES de implementar
