VERSION SIMPLIFICADA - CREA SOLO TABLAS BASICAS

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

-- Paso 3: Crear tabla de casos (versión simple)
CREATE TABLE IF NOT EXISTS casos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estimado VARCHAR(100) UNIQUE,
    cliente VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL,
    etapa VARCHAR(50) NOT NULL,
    abogada_asignada_id UUID,
    forma_pago VARCHAR(50) NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    monto_cobrado DECIMAL(10,2) DEFAULT 0,
    fecha_inicio DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 4: Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL,
    descripcion TEXT NOT NULL,
    completado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 5: Crear tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 6: Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_casos_cliente ON casos(cliente);
CREATE INDEX IF NOT EXISTS idx_casos_codigo ON casos(codigo_estimado);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);

-- Paso 7: Verificación final
SELECT 'Tablas simplificadas creadas' as resultado;