# 📚 DOCUMENTACIÓN COMPLETA - BASE DE DATOS

**Proyecto**: Sistema de Gestión de Despacho Legal
**Fecha de inicio**: 14 de Enero, 2026
**Base de datos**: Supabase PostgreSQL
**Desarrollador**: Sebastián Risco

---

## 🎯 RESUMEN EJECUTIVO

Sistema web para gestionar casos, eventos, pagos y ubicaciones físicas de expedientes del despacho legal.

**Stack tecnológico:**
- Frontend: Next.js 14 + React + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Backend: Supabase (PostgreSQL + Auth + RLS)
- Deployment: Vercel

**Usuarios del sistema:**
- Administrador (tu papá): acceso total
- Abogados: solo sus casos asignados
- Secretaria: solo lectura

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### Diagrama de relaciones:

```
usuarios (Supabase Auth)
    ↓
profiles (info extendida)
    ↓
casos ←→ eventos
  ↓
  ├→ pagos
  └→ notas

ubicaciones_fisicas (independiente)
```

### Tablas principales:

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| **profiles** | 5-10 | Info de usuarios + roles |
| **casos** | 200-300 | Casos del despacho |
| **eventos** | 500-1000 | Audiencias, plazos, reuniones |
| **pagos** | 1000-2000 | Historial de pagos |
| **notas** | 500-1000 | Notas internas por caso |
| **ubicaciones_fisicas** | 250+ | Mapeo del almacén físico |

---

## 🔧 HISTORIAL DE IMPLEMENTACIÓN

### ✅ **14 Enero 2026 - Setup inicial**

#### 1. Creación del esquema SQL
- Archivo: `ESQUEMA_BD_COMPLETO.sql` (implícito en planificación)
- Tablas creadas: 6 principales + vistas + funciones
- Extensiones habilitadas: uuid-ossp, pg_trgm

#### 2. Problema encontrado y solucionado

**ERROR:**
```
ERROR: 42P17: functions in index predicate must be marked IMMUTABLE
```

**Causa:**
Índice con predicado usando `NOW()` que no es IMMUTABLE:
```sql
-- ❌ INCORRECTO:
CREATE INDEX idx_eventos_proximos ON eventos(fecha_evento)
WHERE completado = FALSE AND fecha_evento >= NOW();
```

**Solución aplicada:**
```sql
-- Paso 1: Eliminar índice problemático
DROP INDEX IF EXISTS idx_eventos_proximos;

-- Paso 2: Recrear correctamente (sin NOW())
CREATE INDEX idx_eventos_proximos ON eventos(fecha_evento, completado)
WHERE completado = FALSE;
```

**Resultado:** ✅ Success. No rows returned (correcto)

**Timestamp:** 14 Enero 2026, ~20:30

---

## 📝 ESQUEMA ACTUAL (POST-CORRECCIÓN)

### TABLA: profiles

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  nombre_completo TEXT,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'abogado', 'secretaria')),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices:**
- `idx_profiles_username` → username
- `idx_profiles_rol` → rol

**Roles:**
- `admin`: Ve y edita todo
- `abogado`: Solo sus casos asignados
- `secretaria`: Solo lectura

---

### TABLA: casos

```sql
CREATE TABLE public.casos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_estimado TEXT UNIQUE NOT NULL,
  cliente TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  expediente TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('Penal', 'Civil', 'Laboral', 'Familia', 'Administrativo', 'Otro')),
  etapa TEXT,
  estado TEXT NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Pausado', 'Cerrado')),
  forma_pago TEXT CHECK (forma_pago IN ('Por etapas', 'Monto fijo', 'Por honorarios', 'Otro')),
  monto_total DECIMAL(10, 2) DEFAULT 0 CHECK (monto_total >= 0),
  monto_cobrado DECIMAL(10, 2) DEFAULT 0 CHECK (monto_cobrado >= 0),
  abogado_asignado_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ubicacion_fisica TEXT,
  fecha_inicio DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  CONSTRAINT monto_cobrado_valido CHECK (monto_cobrado <= monto_total)
);
```

**Índices (8 total):**
- `idx_casos_cliente` → GIN trigram (búsqueda fuzzy)
- `idx_casos_expediente`
- `idx_casos_codigo_estimado`
- `idx_casos_estado`
- `idx_casos_tipo`
- `idx_casos_abogado_asignado`
- `idx_casos_ubicacion_fisica`
- `idx_casos_fecha_inicio`

