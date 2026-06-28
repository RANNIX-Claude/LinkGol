import QRCode from 'qrcode'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// POST /api/v1/documents/qr — Generar código QR
export const generateQR = async (req) => {
  if (req.method !== 'POST') return { statusCode: 405 }

  try {
    const { room_id, size = 300, format = 'png' } = JSON.parse(req.body)

    // Obtener QR URL de la sala
    const { data: room, error } = await supabase
      .from('rooms')
      .select('qr_url')
      .eq('id', room_id)
      .single()

    if (error) throw error

    // Generar QR
    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/' + format,
      width: size,
      margin: 1,
      color: {
        dark: '#0052CC',  // Primary color
        light: '#FFFFFF'
      }
    }

    const qrImage = await QRCode.toDataURL(room.qr_url, qrOptions)

    // Guardar en Supabase Storage (si es necesario)
    // const buffer = Buffer.from(qrImage.split(',')[1], 'base64')
    // await supabase.storage
    //   .from('qr-codes')
    //   .upload(`${room_id}.png`, buffer)

    return {
      statusCode: 200,
      body: JSON.stringify({
        qr_code_base64: qrImage,
        qr_url: room.qr_url,
        size,
        format,
        generated_at: new Date().toISOString()
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/documents/upload — Subir archivo
export const uploadFile = async (req) => {
  try {
    // Nota: Netlify Functions no soportan multipart nativo
    // En producción, usar presigned URLs de Supabase Storage

    const { room_id, base64_file, filename, mime_type } = JSON.parse(req.body)

    // Convertir base64 a Buffer
    const buffer = Buffer.from(base64_file, 'base64')

    // Subir a Supabase Storage
    const path = `rooms/${room_id}/${filename}`
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, buffer, {
        contentType: mime_type,
        upsert: false
      })

    if (error) throw error

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(path)

    return {
      statusCode: 201,
      body: JSON.stringify({
        file_id: data.path,
        url: publicUrl,
        size_kb: (buffer.length / 1024).toFixed(2),
        mime_type,
        uploaded_at: new Date().toISOString()
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/documents/compress — Comprimir imagen
export const compressImage = async (req) => {
  try {
    // En producción: usar librería como sharp
    // Para este MVP, simular compression ratio

    const { file_id, target_size_kb = 500 } = JSON.parse(req.body)

    // Placeholder: En producción, usar sharp
    // const compressed = await sharp(buffer)
    //   .resize(Math.floor(Math.sqrt(target_size_kb * 1024)))
    //   .toBuffer()

    return {
      statusCode: 200,
      body: JSON.stringify({
        compressed_file_id: `${file_id}_compressed`,
        original_kb: 1200,
        compressed_kb: 480,
        savings_percent: 60,
        compression_quality: 'high',
        note: 'Use sharp library in production for actual image compression'
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

// POST /api/v1/documents/presigned-url — Obtener URL firmada para upload
export const getPresignedUploadURL = async (req) => {
  try {
    const { room_id, filename, mime_type } = JSON.parse(req.body)

    // Supabase Storage presigned URLs
    const path = `rooms/${room_id}/${filename}`

    // En producción:
    // const { data, error } = await supabase.storage
    //   .from('documents')
    //   .createSignedUploadUrl(path)

    return {
      statusCode: 200,
      body: JSON.stringify({
        upload_url: `https://${process.env.SUPABASE_URL}/storage/v1/object/upload/documents/${path}`,
        method: 'PUT',
        headers: {
          'Content-Type': mime_type,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        expires_in_seconds: 3600,
        note: 'Send file content as request body (PUT)'
      })
    }
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) }
  }
}

export const handler = async (event) => {
  const path = event.path.split('/')
  const method = event.httpMethod

  if (path.includes('qr') && method === 'POST') return generateQR(event)
  if (path.includes('upload') && method === 'POST') return uploadFile(event)
  if (path.includes('compress') && method === 'POST') return compressImage(event)
  if (path.includes('presigned') && method === 'POST') return getPresignedUploadURL(event)

  return { statusCode: 404, body: JSON.stringify({ error: 'Not found' }) }
}
