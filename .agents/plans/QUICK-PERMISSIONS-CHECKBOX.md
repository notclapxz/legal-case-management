# Feature: Checkbox de Permisos Rápidos en Lista de Casos

**Fecha**: 2026-01-27  
**Estado**: 🔴 PENDIENTE  
**Prioridad**: MEDIA  
**Tipo**: ENHANCEMENT

---

## 💡 IDEA DEL USUARIO

> "Quiero que haya un checkbox a la derecha de cada caso en la lista para dar permisos rápido desde ahí"

### Beneficio:
- **UX mejorada**: No necesitas entrar al detalle del caso para compartirlo
- **Eficiencia**: Compartir múltiples casos rápidamente
- **Visibilidad**: Ver de un vistazo qué casos están compartidos

---

## 🎨 DISEÑO PROPUESTO

### Vista de Lista de Casos (Admin)

```
┌────────────────────────────────────────────────────────────────────┐
│ CÓDIGO         │ CLIENTE        │ TIPO   │ ESTADO   │ 👥 COMPARTIR │
├────────────────────────────────────────────────────────────────────┤
│ C.AGUIRRE-13   │ Carlos Aguirre │ Penal  │ Activo   │ ☑ María     │
│                │                │        │          │ ☐ Ana       │
├────────────────────────────────────────────────────────────────────┤
│ M.GARCIA-5     │ María García   │ Civil  │ Activo   │ ☐ María     │
│                │                │        │          │ ☑ Ana       │
└────────────────────────────────────────────────────────────────────┘
```

### Vista de Lista de Casos (Abogado/Secretaria)
- **NO VEN** la columna "COMPARTIR"
- Solo admin puede modificar permisos

---

## 🔧 IMPLEMENTACIÓN

### Paso 1: Crear componente `QuickPermissionsCheckbox.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

interface QuickPermissionsCheckboxProps {
  casoId: string
  usuariosConAcceso: string[]  // IDs de usuarios actuales
  onUpdate: (newUsuarios: string[]) => void
}

export function QuickPermissionsCheckbox({ 
  casoId, 
  usuariosConAcceso, 
  onUpdate 
}: QuickPermissionsCheckboxProps) {
  const [usuarios, setUsuarios] = useState<Profile[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .in('rol', ['abogado', 'secretaria'])
      .eq('activo', true)
      .order('nombre_completo')
      .then(({ data }) => setUsuarios(data || []))
  }, [])
  
  const handleToggle = async (userId: string) => {
    setSaving(true)
    
    const supabase = createClient()
    const newUsuarios = usuariosConAcceso.includes(userId)
      ? usuariosConAcceso.filter(id => id !== userId)
      : [...usuariosConAcceso, userId]
    
    const { error } = await supabase
      .from('casos')
      .update({ usuarios_con_acceso: newUsuarios })
      .eq('id', casoId)
    
    if (!error) {
      onUpdate(newUsuarios)
    }
    
    setSaving(false)
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        title="Compartir caso"
      >
        <span className="text-lg">👥</span>
        <span className="text-xs">
          {usuariosConAcceso.length > 0 ? usuariosConAcceso.length : 'Compartir'}
        </span>
      </button>
      
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-3">
              <h4 className="text-xs font-medium text-gray-500 mb-2">
                Dar acceso a:
              </h4>
              <div className="space-y-2">
                {usuarios.map(usuario => (
                  <label 
                    key={usuario.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={usuariosConAcceso.includes(usuario.id)}
                      onChange={() => handleToggle(usuario.id)}
                      disabled={saving}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">
                      {usuario.nombre_completo || usuario.username}
                      <span className="text-gray-500 text-xs ml-1">
                        ({usuario.rol})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

### Paso 2: Integrar en lista de casos

```tsx
// En app/dashboard/casos/page.tsx

import { QuickPermissionsCheckbox } from './components/QuickPermissionsCheckbox'
import { useUserRole } from '@/app/hooks/useUserRole'

export default function CasosPage() {
  const { isAdmin } = useUserRole()
  const [casos, setCasos] = useState<Caso[]>([])
  
  const handlePermissionsUpdate = (casoId: string, newUsuarios: string[]) => {
    setCasos(prev => prev.map(caso => 
      caso.id === casoId 
        ? { ...caso, usuarios_con_acceso: newUsuarios }
        : caso
    ))
  }
  
  return (
    <table>
      <thead>
        <tr>
          <th>Código</th>
          <th>Cliente</th>
          <th>Tipo</th>
          <th>Estado</th>
          {isAdmin && <th>Compartir</th>}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {casos.map(caso => (
          <tr key={caso.id}>
            <td>{caso.codigo_estimado}</td>
            <td>{caso.cliente}</td>
            <td>{caso.tipo}</td>
            <td>{caso.estado}</td>
            {isAdmin && (
              <td>
                <QuickPermissionsCheckbox
                  casoId={caso.id}
                  usuariosConAcceso={caso.usuarios_con_acceso || []}
                  onUpdate={(newUsuarios) => handlePermissionsUpdate(caso.id, newUsuarios)}
                />
              </td>
            )}
            <td>
              <Link href={`/dashboard/casos/${caso.id}`}>Ver</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Crear componente `QuickPermissionsCheckbox.tsx`
- [ ] Agregar columna "Compartir" en tabla de casos (solo admin)
- [ ] Implementar dropdown con lista de usuarios
- [ ] Implementar toggle de checkbox (UPDATE directo a BD)
- [ ] Agregar loading state mientras guarda
- [ ] Agregar indicador visual de "casos compartidos" (badge con número)
- [ ] Testing: Verificar que solo admin ve la columna
- [ ] Testing: Verificar que cambios se guardan correctamente
- [ ] Testing: Verificar que el contador se actualiza

---

## 🎯 MEJORAS FUTURAS (Opcional)

1. **Bulk Actions**: Checkbox para seleccionar múltiples casos y compartir todos a la vez
2. **Filtro**: Filtrar casos por "Compartidos con X persona"
3. **Notificaciones**: Notificar usuario cuando se le comparte un caso
4. **Audit Log**: Registrar cambios de permisos en log de auditoría

---

## 🧪 TESTING

### Test 1: Admin ve y usa la columna
1. Login como RZRV (admin)
2. Ir a lista de casos
3. **Verificar**: Columna "Compartir" visible
4. Click en icono 👥 de un caso
5. **Verificar**: Dropdown se abre con lista de usuarios
6. Marcar checkbox de María
7. **Verificar**: Badge muestra "1"
8. Recargar página
9. **Verificar**: Cambio persiste

### Test 2: Abogado NO ve la columna
1. Login como María (abogado)
2. Ir a lista de casos
3. **Verificar**: Columna "Compartir" NO visible
4. **Verificar**: Lista muestra solo casos con acceso

---

## 📊 ESTIMACIÓN

- **Complejidad**: Baja-Media
- **Tiempo estimado**: 1-2 horas
- **Impacto**: Alto (mejora significativa de UX)

---

**Notas**:
- Feature sugerida por usuario (buena idea!)
- Complementa sistema de permisos existente
- Priorizar sobre otras features opcionales
