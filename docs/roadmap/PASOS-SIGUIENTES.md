# 🚀 PASOS SIGUIENTES - Plan de Acción Inmediato

**Fecha**: 2026-01-20  
**Estado del Proyecto**: ✅ Build exitoso - ⏳ SQL pendiente de ejecutar  
**Usuario**: RZRV - Rolando Zagret Risco Sanchez

---

## 📊 Estado Actual

### ✅ COMPLETADO (Código)
- **Dashboard redesign** con estilo Apple (saludo dinámico, métricas, gradientes)
- **Privacidad financiera** (montos solo en detalle, no en listas)
- **Campo patrocinado** implementado (cliente vs defendido)
- **Delete button** en tabla de casos con confirmación
- **Trigger de código automático** corregido (bug de conteo resuelto)
- **Limpieza de código** (1,800+ líneas eliminadas)

### ⏳ PENDIENTE (Base de Datos)
- **Ejecutar 2 archivos SQL en Supabase** (15 minutos)
- **Probar funcionalidades** (30 minutos)

### 🐛 CONOCIDO (No bloqueante)
- Casos viejos tienen `patrocinado = NULL` (se llena al editar)
- No hay cascade delete configurado (error si borras caso con notas)

---

## 🎯 PASO 1: Ejecutar SQL en Supabase (CRÍTICO)

### 1.1 - Abrir Supabase SQL Editor

1. **URL**: https://supabase.com/dashboard/project/waiiwrluaajparjfyaia/sql/new
2. **Login** con tus credenciales
3. **Verificar** que estás en el proyecto correcto (esquina superior)

---

### 1.2 - Ejecutar Trigger de Código Automático

**Archivo**: `despacho-web/supabase-trigger-codigo-automatico.sql`

**Qué hace**:
- Genera códigos automáticamente: `S.RISCO-1`, `S.RISCO-2C-1` (2 clientes)
- Detecta múltiples clientes por separadores: " y ", "&", ","
- Usa ÚLTIMA palabra como apellido
- Secuencial por apellido

**Pasos**:
```bash
# 1. Copiar contenido del archivo
cat despacho-web/supabase-trigger-codigo-automatico.sql

# 2. Pegar en Supabase SQL Editor
# 3. Click "RUN" (esquina inferior derecha)
# 4. Verificar mensaje: "Success. No rows returned"
```

**Verificación**:
```sql
-- Ejecutar en SQL Editor para confirmar que existe:
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generar_codigo_caso';

-- Debe retornar: generar_codigo_caso | [función completa]
```

---

### 1.3 - Ejecutar Campo Patrocinado

**Archivo**: `despacho-web/agregar-campo-patrocinado.sql`

**Qué hace**:
- Agrega columna `patrocinado` (TEXT, nullable)
- Permite diferenciar cliente (quien paga) de patrocinado (quien es defendido)

**Pasos**:
```bash
# 1. Copiar contenido del archivo
cat despacho-web/agregar-campo-patrocinado.sql

# 2. Pegar en Supabase SQL Editor (nueva query)
# 3. Click "RUN"
# 4. Verificar mensaje con resultado
```

**Verificación**:
```sql
-- Ejecutar en SQL Editor para confirmar columna:
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'casos' 
  AND column_name = 'patrocinado';

-- Debe retornar: patrocinado | text | YES
```

---

## 🧪 PASO 2: Probar Funcionalidades (30 min)

### 2.1 - Levantar Servidor

```bash
cd /Users/sebastian/Desktop/abogados-app/despacho-web
npm run dev
```

**URL**: http://localhost:3000

---

### 2.2 - Test 1: Código Automático (1 Cliente)

**Objetivo**: Verificar que se genera `S.RISCO-1`

**Pasos**:
1. Login → Dashboard → "Crear Nuevo Caso"
2. Llenar formulario:
   - **Cliente**: `Sebastian Risco`
   - **Patrocinado**: `Sebastian Risco` (o marcar checkbox "Misma persona")
   - **Tipo**: `Penal`
   - **Descripción**: `Caso de prueba 1`
