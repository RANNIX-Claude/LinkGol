/**
 * LinkN.click — Translation Service
 * Traduce mensajes en tiempo real usando Claude API
 * Soporta: texto normal + transcripciones de audio
 */

const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic.default()

const IDIOMAS_MAP = {
  es: 'español',
  en: 'English',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어'
}

/**
 * Traducir mensaje de texto
 * Llamado por: linkn-crud.js en enviar_mensaje()
 */
async function traducirTexto(texto, idiomaOrigen, idiomaDestino) {
  if (idiomaOrigen === idiomaDestino) return texto
  if (!IDIOMAS_MAP[idiomaOrigen] || !IDIOMAS_MAP[idiomaDestino]) {
    console.warn(`Idiomas no soportados: ${idiomaOrigen} → ${idiomaDestino}`)
    return texto
  }

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Traduce este texto de ${IDIOMAS_MAP[idiomaOrigen]} a ${IDIOMAS_MAP[idiomaDestino]}.

Instrucciones:
- Solo responde con la traducción
- Mantén el tono y estilo original
- Si hay emojis, mantenlos en la misma posición
- No añadas explicaciones ni comillas
- Línea única (sin saltos de línea a menos que estén en el original)

Texto: "${texto}"`
      }]
    })

    const traduccion = message.content[0].type === 'text' ? message.content[0].text.trim() : texto
    console.log(`✅ Traducción: ${idiomaOrigen}→${idiomaDestino} | Original: "${texto}" | Traducción: "${traduccion}"`)

    return traduccion
  } catch (error) {
    console.error('Translation error:', error)
    // Fallback: retorna el texto original
    return texto
  }
}

/**
 * Generar traducciones JSONB para un mensaje
 * Retorna: { es: "...", en: "...", etc }
 * Llamado por: linkn-crud.js en enviar_mensaje()
 */
async function generarTraducciones(texto, idiomaOrigen, idiomasDestino = ['es', 'en', 'pt', 'fr', 'de']) {
  const traducciones = {
    [idiomaOrigen]: texto
  }

  for (const idioma of idiomasDestino) {
    if (idioma !== idiomaOrigen) {
      traducciones[idioma] = await traducirTexto(texto, idiomaOrigen, idioma)
      // Rate limiting: pequeña pausa entre traducciones
      await new Promise(resolve => setTimeout(resolve, 200))
    }
  }

  return JSON.stringify(traducciones)
}

/**
 * Detectar idioma de un texto (para mensajes de voz)
 * TODO: Usar con Whisper + Claude
 */
async function detectarIdioma(texto) {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: `¿En qué idioma está este texto? Responde solo con el código (es, en, pt, fr, de, it, ru, zh, ja, ko).

Texto: "${texto}"`
      }]
    })

    const codigoIdioma = message.content[0].text.trim().toLowerCase()
    return IDIOMAS_MAP[codigoIdioma] ? codigoIdioma : 'es'
  } catch (error) {
    console.error('Language detection error:', error)
    return 'es' // Default fallback
  }
}

/**
 * Análisis de intención del mensaje
 * Usado para: lead scoring, respuestas sugeridas
 */
async function analizarIntencion(texto, contexto = 'general') {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 256,
      messages: [{
        role: 'user',
        content: `Analiza la intención del mensaje en contexto de "${contexto}". Responde en JSON.

Formato: {"intención": "...", "sentimiento": "positivo|neutral|negativo", "urgencia": "baja|media|alta"}

Texto: "${texto}"`
      }]
    })

    try {
      return JSON.parse(message.content[0].text)
    } catch {
      return {
        intención: 'consulta',
        sentimiento: 'neutral',
        urgencia: 'media'
      }
    }
  } catch (error) {
    console.error('Intention analysis error:', error)
    return {
      intención: 'desconocida',
      sentimiento: 'neutral',
      urgencia: 'media'
    }
  }
}

/**
 * Generar respuesta sugerida (para asistencia)
 * TODO: Activar en HostDashboard o Panel
 */
async function generarRespuestaSugerida(textoOriginal, idiomaContacto, contexto = 'general') {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 256,
      system: `Eres un asistente de mensajería para LinkN.click. Sugieres respuestas breves (máximo 2 líneas)
en el contexto de "${contexto}". El contacto está escribiendo en ${IDIOMAS_MAP[idiomaContacto] || 'español'}.
Sé profesional, amable y conciso.`,
      messages: [{
        role: 'user',
        content: `Mensaje recibido: "${textoOriginal}"\n\nSugieres una respuesta corta en ${IDIOMAS_MAP[idiomaContacto] || 'español'}.`
      }]
    })

    return message.content[0].text.trim()
  } catch (error) {
    console.error('Suggestion generation error:', error)
    return null
  }
}

/**
 * Lead scoring para contexto de venta
 * Usado por: linkn-analytics.js
 */
async function calcularLeadScore(conversacion, contexto = 'venta_autos') {
  try {
    const ultimosMensajes = conversacion.slice(-5) // Últimos 5 mensajes
    const transcript = ultimosMensajes.map(m => `${m.sender}: ${m.texto}`).join('\n')

    const message = await client.messages.create({
      model: 'claude-opus-4-1',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Basado en esta conversación de "${contexto}", calcula un lead score (0-100).
Responde en JSON: {"score": 0-100, "razón": "..."}

Conversación:
${transcript}`
      }]
    })

    try {
      return JSON.parse(message.content[0].text)
    } catch {
      return { score: 50, razón: 'No determinado' }
    }
  } catch (error) {
    console.error('Lead scoring error:', error)
    return { score: 50, razón: 'Error al analizar' }
  }
}

