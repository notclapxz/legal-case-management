-- MIGRACIÓN SEGURA - SIN PERDER DATOS EXISTENTES
-- Ejecutar solo si necesitas corregir la estructura actual

-- 1. Agregar columnas faltantes a la tabla casos (si no existen)
DO $$
BEGIN
    -- Verificar y agregar columna descripcion_caso si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='descripcion_caso'
    ) THEN
        ALTER TABLE casos ADD COLUMN descripcion_caso TEXT;
    END IF;

    -- Verificar y agregar columna numero_expediente si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='numero_expediente'
    ) THEN
        ALTER TABLE casos ADD COLUMN numero_expediente VARCHAR(100);
    END IF;

    -- Verificar y agregar columna expediente si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='expediente'
    ) THEN
        ALTER TABLE casos ADD COLUMN expediente VARCHAR(10);
    END IF;

    -- Verificar y agregar columna tomo si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='casos' AND column_name='tomo'
    ) THEN
        ALTER TABLE casos ADD COLUMN tomo VARCHAR(10);
    END IF;
END $$;

-- 2. Migrar datos de descripcion a descripcion_caso si es necesario
UPDATE casos SET descripcion_caso = descripcion 
WHERE descripcion_caso IS NULL AND descripcion IS NOT NULL;

-- 3. Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo TEXT,
    rol VARCHAR(50) NOT NULL DEFAULT 'user',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear usuarios de prueba en profiles (si no existen)
INSERT INTO profiles (id, username, nombre_completo, rol) VALUES
('12345678-1234-1234-1234-123456789012', 'admin', 'Administrador del Sistema', 'admin'),
('12345678-1234-1234-1234-123456789013', 'abogada1', 'Abogada Senior', 'abogado'),
('12345678-1234-1234-1234-123456789014', 'secretaria', 'Secretaria Legal', 'secretaria')
ON CONFLICT (id) DO NOTHING;

-- 5. Crear otras tablas si no existen
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Audiencia', 'Plazo', 'Reunión con cliente', 'Reunion con cliente')),
    descripcion TEXT NOT NULL,
    completado BOOLEAN DEFAULT false,
    recordatorio_7_dias BOOLEAN DEFAULT false,
    recordatorio_3_dias BOOLEAN DEFAULT false,
    recordatorio_1_dia BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    comprobante_sunat VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actividad_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_casos_cliente ON casos(cliente);
CREATE INDEX IF NOT EXISTS idx_casos_codigo_estimado ON casos(codigo_estimado);
CREATE INDEX IF NOT EXISTS idx_casos_estado ON casos(estado);
CREATE INDEX IF NOT EXISTS idx_casos_abogada ON casos(abogada_asignada_id);

CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_caso ON eventos(caso_id);

CREATE INDEX IF NOT EXISTS idx_pagos_caso ON pagos(caso_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

-- 7. Habilitar RLS y crear políticas si no existen
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_log ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
DROP POLICY IF EXISTS "Todos pueden ver perfiles" ON profiles;
CREATE POLICY "Todos pueden ver perfiles" ON profiles FOR SELECT USING (true);

-- Políticas para casos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver casos" ON casos;
CREATE POLICY "Usuarios autenticados pueden ver casos" ON casos FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios autenticados pueden crear casos" ON casos;
CREATE POLICY "Usuarios autenticados pueden crear casos" ON casos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus casos" ON casos;
CREATE POLICY "Usuarios pueden actualizar sus casos" ON casos FOR UPDATE USING (auth.uid() = abogada_asignada_id OR auth.jwt() ->> 'role' = 'admin');

-- Políticas para eventos
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver eventos" ON eventos;
CREATE POLICY "Usuarios autenticados pueden ver eventos" ON eventos FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Usuarios pueden crear eventos" ON eventos;
CREATE POLICY "Usuarios pueden crear eventos" ON eventos FOR INSERT WITH CHECK (auth.role() = 'authenticated');