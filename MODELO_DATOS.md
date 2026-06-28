# MODELO_DATOS.md — LinkGol v2.0 (Conversaciones 1:1)

## Diagrama de Entidades (Corregido)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  users (hosts que pagan)                                         │
│  ├─ id (UUID)                                                    │
│  ├─ google_id                                                    │
│  ├─ email                                                        │
│  ├─ nombre                                                       │
│  ├─ idioma_default (es, en, ru, etc - FIJO para el host)       │
│  ├─ plan ('free' | 'pro_$20')                                   │
│  ├─ stripe_customer_id                                           │
│  ├─ avatar_url                                                   │
│  └─ created_at, updated_at                                       │
│                                                                  │
├──────────────────────────┬──────────────────────┬────────────────┤
│                          │                      │                │
│  contacts                │  conversations       │  messages      │
│  ├─ id                   │  ├─ id               │  ├─ id         │
│  ├─ host_id (FK)         │  ├─ host_id (FK)     │  ├─ conv_id(FK)│
│  ├─ contact_name         │  ├─ guest_id (FK)    │  ├─ sender_id  │
│  ├─ contact_email        │  ├─ host_idioma      │  ├─ texto_orig │
│  ├─ contact_photo        │  ├─ guest_idioma     │  ├─ idioma_orig│
│  ├─ phone (optional)     │  ├─ qr_code (único)  │  ├─ created_at │
│  └─ created_at           │  ├─ qr_url           │  └─ read       │
│                          │  └─ created_at       │                │
└──────────────────────────┴──────────────────────┴────────────────┘
                           │
                           │ genera
                           ↓
                    ┌─────────────────┐
                    │  translations   │
                    │  ├─ id          │
                    │  ├─ msg_id (FK) │
                    │  ├─ idioma_dest │
                    │  ├─ texto_trad  │
                    │  ├─ hash_cache  │
                    │  └─ costo_usd   │
                    └─────────────────┘
```

**Cambio Principal:** De `rooms` (salas múltiples) → `conversations` (1:1 por contacto)

## Tablas SQL (3FN)

### users — Hosts con Google OAuth

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  idioma_preferido VARCHAR(10) DEFAULT 'es',
  plan VARCHAR(20) DEFAULT 'free',
  stripe_customer_id VARCHAR(255),
  avatar_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);
```

### rooms — Salas con QR

```sql
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  qr_code TEXT UNIQUE NOT NULL,
  qr_url TEXT NOT NULL,
  idioma_host VARCHAR(10) NOT NULL,
  activa BOOLEAN DEFAULT true,
  max_guests INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

CREATE INDEX idx_rooms_host_id ON rooms(host_id);
CREATE INDEX idx_rooms_activa ON rooms(activa);
```

### guest_sessions — Sesiones de invitados (sin registro)

```sql
CREATE TABLE guest_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  idioma VARCHAR(10) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_guest_sessions_room_id ON guest_sessions(room_id);
CREATE INDEX idx_guest_sessions_token ON guest_sessions(token);
```

### messages — Mensajes traducidos

```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID,
  sender_guest_id UUID,
  sender_nombre VARCHAR(100) NOT NULL,
  sender_avatar VARCHAR(10),
  texto_original TEXT NOT NULL,
  idioma_original VARCHAR(10) NOT NULL,
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
```

### translations — Cache de traducciones

```sql
CREATE TABLE translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  idioma_destino VARCHAR(10) NOT NULL,
  texto_traducido TEXT NOT NULL,
  hash_cache VARCHAR(64) UNIQUE,
  tokens_usados INTEGER,
  costo_usd NUMERIC(10, 4),
  modelo_ia VARCHAR(50) DEFAULT 'claude-sonnet',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_translations_message_id ON translations(message_id);
CREATE INDEX idx_translations_hash_cache ON translations(hash_cache);
```

### audit_log — Auditoría de eventos

```sql
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
```

## Catálogos (Dimensiones)

### idiomas — Lenguajes soportados

```sql
CREATE TABLE idiomas (
  codigo VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  bandera VARCHAR(10),
  orden INTEGER
);

INSERT INTO idiomas VALUES
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
```

---

## Flujo de Datos (v2.0 — Conversaciones 1:1)

### 1. Host se registra y configura idioma

```
User (Google OAuth)
  ↓ (paga $20/mes)
Elige idioma: ES (fijo para el host)
  ↓
users.idioma_default = 'es'
  ↓
Dashboard con Contactos (vacío)
```

### 2. Host invita a contacto (genera conversación 1:1)

```
Host invita: "anna@russia.ru" (en español)
  ↓
conversations (host_id, guest_id, host_idioma='es', qr_code, qr_url)
  ↓
contacts (host_id, contact_name='Anna', contact_email='anna@russia.ru')
  ↓
Genera QR único: linkgol.app/conv/conv-id-abc123
Genera Link único: linkgol.app/i/conv-id-abc123
  ↓
Envía invitación a anna@russia.ru
```

### 3. Guest abre link/QR

```
Anna abre: linkgol.app/i/conv-id-abc123
  ↓
Elige idioma: RU (por primera vez)
  ↓
guest_sessions (token en localStorage, idioma='ru')
  ↓
Ve conversación 1:1 con Host (Roberto)
Host ve en: Español
Anna ve en: Ruso
```

### 4. Mensaje traducido (1:1)

```
Roberto escribe: "¡Hola Anna!"
  ↓ (idioma: es, en conversations.host_idioma)
messages (conversation_id, sender_id, texto='¡Hola Anna!', idioma_original='es')
  ↓
Claude API: traduce 'es' → 'ru'
  ↓
translations (message_id, idioma_destino='ru', texto_traducido='Привет, Анна!')
  ↓
Anna ve: "Привет, Анна!" (en ruso)
Roberto ve: "¡Hola Anna!" (en español)
```

### 5. Si Host invita a otra persona

```
Host invita: "carlos@alemania.de" (TAMBIÉN en español, porque elige idioma AL INVITAR)
  ↓
conversations (host_id, guest_id='carlos', host_idioma='es', qr_code diferente)
  ↓
contacts (agrega otro contacto)
  ↓
Roberto ahora tiene 2 conversaciones 1:1:
  - Conversación 1: con Anna (es ↔ ru)
  - Conversación 2: con Carlos (es ↔ de)
```

---

## Relaciones y Restricciones

- **users** ←→ **rooms** (1:N) — Un host puede crear múltiples salas
- **rooms** ←→ **guest_sessions** (1:N) — Una sala tiene múltiples guests
- **rooms** ←→ **messages** (1:N) — Una sala tiene múltiples mensajes
- **messages** ←→ **translations** (1:N) — Un mensaje puede tener múltiples traducciones (una por idioma)
- **audit_log** logs todos los cambios para compliance

---

## KPIs del Negocio

**Métricas a medir:**
- `usuarios_activos_mes` = COUNT(DISTINCT sender_id) WHERE MONTH = CURRENT_MONTH
- `mensajes_traducidos_mes` = COUNT(*) FROM messages WHERE MONTH = CURRENT_MONTH
- `costo_total_traducciones` = SUM(costo_usd) FROM translations WHERE MONTH = CURRENT_MONTH
- `ingresos_mes` = COUNT(DISTINCT host_id) * 20 USD (si pagados)
- `margen_bruto` = ingresos - costo_traducciones

---

**Archivo actualizado:** 2026-06-27
**Estado:** Listo para FASE 2 (módulos operativos)
