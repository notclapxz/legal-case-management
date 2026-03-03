# Changelog - Sistema de Agenda Personal

## Fecha: 26 Enero 2026

### 🎯 Resumen
Implementación completa del sistema de agenda personal con editor de texto enriquecido, auto-guardado, persistencia de datos, y diseño responsive para tablets.

---

## ✨ Funcionalidades Nuevas

### 1. Editor de Texto Enriquecido (TipTap)
**Archivos**: `AgendaRichEditor.tsx`, `AgendaEditor.tsx`

- **Editor WYSIWYG** con TipTap
- **Listas de tareas** con checkboxes interactivos (☐/☑)
- **Listas con viñetas** y **listas numeradas**
- **Formato simple** (sin bold/italic para mantener simplicidad)
- **Auto-focus inteligente**: Click en área vacía posiciona cursor al final
- **Cursor en modo texto** siempre visible para mejor UX
- **Toolbar minimalista**: Solo botones para tareas y listas

**Comportamiento**:
- Click en texto existente → Cursor se posiciona exactamente ahí
- Click en área vacía → Cursor va al final del documento
- Selección de texto funciona normalmente (Ctrl+A, arrastrar, etc.)

### 2. Auto-Guardado Inteligente
**Archivo**: `AgendaEditor.tsx`

- **Debounce de 1 segundo**: Guarda después de 1s de inactividad
- **Sin pérdida de foco**: El editor NO se desmonta durante el guardado
- **Indicador visual**: 
  - "Guardando..." (amarillo con spinner)
  - "✓ Guardado HH:MM:SS" (verde)
- **Prevención de guardados concurrentes**: Flag `guardandoRef` evita conflictos

**Implementación técnica**:
```tsx
useEffect(() => {
  const timeoutId = setTimeout(async () => {
    await guardarContenido()
  }, 1000)
  return () => clearTimeout(timeoutId)
}, [contenido])
```

### 3. Persistencia de Datos
**Archivos**: `AgendaMonthView.tsx`, `AgendaEditor.tsx`

**Problema resuelto**: Query SQL con fechas inválidas (`2026-01-32`)

**Solución**:
```tsx
// Calcular primer día del siguiente mes correctamente
const siguienteMes = mes === 11 ? 0 : mes + 1
const siguienteAnio = mes === 11 ? anio + 1 : anio
const primerDiaSiguienteMes = `${siguienteAnio}-${siguienteMesStr}-01`

// Query corregida
.gte('fecha', primerDia)
.lt('fecha', primerDiaSiguienteMes)
```

**Sistema de actualización**:
- `refreshKey`: Fuerza recarga al cambiar de día
- `handleUpdateDia()`: Actualiza estado local sin recargar todo
- `onContentChange`: Callback que actualiza previews en tiempo real

### 4. Previsualizaciones Limpias
**Archivos**: `AgendaCalendar.tsx`, `AgendaDayList.tsx`

**Problema resuelto**: HTML crudo en previews (`<p>hola</p>`)

**Solución**: Parser HTML inteligente
```tsx
function extractPreview(html: string): PreviewLine[] {
  const div = document.createElement('div')
  div.innerHTML = html
  
  // Parsea párrafos, listas, y tareas
  // Devuelve array de { texto, tachado }
}
```

**Características**:
- ✅ Texto plano sin etiquetas HTML
- ✅ Checkboxes como ☐/☑
- ✅ Tareas completadas aparecen **tachadas** (line-through)
- ✅ Máximo 2 líneas visibles
- ✅ Cada línea en su propia fila

### 5. Tooltip Expandible
**Archivo**: `AgendaCalendar.tsx`

**Funcionalidad**: Cuando hay más de 2 líneas, muestra "+X más"

**Comportamiento**:
- **Click en "+X más"** → Abre tooltip con todas las líneas
- **Click fuera** → Cierra tooltip
- **Click de nuevo** → Toggle on/off
- **No navega al día** cuando abres el tooltip

**Diseño**:
- Fondo blanco con borde gris
- Cada línea en caja gris individual (consistente con previews)
- Scroll si hay muchas líneas (max-height: 256px)
- Flecha apuntando al botón
- Respeta tachado de tareas completadas

### 6. Update en Tiempo Real
**Archivo**: `AgendaMonthView.tsx`

**Funcionalidad**: El preview del panel izquierdo se actualiza mientras escribís

**Implementación**:
```tsx
const handleUpdateDia = useCallback((fecha: string, contenido: string) => {
  setAgendaDias(prev => {
    const index = prev.findIndex(d => d.fecha === fecha)
    if (index >= 0) {
      const updated = [...prev]
      updated[index] = { ...updated[index], contenido }
      return updated
    }
    // Agregar nuevo si no existe
  })
}, [])
```

### 7. Diseño Responsive para Tablets
**Archivo**: `AgendaMonthView.tsx`

**Breakpoint**: `< 1024px` (tablets y móviles)

**Vista Desktop (>= 1024px)**:
- 3 paneles redimensionables (Calendario | Lista Días | Editor)
- Sidebar visible
- Layout horizontal

**Vista Tablet (< 1024px)**:
- Vista apilada (una pantalla a la vez)
- Navegación secuencial:
  1. **Lista de días** (vista inicial)
  2. Click en día → **Editor a pantalla completa**
  3. Botón ← → Vuelve a lista
  4. Botón 📅 → Vuelve a calendario principal

**Header mejorado**:
- Altura 64px (touch-friendly)
- Títulos grandes y claros
- Botones de navegación 48x48px (WCAG 2.1)

