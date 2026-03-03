-- INSERTAR DATOS REALES DE EJEMPLO

-- 1. Insertar eventos de ejemplo
INSERT INTO eventos (caso_id, tipo, descripcion, fecha_evento) 
SELECT 
    id, 
    'Audiencia',
    'Audiencia de juicio oral - Sala Penal',
    NOW() + INTERVAL '2 hours'
FROM casos 
WHERE cliente LIKE '%MORENO%' 
LIMIT 1;

INSERT INTO eventos (caso_id, tipo, descripcion, fecha_evento)
SELECT 
    id, 
    'Audiencia', 
    'Audiencia de medidas cautelares',
    NOW() + INTERVAL '4 hours'
FROM casos 
WHERE cliente LIKE '%AGUIRRE%'
LIMIT 1;

INSERT INTO eventos (caso_id, tipo, descripcion, fecha_evento)
SELECT 
    id,
    'Plazo',
    'Vence plazo para contestar demanda',
    NOW() + INTERVAL '3 hours'
FROM casos
WHERE cliente LIKE '%CORVETTO%'
LIMIT 1;

-- 2. Insertar pagos de ejemplo
INSERT INTO pagos (caso_id, monto, fecha_pago, concepto)
SELECT 
    id,
    (monto_total * 0.2)::DECIMAL(10,2),
    CURRENT_DATE,
    'Cuota inicial - honorarios'
FROM casos
WHERE estado = 'Activo' AND monto_cobrado < monto_total
LIMIT 3;

-- 3. Insertar mensajes de ejemplo
INSERT INTO mensajes (caso_id, remitente, asunto, mensaje)
SELECT 
    id,
    cliente,
    'Consulta sobre audiencia',
    CONCAT('Hola, quería confirmar la audiencia programada para hoy. Gracias.')
FROM casos
WHERE cliente LIKE '%MORENO%'
LIMIT 1;

INSERT INTO mensajes (caso_id, remitente, asunto, mensaje)
SELECT 
    id,
    cliente,
    'Documentación del caso',
    CONCAT('Le adjunto los documentos actualizados del caso. Saludos.')
FROM casos
WHERE cliente LIKE '%AGUIRRE%'
LIMIT 1;

-- Verificación final
SELECT 
    (SELECT COUNT(*) FROM eventos WHERE DATE(fecha_evento) = CURRENT_DATE) as eventos_hoy,
    (SELECT COUNT(*) FROM pagos WHERE fecha_pago = CURRENT_DATE) as pagos_hoy,
    (SELECT COUNT(*) FROM mensajes WHERE leido = false) as mensajes_pendientes;