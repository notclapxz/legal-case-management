# 📋 Sistema de Gestión para Despacho de Abogados - Especificación Técnica

## 🎯 Resumen Ejecutivo

Sistema web para gestionar **~250 casos legales** (algunos activos, otros cerrados) en un despacho peruano especializado en derecho penal. El objetivo principal es eliminar el riesgo de perder audiencias, hacer proyecciones financieras confiables y optimizar el tiempo de preparación para reuniones.

**Usuario Principal**: Abogado principal que trabaja en tablet
**Problema Crítico**: Riesgo de perder audiencias + Flujo de caja impredecible + Información dispersa + Almacén físico desorganizado
**Solución**: Dashboard con alertas visuales + Proyección financiera + Fichas ejecutivas + Sistema de ubicación de expedientes

**Clientes Recurrentes**: Algunos clientes tienen 15-20+ casos activos simultáneamente (ej: Carlos Moreno, Carlos Aguirre)

---

## 🏗️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: shadcn/ui (componentes accesibles)
- **Gestión de Estado**: Zustand (ligero y simple)
- **Calendario**: react-big-calendar o FullCalendar
- **Hosting**: Vercel (gratis, 100GB/mes)

### Backend
- **Framework**: Next.js API Routes (mismo proyecto)
- **ORM**: Prisma (type-safe, migraciones automáticas)
- **Autenticación**: NextAuth.js
- **Validación**: Zod

### Base de Datos
- **Motor**: PostgreSQL
- **Hosting**: Supabase (500MB gratis)
- **Backup**: Automático incluido en Supabase

### DevOps
- **Control de versiones**: Git + GitHub
- **CI/CD**: Vercel automático (deploy on push)
- **Variables de entorno**: Vercel Environment Variables

---

## 📊 Arquitectura de Base de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL, -- 'Principal', 'Abogada 1', 'Abogada 2', 'Secretaria', 'Analista'
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `casos`
```sql
CREATE TABLE casos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL, -- Formato: APELLIDO-##
  cliente VARCHAR(255) NOT NULL,
  cliente_recurrente BOOLEAN DEFAULT false, -- True si tiene múltiples casos
  descripcion_caso TEXT, -- Descripción detallada del caso (ej: "REQUERIMIENTO DE PRISION PREVENTIVA")
  numero_expediente VARCHAR(100), -- Número de expediente judicial (ej: "02437-2016")
  tipo VARCHAR(20) NOT NULL, -- 'Penal', 'Civil', 'Laboral', 'Administrativo'
  etapa VARCHAR(50) NOT NULL, -- Ver ENUM abajo
  abogada_asignada_id UUID REFERENCES users(id),
  forma_pago VARCHAR(20) NOT NULL, -- 'Por hora', 'Por etapas', 'Mensual'
  monto_total DECIMAL(10,2) NOT NULL,
  monto_cobrado DECIMAL(10,2) DEFAULT 0,
  monto_pendiente DECIMAL(10,2) GENERATED ALWAYS AS (monto_total - monto_cobrado) STORED,
  fecha_inicio DATE NOT NULL,
  ubicacion_fisica VARCHAR(20), -- Formato: #-Posición (ej: "1-A3", "5-B12")
  tomo VARCHAR(10), -- Tomo del expediente si es multi-tomo (ej: "I", "II", "III")
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_casos_cliente ON casos(cliente);
CREATE INDEX idx_casos_codigo ON casos(codigo);
CREATE INDEX idx_casos_activo ON casos(activo);
CREATE INDEX idx_casos_abogada ON casos(abogada_asignada_id);
```

**ENUM Etapas del proceso penal:**
1. Preliminar
2. Investigación preparatoria
3. Etapa intermedia
4. Juicio oral
5. Apelación
6. Casación

### Tabla: `eventos`
```sql
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
  fecha TIMESTAMP NOT NULL,
  tipo_evento VARCHAR(50) NOT NULL, -- 'Audiencia', 'Plazo', 'Reunión con cliente'
  descripcion TEXT NOT NULL,
  completado BOOLEAN DEFAULT false,
  recordatorio_7_dias BOOLEAN DEFAULT false,
  recordatorio_3_dias BOOLEAN DEFAULT false,
  recordatorio_1_dia BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para calendario y alertas
CREATE INDEX idx_eventos_fecha ON eventos(fecha);
CREATE INDEX idx_eventos_caso ON eventos(caso_id);
CREATE INDEX idx_eventos_completado ON eventos(completado);
```

### Tabla: `pagos`
```sql
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  concepto TEXT,
  comprobante_sunat VARCHAR(100), -- Número de comprobante
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para historial de pagos
CREATE INDEX idx_pagos_caso ON pagos(caso_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);
```

### Tabla: `actividad_log` (auditoría)
```sql
CREATE TABLE actividad_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id),
  accion VARCHAR(100) NOT NULL, -- 'crear_caso', 'editar_caso', 'registrar_pago', etc.
  entidad VARCHAR(50) NOT NULL, -- 'caso', 'evento', 'pago'
  entidad_id UUID,
  detalles JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para historial de actividad
CREATE INDEX idx_log_usuario ON actividad_log(usuario_id);
CREATE INDEX idx_log_fecha ON actividad_log(created_at);
```

---

## 📁 Estructura del Proyecto

