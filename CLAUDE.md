# CLAUDE.md — LinkGol v1.0

## Qué es LinkGol

**LinkGol** es un traductor invisible en tiempo real. Dos personas hablan en idiomas diferentes, pero cada una ve y entiende solo su idioma. Sin botones de traducción, sin fricción, sin instalar nada.

- **Lema:** Ligar, vender o negociar — nunca fue tan fácil.
- **Modelo:** Quien inicia contacto paga $20 USD/mes. Quien recibe es gratis siempre.
- **Target:** Turistas durante el Mundial 2026 (México), Nearshoring B2B, Turismo permanente.

---

## Stack Técnico

| Capa | Tecnología | Función |
|------|-----------|---------|
| **Frontend** | React + Vite | WebApp mobile-first, PWA-ready |
| **Estilos** | DM Sans + Glassmorphism | Tema LinkGol (azul #0052CC + ámbar #F59E0B) |
| **Base de Datos** | Supabase PostgreSQL | Usuarios, mensajes, salas, sesiones |
| **Realtime** | Supabase Realtime | WebSocket <300ms |
| **Traducción IA** | Claude API Sonnet | Motor invisible de traducción |
| **Hosting** | Netlify | Deploy automático + Serverless Functions |
| **Auth** | Google OAuth | Login para hosts |

---

## Credenciales (NUNCA commitear)

```
GITHUB_TOKEN         = [en .gitignore]
SUPABASE_ANON_KEY    = [en .env.local]
SUPABASE_SERVICE_ROLE= [solo en Netlify]
ANTHROPIC_API_KEY    = [solo en Netlify]
NETLIFY_TOKEN        = [para MCP]
GOOGLE_CLIENT_ID     = [en .env.local]
GOOGLE_CLIENT_SECRET = [solo en Netlify]
```

---

## Identidad Visual

### Colores (Tema Chat LinkGol)

```css
--primary:      #0052CC      (Azul LinkGol — mensajes enviados)
--primary-dark: #003A99      (Hover de botones)
--primary-light:#E6F0FF      (Fondos suaves)
--secondary:    #F59E0B      (Ámbar — acentos)
--cream:        #faf6f0      (Fondo general)
--cream2:       #f5f0e8      (Cards de otros)
--cream3:       #ede7db      (Bordes)
--text:         #1a1a1a      (Texto principal)
--text2:        rgba(26,26,26,0.6)  (Texto secundario)
--text3:        rgba(26,26,26,0.38) (Texto terciario)
--success:      #10B981      (Estado online)
```

### Tipografía

- **Font:** DM Sans (400, 500, 600, 700)
- **H1:** `clamp(28px, 5vw, 48px)`, bold, letter-spacing -1.5px
- **H2:** `clamp(22px, 4vw, 36px)`, bold
- **P:** 15px, peso 400, line-height 1.6
- **Botones:** 14px, peso 600

### Componentes Base

**Chat Bubbles:**
- **Enviado (Azul):** `background: var(--primary)`, `border-radius: 20px 20px 4px 20px`
- **Recibido (Crema):** `background: var(--cream2)`, `border-radius: 20px 20px 20px 4px`
- **Ver Original:** Botón discreto en los mensajes traducidos
- **Animación:** slideInRight 0.3s ease-out

**Header (Fixed):**
- Altura 56px, background azul, avatar + nombre + estado online
- Glassmorphism subtle (no blur, color sólido)

**Input (Fixed bottom):**
- Textarea autogrow, border azul on focus
- Botón redondo "enviar" en esquina derecha
- Alt+Enter para nueva línea, Enter para enviar

---

## Estructura de Carpetas

```
src/
  styles/
    theme.css              ← Variables CSS + estilos base
  components/
    ChatHeader.jsx         ← Header con usuario
    ChatMessage.jsx        ← Bubble de mensaje
    ChatInput.jsx          ← Input + botón enviar
    TypingIndicator.jsx    ← Puntitos de "escribiendo..."
  App.jsx                  ← Contenedor principal
  main.jsx
  index.css

public/
  logo.svg                 ← Logo LinkGol

index.html                 ← DM Sans + meta tags
vite.config.js
package.json
CLAUDE.md
.gitignore
README.md
```

---

## Componentes Implementados (v1.0)

### ✅ ChatHeader
- Avatar, nombre, estado online
- Fixed top, height 56px, azul

### ✅ ChatMessage
- Bubble con animación
- "Ver original" botón discreto
- Timestamp + badge "Traducido"

### ✅ ChatInput
- Textarea autogrow
- Botón redondo "enviar"
- Shift+Enter = nueva línea, Enter = enviar

### ✅ TypingIndicator
- 3 puntitos pulsantes
- Mostrar cuando el otro escribe

---

## Arquitectura de Datos (Fase 2 — Próxima)

**Tablas esperadas:**

```sql
-- Usuarios (hosts e invitados)
users (id, google_id, nombre, email, idioma, plan, avatar, created_at)

-- Salas (QR compartibles)
salas (id, host_id, nombre, qr_code, idioma_host, created_at)

-- Mensajes (core de LinkGol)
mensajes (
  id, 
  sala_id,
  sender_user_id,
  receiver_user_id,
  texto_original,
  idioma_original,
  traducciones JSONB,  -- { 'es': 'Hola', 'ru': 'Привет', ... }
  created_at
)

-- Sesiones de invitados (sin account)
sesiones_guest (id, sala_id, guest_name, idioma, token_localStorage, created_at)
```

---

## Reglas de Desarrollo

### General
- Español en toda la UI y comentarios
- Mobile-first, responsive siempre
- Usar variables CSS `var(--primary)` en lugar de hardcoding

### React
- Functional components
- Hooks (useState, useEffect, useRef)
- Props drilling es OK para este proyecto (no es complejo)
- Sin Redux (Context si necesario en Fase 2)

### Estilos
- CSS puro (no CSS-in-JS)
- Importar `theme.css` en `main.jsx` o cada componente
- Glassmorphism solo en header (no exceso)
- Transiciones `all 0.2s` por defecto

### Performance
- Chat realtime <300ms (Supabase WebSocket)
- Mensajes renderizados en orden
- Auto-scroll a último mensaje
- Textarea autogrow sin saltos

### Seguridad
- ANTHROPIC_API_KEY NUNCA en frontend (siempre Netlify Functions)
- GOOGLE_CLIENT_SECRET solo en backend
- localStorage para sesión guest (token)
- RLS en Supabase desde Fase 2

---

## Próximas Fases

### Fase 2 — Negocio
- CRUD de usuarios (hosts)
- Salas con QR
- Mensajería real con Supabase Realtime
- Traducciones via Claude API
- Notificaciones (Resend email, Twilio WhatsApp)

### Fase 3 — BI
- Data Warehouse
- 6 tableros de analítica
- Agente Analítico enriquecido

### Fase 4 — Extensión
- Multi-tenant
- Soporte multi-idioma UI
- Mobile app nativa (React Native)

---

## KPIs de Éxito (MVP)

- ✅ Chat funcional entre 2 usuarios
- ✅ Traducción invisible <300ms
- ✅ "Ver original" muestra idioma + texto
- ✅ Mobile-first, responsive
- ✅ Deploy en Netlify URL pública
- ✅ Login con Google
- ✅ Tema LinkGol (azul + ámbar) consistente

---

## Comandos

```bash
# Dev local
npm run dev

# Build
npm run build

# Preview
npm run preview

# Deploy (automático en Netlify al hacer push a main)
git push origin main
```

---

## Contacto & Soporte

- **Proyecto:** LinkGol v1.0
- **Autor:** RANNIX Consulting
- **Email:** support@linkgol.app
- **Docs:** Este archivo + README.md
- **Blog:** metodologia.rannix.com

---

**Última actualización:** 2026-06-27
**Estado:** MVP Chat funcional
**Próximo Hito:** Fase 2 — Negocio (mensajería real + traducciones)
