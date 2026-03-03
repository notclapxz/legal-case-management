-- MIGRACIONES PARA SUPABASE - VERSION DEFINITIVA
-- Copiar y pegar todo en Supabase SQL Editor

-- Paso 1: Eliminar vistas si existen
DROP VIEW IF EXISTS dashboard_stats;
DROP VIEW IF EXISTS eventos_proximos;

-- Paso 2: Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo TEXT,
    rol VARCHAR(50) NOT NULL DEFAULT 'user',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 3: Crear tabla de casos
CREATE TABLE IF NOT EXISTS casos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estimado VARCHAR(100) UNIQUE,
    cliente VARCHAR(255) NOT NULL,
    descripcion_caso TEXT,
    numero_expediente VARCHAR(100),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Penal', 'Civil', 'Laboral', 'Administrativo')),
    etapa VARCHAR(50) NOT NULL CHECK (etapa IN ('Preliminar', 'Investigacion preparatoria', 'Etapa intermedia', 'Juicio oral', 'Apelacion', 'Casacion')),
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

-- Paso 4: Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Audiencia', 'Plazo', 'Reunion con cliente')),
    descripcion TEXT NOT NULL,
    completado BOOLEAN DEFAULT false,
    recordatorio_7_dias BOOLEAN DEFAULT false,
    recordatorio_3_dias BOOLEAN DEFAULT false,
    recordatorio_1_dia BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 5: Crear tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    comprobante_sunat VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 6: Crear tabla de logs
CREATE TABLE IF NOT EXISTS actividad_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 7: Crear índices importantes
CREATE INDEX IF NOT EXISTS idx_casos_cliente ON casos(cliente);
CREATE INDEX IF NOT EXISTS idx_casos_codigo ON casos(codigo_estimado);
CREATE INDEX IF NOT EXISTS idx_casos_estado ON casos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_caso ON eventos(caso_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_caso ON pagos(caso_id);

-- Paso 8: Insertar datos de ejemplo
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
  ('00000000-0000-0000-0000-000000000002', 'AGUIRRE-01', 'Carlos Aguirre', 'SIS / CARLOS AGUIRRE', '472-2017', 'Penal', 'Investigacion preparatoria',
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
  ('00000000-0000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', CURRENT_DATE + INTERVAL '7 days', 'Plazo', 'Plazo para presentar apelaciones', false)
ON CONFLICT DO NOTHING;

INSERT INTO pagos (
    id, caso_id, monto, fecha_pago, concepto
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 15000.00, CURRENT_DATE - INTERVAL '15 days', 'Pago parcial - Primera cuota'),
  ('00000000-0000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 20000.00, CURRENT_DATE - INTERVAL '8 days', 'Pago parcial - Segunda cuota'),
  ('00000000-0000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 25000.00, CURRENT_DATE - INTERVAL '2 days', 'Pago parcial - Tercera cuota'),
  ('00000000-0000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 3000.00, CURRENT_DATE - INTERVAL '1 day', 'Última cuota')
ON CONFLICT DO NOTHING;

-- Paso 9: Verificación final
SELECT 'Migraciones completadas exitosamente' as mensaje;