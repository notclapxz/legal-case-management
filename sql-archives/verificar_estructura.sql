-- VERIFICACIÓN DE ESTRUCTURA DE TABLAS REALES

-- 1. Revisar estructura real de la tabla eventos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'eventos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Revisar estructura real de la tabla casos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'casos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Revisar estructura real de la tabla pagos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'pagos' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Mostrar algunos datos existentes para entender el formato
SELECT * FROM eventos LIMIT 3;
SELECT * FROM casos LIMIT 3;
SELECT * FROM pagos LIMIT 3;