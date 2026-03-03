# 📁 SCRIPT DE MIGRACIÓN - EJECUTAR UNA SOLA VEZ EN SUPABASE

-- Este archivo contiene todas las migraciones necesarias para la web app
-- Ejecutar en Supabase → SQL Editor → Run

-- ===================================
-- 1. FUNCIONES PRINCIPALES
-- ===================================

-- Función para obtener dashboard completo en una sola consulta
CREATE OR REPLACE FUNCTION obtener_dashboard_completo(
    usuario_id UUID
)
RETURNS TABLE (
    profile JSONB,
    stats JSONB,
    alertasCriticas JSONB[]
) AS $$
DECLARE
    perfil_data JSONB;
    stats_data JSONB;
    alertas_data JSONB[];
BEGIN
    SELECT to_jsonb(p) INTO perfil_data FROM profiles p WHERE p.id = usuario_id;
    SELECT to_jsonb(ds) INTO stats_data FROM dashboard_stats ds LIMIT 1;
    SELECT array_agg(to_jsonb(e.*)) INTO alertas_data 
    FROM eventos_proximos e WHERE e.dias_restantes <= 3 
    ORDER BY e.dias_restantes ASC LIMIT 5;
    RETURN QUERY SELECT 
        perfil_data as profile,
        stats_data as stats,
        COALESCE(alertas_data, ARRAY[]::JSONB[]) as alertasCriticas;
END;
$$ LANGUAGE plpgsql;

-- Función para tendencia financiera
CREATE OR REPLACE FUNCTION obtener_tendencia_financiera(
    meses INTEGER DEFAULT 6,
    periodo TEXT DEFAULT 'mes'
)
RETURNS TABLE (
    mes TEXT,
    cobrado DECIMAL,
    proyectado DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH serie_meses AS (
        SELECT DATE_TRUNC('month', CURRENT_DATE - (n || ' months')::INTERVAL)::DATE as mes_fecha
        FROM generate_series(0, meses - 1) n ORDER BY mes_fecha DESC
    ),
    cobros_mensuales AS (
        SELECT DATE_TRUNC('month', fecha_pago)::DATE as mes, COALESCE(SUM(monto), 0) as cobrado
        FROM pagos WHERE fecha_pago >= DATE_TRUNC('month', CURRENT_DATE - (meses || ' months')::INTERVAL)
        GROUP BY DATE_TRUNC('month', fecha_pago)::DATE
    )
    SELECT TO_CHAR(sm.mes_fecha, 'Mon YYYY') as mes,
           COALESCE(cm.cobrado, 0)::DECIMAL as cobrado,
           COALESCE(SUM((c.monto_total - c.monto_cobrado) * 0.3 / 6), 0)::DECIMAL as proyectado
    FROM serie_meses sm
    LEFT JOIN cobros_mensuales cm ON sm.mes_fecha = cm.mes
    LEFT JOIN casos c ON c.estado = 'Activo' AND c.monto_cobrado < c.monto_total
    GROUP BY sm.mes_fecha, cm.cobrado ORDER BY sm.mes_fecha DESC;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- 2. ÍNDICES DE PERFORMANCE
-- ===================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Columna generada para monto pendiente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'casos' AND column_name = 'monto_pendiente') THEN
        ALTER TABLE casos ADD COLUMN monto_pendiente DECIMAL(10,2) GENERATED ALWAYS AS (monto_total - monto_cobrado) STORED;
        CREATE INDEX idx_casos_monto_pendiente ON casos(monto_pendiente DESC);
    END IF;
END $$;

-- Índices principales
CREATE INDEX IF NOT EXISTS idx_casos_busqueda ON casos USING GIN (codigo_estimado gin_trgm_ops, cliente gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha ON eventos(fecha_evento DESC, completado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON pagos(fecha_pago DESC, monto DESC);

-- ===================================
-- 3. VISTAS ÚTILES
-- ===================================

CREATE OR REPLACE VIEW eventos_con_alertas AS
SELECT e.*, c.codigo_estimado, c.cliente,
       EXTRACT(DAY FROM (e.fecha_evento - NOW())) AS dias_restantes,
       CASE WHEN EXTRACT(DAY FROM (e.fecha_evento - NOW())) <= 0 THEN 'crítico'
            WHEN EXTRACT(DAY FROM (e.fecha_evento - NOW())) <= 3 THEN 'urgente'
            ELSE 'moderado' END AS nivel_alerta
FROM eventos e
JOIN casos c ON e.caso_id = c.id
WHERE e.completado = FALSE AND e.fecha_evento >= NOW() - INTERVAL '1 day'
ORDER BY EXTRACT(DAY FROM (e.fecha_evento - NOW())) ASC, e.fecha_evento ASC;

CREATE OR REPLACE VIEW metricas_financieras AS
SELECT (SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)) as cobrado_mes_actual,
       (SELECT COALESCE(SUM(monto_total - monto_cobrado), 0) FROM casos WHERE estado = 'Activo' AND monto_cobrado < monto_total) as total_pendiente,
       (SELECT COUNT(*) FROM casos WHERE estado = 'Activo') as casos_activos,
       (SELECT COUNT(*) FROM eventos WHERE completado = FALSE AND fecha_evento BETWEEN NOW() AND NOW() + INTERVAL '7 days') as eventos_proximos;

-- ===================================
-- 4. TRIGGERS
-- ===================================

CREATE OR REPLACE FUNCTION actualizar_timestamp() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_caso ON casos;
CREATE TRIGGER trigger_actualizar_timestamp_caso BEFORE UPDATE ON casos FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();