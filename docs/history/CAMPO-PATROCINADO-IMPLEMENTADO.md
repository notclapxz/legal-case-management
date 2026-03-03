# ✅ CAMPO PATROCINADO - Implementación Completa

**Fecha**: 2026-01-19  
**Implementado por**: Claude  
**Usuario**: RZRV - Rolando Zagret Risco Sanchez

---

## 🎯 Concepto Implementado

### **Diferencia Cliente vs Patrocinado**

**Cliente** (quien paga):
- Persona o entidad que contrata el servicio legal
- Tiene la obligación de pagar los honorarios
- Se usa para generar el código del caso

**Patrocinado** (quien es defendido):
- Persona que aparece en el expediente judicial
- El beneficiario del servicio legal
- Puede ser una o varias personas

### **Ejemplos**:

| Cliente | Patrocinado | Código | Caso |
|---------|-------------|--------|------|
| Juan Pérez | Juan Pérez | J.PÉREZ-1 | Cliente se defiende a sí mismo |
| María García | Pedro García | M.GARCÍA-1 | Madre paga, hijo es defendido |
| Empresa ABC | Carlos López | E.ABC-1 | Empresa paga, empleado defendido |
| Juan Pérez | Juan Pérez y María García | J.PÉREZ-2C-1 | Cliente + otra persona |

---

## 📋 Cambios Implementados

### **1. Base de Datos**

**SQL Ejecutar**:
```sql
ALTER TABLE casos ADD COLUMN IF NOT EXISTS patrocinado TEXT;
```

**Características**:
- ✅ Columna `patrocinado` tipo TEXT
- ✅ Nullable (casos viejos quedan con NULL)
- ✅ No afecta datos existentes

**Archivo**: `agregar-campo-patrocinado.sql`

---

### **2. Formulario Nuevo Caso**

**Archivo**: `app/dashboard/casos/nuevo/page.tsx`

**Cambios**:
```typescript
// Estado
const [caso, setCaso] = useState({
  cliente: '',       // Genera el código
  patrocinado: '',   // Obligatorio
  // ...
})

const [mismaPersona, setMismaPersona] = useState(false)

// Auto-sync si checkbox activado
useEffect(() => {
  if (mismaPersona) {
    setCaso(prev => ({ ...prev, patrocinado: prev.cliente }))
  }
}, [caso.cliente, mismaPersona])

// Validación
if (!caso.patrocinado.trim()) {
  errors.push('El patrocinado es obligatorio')
}

// INSERT
const casoData = {
  cliente: caso.cliente.trim(),
  patrocinado: caso.patrocinado.trim(),
  // ...
}
```

**UI**:
```tsx
<div>
  <label>Cliente (quien paga) *</label>
  <input value={caso.cliente} onChange={...} required />
  <p className="text-xs">
    💼 Persona que contrata y paga. El código se generará de este nombre.
  </p>
</div>

<div>
  <label>Patrocinado (quien es defendido) *</label>
  <input 
    value={caso.patrocinado} 
    onChange={...} 
    disabled={mismaPersona}
    required 
  />
  <label>
    <input 
      type="checkbox"
      checked={mismaPersona}
      onChange={...}
    />
    El patrocinado es la misma persona que el cliente
  </label>
  <p className="text-xs">
    ⚖️ Persona que aparece en el expediente judicial. Puede ser una o varias.
  </p>
</div>
```

---

### **3. Formulario Editar Caso**

**Archivo**: `app/dashboard/casos/[id]/editar/page.tsx`

**Cambios**:
```typescript
// Estado
const [formData, setFormData] = useState({
  cliente: '',
  patrocinado: '',
  // ...
})

const [mismaPersona, setMismaPersona] = useState(false)

// Cargar datos
setFormData({
  cliente: caso.cliente || '',
  patrocinado: caso.patrocinado || '',
  // ...
})

// Verificar si son iguales
setMismaPersona(caso.cliente === caso.patrocinado)

// Auto-sync
useEffect(() => {
  if (mismaPersona) {
    setFormData(prev => ({ ...prev, patrocinado: prev.cliente }))
  }
}, [formData.cliente, mismaPersona])

// UPDATE
await supabase.from('casos').update({
  cliente: formData.cliente,
  patrocinado: formData.patrocinado,
  // ...
})
```

