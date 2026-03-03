-- =====================================================
-- Migración: Actualizar RLS de casos para considerar permisos de carpeta
-- Fecha: 2026-01-28
-- Propósito: Permitir ver casos si usuario tiene acceso a la carpeta
-- =====================================================

-- FUNCIÓN AUXILIAR: Verificar si usuario tiene acceso a carpeta (con herencia)
CREATE OR REPLACE FUNCTION tiene_acceso_a_carpeta(carpeta_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  carpeta_actual UUID;
  usuarios_acceso UUID[];
BEGIN
  -- Si carpeta es NULL, retornar false (no hay carpeta)
  IF carpeta_id_param IS NULL THEN
    RETURN FALSE;
  END IF;
  
  carpeta_actual := carpeta_id_param;
  
  -- Loop para verificar carpeta actual y todas las carpetas padre
  LOOP
    -- Obtener usuarios_con_acceso de la carpeta actual
    SELECT usuarios_con_acceso INTO usuarios_acceso
    FROM carpetas
    WHERE id = carpeta_actual;
    
    -- Si no se encuentra la carpeta, salir
    IF NOT FOUND THEN
      EXIT;
    END IF;
    
    -- Verificar si el usuario está en la lista
    IF user_id_param = ANY(usuarios_acceso) THEN
      RETURN TRUE;
    END IF;
    
    -- Obtener carpeta padre para siguiente iteración
    SELECT carpeta_padre_id INTO carpeta_actual
    FROM carpetas
    WHERE id = carpeta_actual;
    
    -- Si no hay carpeta padre, salir
    IF carpeta_actual IS NULL THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN FALSE;
END;
$$;

-- Comentario
COMMENT ON FUNCTION tiene_acceso_a_carpeta IS 
  'Verifica si un usuario tiene acceso a una carpeta (considerando herencia de carpetas padre)';

-- =====================================================
-- ACTUALIZAR POLICY: Abogado ve casos asignados O con permisos O en carpeta con permisos
-- =====================================================

-- Eliminar policy anterior
DROP POLICY IF EXISTS "Abogado ve casos asignados" ON casos;

-- Crear nueva policy con lógica de carpetas
CREATE POLICY "Abogado ve casos asignados o compartidos"
ON casos FOR SELECT
TO authenticated
USING (
  -- Es admin → ve todo
  (SELECT rol FROM profiles WHERE id = auth.uid()) = 'admin'
  
  OR
  
  -- Es el abogado asignado
  abogado_asignado_id = auth.uid()
  
  OR
  
  -- Está en usuarios_con_acceso del caso
  auth.uid() = ANY(usuarios_con_acceso)
  
  OR
  
  -- Tiene acceso a la carpeta del caso (con herencia)
  tiene_acceso_a_carpeta(carpeta_id, auth.uid())
);

-- =====================================================
-- ACTUALIZAR POLICY: Secretaria ve casos asignados O con permisos O en carpeta con permisos
-- =====================================================

-- Eliminar policy anterior si existe
DROP POLICY IF EXISTS "Secretaria ve casos asignados" ON casos;

-- Crear nueva policy (igual que abogado para lectura)
CREATE POLICY "Secretaria ve casos asignados o compartidos"
ON casos FOR SELECT
TO authenticated
USING (
  -- Es admin → ve todo
  (SELECT rol FROM profiles WHERE id = auth.uid()) = 'admin'
  
  OR
  
  -- Es el abogado/secretaria asignado
  abogado_asignado_id = auth.uid()
  
  OR
  
  -- Está en usuarios_con_acceso del caso
  auth.uid() = ANY(usuarios_con_acceso)
  
  OR
  
  -- Tiene acceso a la carpeta del caso (con herencia)
  tiene_acceso_a_carpeta(carpeta_id, auth.uid())
);

-- =====================================================
-- Verificar que las policies se crearon correctamente
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'casos'
  AND policyname LIKE '%compartidos%';

-- =====================================================
-- EJEMPLO DE USO:
-- =====================================================
--
-- Supongamos:
-- - María (abogado) tiene id: 85ae549f-9bd8-4e5b-8f36-673b1d8b61ae
-- - Carpeta "Casos Laborales" tiene id: carpeta-123
-- - Caso-001 está en "Casos Laborales" (carpeta_id = carpeta-123)
--
-- PASO 1: Dar acceso a María a la carpeta
-- UPDATE carpetas
-- SET usuarios_con_acceso = ARRAY['85ae549f-9bd8-4e5b-8f36-673b1d8b61ae']
-- WHERE id = 'carpeta-123';
--
-- PASO 2: María ahora puede ver Caso-001 automáticamente
-- SELECT * FROM casos WHERE id = 'caso-001'; -- ✅ María lo ve
--
-- PASO 3: Verificar manualmente
-- SELECT tiene_acceso_a_carpeta(
--   'carpeta-123',
--   '85ae549f-9bd8-4e5b-8f36-673b1d8b61ae'
-- ); -- Retorna TRUE
--
-- =====================================================
