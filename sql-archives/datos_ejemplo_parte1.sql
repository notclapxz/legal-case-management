INSERTAR DATOS DE EJEMPLO - PARTE 1
Ejecutar solo si las tablas ya existen

INSERT INTO profiles (id, username, nombre_completo, rol, activo) VALUES
  ('00000000-0000-0000-0000-0000-0000-000000001', 'admin', 'Dr. Principal', 'admin', true),
  ('00000000-0000-0000-0000-0000-000000002', 'abogada1', 'María González', 'abogado', true),
  ('00000000-0000-0000-0000-0000-000000003', 'secretaria', 'Ana Torres', 'secretaria', true)
ON CONFLICT DO NOTHING;

INSERT INTO casos (
    id, codigo_estimado, cliente, descripcion_caso, numero_expediente, tipo, etapa, 
    abogada_asignada_id, forma_pago, monto_total, monto_cobrado, 
    fecha_inicio, estado, ubicacion_fisica
) VALUES
  ('00000000-0000-0000-0000-0000-0000-000000001', 'MORENO-01', 'Carlos Moreno', 'REQUERIMIENTO DE PRISION PREVENTIVA', '02437-2016', 'Penal', 'Juicio oral',
   '00000000-0000-0000-0000-0000-000000001', 'Por etapas', 50000.00, 35000.00, '2023-06-10', 'Activo', '1-A1'),
  ('00000000-0000-0000-0000-0000-000000002', 'AGUIRRE-01', 'Carlos Aguirre', 'SIS / CARLOS AGUIRRE', '472-2017', 'Penal', 'Investigacion preparatoria',
   '00000000-0000-0000-0000-000000001', 'Monto fijo', 40000.00, 28000.00, '2017-08-10', 'Activo', '5-D1'),
  ('00000000-0000-0000-0000-0000-000000003', 'BARAKA-01', 'Luka Miguel Baraka', 'LAC CHIMBOTE', '73-2015', 'Penal', 'Etapa intermedia',
   '00000000-0000-0000-0000-000000002', 'Monto fijo', 55000.00, 40000.00, '2015-04-12', 'Activo', '3-C1')
ON CONFLICT DO NOTHING;