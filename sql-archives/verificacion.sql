MIGRACIONES SEGMENTADAS PARA SUPABASE
Ejecutar paso por paso

-- PASO 1: Verificar que las tablas se crearon
SELECT 'Tablas creadas correctamente' as mensaje FROM (
    SELECT 'profiles' as tabla, COUNT(*) as registros FROM profiles
    UNION ALL
    SELECT 'casos' as tabla, COUNT(*) as registros FROM casos
    UNION ALL
    SELECT 'eventos' as tabla, COUNT(*) as registros FROM eventos
    UNION ALL
    SELECT 'pagos' as tabla, COUNT(*) as registros FROM pagos
);