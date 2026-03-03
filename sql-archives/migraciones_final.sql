-- MIGRACIONES LIMPIAS - EJECUTAR EN SUPABASE SQL EDITOR
-- SIN COMENTARIOS PARA EVITAR ERRORES

-- Paso 1: Eliminar vistas existentes
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

-- Paso 7: Crear indices
CREATE INDEX IF NOT EXISTS idx_casos_cliente ON casos(cliente);
CREATE INDEX IF NOT EXISTS idx_casos_codigo ON casos(codigo_estimado);
CREATE INDEX IF NOT EXISTS idx_casos_estado ON casos(estado);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_caso ON eventos(caso_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_caso ON pagos(caso_id);

-- Paso 8: Crear trigger para timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_caso()
RETURNS TRIGGER AS 
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

-- Paso 9: Verificacion final
SELECT 'Tablas creadas exitosamente' as mensaje;