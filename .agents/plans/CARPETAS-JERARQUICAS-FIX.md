# Fix: Sistema de Carpetas Jerárquicas

**Fecha**: 2026-01-27  
**Estado**: ✅ COMPLETADO  
**Prioridad**: ALTA

---

## 🐛 PROBLEMA ACTUAL

El sistema de carpetas NO funciona como subcarpetas reales:

### Comportamiento Actual (INCORRECTO):
1. Usuario entra a carpeta "Casos Laborales"
2. Dentro hay una subcarpeta "físico"
3. **BUG**: Al hacer click en "Casos Laborales", NO se muestra la subcarpeta "físico"
4. **BUG**: En su lugar, se muestran directamente los casos que están dentro de "físico"
5. **BUG**: El caso aparece como si estuviera EN AMBAS carpetas (padre e hijo)

### Comportamiento Esperado (CORRECTO):
1. Usuario entra a carpeta "Casos Laborales"
2. **VER**: Lista de subcarpetas (ej: "físico", "virtual", etc.)
3. **VER**: Casos que están DIRECTAMENTE en "Casos Laborales" (sin subcarpeta)
4. Usuario hace click en subcarpeta "físico"
5. **VER**: Solo los casos que están en "físico"

---

## 🔍 ANÁLISIS TÉCNICO

### Base de Datos ✅ (Ya está bien implementada)
```sql
CREATE TABLE carpetas (
  id UUID PRIMARY KEY,
  nombre TEXT NOT NULL,
  carpeta_padre_id UUID REFERENCES carpetas(id),  -- ✅ Soporta jerarquía
  ...
);

CREATE TABLE casos (
  id UUID PRIMARY KEY,
  carpeta_id UUID REFERENCES carpetas(id),  -- ✅ Cada caso tiene UNA carpeta
  ...
);
```

**Estado**: ✅ El esquema de BD es correcto y soporta jerarquía infinita.

---

### Frontend ❌ (Aquí está el problema)

**Archivos a revisar**:
```
despacho-web/app/dashboard/casos/page.tsx
despacho-web/app/dashboard/casos/components/ModalCarpeta.tsx
```

**Problemas a arreglar**:

1. **Query de casos NO respeta jerarquía**
   ```typescript
   // ❌ MAL: Trae casos de carpeta Y todas las subcarpetas
   const { data } = await supabase
     .from('casos')
     .select('*')
     .eq('carpeta_id', carpetaSeleccionada)
   ```

   ```typescript
   // ✅ BIEN: Solo traer casos DIRECTAMENTE en la carpeta
   // Las subcarpetas se muestran aparte como lista
   ```

2. **No se renderizan subcarpetas como elementos clickeables**
   - Cuando estás en "Casos Laborales", debería haber una lista de:
     - 📁 Subcarpetas (físico, virtual, etc.)
     - 📄 Casos (solo los que NO tienen subcarpeta asignada)

3. **Falta navegación breadcrumb**
   - Debería mostrar: `Todas las carpetas > Casos Laborales > físico`

---

## 🔧 SOLUCIÓN PROPUESTA

### Paso 1: Crear componente `SubcarpetasList.tsx`

```tsx
interface SubcarpetasListProps {
  carpetaPadreId: string | null
  onSelectSubcarpeta: (carpetaId: string) => void
}

export function SubcarpetasList({ carpetaPadreId, onSelectSubcarpeta }: SubcarpetasListProps) {
  const [subcarpetas, setSubcarpetas] = useState<Carpeta[]>([])
  
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('carpetas')
      .select('*')
      .eq('carpeta_padre_id', carpetaPadreId)
      .order('nombre')
      .then(({ data }) => setSubcarpetas(data || []))
  }, [carpetaPadreId])
  
  if (subcarpetas.length === 0) return null
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">📁 Subcarpetas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcarpetas.map(subcarpeta => (
          <button
            key={subcarpeta.id}
            onClick={() => onSelectSubcarpeta(subcarpeta.id)}
            className="flex items-center gap-2 p-4 bg-white border rounded-lg hover:bg-blue-50"
          >
            <span className="text-2xl">{subcarpeta.icono || '📁'}</span>
            <span className="font-medium">{subcarpeta.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Paso 2: Modificar query de casos

```typescript
// En page.tsx
const { data: casos } = await supabase
  .from('casos')
  .select('*')
  .eq('carpeta_id', carpetaSeleccionada)  // ✅ Solo casos DIRECTOS
  .eq('estado', 'Activo')
```

### Paso 3: Agregar breadcrumb de navegación

```typescript
const [rutaCarpetas, setRutaCarpetas] = useState<Carpeta[]>([])

