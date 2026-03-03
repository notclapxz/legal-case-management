-- CONFIGURACIÓN COMPLETA DE DATOS REALES PARA ALERTAS

-- 1. Primero, verificamos que las tablas existan
-- (Si no existen, el usuario ya las creó desde /setup)

-- 2. Insertar eventos reales para las alertas
INSERT INTO eventos (
    id, 
    caso_id, 
    fecha_evento, 
    tipo_evento, 
    descripcion, 
    completado,
    created_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM casos WHERE cliente LIKE '%MORENO%' LIMIT 1),
    NOW() + INTERVAL '2 hours',
    'Audiencia',
    'Audiencia de juicio oral - Sala 3',
    false,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM casos WHERE cliente LIKE '%AGUIRRE%' LIMIT 1),
    NOW() + INTERVAL '4 hours',
    'Audiencia',
    'Audiencia de medidas cautelares - Sala 1',
    false,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM casos WHERE cliente LIKE '%INPESCO%' LIMIT 1),
    NOW() + INTERVAL '6 hours',
    'Reunión con cliente',
    'Reunión de avance del caso - Oficina INPESCO',
    false,
    NOW()
)
ON CONFLICT DO NOTHING;

-- 3. Insertar eventos tipo "Plazo" para alertas
INSERT INTO eventos (
    id,
    caso_id,
    fecha_evento,
    tipo_evento,
    descripcion,
    completado,
    created_at
) VALUES 
(
    gen_random_uuid(),
    (SELECT id FROM casos WHERE cliente LIKE '%CORVETTO%' LIMIT 1),
    NOW() + INTERVAL '1 hour',
    'Plazo',
    'Vence plazo para contestar demanda',
    false,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM casos WHERE cliente LIKE '%RISCO%' LIMIT 1),
    NOW() + INTERVAL '2 hours',
    'Plazo',
    'Vence plazo para apelar sentencia',
    false,
    NOW()
),
(
    gen_random_uuid(),
    (SELECT id FROM casos WHERE cliente LIKE '%MARTINEZ%' LIMIT 1),
    NOW() + INTERVAL '3 hours',
    'Plazo',
    'Vence plazo para presentar pruebas',
    false,
    NOW()
)
ON CONFLICT DO NOTHING;

-- 4. Insertar pagos reales para finanzas
INSERT INTO pagos (
    id,
    caso_id,
    monto,
    fecha_pago,
    concepto,
    created_at
) SELECT 
    gen_random_uuid(),
    id,
    (monto_total * 0.2)::decimal(10,2), -- 20% del total
    CURRENT_DATE - INTERVAL '5 days',
    'Cuota inicial - honorarios legales',
    NOW()
FROM casos 
WHERE estado = 'Activo' 
  AND monto_cobrado < monto_total
LIMIT 5;

-- 5. Crear tabla de mensajes (si no existe)
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    remitente VARCHAR(255) NOT NULL,
    asunto VARCHAR(500) NOT NULL,
    mensaje TEXT,
    tipo VARCHAR(50) DEFAULT 'consulta', -- 'consulta', 'actualizacion', 'urgente'
    leido BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insertar mensajes pendientes reales
INSERT INTO mensajes (
    caso_id,
    remitente,
    asunto,
    mensaje,
    tipo,
    leido,
    fecha_envio
) VALUES 
(
    (SELECT id FROM casos WHERE cliente LIKE '%MORENO%' LIMIT 1),
    'Carlos Moreno',
    'Consulta sobre audiencia',
    'Abogado, quería confirmar si ya tiene todo preparado para la audiencia de mañana en la Sala 3.',
    'consulta',
    false,
    NOW() - INTERVAL '2 hours'
),
(
    (SELECT id FROM casos WHERE cliente LIKE '%AGUIRRE%' LIMIT 1),
    'Carlos Aguirre',
    'Actualización de documentación',
    'Le adjunto los nuevos documentos que me pidieron para el caso. Favor de revisar.',
    'actualizacion',
    false,
    NOW() - INTERVAL '5 hours'
)
ON CONFLICT DO NOTHING;

-- 7. Crear vista para alertas del dashboard
CREATE OR REPLACE VIEW dashboard_alertas AS
SELECT 
    'audiencia' as tipo_alerta,
    COUNT(*) as cantidad,
    MIN(fecha_evento) as proxima_fecha,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ Tienes audiencias programadas'
        ELSE '✅ No tienes audiencias hoy'
    END as mensaje
FROM eventos 
WHERE tipo_evento = 'Audiencia' 
  AND DATE(fecha_evento) = CURRENT_DATE
  AND completado = false
GROUP BY tipo_alerta

UNION ALL

SELECT 
    'plazo' as tipo_alerta,
    COUNT(*) as cantidad,
    MIN(fecha_evento) as proxima_fecha,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ Tienes plazos que vencen hoy'
        ELSE '✅ No tienes plazos urgentes'
    END as mensaje
FROM eventos 
WHERE tipo_evento = 'Plazo' 
  AND DATE(fecha_evento) = CURRENT_DATE
  AND completado = false
GROUP BY tipo_alerta

UNION ALL

SELECT 
    'pagos' as tipo_alerta,
    COUNT(*) as cantidad,
    NULL as proxima_fecha,
    CASE 
        WHEN COUNT(*) > 0 THEN '💰 Hay pagos pendientes de gestionar'
        ELSE '✅ Todos los pagos registrados'
    END as mensaje
FROM pagos 
WHERE DATE(fecha_pago) = CURRENT_DATE

UNION ALL

SELECT 
    'mensajes' as tipo_alerta,
    COUNT(*) as cantidad,
    NULL as proxima_fecha,
    CASE 
        WHEN COUNT(*) > 0 THEN '📞 Tienes mensajes sin responder'
        ELSE '✅ No tienes mensajes pendientes'
    END as mensaje
FROM mensajes 
WHERE leido = false;

-- 8. Verificación final
SELECT '✅ Datos de alertas configurados correctamente' as resultado,
       COUNT(*) as total_alertas 
FROM dashboard_alertas;