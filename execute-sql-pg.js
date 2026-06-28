import { Client } from 'pg'
import fs from 'fs'

const connectionString = 'postgresql://postgres:[PASSWORD]@db.xeypxgwbhpvxifiwmztk.supabase.co:5432/postgres'

async function executeSQL() {
  const client = new Client({
    connectionString: connectionString.replace('[PASSWORD]', process.env.DB_PASSWORD)
  })

  try {
    console.log('📖 Leyendo reset_database.sql...')
    const sqlContent = fs.readFileSync('./reset_database.sql', 'utf-8')

    console.log('🔗 Conectando a Supabase PostgreSQL...')
    await client.connect()

    console.log('🚀 Ejecutando SQL...')
    // Dividir por COMMIT para ejecutar en bloques
    const statements = sqlContent.split(';').filter(s => s.trim())

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim()
      if (stmt) {
        try {
          console.log(`   [${i + 1}/${statements.length}] Ejecutando...`)
          await client.query(stmt)
        } catch (e) {
          console.error(`   ❌ Error en statement ${i + 1}:`, e.message)
          // Continuar con el siguiente
        }
      }
    }

    console.log('✅ SQL ejecutado exitosamente')

    // Verificar datos
    console.log('\n📊 Verificando datos en la BD:')
    const result = await client.query(`
      SELECT 'Usuarios' as tabla, COUNT(*) as total FROM users
      UNION ALL
      SELECT 'Rooms', COUNT(*) FROM rooms
      UNION ALL
      SELECT 'Guest Sessions', COUNT(*) FROM guest_sessions
      UNION ALL
      SELECT 'Messages', COUNT(*) FROM messages
      UNION ALL
      SELECT 'Translations', COUNT(*) FROM translations
    `)
    console.table(result.rows)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

executeSQL()