**UI**: Mismo diseño que formulario nuevo

---

### **4. Tabla de Casos**

**Archivo**: `app/dashboard/casos/components/TablaCasos.tsx`

**Cambio**:
```tsx
<td className="px-6 py-4 text-sm text-gray-900">
  <div>
    <p className="font-medium">💼 {caso.cliente}</p>
    {caso.patrocinado && caso.patrocinado !== caso.cliente && (
      <p className="text-xs text-gray-500 mt-1">
        ⚖️ Def: {caso.patrocinado}
      </p>
    )}
  </div>
</td>
```

**Vista**:
```
┌──────────────────────┐
│ Cliente              │
├──────────────────────┤
│ 💼 María García      │
│ ⚖️ Def: Pedro García │
└──────────────────────┘
```

Si cliente = patrocinado, solo muestra una línea.

---

## 🔧 Funcionalidades Implementadas

### **1. Checkbox "Misma Persona"**

**Comportamiento**:
- ✅ Si activado: Campo patrocinado se desactiva y auto-copia el cliente
- ✅ Si usuario modifica cliente: Patrocinado se actualiza automáticamente
- ✅ Si desactivado: Campo patrocinado se limpia y usuario puede escribir

**Código**:
```typescript
useEffect(() => {
  if (mismaPersona) {
    setCaso(prev => ({ ...prev, patrocinado: prev.cliente }))
  }
}, [caso.cliente, mismaPersona])
```

---

### **2. Múltiples Patrocinados**

**Formato**: Texto libre
```
Ejemplos válidos:
- "Juan Pérez"
- "Juan Pérez y María García"
- "Pedro, Juan y María López"
```

**Nota**: El código se genera solo del **cliente**, no del patrocinado.

---

### **3. Validación**

**Obligatorio**:
```typescript
if (!caso.patrocinado.trim()) {
  errors.push('El patrocinado es obligatorio')
}
```

**No puede ser vacío** al crear o editar caso.

---

## 📊 Flujo Completo

### **Crear Caso - Opción A (Misma Persona)**

```
1. Usuario llena "Cliente": "Juan Pérez"
2. Usuario marca checkbox "Misma persona"
3. Campo "Patrocinado" se auto-llena: "Juan Pérez" (disabled)
4. Usuario guarda
5. BD almacena:
   - cliente: "Juan Pérez"
   - patrocinado: "Juan Pérez"
   - código: J.PÉREZ-1
```

---

### **Crear Caso - Opción B (Persona Diferente)**

```
1. Usuario llena "Cliente": "María García"
2. Usuario llena "Patrocinado": "Pedro García"
3. Checkbox NO marcado
4. Usuario guarda
5. BD almacena:
   - cliente: "María García"
   - patrocinado: "Pedro García"
   - código: M.GARCÍA-1
```

---

### **Editar Caso**

```
1. Sistema carga caso existente
2. Si cliente == patrocinado: Checkbox se marca automáticamente
3. Usuario puede modificar cualquier campo
4. Si cambia cliente con checkbox marcado: Patrocinado se sincroniza
5. Usuario guarda
6. UPDATE en BD con ambos campos
```

---

## 🗄️ Compatibilidad con Datos Existentes

### **Casos Viejos (sin patrocinado)**

```sql
-- Casos creados antes de este cambio:
cliente: "Carlos Aguirre"
patrocinado: NULL  ✅ Permitido

-- Al editar:
- Frontend muestra campo vacío
- Usuario DEBE llenar patrocinado
- Validación requiere valor
```

**Comportamiento**:
- ✅ Casos viejos siguen funcionando (patrocinado = NULL)
- ✅ Al editar caso viejo, se debe agregar patrocinado
- ✅ Nuevos casos SIEMPRE requieren patrocinado

---

## 📁 Archivos Modificados

```
✅ agregar-campo-patrocinado.sql                      (NUEVO - ejecutar en Supabase)
✅ app/dashboard/casos/nuevo/page.tsx                 (MODIFICADO)
   - Agregado campo patrocinado
   - Agregado estado mismaPersona
   - Agregado useEffect auto-sync
   - Agregado validación
   - Actualizado INSERT
   
✅ app/dashboard/casos/[id]/editar/page.tsx           (MODIFICADO)
   - Agregado campo patrocinado
   - Agregado estado mismaPersona
   - Agregado useEffect auto-sync
   - Actualizado UPDATE
   - Auto-detecta si son iguales al cargar

✅ app/dashboard/casos/components/TablaCasos.tsx      (MODIFICADO)
   - Muestra cliente + patrocinado (si diferentes)
   - Formato: 💼 Cliente / ⚖️ Def: Patrocinado
```

