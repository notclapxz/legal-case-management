-- VERIFICACIÓN FINAL DESPUÉS DE CORRECCIONES
-- Ejecutar en Supabase

-- 1. Verificar estructura final de la tabla casos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar CHECK constraints actualizados
SELECT conname, contype, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.casos'::regclass
AND contype = 'c'
ORDER BY conname;

-- 3. Verificar si hay algún índice con el nombre correcto
SELECT indexname FROM pg_indexes 
WHERE tablename = 'casos' 
AND indexname LIKE '%abogado%';

-- 4. Probar una inserción simple
INSERT INTO casos (
    codigo_estimado, 
    cliente, 
    tipo, 
    etapa, 
    abogado_asignado_id, 
    forma_pago, 
    monto_total, 
    monto_cobrado, 
    fecha_inicio, 
    estado
) VALUES (
    'TEST-001', 
    'Cliente Prueba', 
    'Penal', 
    'Preliminar', 
    '12345678-1234-1234-1234-123456789012', 
    'Cuota litis', 
    1000, 
    0, 
    CURRENT_DATE, 
    'En proceso'
);

-- 5. Verificar si se insertó
SELECT codigo_estimado, cliente, forma_pago, estado 
FROM casos 
WHERE codigo_estimado = 'TEST-001';

-- 6. Limpiar el test
DELETE FROM casos WHERE codigo_estimado = 'TEST-001';