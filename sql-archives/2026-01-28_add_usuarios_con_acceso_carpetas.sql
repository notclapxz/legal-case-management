-- =====================================================
-- Migración: Agregar campo usuarios_con_acceso a carpetas
-- Fecha: 2026-01-28
-- Propósito: Permitir compartir carpetas con usuarios
-- =====================================================

-- Agregar columna usuarios_con_acceso (array de UUIDs)
ALTER TABLE carpetas 
ADD COLUMN IF NOT EXISTS usuarios_con_acceso UUID[] DEFAULT '{}';

-- Comentario explicativo
COMMENT ON COLUMN carpetas.usuarios_con_acceso IS 
  'Array de user IDs (profiles.id) con acceso a esta carpeta. Si un usuario tiene acceso a una carpeta, puede ver todos los casos dentro (permisos heredados).';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'carpetas' 
  AND column_name = 'usuarios_con_acceso';

-- =====================================================
-- Notas de Implementación:
-- =====================================================
-- 
-- LÓGICA DE PERMISOS (HEREDADOS):
-- 
-- 1. Si usuario tiene acceso a carpeta PADRE → ve todas las subcarpetas
-- 2. Si usuario tiene acceso a carpeta → ve TODOS los casos dentro
-- 3. Sistema funciona en paralelo con permisos de casos individuales
-- 
-- EJEMPLO:
-- 
--   📁 Casos Laborales (usuarios_con_acceso: [maria_id])
--      ├─ 📁 Despidos → María lo ve automáticamente
--      │    └─ Caso-001 → María lo ve automáticamente
--      └─ 📁 Indemnizaciones → María lo ve automáticamente
--           └─ Caso-002 → María lo ve automáticamente
-- 
-- USUARIO PUEDE VER CASO SI:
-- 
--   - Es el abogado_asignado_id (dueño)
--   - Está en caso.usuarios_con_acceso[] (permiso directo)
--   - Tiene acceso a la carpeta del caso
--   - Tiene acceso a carpeta padre (heredado)
-- 
-- =====================================================

-- Ejemplo de uso:
-- 
-- -- Dar acceso a María (abogado) a carpeta "Casos Laborales"
-- UPDATE carpetas 
-- SET usuarios_con_acceso = ARRAY['85ae549f-9bd8-4e5b-8f36-673b1d8b61ae']
-- WHERE nombre = 'Casos Laborales';
-- 
-- -- Agregar otro usuario manteniendo los existentes
-- UPDATE carpetas 
-- SET usuarios_con_acceso = array_append(usuarios_con_acceso, 'otro-uuid')
-- WHERE id = 'carpeta-id';
-- 
-- -- Remover usuario
-- UPDATE carpetas 
-- SET usuarios_con_acceso = array_remove(usuarios_con_acceso, 'usuario-uuid')
-- WHERE id = 'carpeta-id';
-- 
-- =====================================================
