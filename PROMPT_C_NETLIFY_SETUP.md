# LinkN.click — PROMPT C Setup en Netlify

**Estado:** Código pusheado a GitHub ✅  
**Próximo paso:** Configurar variables de entorno en Netlify Panel  

---

## ✅ Lo que ya está hecho

```
GitHub: RANNIX-Claude/LinkGol/main
├── netlify/functions/linkn-invitations.js ✅
├── netlify/functions/linkn-translator.js ✅
├── src/components/AudioRecorder.jsx ✅
├── migrations/002_create_invitations_tables.sql ✅
└── PROMPT_C_BACKEND_REALTIME.md ✅

netlify.toml configurado ✅
```

---

## ❌ Lo que falta para que funcione en Netlify

### 1. **Crear variables de entorno en Netlify Site**

Ir a: **Netlify Dashboard → Site Settings → Build & Deploy → Environment**

Agregar estas variables:

```
SUPABASE_URL                = https://xeypxgwbhpvxifiwmztk.supabase.co
SUPABASE_KEY                = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhleXB4Z3diaHB2eGlmaXdtenRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MTUyMjUsImV4cCI6MjA5ODE5MTIyNX0.BBv9ikI1qeZ8U1_smXPppyNH-EIGpwotrX-THbWttIo
SUPABASE_SERVICE_ROLE_KEY   = [OBTENER DE SUPABASE SETTINGS]
ANTHROPIC_API_KEY           = sk-ant-[OBTENER DE ANTHROPIC CONSOLE]
SITE_URL                    = https://linkn.click (o tu URL de Netlify)
```

**Dónde obtener:**

- **SUPABASE_SERVICE_ROLE_KEY:**
  - Ir a: Supabase Dashboard → Settings → API
  - Copiar "Service Role key" (⚠️ SECRETO)

- **ANTHROPIC_API_KEY:**
  - Ir a: https://console.anthropic.com/
  - Crear API key nueva
  - Copiar el valor

### 2. **Instalar dependencias en package.json**

Verificar que esté en `package.json`:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "@anthropic-ai/sdk": "^0.20.0"
  },
  "devDependencies": {
    "netlify-cli": "^17.0.0"
  }
}
```

Si faltan, agregarlas:

```bash
npm install @supabase/supabase-js @anthropic-ai/sdk
npm install --save-dev netlify-cli
```

### 3. **Ejecutar migración SQL en Supabase**

Ir a: **Supabase Dashboard → SQL Editor → New Query**

Copiar contenido de: `migrations/002_create_invitations_tables.sql`

Pegar en Supabase y ejecutar (**IMPORTANTE: ejecutar todo de una vez**)

**Verificación:**
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('invitaciones', 'acceptances');
```

Debería retornar:
```
invitaciones
acceptances
```

### 4. **Verificar Realtime en Supabase**

Ir a: **Supabase Dashboard → Database → Tables**

Para cada tabla:
- `conversaciones`
- `mensajes`
- `usuarios`

Seleccionar → **Enable Realtime** (si no está habilitado)

---

## 🚀 Deployment Status

### Current

```
GitHub push:       ✅ Done (fbb08be)
Netlify detected:  ⏳ Pending (refresh site)
Build:             ⏳ Pending (needs env vars)
Functions:         ⏳ Pending
```

### Próximos pasos en orden

```
1️⃣ Configurar env vars en Netlify
   → Netlify detecta cambios
   → Inicia build automático
   → ~2-3 minutos

2️⃣ Verificar build log en Netlify
   → Dashboard → Deploys → Latest
   → Si error: verificar log

3️⃣ Ejecutar migración SQL
   → Supabase → SQL Editor
   → Paste + Execute

4️⃣ Enable Realtime
   → Supabase → Tables
   → Checkbox "Realtime"

5️⃣ Test endpoints
   curl -X POST https://[sitio].netlify.app/api/v2/invitations \
     -H "Content-Type: application/json" \
     -d '{"remitente_id":"...", "primer_mensaje":"..."}'
```

