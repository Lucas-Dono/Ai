const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSuperUser() {
  try {
    console.log('🚀 Creating super user account...\n');

    const email = 'Lucasdono391@gmail.com';
    const name = 'Lucas Dono';

    // Create user with Enterprise plan
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
    console.log('👑 Plan: Enterprise (acceso completo a todas las funciones)');
    console.log('🆔 User ID:', user.id);
    console.log('\n🎯 Límites del plan Enterprise:');
    console.log('   • Agentes: Ilimitados');
    console.log('   • Mensajes: Ilimitados');
    console.log('   • Mundos: Ilimitados');
    console.log('   • Tokens por mensaje: 8000');
    console.log('\n🔐 Para iniciar sesión:');
    console.log('   1. Ve a: http://localhost:3000/api/auth/signin');
    console.log('   2. Usa "Sign in with Google" con tu cuenta de Google');
    console.log('   3. O configura Google OAuth en .env para login directo');
    console.log('\n💡 Nota: La cuenta se creó sin contraseña.');
    console.log('   Usa Google OAuth para iniciar sesión.\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  El usuario ya existe en la base de datos.');
      console.log('   Email:', email);
      
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
        select: { id: true, plan: true, name: true }
      });
      
      console.log('   Plan actual:', existingUser.plan);
      console.log('\n🔄 ¿Quieres actualizar el plan a Enterprise?');
    } else {
      console.error('❌ Error creating super user:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperUser();