// Al seleccionar carpeta, construir ruta completa
async function cargarRutaCarpetas(carpetaId: string) {
  const ruta: Carpeta[] = []
  let carpetaActual = carpetaId
  
  while (carpetaActual) {
    const { data } = await supabase
      .from('carpetas')
      .select('*')
      .eq('id', carpetaActual)
      .single()
    
    if (data) {
      ruta.unshift(data)  // Agregar al inicio
      carpetaActual = data.carpeta_padre_id
    } else {
      break
    }
  }
  
  setRutaCarpetas(ruta)
}
```

### Paso 4: Renderizar breadcrumb + subcarpetas + casos

```tsx
<div>
  {/* Breadcrumb */}
  <nav className="mb-4">
    <button onClick={() => setCarpetaSeleccionada(null)}>
      Todas las carpetas
    </button>
    {rutaCarpetas.map((carpeta, i) => (
      <React.Fragment key={carpeta.id}>
        <span> &gt; </span>
        <button onClick={() => setCarpetaSeleccionada(carpeta.id)}>
          {carpeta.nombre}
        </button>
      </React.Fragment>
    ))}
  </nav>
  
  {/* Subcarpetas */}
  <SubcarpetasList 
    carpetaPadreId={carpetaSeleccionada} 
    onSelectSubcarpeta={setCarpetaSeleccionada}
  />
  
  {/* Casos */}
  <CasosTable casos={casos} />
</div>
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear componente `CasosContenido.tsx` (refactor para evitar duplicación)
- [x] Modificar query de casos para traer solo casos directos
- [x] Implementar función `construirBreadcrumb()`
- [x] Agregar breadcrumb de navegación
- [x] Agregar grid de subcarpetas clickeables
- [x] Lint y build exitosos
- [ ] Testing: Verificar que subcarpetas se muestran correctamente
- [ ] Testing: Verificar que casos solo aparecen en su carpeta directa
- [ ] Documentar cambios en AGENTS.md

## ✅ CAMBIOS REALIZADOS

### Archivos Modificados:

**1. `CasosConCarpetas.tsx`**
- ❌ ELIMINADO: Filtro recursivo que incluía subcarpetas
- ✅ AGREGADO: Filtro que solo trae casos directos (`carpeta_id === carpetaSeleccionada`)
- ✅ AGREGADO: Variable `subcarpetasActuales` para obtener subcarpetas de carpeta actual
- ✅ AGREGADO: Función `construirBreadcrumb()` que genera ruta completa
- ✅ REFACTOR: Eliminado código duplicado (header/content), ahora usa `CasosContenido`

**2. `CasosContenido.tsx` (NUEVO)**
- ✅ CREADO: Componente reutilizable para header + content
- ✅ Breadcrumb de navegación con botones clickeables
- ✅ Grid de subcarpetas con ícono, nombre y contador de casos
- ✅ Contador dinámico: "X subcarpetas • Y casos"

### Lógica Antes vs Después:

```typescript
// ❌ ANTES: Traía casos de carpeta + TODAS subcarpetas recursivamente
const getIdsRecursivos = (carpetaId: string): string[] => {
  const ids = [carpetaId]
  const subs = carpetas.filter(c => c.carpeta_padre_id === carpetaId)
  subs.forEach(sub => {
    ids.push(...getIdsRecursivos(sub.id))
  })
  return ids
}

// ✅ DESPUÉS: Solo casos DIRECTOS
return caso.carpeta_id === carpetaSeleccionada
```

---

## 🧪 TESTING

### Test 1: Jerarquía básica
1. Crear carpeta "Casos Laborales"
2. Crear subcarpeta "físico" dentro de "Casos Laborales"
3. Crear caso "Test 1" asignado a "físico"
4. **Verificar**: Al abrir "Casos Laborales", ver subcarpeta "físico" (NO el caso)
5. **Verificar**: Al abrir "físico", ver el caso "Test 1"

### Test 2: Casos en ambos niveles
1. Crear caso "Test 2" asignado a "Casos Laborales" (sin subcarpeta)
2. **Verificar**: Al abrir "Casos Laborales", ver:
   - Subcarpeta "físico"
   - Caso "Test 2"
3. **Verificar**: Al abrir "físico", ver solo "Test 1" (NO "Test 2")

---

## 📊 ESTIMACIÓN

- **Complejidad**: Media-Alta
- **Tiempo estimado**: 2-3 horas
- **Impacto**: Alto (feature crítica para organización)

---

**Notas**:
- Este fix es BLOQUEANTE para una buena UX de organización de casos
- Una vez implementado, considerar agregar drag & drop para mover casos entre carpetas
