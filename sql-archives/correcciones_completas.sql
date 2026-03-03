-- CORRECCIONES COMPLETAS PARA LA BASE DE DATOS
-- Ejecutar DESPUÉS de verificar la estructura actual

-- 1. Primero, eliminar tablas existentes si hay inconsistencias
DROP TABLE IF EXISTS actividad_log CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS casos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Crear tabla de perfiles corregida
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo TEXT,
    rol VARCHAR(50) NOT NULL DEFAULT 'user',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de casos con las opciones correctas del formulario
CREATE TABLE casos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estimado VARCHAR(100) UNIQUE,
    cliente VARCHAR(255) NOT NULL,
    descripcion_caso TEXT,  -- campo correcto para descripción
    numero_expediente VARCHAR(100),
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Penal', 'Civil', 'Laboral', 'Administrativo')),
    etapa VARCHAR(50) NOT NULL CHECK (etapa IN ('Preliminar', 'Investigación preparatoria', 'Etapa intermedia', 'Juicio oral', 'Apelación', 'Casación')),
    abogada_asignada_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    forma_pago VARCHAR(50) NOT NULL CHECK (forma_pago IN ('Por hora', 'Por etapas', 'Monto fijo', 'Cuota litis')),
    monto_total DECIMAL(10,2) NOT NULL CHECK (monto_total > 0),
    monto_cobrado DECIMAL(10,2) DEFAULT 0 CHECK (monto_cobrado >= 0),
    fecha_inicio DATE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Pausado', 'Cerrado', 'Ganado', 'Perdido')),
    ubicacion_fisica VARCHAR(20),
    expediente VARCHAR(10),
    tomo VARCHAR(10),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de eventos
CREATE TABLE eventos (
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

-- 5. Crear tabla de pagos
CREATE TABLE pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caso_id UUID REFERENCES casos(id) ON DELETE CASCADE,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    fecha_pago DATE NOT NULL,
    concepto TEXT,
    comprobante_sunat VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Crear tabla de logs de actividad
CREATE TABLE actividad_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID,
    detalles JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear índices para mejor rendimiento
CREATE INDEX idx_casos_cliente ON casos(cliente);
CREATE INDEX idx_casos_codigo_estimado ON casos(codigo_estimado);
CREATE INDEX idx_casos_estado ON casos(estado);
CREATE INDEX idx_casos_abogada ON casos(abogada_asignada_id);
CREATE INDEX idx_casos_fecha_inicio ON casos(fecha_inicio);

CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX idx_eventos_caso ON eventos(caso_id);
CREATE INDEX idx_eventos_completado ON eventos(completado);

CREATE INDEX idx_pagos_caso ON pagos(caso_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_pago);

CREATE INDEX idx_log_usuario ON actividad_log(usuario_id);
CREATE INDEX idx_log_fecha ON actividad_log(created_at);

-- 8. Crear usuarios de prueba
INSERT INTO profiles (id, username, nombre_completo, rol) VALUES
('12345678-1234-1234-1234-123456789012', 'admin', 'Administrador del Sistema', 'admin'),
('12345678-1234-1234-1234-123456789013', 'abogada1', 'Abogada Senior', 'abogado'),
('12345678-1234-1234-1234-123456789014', 'secretaria', 'Secretaria Legal', 'secretaria')
ON CONFLICT (id) DO NOTHING;

-- 9. Crear políticas de seguridad (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE casos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad_log ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Todos pueden ver perfiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Solo admin puede insertar perfiles" ON profiles FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para casos
CREATE POLICY "Usuarios autenticados pueden ver casos" ON casos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuarios autenticados pueden crear casos" ON casos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Usuarios pueden actualizar sus casos" ON casos FOR UPDATE USING (auth.uid() = abogada_asignada_id OR auth.jwt() ->> 'role' = 'admin');

-- Políticas para eventos
CREATE POLICY "Usuarios autenticados pueden ver eventos" ON eventos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Usuarios pueden crear eventos" ON eventos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para pagos
CREATE POLICY "Usuarios autenticados pueden ver pagos" ON pagos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLíticas "Usuarios pueden crear pagos" ON pagos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para logs
CREATE POLICY "Todos pueden ver logs" ON actividad_log FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden crear logs" ON actividad_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');