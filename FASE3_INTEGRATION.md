# FASE 3 — Integration Guide

## Cómo Funciona Todo Junto

### 1. Usuario Host crea una sala

```javascript
// Frontend
POST /api/v1/rooms
{
  "host_id": "550e8400-e29b-41d4-a716-446655440001",
  "nombre": "Sala Negocios",
  "idioma_host": "es"
}

// Response
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "qr_code": "QR_1719576000_abc123def",
  "qr_url": "linkgol.app/u/@550e8400/sala-660e8400"
}

// ↓ AUTOMATION TRIGGER
// → Generar QR imagen (Documents module)
// → Enviar email de confirmación (Notifications module)
```

### 2. Guest escanea QR y entra

```javascript
// Guest app detecta QR → llama a
POST /api/v1/guests/join
{
  "room_id": "660e8400-e29b-41d4-a716-446655440001",
  "nombre": "Anna",
  "idioma": "ru"
}

// ↓ AUTOMATION TRIGGER: onGuestJoin
// 1. Notificar al host: "Anna (Русский) se unió"
// 2. Log en audit_log
// 3. Enviar email al host (Notifications.sendEmail)
```

### 3. Guest A envía mensaje en ruso

```javascript
// Frontend
POST /api/v1/messages
{
  "room_id": "660e8400-e29b-41d4-a716-446655440001",
  "sender_id": null,
  "sender_guest_id": "770e8400-e29b-41d4-a716-446655440001",
  "sender_nombre": "Anna",
  "texto_original": "Привет! Это работает?",
  "idioma_original": "ru"
}

// ↓ AUTOMATION TRIGGER: onMessageCreated
// 1. Obtener idiomas en sala: [ru, es]
// 2. Para idioma_destino = "es":
//    a. Buscar cache con hash(текст + ru + es)
//    b. Si no hay cache:
//       → Llamar Claude API (AI Agent)
//       → Guardar resultado en translations table
//       → Guardar costo en KPI
// 3. Broadcast via WebSocket: "translations:ready"
// 4. Cliente actualiza UI con traducción

// Cliente A (Anna, Ruso) ve:
{
  "text": "Привет! Это работает?",
  "translated": false,
  "timestamp": "14:32"
}

// Cliente B (Roberto, Español) ve:
{
  "text": "¡Hola! ¿Esto funciona?",
  "translated": true,
  "originalLanguage": "Ruso",
  "originalText": "Привет! Это работает?",
  "timestamp": "14:32"
}
```

### 4. Host cierra sala

```javascript
// Frontend
PUT /api/v1/rooms/{room_id}
{ "activa": false }

// ↓ AUTOMATION TRIGGER: onRoomClose
// 1. Obtener todos los mensajes
// 2. Generar resumen con Claude (AI Agent: summarizeConversation)
// 3. Calcular métricas:
//    - Duración: 120 minutos
//    - Participantes: 3
//    - Mensajes: 42
//    - Costo de traducciones: $0.15
//    - Idiomas: [es, ru, en]
// 4. Enviar email al host con resumen
// 5. Log en audit_log
// 6. Si existe webhook externo → Trigger webhook event
```

---

## Flujo Completo: A → B → C

