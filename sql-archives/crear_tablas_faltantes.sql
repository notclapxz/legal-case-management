-- CREAR TABLAS FALTANTES CORRECTAMENTE

-- 1. Crear tabla de eventos con la estructura correcta
CREATE TABLE IF NOT EXISTS eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'Audiencia', 'Plazo', 'Reunión'
    descripcion TEXT NOT NULL,
    fecha_evento TIMESTAMP WITH TIME ZONE NOT NULL,
    completado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices para eventos
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo);
CREATE INDEX IF NOT EXISTS idx_eventos_caso ON eventos(caso_id);

-- 3. Crear tabla de pagos (si no existe con estructura correcta)
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear índices para pagos
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_caso ON pagos(caso_id);

-- 5. Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    remitente VARCHAR(255) NOT NULL,
    asunto VARCHAR(500) NOT NULL,
    mensaje TEXT,
    tipo VARCHAR(50) DEFAULT 'consulta',
    leido BOOLEAN DEFAULT false,
    fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear índices para mensajes
CREATE INDEX IF NOT EXISTS idx_mensajes_leido ON mensajes(leido);
CREATE INDEX IF NOT EXISTS idx_mensajes_caso ON mensajes(caso_id);

-- Verificación
SELECT '✅ Tablas creadas correctamente' as resultado;