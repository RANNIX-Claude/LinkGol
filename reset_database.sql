-- reset_database.sql — LinkGol Complete Schema
-- Ejecutar esto en Supabase para preparar la base de datos

-- PASO 1: DROP tablas en orden correcto
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS guest_sessions CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS idiomas CASCADE;

-- PASO 2: CREATE tabla idiomas (catálogo)
CREATE TABLE idiomas (
  codigo VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  bandera VARCHAR(10),
  orden INTEGER
);

INSERT INTO idiomas (codigo, nombre, bandera, orden) VALUES
('es', 'Español', '🇪🇸', 1),
('en', 'English', '🇬🇧', 2),
('ru', 'Русский', '🇷🇺', 3),
('de', 'Deutsch', '🇩🇪', 4),
('fr', 'Français', '🇫🇷', 5),
('pt', 'Português', '🇧🇷', 6),
('zh', '中文', '🇨🇳', 7),
('ja', '日本語', '🇯🇵', 8),
('ar', 'العربية', '🇸🇦', 9),
('it', 'Italiano', '🇮🇹', 10);

-- PASO 3: CREATE tabla users (hosts)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  idioma_preferido VARCHAR(10) DEFAULT 'es' REFERENCES idiomas(codigo),
  plan VARCHAR(20) DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

INSERT INTO users (id, google_id, email, nombre, idioma_preferido, plan, avatar_url, activo) VALUES
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'google_roberto_1', 'roberto@mexico.mx', 'Roberto', 'es', 'pro_$20', '👨', true),
('550e8400-e29b-41d4-a716-446655440002'::UUID, 'google_anna_1', 'anna@russia.ru', 'Anna', 'ru', 'pro_$20', '👩', true),
('550e8400-e29b-41d4-a716-446655440003'::UUID, 'google_carlos_1', 'carlos@alemania.de', 'Carlos', 'de', 'pro_$20', '👨', true);

-- PASO 4: CREATE tabla rooms
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  qr_url TEXT NOT NULL,
  idioma_host VARCHAR(10) NOT NULL REFERENCES idiomas(codigo),
  activa BOOLEAN DEFAULT true,
  max_guests INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_rooms_host_id ON rooms(host_id);
CREATE INDEX idx_rooms_activa ON rooms(activa);

