-- ===================================
-- MIGRACIONES COMPLETAS PARA SUPABASE
-- EJECUTAR EN ORDEN EN SUPABASE SQL EDITOR
-- ===================================

-- 1. Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo TEXT,
    rol VARCHAR(50) NOT NULL DEFAULT 'user',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de casos
CREATE TABLE IF NOT EXISTS casos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estimado VARCHAR(100) UNIQUE,
    cliente VARCHAR(255) NOT NULL,
    descripcion_caso TEXT,
    numero_expediente VARCHAR(100),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Penal', 'Civil', 'Laboral', 'Administrativo')),
    etapa VARCHAR(50) NOT NULL CHECK (etapa IN ('Preliminar', 'Investigación preparatoria', 'Etapa intermedia', 'Juicio oral', 'Apelación', 'Casación')),
    abogada_asignada_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    forma_pago VARCHAR(50) NOT NULL CHECK (forma_pago IN ('Por hora', 'Por etapas', 'Monto fijo', 'Por honorarios')),
    monto_total DECIMAL(10,2) NOT NULL CHECK (monto_total > 0),
    monto_cobrado DECIMAL(10,2) DEFAULT 0 CHECK (monto_cobrado >= 0),
    fecha_inicio DATE NOT NULL,
    ubicacion_fisica VARCHAR(20),
    expediente VARCHAR(10),
    tomo VARCHAR(10),
    estado VARCHAR(50) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Pausado', 'Cerrado')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Audiencia', 'Plazo', 'Reunión con cliente')),
    descripcion TEXT NOT NULL,
    completado BOOLEAN DEFAULT false,
    recordatorio_7_dias BOOLEAN DEFAULT false,
    recordatorio_3_dias BOOLEAN DEFAULT false,
    recordatorio_1_dia BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    comprobante_sunat VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear tabla de logs de actividad
CREATE TABLE IF NOT EXISTS actividad_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices importantes
CREATE INDEX IF NOT EXISTS idx_casos_cliente ON casos(cliente);
CREATE INDEX IF NOT EXISTS idx_casos_codigo ON casos(codigo_estimado);
CREATE INDEX IF NOT EXISTS idx_casos_estado ON casos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_caso ON eventos(caso_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_caso ON pagos(caso_id);

-- 7. Crear trigger para actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_caso()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_caso ON casos;
CREATE TRIGGER trigger_actualizar_timestamp_caso
    BEFORE UPDATE ON casos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_caso();

-- 8. Crear vista de estadísticas
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM casos WHERE estado = 'Activo') as casos_activos,
    (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)) as cobros_mes_actual,
    (SELECT COALESCE(SUM(monto_total - monto_cobrado), 0) FROM casos WHERE estado = 'Activo') as cobros_pendientes,
    (SELECT COUNT(*) FROM eventos WHERE completado = false AND fecha_evento >= CURRENT_DATE - INTERVAL '7 days') as eventos_proximos;

-- 9. Vista para eventos próximos
CREATE OR REPLACE VIEW eventos_proximos AS
SELECT 
    e.*,
    c.codigo_estimado,
    c.cliente,
    c.expediente,
    EXTRACT(DAY FROM (e.fecha_evento - CURRENT_DATE)) AS dias_restantes
FROM eventos e
JOIN casos c ON e.caso_id = c.id
WHERE e.completado = false
  AND e.fecha_evento >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY 
    EXTRACT(DAY FROM (e.fecha_evento - CURRENT_DATE)) ASC,
    e.fecha_evento ASC;

-- 10. Insertar datos de ejemplo si las tablas están vacías
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
  ('00000000-0000-0000-0000-000000000002', 'AGUIRRE-01', 'Carlos Aguirre', 'SIS / CARLOS AGUIRRE', '472-2017', 'Penal', 'Investigación preparatoria',
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
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', CURRENT_DATE + INTERVAL '3 days', 'Audiencia', 'Audiencia preliminar', false),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '7 days', 'Plazo', 'Plazo para presentar apelaciones', false)
ON CONFLICT DO NOTHING;

INSERT INTO pagos (
    id, caso_id, monto, fecha_pago, concepto
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 15000.00, CURRENT_DATE - INTERVAL '15 days', 'Pago parcial - Primera cuota'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 20000.00, CURRENT_DATE - INTERVAL '8 days', 'Pago parcial - Segunda cuota'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 25000.00, CURRENT_DATE - INTERVAL '2 days', 'Pago parcial - Tercera cuota'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 3000.00, CURRENT_DATE - INTERVAL '1 day', 'Última cuota')
ON CONFLICT DO NOTHING;