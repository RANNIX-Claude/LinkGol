# MODELO_DATOS.md — LinkGol v1.0

## Diagrama de Entidades

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  users (hosts)                                              │
│  ├─ id (UUID)                                               │
│  ├─ google_id                                               │
│  ├─ email                                                   │
│  ├─ nombre                                                  │
│  ├─ idioma_preferido                                        │
│  ├─ plan ('free' | 'pro_$20')                              │
│  ├─ stripe_customer_id                                      │
│  ├─ avatar_url                                              │
│  └─ created_at, updated_at                                  │
│                                                             │
├──────────────────┬─────────────────────┬───────────────────┤
│                  │                     │                   │
│  rooms           │   messages          │  translations     │
│  ├─ id           │   ├─ id             │  ├─ id            │
│  ├─ host_id (FK) │   ├─ room_id (FK)   │  ├─ msg_id (FK)   │
│  ├─ nombre       │   ├─ sender_id (FK) │  ├─ idioma         │
│  ├─ qr_code      │   ├─ texto_orig     │  ├─ texto_trad     │
│  ├─ qr_url       │   ├─ idioma_orig    │  └─ hash_cache     │
│  ├─ creada_por   │   ├─ created_at     │                    │
│  └─ created_at   │   └─ updated_at     │                    │
│                  │                     │                    │
└──────────────────┴─────────────────────┴───────────────────┘
         │
         │ puede tener
         ↓
   ┌──────────────────┐
   │  guest_sessions  │
   │  ├─ id           │
   │  ├─ room_id (FK) │
   │  ├─ nombre       │
   │  ├─ idioma       │
   │  ├─ token        │
   │  └─ created_at   │
   └──────────────────┘
```

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

## Flujo de Datos

### 1. Host crea sala

```
User (Google OAuth)
  ↓ (paga $20/mes)
Room (con QR único)
  ↓ (genera linkgol.app/u/@usuario/sala-id)
QR compartible
  ↓
Guests escanean
```

### 2. Guest entra a sala

```
QR/Link
  ↓
guest_sessions (token en localStorage)
  ↓ (sin registro)
Chat en su idioma
```

### 3. Mensaje traducido

```
Guest A escribe: "Hola, ¿qué tal?"
  ↓ (idioma: es)
messages (guarda original)
  ↓
Claude API (traduce)
  ↓
translations (cache el resultado)
  ↓
Guest B ve: "Привет, как дела?" (en su idioma)
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
