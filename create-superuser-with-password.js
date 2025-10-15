const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Simple password hashing function (NextAuth compatible)
function hashPassword(password) {
  // Using SHA-256 for simplicity - NextAuth will handle proper bcrypt when user logs in
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function createSuperUser() {
  try {
    console.log('🚀 Creating super user account with password...\n');

    const email = 'Lucasdono391@gmail.com';
    const password = '04LucasDono17!';
    const name = 'Lucas Dono';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log('   Updating to Enterprise plan...\n');
      
      const updatedUser = await prisma.user.update({
        where: { email: email },
        data: { 
          plan: 'enterprise',
          emailVerified: new Date(),
        },
      });

      console.log('✅ User updated successfully!\n');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👑 Plan: Enterprise (actualizado)');
      console.log('🆔 User ID:', updatedUser.id);
      
    } else {
      // Create new user with Enterprise plan
      const user = await prisma.user.create({
        data: {
          email: email,
          name: name,
          plan: 'enterprise',
          emailVerified: new Date(),
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
        },
      });

      console.log('✅ Super user created successfully!\n');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      console.log('👑 Plan: Enterprise');
      console.log('🆔 User ID:', user.id);
    }

    console.log('\n🎯 Límites del plan Enterprise:');
    console.log('   • Agentes: Ilimitados');
    console.log('   • Mensajes: Ilimitados');
    console.log('   • Mundos: Ilimitados');
    console.log('   • Tokens por mensaje: 8000');
    console.log('\n🔐 Para iniciar sesión:');
    console.log('   1. Ve a: http://localhost:3000/api/auth/signin');
    console.log('   2. Usa el botón "Sign in with Email"');
    console.log('   3. Ingresa:', email);
    console.log('   4. NextAuth te enviará un link mágico al email');
    console.log('\n💡 Nota: NextAuth usa "magic links" por email por defecto.');
    console.log('   No necesitas contraseña, solo acceso a tu email.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();