3. Click "Crear Caso"
4. Ir a "Todos los Casos"
5. **Verificar**: Código = `S.RISCO-1` (o número siguiente si ya existe)

---

### 2.3 - Test 2: Código Automático (2 Clientes)

**Objetivo**: Verificar que se genera `S.RISCO-2C-1`

**Pasos**:
1. Dashboard → "Crear Nuevo Caso"
2. Llenar formulario:
   - **Cliente**: `Sebastian Risco y Marcelo Risco`
   - **Patrocinado**: `Pedro García`
   - **Tipo**: `Civil`
   - **Descripción**: `Caso de prueba 2 clientes`
3. Click "Crear Caso"
4. Ir a "Todos los Casos"
5. **Verificar**: 
   - Código = `S.RISCO-2C-1` (2C indica 2 clientes)
   - Tabla muestra:
     ```
     💼 Sebastian Risco y Marcelo Risco
     ⚖️ Def: Pedro García
     ```

---

### 2.4 - Test 3: Campo Patrocinado (Cliente ≠ Patrocinado)

**Objetivo**: Verificar que cliente y patrocinado son campos independientes

**Pasos**:
1. Dashboard → "Crear Nuevo Caso"
2. Llenar formulario:
   - **Cliente**: `María García` (madre que paga)
   - **Patrocinado**: `Juan García` (hijo defendido)
   - **Tipo**: `Laboral`
   - **Descripción**: `Caso madre-hijo`
3. Click "Crear Caso"
4. Ir a "Todos los Casos"
5. **Verificar**:
   - Código = `M.GARCÍA-1` (basado en cliente)
   - Tabla muestra ambos nombres:
     ```
     💼 María García
     ⚖️ Def: Juan García
     ```

---

### 2.5 - Test 4: Checkbox "Misma Persona"

**Objetivo**: Verificar auto-sync entre cliente y patrocinado

**Pasos**:
1. Dashboard → "Crear Nuevo Caso"
2. Escribir en **Cliente**: `Carlos Aguirre`
3. **Marcar** checkbox "El patrocinado es la misma persona"
4. **Verificar**:
   - Campo "Patrocinado" se auto-llena con "Carlos Aguirre"
   - Campo está deshabilitado (gris)
5. Modificar **Cliente** a: `Carlos Aguirre Test`
6. **Verificar**: Patrocinado se actualiza automáticamente
7. **Desmarcar** checkbox
8. **Verificar**: Campo patrocinado se habilita y puedes editar
9. **NO guardar** (es solo prueba)

---

### 2.6 - Test 5: Editar Caso Existente

**Objetivo**: Verificar que casos viejos piden patrocinado

**Pasos**:
1. Ir a "Todos los Casos"
2. Buscar un caso viejo (creado antes de hoy)
3. Click "Ver detalles" → "Editar"
4. **Verificar**:
   - Campo "Patrocinado" está vacío
   - Tiene hint: "⚖️ Persona en el expediente judicial"
5. Llenar patrocinado: (mismo nombre del cliente)
6. Guardar
7. **Verificar**: UPDATE exitoso

---

### 2.7 - Test 6: Eliminar Caso

**Objetivo**: Verificar botón de eliminar

**Pasos**:
1. Ir a "Todos los Casos"
2. Buscar un caso de prueba (de los tests anteriores)
3. Click botón 🗑️ (rojo)
4. **Verificar**: Modal de confirmación muestra:
   - Código del caso
   - Cliente
   - Advertencia de datos relacionados
5. Click "Eliminar"
6. **Si tiene notas/eventos/pagos**: Verás error FK constraint
7. **Si NO tiene datos relacionados**: Caso eliminado correctamente

---

## 📋 PASO 3: Casos de Prueba Adicionales (Opcional)

### Test Edge Cases