```
abogados-app/
├── .env.local                    # Variables de entorno (NO committear)
├── .gitignore                    # Git ignore
├── package.json                  # Dependencias
├── tsconfig.json                 # Config TypeScript
├── tailwind.config.ts            # Config Tailwind
├── next.config.js                # Config Next.js
├── prisma/
│   ├── schema.prisma             # Esquema de BD
│   └── seed.ts                   # Datos de ejemplo
├── public/
│   └── logo.svg                  # Assets estáticos
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Página de inicio (dashboard)
│   │   ├── login/
│   │   │   └── page.tsx          # Página de login
│   │   ├── casos/
│   │   │   ├── page.tsx          # Lista de casos
│   │   │   ├── nuevo/
│   │   │   │   └── page.tsx      # Crear caso
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detalle de caso
│   │   │       └── editar/
│   │   │           └── page.tsx  # Editar caso
│   │   ├── calendario/
│   │   │   └── page.tsx          # Vista de calendario
│   │   ├── finanzas/
│   │   │   └── page.tsx          # Proyección financiera
│   │   ├── buscador/
│   │   │   └── page.tsx          # Buscar expedientes
│   │   └── api/                  # API Routes
│   │       ├── auth/             # Endpoints de autenticación
│   │       ├── casos/            # CRUD de casos
│   │       ├── eventos/          # CRUD de eventos
│   │       ├── pagos/            # CRUD de pagos
│   │       └── dashboard/        # Data para dashboard
│   ├── components/               # Componentes reutilizables
│   │   ├── ui/                   # Componentes shadcn/ui
│   │   ├── dashboard/
│   │   │   ├── AlertCard.tsx     # Card de alerta con colores
│   │   │   ├── ProximosEventos.tsx
│   │   │   └── ResumenFinanciero.tsx
│   │   ├── casos/
│   │   │   ├── CasoCard.tsx      # Card de caso
│   │   │   ├── CasoForm.tsx      # Formulario de caso
│   │   │   └── FichaEjecutiva.tsx # Ficha para reuniones
│   │   ├── calendario/
│   │   │   └── CalendarioView.tsx
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       └── Sidebar.tsx
│   ├── lib/
│   │   ├── prisma.ts             # Cliente de Prisma
│   │   ├── auth.ts               # Lógica de autenticación
│   │   ├── validations.ts        # Esquemas Zod
│   │   └── utils.ts              # Utilidades
│   ├── hooks/
│   │   ├── useCasos.ts           # Hook para casos
│   │   └── useEventos.ts         # Hook para eventos
│   ├── store/
│   │   └── authStore.ts          # Zustand store para auth
│   └── types/
│       └── index.ts              # TypeScript types
└── claude.md                     # Este archivo
```

---

## 🗄️ Almacén Físico de Expedientes

### Estructura Real del Almacén

El despacho cuenta con un cuarto de almacenamiento organizado en **5 FILAS** (estantes horizontales) en forma de U:

```
Vista en forma de U (desde arriba):

         ┌─────────────────────┐
         │    FILA 1           │
         │  [A] [B] [C] [D] [E]│
         ├─────────────────────┤
         │    FILA 2           │
         │[A][B][C][D][E][F]   │
    ┌────┼─────────────────────┼────┐
    │    │    FILA 3           │    │
    │    │[A][B][C][D][E][F]   │    │
    └────┼─────────────────────┼────┘
         │    FILA 4           │
         │[A][B][C][D][E][F]   │
         ├─────────────────────┤
         │    FILA 5           │
         │[A][B][C][D][E][F]   │
         └─────────────────────┘
```

### Distribución de Casos por Zonas

**Zona 1 - Carlos Moreno** (35+ archivadores - mayoría en FILA 1)
- Casos penales anticorrupción
- Negociación incompatible, peculado, colusión
- Múltiples tomos (I, II, III, IV, V)
- SIS, PAD, documentos personales

**Zona 2 - Múltiples Clientes** (principalmente FILA 2)
- Corvetto, Abrahan Risco, Macher, Martinez
- Carbajal (laboral), Codesur (ambiental)
- Buenaventura, Miranda, Zevallos, LBT
- Alvarado, Leon Mariños

**Zona 3 - Corporativos Grandes** (principalmente FILA 3)
- INPESCO (7+ tomos) - ejecución hipotecas
- BARAKA (4+ tomos LAC) - familia Baraka
- AVR (múltiples casos laborales)
- NIPPON (lesiones, homicidio culposo)
- AW MEDICAL, Paz, B&S

**Zona 4 - Casos Complejos** (principalmente FILA 4)
- ENDOMED (colusión ESSALUD)
- VELEBIT (5+ tomos) - acción amparo
- Escalante, Tello (OO.CC y LAC)
- Barraza, Rodríguez, Gutierrez
- Lavado de activos (Ventanilla)

**Zona 5 - Carlos Aguirre** (24+ archivadores - mayoría en FILA 5)
- SIS / Clínicas / Pagos indebidos
- Malversación Callao
- Negociación incompatible - Sepelios
- PAD (procedimientos administrativos)
- Múltiples casos penales

**Zona 6-7 - Casos Diversos y Recientes** (distribuidos en FILA 3-5)
- Martha Aguirre (BPM, PAD, Emilima)
- Jenifer Montero (colusión)
- Salazar Melina, Vinces
- Casos recientes 2023-2025

### Sistema de Coordenadas

```
Cada FILA tiene múltiples columnas (A, B, C, D, E, F):

FILA 1:  ┌───┬───┬───┬───┬───┐
         │ A │ B │ C │ D │ E │
         └───┴───┴───┴───┴───┘

FILA 2:  ┌───┬───┬───┬───┬───┬───┐
         │ A │ B │ C │ D │ E │ F │
         └───┴───┴───┴───┴───┴───┘

FILAS 3-5: Similar a FILA 2 (columnas A-F)
```

**Formato de ubicación**: `#-Columna`
- Ejemplo: `1-A` = Fila 1, columna A
- Ejemplo: `3-C` = Fila 3, columna C
- Ejemplo: `5-D` = Fila 5, columna D

**Nota**: Las columnas pueden tener múltiples niveles verticales (arriba/abajo), pero por simplicidad del MVP, usaremos solo FILA-Columna. En Fase 2 se puede agregar nivel vertical si es necesario (ej: 1-A-2 para "Fila 1, Columna A, nivel 2")

