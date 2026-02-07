import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'lucasdono391@gmail.com' },
    select: { password: true },
  });

  if (!user || !user.password) {
    console.log('Usuario no encontrado o sin contraseña');
    return;
  }

  const testPassword = 'Monster98!';
  console.log('Verificando contraseña:', testPassword);
  console.log('Hash en BD:', user.password.substring(0, 30) + '...');

  const isValid = await bcrypt.compare(testPassword, user.password);
  console.log('');
  if (isValid) {
    console.log('CONTRASEÑA CORRECTA!');
  } else {
    console.log('CONTRASEÑA INCORRECTA');
    console.log('');
    console.log('Probando otras variantes:');
    
    const variants = [
      'monster98!',
      'MONSTER98!',
      'Monster98',
      'monster98',
    ];
    
    for (const variant of variants) {
      const result = await bcrypt.compare(variant, user.password);
      console.log('  ' + variant + ': ' + (result ? 'SI' : 'NO'));
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
