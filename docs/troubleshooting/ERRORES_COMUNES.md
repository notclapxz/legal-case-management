# ⚠️ Errores Comunes - Guía de Referencia Rápida

**Última actualización**: 15 de Enero, 2026

---

## 🚫 Error 1: Nombres de Columna Incorrectos

### Síntoma
```
ERROR: 42703: column "codigo_caso" does not exist
```

### Causa
Usar nombre de columna que no existe en la tabla

### Solución
```sql
-- ❌ INCORRECTO
SELECT codigo_caso FROM casos;

-- ✅ CORRECTO
SELECT codigo_estimado FROM casos;
```

### Prevención
```sql
-- Verificar columnas de una tabla
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'casos';
```

**Nombres correctos en tabla `casos`**:
- ✅ `codigo_estimado`
- ✅ `cliente`
- ✅ `descripcion`
- ✅ `expediente`
- ✅ `ubicacion_fisica`
- ❌ ~~`codigo_caso`~~
- ❌ ~~`codigo`~~
- ❌ ~~`ubicacion`~~

---

## 🚫 Error 2: ON CONFLICT sin UNIQUE Constraint

### Síntoma
```
ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

### Causa
Usar `ON CONFLICT` en columna sin constraint UNIQUE

### Solución
```sql
-- ❌ INCORRECTO (ubicaciones_fisicas NO tiene UNIQUE)
INSERT INTO ubicaciones_fisicas (codigo_estimado, cliente)
VALUES ('AGUIRRE-01', 'Carlos Aguirre')
ON CONFLICT (codigo_estimado) DO NOTHING;

-- ✅ CORRECTO (sin ON CONFLICT)
INSERT INTO ubicaciones_fisicas (codigo_estimado, cliente)
VALUES ('AGUIRRE-01', 'Carlos Aguirre');

-- ✅ CORRECTO (casos SÍ tiene UNIQUE)
INSERT INTO casos (codigo_estimado, cliente, tipo, ...)
VALUES ('AGUIRRE-01', 'Carlos Aguirre', 'Penal', ...)
ON CONFLICT (codigo_estimado) DO NOTHING;
```

### Prevención
```sql
-- Verificar constraints de una tabla
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'casos';
```

**Regla de Oro**:
- `casos.codigo_estimado` → tiene UNIQUE → ✅ permite ON CONFLICT
- `ubicaciones_fisicas.codigo_estimado` → NO UNIQUE → ❌ NO permite ON CONFLICT

---

## 🚫 Error 3: Códigos Duplicados en Migración

### Síntoma
```
ERROR: 23505: duplicate key value violates unique constraint "casos_codigo_estimado_key"
DETAIL: Key (codigo_estimado)=(BARRAZA-01) already exists.
```

### Causa
Intentar actualizar múltiples registros al mismo código que ya existe

### Solución
```sql
-- Validar conflictos ANTES de actualizar
CREATE TEMP TABLE mapeo_codigos AS
WITH validacion AS (
  SELECT
    id,
    codigo_viejo,
    codigo_nuevo_propuesto,
    CASE
      WHEN EXISTS (
        SELECT 1 FROM casos c
        WHERE c.codigo_estimado = codigo_nuevo_propuesto
          AND c.id != id
      ) THEN true
      ELSE false
    END as tiene_conflicto
  FROM ...
)
SELECT * FROM validacion;

-- Solo actualizar casos sin conflicto
UPDATE casos c
SET codigo_estimado = m.codigo_nuevo
FROM mapeo_codigos m
WHERE c.id = m.id
  AND m.tiene_conflicto = false;
```

### Prevención
**En migraciones complejas**:
1. Crear tabla temporal con mapeo viejo → nuevo
2. Validar duplicados con `EXISTS` o `COUNT`
3. Mostrar mapeo completo para revisión manual
4. Solo actualizar registros sin conflicto
5. Reportar casos problemáticos

---

## 🚫 Error 4: Debounce No Implementado

### Síntoma
- Queries excesivos a la base de datos
- Campo de input lento
- Costos de BD elevados

### Causa
Ejecutar query en cada keystroke sin debounce

### Solución
```typescript
// ❌ INCORRECTO (ejecuta en cada tecla)
const handleChange = (e) => {
  setCliente(e.target.value)
  generarCodigo(e.target.value)  // Query inmediato
}

// ✅ CORRECTO (espera 500ms)
useEffect(() => {
  const timeoutId = setTimeout(() => {
    if (cliente) {
      generarCodigo(cliente)
    }
  }, 500)  // Debounce de 500ms

  return () => clearTimeout(timeoutId)
}, [cliente])
```

### Prevención
- Usar debounce de 300-500ms en campos de auto-completado
- Usar debounce de 500-1000ms en búsquedas
- Usar debounce de 1000-2000ms en validaciones complejas

---

## 🚫 Error 5: No Usar Transacciones

### Síntoma
- Datos inconsistentes entre tablas relacionadas
- Algunos registros se actualizan, otros no
- Difícil hacer rollback

### Causa
No usar transacciones para operaciones relacionadas

### Solución
```sql
-- ❌ INCORRECTO (sin transacción)
UPDATE casos SET codigo_estimado = 'NUEVO-01' WHERE id = 'abc';
UPDATE ubicaciones_fisicas SET codigo_estimado = 'NUEVO-01' WHERE codigo_estimado = 'VIEJO-01';
-- Si el segundo falla, el primero ya se ejecutó

