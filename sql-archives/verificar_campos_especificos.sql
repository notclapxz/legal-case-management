-- VERIFICAR SI EXISTE EL CAMPO estado_caso EN LA TABLA casos
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'casos' 
AND table_schema = 'public'
AND column_name IN ('descripcion', 'descripcion_caso', 'estado_caso')
ORDER BY column_name;