# FASE 3 — Módulos Operativos LinkGol

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                  Netlify Functions (Backend)                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│  │  CORE CRUD      │  │  DOCUMENTS   │  │  NOTIFICATIONS  │
│  │  ─────────────  │  │  ──────────  │  │  ──────────────  │
│  │ • POST /users   │  │ • QR Gen     │  │ • Email (Resend)│
│  │ • GET /rooms    │  │ • OCR        │  │ • SMS (Twilio)  │
│  │ • POST /msg     │  │ • File Upload│  │ • Push Notif    │
│  │ • DELETE /guest │  │ • Compress   │  │ • WebSocket     │
│  └─────────────────┘  └──────────────┘  └─────────────────┘
│
│  ┌─────────────────┐  ┌──────────────────────────────────┐
│  │  AUTOMATION     │  │  AI AGENTS (Enhanced)            │
│  │  ───────────────│  │  ──────────────────────────────  │
│  │ • On User Join  │  │ • Lang Detection (OpenAI)        │
│  │ • On Message    │  │ • Conversation Summary           │
│  │ • On Room Close │  │ • Sentiment Analysis             │
│  │ • On Translate  │  │ • Fraud Detection                │
│  └─────────────────┘  │ • Custom Webhooks                │
│                       └──────────────────────────────────┘
│
└─────────────────────────────────────────────────────────────┘
         ↓                      ↓                    ↓
    ┌─────────────────────────────────────────────────────┐
    │          Supabase (PostgreSQL + Realtime)           │
    │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │
    │  │ users    │ │ messages │ │ audit_log + events │  │
    │  │ rooms    │ │ trans.   │ │ webhooks + triggers│  │
    │  │ guests   │ │ media    │ │ job_queue          │  │
    │  └──────────┘ └──────────┘ └────────────────────┘  │
    └─────────────────────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────────────────────┐
    │    External Services (via Netlify Functions)        │
    │  ┌────────────┐ ┌──────────┐ ┌──────────────────┐   │
    │  │Claude API  │ │Resend    │ │OpenAI/Whisper    │   │
    │  │(Translate) │ │Email     │ │Twilio            │   │
    │  │(Summarize) │ │(Templates)│ │(SMS/Voice)       │   │
    │  └────────────┘ └──────────┘ └──────────────────┘   │
    └─────────────────────────────────────────────────────┘
```

---

## MÓDULO 1: Core CRUD

**Endpoint Base:** `/api/v1`

### Usuarios (Hosts)

```javascript
// POST /api/v1/users — Crear host (Google OAuth)
{
  "google_id": "...",
  "nombre": "Roberto",
  "email": "roberto@mexico.mx",
  "idioma_preferido": "es"
}
→ { id, token, plan: "free" }

// GET /api/v1/users/:id — Obtener perfil
→ { id, nombre, email, salas_count, mensajes_count }

// PUT /api/v1/users/:id — Actualizar plan
{ "plan": "pro_$20", "stripe_customer_id": "..." }
→ { updated: true }

// DELETE /api/v1/users/:id — Cancelar cuenta
→ { deleted: true, data_purged: true }
```

### Salas (Rooms)

```javascript
// POST /api/v1/rooms — Host crea sala
{
  "host_id": "...",
  "nombre": "Sala Negocio",
  "idioma_host": "es"
}
→ { id, qr_code, qr_url: "linkgol.app/u/@usuario/sala-xxx" }

// GET /api/v1/rooms/:host_id — Listar salas del host
→ [ { id, nombre, qr_url, guests_count, created_at }, ... ]

// GET /api/v1/rooms/:room_id/stats — Stats de sala
→ { mensajes: 42, guests: 3, duracion_minutos: 120, idiomas: ["es", "en", "ru"] }

// DELETE /api/v1/rooms/:room_id — Cerrar sala
→ { closed: true, mensajes_archived: 42 }
```

### Mensajes

```javascript
// POST /api/v1/messages — Enviar mensaje
{
  "room_id": "...",
  "sender_id": "...",
  "texto_original": "¡Hola!",
  "idioma_original": "es"
}
→ { id, translated_to: ["en", "ru"], broadcast_via: "websocket" }

// GET /api/v1/messages/:room_id?limit=50&offset=0 — Historial
→ [ { id, sender_nombre, texto_original, traducciones, timestamp, read }, ... ]

