-- =====================================================
-- MIGRATION: Crear tabla notificaciones
-- Fecha: 27 Enero 2026
-- Descripción: Registro de notificaciones push enviadas
-- =====================================================

-- Tabla para notificaciones
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('7_dias', '3_dias', '1_dia', 'dia_evento')),
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  
  enviada BOOLEAN DEFAULT FALSE,
  leida BOOLEAN DEFAULT FALSE,
  
  fecha_envio TIMESTAMPTZ,
  fecha_lectura TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id ON notificaciones(user_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_evento_id ON notificaciones(evento_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida) WHERE leida = FALSE;
CREATE INDEX IF NOT EXISTS idx_notificaciones_enviada ON notificaciones(enviada, created_at);

-- Índice único para evitar duplicados (mismo evento, mismo tipo, mismo usuario)
CREATE UNIQUE INDEX IF NOT EXISTS idx_notificaciones_unique 
ON notificaciones(evento_id, tipo, user_id);

-- RLS (Row Level Security)
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios solo ven sus propias notificaciones
DROP POLICY IF EXISTS "Users can view own notifications" ON notificaciones;
CREATE POLICY "Users can view own notifications"
ON notificaciones FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Usuarios pueden actualizar sus propias notificaciones (marcar como leída)
DROP POLICY IF EXISTS "Users can update own notifications" ON notificaciones;
CREATE POLICY "Users can update own notifications"
ON notificaciones FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE notificaciones
  SET leida = TRUE,
      fecha_lectura = NOW()
  WHERE id = notification_id
    AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE notificaciones IS 'Registro de notificaciones push enviadas a usuarios';
COMMENT ON COLUMN notificaciones.tipo IS 'Tipo de alerta: 7_dias, 3_dias, 1_dia, dia_evento';
COMMENT ON COLUMN notificaciones.enviada IS 'Si la notificación fue enviada exitosamente';
COMMENT ON COLUMN notificaciones.leida IS 'Si el usuario leyó la notificación';
