-- ===================================
-- MIGRACIÓN: AGREGAR CAMPO estado_caso
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ===================================

-- 1. Agregar nuevo campo estado_caso
ALTER TABLE casos 
ADD COLUMN IF NOT EXISTS estado_caso VARCHAR(50) DEFAULT 'En proceso' 
CHECK (estado_caso IN ('En proceso', 'Ganado', 'Perdido'));

-- 2. Actualizar datos existentes
-- Convertir los valores actuales a los nuevos
UPDATE casos 
SET estado_caso = CASE 
    WHEN estado = 'Activo' THEN 'En proceso'
    WHEN estado = 'Pausado' THEN 'En proceso' 
    WHEN estado = 'Cerrado' THEN 'Perdido'
    ELSE 'En proceso'
END;

-- 3. Crear índice para el nuevo campo
CREATE INDEX IF NOT EXISTS idx_casos_estado_caso ON casos(estado_caso);

-- 4. Opcional: Eliminar el campo viejo (descomentar si estás seguro)
-- ALTER TABLE casos DROP COLUMN estado;

-- ===================================
-- VERIFICACIÓN
-- ===================================

-- Verificar que el campo se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND column_name = 'estado_caso';

-- Verificar la actualización de datos
SELECT estado, estado_caso, COUNT(*) as cantidad
FROM casos 
GROUP BY estado, estado_caso
ORDER BY estado;