// PUT /api/v1/messages/:msg_id/read — Marcar como leído
→ { read: true, read_at }
```

### Guest Sessions

```javascript
// POST /api/v1/guests/join — Guest entra a sala
{
  "room_id": "...",
  "nombre": "Juan",
  "idioma": "es"
}
→ { guest_id, token, room_name, host_name, messages_count }

// DELETE /api/v1/guests/:guest_id/leave — Guest sale
→ { left: true, session_duration_seconds: 1200 }
```

---

## MÓDULO 2: Document Processing

**Endpoint:** `/api/v1/documents`

### QR Generation

```javascript
// POST /api/v1/documents/qr
{
  "room_id": "...",
  "size": 300,  // px
  "format": "png" | "svg"
}
→ { qr_code_base64, qr_url }
```

### Image Upload & Processing

```javascript
// POST /api/v1/documents/upload
FormData:
  - file: <image|pdf>
  - room_id: "..."
  - type: "profile" | "product" | "document"

→ { 
  file_id,
  url: "cdn.linkgol.app/...",
  size_kb,
  mime_type,
  extracted_text: "..." // OCR si aplica
}
```

### Media Compression

```javascript
// POST /api/v1/documents/compress
{
  "file_id": "...",
  "target_size_kb": 500
}
→ { compressed_file_id, original_kb, compressed_kb, savings_percent }
```

---

## MÓDULO 3: Notifications

**Endpoint:** `/api/v1/notifications`

### Email (Resend)

```javascript
// POST /api/v1/notifications/email
{
  "to": "user@email.com",
  "template": "room_invitation" | "translation_ready" | "user_joined",
  "variables": { room_name: "...", guest_name: "...", ... }
}
→ { email_id, status: "sent", sent_at }
```

### SMS (Twilio)

```javascript
// POST /api/v1/notifications/sms
{
  "phone": "+34911223344",
  "message": "¡Tu sala está lista! linkgol.app/u/@usuario/xyz",
  "country_code": "es"
}
→ { sms_id, status: "queued", estimated_delivery_minutes: 1 }
```

### Push Notifications

```javascript
// POST /api/v1/notifications/push
{
  "user_id": "...",
  "title": "Nuevo mensaje de Anna",
  "body": "Hola, ¿cómo estás?",
  "action_url": "/chat/room-123"
}
→ { push_id, sent: 1, failed: 0 }
```

### WebSocket Events

```javascript
// Realtime via Supabase WebSocket
// Cliente escucha: messages:created, room:user_joined, translations:ready
supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes', { event: '*', schema: 'public' }, payload => {
    // Auto-refresh UI
  })
  .subscribe()
```

---

## MÓDULO 4: End-to-End Automation

**Database Triggers + Netlify Functions**

### Trigger: User Joins Room

```sql
CREATE TRIGGER on_guest_join
AFTER INSERT ON guest_sessions
FOR EACH ROW
EXECUTE FUNCTION notify_host_new_guest();
```

```javascript
// netlify/functions/notify-host-new-guest.js
exports.handler = async (event) => {
  const { room_id, guest_name, idioma } = JSON.parse(event.body);
  
  // 1. Obtener host
  const room = await supabase.from('rooms').select('host_id').eq('id', room_id).single();
  
  // 2. Enviar notificación
  await sendEmail(room.host_id, `${guest_name} joined your room!`, 'guest_joined');
  
  // 3. Log en audit
  await supabase.from('audit_log').insert({
    tabla: 'guest_sessions',
    accion: 'join',
    registro_id: room_id,
    datos_nuevos: { guest_name, idioma }
  });
  
  return { statusCode: 200 };
};
```

### Trigger: Message Sent

```sql
CREATE TRIGGER on_message_created
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION auto_translate_message();
```

```javascript
// netlify/functions/auto-translate-message.js
exports.handler = async (event) => {
  const { message_id, texto_original, idioma_original } = JSON.parse(event.body);
  
  // 1. Obtener otros idiomas en la sala
  const room = await supabase
    .from('guest_sessions')
    .select('DISTINCT(idioma)')
    .eq('room_id', message.room_id);
  
  // 2. Traducir a cada idioma (Claude API con cache)
  for (const { idioma } of room.data) {
    if (idioma === idioma_original) continue;
    
    const translated = await translateWithClaude(
      texto_original,
      idioma_original,
      idioma
    );
    
    // 3. Guardar en translations table (con hash_cache)
    await supabase.from('translations').insert({
      message_id,
      idioma_destino: idioma,
      texto_traducido: translated,
      hash_cache: hashMessage(texto_original + idioma_original + idioma),
      costo_usd: 0.0003
    });
  }
  
  // 4. Broadcast via WebSocket
  await supabase.channel(`room:${message.room_id}`).send('broadcast', {
    event: 'translations:ready',
    message_id
  });
};
```

### Trigger: Room Closes

```sql
CREATE TRIGGER on_room_close
AFTER UPDATE OF activa ON rooms
FOR EACH ROW
WHEN (NEW.activa = false)
EXECUTE FUNCTION archive_room();
```

```javascript
// netlify/functions/archive-room.js
exports.handler = async (event) => {
  const { room_id } = JSON.parse(event.body);
  
  // 1. Generar resumen de conversación
  const summary = await summarizeRoomWithClaude(room_id);
  
  // 2. Guardar en audit
  await supabase.from('audit_log').insert({
    tabla: 'rooms',
    accion: 'close',
    registro_id: room_id,
    datos_nuevos: { summary, total_messages, duration }
  });
  
  // 3. Enviar resumen al host
  await sendEmail(host_id, `Room Summary: ${summary}`, 'room_summary');
  
  // 4. Trigger webhook (si existe integración externa)
  if (room.webhook_url) {
    await fetch(room.webhook_url, {
      method: 'POST',
      body: JSON.stringify({ event: 'room_closed', room_id, summary })
    });
  }
};
```

---

## MÓDULO 5: Enhanced AI Agents

**Netlify Functions + Claude API**

### Language Detection

```javascript
// POST /api/v1/ai/detect-language
{
  "text": "Привет, как дела?",
  "context": "room_id" // opcional
}
→ {
  detected_language: "ru",
  confidence: 0.98,
  alternatives: [{ lang: "bg", confidence: 0.02 }]
}

