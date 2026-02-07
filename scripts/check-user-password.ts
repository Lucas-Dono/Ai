/**
 * Script para verificar el password hash en la base de datos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('========== VERIFICANDO USUARIO EN BASE DE DATOS ==========\n');

    const user = await prisma.user.findUnique({
      where: {
        email: 'lucasdono391@gmail.com'
      },
      select: {
        id: true,
        email: true,
        password: true,
        plan: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Plan:', user.plan);
    console.log('  Created:', user.createdAt);
    console.log('  Updated:', user.updatedAt);
    console.log('');
    console.log('Password Hash:');
    console.log('  Tiene password:', !!user.password);
    console.log('  Longitud:', user.password?.length || 0);
    console.log('  Primeros 20 chars:', user.password?.substring(0, 20));
    console.log('  Hash completo:', user.password);
    console.log('');
    console.log('Análisis del hash:');

    if (user.password) {
      const parts = user.password.split(':');
      console.log('  Formato:', parts.length === 2 ? 'BETTER-AUTH (salt:hash)' : 'OTRO');

      if (parts.length === 2) {
        const [salt, hash] = parts;
        console.log('  Salt (hex):', salt);
        console.log('  Salt length:', salt.length, 'chars');
        console.log('  Hash (hex):', hash);
        console.log('  Hash length:', hash.length, 'chars');
      }

      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log('  Tipo: BCRYPT');
      } else if (parts.length === 2 && parts[0].length === 32 && parts[1].length === 128) {
        console.log('  Tipo: BETTER-AUTH SCRYPT');
      } else {
        console.log('  Tipo: DESCONOCIDO');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
