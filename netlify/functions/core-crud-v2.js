import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ═══════════════════════════════════════════════════════════
// USUARIOS (HOSTS)
// ═══════════════════════════════════════════════════════════

// POST /api/v2/users — Crear host con idioma default
export const createUser = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { google_id, nombre, email, idioma_default = 'es' } = JSON.parse(req.body)

    const { data, error } = await supabase
      .from('users')
      .insert([{ google_id, nombre, email, idioma_default, plan: 'free' }])
      .select()

    if (error) throw error

    return {
      statusCode: 201,
      body: JSON.stringify({
        ...data[0],
        token: generateToken(data[0].id),
        message: '✅ Host creado. Idioma configurado: ' + idioma_default
      })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

// ═══════════════════════════════════════════════════════════
// CONTACTOS (Address Book del Host)
// ═══════════════════════════════════════════════════════════

// POST /api/v2/contacts — Agregar contacto
export const addContact = async (req) => {
  try {
    const { host_id, contact_name, contact_email, contact_phone, contact_photo } = JSON.parse(req.body)

    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        host_id,
        contact_name,
        contact_email,
        contact_phone,
        contact_photo
      }])
      .select()

    if (error) throw error

    return {
      statusCode: 201,
      body: JSON.stringify({ ...data[0], message: '✅ Contacto agregado' })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v2/contacts/:host_id — Listar contactos del host
export const getContacts = async (req, context) => {
  const { host_id } = context.params

  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('host_id', host_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        host_id,
        total: data.length,
        contacts: data
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// ═══════════════════════════════════════════════════════════
// CONVERSACIONES 1:1 (Generadas al invitar)
// ═══════════════════════════════════════════════════════════

// POST /api/v2/conversations — Host invita a alguien
// → Genera conversación 1:1 con QR y Link únicos
export const createConversation = async (req) => {
  try {
    const { host_id, guest_email, guest_name, host_idioma = 'es' } = JSON.parse(req.body)

    // Validar que el host existe y tiene plan pro
    const { data: host } = await supabase
      .from('users')
      .select('plan, idioma_default')
      .eq('id', host_id)
      .single()

    if (!host || host.plan === 'free') {
      throw new Error('Host debe ser pro_$20 para invitar')
    }

    // Generar tokens únicos
    const qr_code = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const link_token = generateToken(host_id + guest_email + Date.now())
    const qr_url = `linkgol.app/conv/${qr_code}`

    // Usar el idioma del host (o el que pasó)
    const finalIdioma = host_idioma || host.idioma_default

    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        host_id,
        guest_email,
        guest_name,
        host_idioma: finalIdioma,
        qr_code,
        qr_url,
        link_token,
        activa: true
      }])
      .select()

    if (error) throw error

    // Agregar a contactos si no existe
    await supabase
      .from('contacts')
      .insert([{
        host_id,
        contact_name: guest_name,
        contact_email: guest_email
      }])
      .eq('host_id', host_id)
      .eq('contact_email', guest_email)

    return {
      statusCode: 201,
      body: JSON.stringify({
        conversation_id: data[0].id,
        qr_code: data[0].qr_code,
        qr_url: data[0].qr_url,
        link: `linkgol.app/i/${link_token}`,
        host_idioma: finalIdioma,
        guest_email,
        guest_name,
        message: '✅ Conversación creada. Invitación lista para compartir.'
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v2/conversations/:host_id — Listar conversaciones del host
export const getConversations = async (req, context) => {
  const { host_id } = context.params

  try {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id, guest_name, guest_email, host_idioma, guest_idioma,
        qr_code, qr_url, link_token, activa, created_at,
        messages (count)
      `)
      .eq('host_id', host_id)
      .eq('activa', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        host_id,
        total: data.length,
        conversations: data.map(c => ({
          ...c,
          message_count: c.messages[0]?.count || 0
        }))
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v2/conversations/join/:link_token — Guest abre link de invitación
export const joinConversation = async (req, context) => {
  const { link_token } = context.params

  try {
    const { data: conv, error } = await supabase
      .from('conversations')
      .select('id, host_id, guest_name, host_idioma, qr_url')
      .eq('link_token', link_token)
      .eq('activa', true)
      .single()

    if (error) throw error
    if (!conv) throw new Error('Conversación no existe o expiró')

    return {
      statusCode: 200,
      body: JSON.stringify({
        conversation_id: conv.id,
        host_id: conv.host_id,
        guest_name: conv.guest_name,
        host_idioma: conv.host_idioma,
        message: '✅ Invitación válida. Elige tu idioma para entrar.'
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// ═══════════════════════════════════════════════════════════
// MENSAJES (Solo para conversaciones 1:1)
// ═══════════════════════════════════════════════════════════

// POST /api/v2/messages — Enviar mensaje en una conversación
export const createMessage = async (req) => {
  try {
    const {
      conversation_id,
      sender_id,           // Si es host
      sender_guest_id,     // Si es guest
      sender_nombre,
      texto_original,
      idioma_original
    } = JSON.parse(req.body)

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id,
        sender_id,
        sender_guest_id,
        sender_nombre,
        texto_original,
        idioma_original,
        leido: false
      }])
      .select()

    if (error) throw error

    // Trigger: Auto-traducir a la otra persona
    // (En producción: enqueue a Netlify Function)

    return {
      statusCode: 201,
      body: JSON.stringify({
        ...data[0],
        message: '✅ Mensaje enviado'
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v2/messages/:conversation_id — Historial de conversación 1:1
export const getMessages = async (req, context) => {
  const { conversation_id } = context.params

  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, sender_nombre, texto_original, idioma_original, leido, created_at,
        translations (id, idioma_destino, texto_traducido)
      `)
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        conversation_id,
        message_count: data.length,
        messages: data.map(m => ({
          ...m,
          traducciones: m.translations.reduce((acc, t) => ({
            ...acc,
            [t.idioma_destino]: t.texto_traducido
          }), {})
        }))
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// ═══════════════════════════════════════════════════════════
// GUEST SESSIONS (Sin account)
// ═══════════════════════════════════════════════════════════

// POST /api/v2/guests/enter — Guest entra a conversación
export const enterConversation = async (req) => {
  try {
    const { conversation_id, guest_name, idioma } = JSON.parse(req.body)

    const token = generateToken(conversation_id + guest_name + Date.now())

    const { data, error } = await supabase
      .from('guest_sessions')
      .insert([{
        conversation_id,
        guest_name,
        idioma,
        token
      }])
      .select()

    if (error) throw error

    // Actualizar conversation con guest_idioma
    await supabase
      .from('conversations')
      .update({ guest_idioma: idioma })
      .eq('id', conversation_id)

    return {
      statusCode: 201,
      body: JSON.stringify({
        session_id: data[0].id,
        token,
        guest_name,
        idioma,
        message: '✅ Sesión creada. Token guardado en localStorage.'
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// Utilities
function generateToken(seed) {
  return Buffer.from(seed + Date.now()).toString('base64').substring(0, 32)
}

export const handler = async (event, context) => {
  const path = event.path.split('/')
  const method = event.httpMethod

  // v2 routing
  if (path.includes('users') && method === 'POST') return createUser(event)
  if (path.includes('contacts') && method === 'POST') return addContact(event)
  if (path.includes('contacts') && method === 'GET') return getContacts(event, context)
  if (path.includes('conversations') && method === 'POST') return createConversation(event)
  if (path.includes('conversations') && method === 'GET') {
    if (path.includes('join')) return joinConversation(event, context)
    return getConversations(event, context)
  }
  if (path.includes('messages') && method === 'POST') return createMessage(event)
  if (path.includes('messages') && method === 'GET') return getMessages(event, context)
  if (path.includes('guests') && method === 'POST') return enterConversation(event)

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}
