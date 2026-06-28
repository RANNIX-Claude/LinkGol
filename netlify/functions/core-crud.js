import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/v1/users — Crear host
export const createUser = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { google_id, nombre, email, idioma_preferido = 'es' } = JSON.parse(req.body)

    const { data, error } = await supabase
      .from('users')
      .insert([{ google_id, nombre, email, idioma_preferido, plan: 'free' }])
      .select()

    if (error) throw error

    return {
      statusCode: 201,
      body: JSON.stringify({ ...data[0], token: generateToken(data[0].id) })
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v1/users/:id — Obtener perfil
export const getUser = async (req, context) => {
  const { id } = context.params

  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, nombre, email, idioma_preferido, plan,
        rooms (count),
        messages (count)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...data,
        salas_count: data.rooms[0]?.count || 0,
        mensajes_count: data.messages[0]?.count || 0
      })
    }
  } catch (err) {
    return { statusCode: 404, body: JSON.stringify({ error: 'User not found' }) }
  }
}

// PUT /api/v1/users/:id — Actualizar plan
export const updateUserPlan = async (req, context) => {
  const { id } = context.params

  try {
    const { plan, stripe_customer_id } = JSON.parse(req.body)

    const { error } = await supabase
      .from('users')
      .update({ plan, stripe_customer_id })
      .eq('id', id)

    if (error) throw error

    return { statusCode: 200, body: JSON.stringify({ updated: true }) }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/rooms — Host crea sala
export const createRoom = async (req) => {
  try {
    const { host_id, nombre, idioma_host } = JSON.parse(req.body)
    const qr_code = `QR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const qr_url = `linkgol.app/u/@${host_id.substring(0, 8)}/sala-${qr_code}`

    const { data, error } = await supabase
      .from('rooms')
      .insert([{ host_id, nombre, qr_code, qr_url, idioma_host, activa: true }])
      .select()

    if (error) throw error

    return {
      statusCode: 201,
      body: JSON.stringify({ ...data[0] })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v1/rooms/:host_id — Listar salas del host
export const getRooms = async (req, context) => {
  const { host_id } = context.params

  try {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        id, nombre, qr_code, qr_url, idioma_host, activa, created_at,
        guest_sessions (count),
        messages (count)
      `)
      .eq('host_id', host_id)
      .eq('activa', true)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(
        data.map(r => ({
          ...r,
          guests_count: r.guest_sessions[0]?.count || 0,
          messages_count: r.messages[0]?.count || 0
        }))
      )
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/messages — Enviar mensaje
export const createMessage = async (req) => {
  try {
    const { room_id, sender_id, sender_nombre, texto_original, idioma_original } = JSON.parse(req.body)

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        room_id,
        sender_id,
        sender_nombre,
        texto_original,
        idioma_original,
        leido: false
      }])
      .select()

    if (error) throw error

    // Trigger auto-translation via Netlify Function (enqueue job)
    // En producción: enviar a queue o llamar función directa

    return {
      statusCode: 201,
      body: JSON.stringify({ ...data[0], translated_to: [] })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// GET /api/v1/messages/:room_id — Historial de mensajes
export const getMessages = async (req, context) => {
  const { room_id } = context.params
  const limit = parseInt(req.queryStringParameters?.limit || '50')
  const offset = parseInt(req.queryStringParameters?.offset || '0')

  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, sender_nombre, texto_original, idioma_original, leido, created_at,
        translations (id, idioma_destino, texto_traducido)
      `)
      .eq('room_id', room_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify(data.map(m => ({
        ...m,
        traducciones: m.translations.reduce((acc, t) => ({ ...acc, [t.idioma_destino]: t.texto_traducido }), {})
      })))
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/guests/join — Guest entra a sala
export const joinGuestSession = async (req) => {
  try {
    const { room_id, nombre, idioma } = JSON.parse(req.body)
    const token = generateToken(room_id + nombre)

    const { data, error } = await supabase
      .from('guest_sessions')
      .insert([{ room_id, nombre, idioma, token }])
      .select()

    if (error) throw error

    // Obtener info de la sala
    const { data: room } = await supabase
      .from('rooms')
      .select('nombre, host_id')
      .eq('id', room_id)
      .single()

    return {
      statusCode: 201,
      body: JSON.stringify({
        guest_id: data[0].id,
        token,
        room_name: room?.nombre,
        messages_count: 0
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// Utilidad
function generateToken(seed) {
  return Buffer.from(seed + Date.now()).toString('base64').substring(0, 32)
}

export const handler = async (event, context) => {
  const path = event.path.split('/')
  const method = event.httpMethod

  // Routing simple
  if (path.includes('users') && method === 'POST') return createUser(event)
  if (path.includes('users') && path.includes('profile') && method === 'GET') return getUser(event, context)
  if (path.includes('rooms') && method === 'POST') return createRoom(event)
  if (path.includes('rooms') && method === 'GET') return getRooms(event, context)
  if (path.includes('messages') && method === 'POST') return createMessage(event)
  if (path.includes('messages') && method === 'GET') return getMessages(event, context)
  if (path.includes('guests') && path.includes('join') && method === 'POST') return joinGuestSession(event)

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}
