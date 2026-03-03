INSERTAR DATOS DE EJEMPLO
Ejecutar solo si las tablas ya existen

INSERT INTO profiles (id, username, nombre_completo, rol, activo) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Dr. Principal', 'admin', true),
  ('00000000-0000-0000-0000-000000000002', 'abogada1', 'María González', 'abogado', true),
  ('00000000-0000-0000-0000-000000000003', 'secretaria', 'Ana Torres', 'secretaria', true)
ON CONFLICT DO NOTHING;

INSERT INTO casos (
    id, codigo_estimado, cliente, descripcion_caso, numero_expediente, tipo, etapa, 
    abogada_asignada_id, forma_pago, monto_total, monto_cobrado, 
    fecha_inicio, estado, ubicacion_fisica
) VALUES
  ('00000000-0000-0000-0000-000000000001', 'MORENO-01', 'Carlos Moreno', 'REQUERIMIENTO DE PRISION PREVENTIVA', '02437-2016', 'Penal', 'Juicio oral',
   '00000000-0000-0000-0000-000000000001', 'Por etapas', 50000.00, 35000.00,
   '2023-06-10', 'Activo', '1-A1'),
  ('00000000-0000-0000-0000-0000-000000000002', 'AGUIRRE-01', 'Carlos Aguirre', 'SIS / CARLOS AGUIRRE', '472-2017', 'Penal', 'Investigacion preparatoria',
   '00000000-0000-0000-0000-000000000001', 'Monto fijo', 40000.00, 28000.00,
   '2017-08-10', 'Activo', '5-D1'),
  ('00000000-0000-0000-0000-000000000003', 'BARAKA-01', 'Luka Miguel Baraka', 'LAC CHIMBOTE', '73-2015', 'Penal', 'Etapa intermedia',
   '00000000-0000-0000-0000-000000000002', 'Monto fijo', 55000.00, 40000.00,
   '2015-04-12', 'Activo', '3-C1')
ON CONFLICT DO NOTHING;

INSERT INTO eventos (
    id, caso_id, fecha_evento, tipo_evento, descripcion, completado
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '1 day', 'Audiencia', 'Audiencia de juicio oral - Sala 3', false),
  ('00000000-0000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '3 days', 'Audiencia', 'Audiencia preliminar', false),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '7 days', 'Plazo', 'Plazo para presentar apelaciones', false)
ON CONFLICT DO NOTHING;

INSERT INTO pagos (
    id, caso_id, monto, fecha_pago, concepto
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 15000.00, CURRENT_DATE - INTERVAL '15 days', 'Pago parcial - Primera cuota'),
  ('00000-0000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 20000.00, CURRENT_DATE - INTERVAL '8 days', 'Pago parcial - Segunda cuota'),
  (00000-0000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 25000.00, CURRENT_DATE - INTERVAL '2 days', 'Pago parcial - Tercera cuota'),
  ('00000-0000-0000-0000-0000-000000000003', '00000-0000-0000-0000-0000-000000000003', 3000.00, CURRENT_DATE - INTERVAL '1 day', 'Última cuota')
ON CONFLICT DO NOTHING;