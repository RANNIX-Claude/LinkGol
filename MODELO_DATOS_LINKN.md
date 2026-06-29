# LinkN.click — Modelo de Datos v1.0

## 📊 Esquema PostgreSQL (Supabase)

### 1. `usuarios` — Identity (anónima + opcional)
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nip_4_digitos VARCHAR(4) UNIQUE, -- opcional, generado
  idioma_preferido VARCHAR(10) DEFAULT 'es',
  pais VARCHAR(2),
  timezone VARCHAR(50),
  tipo_usuario ENUM('personal', 'business', 'vendor', 'support') DEFAULT 'personal',
  estado ENUM('activo', 'suspendido', 'eliminado') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- No hay email obligatorio, no hay teléfono obligatorio
  -- La identidad es: UUID + NIP 4 dígitos
);

CREATE INDEX idx_usuarios_nip ON usuarios(nip_4_digitos);
```

### 2. `links` — Core Entity (Contenedor de Conversación)
```sql
CREATE TABLE links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL, -- linkn.click/{slug}
  owner_id UUID NOT NULL REFERENCES usuarios(id),
  
  -- Contexto del link
  contexto ENUM('venta_autos', 'renta_inmueble', 'networking', 'cita_informal', 'soporte_tecnico', 'comercio_general', 'turismo', 'otro'),
  titulo VARCHAR(255),
  descripcion TEXT,
  prompt_base TEXT, -- instrucción para IA
  tono ENUM('formal', 'casual', 'profesional', 'amigable') DEFAULT 'amigable',
  
  -- Idiomas
  idioma_base VARCHAR(10) DEFAULT 'es',
  idiomas_permitidos VARCHAR(100)[], -- ['es', 'en', 'fr']
  
  -- Configuración
  modo ENUM('conversacion', 'business_catalog', 'soporte', 'networking') DEFAULT 'conversacion',
  permitir_anonimos BOOLEAN DEFAULT TRUE,
  max_participantes INT DEFAULT 2,
  auto_translate BOOLEAN DEFAULT TRUE,
  
  -- Seguridad
  token_acceso VARCHAR(255) UNIQUE,
  expira_en TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  estado ENUM('draft', 'activo', 'pausado', 'finalizado') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (owner_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_links_slug ON links(slug);
CREATE INDEX idx_links_owner ON links(owner_id);
CREATE INDEX idx_links_token ON links(token_acceso);
```

### 3. `contextos_link` — Intelligence Layer
```sql
CREATE TABLE contextos_link (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id),
  
  -- IA detecta intención
  intension_detectada VARCHAR(255),
  categorias VARCHAR(100)[],
  keywords VARCHAR(100)[],
  
  -- Catálogo base (si aplica)
  catalogo_id UUID,
  
  -- Scoring
  score_lead FLOAT DEFAULT 0,
  score_conversion FLOAT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. `conversaciones` — Chat Container
```sql
CREATE TABLE conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id),
  
  -- Participantes (pueden ser anónimos)
  participante_1 UUID REFERENCES usuarios(id),
  participante_2_anonimo BOOLEAN DEFAULT TRUE,
  participante_2_nip VARCHAR(4),
  
  -- Idiomas por participante
  idioma_p1 VARCHAR(10),
  idioma_p2 VARCHAR(10),
  
  -- Estado
  estado ENUM('activa', 'pausada', 'finalizada', 'bloqueada') DEFAULT 'activa',
  modo ENUM('texto', 'audio', 'video') DEFAULT 'texto',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  finalizada_en TIMESTAMP,
  
  FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE INDEX idx_conversaciones_link ON conversaciones(link_id);
CREATE INDEX idx_conversaciones_activas ON conversaciones(estado);
```

### 5. `mensajes` — Core Communication
```sql
CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES conversaciones(id),
  
  -- Sender (puede ser anónimo)
  sender_id UUID REFERENCES usuarios(id),
  sender_nip VARCHAR(4), -- si es anónimo
  
  -- Contenido
  texto_original TEXT NOT NULL,
  idioma_original VARCHAR(10),
  
  -- Traducción automática por usuario
  traducciones JSONB DEFAULT '{}', -- { 'es': 'texto', 'en': 'text', 'fr': 'texte' }
  
  -- Metadata
  tipo ENUM('texto', 'sistema', 'producto', 'link', 'audio') DEFAULT 'texto',
  es_traducido BOOLEAN DEFAULT FALSE,
  detectado_intension VARCHAR(255),
  
  -- Timing
  created_at TIMESTAMP DEFAULT NOW(),
  leido_en TIMESTAMP,
  
  FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id)
);

CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX idx_mensajes_timestamp ON mensajes(created_at);
```

### 6. `catalogos` — Modo Business
```sql
CREATE TABLE catalogos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES usuarios(id),
  
  nombre VARCHAR(255),
  descripcion TEXT,
  tipo ENUM('productos', 'servicios', 'inmuebles', 'autos', 'general') DEFAULT 'general',
  
  -- Contenido
  items JSONB NOT NULL, -- [{ id, nombre, descripcion, precio, disponibilidad, foto_url }]
  
  -- Metadata
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (owner_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_catalogos_owner ON catalogos(owner_id);
```

### 7. `idiomas` — Language Support
```sql
CREATE TABLE idiomas (
  codigo VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(50),
  nombre_nativo VARCHAR(50),
  flag CHAR(2),
  soportado_audio BOOLEAN DEFAULT FALSE,
  soportado_video BOOLEAN DEFAULT FALSE
);

INSERT INTO idiomas VALUES
  ('es', 'Spanish', 'Español', '🇪🇸', true, false),
  ('en', 'English', 'English', '🇺🇸', true, false),
  ('fr', 'French', 'Français', '🇫🇷', true, false),
  ('de', 'German', 'Deutsch', '🇩🇪', true, false),
  ('ru', 'Russian', 'Русский', '🇷🇺', true, false),
  ('zh', 'Chinese', '中文', '🇨🇳', true, false),
  ('ja', 'Japanese', '日本語', '🇯🇵', true, false),
  ('pt', 'Portuguese', 'Português', '🇧🇷', true, false),
  ('it', 'Italian', 'Italiano', '🇮🇹', true, false),
  ('ar', 'Arabic', 'العربية', '🇸🇦', true, false);
```

### 8. `analítica_links` — Business Intelligence
```sql
CREATE TABLE analítica_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id),
  
  -- Tráfico
  visitas_totales INT DEFAULT 0,
  conversaciones_iniciadas INT DEFAULT 0,
  tasa_conversion_inicial FLOAT,
  
  -- Idiomas
  idiomas_usados VARCHAR(10)[],
  idioma_mas_usado VARCHAR(10),
  
  -- Intenciones detectadas
  intenciones JSONB, -- { 'venta': 5, 'consulta': 3, 'networking': 2 }
  
  -- Tiempo
  tiempo_promedio_conversacion INT, -- segundos
  tasa_respuesta FLOAT,
  
  -- Leads
  leads_generados INT DEFAULT 0,
  leads_convertidos INT DEFAULT 0,
  score_oportunidad FLOAT,
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE INDEX idx_analítica_link ON analítica_links(link_id);
```

### 9. `sesiones_anonimas` — Temporary Identity
```sql
CREATE TABLE sesiones_anonimas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  nip_4_digitos VARCHAR(4),
  link_id UUID NOT NULL REFERENCES links(id),
  
  -- Seguridad
  token_sesion VARCHAR(255) UNIQUE,
  ip_origen VARCHAR(45),
  user_agent TEXT,
  
  -- Timing
  created_at TIMESTAMP DEFAULT NOW(),
  expira_en TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
  activa BOOLEAN DEFAULT TRUE,
  
  FOREIGN KEY (link_id) REFERENCES links(id)
);

CREATE INDEX idx_sesiones_token ON sesiones_anonimas(token_sesion);
```

### 10. `logs_auditoria` — Security & Compliance
```sql
CREATE TABLE logs_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES links(id),
  conversacion_id UUID REFERENCES conversaciones(id),
  usuario_id UUID REFERENCES usuarios(id),
  
  accion VARCHAR(255),
  datos_antes JSONB,
  datos_despues JSONB,
  ip_origen VARCHAR(45),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_logs_timestamp ON logs_auditoria(created_at);
```

---

## 🔄 Relaciones Principales

```
usuarios (1) ---> (N) links
usuarios (1) ---> (N) catalogos
usuarios (1) ---> (N) sesiones_anonimas

links (1) ---> (N) conversaciones
links (1) ---> (1) contextos_link
links (N) ---> (N) idiomas (many-to-many implicit)

conversaciones (1) ---> (N) mensajes
mensajes (N) ---> (1) usuarios (sender_id, nullable si anónimo)
```

---

## 📌 Notas de Diseño

1. **Anonimato:** Usuario anónimo = UUID + NIP 4 dígitos
2. **Idiomas:** Cada mensajero ve su idioma, traducción es invisible
3. **Contexto:** Define comportamiento IA y catálogos
4. **Seguridad:** Token de acceso, expiración, cifrado end-to-end (futuro)
5. **Escalabilidad:** Índices en campos frecuentes (slug, token, timestamp)
6. **Analytics:** Cada link trackea: visitas, conversiones, intenciones, idiomas

---

## 🚀 Próximos Pasos (PROMPT B)

1. Crear scripts SQL en Supabase
2. Implementar API endpoints (core-crud-linkn.js)
3. Refactorizar frontend: App.jsx → LinkCreator + LinkJoin
4. Integrar IA: traducción + detección de intención
5. Setup de análítica