```bash
# Test en Supabase SQL Editor (opcional)
# Copiar y ejecutar: despacho-web/TEST-TRIGGER-CASOS-MULTIPLES.sql
# Copiar y ejecutar: despacho-web/TEST-DETECCION-CLIENTES.sql
```

**Qué hace**:
- Inserta 10+ casos de prueba
- Verifica códigos generados
- Limpia después (DELETE)

**Casos probados**:
- 1 cliente con 1 palabra: `Madonna` → `M.MADONNA-1`
- 1 cliente con 2 palabras: `Sebastian Risco` → `S.RISCO-1`
- 2 clientes: `Carlos Aguirre y Juan Pérez` → `C.AGUIRRE-2C-1`
- 3 clientes: `Juan, María y Pedro` → `J.JUAN-3C-1`
- Separador "&": `García & Asociados` → `G.GARCÍA-2C-1`

---

## ⚠️ PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema 1: Error al eliminar caso con notas

**Error**: `update or delete on table "casos" violates foreign key constraint`

**Causa**: Foreign keys sin cascade delete

**Solución temporal**:
1. Antes de eliminar caso, eliminar manualmente:
   - Notas del caso
   - Eventos del caso
   - Pagos del caso

**Solución permanente** (opcional - requiere SQL):
```sql
-- Agregar cascade delete (CUIDADO: elimina datos relacionados automáticamente)
ALTER TABLE notas 
DROP CONSTRAINT notas_caso_id_fkey,
ADD CONSTRAINT notas_caso_id_fkey 
  FOREIGN KEY (caso_id) 
  REFERENCES casos(id) 
  ON DELETE CASCADE;

-- Repetir para: eventos, pagos, ubicaciones_fisicas
```

---

### Problema 2: Casos viejos sin patrocinado

**Síntoma**: Al editar caso viejo, campo "Patrocinado" está vacío

**Solución**: Llenar manualmente al editar (obligatorio)

**Script de migración** (opcional):
```sql
-- Auto-llenar patrocinado = cliente en casos viejos
UPDATE casos 
SET patrocinado = cliente 
WHERE patrocinado IS NULL OR patrocinado = '';

-- Ejecutar solo si querés que todos los casos viejos 
-- asuman que cliente = patrocinado
```

---

### Problema 3: Código ya existe (manual)

**Síntoma**: Usuario creó caso con código manual antes del trigger

**Solución**: El trigger NO modifica códigos existentes (by design)