-- ✅ CORRECTO (con transacción)
BEGIN;

UPDATE casos
SET codigo_estimado = 'NUEVO-01'
WHERE id = 'abc';

UPDATE ubicaciones_fisicas
SET codigo_estimado = 'NUEVO-01'
WHERE codigo_estimado = 'VIEJO-01';

COMMIT;  -- Solo si ambos tuvieron éxito
-- Si algo falla: ROLLBACK;
```

### Prevención
- Usar `BEGIN` y `COMMIT` para operaciones relacionadas
- Usar `ROLLBACK` en caso de error
- En Supabase SQL Editor, usar el mismo script con múltiples comandos

---

## 📋 Checklist Pre-Query

Antes de ejecutar cualquier query importante:

### Queries de Lectura (SELECT)
- [ ] ¿Los nombres de columnas son correctos?
- [ ] ¿Los nombres de tablas son correctos?
- [ ] ¿Agregué LIMIT para evitar resultados masivos?

### Queries de Escritura (INSERT)
- [ ] ¿La tabla tiene UNIQUE constraints?
- [ ] ¿Debo usar ON CONFLICT?
- [ ] ¿Los tipos de datos coinciden?
- [ ] ¿Los valores requeridos (NOT NULL) están incluidos?

### Queries de Actualización (UPDATE)
- [ ] ¿Agregué WHERE para no actualizar todo?
- [ ] ¿Verifiqué duplicados potenciales en UNIQUE columns?
- [ ] ¿Debo usar transacción para múltiples tablas?
- [ ] ¿Probé primero con SELECT para ver qué se actualizará?

### Migraciones
- [ ] ¿Hice backup? (Supabase lo hace automáticamente)
- [ ] ¿Validé conflictos con EXISTS o COUNT?
- [ ] ¿Mostré el mapeo antes de ejecutar UPDATE?
- [ ] ¿Implementé reporte de casos problemáticos?
- [ ] ¿Usé ID como desempate en caso de empate?

---

## 🔍 Comandos Útiles de Diagnóstico

### Ver estructura de tabla
```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'casos'
ORDER BY ordinal_position;
```

### Ver constraints
```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'casos';
```

### Ver índices
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'casos';
```

### Detectar duplicados
```sql
SELECT codigo_estimado, COUNT(*) as cantidad
FROM casos
GROUP BY codigo_estimado
HAVING COUNT(*) > 1;
```

### Contar por formato de código
```sql
SELECT
  CASE
    WHEN codigo_estimado ~ '^[A-Z]\.[A-Z]+-[0-9]+$' THEN 'I.APELLIDO-##'
    WHEN codigo_estimado ~ '^[A-Z]+-[0-9]+$' THEN 'EMPRESA-##'
    ELSE 'Otro formato'
  END as formato,
  COUNT(*) as cantidad
FROM casos
GROUP BY formato;
```

---

## 💡 Tips Rápidos

### SQL
1. **Siempre usa WHERE en UPDATE/DELETE** (a menos que quieras afectar TODOS los registros)
2. **Usa LIMIT en SELECT** cuando explores datos
3. **Valida con SELECT antes de UPDATE** (cambia UPDATE por SELECT para ver qué se afectará)
4. **Usa transacciones** para operaciones relacionadas
5. **Comenta SQL complejo** para entenderlo después

### TypeScript/React
1. **Usa debounce** en campos de búsqueda/auto-completado
2. **Valida datos del usuario** antes de enviar a BD
3. **Muestra loading states** durante queries
4. **Maneja errores** con try-catch y muestra al usuario
5. **Usa tipos de TypeScript** para evitar errores

### Supabase
1. **RLS está activo** - verifica permisos si no ves datos
2. **Backup automático** - pero no confíes 100%, exporta data importante
3. **SQL Editor ejecuta todo** - no ejecutes múltiples scripts sin revisar
4. **Temp tables se borran** - se limpian al cerrar sesión
5. **Logs disponibles** - revisa logs si algo falla

---

## 📚 Referencias

- **Documentación PostgreSQL**: https://www.postgresql.org/docs/
- **Documentación Supabase**: https://supabase.com/docs
- **SQL Constraints**: https://www.postgresql.org/docs/current/ddl-constraints.html
- **Transactions**: https://www.postgresql.org/docs/current/tutorial-transactions.html

---

*Mantén este documento actualizado cuando encuentres nuevos errores*
