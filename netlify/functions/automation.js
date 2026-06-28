import { createClient } from '@supabase/supabase-js'
import { Anthropic } from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Trigger: Guest joins room
export const onGuestJoin = async (event) => {
  try {
    const { room_id, guest_id, guest_name, idioma } = JSON.parse(event.body)

    console.log(`[AUTOMATION] Guest ${guest_name} joined room ${room_id}`)

    // 1. Get room info
    const { data: room } = await supabase
      .from('rooms')
      .select('host_id, nombre')
      .eq('id', room_id)
      .single()

    // 2. Get host email
    const { data: host } = await supabase
      .from('users')
      .select('email, nombre')
      .eq('id', room.host_id)
      .single()

    // 3. Send notification email
    await fetch(`${process.env.NETLIFY_FUNCTIONS_URL}/notifications`, {
      method: 'POST',
      body: JSON.stringify({
        to: host.email,
        template: 'user_joined',
        variables: {
          host_name: host.nombre,
          guest_name,
          room_name: room.nombre,
          guest_language: idioma,
          room_url: `linkgol.app/room/${room_id}`
        }
      })
    })

    // 4. Log in audit_log
    await supabase.from('audit_log').insert({
      tabla: 'guest_sessions',
      accion: 'join',
      registro_id: guest_id,
      usuario_id: room.host_id,
      datos_nuevos: { guest_name, idioma }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ processed: true })
    }
  } catch (err) {
    console.error('Error in onGuestJoin:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// Trigger: Message created → Auto-translate
export const onMessageCreated = async (event) => {
  try {
    const { message_id, room_id, texto_original, idioma_original } = JSON.parse(event.body)

    console.log(`[AUTOMATION] Translating message ${message_id}`)

    // 1. Get all languages in the room
    const { data: sessions } = await supabase
      .from('guest_sessions')
      .select('idioma')
      .eq('room_id', room_id)

    const languagesInRoom = [...new Set(sessions.map(s => s.idioma))].filter(l => l !== idioma_original)

    if (languagesInRoom.length === 0) {
      console.log('No other languages in room, skipping translation')
      return { statusCode: 200, body: JSON.stringify({ translated: false }) }
    }

    // 2. Translate to each language
    for (const idioma_destino of languagesInRoom) {
      try {
        // Check cache first
        const cacheHash = hashMessage(texto_original + idioma_original + idioma_destino)
        const { data: cached } = await supabase
          .from('translations')
          .select('texto_traducido')
          .eq('hash_cache', cacheHash)
          .single()

        if (cached) {
          console.log(`[CACHE HIT] ${idioma_destino}`)
          // Insert from cache
          await supabase.from('translations').insert({
            message_id,
            idioma_destino,
            texto_traducido: cached.texto_traducido,
            hash_cache: cacheHash,
            costo_usd: 0  // Cache hit = no cost
          })
          continue
        }

        // Call Claude API
        const response = await anthropic.messages.create({
          model: 'claude-sonnet',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Translate this text from ${idioma_original} to ${idioma_destino}. Return ONLY the translation, no explanations:\n\n"${texto_original}"`
            }
          ]
        })

        const translated = response.content[0].text

        // Estimate tokens (rough)
        const tokensUsed = Math.ceil(texto_original.length / 4)
        const costUsd = tokensUsed * 0.000003  // Aprox. Claude Sonnet pricing

        // Save translation
        await supabase.from('translations').insert({
          message_id,
          idioma_destino,
          texto_traducido: translated,
          hash_cache: cacheHash,
          tokens_usados: tokensUsed,
          costo_usd: costUsd
        })

        console.log(`[TRANSLATED] ${idioma_original} → ${idioma_destino}`)
      } catch (translateErr) {
        console.error(`Translation error for ${idioma_destino}:`, translateErr)
      }
    }

    // 3. Broadcast via WebSocket that translations are ready
    await supabase.channel(`room:${room_id}`).send('broadcast', {
      event: 'translations:ready',
      message_id,
      translated_languages: languagesInRoom
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        translated: true,
        count: languagesInRoom.length
      })
    }
  } catch (err) {
    console.error('Error in onMessageCreated:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// Trigger: Room closes → Generate summary
export const onRoomClose = async (event) => {
  try {
    const { room_id } = JSON.parse(event.body)

    console.log(`[AUTOMATION] Closing room ${room_id}`)

    // 1. Get room info
    const { data: room } = await supabase
      .from('rooms')
      .select('host_id, nombre')
      .eq('id', room_id)
      .single()

    // 2. Get all messages
    const { data: messages } = await supabase
      .from('messages')
      .select('sender_nombre, texto_original, idioma_original, created_at')
      .eq('room_id', room_id)
      .order('created_at', { ascending: true })

    if (!messages || messages.length === 0) {
      console.log('No messages to summarize')
      return { statusCode: 200, body: JSON.stringify({ summary: 'No messages' }) }
    }

    // 3. Prepare conversation text
    const conversationText = messages
      .map(m => `[${m.sender_nombre} (${m.idioma_original})]: ${m.texto_original}`)
      .join('\n')

    // 4. Generate summary with Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Summarize this conversation in bullet points (max 5 points). Language: Spanish.\n\n${conversationText}`
        }
      ]
    })

    const summary = response.content[0].text
    const duration = messages.length > 0
      ? Math.round(
          (new Date(messages[messages.length - 1].created_at) - new Date(messages[0].created_at)) / 60000
        )
      : 0

    // 5. Get host email
    const { data: host } = await supabase
      .from('users')
      .select('email, nombre')
      .eq('id', room.host_id)
      .single()

    // 6. Send summary email
    await fetch(`${process.env.NETLIFY_FUNCTIONS_URL}/notifications`, {
      method: 'POST',
      body: JSON.stringify({
        to: host.email,
        template: 'room_summary',
        variables: {
          host_name: host.nombre,
          room_name: room.nombre,
          duration_minutes: duration,
          participants_count: new Set(messages.map(m => m.sender_nombre)).size,
          message_count: messages.length,
          summary,
          key_topics: extractTopics(summary),
          sentiment: 'positive'
        }
      })
    })

    // 7. Log in audit
    await supabase.from('audit_log').insert({
      tabla: 'rooms',
      accion: 'close',
      registro_id: room_id,
      usuario_id: room.host_id,
      datos_nuevos: {
        summary,
        message_count: messages.length,
        duration_minutes: duration
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        room_closed: true,
        summary_length: summary.length,
        messages_count: messages.length
      })
    }
  } catch (err) {
    console.error('Error in onRoomClose:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// Webhook receiver for database triggers
export const handler = async (event) => {
  const path = event.path.split('/')

  if (path.includes('guest-join')) return onGuestJoin(event)
  if (path.includes('message-created')) return onMessageCreated(event)
  if (path.includes('room-close')) return onRoomClose(event)

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}

// Utilities
function hashMessage(text) {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(text).digest('hex')
}

function extractTopics(text) {
  // Simple topic extraction (en producción: usar NLP)
  const commonWords = ['es', 'el', 'la', 'de', 'a', 'que', 'y', 'para', 'con', 'se']
  const words = text
    .toLowerCase()
    .split(/[\s,.!?]+/)
    .filter(w => w.length > 3 && !commonWords.includes(w))
  return [...new Set(words)].slice(0, 5)
}
