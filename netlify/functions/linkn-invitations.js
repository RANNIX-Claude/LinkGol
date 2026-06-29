/**
 * LinkN.click — Invitations API
 * Endpoints para crear, aceptar y listar invitaciones
 * Stack: Netlify Functions + Supabase + Claude API
 */

const { createClient } = require('@supabase/supabase-js')
const crypto = require('crypto')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

const CONTEXTOS = {
  venta_autos: { nombre: '🚗 Venta de Autos', default: 'Hola, tengo un auto para ti' },
  renta_inmueble: { nombre: '🏠 Renta de Inmueble', default: 'Hola, te quiero mostrar este inmueble' },
  networking: { nombre: '👔 Networking Profesional', default: 'Hola, fue un placer conocerte' },
  cita_informal: { nombre: '😊 Cita Informal', default: 'Hola, me gustaría seguir platicando' },
  soporte_tecnico: { nombre: '🔧 Soporte Técnico', default: 'Hola, estoy aquí para ayudarte' },
  comercio: { nombre: '🛍️ Comercio General', default: 'Hola, tengo esto para ti' },
  turismo: { nombre: '✈️ Turismo', default: 'Hola, te ayudaré con tu viaje' }
}

/**
 * POST /api/v2/invitations
 * Crear una nueva invitación
 */
