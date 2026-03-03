-- CORREGIR LA BASE DE DATOS PARA QUE COINCIDA CON EL FORMULARIO ORIGINAL
-- Ejecutar en Supabase SQL Editor

-- 1. Eliminar CHECK constraints existentes de formas de pago
ALTER TABLE casos DROP CONSTRAINT IF EXISTS casos_forma_pago_check;

-- 2. Agregar nuevo CHECK constraint con las formas de pago correctas
ALTER TABLE casos ADD CONSTRAINT casos_forma_pago_check 
CHECK (forma_pago IN ('Por hora', 'Por etapas', 'Monto fijo', 'Cuota litis'));

-- 3. Verificar si existe el constraint de estado_caso
ALTER TABLE casos DROP CONSTRAINT IF EXISTS casos_estado_caso_check;

-- 4. Agregar campo estado_caso si no existe (con los valores correctos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='estado_caso'
    ) THEN
        ALTER TABLE casos ADD COLUMN estado_caso VARCHAR(50) DEFAULT 'En proceso';
    END IF;
END $$;

-- 5. Agregar CHECK constraint para estado_caso con los valores correctos
ALTER TABLE casos ADD CONSTRAINT casos_estado_caso_check 
CHECK (estado_caso IN ('En proceso', 'Ganado', 'Perdido'));

-- 6. Corregir tipos para incluir todos los del formulario
ALTER TABLE casos DROP CONSTRAINT IF EXISTS casos_tipo_check;
ALTER TABLE casos ADD CONSTRAINT casos_tipo_check 
CHECK (tipo IN ('Penal', 'Civil', 'Laboral', 'Administrativo'));

-- 7. Verificar si existe el campo descripcion o descripcion_caso
DO $$
BEGIN
    -- Si existe descripcion_caso pero no descripcion, renombrar
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='descripcion_caso'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='descripcion'
    ) THEN
        ALTER TABLE casos RENAME COLUMN descripcion_caso TO descripcion;
    END IF;
    
    -- Si no existe ninguno, agregar descripcion
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='descripcion'
    ) THEN
        ALTER TABLE casos ADD COLUMN descripcion TEXT;
    END IF;
END $$;

-- 8. Eliminar constraint de monto_cobrado <= monto_total (para permitir pagos parciales)
ALTER TABLE casos DROP CONSTRAINT IF EXISTS monto_cobrado_valido;

-- 9. Verificar los constraints actualizados
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.casos'::regclass
AND contype = 'c'
ORDER BY conname;