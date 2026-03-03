-- CONSULTAS CORREGIDAS PARA SUPABASE SQL EDITOR
-- Ejecutar una por una

-- 1. Verificar qué tablas existen
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- 2. Verificar estructura completa de la tabla casos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar CHECK constraints de casos
SELECT conname, contype, 
       pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.casos'::regclass
AND contype = 'c';

-- 4. Verificar cuántos casos existen
SELECT COUNT(*) as total_casos FROM casos;

-- 5. Si hay casos, ver estructura de datos (ejecutar solo si hay datos)
-- SELECT * FROM casos LIMIT 1;

-- 6. Verificar estructura de profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar usuarios en profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 8. Verificar datos de profiles (si hay)
-- SELECT * FROM profiles LIMIT 3;