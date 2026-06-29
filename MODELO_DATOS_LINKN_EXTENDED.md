# LinkN.click — Modelo de Datos Extendido (con Invitaciones)

## Tablas Nuevas / Modificadas para Sistema de Invitaciones

### TABLA: invitaciones (NEW)
```sql
CREATE TABLE invitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id),
  
  -- Remitente (quien crea la invitación)
  remitente_id UUID NOT NULL REFERENCES usuarios(id),
  remitente_nombre VARCHAR(255),
  
  -- Receptor (quien recibe la invitación)
  receptor_email VARCHAR(255),
  receptor_nombre VARCHAR(255),
  receptor_idioma VARCHAR(10),
  
  -- Primer mensaje personalizado
  primer_mensaje TEXT NOT NULL,
  
  -- Token de aceptación
  token_aceptacion VARCHAR(255) UNIQUE,
  aceptada BOOLEAN DEFAULT FALSE,
  aceptada_en TIMESTAMP,
  
  -- Canales de distribución
  canal_compartida ENUM('WHATSAPP', 'FACEBOOK', 'EMAIL', 'QR', 'DIRECT_LINK') DEFAULT 'DIRECT_LINK',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expira_en TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  
  FOREIGN KEY (link_id) REFERENCES links(id),
  FOREIGN KEY (remitente_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_invitaciones_link ON invitaciones(link_id);
CREATE INDEX idx_invitaciones_remitente ON invitaciones(remitente_id);
CREATE INDEX idx_invitaciones_token ON invitaciones(token_aceptacion);
```

### TABLA: acceptances (NEW) — Registro de aceptaciones
```sql
CREATE TABLE acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitacion_id UUID NOT NULL REFERENCES invitaciones(id),
  conversacion_id UUID REFERENCES conversaciones(id),
  
  -- Datos del aceptante
  usuario_id UUID REFERENCES usuarios(id),
  nip_4_digitos VARCHAR(4),
  
  -- Detalles técnicos
  ip_origen VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamp
  accepted_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (invitacion_id) REFERENCES invitaciones(id)
);

CREATE INDEX idx_acceptances_invitacion ON acceptances(invitacion_id);
CREATE INDEX idx_acceptances_conversacion ON acceptances(conversacion_id);
```

### TABLA MODIFICADA: links
```sql
-- Agregar campos a tabla links existente:
ALTER TABLE links ADD COLUMN (
  -- Para llevar registro de ligasreadas
  total_invitaciones_enviadas INT DEFAULT 0,
  total_aceptadas INT DEFAULT 0,
  tasa_aceptacion FLOAT DEFAULT 0,
  primer_mensaje_default TEXT, -- puede variar por contexto
  fecha_ultima_invitacion TIMESTAMP
);
```

### TABLA MODIFICADA: mensajes
```sql
-- Agregar campo para marcar si es primer mensaje automático
ALTER TABLE mensajes ADD COLUMN (
  es_primer_mensaje_automatico BOOLEAN DEFAULT FALSE,
  invitacion_id UUID REFERENCES invitaciones(id)
);
```

---

## Flujos Implementados en BD

### FLUJO 1: Creación de Liga (Remitente)
```
1. Usuario (remitente) crea cuenta en Landing → SignUp
2. Selecciona contexto en CreateInvitation
3. Personaliza primer_mensaje
4. Sistema genera:
   - invitacion.id UUID
   - invitacion.token_aceptacion (único)
   - invitacion.link_id → referencia a links table
   - invitacion.primer_mensaje
5. Genera URL: linkn.click/{token_aceptacion}
6. Genera QR con la URL
7. Usuario puede compartir por:
   - WhatsApp (con mensaje)
   - Facebook
   - Email
   - QR code
   - Link directo (copy)
```

### FLUJO 2: Aceptación de Invitación (Receptor)
```
1. Receptor hace clic en linkn.click/{token_aceptacion}
2. Sistema valida:
   - invitacion existe
   - invitacion no aceptada aún
   - NO ha expirado
3. Muestra:
   - "Te invita: {remitente_nombre}"
   - Contexto de la invitación
   - Preview del primer mensaje
   - Selector de idioma
4. Receptor elige idioma → acepta
5. Sistema:
   a. Crea usuario anónimo: NIP 4-digit
   b. Crea conversacion
   c. Actualiza invitacion: aceptada=TRUE, aceptada_en=NOW()
   d. Crea mensaje automático (es_primer_mensaje_automatico=TRUE)
      - texto: primer_mensaje (del remitente)
      - sender_id: remitente_id
      - invitacion_id: invitacion.id
   e. Crea record en acceptances table
   f. REDIRIGE a LinkChat para la conversación
```