/**
 * Netlify Function Handler
 */
exports.handler = async (event) => {
  const { httpMethod, path, body: rawBody, queryStringParameters } = event
  const body = rawBody ? JSON.parse(rawBody) : {}

  try {
    // POST /api/v2/translate
    if (httpMethod === 'POST' && path.includes('/translate')) {
      const { texto, idiomaOrigen, idiomaDestino } = body

      if (!texto || !idiomaOrigen || !idiomaDestino) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Campos requeridos: texto, idiomaOrigen, idiomaDestino' })
        }
      }

      const traduccion = await traducirTexto(texto, idiomaOrigen, idiomaDestino)

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

    // POST /api/v2/translate-batch
    if (httpMethod === 'POST' && path.includes('/translate-batch')) {
      const { texto, idiomaOrigen, idiomasDestino = ['es', 'en', 'pt'] } = body

      if (!texto || !idiomaOrigen) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Campos requeridos: texto, idiomaOrigen' })
        }
      }

      const traducciones = await generarTraducciones(texto, idiomaOrigen, idiomasDestino)

      return {
        statusCode: 200,
        body: JSON.stringify({
          texto_original: texto,
          idioma_origen: idiomaOrigen,
          traducciones: JSON.parse(traducciones)
        })
      }
    }

    // POST /api/v2/detect-language
    if (httpMethod === 'POST' && path.includes('/detect-language')) {
      const { texto } = body

      if (!texto) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Campo requerido: texto' })
        }
      }

      const idioma = await detectarIdioma(texto)

      return {
        statusCode: 200,
        body: JSON.stringify({
          texto,
          idioma_detectado: idioma
        })
      }
    }

    // POST /api/v2/analyze-intention
    if (httpMethod === 'POST' && path.includes('/analyze-intention')) {
      const { texto, contexto = 'general' } = body

      if (!texto) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Campo requerido: texto' })
        }
      }

      const analisis = await analizarIntencion(texto, contexto)

      return {
        statusCode: 200,
        body: JSON.stringify({
          texto,
          contexto,
          ...analisis
        })
      }
    }

    // POST /api/v2/suggest-reply
    if (httpMethod === 'POST' && path.includes('/suggest-reply')) {
      const { textoOriginal, idiomaContacto, contexto = 'general' } = body

      if (!textoOriginal || !idiomaContacto) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Campos requeridos: textoOriginal, idiomaContacto' })
        }
      }

      const respuestaSugerida = await generarRespuestaSugerida(textoOriginal, idiomaContacto, contexto)

      return {
        statusCode: 200,
        body: JSON.stringify({
          respuesta_sugerida: respuestaSugerida
        })
      }
    }

    // POST /api/v2/lead-score
    if (httpMethod === 'POST' && path.includes('/lead-score')) {
      const { conversacion, contexto = 'venta_autos' } = body

      if (!conversacion || !Array.isArray(conversacion)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Campo requerido: conversacion (array)' })
        }
      }

      const score = await calcularLeadScore(conversacion, contexto)

      return {
        statusCode: 200,
        body: JSON.stringify({
          contexto,
          lead_score: score
        })
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
