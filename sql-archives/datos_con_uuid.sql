INSERTAR DATOS DE EJEMPLO - CON UUIDS VALIDOS

-- Primero, insertar usuarios con UUIDs generados
INSERT INTO profiles (id, username, nombre_completo, rol, activo) VALUES
    (gen_random_uuid(), 'admin', 'Dr. Principal', 'admin', true),
    (gen_random_uuid(), 'abogada1', 'María González', 'abogado', true),
    (gen_random_uuid(), 'secretaria', 'Ana Torres', 'secretaria', true)
ON CONFLICT DO NOTHING;

-- Luego insertar casos con UUIDs válidos
INSERT INTO casos (
    id, codigo_estimado, cliente, descripcion_caso, numero_expediente, tipo, etapa, 
    abogada_asignada_id, forma_pago, monto_total, monto_cobrado, 
    fecha_inicio, estado, ubicacion_fisica
) VALUES
    (gen_random_uuid(), 'MORENO-01', 'Carlos Moreno', 'REQUERIMIENTO DE PRISION PREVENTIVA', '02437-2016', 'Penal', 'Juicio oral',
     gen_random_uuid(), 'Por etapas', 50000.00, 35000.00, '2023-06-10', 'Activo', '1-A1'),
    (gen_random_uuid(), 'AGUIRRE-01', 'Carlos Aguirre', 'SIS / CARLOS AGUIRRE', '472-2017', 'Penal', 'Investigacion preparatoria',
     gen_random_uuid(), 'Monto fijo', 40000.00, 28000.00, '2017-08-10', 'Activo', '5-D1'),
    (gen_random_uuid(), 'BARAKA-01', 'Luka Miguel Baraka', 'LAC CHIMBOTE', '73-2015', 'Penal', 'Etapa intermedia',
     gen_random_uuid(), 'Monto fijo', 55000.00, 40000.00, '2015-04-12', 'Activo', '3-C1')
ON CONFLICT DO NOTHING;

-- Insertar eventos
INSERT INTO eventos (
    id, caso_id, fecha_evento, tipo_evento, descripcion, completado
) VALUES
    (gen_random_uuid(), gen_random_uuid(), CURRENT_DATE + INTERVAL '1 day', 'Audiencia', 'Audiencia de juicio oral - Sala 3', false),
    (gen_random_uuid(), gen_random_uuid(), CURRENT_DATE + INTERVAL '3 days', 'Audiencia', 'Audiencia preliminar', false),
    (gen_random_uuid(), gen_random_uuid(), CURRENT_DATE + INTERVAL '7 days', 'Plazo', 'Plazo para presentar apelaciones', false)
ON CONFLICT DO NOTHING;

-- Insertar pagos
INSERT INTO pagos (
    id, caso_id, monto, fecha_pago, concepto
) VALUES
    (gen_random_uuid(), gen_random_uuid(), 15000.00, CURRENT_DATE - INTERVAL '15 days', 'Pago parcial - Primera cuota'),
    (gen_random_uuid(), gen_random_uuid(), 20000.00, CURRENT_DATE - INTERVAL '8 days', 'Pago parcial - Segunda cuota'),
    (gen_random_uuid(), gen_random_uuid(), 25000.00, CURRENT_DATE - INTERVAL '2 days', 'Pago parcial - Tercera cuota'),
    (gen_random_uuid(), gen_random_uuid(), 3000.00, CURRENT_DATE - INTERVAL '1 day', 'Última cuota')
ON CONFLICT DO NOTHING;