---

## 📋 Checklist Deploy

- [ ] Variables de entorno en Netlify configuradas
- [ ] `ANTHROPIC_API_KEY` agregada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` agregada
- [ ] Build completado sin errores (revisar Netlify log)
- [ ] Migración SQL ejecutada en Supabase
- [ ] Realtime habilitado en tablas
- [ ] Test: POST /api/v2/invitations retorna 201
- [ ] Test: POST /api/v2/translate retorna traducción
- [ ] Test: GET /api/v2/invitations/{id}/analytics retorna datos

---

## 🔍 Debugging

### Si el build falla en Netlify

**Ir a:** Netlify Dashboard → Deploys → Latest → Deploy Log

**Errores comunes:**

1. **`Cannot find module '@supabase/supabase-js'`**
   - Solución: `npm install @supabase/supabase-js`
   - Commit y push

2. **`SUPABASE_URL is not defined`**
   - Solución: Agregar en Netlify → Site Settings → Environment variables
   - Esperar nuevo build

3. **`ANTHROPIC_API_KEY is not defined`**
   - Solución: Agregar en Netlify → Site Settings → Environment variables
   - Esperar nuevo build

### Si endpoint retorna 500

**En Netlify logs:**
1. Dashboard → Functions → linkn-invitations
2. Ver últimas invocaciones
3. Expandir error
4. Verificar:
   - ¿Token válido?
   - ¿SUPABASE_URL correcto?
   - ¿BD accesible?

---

## 📞 Referencia Rápida

**URL de la función:**
```
POST https://[your-netlify-site].netlify.app/api/v2/invitations
```

**Testing local:**
```bash
netlify dev
# Abre http://localhost:3000 en navegador
# Las funciones corren en http://localhost:9999/.netlify/functions/
```

**Ver logs en tiempo real:**
```bash
netlify watch
```

---

## ✅ Próximas pruebas una vez deployado

### 1. Test de Invitación

```bash
curl -X POST https://[site].netlify.app/api/v2/invitations \
  -H "Content-Type: application/json" \
  -d '{
    "remitente_id": "user-123",
    "receptor_nombre": "Juan",
    "primer_mensaje": "Hola, tengo un auto",
    "canal_compartida": "WHATSAPP"
  }'

# Respuesta esperada:
{
  "invitacion_id": "inv-...",
  "token_aceptacion": "abc123...",
  "url": "https://linkn.click/invitacion/abc123...",
  "qr_code_url": "https://api.qrserver.com/...",
  "compartir_url": { ... }
}
```

### 2. Test de Traducción

```bash
curl -X POST https://[site].netlify.app/api/v2/translate \
  -H "Content-Type: application/json" \
  -d '{
    "texto": "Hola mundo",
    "idiomaOrigen": "es",
    "idiomaDestino": "en"
  }'

# Respuesta esperada:
{
  "texto_original": "Hola mundo",
  "idioma_origen": "es",
  "idioma_destino": "en",
  "traduccion": "Hello world"
}
```

### 3. Test de Analytics

```bash
curl https://[site].netlify.app/api/v2/invitations/user-123/analytics

# Respuesta esperada:
{
  "total_enviadas": 10,
  "total_aceptadas": 6,
  "tasa_aceptacion": "60.0%",
  "por_canal": { ... },
  "promedio_tiempo_aceptacion": 240
}
```

---

## 🎯 Resumen

**En Netlify AHORA:**
- Código: ✅ Pusheado
- Build: ⏳ Requiere env vars
- Functions: ⏳ Requiere env vars
- Database: ⏳ Requiere migración SQL

**Próximos 15 minutos:**
1. Ir a Netlify Site Settings
2. Agregar 4 env vars
3. Esperar build (2-3 min)
4. Ir a Supabase → SQL Editor
5. Ejecutar migración
6. Test endpoint

---

**Created:** 2026-06-28  
**Status:** Ready for manual Netlify setup  
**Next:** Deploy endpoints + test  

