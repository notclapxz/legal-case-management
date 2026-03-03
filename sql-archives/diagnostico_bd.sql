-- ===================================
-- DIAGNÓSTICO DE BASE DE DATOS - EJECUTAR EN SUPABASE
-- ===================================

-- 1. Verificar si hay usuarios
SELECT 'usuarios' as tipo, COUNT(*) as total FROM auth.users;

-- 2. Verificar si hay perfiles
SELECT 'perfiles' as tipo, COUNT(*) as total FROM profiles;

-- 3. Verificar si hay casos
SELECT 'casos' as tipo, COUNT(*) as total FROM casos;

-- 4. Verificar si hay eventos
SELECT 'eventos' as tipo, COUNT(*) as total FROM eventos;

-- 5. Verificar si hay pagos
SELECT 'pagos' as tipo, COUNT(*) as total FROM pagos;

-- 6. Mostrar primeros casos (si existen)
SELECT 
  codigo_estimado,
  cliente,
  tipo,
  estado,
  monto_total,
  monto_cobrado,
  created_at
FROM casos 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Verificar políticas RLS activas
SELECT 
  schemaname,
  tablename,
  permissive,
  roles,
  cmd,
  policy
FROM pg_policies 
WHERE tablename IN ('casos', 'perfiles', 'eventos', 'pagos');

-- 8. Verificar si el usuario puede leer casos
SELECT 
  has_table_privilege('public', 'casos', 'SELECT'),
  has_table_privilege('public', 'perfiles', 'SELECT');