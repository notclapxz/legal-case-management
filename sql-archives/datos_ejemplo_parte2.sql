INSERTAR DATOS DE EJEMPLO - PARTE 2
Ejecutar solo si las tablas ya existen

INSERT INTO eventos (
    id, caso_id, fecha_evento, tipo_evento, descripcion, completado
) VALUES
  ('00000000-0000-0000-0000-0000-0000-000000001', '00000000-0000-0000-0000-0000-000000001', CURRENT_DATE + INTERVAL '1 day', 'Audiencia', 'Audiencia de juicio oral - Sala 3', false),
  ('00000000-0000-0000-0000-0000-000000002', '00000000-0000-0000-0000-000000001', CURRENT_DATE + INTERVAL '3 days', 'Audiencia', 'Audiencia preliminar', false),
  ('00000-0000-0000-0000-0000-000000003', '00000-0000-0000-0000-0000-000000003', CURRENT_DATE + INTERVAL '7 days', 'Plazo', 'Plazo para presentar apelaciones', false)
ON CONFLICT DO NOTHING;

INSERT INTO pagos (
    id, caso_id, monto, fecha_pago, concepto
) VALUES
  ('00000-0000-0000-0000-0000-000000001', '00000-0000-0000-0000-000000001', 15000.00, CURRENT_DATE - INTERVAL '15 days', 'Pago parcial - Primera cuota'),
  ('00000-0000-0000-0000-0000-000000001', '00000-0000-0000-0000-000000001', 20000.00, CURRENT_DATE - INTERVAL '8 days', 'Pago parcial - Segunda cuota'),
  ('00000-0000-0000-0000-0000-000000001', '00000-0000-0000-0000-000000001', 25000.00, CURRENT_DATE - INTERVAL '2 days', 'Pago parcial - Tercera cuota'),
  ('00000-0000-0000-0000-0000-000000001', '00000-0000-0000-0000-000000001', 3000.00, CURRENT_DATE - INTERVAL '1 day', 'Última cuota')
ON CONFLICT DO NOTHING;