---

## 🚀 Pasos para Activar

### **PASO 1: Ejecutar SQL en Supabase**

1. Abrir Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/waiiwrluaajparjfyaia/sql/new
   ```

2. Copiar contenido de:
   ```
   /Users/sebastian/Desktop/abogados-app/despacho-web/agregar-campo-patrocinado.sql
   ```

3. Pegar y ejecutar **RUN**

4. Verificar:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'casos' AND column_name = 'patrocinado';
   -- Debe retornar: patrocinado
   ```

---

### **PASO 2: Probar en la App**

1. Levantar servidor:
   ```bash
   npm run dev
   ```

2. Crear caso nuevo:
   - Ir a `/dashboard/casos/nuevo`
   - Llenar cliente: "María García"
   - Llenar patrocinado: "Pedro García"
   - Guardar
   - Verificar código: `M.GARCIA-1` o `M.GARCIA-2C-1`

3. Crear caso misma persona:
   - Cliente: "Juan Pérez"
   - Marcar checkbox "Misma persona"
   - Ver que patrocinado se auto-llena
   - Guardar

4. Ver tabla:
   - Ir a `/dashboard/casos`
   - Verificar que muestra cliente + patrocinado
   - Si son iguales, solo muestra uno

5. Editar caso:
   - Click "Ver detalles" → "Editar"
   - Modificar patrocinado
   - Guardar
   - Verificar UPDATE

---

## ✅ Build Status

```bash
npm run build
✓ Compiled successfully
0 errors, 0 warnings
13 routes generated
```

---

## 🎯 Checklist de Verificación

- [ ] Ejecutar SQL `agregar-campo-patrocinado.sql`
- [ ] Verificar columna existe: `SELECT * FROM casos LIMIT 1`
- [ ] Crear caso con cliente = patrocinado (checkbox)
- [ ] Crear caso con cliente ≠ patrocinado
- [ ] Ver tabla muestra ambos campos correctamente
- [ ] Editar caso y modificar patrocinado
- [ ] Verificar código se genera por cliente (no patrocinado)
- [ ] Probar con múltiples patrocinados: "Juan y María"

---

## 📊 Resumen Visual

### **Formulario Nuevo Caso**:
```
┌────────────────────────────────────────────┐
│ Cliente (quien paga) *                     │
│ [María García]                             │
│ 💼 El código se generará de este nombre    │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Patrocinado (quien es defendido) *         │
│ [Pedro García]                             │
│ ☐ El patrocinado es la misma persona      │
│ ⚖️ Persona en el expediente judicial       │
└────────────────────────────────────────────┘
```

### **Tabla de Casos**:
```
┌──────┬────────────────────┬─────┬────────┐
│Código│ Cliente            │Tipo │Acciones│
├──────┼────────────────────┼─────┼────────┤
│M.GAR-│💼 María García     │Penal│[Ver]🗑️│
│CIA-1 │⚖️ Def: Pedro García│     │        │
├──────┼────────────────────┼─────┼────────┤
│J.PER-│💼 Juan Pérez       │Civil│[Ver]🗑️│
│EZ-1  │                    │     │        │
└──────┴────────────────────┴─────┴────────┘
```

---

## 🎉 Conclusión

**TODO IMPLEMENTADO**:
- ✅ Campo patrocinado en BD (nullable)
- ✅ Formulario nuevo con checkbox
- ✅ Formulario editar con auto-sync
- ✅ Tabla muestra ambos campos
- ✅ Validación obligatoria
- ✅ Soporta múltiples patrocinados
- ✅ Código se genera por cliente
- ✅ Build exitoso sin errores

**Pendiente**:
- ⏳ Ejecutar SQL en Supabase
- ⏳ Probar crear caso nuevo
- ⏳ Verificar funcionamiento

---

**Autor**: Claude  
**Fecha**: 2026-01-19  
**Versión**: 2.5.0
