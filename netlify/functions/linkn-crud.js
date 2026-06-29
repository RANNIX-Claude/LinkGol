// LinkN.click — Core CRUD Endpoints v1.0
// Funciones para: Links, Conversaciones, Mensajes, Usuarios Anónimos

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ═══════════════════════════════════════════════════════════
// USUARIOS ANÓNIMOS
// ═══════════════════════════════════════════════════════════

async function crearUsuarioAnonimo(idioma) {
  try {
    // Generar NIP 4 dígitos único
    let nip = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    let unique = false

    while (!unique) {
      const { data } = await supabase
        .from('usuarios')
        .select('nip_4_digitos')
        .eq('nip_4_digitos', nip)
        .single()

      if (!data) unique = true
      else nip = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    }

    // Crear usuario anónimo
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nip_4_digitos: nip,
        idioma_preferido: idioma,
        tipo_usuario: 'personal',
        estado: 'activo'
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, usuario_id: data.id, nip_4_digitos: nip }
  } catch (err) {
    console.error('Error creating anonymous user:', err)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════
// LINKS — Crear y Obtener
// ═══════════════════════════════════════════════════════════

async function crearLink(ownerID, { titulo, descripcion, contexto, idioma_base, idiomas_permitidos, prompt_base, modo }) {
  try {
    // Generar slug único
    const slug = `${contexto.split('_')[0]}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    const token_acceso = require('crypto').randomBytes(32).toString('hex')

    const { data, error } = await supabase
      .from('links')
      .insert([{
        owner_id: ownerID,
        slug,
        titulo,
        descripcion,
        contexto,
        idioma_base,
        idiomas_permitidos,
        prompt_base,
        modo,
        token_acceso,
        estado: 'activo',
        activo: true
      }])
      .select()
      .single()

    if (error) throw error

    // Crear contexto asociado
    await supabase
      .from('contextos_link')
      .insert([{
        link_id: data.id,
        intension_detectada: contexto,
        categorias: [contexto]
      }])

    return {
      success: true,
      link_id: data.id,
      slug: data.slug,
      url: `https://linkn.click/${data.slug}`
    }
  } catch (err) {
    console.error('Error creating link:', err)
    return { success: false, error: err.message }
  }
}

async function obtenerLink(slug) {
  try {
    const { data, error } = await supabase
      .from('links')
      .select(`
        *,
        contextos_link (intension_detectada, categorias),
        usuarios (nip_4_digitos)
      `)
      .eq('slug', slug)
      .eq('activo', true)
      .single()

    if (error) throw error
    return { success: true, link: data }
  } catch (err) {
    console.error('Error fetching link:', err)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════
// CONVERSACIONES — Crear e Ingresar
// ═══════════════════════════════════════════════════════════

async function crearConversacion(link_id, usuario_id, idioma_usuario) {
  try {
    const { data, error } = await supabase
      .from('conversaciones')
      .insert([{
        link_id,
        participante_1: usuario_id,
        idioma_p1: idioma_usuario,
        participante_2_anonimo: true,
        estado: 'activa'
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, conversacion_id: data.id }
  } catch (err) {
    console.error('Error creating conversation:', err)
    return { success: false, error: err.message }
  }
}

async function ingresarConversacion(conversacion_id, usuario_anonimo_nip, idioma) {
  try {
    // Obtener conversación
    const { data: conv, error: convError } = await supabase
      .from('conversaciones')
      .select('*')
      .eq('id', conversacion_id)
      .single()

    if (convError) throw convError

    // Actualizar participante 2
    const { data, error } = await supabase
      .from('conversaciones')
      .update({
        participante_2_nip: usuario_anonimo_nip,
        idioma_p2: idioma,
        estado: 'activa'
      })
      .eq('id', conversacion_id)
      .select()
      .single()

    if (error) throw error
    return { success: true, conversacion_id: data.id, iniciada: true }
  } catch (err) {
    console.error('Error entering conversation:', err)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════
// MENSAJES — Enviar y Obtener
// ═══════════════════════════════════════════════════════════

async function enviarMensaje(conversacion_id, sender_id, sender_nip, texto_original, idioma_original) {
  try {
    // Obtener idiomas de la conversación
    const { data: conv } = await supabase
      .from('conversaciones')
      .select('idioma_p1, idioma_p2')
      .eq('id', conversacion_id)
      .single()

    // Traducir a idiomas de participantes
    const traducciones = {
      [idioma_original]: texto_original
    }

    // En producción: usar Claude API para traducción real
    // Por ahora: placeholder
    if (idioma_original !== conv.idioma_p1) {
      traducciones[conv.idioma_p1] = `[Traducido a ${conv.idioma_p1}] ${texto_original}`
    }
    if (idioma_original !== conv.idioma_p2) {
      traducciones[conv.idioma_p2] = `[Traducido a ${conv.idioma_p2}] ${texto_original}`
    }

    const { data, error } = await supabase
      .from('mensajes')
      .insert([{
        conversacion_id,
        sender_id,
        sender_nip,
        texto_original,
        idioma_original,
        traducciones,
        es_traducido: Object.keys(traducciones).length > 1
      }])
      .select()
      .single()

    if (error) throw error
    return { success: true, mensaje_id: data.id, traducciones }
  } catch (err) {
    console.error('Error sending message:', err)
    return { success: false, error: err.message }
  }
}

async function obtenerMensajes(conversacion_id, idioma_usuario) {
  try {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacion_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Preparar mensajes con traducción apropiada
    const mensajes = data.map(msg => ({
      id: msg.id,
      sender_id: msg.sender_id,
      sender_nip: msg.sender_nip,
      texto: msg.traducciones[idioma_usuario] || msg.texto_original,
      idioma_original: msg.idioma_original,
      timestamp: msg.created_at,
      es_traducido: msg.es_traducido
    }))

    return { success: true, mensajes }
  } catch (err) {
    console.error('Error fetching messages:', err)
    return { success: false, error: err.message }
  }
}

// ═══════════════════════════════════════════════════════════
// LAMBDA HANDLER
// ═══════════════════════════════════════════════════════════

exports.handler = async (event) => {
  const { action, ...params } = JSON.parse(event.body)

  console.log(`[LinkN] Action: ${action}`, params)

  let result = { success: false, error: 'Unknown action' }

  switch (action) {
    case 'crear_usuario_anonimo':
      result = await crearUsuarioAnonimo(params.idioma)
      break
    case 'crear_link':
      result = await crearLink(params.owner_id, params)
      break
    case 'obtener_link':
      result = await obtenerLink(params.slug)
      break
    case 'crear_conversacion':
      result = await crearConversacion(params.link_id, params.usuario_id, params.idioma)
      break
    case 'ingresar_conversacion':
      result = await ingresarConversacion(params.conversacion_id, params.nip, params.idioma)
      break
    case 'enviar_mensaje':
      result = await enviarMensaje(params.conversacion_id, params.sender_id, params.sender_nip, params.texto, params.idioma)
      break
    case 'obtener_mensajes':
      result = await obtenerMensajes(params.conversacion_id, params.idioma_usuario)
      break
    default:
      result = { success: false, error: 'Action not found' }
  }

  return {
    statusCode: result.success ? 200 : 400,
    body: JSON.stringify(result)
  }
}
