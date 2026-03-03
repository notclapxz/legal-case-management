-- Migration: allow_read_active_users
-- Fecha: 2026-01-27
-- Descripción: Permitir que usuarios autenticados vean perfiles de otros usuarios activos
--              Necesario para el sistema de permisos compartidos en casos

-- =====================================================
-- PROBLEMA DETECTADO:
-- =====================================================
-- Las RLS policies de `profiles` solo permitían:
-- 1. Ver tu PROPIO perfil (auth.uid() = id)
-- 2. Actualizar tu PROPIO perfil
--
-- Esto bloqueaba el componente UsuariosConAccesoCheckboxes,
-- que necesita listar todos los abogados y secretarias activos
-- para poder asignarles acceso a casos compartidos.

-- =====================================================
-- SOLUCIÓN:
-- =====================================================
-- Agregar policy que permita a usuarios autenticados
-- ver perfiles de OTROS usuarios activos.

CREATE POLICY "Usuarios autenticados ven perfiles activos"
ON profiles
FOR SELECT
TO authenticated
USING (activo = true);

-- =====================================================
-- SEGURIDAD:
-- =====================================================
-- Esta policy solo expone información BÁSICA de usuarios:
-- - id (UUID)
-- - username
-- - nombre_completo
-- - rol (admin/abogado/secretaria)
-- - activo (boolean)
--
-- NO expone información sensible (passwords están en auth.users)
-- Solo usuarios con `activo = true` son visibles

-- =====================================================
-- TESTING:
-- =====================================================
-- 1. Login como RZRV (admin)
-- 2. Ir a "Nuevo Caso" o "Editar Caso"
-- 3. Verificar que aparecen María González y Ana Torres
--    en la sección "Permisos de Acceso"
