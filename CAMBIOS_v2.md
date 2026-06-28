# LinkGol v2.0 — Cambios Arquitectónicos

**Fecha:** 2026-06-28  
**Cambio:** De salas múltiples → Conversaciones 1:1 por contacto

---

## 🔄 Lo Que Cambió

### ANTES (v1.0)
```
Host crea SALA
    ↓
Múltiples guests en la misma sala
    ↓
Un QR para todos los guests
    ↓
Traducción entre todos
```

### AHORA (v2.0) ✅
```
Host configura SU IDIOMA (es, ru, de, etc)
    ↓
Host invita a CONTACTO X → Conversación 1:1
    ├─ QR único para esa conversación
    ├─ Link único para esa conversación
    └─ Contacto X se agrega a libreta de direcciones
    
Host invita a CONTACTO Y → Otra conversación 1:1 (diferente)
    ├─ QR diferente
    ├─ Link diferente
    └─ Contacto Y se agrega a libreta
    
Host puede tener N conversaciones (una por contacto)
```

---

## 📊 Cambios en Base de Datos

### Tablas Eliminadas
- ❌ `rooms` (salas múltiples)

### Tablas Nuevas
- ✅ `contacts` — Libreta de direcciones del host
- ✅ `conversations` — Conversaciones 1:1 (reemplaza rooms)

### Tablas Modificadas
- ✅ `users` — Cambio: `idioma_preferido` → `idioma_default` (preconfigurado)
- ✅ `messages` — Cambio: `room_id` → `conversation_id`
- ✅ `guest_sessions` — Cambio: `room_id` → `conversation_id`

### Nueva Estructura

**Tabla: conversations**
```sql
id              UUID PRIMARY KEY
host_id         UUID → users (FK)
guest_email     VARCHAR (aún no aceptó)
guest_name      VARCHAR
host_idioma     VARCHAR (idioma en que HOST quiere hablar)
guest_idioma    VARCHAR (nulo hasta que guest entre)
qr_code         TEXT UNIQUE
qr_url          TEXT
link_token      VARCHAR UNIQUE
activa          BOOLEAN
created_at      TIMESTAMP
```

**Tabla: contacts**
```sql
id              UUID PRIMARY KEY
host_id         UUID → users (FK)
contact_name    VARCHAR
contact_email   VARCHAR
contact_phone   VARCHAR
contact_photo   TEXT
created_at      TIMESTAMP
```

---

## 🔀 Nuevos Flujos

### Flujo Host
```
1. Host se registra (Google OAuth)
2. Host ELIGE SU IDIOMA UNA VEZ
   → users.idioma_default = 'es'
   → Cambiabl en perfil, pero es fijo para invitaciones

3. Host ve: Dashboard
   - Contactos (address book)
   - Conversaciones activas (1:1 con cada contacto)

4. Host invita a Persona X:
   POST /api/v2/conversations
   {
     "host_id": "...",
     "guest_email": "anna@russia.ru",
     "guest_name": "Anna",
     "host_idioma": "es"  // idioma que el host eligió
   }
   
   Response:
   {
     "conversation_id": "conv-123",
     "qr_url": "linkgol.app/conv/QR_...",
     "link": "linkgol.app/i/TOKEN_...",
     "host_idioma": "es"
   }

5. Host comparte link/QR con Anna
   → Crea Contact entry para "Anna"
```

### Flujo Guest
```
1. Anna abre: linkgol.app/i/TOKEN_...
   → GET /api/v2/conversations/join/TOKEN_...
   
2. Anna ELIGE SU IDIOMA (primera vez)
   → "Elige idioma con banderas"
   → Se guarda en localStorage
   
3. POST /api/v2/guests/enter
   {
     "conversation_id": "conv-123",
     "guest_name": "Anna",
     "idioma": "ru"
   }
   
4. Anna ve chat 1:1 con Roberto
   - Roberto escribe en ESPAÑOL (su idioma)
   - Anna ve en RUSO (su idioma)
   - Ambos son traducción invisible
   
5. conversations.guest_idioma se actualiza a 'ru'
   → Ahora el sistema sabe qué idiomas usar
```

### Conversaciones Múltiples
```
Si Roberto invita a 5 personas:
- Anna (ruso)
- Carlos (alemán)
- Maria (francés)
- Juan (inglés)
- Sophie (francés)

Roberto ahora tiene 5 conversaciones 1:1 DIFERENTES:
  - conv-123: Roberto(es) ↔ Anna(ru)
  - conv-456: Roberto(es) ↔ Carlos(de)
  - conv-789: Roberto(es) ↔ Maria(fr)
  - conv-101: Roberto(es) ↔ Juan(en)
  - conv-112: Roberto(es) ↔ Sophie(fr)

Cada una:
- ✅ QR único
- ✅ Link único
- ✅ Mensajes propios
- ✅ Traducciones propias
- ✅ Histórico separado
```

---

## 📡 Nuevos Endpoints (v2.0)

### Usuarios
```
POST /api/v2/users
  → Crear host con idioma_default preconfigurado
```

### Contactos
```
POST /api/v2/contacts
  → Agregar contacto a libreta del host

GET /api/v2/contacts/:host_id
  → Listar todos los contactos del host
```

### Conversaciones (Core)
```
POST /api/v2/conversations
  → Host invita a alguien
  → Genera conversation 1:1 con QR y Link únicos
  → Agrega a contacts automáticamente

GET /api/v2/conversations/:host_id
  → Listar conversaciones activas del host

GET /api/v2/conversations/join/:link_token
  → Guest abre invitación por link
```

### Mensajes
```
POST /api/v2/messages
  → Enviar mensaje en una conversación 1:1

GET /api/v2/messages/:conversation_id
  → Historial de una conversación 1:1
```

### Guest Sessions
```
POST /api/v2/guests/enter
  → Guest entra a conversación (sin account)
  → Genera session token para localStorage
```

---

## 🎯 Impacto

### ✅ Ventajas
- Privacidad: Cada conversación es 1:1 (sin terceros)
- Claridad: El host sabe quién es quién
- Escalabilidad: N conversaciones sin límite
- Seguridad: RLS más estricto por conversación
- UX: Interfaz similar a WhatsApp

### ⚠️ Cambios en Frontend
- ❌ Eliminar: Sidebar de "salas"
- ✅ Agregar: Sidebar de "contactos" (lista de personas)
- ✅ Agregar: Click en contacto = abre conversación 1:1
- ✅ Agregar: Botón "Agregar contacto" / "Invitar"

---

## 📋 Checklist Migración

- [x] Schema SQL v2.0 creado
- [x] reset_database_v2.sql ejecutado
- [x] Tablas nuevas (conversations, contacts)
- [x] core-crud-v2.js endpoints creados
- [ ] Frontend conectado a v2 endpoints
- [ ] ChatList → ContactList (refactor)
- [ ] Agregar Dialog "Invitar contacto"
- [ ] Actualizar UI para mostrar idioma_default del host
- [ ] Testing con datos reales

---

## 🚀 Próximo Paso

Frontend debe consumir nuevos endpoints:
1. GET /api/v2/contacts/:host_id → Listar contactos
2. POST /api/v2/conversations → Invitar
3. GET /api/v2/conversations/:host_id → Listar conversaciones
4. GET /api/v2/messages/:conversation_id → Historial
5. POST /api/v2/messages → Enviar

Y refactorizar App.jsx para mostrar conversaciones 1:1 en lugar de salas.

