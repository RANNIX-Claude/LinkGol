-- reset_database_v2.sql — LinkGol v2.0 (Conversaciones 1:1)
-- Ejecutar esto en Supabase para preparar la base de datos

-- PASO 1: DROP tablas en orden correcto
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS guest_sessions CASCADE;
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

-- PASO 3: CREATE tabla users (hosts que pagan)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  idioma_default VARCHAR(10) DEFAULT 'es' REFERENCES idiomas(codigo),
  plan VARCHAR(20) DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

INSERT INTO users (id, google_id, email, nombre, idioma_default, plan, avatar_url, activo) VALUES
('550e8400-e29b-41d4-a716-446655440001'::UUID, 'google_roberto_1', 'roberto@mexico.mx', 'Roberto', 'es', 'pro_$20', '👨', true),
('550e8400-e29b-41d4-a716-446655440002'::UUID, 'google_anna_1', 'anna@russia.ru', 'Anna', 'ru', 'pro_$20', '👩', true),
('550e8400-e29b-41d4-a716-446655440003'::UUID, 'google_carlos_1', 'carlos@alemania.de', 'Carlos', 'de', 'pro_$20', '👨', true);

-- PASO 4: CREATE tabla contacts (libreta de direcciones del host)
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  contact_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(host_id, contact_email)
);

CREATE INDEX idx_contacts_host_id ON contacts(host_id);

INSERT INTO contacts (id, host_id, contact_name, contact_email, contact_photo, created_at) VALUES
('a10e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Anna Volkov', 'anna@russia.ru', '👩', NOW()),
('a10e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Carlos Mueller', 'carlos@alemania.de', '👨', NOW());

-- PASO 5: CREATE tabla conversations (1:1 entre host y guest)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID,  -- NULL si aún no aceptó
  guest_email VARCHAR(255),  -- Email del invitado
  guest_name VARCHAR(100),
  host_idioma VARCHAR(10) NOT NULL REFERENCES idiomas(codigo),
  guest_idioma VARCHAR(10) REFERENCES idiomas(codigo),  -- Nulo hasta que guest entre
  qr_code TEXT UNIQUE NOT NULL,
  qr_url TEXT NOT NULL,
  link_token VARCHAR(255) UNIQUE NOT NULL,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_conversations_host_id ON conversations(host_id);
CREATE INDEX idx_conversations_guest_id ON conversations(guest_id);
CREATE INDEX idx_conversations_link_token ON conversations(link_token);

