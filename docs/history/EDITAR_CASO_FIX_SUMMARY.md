# Fix: Página de Edición de Casos

**Fecha**: 20 de enero 2026  
**Status**: ✅ **COMPLETADO**  
**Issue**: Página de edición tenía MENOS campos que la de creación

---

## 🐛 Problema Detectado

El usuario reportó que al **editar un caso** faltaban opciones comparado con **crear un caso**.

### **Antes del Fix**

**Página "Editar Caso" (`/dashboard/casos/[id]/editar/page.tsx`)** tenía:
- ❌ **NO** tenía campo `etapa` (Preliminar, Investigación, Juicio oral, etc.)
- ❌ **NO** tenía campo `estado_caso` (En proceso, Ganado, Perdido)
- ❌ **NO** tenía campo `monto_cobrado`
- ❌ **NO** tenía campo `abogado_asignado_id`
- ❌ **NO** tenía `MetodoPagoForm` completo (solo select simple)
- ❌ **NO** tenía validaciones financieras
- ❌ **NO** tenía banner de privacidad
- 🐛 **BUG**: Forma de pago tenía opción duplicada (líneas 355-360)
- 🐛 **BUG**: Campo "Estado" solo mostraba Activo/Pausado/Cerrado (no coincide con BD que tiene Activo/Inactivo)

**Página "Nuevo Caso" (`/dashboard/casos/nuevo/page.tsx`)** tenía:
- ✅ Todos los campos completos
- ✅ Validaciones inteligentes
- ✅ MetodoPagoForm con detalles de cuotas, etapas, honorarios
- ✅ Monto cobrado con ayuda contextual

---

## ✅ Solución Implementada

**Reescribí completamente** `/app/dashboard/casos/[id]/editar/page.tsx` para que sea **idéntica** a la página de creación.

### **Campos Agregados**

1. ✅ **Etapa del Proceso** (select con 7 opciones):
   - Preliminar
   - Investigación preparatoria
   - Etapa intermedia
   - Juicio oral
   - Ejecución de sentencia
   - Impugnación
   - Archivo

2. ✅ **Estado del Caso** (Activo/Inactivo):
   - Corregido: ahora usa valores correctos de BD
   - Antes: Activo/Pausado/Cerrado ❌
   - Ahora: Activo/Inactivo ✅

3. ✅ **Estado Procesal** (En proceso/Ganado/Perdido):
   - Campo nuevo agregado
   - Separado de "Estado" (son dos campos distintos en BD)

4. ✅ **Monto Cobrado** (con ayuda contextual):
   ```typescript
   💡 Cuotas pagadas hasta la fecha  // Si es "Monto fijo"
   💡 Suma de etapas completadas     // Si es "Por etapas"
   💡 Total facturado por horas      // Si es "Por hora"
   💡 Generalmente S/ 0              // Si es "Cuota litis"
   ```

5. ✅ **MetodoPagoForm Completo**:
   - Integrado componente `MetodoPagoForm.tsx`
   - Muestra detalles específicos según forma de pago:
     - **Monto fijo**: Cuotas y período
     - **Por etapas**: Detalle de cada etapa con montos
     - **Por hora**: Tarifa horaria y horas trabajadas
     - **Cuota litis**: Porcentaje y condiciones

6. ✅ **Validaciones Financieras**:
   - Importadas desde `lib/validaciones/financieras.ts`
   - `validarMontoCobrado()` - Verifica coherencia según forma de pago
   - `validarPorHora()` - Valida tarifa y horas
   - Validaciones específicas por método de pago

7. ✅ **Banner de Privacidad**:
   ```tsx
   🔒 Los datos financieros son confidenciales y solo visibles 
       en el detalle del caso.
   ```

8. ✅ **Checkbox "Misma Persona"**:
   - Auto-sincroniza patrocinado con cliente
   - Deshabilita campo cuando está marcado

---

## 🔧 Cambios Técnicos

### **Estructura del Estado**

**Antes**:
```typescript
const [formData, setFormData] = useState({
  codigo_estimado: '',
  cliente: '',
  patrocinado: '',
  descripcion: '',
  expediente: '',
  tipo: 'Penal',
  estado: 'Activo',          // ❌ Solo este campo
  forma_pago: 'Por etapas',  // ❌ String simple
  monto_total: '',           // ❌ String
  ubicacion_fisica: '',
  fecha_inicio: '',
})
```

**Después**:
```typescript
const [formData, setFormData] = useState({
  codigo_estimado: '',
  cliente: '',
  patrocinado: '',
  descripcion: '',
  expediente: '',
  tipo: 'Penal' as TipoCaso,
  etapa: 'Preliminar',                        // ✅ NUEVO
  estado: 'Activo' as EstadoCaso,             // ✅ Tipado correcto
  estado_caso: 'En proceso' as EstadoProcesal,// ✅ NUEVO
  forma_pago: 'Monto fijo' as FormaPago | '', // ✅ Tipado correcto
  monto_total: 0,                             // ✅ Number
  monto_cobrado: 0,                           // ✅ NUEVO
  ubicacion_fisica: '',
  fecha_inicio: '',
  abogado_asignado_id: '',                    // ✅ NUEVO
})

const [detalles_pago, setDetallesPago] = useState({
  cuotas: 1,
  periodo: 'Mensual' as 'Mensual' | 'Quincenal' | 'Semanal',
  honorario_exito: 0,
  numero_etapas: 1,
  etapas: [{ numero: 1, monto: 0 }],
  porcentaje_litis: 20,
  condicion_litis: '',
  caso_ganado: false,
  tipo_caso: 'Penal',
  tarifa_hora: 150,
  horas_estimadas: 0,
  horas_trabajadas: 0
})
```

