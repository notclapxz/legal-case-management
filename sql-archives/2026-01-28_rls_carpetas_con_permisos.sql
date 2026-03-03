-- =====================================================
-- Migración: RLS para carpetas con permisos
-- Fecha: 2026-01-28
-- Propósito: Ocultar carpetas sin permisos para usuarios no-admin
-- =====================================================

-- FUNCIÓN AUXILIAR: Verificar si usuario tiene casos en una carpeta
CREATE OR REPLACE FUNCTION tiene_casos_en_carpeta(carpeta_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si hay al menos un caso en esta carpeta que el usuario pueda ver
  RETURN EXISTS (
    SELECT 1
    FROM casos
    WHERE carpeta_id = carpeta_id_param
      AND (
        abogado_asignado_id = user_id_param
        OR user_id_param = ANY(usuarios_con_acceso)
      )
  );
END;
$$;

COMMENT ON FUNCTION tiene_casos_en_carpeta IS 
  'Verifica si un usuario tiene al menos un caso visible en una carpeta específica';

-- =====================================================
-- HABILITAR RLS EN CARPETAS
-- =====================================================

ALTER TABLE carpetas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY: Admin ve todas las carpetas
-- =====================================================

DROP POLICY IF EXISTS "Admin ve todas las carpetas" ON carpetas;

CREATE POLICY "Admin ve todas las carpetas"
ON carpetas FOR SELECT
TO authenticated
USING (
  (SELECT rol FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- =====================================================
-- POLICY: Usuario ve carpetas con permisos o con casos asignados
-- =====================================================

DROP POLICY IF EXISTS "Usuario ve carpetas con acceso" ON carpetas;

CREATE POLICY "Usuario ve carpetas con acceso"
ON carpetas FOR SELECT
TO authenticated
USING (
  -- Es admin (redundante pero explícito)
  (SELECT rol FROM profiles WHERE id = auth.uid()) = 'admin'
  
  OR
  
  -- Tiene acceso directo a esta carpeta
  auth.uid() = ANY(usuarios_con_acceso)
  
  OR
  
  -- Tiene acceso a carpeta padre (herencia)
  tiene_acceso_a_carpeta(carpeta_padre_id, auth.uid())
  
  OR
  
  -- Tiene al menos un caso asignado en esta carpeta
  tiene_casos_en_carpeta(id, auth.uid())
);

-- =====================================================
-- POLICY: Admin puede INSERT/UPDATE/DELETE carpetas
-- =====================================================

DROP POLICY IF EXISTS "Admin maneja carpetas" ON carpetas;

CREATE POLICY "Admin maneja carpetas"
ON carpetas FOR ALL
TO authenticated
USING (
  (SELECT rol FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- =====================================================
-- Verificar policies
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'carpetas'
ORDER BY policyname;

-- =====================================================
-- TESTING
-- =====================================================
--
-- 1. Como Admin (debe ver todas):
-- SET SESSION ROLE authenticated;
-- SET request.jwt.claims.sub = '2e4578b2-0637-451d-820e-8549664712bc'; -- RZRV admin
-- SELECT id, nombre FROM carpetas; -- Ve todas
--
-- 2. Como María (abogado sin permisos en carpeta):
-- SET request.jwt.claims.sub = '85ae549f-9bd8-4e5b-8f36-673b1d8b61ae'; -- María
-- SELECT id, nombre FROM carpetas; -- Solo ve carpetas donde tiene casos o permisos
--
-- 3. Dar permiso a carpeta:
-- UPDATE carpetas 
-- SET usuarios_con_acceso = ARRAY['85ae549f-9bd8-4e5b-8f36-673b1d8b61ae']
-- WHERE nombre = 'Casos Penales';
-- -- Ahora María ve "Casos Penales"
--
-- =====================================================

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- VENTAJAS:
-- - Seguridad a nivel de BD (RLS)
-- - Usuario solo ve carpetas relevantes
-- - No revela estructura completa del despacho
-- - Menos confusión (no ver carpetas vacías)
--
-- COMPORTAMIENTO:
-- - Si usuario NO tiene permisos a carpeta
-- - Y NO tiene casos asignados dentro
-- - → Carpeta NO aparece en el SELECT
--
-- - Si usuario tiene UN SOLO caso en carpeta
-- - → Carpeta aparece automáticamente
--
-- - Si admin da permiso a carpeta
-- - → Usuario ve carpeta + TODOS los casos dentro
--
-- =====================================================
