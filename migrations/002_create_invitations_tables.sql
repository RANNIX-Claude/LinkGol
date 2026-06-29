-- LinkN.click Invitations Schema
-- Ejecutar en Supabase para crear las tablas de invitaciones
-- Fecha: 2026-06-28

-- ============================================================================
-- TABLA: invitaciones
-- Descripción: Registro de invitaciones enviadas por remitentes a receptores
-- ============================================================================

CREATE TABLE IF NOT EXISTS invitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,

  -- Remitente (quien invita)
  remitente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  remitente_nombre VARCHAR(255),

  -- Receptor (quien recibe la invitación)
  receptor_nombre VARCHAR(255),
  receptor_email VARCHAR(255),
  receptor_idioma VARCHAR(10),

  -- Contenido
  primer_mensaje TEXT NOT NULL,

  -- Token y estado
  token_aceptacion VARCHAR(255) UNIQUE NOT NULL,
  aceptada BOOLEAN DEFAULT FALSE,
  aceptada_en TIMESTAMP WITH TIME ZONE,

  -- Distribución
  canal_compartida VARCHAR(20) DEFAULT 'DIRECT_LINK',
  -- Opciones: WHATSAPP, FACEBOOK, EMAIL, QR, DIRECT_LINK

  -- Auditoría
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expira_en TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),

  -- Índices
  CONSTRAINT token_length CHECK (LENGTH(token_aceptacion) > 0),
  CONSTRAINT primer_mensaje_not_empty CHECK (LENGTH(primer_mensaje) > 0)
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_invitaciones_link ON invitaciones(link_id);
CREATE INDEX idx_invitaciones_remitente ON invitaciones(remitente_id);
CREATE INDEX idx_invitaciones_token ON invitaciones(token_aceptacion);
CREATE INDEX idx_invitaciones_aceptada ON invitaciones(aceptada);
CREATE INDEX idx_invitaciones_created_at ON invitaciones(created_at DESC);
CREATE INDEX idx_invitaciones_expira_en ON invitaciones(expira_en);

-- RLS: Row Level Security
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

-- Remitente puede ver sus propias invitaciones
CREATE POLICY "remitente_can_view_own_invitations"
  ON invitaciones FOR SELECT
  USING (remitente_id = auth.uid());

-- Remitente puede crear invitaciones
CREATE POLICY "remitente_can_create_invitations"
  ON invitaciones FOR INSERT
  WITH CHECK (remitente_id = auth.uid());

-- Remitente puede actualizar sus invitaciones
CREATE POLICY "remitente_can_update_own_invitations"
  ON invitaciones FOR UPDATE
  USING (remitente_id = auth.uid())
  WITH CHECK (remitente_id = auth.uid());

-- Permitir lectura pública de invitaciones por token (para aceptar)
CREATE POLICY "public_can_view_by_token"
  ON invitaciones FOR SELECT
  USING (true); -- Se validará en backend por token


-- ============================================================================
-- TABLA: acceptances
-- Descripción: Auditoría de aceptaciones de invitaciones
-- ============================================================================

CREATE TABLE IF NOT EXISTS acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitacion_id UUID NOT NULL REFERENCES invitaciones(id) ON DELETE CASCADE,

  -- Usuario que aceptó
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  nip_4_digitos VARCHAR(4),

  -- Información técnica (auditoría)
  ip_origen VARCHAR(45),
  user_agent TEXT,

  -- Timestamp
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Índices
  CONSTRAINT nip_format CHECK (nip_4_digitos ~ '^\d{4}$')
);

-- Índices
CREATE INDEX idx_acceptances_invitacion ON acceptances(invitacion_id);
CREATE INDEX idx_acceptances_usuario ON acceptances(usuario_id);
CREATE INDEX idx_acceptances_accepted_at ON acceptances(accepted_at DESC);

-- RLS
ALTER TABLE acceptances ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias aceptaciones
CREATE POLICY "usuario_can_view_own_acceptances"
  ON acceptances FOR SELECT
  USING (usuario_id = auth.uid());

-- Los remitentes pueden ver aceptaciones de sus invitaciones
CREATE POLICY "remitente_can_view_acceptances"
  ON acceptances FOR SELECT
  USING (
    invitacion_id IN (
      SELECT id FROM invitaciones WHERE remitente_id = auth.uid()
    )
  );


-- ============================================================================
-- ALTERACIONES A TABLA: links
-- Descripción: Agregar campos de analytics para invitaciones
-- ============================================================================

