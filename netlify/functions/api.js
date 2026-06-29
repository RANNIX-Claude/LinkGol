/**
 * API Router for LinkN.click
 * Consolida todos los endpoints en una sola función
 * Invocación: /.netlify/functions/api
 */

const { createClient } = require('@supabase/supabase-js')
const Anthropic = require('@anthropic-ai/sdk')
const crypto = require('crypto')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const client = new Anthropic.default()

/**
 * Handler principal
 */
exports.handler = async (event, context) => {
  const { httpMethod, path, body: rawBody, headers } = event

  console.log(`[${new Date().toISOString()}] ${httpMethod} ${path}`)

  try {
    const body = rawBody ? JSON.parse(rawBody) : {}

    // ============================================================
    // AUTHENTICATION API
    // ============================================================

    if (path.includes('/auth/signup') && httpMethod === 'POST') {
      return await auth_signup(body)
    }

    // ============================================================
    // INVITATIONS API
    // ============================================================

    if (path.includes('/invitations') && !path.includes('/accept')) {
      if (httpMethod === 'POST') {
        return await crear_invitacion(body)
      }
      if (httpMethod === 'GET') {
        const remitente_id = path.split('/').slice(-1)[0]
        return await listar_invitaciones(remitente_id)
      }
    }

    if (path.includes('/invitations') && path.includes('/accept')) {
      if (httpMethod === 'POST') {
        return await aceptar_invitacion(body, headers)
      }
    }

    if (path.includes('/analytics')) {
      const remitente_id = path.split('/')[path.split('/').length - 2]
      return await analytics_invitaciones(remitente_id)
    }

    // ============================================================
    // TRANSLATION API
    // ============================================================

    if (path.includes('/translate') && !path.includes('/batch')) {
      if (httpMethod === 'POST') {
        return await traducir_texto(body)
      }
    }

    if (path.includes('/translate-batch')) {
      if (httpMethod === 'POST') {
        return await traducir_batch(body)
      }
    }

    if (path.includes('/detect-language')) {
      if (httpMethod === 'POST') {
        return await detectar_idioma(body)
      }
    }

    if (path.includes('/analyze-intention')) {
      if (httpMethod === 'POST') {
        return await analizar_intencion(body)
      }
    }

    if (path.includes('/suggest-reply')) {
      if (httpMethod === 'POST') {
        return await generar_respuesta_sugerida(body)
      }
    }

    if (path.includes('/lead-score')) {
      if (httpMethod === 'POST') {
        return await calcular_lead_score(body)
      }
    }

    // ============================================================
    // MESSAGES API
    // ============================================================

    if (path.includes('/messages') || path.includes('/mensajes')) {
      if (httpMethod === 'POST') {
        return await enviar_mensaje(body)
      }
      if (httpMethod === 'GET') {
        const conversacion_id = path.split('/').slice(-1)[0]
        return await obtener_mensajes(conversacion_id)
      }
    }

    // ============================================================
    // CONVERSATIONS API (PHASE 7)
    // ============================================================

    if (path.includes('/conversaciones')) {
      if (httpMethod === 'GET') {
        const usuario_id = path.split('/').slice(-1)[0]
        return await obtener_conversaciones(usuario_id)
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Endpoint not found' })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}

// ============================================================
// INVITATIONS FUNCTIONS
// ============================================================

async function crear_invitacion(body) {
  try {
    const { remitente_id, link_id, receptor_nombre, receptor_email, receptor_idioma, primer_mensaje, canal_compartida = 'DIRECT_LINK' } = body

    if (!remitente_id || !primer_mensaje) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos' }) }
    }

    const token_aceptacion = crypto.randomBytes(32).toString('hex')

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('nombre, apellido')
      .eq('id', remitente_id)
      .single()

    const remitente_nombre = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Contacto'

    const { data, error } = await supabase
      .from('invitaciones')
      .insert([{
        link_id: link_id || null,
        remitente_id,
        remitente_nombre,
        receptor_nombre,
        receptor_email,
        receptor_idioma,
        primer_mensaje,
        token_aceptacion,
        canal_compartida,
        aceptada: false,
        expira_en: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    const baseUrl = process.env.SITE_URL || 'https://linkn.click'
    const url = `${baseUrl}/invitacion/${token_aceptacion}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

    const mensaje = `${remitente_nombre} te invita a conversar en LinkN.click\n\n"${primer_mensaje}"\n\n${url}`

    return {
      statusCode: 201,
      body: JSON.stringify({
        invitacion_id: data.id,
        token_aceptacion,
        url,
        qr_code_url: qrUrl,
        compartir_url: {
          whatsapp: `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          email: `mailto:?subject=Te invitan a ${remitente_nombre}&body=${encodeURIComponent(mensaje)}`,
          copy: url
        },
        mensaje
      })
    }
  } catch (error) {
    console.error('crear_invitacion error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

async function aceptar_invitacion(body, headers) {
  try {
    const { token, idioma_seleccionado } = body
    const ipOrigen = headers['x-forwarded-for'] || 'unknown'
    const userAgent = headers['user-agent'] || 'unknown'

    if (!token || !idioma_seleccionado) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos' }) }
    }

    const { data: invitacion, error: invError } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('token_aceptacion', token)
      .single()

    if (invError || !invitacion) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Invitación no encontrada' }) }
    }

    if (invitacion.aceptada) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Ya fue aceptada' }) }
    }

    if (new Date(invitacion.expira_en) < new Date()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Ha expirado' }) }
    }

    // Crear usuario anónimo
    const nip = Math.floor(1000 + Math.random() * 9000).toString()
    const { data: nuevoUsuario, error: userError } = await supabase
      .from('usuarios')
      .insert([{
        nip_4_digitos: nip,
        idioma_preferido: idioma_seleccionado,
        tipo_usuario: 'guest',
        nombre: `Guest-${nip}`
      }])
      .select()
      .single()

    if (userError) throw userError

    // Crear conversación
    const { data: conversacion, error: convError } = await supabase
      .from('conversaciones')
      .insert([{
        link_id: invitacion.link_id,
        participante_1: invitacion.remitente_id,
        participante_2: nuevoUsuario.id,
        participante_2_nip: nip,
        idioma_p1: invitacion.receptor_idioma || 'es',
        idioma_p2: idioma_seleccionado,
        estado: 'activa'
      }])
      .select()
      .single()

    if (convError) throw convError

    // Crear primer mensaje
    const mensajeTraducido = await traducir_mensaje(invitacion.primer_mensaje, invitacion.receptor_idioma || 'es', idioma_seleccionado)

    const { data: mensaje, error: msgError } = await supabase
      .from('mensajes')
      .insert([{
        conversacion_id: conversacion.id,
        sender_id: invitacion.remitente_id,
        tipo_mensaje: 'TEXT',
        texto_original: invitacion.primer_mensaje,
        idioma_original: invitacion.receptor_idioma || 'es',
        traducciones: JSON.stringify({
          [invitacion.receptor_idioma || 'es']: invitacion.primer_mensaje,
          [idioma_seleccionado]: mensajeTraducido
        }),
        es_traducido: idioma_seleccionado !== (invitacion.receptor_idioma || 'es'),
        es_primer_mensaje_automatico: true,
        invitacion_id: invitacion.id
      }])
      .select()
      .single()

    if (msgError) throw msgError

    // Actualizar invitación
    await supabase
      .from('invitaciones')
      .update({ aceptada: true, aceptada_en: new Date().toISOString() })
      .eq('id', invitacion.id)

    // Auditoría
    await supabase
      .from('acceptances')
      .insert([{
        invitacion_id: invitacion.id,
        usuario_id: nuevoUsuario.id,
        nip_4_digitos: nip,
        ip_origen: ipOrigen,
        user_agent: userAgent
      }])

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        usuario: { id: nuevoUsuario.id, nip_4_digitos: nip, idioma: idioma_seleccionado },
        conversacion_id: conversacion.id,
        primer_mensaje: {
          id: mensaje.id,
          texto_original: mensaje.texto_original,
          texto_usuario: mensajeTraducido,
          remitente: invitacion.remitente_nombre
        }
      })
    }
  } catch (error) {
    console.error('aceptar_invitacion error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

async function listar_invitaciones(remitente_id) {
  try {
    const { data, error } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('remitente_id', remitente_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({ total: data.length, invitaciones: data })
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

async function analytics_invitaciones(remitente_id) {
  try {
    const { data, error } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('remitente_id', remitente_id)

    if (error) throw error

    const total = data.length
    const aceptadas = data.filter((i) => i.aceptada).length

    return {
      statusCode: 200,
      body: JSON.stringify({
        total_enviadas: total,
        total_aceptadas: aceptadas,
        tasa_aceptacion: total > 0 ? ((aceptadas / total) * 100).toFixed(1) + '%' : '0%'
      })
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

// ============================================================
// TRANSLATION FUNCTIONS
// ============================================================

async function traducir_mensaje(texto, idiomaOrigen, idiomaDestino) {
  if (idiomaOrigen === idiomaDestino) return texto

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Traduce esto de ${idiomaOrigen} a ${idiomaDestino}. Solo la traducción, sin explicaciones:\n\n"${texto}"`
      }]
    })

    return message.content[0].text.trim()
  } catch (error) {
    console.error('Translation error:', error)
    return texto
  }
}

async function traducir_texto(body) {
  const { texto, idiomaOrigen, idiomaDestino } = body

  if (!texto || !idiomaOrigen || !idiomaDestino) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos' }) }
  }

  const traduccion = await traducir_mensaje(texto, idiomaOrigen, idiomaDestino)

  return {
    statusCode: 200,
    body: JSON.stringify({
      texto_original: texto,
      idioma_origen: idiomaOrigen,
      idioma_destino: idiomaDestino,
      traduccion
    })
  }
}

async function traducir_batch(body) {
  const { texto, idiomaOrigen, idiomasDestino = ['es', 'en', 'pt'] } = body

  if (!texto || !idiomaOrigen) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos' }) }
  }

  const traducciones = { [idiomaOrigen]: texto }

  for (const idioma of idiomasDestino) {
    if (idioma !== idiomaOrigen) {
      traducciones[idioma] = await traducir_mensaje(texto, idiomaOrigen, idioma)
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ texto_original: texto, idioma_origen: idiomaOrigen, traducciones })
  }
}

async function detectar_idioma(body) {
  const { texto } = body

  if (!texto) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campo requerido: texto' }) }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: `¿Qué idioma? (es|en|pt|fr|de|it|ru|zh|ja|ko) Solo el código:\n\n"${texto}"`
      }]
    })

    const codigo = message.content[0].text.trim().toLowerCase()
    return { statusCode: 200, body: JSON.stringify({ texto, idioma_detectado: codigo }) }
  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ texto, idioma_detectado: 'es' }) }
  }
}

async function analizar_intencion(body) {
  const { texto, contexto = 'general' } = body

  if (!texto) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campo requerido: texto' }) }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analiza: {"intención":"...","sentimiento":"positivo|neutral|negativo"}\n\n"${texto}"`
      }]
    })

    try {
      return { statusCode: 200, body: JSON.stringify(JSON.parse(message.content[0].text)) }
    } catch {
      return { statusCode: 200, body: JSON.stringify({ intención: 'consulta', sentimiento: 'neutral' }) }
    }
  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ intención: 'desconocida', sentimiento: 'neutral' }) }
  }
}

