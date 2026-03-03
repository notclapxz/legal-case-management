-- ========================================
-- CONFIGURACIÓN SUPABASE STORAGE
-- Bucket: notas-imagenes
-- ========================================

-- 1. CREAR BUCKET (si no existe)
-- Ejecutar en: Storage > Create bucket
-- Name: notas-imagenes
-- Public: YES (checked)
-- File size limit: 5MB

-- 2. POLÍTICAS DE SEGURIDAD (RLS)
-- Ejecutar en: SQL Editor

-- ========================================
-- IMPORTANTE: Primero eliminar policies existentes
-- ========================================
DROP POLICY IF EXISTS "Usuarios auth pueden subir" ON storage.objects;
DROP POLICY IF EXISTS "Lectura pública" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propias imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own images" ON storage.objects;

-- ========================================
-- POLICIES CORRECTAS
-- ========================================

-- Policy 1: Permitir INSERT (upload) a usuarios autenticados
CREATE POLICY "Allow authenticated upload to notas-imagenes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'notas-imagenes'
);

-- Policy 2: Permitir SELECT (lectura) pública
CREATE POLICY "Allow public read from notas-imagenes"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'notas-imagenes'
);

-- Policy 3: Permitir UPDATE a usuarios autenticados
CREATE POLICY "Allow authenticated update in notas-imagenes"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'notas-imagenes'
)
WITH CHECK (
  bucket_id = 'notas-imagenes'
);

-- Policy 4: Permitir DELETE solo al dueño
CREATE POLICY "Allow users to delete own images in notas-imagenes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'notas-imagenes' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ========================================
-- VERIFICAR QUE LAS POLICIES EXISTAN
-- ========================================
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- ========================================
-- VERIFICAR CONFIGURACIÓN DEL BUCKET
-- ========================================
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE name = 'notas-imagenes';