INSERT INTO rooms (id, host_id, nombre, qr_code, qr_url, idioma_host, activa, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Sala Roberto', 'QR_ROBERTO_001', 'linkgol.app/u/roberto/sala-001', 'es', true, '550e8400-e29b-41d4-a716-446655440001'::UUID),
('660e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'Sala Anna', 'QR_ANNA_001', 'linkgol.app/u/anna/sala-001', 'ru', true, '550e8400-e29b-41d4-a716-446655440002'::UUID),
('660e8400-e29b-41d4-a716-446655440003'::UUID, '550e8400-e29b-41d4-a716-446655440003'::UUID, 'Sala Carlos', 'QR_CARLOS_001', 'linkgol.app/u/carlos/sala-001', 'de', true, '550e8400-e29b-41d4-a716-446655440003'::UUID);

-- PASO 5: CREATE tabla guest_sessions
CREATE TABLE guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  idioma VARCHAR(10) NOT NULL REFERENCES idiomas(codigo),
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_sessions_room_id ON guest_sessions(room_id);
CREATE INDEX idx_guest_sessions_token ON guest_sessions(token);

INSERT INTO guest_sessions (id, room_id, nombre, idioma, token, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440001'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, 'Guest_Anna', 'ru', 'TOKEN_ANNA_001', NOW()),
('770e8400-e29b-41d4-a716-446655440002'::UUID, '660e8400-e29b-41d4-a716-446655440002'::UUID, 'Guest_Roberto', 'es', 'TOKEN_ROBERTO_001', NOW()),
('770e8400-e29b-41d4-a716-446655440003'::UUID, '660e8400-e29b-41d4-a716-446655440003'::UUID, 'Guest_Maria', 'ja', 'TOKEN_MARIA_001', NOW());

-- PASO 6: CREATE tabla messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_guest_id UUID,
  sender_nombre VARCHAR(100) NOT NULL,
  sender_avatar VARCHAR(10),
  texto_original TEXT NOT NULL,
  idioma_original VARCHAR(10) NOT NULL REFERENCES idiomas(codigo),
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  CONSTRAINT sender_check CHECK (
    (sender_id IS NOT NULL) OR (sender_guest_id IS NOT NULL)
  )
);

CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

INSERT INTO messages (id, room_id, sender_id, sender_nombre, sender_avatar, texto_original, idioma_original, leido, created_at, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440001'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Roberto', '👨', '¡Hola! Soy Roberto de México.', 'es', true, NOW() - INTERVAL '3 hours', '550e8400-e29b-41d4-a716-446655440001'::UUID),
('880e8400-e29b-41d4-a716-446655440002'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'Anna', '👩', 'Hi! I''m Anna from Russia. Nice to meet you!', 'en', true, NOW() - INTERVAL '3 hours' + INTERVAL '1 minute', '550e8400-e29b-41d4-a716-446655440002'::UUID),
('880e8400-e29b-41d4-a716-446655440003'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Roberto', '👨', '¡Gracias! Encantado de conocerte. ¿Cómo estás?', 'es', false, NOW() - INTERVAL '3 hours' + INTERVAL '2 minutes', '550e8400-e29b-41d4-a716-446655440001'::UUID);

-- PASO 7: CREATE tabla translations
CREATE TABLE translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  idioma_destino VARCHAR(10) NOT NULL REFERENCES idiomas(codigo),
  texto_traducido TEXT NOT NULL,
  hash_cache VARCHAR(64) UNIQUE,
  tokens_usados INTEGER,
  costo_usd NUMERIC(10, 4),
  modelo_ia VARCHAR(50) DEFAULT 'claude-sonnet',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_translations_message_id ON translations(message_id);
CREATE INDEX idx_translations_hash_cache ON translations(hash_cache);

INSERT INTO translations (message_id, idioma_destino, texto_traducido, hash_cache, tokens_usados, costo_usd, modelo_ia) VALUES
('880e8400-e29b-41d4-a716-446655440001'::UUID, 'ru', 'Привет! Я Роберто из Мексики.', 'HASH_001', 25, 0.0001, 'claude-sonnet'),
('880e8400-e29b-41d4-a716-446655440002'::UUID, 'es', 'Hola! Soy Anna de Rusia. ¡Es un placer conocerte!', 'HASH_002', 30, 0.0001, 'claude-sonnet'),
('880e8400-e29b-41d4-a716-446655440003'::UUID, 'ru', 'Спасибо! Приятно познакомиться. Как дела?', 'HASH_003', 20, 0.0001, 'claude-sonnet');

-- PASO 8: CREATE tabla audit_log
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tabla VARCHAR(100),
  accion VARCHAR(50),
  registro_id UUID,
  usuario_id UUID REFERENCES users(id),
  datos_previos JSONB,
  datos_nuevos JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_usuario_id ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- PASO 9: ENABLE RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- PASO 10: RLS POLICIES
-- Usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios ven su propio perfil" ON users
  FOR SELECT USING (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios actualizan su propio perfil" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Mensajes son visibles en salas públicas
CREATE POLICY "Mensajes visibles en salas" ON messages
  FOR SELECT USING (true);

-- Guests pueden ver su sesión
CREATE POLICY "Guests ven su sesión" ON guest_sessions
  FOR SELECT USING (true);

-- Salas visibles públicamente
CREATE POLICY "Salas visibles públicamente" ON rooms
  FOR SELECT USING (true);

-- Traduciones visibles públicamente
CREATE POLICY "Traducciones visibles públicamente" ON translations
  FOR SELECT USING (true);

-- PASO 11: DATOS COMPLETOS VERIFICACIÓN
SELECT 'Usuarios' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Guest Sessions', COUNT(*) FROM guest_sessions
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Translations', COUNT(*) FROM translations;

-- DONE
COMMIT;
