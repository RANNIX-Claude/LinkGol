import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import fs from 'fs'

const SUPABASE_URL = 'https://xeypxgwbhpvxifiwmztk.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está definida')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  realtime: { transport: ws }
})

async function executeSQL() {
  try {
    console.log('📖 Leyendo reset_database.sql...')
    const sqlContent = fs.readFileSync('./reset_database.sql', 'utf-8')

    console.log('🚀 Ejecutando SQL en Supabase...')
    const { data, error } = await supabase.rpc('exec', { sql: sqlContent })

    if (error) {
      console.error('❌ Error:', error.message)
      process.exit(1)
    }

    console.log('✅ SQL ejecutado exitosamente')
    console.log('📊 Resultado:', data)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

executeSQL()
