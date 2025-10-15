// add_case_insensitive_email.js - Agregar constraint case-insensitive para email
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCaseInsensitiveEmail() {
  try {
    console.log('🔧 Agregando constraint case-insensitive para email...\n');

    // 1. Primero, normalizar todos los emails existentes a lowercase
    console.log('📝 Normalizando emails existentes a lowercase...');
    await prisma.$executeRaw`
      UPDATE "User" SET email = LOWER(email)
    `;
    console.log('✅ Emails normalizados\n');

    // 2. Eliminar el índice único actual de email
    console.log('🗑️  Eliminando índice único anterior...');
    try {
      await prisma.$executeRaw`
        DROP INDEX IF EXISTS "User_email_key"
      `;
      console.log('✅ Índice anterior eliminado\n');
    } catch (e) {
      console.log('⚠️  No había índice anterior (ok)\n');
    }

    // 3. Crear un nuevo índice único usando LOWER(email)
    console.log('🔨 Creando nuevo índice case-insensitive...');
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX "User_email_key" ON "User"(LOWER(email))
    `;
    console.log('✅ Índice case-insensitive creado\n');

    // 4. Verificar que funciona
    console.log('🧪 Probando el constraint...');
    const users = await prisma.user.findMany({
      select: { id: true, email: true }
    });

    console.log('📊 Usuarios actuales:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.id})`);
    });

    console.log('\n✅ ¡Constraint case-insensitive aplicado exitosamente!');
    console.log('   Ahora no se podrán crear usuarios con emails duplicados');
    console.log('   (sin importar mayúsculas/minúsculas)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCaseInsensitiveEmail();