INSERT INTO conversations (id, host_id, guest_email, guest_name, host_idioma, qr_code, qr_url, link_token, activa, created_by) VALUES
('660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'anna@russia.ru', 'Anna', 'es', 'QR_CONV_001', 'linkgol.app/conv/660e8400', 'TOKEN_CONV_001', true, '550e8400-e29b-41d4-a716-446655440001'::UUID),
('660e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'carlos@alemania.de', 'Carlos', 'es', 'QR_CONV_002', 'linkgol.app/conv/660e8400-2', 'TOKEN_CONV_002', true, '550e8400-e29b-41d4-a716-446655440001'::UUID),
('660e8400-e29b-41d4-a716-446655440003'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'roberto@mexico.mx', 'Roberto', 'ru', 'QR_CONV_003', 'linkgol.app/conv/660e8400-3', 'TOKEN_CONV_003', true, '550e8400-e29b-41d4-a716-446655440002'::UUID);

-- PASO 6: CREATE tabla guest_sessions (sesión del invitado sin account)
CREATE TABLE guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  guest_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(255),
  idioma VARCHAR(10) NOT NULL REFERENCES idiomas(codigo),
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_sessions_conversation_id ON guest_sessions(conversation_id);
CREATE INDEX idx_guest_sessions_token ON guest_sessions(token);

INSERT INTO guest_sessions (id, conversation_id, guest_name, guest_email, idioma, token, created_at) VALUES
('770e8400-e29b-41d4-a716-446655440001'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, 'Anna', 'anna@russia.ru', 'ru', 'TOKEN_GUEST_ANNA', NOW()),
('770e8400-e29b-41d4-a716-446655440002'::UUID, '660e8400-e29b-41d4-a716-446655440002'::UUID, 'Carlos', 'carlos@alemania.de', 'de', 'TOKEN_GUEST_CARLOS', NOW()),
('770e8400-e29b-41d4-a716-446655440003'::UUID, '660e8400-e29b-41d4-a716-446655440003'::UUID, 'Roberto', 'roberto@mexico.mx', 'es', 'TOKEN_GUEST_ROBERTO', NOW());

-- PASO 7: CREATE tabla messages (solo para una conversación 1:1)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID,  -- Si es el host
  sender_guest_id UUID,  -- Si es el guest
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

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

INSERT INTO messages (id, conversation_id, sender_id, sender_nombre, sender_avatar, texto_original, idioma_original, leido, created_at, created_by) VALUES
('880e8400-e29b-41d4-a716-446655440001'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Roberto', '👨', '¡Hola Anna! ¿Cómo estás?', 'es', true, NOW() - INTERVAL '2 hours', '550e8400-e29b-41d4-a716-446655440001'::UUID),
('880e8400-e29b-41d4-a716-446655440002'::UUID, '660e8400-e29b-41d4-a716-446655440001'::UUID, '550e8400-e29b-41d4-a716-446655440002'::UUID, 'Anna', '👩', 'Привет! Дела хорошо, спасибо!', 'ru', true, NOW() - INTERVAL '2 hours' + INTERVAL '1 minute', '550e8400-e29b-41d4-a716-446655440002'::UUID),
('880e8400-e29b-41d4-a716-446655440003'::UUID, '660e8400-e29b-41d4-a716-446655440002'::UUID, '550e8400-e29b-41d4-a716-446655440001'::UUID, 'Roberto', '👨', '¿Te gustaría tomar un café?', 'es', false, NOW() - INTERVAL '1 hour', '550e8400-e29b-41d4-a716-446655440001'::UUID);

-- PASO 8: CREATE tabla translations
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
('880e8400-e29b-41d4-a716-446655440001'::UUID, 'ru', 'Привет, Анна! Как дела?', 'HASH_001', 25, 0.0001, 'claude-sonnet'),
('880e8400-e29b-41d4-a716-446655440002'::UUID, 'es', '¡Hola! Bien, gracias!', 'HASH_002', 20, 0.0001, 'claude-sonnet'),
('880e8400-e29b-41d4-a716-446655440003'::UUID, 'ru', 'Тебе нравилось бы выпить кофе?', 'HASH_003', 22, 0.0001, 'claude-sonnet');

-- PASO 9: CREATE tabla audit_log
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

-- PASO 10: ENABLE RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- PASO 11: RLS POLICIES
-- Usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios ven su propio perfil" ON users
  FOR SELECT USING (auth.uid() = id);

-- Contactos del host
CREATE POLICY "Host ve sus contactos" ON contacts
  FOR SELECT USING (auth.uid() = host_id);

-- Conversaciones del host
CREATE POLICY "Host ve sus conversaciones" ON conversations
  FOR SELECT USING (auth.uid() = host_id);

-- Mensajes de una conversación son visibles
CREATE POLICY "Mensajes de conversación visibles" ON messages
  FOR SELECT USING (true);

-- Traducciones visibles
CREATE POLICY "Traducciones visibles" ON translations
  FOR SELECT USING (true);

-- PASO 12: DATOS COMPLETOS VERIFICACIÓN
SELECT 'Usuarios' as tabla, COUNT(*) as total FROM users
UNION ALL
SELECT 'Contactos', COUNT(*) FROM contacts
UNION ALL
SELECT 'Conversaciones', COUNT(*) FROM conversations
UNION ALL
SELECT 'Guest Sessions', COUNT(*) FROM guest_sessions
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Translations', COUNT(*) FROM translations;

-- DONE
COMMIT;
