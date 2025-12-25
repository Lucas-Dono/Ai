const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Intentando conectar a la base de datos...');
    console.log('URL:', process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@'));

    await client.connect();
    console.log('✅ Conexión exitosa!');

    const result = await client.query('SELECT COUNT(*) FROM "Agent" WHERE "userId" IS NULL AND featured = true');
    console.log(`📊 Personajes premium en BD: ${result.rows[0].count}`);

  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('Detalles:', error.code || 'sin código de error');
  } finally {
    await client.end();
  }
}

testConnection();