### Estado Actual del Almacén

**Problemas identificados:**
1. ❌ No hay orden alfabético estricto (se organizó por cliente principal)
2. ❌ ~100 casos eliminados aún aparecen en listas
3. ❌ Algunos expedientes tienen múltiples tomos (I, II, III, IV, V)
4. ❌ Casos multi-tomo dispersos en diferentes posiciones
5. ⚠️ Difícil encontrar expedientes sin sistema digital

**Lo que funciona:**
1. ✅ Agrupación por cliente recurrente (Moreno, Aguirre juntos)
2. ✅ Casos corporativos grandes juntos (INPESCO, BARAKA)
3. ✅ Todas las FILAS son accesibles
4. ✅ Etiquetas en lomos de archivadores

### Mejora con el Sistema Digital

El sistema permitirá:
- 🔍 **Buscar por cliente** y obtener ubicación exacta
- 📍 **Ver todos los tomos** de un caso multi-tomo
- 🗂️ **Filtrar casos activos** vs eliminados
- 📊 **Mapa visual** del almacén (Fase 2)
- 📷 **Fotos de archivadores** (Fase 3)

---

## 🎨 Sistema de Colores para Alertas

```typescript
// Función para calcular color según días restantes
function getAlertColor(diasRestantes: number): string {
  if (diasRestantes === 0) return 'bg-red-500 text-white'; // HOY - ROJO
  if (diasRestantes <= 3) return 'bg-orange-500 text-white'; // 1-3 días - NARANJA
  if (diasRestantes <= 7) return 'bg-yellow-400 text-black'; // 4-7 días - AMARILLO
  return 'bg-gray-100 text-gray-800'; // +7 días - GRIS
}

// Prioridad (para ordenar eventos)
function getPrioridad(diasRestantes: number): number {
  if (diasRestantes === 0) return 4; // Máxima prioridad
  if (diasRestantes <= 3) return 3;
  if (diasRestantes <= 7) return 2;
  return 1; // Mínima prioridad
}
```

---

## 🧩 Componentes Principales

### 1. Dashboard (Página Principal)

**Vista**: `src/app/page.tsx`

**Secciones**:
1. **Bienvenida**: "Buenos días, [Nombre]" + Fecha actual
2. **Alertas Urgentes**: Cards rojas/naranjas con eventos HOY y próximos 3 días
3. **Resumen Financiero**: Cobrado este mes, proyección próximo mes, total pendiente
4. **Próximos Eventos**: Lista de eventos ordenados por fecha (código de colores)
5. **Casos Activos**: Número total, distribuidos por etapa (gráfico de barras)

**Features**:
- Refresco automático cada 5 minutos
- Click en alerta → navega a detalle del caso
- Botón "Marcar como completado" en eventos

### 2. Lista de Casos

**Vista**: `src/app/casos/page.tsx`

**Features**:
- Tabla con columnas: Código | Cliente | Tipo | Etapa | Abogada | Monto Pendiente | Acciones
- Filtros: Por tipo, por etapa, por abogada, por activo/inactivo
- Búsqueda por código o nombre de cliente
- Paginación (20 casos por página)
- Botones: Ver detalle | Editar | Ficha ejecutiva | Marcar inactivo
- Indicador visual de próximos eventos (icono de alerta con color)

### 3. Detalle de Caso

**Vista**: `src/app/casos/[id]/page.tsx`

**Información Mostrada**:
- Datos generales (código, cliente, tipo, etapa, etc.)
- Información financiera (total, cobrado, pendiente con % completado)
- Ubicación física del expediente (destacado visualmente)
- Abogada asignada
- Historial de pagos (tabla con fecha, monto, concepto)
- Eventos relacionados (audiencias, plazos, reuniones)
- Notas del caso (texto libre, editable)
- Log de actividad (quién hizo qué y cuándo)

**Acciones**:
- Editar caso
- Registrar pago
- Agregar evento
- Generar ficha ejecutiva (PDF)
- Marcar como inactivo
- Eliminar caso (solo admin, con confirmación)

### 4. Formulario de Caso

**Vista**: `src/app/casos/nuevo/page.tsx` o `src/app/casos/[id]/editar/page.tsx`

