-- CONSULTAS PARA VERIFICAR ESTRUCTURA ACTUAL DE LA BASE DE DATOS
-- Ejecutar una por una en Supabase SQL Editor

-- 1. Verificar estructura completa de la tabla casos
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'casos' 
ORDER BY ordinal_position;

-- 2. Verificar CHECK constraints de la tabla casos
SELECT conname, pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint 
WHERE conrelid = 'casos'::regclass 
AND contype = 'c';

-- 3. Verificar si hay datos en la tabla casos
SELECT COUNT(*) as total_casos FROM casos;

-- 4. Verificar primeros 2 casos (si existen) para ver estructura
SELECT * FROM casos LIMIT 2;

-- 5. Verificar estructura de la tabla profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 6. Verificar si hay usuarios en profiles
SELECT COUNT(*) as total_profiles FROM profiles;

-- 7. Verificar usuarios existentes
SELECT id, username, nombre_completo, rol FROM profiles LIMIT 5;