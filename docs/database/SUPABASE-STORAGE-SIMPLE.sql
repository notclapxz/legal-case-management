-- ========================================
-- CONFIGURACIÓN SIMPLE SUPABASE STORAGE
-- Bucket: notas-imagenes
-- ========================================

-- PASO 1: Eliminar todas las policies existentes
DROP POLICY IF EXISTS "Allow authenticated upload to notas-imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from notas-imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update in notas-imagenes" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own images in notas-imagenes" ON storage.objects;

-- PASO 2: Crear policies simples que FUNCIONAN

-- Policy 1: Permitir subir a usuarios autenticados
CREATE POLICY "upload_authenticated"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notas-imagenes');

-- Policy 2: Permitir lectura pública
CREATE POLICY "read_public"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'notas-imagenes');

-- Policy 3: Permitir actualizar a usuarios autenticados
CREATE POLICY "update_authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'notas-imagenes')
WITH CHECK (bucket_id = 'notas-imagenes');

-- Policy 4: Permitir eliminar a usuarios autenticados (todos pueden eliminar por ahora)
CREATE POLICY "delete_authenticated"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'notas-imagenes');

-- ========================================
-- VERIFICAR
-- ========================================
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%authenticated%' OR policyname LIKE '%public%'
ORDER BY policyname;