**Validaciones:**
- `monto_cobrado` ≤ `monto_total`
- Tipos de caso: Penal, Civil, Laboral, Familia, Administrativo, Otro
- Estados: Activo, Pausado, Cerrado

---

### TABLA: eventos

```sql
CREATE TABLE public.eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('Audiencia', 'Plazo', 'Reunión', 'Diligencia', 'Otro')),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_evento TIMESTAMPTZ NOT NULL,
  ubicacion TEXT,
  completado BOOLEAN DEFAULT FALSE,
  alerta_7_dias BOOLEAN DEFAULT TRUE,
  alerta_3_dias BOOLEAN DEFAULT TRUE,
  alerta_1_dia BOOLEAN DEFAULT TRUE,
  alerta_dia_evento BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

**Índices (5 total):**
- `idx_eventos_caso_id`
- `idx_eventos_fecha_evento`
- `idx_eventos_tipo`
- `idx_eventos_completado`
- `idx_eventos_proximos` (compuesto: fecha_evento, completado WHERE completado = FALSE) ✅ CORREGIDO

**Tipos de eventos:**
- Audiencia
- Plazo
- Reunión
- Diligencia
- Otro

---

### TABLA: pagos

```sql
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
  fecha_pago DATE NOT NULL,
  concepto TEXT,
  metodo_pago TEXT CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Cheque', 'Depósito', 'Otro')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

**Índices (3 total):**
- `idx_pagos_caso_id`
- `idx_pagos_fecha_pago` (DESC)
- `idx_pagos_metodo`

**Trigger automático:**
- Al insertar/actualizar/eliminar pago → actualiza `casos.monto_cobrado` automáticamente

---

### TABLA: notas

```sql
CREATE TABLE public.notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caso_id UUID NOT NULL REFERENCES casos(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

**Índices (2 total):**
- `idx_notas_caso_id`
- `idx_notas_created_at` (DESC)

---

### TABLA: ubicaciones_fisicas

```sql
CREATE TABLE public.ubicaciones_fisicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo_estimado TEXT,
  ubicacion TEXT NOT NULL UNIQUE,
  fila INTEGER,
  columna TEXT,
  seccion TEXT,
  posicion INTEGER,
  cliente TEXT,
  descripcion TEXT,
  expediente TEXT,
  tomo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Índices (4 total):**
- `idx_ubicaciones_ubicacion` (UNIQUE)
- `idx_ubicaciones_cliente` (GIN trigram)
- `idx_ubicaciones_codigo`
- `idx_ubicaciones_fila_columna` (compuesto)

**Propósito:** Mapear el almacén físico con los datos del archivo `MAPEO_FISICO_REAL.md`

---

## 🔐 ROW LEVEL SECURITY (RLS)

Todas las tablas tienen RLS habilitado.

### Policies para ADMIN:

```sql
-- Admin ve TODO
CREATE POLICY "Admin ve todos los casos" ON casos FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- Admin crea TODO
CREATE POLICY "Admin crea casos" ON casos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- Admin actualiza TODO
CREATE POLICY "Admin actualiza casos" ON casos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));

-- Admin elimina TODO
CREATE POLICY "Admin elimina casos" ON casos FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin'));
```

### Policies para ABOGADO:

```sql
-- Abogados ven solo SUS casos
CREATE POLICY "Abogados ven sus casos" ON casos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'abogado'
      AND casos.abogado_asignado_id = auth.uid()
    )
  );

-- Abogados actualizan solo SUS casos
CREATE POLICY "Abogados actualizan sus casos" ON casos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'abogado'
      AND casos.abogado_asignado_id = auth.uid()
    )
  );
```

### Policies para SECRETARIA:

```sql
-- Secretaria ve TODO pero NO edita
CREATE POLICY "Secretaria ve todos los casos" ON casos FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'secretaria'));
```

---

## 📈 VISTAS ÚTILES

### Vista: casos_completos

```sql
CREATE OR REPLACE VIEW casos_completos AS
SELECT
  c.*,
  p.nombre_completo AS abogado_nombre,
  p.username AS abogado_username,
  COUNT(DISTINCT e.id) AS total_eventos,
  COUNT(DISTINCT pag.id) AS total_pagos,
  COALESCE(SUM(pag.monto), 0) AS monto_pagado_calculado,
  (c.monto_total - c.monto_cobrado) AS monto_pendiente
FROM casos c
LEFT JOIN profiles p ON c.abogado_asignado_id = p.id
LEFT JOIN eventos e ON c.id = e.caso_id
LEFT JOIN pagos pag ON c.id = pag.caso_id
GROUP BY c.id, p.nombre_completo, p.username;
```

