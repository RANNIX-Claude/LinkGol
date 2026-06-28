import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

// Email templates
const EMAIL_TEMPLATES = {
  room_invitation: (data) => ({
    subject: `¡Tu sala ${data.room_name} está lista! 🎉`,
    html: `
      <h1>Sala creada exitosamente</h1>
      <p>Hola ${data.host_name},</p>
      <p>Tu sala "${data.room_name}" está lista para recibir invitados.</p>
      <p><strong>URL:</strong> ${data.room_url}</p>
      <p>
        <a href="${data.room_url}" style="background: #0052CC; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Abrir Sala
        </a>
      </p>
      <p><small>Este enlace expira en 30 días.</small></p>
    `
  }),
  user_joined: (data) => ({
    subject: `✨ ${data.guest_name} se ha unido a tu sala`,
    html: `
      <h1>Nuevo invitado</h1>
      <p>Hola ${data.host_name},</p>
      <p><strong>${data.guest_name}</strong> acaba de unirse a tu sala "${data.room_name}".</p>
      <p>Idioma: <strong>${data.guest_language}</strong></p>
      <p><a href="${data.room_url}">Ver sala</a></p>
    `
  }),
  translation_ready: (data) => ({
    subject: `Traducción lista: "${data.room_name}"`,
    html: `
      <h1>Nuevos mensajes traducidos</h1>
      <p>Hola ${data.recipient_name},</p>
      <p>Tienes <strong>${data.message_count}</strong> nuevos mensaje(s) en "${data.room_name}".</p>
      <p><a href="${data.room_url}">Ver mensajes</a></p>
    `
  }),
  room_summary: (data) => ({
    subject: `Resumen de sala: ${data.room_name}`,
    html: `
      <h1>Resumen de conversación</h1>
      <p>Hola ${data.host_name},</p>
      <p><strong>Sala:</strong> ${data.room_name}</p>
      <p><strong>Duración:</strong> ${data.duration_minutes} minutos</p>
      <p><strong>Participantes:</strong> ${data.participants_count}</p>
      <p><strong>Mensajes:</strong> ${data.message_count}</p>
      <h2>Resumen:</h2>
      <p>${data.summary}</p>
      <p><strong>Temas clave:</strong> ${data.key_topics?.join(', ')}</p>
      <p><strong>Sentimiento general:</strong> ${data.sentiment}</p>
    `
  })
}

// POST /api/v1/notifications/email — Enviar email
export const sendEmail = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { to, template, variables } = JSON.parse(req.body)

    if (!EMAIL_TEMPLATES[template]) {
      throw new Error(`Unknown template: ${template}`)
    }

    const emailContent = EMAIL_TEMPLATES[template](variables)

    const result = await resend.emails.send({
      from: 'noreply@linkgol.app',
      to,
      subject: emailContent.subject,
      html: emailContent.html
    })

    if (result.error) throw result.error

    return {
      statusCode: 200,
      body: JSON.stringify({
        email_id: result.data?.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
        to
      })
    }
  } catch (err) {
    console.error('Email error:', err)
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/notifications/sms — Enviar SMS
export const sendSMS = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { phone, message, country_code = 'es' } = JSON.parse(req.body)

    // Validar formato de teléfono
    if (!phone.startsWith('+')) {
      throw new Error('Phone must start with + and country code')
    }

    const sms = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        sms_id: sms.sid,
        status: sms.status,
        sent_at: new Date().toISOString(),
        to: phone,
        message_length: message.length
      })
    }
  } catch (err) {
    console.error('SMS error:', err)
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/notifications/push — Enviar notificación push
export const sendPushNotification = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { user_id, title, body, action_url } = JSON.parse(req.body)

    // En producción: usar Firebase Cloud Messaging, OneSignal, o Supabase Realtime

    // Simulación con WebSocket via Supabase:
    // const payload = {
    //   type: 'push',
    //   title,
    //   body,
    //   action_url,
    //   timestamp: new Date().toISOString()
    // }
    // await supabase.channel(`user:${user_id}`).send('broadcast', payload)

    return {
      statusCode: 200,
      body: JSON.stringify({
        push_id: `push_${Date.now()}`,
        sent: 1,
        failed: 0,
        title,
        body,
        user_id
      })
    }
  } catch (err) {
    console.error('Push notification error:', err)
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/notifications/test — Enviar notificación de prueba
export const sendTestNotification = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { type = 'email', to, phone } = JSON.parse(req.body)

    if (type === 'email') {
      return sendEmail({
        method: 'POST',
        body: JSON.stringify({
          to,
          template: 'room_invitation',
          variables: {
            host_name: 'Test User',
            room_name: 'Test Room',
            room_url: 'https://linkgol.app/room/test-123'
          }
        })
      })
    } else if (type === 'sms') {
      return sendSMS({
        method: 'POST',
        body: JSON.stringify({
          phone,
          message: '¡LinkGol aquí! Tu sala está lista. linkgol.app'
        })
      })
    }

    throw new Error('Unknown notification type')
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// Webhook para eventos de Resend (tracking)
export const handleResendWebhook = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const event = JSON.parse(req.body)

    // Validar signature (en producción)
    // const signature = req.headers['x-resend-signature']
    // if (!verifySignature(signature, req.rawBody)) {
    //   throw new Error('Invalid signature')
    // }

    console.log('Resend webhook:', event.type, event.data?.email_id)

    // Log en audit_log o analytics
    // await supabase.from('email_events').insert({
    //   event_type: event.type,
    //   email_id: event.data?.email_id,
    //   timestamp: new Date()
    // })

    return { statusCode: 200, body: JSON.stringify({ received: true }) }
  } catch (err) {
    console.error('Webhook error:', err)
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

export const handler = async (event) => {
  const path = event.path.split('/')
  const method = event.httpMethod

  if (path.includes('email') && method === 'POST') return sendEmail(event)
  if (path.includes('sms') && method === 'POST') return sendSMS(event)
  if (path.includes('push') && method === 'POST') return sendPushNotification(event)
  if (path.includes('test') && method === 'POST') return sendTestNotification(event)
  if (path.includes('webhook') && path.includes('resend')) return handleResendWebhook(event)

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}