// Implementación:
const { TextAnalytics } = await import('@azure/ai-text-analytics'); // o usar Claude
const client = new TextAnalytics(apiKey);
const result = await client.detectLanguage(text);
```

### Conversation Summarization

```javascript
// POST /api/v1/ai/summarize
{
  "room_id": "...",
  "language": "es",
  "style": "bullet_points" | "paragraph" | "key_decisions"
}
→ {
  summary: "• Roberto presentó propuesta de venta\n• Anna preguntó por precios\n• Se acordó reunión para...",
  duration_minutes: 45,
  participants: 2,
  key_topics: ["venta", "precios", "reunión"],
  sentiment: "positive"
}
```

### Sentiment Analysis

```javascript
// POST /api/v1/ai/sentiment
{
  "message_id": "...",
  "text": "¡Excelente idea! Vamos adelante."
}
→ {
  sentiment: "positive",
  score: 0.92,  // -1 a 1
  emotion: "happy",
  suggests_action: false
}
```

### Fraud Detection

```javascript
// POST /api/v1/ai/fraud-check
{
  "room_id": "...",
  "check_type": "suspicious_patterns" | "unusual_behavior"
}
→ {
  risk_level: "low" | "medium" | "high",
  flags: [
    "rapid_guest_turnover",
    "unusual_payment_pattern",
    "language_inconsistency"
  ],
  recommendation: "monitor" | "block_room"
}
```

### Custom Webhooks

```javascript
// POST /api/v1/ai/webhooks
{
  "event": "message_sent" | "user_joined" | "room_closed",
  "url": "https://external-service.com/webhook",
  "secret": "webhook-secret-key"
}
→ { webhook_id, active: true, test_sent: true }

// Cuando ocurre el evento:
fetch(webhook_url, {
  method: 'POST',
  headers: { 'X-Signature': hmac(secret, payload) },
  body: JSON.stringify(event_data)
})
```

---

## Stack de Implementación

| Módulo | Librería | Servicio |
|--------|----------|----------|
| **Core CRUD** | Supabase SDK + pg | Supabase (PostgreSQL) |
| **Documents** | sharp (images) + node-qrcode + pdfjs | Netlify Functions + CDN |
| **Notifications** | resend + twilio | Resend + Twilio |
| **Automation** | supabase-js (triggers) | Supabase + Netlify |
| **AI Agents** | Anthropic SDK | Claude API Sonnet |

---

## Cronograma FASE 3

**Día 1 (Hoy):**
- [ ] Core CRUD (4 endpoints base)
- [ ] Documents (QR generation)

**Día 2:**
- [ ] Notifications (Email + SMS)
- [ ] Automation (Triggers)

**Día 3:**
- [ ] AI Agents (Language detection, summarization)
- [ ] Testing + Integration

---

**Archivo generado:** 2026-06-28  
**Estado:** Listo para implementación