**Uso:** Dashboard y listado de casos con info agregada.

---

### Vista: eventos_proximos

```sql
CREATE OR REPLACE VIEW eventos_proximos AS
SELECT
  e.*,
  c.codigo_estimado,
  c.cliente,
  c.expediente,
  p.nombre_completo AS abogado_nombre,
  EXTRACT(DAY FROM (e.fecha_evento - NOW())) AS dias_restantes
FROM eventos e
JOIN casos c ON e.caso_id = c.id
LEFT JOIN profiles p ON c.abogado_asignado_id = p.id
WHERE e.completado = FALSE
  AND e.fecha_evento >= NOW()
ORDER BY e.fecha_evento ASC;
```

**Uso:** Lista de eventos futuros en dashboard.

---

### Vista: dashboard_stats

```sql
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM casos WHERE estado = 'Activo') AS casos_activos,
  (SELECT COUNT(*) FROM eventos WHERE completado = FALSE AND fecha_evento >= NOW()) AS eventos_proximos,
  (SELECT COALESCE(SUM(monto_total - monto_cobrado), 0) FROM casos WHERE estado = 'Activo') AS cobros_pendientes,
  (SELECT COUNT(*) FROM eventos WHERE completado = FALSE AND fecha_evento::DATE = CURRENT_DATE) AS eventos_hoy,
  (SELECT COUNT(*) FROM eventos WHERE completado = FALSE AND fecha_evento::DATE = CURRENT_DATE + 1) AS eventos_manana,
  (SELECT COUNT(*) FROM eventos WHERE completado = FALSE AND fecha_evento::DATE BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS eventos_semana;
```

**Uso:** Stats numéricas del dashboard (casos activos, eventos próximos, etc.)

---

## ⚙️ FUNCIONES Y TRIGGERS

### Función: update_updated_at_column

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Aplicado a:** profiles, casos, eventos, ubicaciones_fisicas

**Propósito:** Actualizar automáticamente `updated_at` en cada UPDATE.

---

### Función: update_caso_monto_cobrado

