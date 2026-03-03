-- ============================================================================
-- SISTEMA DE CARPETAS PARA CASOS
-- ============================================================================
-- Created: Jan 2026
-- Purpose: Organizar casos en carpetas jerárquicas (con subcarpetas)
-- ============================================================================

-- ============================================================================
-- TABLA: carpetas
-- ============================================================================
-- Estructura de árbol: permite carpetas dentro de carpetas (ilimitadas)

CREATE TABLE IF NOT EXISTS carpetas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información básica
  nombre TEXT NOT NULL,
  descripcion TEXT,
  color TEXT DEFAULT '#3B82F6', -- Color para identificación visual (hex)
  icono TEXT DEFAULT '📁',       -- Emoji o ícono
  
  -- Jerarquía (estructura de árbol)
  carpeta_padre_id UUID REFERENCES carpetas(id) ON DELETE CASCADE,
  -- NULL = carpeta raíz (nivel superior)
  -- UUID = subcarpeta dentro de otra carpeta
  
  -- Orden y metadatos
  orden INTEGER DEFAULT 0,       -- Para ordenar carpetas al mismo nivel
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id)
);

-- ============================================================================
-- INDICES PARA CARPETAS
-- ============================================================================

-- Índice para búsqueda por carpeta padre (obtener subcarpetas)
CREATE INDEX IF NOT EXISTS idx_carpetas_padre_id 
ON carpetas(carpeta_padre_id);

-- Índice para ordenamiento
CREATE INDEX IF NOT EXISTS idx_carpetas_orden 
ON carpetas(orden);

-- Índice para búsqueda por nombre
CREATE INDEX IF NOT EXISTS idx_carpetas_nombre 
ON carpetas(nombre);

-- ============================================================================
-- MODIFICAR TABLA CASOS
-- ============================================================================
-- Agregar referencia a carpeta

ALTER TABLE casos 
ADD COLUMN IF NOT EXISTS carpeta_id UUID REFERENCES carpetas(id) ON DELETE SET NULL;

-- Índice para filtrar casos por carpeta
CREATE INDEX IF NOT EXISTS idx_casos_carpeta_id 
ON casos(carpeta_id);

-- ============================================================================
-- TRIGGER: Actualizar updated_at en carpetas
-- ============================================================================

CREATE OR REPLACE FUNCTION update_carpeta_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carpetas_updated_at
  BEFORE UPDATE ON carpetas
  FOR EACH ROW
  EXECUTE FUNCTION update_carpeta_timestamp();

-- ============================================================================
-- FUNCIÓN: Obtener ruta completa de carpeta
-- ============================================================================
-- Ejemplo: "Casos 2024 / Penales / Robos"

CREATE OR REPLACE FUNCTION get_carpeta_path(carpeta_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT := '';
  current_id UUID := carpeta_uuid;
  current_nombre TEXT;
  parent_id UUID;
BEGIN
  -- Recorrer hacia arriba hasta llegar a la raíz
  WHILE current_id IS NOT NULL LOOP
    SELECT nombre, carpeta_padre_id INTO current_nombre, parent_id
    FROM carpetas
    WHERE id = current_id;
    
    IF current_nombre IS NULL THEN
      EXIT;
    END IF;
    
    IF path = '' THEN
      path := current_nombre;
    ELSE
      path := current_nombre || ' / ' || path;
    END IF;
    
    current_id := parent_id;
  END LOOP;
  
  RETURN path;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCIÓN: Contar casos en carpeta (recursivo)
-- ============================================================================
-- Cuenta casos en carpeta + todas sus subcarpetas

CREATE OR REPLACE FUNCTION contar_casos_carpeta(carpeta_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total INTEGER := 0;
  subcarpeta RECORD;
BEGIN
  -- Contar casos directamente en esta carpeta
  SELECT COUNT(*) INTO total
  FROM casos
  WHERE carpeta_id = carpeta_uuid;
  
  -- Sumar casos de subcarpetas (recursivo)
  FOR subcarpeta IN 
    SELECT id FROM carpetas WHERE carpeta_padre_id = carpeta_uuid
  LOOP
    total := total + contar_casos_carpeta(subcarpeta.id);
  END LOOP;
  
  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VISTA: Carpetas con contador de casos
-- ============================================================================

CREATE OR REPLACE VIEW carpetas_con_conteo AS
SELECT 
  c.id,
  c.nombre,
  c.descripcion,
  c.color,
  c.icono,
  c.carpeta_padre_id,
  c.orden,
  c.created_at,
  c.updated_at,
  c.created_by,
  get_carpeta_path(c.id) AS ruta_completa,
  contar_casos_carpeta(c.id) AS total_casos,
  (SELECT COUNT(*) FROM casos WHERE carpeta_id = c.id) AS casos_directos
FROM carpetas c
ORDER BY c.orden, c.nombre;

-- ============================================================================
-- DATOS DE EJEMPLO (OPCIONAL - comentar si no querés)
-- ============================================================================

-- Carpetas raíz
INSERT INTO carpetas (nombre, descripcion, color, icono, orden) VALUES
  ('Casos Penales', 'Todos los casos penales', '#EF4444', '⚖️', 1),
  ('Casos Civiles', 'Casos civiles y comerciales', '#3B82F6', '📋', 2),
  ('Casos Laborales', 'Derecho laboral', '#10B981', '👔', 3),
  ('Archivo', 'Casos cerrados y archivados', '#6B7280', '📦', 4);

-- Subcarpetas dentro de "Casos Penales" (ejemplo)
INSERT INTO carpetas (nombre, descripcion, color, icono, orden, carpeta_padre_id) 
SELECT 
  'Robos y Hurtos', 
  'Casos de robo agravado, hurto, etc.', 
  '#F59E0B', 
  '🔒', 
  1,
  id
FROM carpetas WHERE nombre = 'Casos Penales';

INSERT INTO carpetas (nombre, descripcion, color, icono, orden, carpeta_padre_id) 
SELECT 
  'Violencia Familiar', 
  'Casos de violencia doméstica', 
  '#EC4899', 
  '🚨', 
  2,
  id
FROM carpetas WHERE nombre = 'Casos Penales';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver todas las carpetas con sus rutas y conteos
SELECT * FROM carpetas_con_conteo;

-- Ver casos sin carpeta
SELECT codigo_estimado, cliente, descripcion
FROM casos
WHERE carpeta_id IS NULL
LIMIT 10;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 
-- 1. carpeta_padre_id NULL = carpeta raíz (nivel superior)
-- 2. ON DELETE CASCADE = si eliminas carpeta padre, se eliminan subcarpetas
--    (CAMBIAR a SET NULL si preferís que subcarpetas suban de nivel)
-- 3. Casos tienen ON DELETE SET NULL = si eliminas carpeta, casos quedan sin carpeta
-- 4. La función contar_casos_carpeta() es recursiva (puede ser lenta con muchas subcarpetas)
-- 5. Color en formato hex: #RRGGBB (ej: #3B82F6)
-- 
-- ============================================================================
