-- PRUEBA RÁPIDA: Intentar insertar un caso con todos los campos mínimos
-- Esto nos dirá QUÉ campo está causando el error

INSERT INTO casos (
    codigo_estimado,
    cliente,
    tipo,
    forma_pago,
    monto_total,
    monto_cobrado,
    fecha_inicio,
    estado
) VALUES (
    'TEST-999',
    'Cliente Prueba',
    'Penal',
    'Monto fijo',
    1000,
    0,
    CURRENT_DATE,
    'En proceso'
)
RETURNING *;