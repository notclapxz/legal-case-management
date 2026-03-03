-- =====================================================
-- MIGRATION: Crear tabla fcm_tokens
-- Fecha: 27 Enero 2026
-- Descripción: Almacenar tokens de Firebase Cloud Messaging
-- =====================================================

-- Tabla para tokens FCM
CREATE TABLE IF NOT EXISTS public.fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_info TEXT, -- User agent del dispositivo
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, token)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_last_used ON fcm_tokens(last_used);

-- RLS (Row Level Security)
ALTER TABLE fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios solo ven y modifican sus propios tokens
DROP POLICY IF EXISTS "Users can manage own tokens" ON fcm_tokens;
CREATE POLICY "Users can manage own tokens"
ON fcm_tokens FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Función para limpiar tokens viejos (no usados en 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_fcm_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM fcm_tokens
  WHERE last_used < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios
COMMENT ON TABLE fcm_tokens IS 'Tokens de Firebase Cloud Messaging para notificaciones push';
COMMENT ON COLUMN fcm_tokens.token IS 'Token FCM del dispositivo';
COMMENT ON COLUMN fcm_tokens.device_info IS 'User agent para identificar dispositivo';
COMMENT ON COLUMN fcm_tokens.last_used IS 'Última vez que se usó el token (para cleanup)';