ALTER TABLE links ADD COLUMN IF NOT EXISTS (
  total_invitaciones_enviadas INT DEFAULT 0,
  total_invitaciones_aceptadas INT DEFAULT 0,
  tasa_aceptacion FLOAT DEFAULT 0,
  fecha_ultima_invitacion TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- ALTERACIONES A TABLA: mensajes
-- Descripción: Agregar campos para primer mensaje automático
-- ============================================================================

ALTER TABLE mensajes ADD COLUMN IF NOT EXISTS (
  es_primer_mensaje_automatico BOOLEAN DEFAULT FALSE,
  invitacion_id UUID REFERENCES invitaciones(id) ON DELETE SET NULL
);

CREATE INDEX idx_mensajes_invitacion ON mensajes(invitacion_id);

-- ============================================================================
-- FUNCIÓN: actualizar_updated_at
-- Descripción: Trigger para mantener updated_at sincronizado
-- ============================================================================

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger en tabla invitaciones
DROP TRIGGER IF EXISTS trigger_invitaciones_updated_at ON invitaciones;
CREATE TRIGGER trigger_invitaciones_updated_at
  BEFORE UPDATE ON invitaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_updated_at();


-- ============================================================================
-- FUNCIÓN: calcular_tasa_aceptacion
-- Descripción: Calcula tasa de aceptación de invitaciones
-- ============================================================================

CREATE OR REPLACE FUNCTION calcular_tasa_aceptacion(link_id_param UUID)
RETURNS TABLE(total_enviadas INT, total_aceptadas INT, tasa FLOAT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INT as total_enviadas,
    COUNT(CASE WHEN aceptada THEN 1 END)::INT as total_aceptadas,
    CASE
      WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN aceptada THEN 1 END)::FLOAT / COUNT(*))
      ELSE 0
    END as tasa
  FROM invitaciones
  WHERE link_id = link_id_param;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FUNCIÓN: limpiar_invitaciones_expiradas
-- Descripción: Elimina invitaciones expiradas (scheduled job)
-- Se ejecuta diariamente para limpiar invitaciones mayores a 30 días
-- ============================================================================

CREATE OR REPLACE FUNCTION limpiar_invitaciones_expiradas()
RETURNS TABLE(eliminadas INT) AS $$
DECLARE
  count_eliminadas INT;
BEGIN
  DELETE FROM invitaciones
  WHERE expira_en < NOW() AND aceptada = FALSE;

  GET DIAGNOSTICS count_eliminadas = ROW_COUNT;

  RETURN QUERY SELECT count_eliminadas;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- VISTAS ANALÍTICAS
-- ============================================================================

-- Vista: Analytics por canal
CREATE OR REPLACE VIEW analytics_invitaciones_por_canal AS
SELECT
  canal_compartida,
  COUNT(*) as total_enviadas,
  COUNT(CASE WHEN aceptada THEN 1 END) as total_aceptadas,
  ROUND(100.0 * COUNT(CASE WHEN aceptada THEN 1 END) / NULLIF(COUNT(*), 0), 2) as tasa_aceptacion_pct,
  AVG(EXTRACT(EPOCH FROM (aceptada_en - created_at)))::INT as tiempo_promedio_aceptacion_seg
FROM invitaciones
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY canal_compartida
ORDER BY total_enviadas DESC;

-- Vista: Top remitentes
CREATE OR REPLACE VIEW top_remitentes AS
SELECT
  remitente_id,
  remitente_nombre,
  COUNT(*) as total_invitaciones,
  COUNT(CASE WHEN aceptada THEN 1 END) as total_aceptadas,
  ROUND(100.0 * COUNT(CASE WHEN aceptada THEN 1 END) / NULLIF(COUNT(*), 0), 2) as tasa_aceptacion_pct
FROM invitaciones
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY remitente_id, remitente_nombre
ORDER BY total_invitaciones DESC
LIMIT 50;


-- ============================================================================
-- DATOS DE PRUEBA (opcional)
-- Descomentar para testing
-- ============================================================================

/*
-- Crear usuario de prueba si no existe
INSERT INTO usuarios (nombre, apellido, email, tipo_usuario)
VALUES ('Roberto', 'Aguilar', 'roberto@example.com', 'registered')
ON CONFLICT DO NOTHING;

-- Crear invitación de prueba
INSERT INTO invitaciones (remitente_id, remitente_nombre, receptor_nombre, primer_mensaje, token_aceptacion)
SELECT
  id,
  'Roberto Aguilar',
  'Juan Pérez',
  'Hola, tengo un auto que te va a encantar',
  'test-token-' || gen_random_uuid()::TEXT
FROM usuarios
WHERE email = 'roberto@example.com'
LIMIT 1
ON CONFLICT DO NOTHING;
*/

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Contar tablas creadas
SELECT
  'invitaciones' as tabla,
  COUNT(*) as registros
FROM invitaciones
UNION ALL
SELECT
  'acceptances' as tabla,
  COUNT(*) as registros
FROM acceptances;

-- Mostrar índices
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('invitaciones', 'acceptances')
ORDER BY tablename, indexname;
