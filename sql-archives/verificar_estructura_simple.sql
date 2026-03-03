-- CONSULTAS SIMPLES PARA VERIFICAR ESTRUCTURA ACTUAL
-- Ejecutar una por una

-- 1. Verificar si existen las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 2. Verificar estructura de la tabla casos
\d casos

-- 3. Verificar tipos de datos y restricciones de casos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar CHECK constraints (forma simplificada)
SELECT conname, contype, conkey
FROM pg_constraint 
WHERE conrelid = 'public.casos'::regclass;

-- 5. Verificar datos existentes
SELECT COUNT(*) as total_casos FROM casos;

-- 6. Si hay casos, ver la estructura
SELECT * FROM casos LIMIT 1;

-- 7. Verificar profiles
SELECT * FROM profiles LIMIT 3;