### FLUJO 3: Primer Mensaje Automático
```
Cuando receptor acepta invitación:
- INSERT mensajes:
  {
    conversacion_id: <new_conversation_id>,
    sender_id: <remitente_id>,
    texto_original: <invitacion.primer_mensaje>,
    idioma_original: <remitente.idioma_default>,
    es_primer_mensaje_automatico: TRUE,
    invitacion_id: <invitacion.id>,
    tipo_mensaje: 'TEXT'
  }

Resultado:
- Receptor ve el mensaje inmediatamente
- Mensaje ya traducido a su idioma (vía JSONB translations)
- Receptor puede responder de inmediato
- Conversación comenzó exitosamente
```

---

## Endpoints API Nuevos (Backend)

### POST /api/v2/invitations
```
Crear nueva invitación

Input:
{
  remitente_id: UUID,
  link_id: UUID,
  receptor_email: string,
  receptor_nombre: string,
  receptor_idioma: string (es, en, ru, de, etc),
  primer_mensaje: string,
  canal_compartida: enum (WHATSAPP | FACEBOOK | EMAIL | QR | DIRECT_LINK)
}

Output:
{
  invitacion_id: UUID,
  token_aceptacion: string,
  url: "linkn.click/{token_aceptacion}",
  qr_code_url: "https://api.qrserver.com/...",
  compartir_url: {
    whatsapp: "https://wa.me/...",
    facebook: "https://facebook.com/...",
    email: "mailto:...",
    copy: "{url}"
  }
}
```

### POST /api/v2/invitations/{token}/accept
```
Aceptar invitación

Input:
{
  token_aceptacion: string,
  usuario_nip: string (4-digit, si anónimo),
  idioma_seleccionado: string
}

Output:
{
  success: true,
  usuario_id: UUID,
  conversacion_id: UUID,
  primer_mensaje: {
    id: UUID,
    text: string,
    remitente: string,
    timestamp: ISO8601
  }
}
```

### GET /api/v2/invitations/{remitente_id}
```
Listar invitaciones enviadas por un remitente

Output:
[
  {
    id: UUID,
    receptor_nombre: string,
    primer_mensaje: string,
    aceptada: boolean,
    canal_compartida: string,
    created_at: ISO8601,
    aceptada_en: ISO8601 (null if not accepted)
  }
]
```

### GET /api/v2/invitations/{remitente_id}/analytics
```
Analytics de invitaciones

Output:
{
  total_enviadas: int,
  total_aceptadas: int,
  tasa_aceptacion: float (0-1),
  por_canal: {
    whatsapp: { enviadas: int, aceptadas: int },
    facebook: { enviadas: int, aceptadas: int },
    email: { enviadas: int, aceptadas: int },
    qr: { enviadas: int, aceptadas: int },
    direct_link: { enviadas: int, aceptadas: int }
  },
  promedio_tiempo_aceptacion: int (minutos)
}
```

---

## Flujo Completo (Paso a Paso)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DE INVITACIÓN                          │
└──────────────────────────────────────────────────────────────────────────┘

FASE 1: REMITENTE CREA LA INVITACIÓN
════════════════════════════════════════════════════════════════════════════
1. Landing.jsx → "Crear Cuenta Gratis"
2. SignUp.jsx → Usuario se registra (nombre, email, idioma)
3. HostDashboard.jsx → "Crear Nueva Liga"
4. CreateInvitation.jsx:
   - Step 1: Selecciona contexto (🚗 Autos, 🏠 Inmuebles, etc)
   - Step 2: Personaliza primer_mensaje
     Default: "Hola, soy Roberto Aguilar"
     Personalizado: "Hola, nos conocimos en el partido de Chivas-América"
   - Step 3: Genera Liga
     POST /api/v2/invitations
     → INSERT invitaciones table
     → Genera token_aceptacion único
     → Genera URL: linkn.click/{token}
     → Genera QR code
   - Step 4: Comparte
     Opciones: WhatsApp, Facebook, Email, QR, Copy Link

FASE 2: RECEPTOR RECIBE Y ACEPTA
════════════════════════════════════════════════════════════════════════════
5. Receptor recibe link en WhatsApp:
   "Roberto Aguilar te invita a conversar en LinkN.click
    'Nos conocimos en el partido de Chivas-América'
    linkn.click/abc123xyz"