**Campos**:
- Código (auto-sugerido: APELLIDO-##)
- Cliente (texto libre)
- Tipo (select: Penal/Civil)
- Etapa (select: 6 opciones)
- Abogada asignada (select de usuarios con rol abogada)
- Forma de pago (select: Por hora/Por etapas/Mensual)
- Monto total (número con 2 decimales)
- Monto cobrado inicial (opcional, default 0)
- Fecha de inicio (date picker)
- Ubicación física (formato: #-L, ej: 2-C)
- Notas (textarea)

**Validaciones**:
- Código único
- Monto total > 0
- Monto cobrado ≤ monto total
- Fecha de inicio ≤ fecha actual
- Ubicación formato válido (Fila-Hueco)

### 5. Calendario

**Vista**: `src/app/calendario/page.tsx`

**Features**:
- Vista mensual (principal)
- Vistas alternativas: semana, día
- Eventos coloreados según tipo:
  - 🔴 Audiencias (rojo)
  - 🔵 Plazos (azul)
  - 🟢 Reuniones (verde)
- Click en evento → modal con detalles + acciones
- Filtro por tipo de evento
- Filtro por abogada asignada
- Agregar evento (botón flotante +)

### 6. Proyección Financiera

**Vista**: `src/app/finanzas/page.tsx`

**Métricas**:
1. **Cobrado Este Mes**: Suma de pagos del mes actual
2. **Proyección Próximo Mes**: Cálculo basado en:
   - Casos "Mensual": cuota × 1
   - Casos "Por etapas": 30% del pendiente (conservador)
   - Casos "Por hora": promedio histórico (Fase 2)
3. **Total Pendiente de Cobro**: Suma de todos los `monto_pendiente`
4. **Casos con Mayor Pendiente**: Top 10 casos por monto pendiente

**Visualizaciones**:
- Gráfico de barras: Cobrado vs Proyectado (últimos 6 meses)
- Gráfico de torta: Distribución por forma de pago
- Tabla: Desglose detallado por caso

### 7. Buscador de Expedientes

**Vista**: `src/app/buscador/page.tsx`

**Features**:
- Búsqueda por:
  - Código de caso
  - Nombre de cliente
  - Ubicación física
- Resultados muestran:
  - Código + Cliente
  - Ubicación física (GRANDE y destacada)
  - Próximo evento (si existe)
  - Botón "Ver detalle"
- Ordenamiento: Alfabético, por fecha de inicio, por próximo evento

### 8. Ficha Ejecutiva (para reuniones)

**Componente**: `src/components/casos/FichaEjecutiva.tsx`

**Información Incluida**:
- Código y nombre del cliente (título grande)
- Tipo y etapa actual
- Resumen financiero (total, cobrado, pendiente)
- Último pago (fecha y monto)
- Próximo evento (fecha, tipo, descripción)
- Notas relevantes (últimas actualizadas)
- Historia reciente (últimos 5 cambios)

**Acciones**:
- Ver en pantalla (modal o página completa)
- Exportar a PDF (Fase 2)
- Imprimir

---

## 🔐 Sistema de Autenticación

### Roles y Permisos (Fase 1 - Básico)

**En Fase 1, todos tienen acceso completo.** Los permisos granulares se implementarán en Fase 2.

| Rol | Acceso |
|-----|--------|
| Principal | Todo (Admin) |
| Abogada 1 | Todo |
| Abogada 2 | Todo |
| Secretaria | Todo |
| Analista | Solo lectura (dashboard y reportes) |

### Login

**Vista**: `src/app/login/page.tsx`

- Email + Password
- Botón "Recordarme" (opcional)
- Sesión dura 7 días
- Redirección a dashboard tras login exitoso

### Seguridad

- Contraseñas hasheadas con bcrypt (12 rounds)
- Tokens JWT con NextAuth.js
- HTTPS obligatorio (incluido en Vercel)
- Variables sensibles en `.env.local` (NUNCA committear)

---

## 📱 Diseño Responsive

### Prioridad: Tablet (iPad tamaño estándar)
- Resolución objetivo: 768px - 1024px
- Orientación: Landscape (horizontal) preferido

### Breakpoints Tailwind:
```typescript
{
  sm: '640px',  // Móvil grande
  md: '768px',  // Tablet
  lg: '1024px', // Desktop pequeño
  xl: '1280px', // Desktop grande
}
```

### Ajustes por dispositivo:
- **Móvil** (<768px): Layout vertical, menú hamburguesa, tarjetas apiladas
- **Tablet** (768-1024px): Layout óptimo, sidebar colapsable, grid 2 columnas
- **Desktop** (>1024px): Sidebar fijo, grid 3 columnas, más información visible

---

## 🚀 Guía de Implementación Paso a Paso

### Paso 1: Configuración Inicial (30 min)

```bash
# 1. Crear proyecto Next.js
npx create-next-app@latest abogados-app --typescript --tailwind --app

# 2. Instalar dependencias
cd abogados-app
npm install prisma @prisma/client next-auth bcryptjs zod zustand
npm install -D @types/bcryptjs

# 3. Inicializar Prisma
npx prisma init --datasource-provider postgresql
```

**Configurar `.env.local`**:
```env
# Base de datos (obtener de Supabase)
DATABASE_URL="postgresql://user:password@db.xxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generar con: openssl rand -base64 32]"
```

### Paso 2: Esquema de Base de Datos (45 min)

1. Copiar esquemas SQL anteriores a `prisma/schema.prisma`
2. Ejecutar migración:
```bash
npx prisma migrate dev --name init
```
3. Generar cliente Prisma:
```bash
npx prisma generate
```

### Paso 3: Autenticación (1 hora)

1. Configurar NextAuth en `src/app/api/auth/[...nextauth]/route.ts`
2. Crear página de login `src/app/login/page.tsx`
3. Crear middleware de protección `src/middleware.ts`

### Paso 4: Dashboard (2 horas)

1. Crear layout principal `src/app/layout.tsx`
2. Crear navbar con usuario logueado
3. Crear página dashboard `src/app/page.tsx`
4. Implementar componente de alertas `AlertCard.tsx`
5. API para obtener eventos próximos: `src/app/api/dashboard/route.ts`

### Paso 5: CRUD de Casos (3 horas)

1. Crear API endpoints:
   - `GET /api/casos` (listar con filtros)
   - `POST /api/casos` (crear)
   - `GET /api/casos/[id]` (detalle)
   - `PUT /api/casos/[id]` (editar)
   - `DELETE /api/casos/[id]` (eliminar/inactivar)

2. Crear vistas:
   - Lista de casos con filtros
   - Formulario crear/editar
   - Detalle de caso

### Paso 6: Calendario (2 horas)

1. Instalar librería de calendario:
```bash
npm install react-big-calendar date-fns
```

2. Crear API de eventos:
   - `GET /api/eventos` (listar por rango de fechas)
   - `POST /api/eventos` (crear)
   - `PUT /api/eventos/[id]` (editar/marcar completado)

3. Crear vista de calendario con colores

### Paso 7: Proyección Financiera (2 horas)

1. Crear API: `GET /api/finanzas/proyeccion`
2. Implementar lógica de cálculo:
   - Cobrado este mes (query a tabla `pagos`)
   - Proyección mes siguiente (según forma de pago)
3. Crear vista con gráficos (usar librería chart.js o recharts)

### Paso 8: Buscador y Fichas (1.5 horas)

1. Crear API de búsqueda: `GET /api/casos/buscar?q=...`
2. Vista de buscador con resultados destacados
3. Componente de ficha ejecutiva (modal o página)

### Paso 9: Datos de Ejemplo (30 min)

Crear archivo `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Crear usuarios
  const principal = await prisma.user.create({
    data: {
      email: 'principal@despacho.com',
      password_hash: await bcrypt.hash('admin123', 12),
      nombre: 'Dr. [Nombre del Padre]',
      rol: 'Principal',
    },
  });

  // Crear casos de ejemplo
  const caso1 = await prisma.caso.create({
    data: {
      codigo: 'GARCIA-01',
      cliente: 'María García López',
      tipo: 'Penal',
      etapa: 'Juicio oral',
      abogada_asignada_id: principal.id,
      forma_pago: 'Por etapas',
      monto_total: 20000,
      monto_cobrado: 12000,
      fecha_inicio: new Date('2023-06-10'),
      ubicacion_fisica: '1-A',
    },
  });

  // Crear evento urgente para caso1
  await prisma.evento.create({
    data: {
      caso_id: caso1.id,
      fecha: new Date(), // HOY
      tipo_evento: 'Audiencia',
      descripcion: 'Audiencia de juicio oral - Sala 3',
    },
  });

  // ... más casos y eventos de ejemplo
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Ejecutar seed:
```bash
npx prisma db seed
```

### Paso 10: Testing y Ajustes (2 horas)

1. Probar todas las funcionalidades
2. Ajustar estilos para tablet
3. Verificar cálculos financieros
4. Probar alertas y colores

### Paso 11: Deployment (1 hora)

**Frontend (Vercel)**:
1. Crear cuenta en Vercel
2. Conectar repositorio GitHub
3. Configurar variables de entorno
4. Deploy automático

**Base de Datos (Supabase)**:
1. Crear proyecto en Supabase
2. Obtener connection string
3. Ejecutar migraciones

---

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@prisma/client": "^5.7.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "date-fns": "^3.0.0",
    "react-big-calendar": "^1.8.0",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.0",
    "prisma": "^5.7.0"
  }
}
```

---

## 🎯 Criterios de Éxito - Fase 1 MVP

### Funcionales
- ✅ Login funcional con roles
- ✅ Dashboard muestra alertas con colores correctos
- ✅ Crear, editar, ver y buscar casos
- ✅ Calendario con eventos coloreados
- ✅ Proyección financiera con cálculos correctos
- ✅ Buscador de expedientes muestra ubicación física
- ✅ Fichas ejecutivas generan información completa

### No Funcionales
- ✅ Carga rápida (<2 segundos)
- ✅ Responsive en tablet (principal) y móvil
- ✅ HTTPS habilitado
- ✅ Base de datos con backup automático
- ✅ Datos de ejemplo cargados

### Experiencia de Usuario
- ✅ El abogado principal puede ver su agenda en <10 segundos tras abrir la app
- ✅ Alertas urgentes visibles sin scroll
- ✅ Puede buscar un expediente y encontrar su ubicación en <5 segundos
- ✅ Crear un caso nuevo toma <2 minutos

---

## 🗓️ Roadmap de Fases

### ✅ FASE 1 - MVP (2-3 semanas) - **ESTE DOCUMENTO**
- Base de datos completa
- CRUD de casos
- Dashboard con alertas
- Calendario de eventos
- Proyección financiera básica
- Buscador de expedientes
- Fichas ejecutivas
- Login y seguridad básica

### ⏳ FASE 2 - Optimización (1-2 meses)
- Análisis de rentabilidad por tipo de caso
- Dashboard visual con gráficos avanzados
- Control de cobranzas detallado (facturas, recordatorios)
- Registro de tiempo invertido por caso
- Alertas por email/WhatsApp (integración con Twilio)
- Permisos granulares por rol
- Exportar fichas a PDF
- Historial de cambios detallado

### ⏳ FASE 3 - Automatización (2-3 meses)
- Generador automático de presentaciones (Word → PPT)
- Sistema de dictado a texto (Speech-to-Text)
- Templates de documentos legales
- Importación masiva desde Excel/CSV
- Reporte matutino automático por email
- Notificaciones push (PWA)

### ⏳ FASE 4 - Analytics (6+ meses)
- Análisis histórico completo
- Predicción de duración de casos (ML)
- Predicción de resultados
- Identificación de cuellos de botella
- Análisis de clientes más rentables
- Estacionalidad y tendencias
- Dashboard ejecutivo para toma de decisiones

---

## 🗂️ Datos de Ejemplo para Desarrollo

### Usuarios
```typescript
const usuarios = [
  { email: 'principal@despacho.com', nombre: 'Dr. [Padre]', rol: 'Principal' },
  { email: 'abogada1@despacho.com', nombre: 'Dra. [Nombre]', rol: 'Abogada 1' },
  { email: 'abogada2@despacho.com', nombre: 'Dra. [Nombre]', rol: 'Abogada 2' },
  { email: 'secretaria@despacho.com', nombre: '[Nombre]', rol: 'Secretaria' },
  { email: 'sebastianrisco145@gmail.com', nombre: 'Sebastián', rol: 'Analista' },
];
```

### Casos Reales (Basados en ARCHIVADORE1.docx)

**NOTA**: Estos son casos REALES del despacho. Se muestran aquí para desarrollo, pero los datos financieros y fechas son de ejemplo.

```typescript
const casosReales = [
  // Cliente recurrente: Carlos Moreno (20+ casos en FILE 1)
  {
    codigo: 'MORENO-01',
    cliente: 'Carlos Moreno',
    cliente_recurrente: true,
    descripcion_caso: 'REQUERIMIENTO DE PRISION PREVENTIVA',
    numero_expediente: '02437-2016',
    tipo: 'Penal',
    etapa: 'Juicio oral',
    forma_pago: 'Por etapas',
    monto_total: 50000,
    monto_cobrado: 35000,
    fecha_inicio: '2016-01-15',
    ubicacion_fisica: '1-A1',
    tomo: 'I',
    activo: true,
  },
  {
    codigo: 'MORENO-02',
    cliente: 'Carlos Moreno',
    cliente_recurrente: true,
    descripcion_caso: 'NEGOCIACION INCOMPATIBLE',
    numero_expediente: '357-2021',
    tipo: 'Penal',
    etapa: 'Investigación preparatoria',
    forma_pago: 'Por etapas',
    monto_total: 30000,
    monto_cobrado: 15000,
    fecha_inicio: '2021-03-10',
    ubicacion_fisica: '1-B5',
    activo: true,
  },
  {
    codigo: 'MORENO-03',
    cliente: 'Carlos Moreno',
    cliente_recurrente: true,
    descripcion_caso: 'PECULADO',
    numero_expediente: '185-2020',
    tipo: 'Penal',
    etapa: 'Etapa intermedia',
    forma_pago: 'Mensual',
    monto_total: 25000,
    monto_cobrado: 18000,
    fecha_inicio: '2020-06-20',
    ubicacion_fisica: '1-C2',
    activo: true,
  },

  // Cliente recurrente: Carlos Aguirre (15+ casos en FILE 5)
  {
    codigo: 'AGUIRRE-01',
    cliente: 'Carlos Aguirre',
    cliente_recurrente: true,
    descripcion_caso: 'SIS / CARLOS AGUIRRE',
    numero_expediente: '472-2017',
    tipo: 'Penal',
    etapa: 'Juicio oral',
    forma_pago: 'Por etapas',
    monto_total: 40000,
    monto_cobrado: 28000,
    fecha_inicio: '2017-08-10',
    ubicacion_fisica: '5-A1',
    tomo: 'I',
    activo: true,
  },
  {
    codigo: 'AGUIRRE-02',
    cliente: 'Carlos Aguirre',
    cliente_recurrente: true,
    descripcion_caso: 'MALVERSACION CALLAO - ALCIDES CARRION',
    numero_expediente: '45-2018',
    tipo: 'Penal',
    etapa: 'Apelación',
    forma_pago: 'Mensual',
    monto_total: 35000,
    monto_cobrado: 30000,
    fecha_inicio: '2018-02-15',
    ubicacion_fisica: '5-B3',
    activo: true,
  },
  {
    codigo: 'AGUIRRE-03',
    cliente: 'Carlos Aguirre',
    cliente_recurrente: true,
    descripcion_caso: 'CLINICAS - PAGOS INDEBIDOS',
    numero_expediente: '169-2019',
    tipo: 'Penal',
    etapa: 'Investigación preparatoria',
    forma_pago: 'Por etapas',
    monto_total: 28000,
    monto_cobrado: 10000,
    fecha_inicio: '2019-05-20',
    ubicacion_fisica: '5-C1',
    tomo: 'II',
    activo: true,
  },

  // Casos corporativos FILE 3
  {
    codigo: 'INPESCO-01',
    cliente: 'INPESCO SAC',
    cliente_recurrente: true,
    descripcion_caso: 'EJECUCION DE HIPOTECA',
    numero_expediente: '8515-2013',
    tipo: 'Civil',
    etapa: 'Etapa intermedia',
    forma_pago: 'Por etapas',
    monto_total: 60000,
    monto_cobrado: 45000,
    fecha_inicio: '2013-11-10',
    ubicacion_fisica: '3-A1',
    tomo: 'I',
    activo: true,
  },
  {
    codigo: 'BARAKA-01',
    cliente: 'Luka Miguel Baraka',
    cliente_recurrente: true,
    descripcion_caso: 'LAC CHIMBOTE',
    numero_expediente: '73-2015',
    tipo: 'Penal',
    etapa: 'Juicio oral',
    forma_pago: 'Mensual',
    monto_total: 55000,
    monto_cobrado: 40000,
    fecha_inicio: '2015-04-12',
    ubicacion_fisica: '3-C1',
    tomo: 'I',
    activo: true,
  },
  {
    codigo: 'NIPPON-01',
    cliente: 'Nippon',
    cliente_recurrente: true,
    descripcion_caso: 'LESIONES CONO NORTE',
    numero_expediente: '206-2015',
    tipo: 'Penal',
    etapa: 'Preliminar',
    forma_pago: 'Por etapas',
    monto_total: 32000,
    monto_cobrado: 12000,
    fecha_inicio: '2015-07-20',
    ubicacion_fisica: '3-E2',
    activo: true,
  },

  // Casos FILE 4
  {
    codigo: 'ENDOMED-01',
    cliente: 'Endomed',
    cliente_recurrente: false,
    descripcion_caso: 'COLUSION ESSALUD',
    numero_expediente: '74-2022',
    tipo: 'Penal',
    etapa: 'Investigación preparatoria',
    forma_pago: 'Mensual',
    monto_total: 38000,
    monto_cobrado: 15000,
    fecha_inicio: '2022-01-18',
    ubicacion_fisica: '4-A1',
    activo: true,
  },
  {
    codigo: 'VELEBIT-01',
    cliente: 'Velebit',
    cliente_recurrente: true,
    descripcion_caso: 'ACCION DE AMPARO',
    numero_expediente: '7620-2008',
    tipo: 'Administrativo',
    etapa: 'Etapa intermedia',
    forma_pago: 'Por etapas',
    monto_total: 45000,
    monto_cobrado: 40000,
    fecha_inicio: '2008-09-15',
    ubicacion_fisica: '4-C1',
    tomo: 'I',
    activo: true,
  },

  // Casos FILE 2 (múltiples clientes)
  {
    codigo: 'CORVETTO-01',
    cliente: 'Corvetto',
    cliente_recurrente: false,
    descripcion_caso: 'LAC',
    numero_expediente: '34-2017',
    tipo: 'Penal',
    etapa: 'Juicio oral',
    forma_pago: 'Por etapas',
    monto_total: 42000,
    monto_cobrado: 30000,
    fecha_inicio: '2017-02-10',
    ubicacion_fisica: '2-A1',
    tomo: 'I',
    activo: true,
  },
  {
    codigo: 'RISCO-01',
    cliente: 'Abrahan Risco',
    cliente_recurrente: false,
    descripcion_caso: 'PAGOS DE BENEFICIOS SOCIALES',
    tipo: 'Laboral',
    etapa: 'Preliminar',
    forma_pago: 'Por hora',
    monto_total: 15000,
    monto_cobrado: 8000,
    fecha_inicio: '2024-05-10',
    ubicacion_fisica: '2-B1',
    activo: true,
  },
  {
    codigo: 'MARTINEZ-01',
    cliente: 'Mildo Martinez',
    cliente_recurrente: true,
    descripcion_caso: 'LAC CASO SANTA',
    numero_expediente: '04-2021',
    tipo: 'Penal',
    etapa: 'Investigación preparatoria',
    forma_pago: 'Mensual',
    monto_total: 28000,
    monto_cobrado: 12000,
    fecha_inicio: '2021-01-15',
    ubicacion_fisica: '2-D2',
    activo: true,
  },

  // Casos FILE 7 (recientes)
  {
    codigo: 'AGUIRRE-M-01',
    cliente: 'Martha Aguirre',
    cliente_recurrente: true,
    descripcion_caso: 'BPM',
    numero_expediente: '162-2017',
    tipo: 'Penal',
    etapa: 'Juicio oral',
    forma_pago: 'Por etapas',
    monto_total: 32000,
    monto_cobrado: 20000,
    fecha_inicio: '2017-06-12',
    ubicacion_fisica: '7-A1',
    activo: true,
  },
  {
    codigo: 'MONTERO-01',
    cliente: 'Jenifer Montero',
    cliente_recurrente: true,
    descripcion_caso: 'COLUSION - NEGOCIACION INCOMPATIBLE',
    numero_expediente: '135-2020',
    tipo: 'Penal',
    etapa: 'Etapa intermedia',
    forma_pago: 'Mensual',
    monto_total: 35000,
    monto_cobrado: 18000,
    fecha_inicio: '2020-08-20',
    ubicacion_fisica: '7-C5',
    activo: true,
  },

  // Ejemplo de caso INACTIVO/ELIMINADO
  {
    codigo: 'IZQUIERDO-01',
    cliente: 'Izquierdo',
    descripcion_caso: 'HURTO',
    tipo: 'Penal',
    etapa: 'Preliminar',
    forma_pago: 'Por hora',
    monto_total: 8000,
    monto_cobrado: 8000, // Completamente cobrado
    fecha_inicio: '2018-03-10',
    ubicacion_fisica: '2-F5',
    activo: false, // CASO CERRADO
  },
];
```

### Características de los Casos Reales:

**Clientes Recurrentes** (múltiples casos):
- Carlos Moreno: 20+ casos (FILE 1)
- Carlos Aguirre: 15+ casos (FILE 5)
- INPESCO, Baraka, Velebit, Nippon: Corporativos con varios casos
- Martha Aguirre, Jenifer Montero: Varios casos

**Tipos de Casos Comunes**:
- Penal: Colusión, negociación incompatible, peculado, malversación, LAC
- Civil: Ejecución de hipotecas, desalojo
- Laboral: Beneficios sociales, reposición
- Administrativo: Amparo, contencioso administrativo

**Casos Multi-Tomo**:
- Muchos expedientes tienen tomos I, II, III, IV, V
- Ejemplo: Carlos Moreno (02437-2016) tiene 3 tomos
- Ejemplo: Carlos Aguirre (472-2017) tiene 3 tomos

**Casos Eliminados** (~100 en total):
- Ver lista al final del documento ARCHIVADORE1.docx
- Incluyen: Llerena, Izquierdo, Sotomayor, Burgos Entel, etc.

---

## 🔒 Consideraciones de Seguridad

### Datos Sensibles
- ✅ Información de clientes y casos legales (confidencial)
- ✅ Datos financieros del despacho
- ✅ Contraseñas de usuarios

### Medidas Implementadas
1. **Encriptación**: HTTPS obligatorio (Vercel lo incluye automáticamente)
2. **Autenticación**: JWT tokens con expiración de 7 días
3. **Contraseñas**: Hasheadas con bcrypt (12 rounds, nunca en texto plano)
4. **Variables de entorno**: Nunca committear `.env.local` al repositorio
5. **SQL Injection**: Prisma protege automáticamente (queries parametrizadas)
6. **XSS**: React escapa automáticamente el contenido
7. **CSRF**: NextAuth incluye protección CSRF
8. **Backup**: Supabase hace backup automático diario

### Recomendaciones Adicionales (Fase 2)
- Implementar rate limiting (evitar ataques de fuerza bruta)
- Log de accesos y cambios (auditoría)
- Autenticación de 2 factores (2FA) para administrador
- Encriptación de campos sensibles en BD (notas confidenciales)

---

## 💡 Notas para Desarrollo

### Prioridades de Implementación
1. **CRÍTICO**: Dashboard con alertas (evita perder audiencias)
2. **IMPORTANTE**: CRUD de casos y eventos (base del sistema)
3. **IMPORTANTE**: Proyección financiera (resolver flujo de caja)
4. **ÚTIL**: Buscador de expedientes (ahorra tiempo)
5. **NICE-TO-HAVE**: Fichas ejecutivas (mejora preparación)

### Decisiones Técnicas Clave

**¿Por qué Next.js y no React puro?**
- SEO no es prioridad pero Next.js ofrece API routes (no necesitamos backend separado)
- Más simple de deployar (un solo proyecto)
- Server components mejoran performance
- Muy fácil de hostear gratis en Vercel

**¿Por qué Prisma y no SQL directo?**
- Type-safety (TypeScript)
- Migraciones automáticas
- Queries más legibles
- Menos errores en producción

**¿Por qué Supabase y no MongoDB?**
- Datos relacionales (casos ↔ eventos ↔ pagos)
- SQL es mejor para reportes financieros
- Joins complejos en proyección de cobros
- Backup automático incluido

**¿Por qué Zustand y no Redux?**
- Mucho más simple (menos boilerplate)
- Suficiente para un equipo de 5 usuarios
- Curva de aprendizaje mínima

### Optimizaciones Futuras
- Implementar Server-Side Rendering (SSR) para dashboard (datos actualizados)
- Caché de consultas frecuentes (lista de casos activos)
- Lazy loading de componentes pesados (calendario)
- Service Worker para funcionar offline (PWA en Fase 3)
- Compresión de imágenes si se agregan fotos de documentos

---

## 📞 Contacto y Soporte

**Desarrollador**: Sebastián Risco
**Email**: sebastianrisco145@gmail.com
**Rol**: Analista de datos e implementación técnica

**Cliente**: Dr. [Nombre del Padre]
**Rol**: Abogado principal y usuario final

**Documentos Pendientes**:
- ⏳ Segundo documento con información detallada de casos
- ⏳ Confirmación de casos inactivos (tachados en rojo)
- ⏳ Fotos de estantes para mapping de ubicaciones
- ⏳ Decisión sobre quién hará la carga inicial de datos

---

## ✅ Checklist de Implementación

### Configuración Inicial
- [ ] Crear proyecto Next.js
- [ ] Configurar Tailwind CSS
- [ ] Instalar dependencias
- [ ] Configurar Prisma
- [ ] Crear base de datos en Supabase
- [ ] Configurar variables de entorno

### Base de Datos
- [ ] Crear tabla `users`
- [ ] Crear tabla `casos`
- [ ] Crear tabla `eventos`
- [ ] Crear tabla `pagos`
- [ ] Crear tabla `actividad_log`
- [ ] Crear índices para optimización
- [ ] Ejecutar seed con datos de ejemplo

### Autenticación
- [ ] Configurar NextAuth
- [ ] Crear página de login
- [ ] Implementar middleware de protección
- [ ] Crear store de autenticación (Zustand)

### Dashboard
- [ ] Layout principal con navbar y sidebar
- [ ] Componente de alertas con colores
- [ ] API de eventos próximos
- [ ] Resumen financiero
- [ ] Casos activos por etapa

### Casos
- [ ] API: Listar casos con filtros
- [ ] API: Crear caso
- [ ] API: Ver detalle de caso
- [ ] API: Editar caso
- [ ] API: Eliminar/inactivar caso
- [ ] Vista: Lista de casos con tabla
- [ ] Vista: Formulario crear/editar
- [ ] Vista: Detalle de caso completo
- [ ] Componente: Ficha ejecutiva

### Eventos y Calendario
- [ ] API: Listar eventos por rango
- [ ] API: Crear evento
- [ ] API: Editar evento
- [ ] API: Marcar evento como completado
- [ ] Vista: Calendario mensual
- [ ] Colores por tipo de evento
- [ ] Modal de detalle de evento

### Finanzas
- [ ] API: Registrar pago
- [ ] API: Proyección de cobros
- [ ] Vista: Dashboard financiero
- [ ] Gráfico: Cobrado vs Proyectado
- [ ] Tabla: Top casos pendientes

### Buscador
- [ ] API: Búsqueda por código/cliente/ubicación
- [ ] Vista: Buscador con resultados
- [ ] Destacar ubicación física

### Testing
- [ ] Probar login con todos los roles
- [ ] Probar CRUD de casos
- [ ] Verificar cálculos financieros
- [ ] Verificar colores de alertas
- [ ] Probar en tablet (768-1024px)
- [ ] Probar en móvil (<768px)
- [ ] Probar en desktop (>1024px)

### Deployment
- [ ] Crear repositorio en GitHub
- [ ] Conectar con Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy inicial
- [ ] Verificar conexión a Supabase
- [ ] Prueba end-to-end en producción

---

## 🎓 Referencias y Recursos

### Documentación Oficial
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Tutoriales Útiles
- [Next.js App Router Tutorial](https://nextjs.org/learn)
- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [NextAuth with Prisma](https://next-auth.js.org/adapters/prisma)

### Herramientas de Desarrollo
- [Prisma Studio](https://www.prisma.io/studio) - GUI para explorar BD
- [Vercel Dashboard](https://vercel.com/dashboard) - Monitoreo de deploy
- [Supabase Dashboard](https://app.supabase.com/) - Gestión de BD

---

## 🏁 Siguiente Paso

**Una vez leído este documento, el siguiente paso es:**

1. ✅ Confirmar que la estructura propuesta cumple con los requisitos
2. ✅ Obtener el segundo documento pendiente con información de casos
3. ✅ Decidir quién hará la carga inicial de ~80 casos
4. 🚀 Empezar implementación siguiendo el checklist

**Comando para comenzar:**
```bash
npx create-next-app@latest abogados-app --typescript --tailwind --app
```

---

*Documento creado por: Claude Code + Sebastián Risco*
*Fecha: 12 de Enero, 2026*
*Versión: 1.0 - Especificación Fase 1 MVP*