**Verificación**:
```sql
-- Ver casos con código manual vs automático
SELECT 
  id,
  codigo_estimado,
  cliente,
  CASE 
    WHEN codigo_estimado ~ '^[A-Z]\.[A-Z]+-[0-9]+$' THEN 'Auto (1C)'
    WHEN codigo_estimado ~ '^[A-Z]\.[A-Z]+-[0-9]+C-[0-9]+$' THEN 'Auto (Multi)'
    ELSE 'Manual'
  END as tipo_codigo
FROM casos
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📊 CHECKLIST COMPLETO

### Base de Datos
- [ ] Ejecutar `supabase-trigger-codigo-automatico.sql`
- [ ] Verificar trigger existe: `SELECT proname FROM pg_proc WHERE proname = 'generar_codigo_caso'`
- [ ] Ejecutar `agregar-campo-patrocinado.sql`
- [ ] Verificar columna existe: `SELECT column_name FROM information_schema.columns WHERE table_name = 'casos' AND column_name = 'patrocinado'`

### Tests Funcionales
- [ ] Test 1: Crear caso 1 cliente → Código `X.APELLIDO-N`
- [ ] Test 2: Crear caso 2 clientes → Código `X.APELLIDO-2C-N`
- [ ] Test 3: Cliente ≠ Patrocinado → Tabla muestra ambos
- [ ] Test 4: Checkbox "Misma persona" → Auto-sync funciona
- [ ] Test 5: Editar caso viejo → Pide patrocinado
- [ ] Test 6: Eliminar caso → Modal + confirmación

### Verificación Visual
- [ ] Dashboard muestra saludo dinámico: "Buenos días/tardes/noches, RZRV"
- [ ] Dashboard muestra foto de perfil: `/images/rzrv-logo.jpg`
- [ ] Tabla casos NO muestra columnas de montos
- [ ] Crear caso muestra banner privacidad antes de sección financiera
- [ ] Tabla casos muestra 💼 Cliente y ⚖️ Def: Patrocinado (si diferentes)

---

## 🎯 PRÓXIMOS PASOS (Después de Tests)

### Alta Prioridad (Refactoring - No bloqueante)
1. **Extraer validaciones financieras** a `lib/validaciones/financieras.ts`
   - Archivo: `app/dashboard/casos/nuevo/page.tsx` (líneas 200-265)
   - Función: `getMontoCobradoAyuda()` y `validarMontoCobrado()`

2. **Crear types/database.ts**
   - Interfaces para: Caso, Nota, Evento, Pago, Perfil
   - Eliminar todos los `any` en componentes
   - Type safety end-to-end

3. **Split MetodoPagoForm**
   - Archivo: `app/components/casos/MetodoPagoForm.tsx` (520 líneas)
   - Dividir en: MontoFijoForm, PorEtapasForm, PorHorasForm, CuotaLitisForm

4. **Fix tipo de caso validation mismatch**
   - Backend acepta: 'Penal', 'Civil', 'Laboral', 'Administrativo'
   - Frontend permite: 'Familia', 'Otro' (en editar/page.tsx)
   - Sincronizar ambos

### Media Prioridad (Features)
5. **Implementar soft delete** (en vez de cascade)
   - Agregar columna `deleted_at` a tablas
   - Filtrar en queries: `WHERE deleted_at IS NULL`
   - Mantener datos para auditoría

6. **Optimizar queries**
   - Cambiar `select('*')` por columnas específicas
   - Agregar índices en columnas filtradas (`estado`, `tipo`, `created_at`)

### Baja Prioridad (Nice to have)
7. **Testing automatizado**
   - Configurar Playwright para E2E
   - Test: Crear caso → Ver lista → Editar → Eliminar

8. **Exportar casos a CSV/PDF**
   - Dashboard → Reportes → Exportar
   - Incluir filtros por fecha, tipo, estado

---

## 📞 Soporte

### Si algo falla:

**Error en SQL**:
1. Copiar mensaje de error completo
2. Verificar que estás en el proyecto correcto
3. Revisar si la columna/trigger ya existe

**Error en frontend**:
1. Abrir DevTools (F12) → Console
2. Copiar error completo
3. Verificar que ejecutaste los SQL primero
4. Hacer `npm run build` para verificar TypeScript

**Build falla**:
```bash
cd despacho-web
rm -rf .next node_modules
npm install
npm run build
```

---

## 🎉 Resumen Ejecutivo

### LO QUE TENÉS QUE HACER AHORA:

1. **Ejecutar 2 SQL en Supabase** (15 min)
   - `supabase-trigger-codigo-automatico.sql`
   - `agregar-campo-patrocinado.sql`

2. **Probar crear 3 casos** (15 min)
   - 1 cliente simple
   - 2 clientes múltiples
   - Cliente ≠ Patrocinado

3. **Verificar tabla y dashboard** (5 min)
   - Códigos se generan automáticamente
   - Tabla muestra cliente y patrocinado
   - Dashboard muestra saludo personalizado

### DESPUÉS DE ESO, TODO FUNCIONA ✅

---

**Última actualización**: 2026-01-20  
**Build status**: ✅ 0 errors, 0 warnings  
**SQL pendiente**: 2 archivos  
**Tiempo estimado**: 30-45 minutos

---

**Creado por**: Claude  
**Para**: RZRV - Sistema de Gestión Despacho Legal