6. Hace clic → Abre InvitationAccept.jsx
   - Muestra: "Te invita Roberto Aguilar"
   - Contexto: 🚗 Venta de Autos
   - Preview primer_mensaje: "Nos conocimos en el partido..."
   - Selector de idioma: ¿Cuál es tu idioma?
   - Botón: "Aceptar"

7. Elige idioma → Acepta
   POST /api/v2/invitations/{token}/accept
   
   Backend:
   a. Valida invitacion:
      - EXISTS en tabla invitaciones
      - aceptada = FALSE
      - expira_en > NOW()
   b. Crea usuario anónimo:
      - nip_4_digitos: "3847"
      - idioma_preferido: "en" (elegido)
      - INSERT usuarios
   c. Crea conversacion:
      - participante_1: remitente_id (Roberto)
      - participante_2: usuario_nuevo_anonimo
      - idioma_p1: "es" (Roberto)
      - idioma_p2: "en" (receptor)
      - INSERT conversaciones
   d. Crea mensaje automático (PRIMER MENSAJE):
      - Texto original: "Nos conocimos en el partido de Chivas-América"
      - Idioma original: "es"
      - Traducción automática a "en": "We met at the Chivas-América game"
      - sender_id: remitente_id (Roberto)
      - es_primer_mensaje_automatico: TRUE
      - INSERT mensajes
   e. Actualiza invitacion:
      - aceptada: TRUE
      - aceptada_en: NOW()
      - UPDATE invitaciones
   f. Crea registro de aceptacion:
      - INSERT acceptances
      - Guarda IP, User-Agent
   g. REDIRIGE a LinkChat

FASE 3: CONVERSACIÓN EN TIEMPO REAL
════════════════════════════════════════════════════════════════════════════
8. LinkChat carga:
   - Receptor ve: "Roberto Aguilar: Nos conocimos en el partido de Chivas-América"
     (Mensaje ya traducido a su idioma "en")
   - Receptor puede responder inmediatamente

9. Receptor escribe:
   "Great to reconnect! What do you want to show me?"

10. Roberto recibe:
    Traducido a español: "¡Qué bueno reconectarnos! ¿Qué me quieres mostrar?"

11. Conversación continúa...
    - Cada mensaje se traduce automáticamente
    - Ambos hablan en su idioma nativo
    - Sin fricción, sin barreras de idioma

════════════════════════════════════════════════════════════════════════════
```

---

## Seguridad & Privacidad

```sql
-- Invitaciones válidas solo 30 días
SELECT * FROM invitaciones 
WHERE expira_en > NOW() AND token_aceptacion = 'xyz';

-- Token es único y criptográficamente aleatorio
-- Genera con: crypto.randomBytes(32).toString('hex')

-- Receptor anónimo: no comparte email, teléfono, redes sociales
-- Solo: NIP 4 dígitos + idioma elegido

-- Invitación aceptada solo una vez
-- UPDATE invitaciones SET aceptada = TRUE WHERE id = 'xxx'
-- No puede aceptarse de nuevo

-- Registro de quién aceptó: IP + User-Agent
-- Para auditoría y prevención de fraude
```

---

## Monetización

```
FREE TIER:
- Crear invitaciones: ✅ ilimitadas
- Primer mensaje personalizado: ✅
- Compartir por: ✅ todos los canales (WhatsApp, QR, Email, etc)
- Analytics: ❌ básicos solo

STARTER ($5/mes):
- Todo de FREE
- Analytics avanzadas: ✅
- Multi-invitación simultánea: ✅
- Mensajes de voz en invitación: ❌ (pendiente)

PRO ($20/mes):
- Todo de STARTER
- Mensajes de voz en invitación: ✅
- Templates de primer mensaje: ✅
- Multi-idioma en invitación: ✅
- API de invitaciones: ✅
- Webhooks para eventos de aceptación: ✅
```

---

## Estado: PROMPT B Extended - Portal & Invitations

✅ Landing.jsx (portal de información)
✅ SignUp.jsx (crear cuenta)
✅ CreateInvitation.jsx (crear liga con primer mensaje personalizado)
⏳ InvitationAccept.jsx (aceptar invitación, selector de idioma)
⏳ HostDashboard.jsx (gestionar invitaciones, analytics)
⏳ Backend endpoints (crear_invitacion, aceptar_invitacion, analytics)
⏳ Database schema (invitaciones, acceptances tables)

**Listo para PROMPT C:** LinkChat + Real-time + IA
