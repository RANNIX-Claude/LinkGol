// LinkGol API Service (v2.0)
// Endpoints: /api/v2/*

const API_BASE = '/api/v2'

// ═══════════════════════════════════════════════════════════
// CONVERSATIONS (1:1)
// ═══════════════════════════════════════════════════════════

export const createConversation = async (hostId, guestEmail, guestName, hostIdioma) => {
  try {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host_id: hostId,
        guest_email: guestEmail,
        guest_name: guestName,
        host_idioma: hostIdioma
      })
    })

    if (!response.ok) throw new Error('Failed to create conversation')
    return await response.json()
  } catch (err) {
    console.error('Error creating conversation:', err)
    throw err
  }
}

export const getConversations = async (hostId) => {
  try {
    const response = await fetch(`${API_BASE}/conversations/${hostId}`)
    if (!response.ok) throw new Error('Failed to fetch conversations')
    return await response.json()
  } catch (err) {
    console.error('Error fetching conversations:', err)
    throw err
  }
}

export const joinConversation = async (linkToken) => {
  try {
    const response = await fetch(`${API_BASE}/conversations/join/${linkToken}`)
    if (!response.ok) throw new Error('Failed to join conversation')
    return await response.json()
  } catch (err) {
    console.error('Error joining conversation:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// MESSAGES (for a specific conversation)
// ═══════════════════════════════════════════════════════════

export const sendMessage = async (conversationId, senderId, senderName, textoOriginal, idiomaOriginal) => {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_nombre: senderName,
        texto_original: textoOriginal,
        idioma_original: idiomaOriginal
      })
    })

    if (!response.ok) throw new Error('Failed to send message')
    return await response.json()
  } catch (err) {
    console.error('Error sending message:', err)
    throw err
  }
}

export const getMessages = async (conversationId) => {
  try {
    const response = await fetch(`${API_BASE}/messages/${conversationId}`)
    if (!response.ok) throw new Error('Failed to fetch messages')
    return await response.json()
  } catch (err) {
    console.error('Error fetching messages:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// CONTACTS (Address Book)
// ═══════════════════════════════════════════════════════════

export const addContact = async (hostId, contactName, contactEmail, contactPhone, contactPhoto) => {
  try {
    const response = await fetch(`${API_BASE}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host_id: hostId,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_photo: contactPhoto
      })
    })

    if (!response.ok) throw new Error('Failed to add contact')
    return await response.json()
  } catch (err) {
    console.error('Error adding contact:', err)
    throw err
  }
}

export const getContacts = async (hostId) => {
  try {
    const response = await fetch(`${API_BASE}/contacts/${hostId}`)
    if (!response.ok) throw new Error('Failed to fetch contacts')
    return await response.json()
  } catch (err) {
    console.error('Error fetching contacts:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// GUEST SESSIONS (Without account)
// ═══════════════════════════════════════════════════════════

export const enterConversation = async (conversationId, guestName, idioma) => {
  try {
    const response = await fetch(`${API_BASE}/guests/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        guest_name: guestName,
        idioma: idioma
      })
    })

    if (!response.ok) throw new Error('Failed to enter conversation')
    const data = await response.json()

    // Save token to localStorage
    localStorage.setItem(`guest_token_${conversationId}`, data.token)

    return data
  } catch (err) {
    console.error('Error entering conversation:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// TRANSLATIONS (AI-powered)
// ═══════════════════════════════════════════════════════════

export const translateMessage = async (messageId, idiomaDestino) => {
  try {
    // En producción: POST /api/v2/ai/translate
    // Por ahora: simular traducción
    return {
      message_id: messageId,
      idioma_destino: idiomaDestino,
      texto_traducido: 'Traducción simulada...',
      costo_usd: 0.0001
    }
  } catch (err) {
    console.error('Error translating message:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION (SignUp, Login, User Management)
// ═══════════════════════════════════════════════════════════

export const signUp = async (email, password, nombre, apellido, idioma) => {
  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        nombre,
        apellido,
        idioma
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to sign up')
    }

    const user = await response.json()
    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido || '',
      idioma: user.idioma,
      nip_4_digitos: user.nip_4_digitos,
      token: user.token
    }
  } catch (err) {
    console.error('SignUp error:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// INVITATIONS
// ═══════════════════════════════════════════════════════════

export const createInvitation = async (remitente_id, contexto, primer_mensaje) => {
  try {
    const response = await fetch(`${API_BASE}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        remitente_id,
        contexto,
        primer_mensaje,
        canal_compartida: 'DIRECT_LINK'
      })
    })

    if (!response.ok) throw new Error('Failed to create invitation')
    return await response.json()
  } catch (err) {
    console.error('Error creating invitation:', err)
    throw err
  }
}

export const getInvitation = async (token) => {
  try {
    const response = await fetch(`${API_BASE}/invitations/${token}`, {
      method: 'GET'
    })

    if (!response.ok) throw new Error('Invitation not found or expired')
    return await response.json()
  } catch (err) {
    console.error('Error fetching invitation:', err)
    throw err
  }
}

export const acceptInvitation = async (token, idioma_seleccionado) => {
  try {
    const response = await fetch(`${API_BASE}/invitations/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        idioma_seleccionado
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to accept invitation')
    }

    const data = await response.json()
    return {
      success: true,
      usuario: {
        id: data.usuario.id,
        nip_4_digitos: data.usuario.nip_4_digitos,
        idioma: data.usuario.idioma
      },
      conversacion_id: data.conversacion_id,
      primer_mensaje: data.primer_mensaje
    }
  } catch (err) {
    console.error('Error accepting invitation:', err)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

export const getGuestToken = (conversationId) => {
  return localStorage.getItem(`guest_token_${conversationId}`)
}

export const removeGuestToken = (conversationId) => {
  localStorage.removeItem(`guest_token_${conversationId}`)
}