async function crear_invitacion(req) {
  try {
    const {
      remitente_id,
      link_id,
      receptor_nombre,
      receptor_email,
      receptor_idioma,
      primer_mensaje,
      canal_compartida = 'DIRECT_LINK',
      idiomas_permitidos = ['es']
    } = req.body

    // Validar campos
    if (!remitente_id || !primer_mensaje) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Campos requeridos: remitente_id, primer_mensaje' })
      }
    }

    // Generar token único
    const token_aceptacion = crypto.randomBytes(32).toString('hex')

    // Obtener nombre del remitente
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('nombre, apellido')
      .eq('id', remitente_id)
      .single()

    const remitente_nombre = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Contacto'

    // Crear invitación
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

    // Generar URLs
    const baseUrl = process.env.SITE_URL || 'https://linkn.click'
    const url = `${baseUrl}/invitacion/${token_aceptacion}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`

    // URLs de compartir
    const mensaje = `${remitente_nombre} te invita a conversar en LinkN.click\n\n"${primer_mensaje}"\n\n${url}`
    const compartir_url = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(mensaje)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=Te invitan a ${remitente_nombre}&body=${encodeURIComponent(mensaje)}`,
      copy: url
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        invitacion_id: data.id,
        token_aceptacion,
        url,
        qr_code_url: qrUrl,
        compartir_url,
        mensaje
      })
    }
  } catch (error) {
    console.error('crear_invitacion error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

/**
 * POST /api/v2/invitations/{token}/accept
 * Aceptar una invitación (receptor)
 */
async function aceptar_invitacion(req) {
  try {
    const { token, idioma_seleccionado } = req.body
    const ipOrigen = req.headers['x-forwarded-for'] || 'unknown'
    const userAgent = req.headers['user-agent'] || 'unknown'

    if (!token || !idioma_seleccionado) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Campos requeridos: token, idioma_seleccionado' })
      }
    }

    // Validar invitación
    const { data: invitacion, error: invError } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('token_aceptacion', token)
      .single()

    if (invError || !invitacion) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Invitación no encontrada' })
      }
    }

    // Validar que no esté aceptada
    if (invitacion.aceptada) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Esta invitación ya fue aceptada' })
      }
    }

    // Validar que no esté expirada
    if (new Date(invitacion.expira_en) < new Date()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Esta invitación ha expirado' })
      }
    }

    // 1. Crear usuario anónimo
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

    // 2. Crear conversación
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

    // 3. Crear primer mensaje automático (traducido)
    const mensajeTraducido = await traducirMensaje(
      invitacion.primer_mensaje,
      invitacion.receptor_idioma || 'es',
      idioma_seleccionado
    )

    const { data: mensaje, error: msgError } = await supabase
      .from('mensajes')
      .insert([{
        conversacion_id: conversacion.id,
        sender_id: invitacion.remitente_id,
        sender_nip: null,
        tipo_mensaje: 'TEXT',
        texto_original: invitacion.primer_mensaje,
        idioma_original: invitacion.receptor_idioma || 'es',
        traducciones: JSON.stringify({
          [invitacion.receptor_idioma || 'es']: invitacion.primer_mensaje,
          [idioma_seleccionado]: mensajeTraducido
        }),
        es_traducido: idioma_seleccionado !== (invitacion.receptor_idioma || 'es'),
        es_primer_mensaje_automatico: true,
        invitacion_id: invitacion.id,
        estado_transcripcion: 'DONE'
      }])
      .select()
      .single()

    if (msgError) throw msgError

    // 4. Actualizar invitación
    const { error: updateError } = await supabase
      .from('invitaciones')
      .update({
        aceptada: true,
        aceptada_en: new Date().toISOString()
      })
      .eq('id', invitacion.id)

    if (updateError) throw updateError

    // 5. Crear registro de aceptación (auditoría)
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
        usuario: {
          id: nuevoUsuario.id,
          nip_4_digitos: nip,
          idioma: idioma_seleccionado,
          nombre: nuevoUsuario.nombre
        },
        conversacion_id: conversacion.id,
        primer_mensaje: {
          id: mensaje.id,
          texto_original: mensaje.texto_original,
          texto_usuario: mensajeTraducido,
          remitente: invitacion.remitente_nombre,
          idioma_original: invitacion.receptor_idioma || 'es',
          idioma_usuario: idioma_seleccionado,
          timestamp: mensaje.created_at
        }
      })
    }
  } catch (error) {
    console.error('aceptar_invitacion error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

/**
 * GET /api/v2/invitations/{remitente_id}
 * Listar invitaciones enviadas por un remitente
 */
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
      body: JSON.stringify({
        total: data.length,
        invitaciones: data.map((inv) => ({
          id: inv.id,
          receptor_nombre: inv.receptor_nombre,
          primer_mensaje: inv.primer_mensaje,
          aceptada: inv.aceptada,
          canal_compartida: inv.canal_compartida,
          created_at: inv.created_at,
          aceptada_en: inv.aceptada_en,
          expira_en: inv.expira_en
        }))
      })
    }
  } catch (error) {
    console.error('listar_invitaciones error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

/**
 * GET /api/v2/invitations/{remitente_id}/analytics
 * Analytics de invitaciones
 */
async function analytics_invitaciones(remitente_id) {
  try {
    const { data, error } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('remitente_id', remitente_id)

    if (error) throw error

    const total_enviadas = data.length
    const total_aceptadas = data.filter((i) => i.aceptada).length
    const tasa_aceptacion = total_enviadas > 0 ? total_aceptadas / total_enviadas : 0

    // Agrupar por canal
    const por_canal = {
      whatsapp: { enviadas: 0, aceptadas: 0 },
      facebook: { enviadas: 0, aceptadas: 0 },
      email: { enviadas: 0, aceptadas: 0 },
      qr: { enviadas: 0, aceptadas: 0 },
      direct_link: { enviadas: 0, aceptadas: 0 }
    }

    data.forEach((inv) => {
      const canal = inv.canal_compartida.toLowerCase()
      if (por_canal[canal]) {
        por_canal[canal].enviadas++
        if (inv.aceptada) por_canal[canal].aceptadas++
      }
    })

    // Calcular tiempo promedio de aceptación
    let tiemposAceptacion = []
    data.forEach((inv) => {
      if (inv.aceptada && inv.aceptada_en) {
        const creada = new Date(inv.created_at)
        const aceptada = new Date(inv.aceptada_en)
        const minutos = Math.round((aceptada - creada) / 60000)
        tiemposAceptacion.push(minutos)
      }
    })
    const promedio_tiempo_aceptacion = tiemposAceptacion.length > 0
      ? Math.round(tiemposAceptacion.reduce((a, b) => a + b, 0) / tiemposAceptacion.length)
      : 0

    return {
      statusCode: 200,
      body: JSON.stringify({
        total_enviadas,
        total_aceptadas,
        tasa_aceptacion: (tasa_aceptacion * 100).toFixed(1) + '%',
        por_canal,
        promedio_tiempo_aceptacion,
        muestras: tiemposAceptacion.length
      })
    }
  } catch (error) {
    console.error('analytics_invitaciones error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}

/**
 * Traducir mensaje usando Claude API
 * TODO: Activar con ANTHROPIC_API_KEY
 */
async function traducirMensaje(texto, idiomaOrigen, idiomaDestino) {
  if (idiomaOrigen === idiomaDestino) return texto

  try {
    // TODO: Descomentar cuando esté disponible ANTHROPIC_API_KEY
    /*
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Traduce este texto de ${idiomaOrigen} a ${idiomaDestino}.
Solo responde con la traducción, sin explicaciones ni comillas.
Texto: "${texto}"`
        }]
      })
    })

    const data = await response.json()
    return data.content[0].text.trim()
    */

    // Mock: por ahora, retorna el mismo texto
    console.warn(`Translation mock: ${idiomaOrigen} → ${idiomaDestino}`)
    return texto
  } catch (error) {
    console.error('Translation error:', error)
    return texto // Fallback: retorna original si falla
  }
}

/**
 * Main handler
 */
exports.handler = async (event) => {
  const { httpMethod, path, body: rawBody } = event
  const body = rawBody ? JSON.parse(rawBody) : {}

  console.log(`[${new Date().toISOString()}] ${httpMethod} ${path}`)

  try {
    // POST /api/v2/invitations
    if (httpMethod === 'POST' && path.includes('/invitations') && !path.includes('/accept')) {
      return await crear_invitacion({ body })
    }

    // POST /api/v2/invitations/{token}/accept
    if (httpMethod === 'POST' && path.includes('/invitations') && path.includes('/accept')) {
      return await aceptar_invitacion({ body, headers: event.headers })
    }

    // GET /api/v2/invitations/{remitente_id}
    if (httpMethod === 'GET' && path.includes('/invitations') && !path.includes('/analytics')) {
      const remitente_id = path.split('/').pop()
      return await listar_invitaciones(remitente_id)
    }

    // GET /api/v2/invitations/{remitente_id}/analytics
    if (httpMethod === 'GET' && path.includes('/analytics')) {
      const remitente_id = path.split('/')[4]
      return await analytics_invitaciones(remitente_id)
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Endpoint not found' })
    }
  } catch (error) {
    console.error('Handler error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
