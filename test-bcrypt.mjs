import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Obtener el usuario con el mismo query que usa minecraft-login
  const user = await prisma.user.findUnique({
    where: { email: 'lucasdono391@gmail.com'.toLowerCase() },
    select: {
      id: true,
      email: true,
      password: true,
    },
  });

  console.log('Usuario encontrado:', user.id);
  console.log('Email:', user.email);
  console.log('Password hash completo:', user.password);
  console.log('');
  
  // Probar con diferentes contraseñas
  const passwords = [
    'Monster98!',
    'monster98!',
  ];
  
  for (const pwd of passwords) {
    console.log('Probando:', pwd);
    const result = await bcrypt.compare(pwd, user.password);
    console.log('  Resultado:', result ? 'CORRECTO' : 'INCORRECTO');
  }
  
  console.log('');
  console.log('Ahora probemos buscar SIN toLowerCase:');
  
  const user2 = await prisma.user.findUnique({
    where: { email: 'lucasdono391@gmail.com' },
    select: {
      email: true,
      password: true,
    },
  });
  
  if (user2) {
    console.log('Usuario encontrado (sin toLowerCase)');
    console.log('Password hash:', user2.password);
    console.log('¿Es el mismo hash?', user.password === user2.password);
  } else {
    console.log('NO se encontró usuario sin toLowerCase');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
