import { Anthropic } from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/v1/ai/detect-language
export const detectLanguage = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { text, context = null } = JSON.parse(req.body)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Detect the language of this text. Return JSON: {"language_code": "xx", "language_name": "...", "confidence": 0.95, "alternatives": [...]}\n\nText: "${text}"`
        }
      ]
    })

    const result = JSON.parse(response.content[0].text)

    return {
      statusCode: 200,
      body: JSON.stringify({
        detected_language: result.language_code,
        language_name: result.language_name,
        confidence: result.confidence,
        alternatives: result.alternatives
      })
    }
  } catch (err) {
    console.error('Language detection error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// POST /api/v1/ai/summarize
export const summarizeConversation = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { room_id, language = 'es', style = 'bullet_points' } = JSON.parse(req.body)

    // Get messages
    const { data: messages } = await supabase
      .from('messages')
      .select('sender_nombre, texto_original, idioma_original, created_at')
      .eq('room_id', room_id)
      .order('created_at', { ascending: true })

    if (!messages || messages.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          summary: 'No hay mensajes en esta sala.',
          duration_minutes: 0,
          participants: 0
        })
      }
    }

    // Format conversation
    const conversation = messages
      .map(m => `[${m.sender_nombre}]: ${m.texto_original}`)
      .join('\n')

    // Generate summary
    const stylePrompt = {
      bullet_points: 'Summarize in 5 bullet points',
      paragraph: 'Write a concise paragraph summary',
      key_decisions: 'Extract the key decisions and action items'
    }[style] || 'Summarize in 5 bullet points'

    const response = await anthropic.messages.create({
      model: 'claude-sonnet',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `${stylePrompt}. Language: ${language}.\n\nConversation:\n${conversation}`
        }
      ]
    })

    const summary = response.content[0].text
    const duration = Math.round(
      (new Date(messages[messages.length - 1].created_at) - new Date(messages[0].created_at)) / 60000
    )
    const participants = new Set(messages.map(m => m.sender_nombre)).size

    return {
      statusCode: 200,
      body: JSON.stringify({
        summary,
        duration_minutes: duration,
        participants,
        message_count: messages.length,
        languages: [...new Set(messages.map(m => m.idioma_original))],
        style
      })
    }
  } catch (err) {
    console.error('Summarization error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// POST /api/v1/ai/sentiment
export const analyzeSentiment = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { text, message_id = null } = JSON.parse(req.body)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `Analyze sentiment of this text. Return JSON: {"sentiment": "positive|negative|neutral", "score": 0.92, "emotion": "happy|sad|angry|...", "suggests_action": false}\n\nText: "${text}"`
        }
      ]
    })

    const result = JSON.parse(response.content[0].text)

    // Log in audit if message_id provided
    if (message_id) {
      await supabase.from('audit_log').insert({
        tabla: 'messages',
        accion: 'sentiment_analysis',
        registro_id: message_id,
        datos_nuevos: result
      })
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        sentiment: result.sentiment,
        score: result.score,
        emotion: result.emotion,
        suggests_action: result.suggests_action,
        analyzed_at: new Date().toISOString()
      })
    }
  } catch (err) {
    console.error('Sentiment analysis error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// POST /api/v1/ai/fraud-check
export const detectFraud = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { room_id, check_type = 'suspicious_patterns' } = JSON.parse(req.body)

    // Get room data
    const { data: room } = await supabase
      .from('rooms')
      .select('created_at, guest_sessions(count), messages(count)')
      .eq('id', room_id)
      .single()

    const { data: sessions } = await supabase
      .from('guest_sessions')
      .select('created_at')
      .eq('room_id', room_id)

    // Calculate metrics
    const metrics = {
      room_age_hours: (Date.now() - new Date(room.created_at)) / 3600000,
      guest_count: room.guest_sessions[0]?.count || 0,
      message_count: room.messages[0]?.count || 0,
      guest_turnover_rate: sessions.length / (room.guest_sessions[0]?.count || 1),
      avg_session_duration: sessions.length > 0
        ? 60  // placeholder: calculate from timestamps
        : 0
    }

    // Fraud detection logic
    const flags = []
    if (metrics.guest_turnover_rate > 5) flags.push('rapid_guest_turnover')
    if (metrics.message_count < 5 && metrics.guest_count > 1) flags.push('low_engagement')
    if (metrics.room_age_hours < 0.5 && metrics.guest_count > 5) flags.push('suspicious_spike')

    const riskLevel = flags.length > 2 ? 'high' : flags.length > 0 ? 'medium' : 'low'

    return {
      statusCode: 200,
      body: JSON.stringify({
        risk_level: riskLevel,
        flags,
        metrics,
        recommendation: riskLevel === 'high' ? 'block_room' : 'monitor',
        checked_at: new Date().toISOString()
      })
    }
  } catch (err) {
    console.error('Fraud detection error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// POST /api/v1/ai/webhooks — Register webhook for events
export const registerWebhook = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { event, url, secret } = JSON.parse(req.body)

    // Validate URL
    if (!url.startsWith('https://')) {
      throw new Error('Webhook URL must use HTTPS')
    }

    // Save webhook
    const { data, error } = await supabase
      .from('webhooks')  // assume this table exists
      .insert([{
        event,
        url,
        secret,
        active: true,
        created_at: new Date()
      }])
      .select()

    if (error) throw error

    // Send test webhook
    await sendWebhook(url, secret, {
      type: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: { test: true }
    })

    return {
      statusCode: 201,
      body: JSON.stringify({
        webhook_id: data[0].id,
        event,
        active: true,
        test_sent: true
      })
    }
  } catch (err) {
    console.error('Webhook registration error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    }
  }
}

// Webhook for external events
export const handleWebhookEvent = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { room_id, event_type, data } = JSON.parse(req.body)

    // Get registered webhooks
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('event', event_type)
      .eq('active', true)

    // Send to each webhook
    for (const webhook of webhooks || []) {
      try {
        await sendWebhook(webhook.url, webhook.secret, {
          type: event_type,
          timestamp: new Date().toISOString(),
          room_id,
          data
        })
      } catch (e) {
        console.error(`Failed to send webhook to ${webhook.url}:`, e)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        processed: true,
        webhooks_sent: webhooks?.length || 0
      })
    }
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message })
    }
  }
}

export const handler = async (event) => {
  const path = event.path.split('/')
  const method = event.httpMethod

  if (path.includes('detect-language')) return detectLanguage(event)
  if (path.includes('summarize')) return summarizeConversation(event)
  if (path.includes('sentiment')) return analyzeSentiment(event)
  if (path.includes('fraud-check')) return detectFraud(event)
  if (path.includes('webhooks') && method === 'POST') return registerWebhook(event)
  if (path.includes('webhook-event')) return handleWebhookEvent(event)

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}

// Utilities
async function sendWebhook(url, secret, payload) {
  const crypto = require('crypto')
  const signature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature': signature,
      'X-Timestamp': Date.now().toString()
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`)
  }

  return response.json()
}