---

## 🐛 Bugs Corregidos

### 1. Auto-save desmontaba el editor
**Problema**: Cada guardado ejecutaba `onRefresh()` → cambiaba `refreshKey` → recreaba `cargarAgendaDias` → actualizaba `agendaDias` → cambiaba `key` del editor → React desmontaba y remontaba el componente → perdías foco

**Solución**: Eliminar `onRefresh()` del auto-save, solo refrescar al cambiar de día manualmente

### 2. Query SQL con fechas inválidas
**Problema**: `.lt('fecha', '2026-01-32')` causaba que Postgres no devolviera resultados

**Solución**: Calcular correctamente el primer día del siguiente mes

### 3. HTML crudo en previews
**Problema**: `obtenerLineasContenido()` solo hacía `split('\n')`, no parseaba HTML

**Solución**: Usar `document.createElement('div')` y parsear DOM correctamente

### 4. Contenido no persistía al volver
**Problema**: Query fallaba + `agendaDias` no se actualizaba

**Solución**: Corregir query + usar `refreshKey` para forzar recargas

### 5. Click en preview no abría el día
**Problema**: Contenedor de previews tenía `stopPropagation()` en todo

**Solución**: Solo aplicar `stopPropagation()` al botón "+X más", no a todo el contenedor

### 6. Click en línea mandaba al final
**Problema**: `onClick` interceptaba todos los clicks y forzaba `focus('end')`

**Solución**: Detectar si hay selección activa y solo actuar en área vacía

### 7. Selección de texto se deseleccionaba
**Problema**: `onClick` se disparaba al soltar después de arrastrar

**Solución**: Simplificar lógica, confiar en comportamiento nativo del editor

---

## 📊 Tests E2E

**Archivo**: `e2e/agenda.spec.ts`

**Resultados**: ✅ 8/8 tests pasando

### Tests incluidos:
1. ✅ Navegar a la agenda y verificar que carga
2. ✅ Entrar a un día específico del mes
3. ✅ Escribir contenido y verificar guardado
4. ✅ **Persistencia**: escribir, salir, volver (CRÍTICO)
5. ✅ Crear tarea con checkbox
6. ✅ Verificar preview en lista de días (sin HTML)
7. ✅ BUG CHECK: Contenido no se pierde al cambiar rápido
8. ✅ BUG CHECK: HTML crudo no aparece en preview

---

## 🗄️ Base de Datos

### Tabla: `agenda_dias`
```sql
CREATE TABLE agenda_dias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  contenido TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_agenda_dias_fecha ON agenda_dias(fecha);
```

**Nota**: NO se requieren RLS policies adicionales. El sistema funciona con las policies existentes.

---

## 📦 Dependencias Nuevas

```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-task-list": "^2.x",
  "@tiptap/extension-task-item": "^2.x"
}
```

---

## 🎨 Cambios de UI/UX

### Colores y Estilos
- **Editor**: Fondo `#1f1f1f` (gris oscuro)
- **Toolbar**: Fondo `#2a2a2a` con separadores `#3a3a3a`
- **Previews**: Cajas grises `bg-gray-100` con texto `text-gray-700`
- **Tareas completadas**: `line-through opacity-60`
- **Tooltip**: Fondo blanco, borde `border-gray-200`, sombra `shadow-xl`

### Cursor
- Todo el área del editor muestra `cursor-text`
- Indica visualmente que es un área editable
- Mejora UX especialmente en tablets

---

## 🔄 Flujo de Datos

```
Usuario escribe → handleContenidoChange() 
  ↓
contenido state + contenidoRef + onContentChange()
  ↓
Actualiza preview en tiempo real (AgendaDayList)
  ↓
Debounce 1s → guardarContenido()
  ↓
Supabase upsert (onConflict: 'fecha')
  ↓
Indicador "✓ Guardado"
```

---

## 📱 Responsive Breakpoints

| Tamaño | Comportamiento |
|--------|----------------|
| >= 1024px | Desktop: 3 paneles lado a lado |
| < 1024px | Tablet/Mobile: Vista apilada con navegación |

---

## 🚀 Mejoras Futuras Sugeridas

### Prioridad Alta
1. **Búsqueda global** de contenido en todos los días
2. **Indicador visual** en días con contenido (punto de color)
3. **Exportar mes a PDF** para impresión

### Prioridad Media
4. **Colores/categorías** para días importantes
5. **Vista semanal** además de mensual
6. **Atajos de teclado** (Ctrl+S, Ctrl+K, flechas)

### Prioridad Baja
7. **Recordatorios/notificaciones** push
8. **Integración con calendario** del sistema
9. **Modo oscuro/claro** toggle

---

## 📝 Notas Técnicas

### Performance
- **Auto-save con debounce**: Evita sobrecarga de requests
- **Update optimista del UI**: No espera confirmación de BD para actualizar preview
- **Key strategy**: `key={fechaSeleccionada}` fuerza remount del editor al cambiar día

### Accesibilidad
- Botones táctiles mínimo 48x48px (WCAG 2.1)
- Textos de ayuda en tooltips
- Indicadores visuales claros (guardando/guardado)

### Compatibilidad
- Funciona en Chrome, Firefox, Safari, Edge
- Optimizado para tablets Samsung
- Touch-friendly en toda la interfaz

---

## 👥 Créditos

**Desarrollado por**: AI Assistant (Claude)  
**Fecha**: 26 Enero 2026  
**Tests**: Playwright E2E  
**Framework**: Next.js 16.1 + React 19 + TypeScript + Supabase + TipTap