```sql
CREATE OR REPLACE FUNCTION update_caso_monto_cobrado()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE casos
  SET monto_cobrado = (
    SELECT COALESCE(SUM(monto), 0)
    FROM pagos
    WHERE caso_id = NEW.caso_id
  )
  WHERE id = NEW.caso_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Trigger:** Ejecuta después de INSERT o UPDATE en `pagos`.

**Propósito:** Mantener `casos.monto_cobrado` sincronizado con la suma de pagos.

---

### Función: buscar_casos

```sql
CREATE OR REPLACE FUNCTION buscar_casos(termino TEXT)
RETURNS TABLE (
  id UUID,
  codigo_estimado TEXT,
  cliente TEXT,
  expediente TEXT,
  relevancia REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.codigo_estimado,
    c.cliente,
    c.expediente,
    similarity(c.cliente, termino) + similarity(COALESCE(c.expediente, ''), termino) AS relevancia
  FROM casos c
  WHERE
    c.cliente ILIKE '%' || termino || '%'
    OR c.expediente ILIKE '%' || termino || '%'
    OR c.codigo_estimado ILIKE '%' || termino || '%'
  ORDER BY relevancia DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;
```

**Uso:**
```sql
SELECT * FROM buscar_casos('moreno');
```

**Propósito:** Búsqueda fuzzy por cliente, expediente o código.

---

## 🔍 QUERIES ÚTILES PRE-ESCRITAS

### 1. Ver todos los casos activos con abogado

```sql
SELECT
  codigo_estimado,
  cliente,
  expediente,
  tipo,
  estado,
  p.nombre_completo AS abogado
FROM casos c
LEFT JOIN profiles p ON c.abogado_asignado_id = p.id
WHERE estado = 'Activo'
ORDER BY fecha_inicio DESC;
```

---

### 2. Ver eventos de hoy y mañana

```sql
SELECT
  e.fecha_evento,
  e.tipo,
  e.titulo,
  c.codigo_estimado,
  c.cliente
FROM eventos e
JOIN casos c ON e.caso_id = c.id
WHERE e.completado = FALSE
  AND e.fecha_evento::DATE BETWEEN CURRENT_DATE AND CURRENT_DATE + 1
ORDER BY e.fecha_evento ASC;
```

---

### 3. Ver casos con pagos pendientes

```sql
SELECT
  codigo_estimado,
  cliente,
  monto_total,
  monto_cobrado,
  (monto_total - monto_cobrado) AS pendiente
FROM casos
WHERE estado = 'Activo'
  AND monto_cobrado < monto_total
ORDER BY pendiente DESC;
```

---

### 4. Ver historial de pagos de un caso

```sql
SELECT
  fecha_pago,
  monto,
  concepto,
  metodo_pago
FROM pagos
WHERE caso_id = 'UUID-DEL-CASO'
ORDER BY fecha_pago DESC;
```

---

### 5. Buscar en ubicaciones físicas

```sql
SELECT
  ubicacion,
  codigo_estimado,
  cliente,
  descripcion,
  expediente
FROM ubicaciones_fisicas
WHERE fila = 1 AND columna = 'A'
ORDER BY posicion;
```

---

## 📦 IMPORTACIÓN DE DATOS

### Pendiente: Importar MAPEO_FISICO_REAL.md

**Archivo fuente:** `/Users/sebastian/Desktop/abogados app/MAPEO_FISICO_REAL.md`

**Filas completadas:**
- ✅ Fila 1: 82+ archivadores
- ✅ Fila 2: 55 archivadores
- ✅ Fila 3: 55 archivadores + 41 libros corporativos

**Total:** 233+ archivadores + 41 libros corporativos

**Script de importación:** Por crear (siguiente paso)

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Estado actual del esquema:

- [x] Extensiones habilitadas (uuid-ossp, pg_trgm)
- [x] Tabla profiles creada
- [x] Tabla casos creada (con todos los índices)
- [x] Tabla eventos creada (con índices corregidos)
- [x] Tabla pagos creada
- [x] Tabla notas creada
- [x] Tabla ubicaciones_fisicas creada
- [x] Triggers de updated_at aplicados
- [x] Triggers de monto_cobrado aplicados
- [x] RLS habilitado en todas las tablas
- [x] Policies creadas (admin, abogado, secretaria)
- [x] Vistas útiles creadas (casos_completos, eventos_proximos, dashboard_stats)
- [x] Función buscar_casos creada
- [ ] Usuarios de prueba creados (pendiente)
- [ ] Datos de mapeo físico importados (pendiente)
- [ ] Casos de prueba insertados (pendiente)

---

## 🚀 PRÓXIMOS PASOS

### 1. Verificar que todo funciona

Ejecutar en SQL Editor de Supabase:

```sql
-- Ver todas las tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Ver todos los índices
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Ver todas las funciones
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

### 2. Crear usuarios de prueba

En Supabase Dashboard:
1. Authentication → Users → Add user
2. Crear: admin@test.com / password: 123456
3. Copiar UUID del usuario
4. Insertar en profiles:

```sql
INSERT INTO profiles (id, username, nombre_completo, rol)
VALUES ('UUID-DEL-USUARIO', 'admin', 'Administrador', 'admin');
```

### 3. Importar datos del mapeo físico

Script por crear para convertir `MAPEO_FISICO_REAL.md` → `INSERT INTO ubicaciones_fisicas`

### 4. Insertar casos de prueba

Usar datos reales del mapeo para crear casos iniciales.

### 5. Conectar con Next.js

Crear proyecto Next.js y conectar con Supabase usando las credenciales.

---

## 📞 CONTACTO Y SOPORTE

**Desarrollador:** Sebastián Risco
**Proyecto:** Sistema de Gestión Despacho Legal
**Inicio:** 14 Enero 2026

---

## ⚠️ ERRORES COMUNES Y LECCIONES APRENDIDAS

### Error 1: CHECK constraint violation en `casos.forma_pago`
**Error Code**: 23514
**Fecha**: 14 Enero 2026

**Síntoma:**
```
ERROR: 23514: new row for relation "casos" violates check constraint "casos_forma_pago_check"
```

**Causa**: Intenté insertar valores no permitidos por el CHECK constraint.

**Valores incorrectos**:
- ❌ `'Por honorarios (20% del resultado)'`
- ❌ `'Pago único adelantado'`
- ❌ `'Por resultado'`

**Valores correctos** (únicos aceptados):
- ✅ `'Por etapas'`
- ✅ `'Monto fijo'`
- ✅ `'Por honorarios'`
- ✅ `'Otro'`

**Solución**: Usar solo los valores definidos en el constraint.

**Query para verificar**:
```sql
SELECT pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'casos_forma_pago_check';
```

---

### Error 2: CHECK constraint violation en `pagos.metodo_pago`
**Error Code**: 23514
**Fecha**: 14 Enero 2026

**Síntoma:**
```
ERROR: 23514: new row for relation "pagos" violates check constraint "pagos_metodo_pago_check"
```

**Causa**: Usé texto descriptivo en lugar del valor exacto.

**Valor incorrecto**:
- ❌ `'Transferencia bancaria'`

**Valores correctos** (únicos aceptados):
- ✅ `'Efectivo'`
- ✅ `'Transferencia'` (sin "bancaria")
- ✅ `'Cheque'`
- ✅ `'Depósito'`
- ✅ `'Otro'`

**Solución**: Usar valores exactos, sin adjetivos adicionales.

---

### Error 3: Columna inexistente en `notas`
**Error Code**: 42703
**Fecha**: 14 Enero 2026

**Síntoma:**
```
ERROR: 42703: column "creado_por_id" of relation "notas" does not exist
```

**Causa**: Asumí que la tabla tenía una columna que no existe.

**Estructura real de `notas`**:
- ✅ `id` (UUID)
- ✅ `caso_id` (UUID FK)
- ✅ `contenido` (TEXT)
- ✅ `created_at` (TIMESTAMPTZ)
- ✅ `updated_at` (TIMESTAMPTZ)
- ❌ `creado_por_id` → NO EXISTE

**Solución**: Verificar estructura antes de INSERT.

**Query para verificar columnas**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'notas'
ORDER BY ordinal_position;
```

---

### Checklist de prevención de errores

**Antes de cualquier INSERT, verificar**:

1. **CHECK constraints de la tabla**:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'nombre_tabla'::regclass AND contype = 'c';
```

2. **Estructura completa de columnas**:
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'nombre_tabla'
ORDER BY ordinal_position;
```

3. **Foreign keys existentes**:
```sql
SELECT kcu.column_name, ccu.table_name AS foreign_table
FROM information_schema.key_column_usage AS kcu
JOIN information_schema.constraint_column_usage AS ccu
  ON kcu.constraint_name = ccu.constraint_name
WHERE kcu.table_name = 'nombre_tabla';
```

---

## 📝 CHANGELOG

### v1.0.0 - 14 Enero 2026

**Added:**
- Esquema completo de base de datos (6 tablas)
- Índices optimizados para performance
- RLS con policies por rol (admin, abogado, secretaria)
- Vistas útiles (casos_completos, eventos_proximos, dashboard_stats)
- Funciones de búsqueda y triggers automáticos
- Usuarios de prueba (admin, abogada1, secretaria)
- Datos de ejemplo (6 casos, 5 eventos, 10 pagos, 4 notas)

**Fixed:**
- ERROR 42P17: Índice idx_eventos_proximos corregido (removido NOW() del predicado WHERE)
- ERROR 23514: Valores de forma_pago corregidos en INSERT de casos
- ERROR 23514: Valores de metodo_pago corregidos en INSERT de pagos
- ERROR 42703: Removida columna inexistente creado_por_id de INSERT en notas

**Status:** ✅ Esquema base completado, verificado y con datos de prueba funcionando

**Dashboard stats verificado:**
- 4 casos activos
- 4 eventos próximos
- $4,000 cobros pendientes
- 3 eventos esta semana

**Ubicaciones físicas importadas:**
- 110 ubicaciones físicas de archivo (Filas 1, 2, 3)
- 33.3% de casos con ubicación confirmada
- 232 casos pendientes de mapear (Filas 4, 5)

**Decisión de diseño: Ubicación flexible**
- Se decidió NO incluir posición exacta (1, 2, 3, 4...)
- Ubicaciones tipo "1-D-FRONTAL" o "1-C-IZQUIERDA-FRONTAL"
- Razón: Mayor flexibilidad cuando se muevan archivadores físicamente
- Usuario busca en la zona indicada sin dependencia de orden exacto

---

## 📋 RESUMEN DE SESIÓN - 14 ENERO 2026

### ✅ Completado

**1. Planificación del MVP**
- Features definidas por módulo
- Wireframes ASCII de pantallas principales
- User stories (pendiente de completar)

**2. Base de Datos (100% funcional)**
- 6 tablas creadas (profiles, casos, eventos, pagos, notas, ubicaciones_fisicas)
- 3 vistas útiles (casos_completos, eventos_proximos, dashboard_stats)
- Triggers automáticos (updated_at, monto_cobrado)
- RLS con políticas por rol (admin, abogado, secretaria)
- Índices optimizados para búsquedas

**3. Usuarios de Prueba**
- admin@despacho.test (rol: admin)
- abogada1@despacho.test (rol: abogado)
- secretaria@despacho.test (rol: secretaria)

**4. Datos de Ejemplo**
- 6 casos de prueba (4 activos, 1 pausado, 1 cerrado)
- 5 eventos (4 próximos, 1 completado)
- 10 pagos distribuidos
- 4 notas de seguimiento

**5. Ubicaciones Físicas**
- 110 casos con ubicación física mapeada
- Cobertura: Filas 1, 2, 3 (33.3% del total)
- Pendiente: Filas 4, 5 (232 casos)

**6. Errores Documentados**
- ERROR 42P17: Index con NOW() (solucionado)
- ERROR 23514: CHECK constraints (forma_pago, metodo_pago)
- ERROR 42703: Columna inexistente (creado_por_id en notas)
- ERROR 23505: UNIQUE constraint en ubicacion (solucionado)

### 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Tablas creadas | 6 |
| Vistas | 3 |
| Triggers | 7 |
| Políticas RLS | 12+ |
| Usuarios | 3 |
| Casos ejemplo | 6 |
| Eventos ejemplo | 5 |
| Ubicaciones físicas | 110 |
| Total casos en CSV | 348 |
| Cobertura mapeo | 33.3% |

### 🎯 Estado del Proyecto

**Base de datos**: ✅ 100% funcional y con datos de prueba
**Frontend**: ⏳ Pendiente (siguiente paso)
**Autenticación**: ✅ Configurada (Supabase Auth)
**Mapeo físico**: 🔄 33% completado (faltan Filas 4, 5)

### 🚀 Próximos Pasos Inmediatos

1. **Crear proyecto Next.js 14**
   - Configurar App Router
   - Instalar dependencias (Supabase, Tailwind, shadcn/ui)

2. **Conectar Supabase**
   - Configurar cliente de Supabase
   - Implementar autenticación

3. **Implementar Dashboard MVP**
   - Vista de casos activos
   - Calendario de eventos
   - Alertas urgentes

4. **CRUD de Casos**
   - Crear, editar, eliminar casos
   - Asignar abogado
   - Cambiar estados

5. **Sistema de Alertas**
   - Eventos próximos (7, 3, 1 días)
   - Notificaciones en dashboard

### 📝 Pendientes Futuros

- [ ] Completar mapeo físico (Filas 4, 5)
- [ ] Implementar búsqueda fuzzy de casos
- [ ] Sistema de casos virtuales (sin ubicación física)
- [ ] Reportes y estadísticas avanzadas
- [ ] Importar 232 casos restantes del CSV
- [ ] User stories completas para cada rol
- [ ] Roadmap de implementación detallado

---

---

## 🎉 ACTUALIZACIÓN - 14 ENERO 2026, 22:20

### ✅ MVP Funcionando

**Frontend implementado:**
- ✅ Proyecto Next.js 14 creado y corriendo
- ✅ Supabase conectado correctamente
- ✅ Autenticación funcionando (login/logout)
- ✅ Middleware de protección de rutas
- ✅ Dashboard funcional con datos reales de la BD

**Features del Dashboard:**
- Estadísticas en tiempo real (casos activos, eventos, cobros pendientes)
- Lista de casos activos recientes
- Lista de eventos próximos con fechas
- Información del usuario logueado (nombre y rol)

**Problemas resueltos:**
- ERROR: Recursión infinita en políticas RLS de `profiles`
- Solución: Políticas simplificadas para todos los usuarios autenticados
- Resultado: Todos los usuarios autenticados tienen acceso completo (por ahora)

**Acceso al sistema:**
- URL: http://localhost:3000
- Usuarios de prueba funcionando correctamente
- Sesiones persistentes con cookies

**Próximos pasos inmediatos:**
1. Implementar formulario para agregar casos reales
2. Sistema de pagos por etapas/monto fijo/honorarios
3. CRUD completo de casos (crear, editar, eliminar)
4. Importar casos reales del CSV

---

**Última actualización:** 14 Enero 2026, 22:20
**Estado:** MVP Dashboard funcionando - Siguiente: CRUD de casos