### **Función de Validación**

Agregada función `validateForm()` que valida:
- ✅ Campos obligatorios (cliente, patrocinado, descripción, fecha)
- ✅ Montos no negativos
- ✅ Coherencia de monto cobrado según forma de pago
- ✅ Total de etapas coincide con monto total
- ✅ Porcentaje de cuota litis válido
- ✅ Tarifa horaria y horas trabajadas válidas

### **Integración con MetodoPagoForm**

```typescript
<MetodoPagoForm
  forma_pago={formData.forma_pago}
  monto_total={formData.monto_total}
  monto_cobrado={formData.monto_cobrado}      // ✅ NUEVO
  estado_caso={formData.estado_caso}          // ✅ NUEVO
  detalles_pago={detalles_pago}               // ✅ NUEVO
  onChange={(fp, detalles) => {
    setFormData({ ...formData, forma_pago: fp })
    setDetallesPago(prev => ({ ...prev, ...detalles }))
  }}
/>
```

### **Update Query Mejorado**

**Antes**:
```typescript
await supabase.from('casos').update({
  cliente: formData.cliente,
  patrocinado: formData.patrocinado,
  descripcion: formData.descripcion,
  expediente: formData.expediente || null,
  tipo: formData.tipo,
  estado: formData.estado,
  forma_pago: formData.forma_pago,
  monto_total: parseFloat(formData.monto_total) || 0,
  ubicacion_fisica: tipoExpediente === 'fisico' ? formData.ubicacion_fisica || null : null,
  fecha_inicio: formData.fecha_inicio,
}).eq('id', id)
```

**Después**:
```typescript
await supabase.from('casos').update({
  cliente: formData.cliente.trim(),
  patrocinado: formData.patrocinado.trim(),
  descripcion: formData.descripcion?.trim() || '',
  expediente: formData.expediente?.trim() || null,
  tipo: formData.tipo,
  etapa: formData.etapa,                      // ✅ NUEVO
  estado: formData.estado,
  estado_caso: formData.estado_caso,          // ✅ NUEVO
  forma_pago: formData.forma_pago,
  monto_total: formData.monto_total,          // ✅ Ya es number
  monto_cobrado: formData.monto_cobrado,      // ✅ NUEVO
  ubicacion_fisica: formData.ubicacion_fisica?.trim() || null,
  fecha_inicio: formData.fecha_inicio,
}).eq('id', id)
```

---

## 🎨 Mejoras de UI/UX

1. **Loading States**:
   - Spinner animado mientras carga datos
   - Botón muestra "Guardando..." con spinner durante submit
   - Botones deshabilitados durante loading

2. **Ayuda Contextual**:
   - Íconos descriptivos (💼, ⚖️, 🔒, 📦, 💡)
   - Tooltips explicativos en cada campo
   - Mensajes de ayuda según forma de pago seleccionada

3. **Validación Visual**:
   - Errores se muestran en banner rojo con ícono ⚠️
   - Campos requeridos marcados con *
   - Campos deshabilitados tienen estilo gris

4. **Consistencia con Creación**:
   - Mismo orden de campos
   - Mismos placeholders
   - Mismos estilos Tailwind
   - Misma lógica de validación

---

## 📊 Comparación Antes/Después

| Característica | Antes | Después |
|----------------|-------|---------|
| **Campos totales** | 10 | 15 |
| **Validaciones** | 0 | 10+ |
| **Campos financieros** | 2 (forma_pago, monto_total) | 4 + detalles_pago |
| **Estados del caso** | 1 campo (estado) | 2 campos (estado + estado_caso) |
| **Ayuda contextual** | No | Sí |
| **Componente MetodoPagoForm** | No | Sí |
| **Banner privacidad** | No | Sí |
| **Tamaño del archivo** | 445 líneas | 560 líneas |

---

## ✅ Verificación

```bash
npm run lint   # ✅ 0 errors, 0 warnings
npm run build  # ✅ Success (13 routes)
```

**Archivos modificados**:
- ✅ `/app/dashboard/casos/[id]/editar/page.tsx` (reescrito completamente)

**Archivos NO modificados** (referencia):
- `/app/dashboard/casos/nuevo/page.tsx` (patrón de referencia)
- `/app/components/casos/MetodoPagoForm.tsx` (componente reutilizado)
- `/lib/validaciones/financieras.ts` (validaciones importadas)

---

## 🎯 Funcionalidad Completa

Ahora la página de **Editar Caso** permite modificar:

1. ✅ Información básica (cliente, patrocinado, descripción, expediente)
2. ✅ Clasificación (tipo, etapa del proceso)
3. ✅ Estados (activo/inactivo + en proceso/ganado/perdido)
4. ✅ Información financiera completa (forma de pago, montos, detalles)
5. ✅ Ubicación física (opcional)
6. ✅ Fecha de inicio
7. ✅ Validaciones inteligentes según método de pago

**Y todo con la MISMA experiencia que crear un caso nuevo** ✨

---

## 🚀 Próximo Paso

Ahora podemos continuar con **Opción 2: Paginación + Filtros** para la tabla de casos.
