-- VERIFICAR COLUMNAS EXACTAS QUE EXISTEN EN LA TABLA casos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND table_schema = 'public'
ORDER BY ordinal_position;