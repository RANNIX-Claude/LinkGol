import fs from 'fs'
import https from 'https'

const SUPABASE_URL = 'xeypxgwbhpvxifiwmztk.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida')
  process.exit(1)
}

async function executeSQL() {
  try {
    console.log('📖 Leyendo reset_database.sql...')
    const sqlContent = fs.readFileSync('./reset_database.sql', 'utf-8')

    console.log('🚀 Ejecutando SQL en Supabase SQL Editor...')

    const data = JSON.stringify({ query: sqlContent })

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/api/v1/sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json'
      }
    }

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          if (res.statusCode >= 400) {
            console.error(`❌ Error HTTP ${res.statusCode}:`, responseData)
            reject(new Error(`HTTP ${res.statusCode}`))
          } else {
            console.log('✅ SQL ejecutado exitosamente')
            console.log('📊 Respuesta:', responseData.substring(0, 500))
            resolve()
          }
        })
      })

      req.on('error', (error) => {
        console.error('❌ Error de conexión:', error.message)
        reject(error)
      })

      req.write(data)
      req.end()
    })
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

executeSQL().catch(() => process.exit(1))