async function generar_respuesta_sugerida(body) {
  const { textoOriginal, idiomaContacto, contexto = 'general' } = body

  if (!textoOriginal || !idiomaContacto) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos' }) }
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Sugiere respuesta breve (2 líneas máximo) en ${idiomaContacto} para: "${textoOriginal}"`
      }]
    })

    return { statusCode: 200, body: JSON.stringify({ respuesta_sugerida: message.content[0].text.trim() }) }
  } catch (error) {
    return { statusCode: 200, body: JSON.stringify({ respuesta_sugerida: null }) }
  }
}

async function calcular_lead_score(body) {
  const { conversacion, contexto = 'venta_autos' } = body

  if (!conversacion || !Array.isArray(conversacion)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Campo requerido: conversacion' }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ contexto, lead_score: { score: 50, razón: 'Análisis simulado' } })
  }
}

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

async function auth_signup(body) {
  try {
    const { email, password, nombre, apellido, idioma } = body

    // Validate required fields
    if (!email || !password || !nombre || !idioma) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos: email, password, nombre, idioma' }) }
    }

    // Generate NIP (4-digit number)
    const nip = Math.floor(1000 + Math.random() * 9000).toString()

    // Create user in Supabase
    const { data: user, error: dbError } = await supabase
      .from('usuarios')
      .insert([
        {
          email,
          nombre,
          apellido: apellido || null,
          idioma_preferido: idioma,
          nip_4_digitos: nip,
          tipo_usuario: 'host'
        }
      ])
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return { statusCode: 400, body: JSON.stringify({ error: dbError.message || 'Error creating user' }) }
    }

    // Generate token for session
    const token = crypto.randomBytes(32).toString('hex')

    return {
      statusCode: 201,
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        idioma: user.idioma_preferido,
        nip_4_digitos: user.nip_4_digitos,
        token
      })
    }
  } catch (error) {
    console.error('auth_signup error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

// ============================================================
// MESSAGES FUNCTIONS
// ============================================================

async function enviar_mensaje(body) {
  try {
    const { conversacion_id, sender_id, sender_nombre, texto_original, idioma_original } = body

    if (!conversacion_id || !sender_id || !texto_original || !idioma_original) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Campos requeridos' }) }
    }

    // Get conversation to find recipient and their language
    const { data: conversacion, error: convError } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('id', conversacion_id)
      .single()

    if (convError || !conversacion) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Conversación no encontrada' }) }
    }

    // Determine recipient and target language
    const receptor_id = conversacion.participante_1 === sender_id ? conversacion.participante_2 : conversacion.participante_1
    const idioma_receptor = conversacion.participante_1 === sender_id ? conversacion.idioma_p2 : conversacion.idioma_p1

    // Translate message to recipient's language
    const texto_traducido = await traducir_mensaje(texto_original, idioma_original, idioma_receptor)

    // Store message with both versions
    const { data: mensaje, error: msgError } = await supabase
      .from('mensajes')
      .insert([{
        conversacion_id,
        sender_id,
        sender_nombre,
        tipo_mensaje: 'TEXT',
        texto_original,
        idioma_original,
        traducciones: JSON.stringify({
          [idioma_original]: texto_original,
          [idioma_receptor]: texto_traducido
        }),
        es_traducido: idioma_original !== idioma_receptor
      }])
      .select()
      .single()

    if (msgError) throw msgError

    return {
      statusCode: 201,
      body: JSON.stringify({
        id: mensaje.id,
        sender_id: mensaje.sender_id,
        sender_nombre: mensaje.sender_nombre,
        texto_original: mensaje.texto_original,
        idioma_original: mensaje.idioma_original,
        traducciones: JSON.parse(mensaje.traducciones),
        es_traducido: mensaje.es_traducido,
        timestamp: mensaje.created_at
      })
    }
  } catch (error) {
    console.error('enviar_mensaje error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

async function obtener_mensajes(conversacion_id) {
  try {
    const { data: mensajes, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacion_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        total: mensajes.length,
        mensajes: mensajes.map(m => ({
          id: m.id,
          sender_id: m.sender_id,
          sender_nombre: m.sender_nombre,
          texto_original: m.texto_original,
          idioma_original: m.idioma_original,
          traducciones: typeof m.traducciones === 'string' ? JSON.parse(m.traducciones) : m.traducciones,
          es_traducido: m.es_traducido,
          timestamp: m.created_at
        }))
      })
    }
  } catch (error) {
    console.error('obtener_mensajes error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

// ============================================================
// CONVERSATIONS FUNCTIONS (PHASE 7 - PERSISTENT CONTACTS)
// ============================================================

async function obtener_conversaciones(usuario_id) {
  try {
    const { data: conversaciones, error } = await supabase
      .from('conversaciones')
      .select(`
        id,
        participante_1,
        participante_2,
        idioma_p1,
        idioma_p2,
        estado,
        created_at,
        updated_at
      `)
      .or(`participante_1.eq.${usuario_id},participante_2.eq.${usuario_id}`)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Enrich with last message and other user info
    const enriched = await Promise.all(
      conversaciones.map(async (conv) => {
        const otro_usuario_id = conv.participante_1 === usuario_id ? conv.participante_2 : conv.participante_1

        // Get last message
        const { data: lastMsg } = await supabase
          .from('mensajes')
          .select('texto_original')
          .eq('conversacion_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get other user info
        const { data: otroUsuario } = await supabase
          .from('usuarios')
          .select('nombre, nip_4_digitos')
          .eq('id', otro_usuario_id)
          .single()

        return {
          id: conv.id,
          otro_usuario_id,
          otro_usuario_nombre: otroUsuario?.nombre || `Usuario ${otroUsuario?.nip_4_digitos}`,
          ultimo_mensaje: lastMsg?.texto_original || null,
          idioma_p1: conv.idioma_p1,
          idioma_p2: conv.idioma_p2,
          estado: conv.estado,
          created_at: conv.created_at,
          updated_at: conv.updated_at
        }
      })
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        total: enriched.length,
        conversaciones: enriched
      })
    }
  } catch (error) {
    console.error('obtener_conversaciones error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}