```
┌─────────────────────────────────────────────────────────┐
│ Host crea sala (CRUD)                                   │
│ ↓                                                       │
│ POST /api/v1/rooms                                      │
│ ↓                                                       │
│ [onMessageCreated trigger]                              │
│ → generateQR (Documents)                                │
│ → sendEmail (Notifications)                             │
│ ↓                                                       │
│ Guest escanea QR                                        │
│ ↓                                                       │
│ POST /api/v1/guests/join                                │
│ ↓                                                       │
│ [onGuestJoin trigger]                                   │
│ → sendEmail: "Guest X joined" (Notifications)           │
│ → log audit_log (Automation)                            │
│ ↓                                                       │
│ Guest A envía mensaje                                   │
│ ↓                                                       │
│ POST /api/v1/messages                                   │
│ ↓                                                       │
│ [onMessageCreated trigger]                              │
│ → translateWithClaude (AI Agent)                        │
│ → saveTranslation (CRUD)                                │
│ → broadcastViaWebSocket (Realtime)                      │
│ ↓                                                       │
│ Guest B recibe traducción instant <300ms               │
│ ↓                                                       │
│ Host cierra sala                                        │
│ ↓                                                       │
│ [onRoomClose trigger]                                   │
│ → summarizeRoom (AI Agent)                              │
│ → sendSummaryEmail (Notifications)                      │
│ → logAudit (Automation)                                 │
│ ↓                                                       │
│ Host recibe email con resumen + métricas                │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables (Netlify)

```bash
# Supabase
SUPABASE_URL=https://xeypxgwbhpvxifiwmztk.supabase.co
SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Email (Resend)
RESEND_API_KEY=re_...

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# URLs
NETLIFY_FUNCTIONS_URL=https://linkgol.netlify.app/.netlify/functions
```

---

## Testing los Módulos

### Test CRUD

```bash
# Crear usuario
curl -X POST https://linkgol.netlify.app/.netlify/functions/core-crud \
  -H "Content-Type: application/json" \
  -d '{
    "google_id": "test_google_1",
    "nombre": "Test User",
    "email": "test@example.com"
  }'

# Crear sala
curl -X POST https://linkgol.netlify.app/.netlify/functions/core-crud \
  -H "Content-Type: application/json" \
  -d '{
    "host_id": "550e8400-e29b-41d4-a716-446655440001",
    "nombre": "Test Room",
    "idioma_host": "es"
  }'
```

### Test Documents

```bash
# Generar QR
curl -X POST https://linkgol.netlify.app/.netlify/functions/documents \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "660e8400-e29b-41d4-a716-446655440001",
    "size": 300,
    "format": "png"
  }'
```

### Test Notifications

```bash
# Enviar email de prueba
curl -X POST https://linkgol.netlify.app/.netlify/functions/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "template": "room_invitation",
    "variables": {
      "host_name": "Roberto",
      "room_name": "Sala Test",
      "room_url": "linkgol.app/room/test-123"
    }
  }'
```

### Test AI Agents

```bash
# Detectar idioma
curl -X POST https://linkgol.netlify.app/.netlify/functions/ai-agents \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Привет, как дела?"
  }'

# Resumir conversación
curl -X POST https://linkgol.netlify.app/.netlify/functions/ai-agents \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "660e8400-e29b-41d4-a716-446655440001",
    "language": "es",
    "style": "bullet_points"
  }'
```

---

## Métricas de Negocio (KPIs)

Se rastrean automáticamente en `audit_log` y `translations`:

```sql
-- Usuarios activos este mes
SELECT COUNT(DISTINCT host_id) FROM rooms
WHERE YEAR(created_at) = 2026 AND MONTH(created_at) = 6;

-- Mensajes traducidos
SELECT COUNT(*) FROM translations
WHERE YEAR(created_at) = 2026 AND MONTH(created_at) = 6;

-- Costo de traducciones
SELECT SUM(costo_usd) as total_cost FROM translations
WHERE YEAR(created_at) = 2026 AND MONTH(created_at) = 6;

-- Ingresos
SELECT COUNT(DISTINCT host_id) * 20 as monthly_revenue FROM users
WHERE plan = 'pro_$20';

-- Margen
SELECT 
  (SELECT COUNT(DISTINCT host_id) * 20 FROM users WHERE plan = 'pro_$20') - 
  (SELECT SUM(costo_usd) FROM translations WHERE YEAR(created_at) = 2026)
  as gross_margin;
```

---

## Deploy en Netlify

```bash
# 1. Push a GitHub
git add .
git commit -m "feat: FASE 3 - 5 módulos operativos (CRUD, Documents, Notifications, Automation, AI Agents)"
git push origin main

# 2. Netlify conectará automáticamente
# - Build: npm run build
# - Deploy: dist/
# - Functions: netlify/functions/*.js

# 3. Configurar environment variables en Netlify Dashboard
# Settings → Environment variables → Agregar SUPABASE_URL, ANTHROPIC_API_KEY, etc.

# 4. Verificar deployment
curl https://linkgol.netlify.app/.netlify/functions/core-crud
```

---

**Documento actualizado:** 2026-06-28  
**Estado:** Listo para deploy en Netlify

