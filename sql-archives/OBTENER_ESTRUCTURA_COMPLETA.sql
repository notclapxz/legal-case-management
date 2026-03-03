-- ========================================
-- OBTENER ESTRUCTURA COMPLETA DE LA BASE DE DATOS
-- Ejecutar TODO en Supabase SQL Editor
-- ========================================

-- 1. TODAS LAS TABLAS QUE EXISTEN
SELECT 
    tablename as tabla,
    schemaname as esquema
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. ESTRUCTURA COMPLETA DE LA TABLA 'casos'
SELECT 
    column_name as columna,
    data_type as tipo,
    character_maximum_length as longitud_max,
    is_nullable as permite_null,
    column_default as valor_default
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. TODOS LOS CHECK CONSTRAINTS DE 'casos'
SELECT 
    conname as nombre_constraint,
    pg_get_constraintdef(oid) as definicion
FROM pg_constraint 
WHERE conrelid = 'public.casos'::regclass
AND contype = 'c'
ORDER BY conname;

-- 4. FOREIGN KEYS DE 'casos'
SELECT 
    conname as nombre_fk,
    pg_get_constraintdef(oid) as definicion
FROM pg_constraint 
WHERE conrelid = 'public.casos'::regclass
AND contype = 'f'
ORDER BY conname;

-- 5. ÍNDICES DE 'casos'
SELECT 
    indexname as nombre_indice,
    indexdef as definicion
FROM pg_indexes 
WHERE tablename = 'casos' 
AND schemaname = 'public'
ORDER BY indexname;

-- 6. ESTRUCTURA DE 'profiles'
SELECT 
    column_name as columna,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. ESTRUCTURA DE 'eventos'
SELECT 
    column_name as columna,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns 
WHERE table_name = 'eventos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. ESTRUCTURA DE 'pagos'
SELECT 
    column_name as columna,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. ESTRUCTURA DE 'notas' (si existe)
SELECT 
    column_name as columna,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns 
WHERE table_name = 'notas' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. VERIFICAR SI EXISTE ALGUNA VISTA
SELECT 
    viewname as vista,
    definition
FROM pg_views 
WHERE schemaname = 'public'
ORDER BY viewname;

-- 11. POLÍTICAS RLS (Row Level Security)
SELECT 
    tablename as tabla,
    policyname as politica,
    permissive,
    roles,
    cmd as comando,
    qual as condicion
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 12. TRIGGERS EN 'casos' (si existen)
SELECT 
    trigger_name as nombre_trigger,
    event_manipulation as evento,
    action_statement as accion
FROM information_schema.triggers 
WHERE event_object_table = 'casos'
AND event_object_schema = 'public';

-- 13. VER UN CASO DE EJEMPLO (estructura real de datos)
SELECT * FROM casos LIMIT 1;