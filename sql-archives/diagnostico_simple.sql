-- ===================================
-- DIAGNÓSTICO SIMPLE - VERSIÓN COMPATIBLE CON SUPABASE
-- ===================================

-- 1. Verificar tablas principales
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('casos', 'perfiles', 'eventos', 'pagos', 'auth.users')
ORDER BY table_name;

-- 2. Contar registros en cada tabla
SELECT 'casos' as tabla, COUNT(*) as registros FROM casos
UNION ALL
SELECT 'perfiles' as tabla, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 'eventos' as tabla, COUNT(*) as registros FROM eventos
UNION ALL
SELECT 'pagos' as tabla, COUNT(*) as registros FROM pagos;

-- 3. Verificar usuarios de auth
SELECT COUNT(*) as total_auth_users FROM auth.users;

-- 4. Mostrar primeros casos (si existen)
SELECT 
  id,
  codigo_estimado,
  cliente,
  tipo,
  estado,
  monto_total,
  monto_cobrado,
  created_at
FROM casos 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Verificar si hay conexión a las tablas
SELECT 
  has_schema_privilege('public', 'auth.users', 'SELECT') as can_read_auth,
  has_schema_privilege('public', 'casos', 'SELECT') as can_read_casos,
  has_schema_privilege('public', 'perfiles', 'SELECT') as can_read_profiles;