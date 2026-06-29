// LinkN.click — Frontend API Service v1.0

const API_BASE = '/.netlify/functions/linkn-crud'

// ═══════════════════════════════════════════════════════════
// USUARIOS ANÓNIMOS
// ═══════════════════════════════════════════════════════════

export const crearUsuarioAnonimo = async (idioma) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'crear_usuario_anonimo',
        idioma
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error creating anonymous user:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// LINKS
// ═══════════════════════════════════════════════════════════

export const crearLink = async (ownerID, config) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'crear_link',
        owner_id: ownerID,
        ...config
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error creating link:', err)
    throw err
  }
}

export const obtenerLink = async (slug) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'obtener_link',
        slug
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error fetching link:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// CONVERSACIONES
// ═══════════════════════════════════════════════════════════

export const crearConversacion = async (linkID, usuarioID, idioma) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'crear_conversacion',
        link_id: linkID,
        usuario_id: usuarioID,
        idioma
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error creating conversation:', err)
    throw err
  }
}

export const ingresarConversacion = async (conversacionID, nip, idioma) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'ingresar_conversacion',
        conversacion_id: conversacionID,
        nip,
        idioma
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error entering conversation:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// MENSAJES
// ═══════════════════════════════════════════════════════════

export const enviarMensaje = async (conversacionID, senderID, senderNIP, texto, idioma) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'enviar_mensaje',
        conversacion_id: conversacionID,
        sender_id: senderID,
        sender_nip: senderNIP,
        texto,
        idioma
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error sending message:', err)
    throw err
  }
}

export const obtenerMensajes = async (conversacionID, idiomaUsuario) => {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        action: 'obtener_mensajes',
        conversacion_id: conversacionID,
        idioma_usuario: idiomaUsuario
      })
    })
    return await response.json()
  } catch (err) {
    console.error('Error fetching messages:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// LOCALSTORAGE HELPERS (para sesión anónima)
// ═══════════════════════════════════════════════════════════

export const guardarSesionAnonima = (linkSlug, usuarioID, nip, idioma) => {
  localStorage.setItem(`linkn_sesion_${linkSlug}`, JSON.stringify({
    usuario_id: usuarioID,
    nip_4_digitos: nip,
    idioma,
    timestamp: Date.now()
  }))
}

export const obtenerSesionAnonima = (linkSlug) => {
  const sesion = localStorage.getItem(`linkn_sesion_${linkSlug}`)
  return sesion ? JSON.parse(sesion) : null
}

export const limpiarSesionAnonima = (linkSlug) => {
  localStorage.removeItem(`linkn_sesion_${linkSlug}`)
}
