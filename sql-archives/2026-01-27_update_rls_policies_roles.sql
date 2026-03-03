-- =====================================================
-- Migration: Sistema de Permisos por Rol
-- =====================================================
-- Fecha: 27 Enero 2026
-- Descripción: Implementa RLS policies basadas en roles
--              - Admin (RZRV): Ve y modifica TODO
--              - Abogado: Ve casos asignados + notas (NO finanzas)
--              - Secretaria: Ve casos asignados + notas (NO finanzas, NO modifica)

-- =====================================================
-- TABLA: casos
-- =====================================================

-- Eliminar policies viejas
DROP POLICY IF EXISTS "Abogados actualizan sus casos" ON casos;
DROP POLICY IF EXISTS "Abogados ven sus casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados actualizan casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados crean casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados eliminan casos" ON casos;
DROP POLICY IF EXISTS "Usuarios autenticados ven casos" ON casos;

-- ADMIN: Ve y modifica TODO
CREATE POLICY "Admin ve todos los casos" ON casos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admin crea casos" ON casos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admin actualiza casos" ON casos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admin elimina casos" ON casos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

-- ABOGADO: Ve casos asignados (sin campos financieros - se maneja en frontend)
CREATE POLICY "Abogado ve casos asignados" ON casos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'abogado'
      AND casos.abogado_asignado_id = auth.uid()
    )
  );

CREATE POLICY "Abogado actualiza casos asignados" ON casos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'abogado'
      AND casos.abogado_asignado_id = auth.uid()
    )
  );

-- SECRETARIA: Solo ve casos (lectura)
CREATE POLICY "Secretaria ve casos asignados" ON casos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'secretaria'
      AND casos.abogado_asignado_id = auth.uid()
    )
  );

-- =====================================================
-- TABLA: pagos (SOLO ADMIN)
-- =====================================================

DROP POLICY IF EXISTS "Usuarios autenticados crean pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados eliminan pagos" ON pagos;
DROP POLICY IF EXISTS "Usuarios autenticados ven pagos" ON pagos;

CREATE POLICY "Solo admin ve pagos" ON pagos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Solo admin crea pagos" ON pagos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Solo admin actualiza pagos" ON pagos
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Solo admin elimina pagos" ON pagos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

-- =====================================================
-- TABLA: notas (Admin + usuarios asignados al caso)
-- =====================================================

DROP POLICY IF EXISTS "Enable all for authenticated users" ON notas;
DROP POLICY IF EXISTS "Usuarios autenticados crean notas" ON notas;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar notas" ON notas;
DROP POLICY IF EXISTS "Usuarios autenticados ven notas" ON notas;

-- ADMIN: Ve todas las notas
CREATE POLICY "Admin ve todas las notas" ON notas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admin crea notas" ON notas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admin actualiza notas" ON notas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

CREATE POLICY "Admin elimina notas" ON notas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.rol = 'admin'
    )
  );

-- ABOGADO/SECRETARIA: Ve notas de casos asignados
CREATE POLICY "Usuarios ven notas de casos asignados" ON notas
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM casos
      JOIN profiles ON profiles.id = auth.uid()
      WHERE casos.id = notas.caso_id
      AND casos.abogado_asignado_id = auth.uid()
      AND profiles.rol IN ('abogado', 'secretaria')
    )
  );

-- ABOGADO: Puede crear notas en sus casos
CREATE POLICY "Abogado crea notas en casos asignados" ON notas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM casos
      JOIN profiles ON profiles.id = auth.uid()
      WHERE casos.id = notas.caso_id
      AND casos.abogado_asignado_id = auth.uid()
      AND profiles.rol = 'abogado'
    )
  );

CREATE POLICY "Abogado actualiza notas en casos asignados" ON notas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM casos
      JOIN profiles ON profiles.id = auth.uid()
      WHERE casos.id = notas.caso_id
      AND casos.abogado_asignado_id = auth.uid()
      AND profiles.rol = 'abogado'
    )
  );

-- =====================================================
-- RESUMEN DE PERMISOS
-- =====================================================

-- TABLA: casos
-- ✅ Admin: CRUD completo (todos los casos)
-- ✅ Abogado: SELECT + UPDATE (solo casos asignados)
-- ✅ Secretaria: SELECT (solo casos asignados)
-- ❌ Campos financieros: Se ocultan en frontend para abogado/secretaria

-- TABLA: pagos
-- ✅ Admin: CRUD completo
-- ❌ Abogado: Sin acceso
-- ❌ Secretaria: Sin acceso

-- TABLA: notas
-- ✅ Admin: CRUD completo (todas las notas)
-- ✅ Abogado: SELECT + INSERT + UPDATE (solo notas de casos asignados)
-- ✅ Secretaria: SELECT (solo notas de casos asignados)
