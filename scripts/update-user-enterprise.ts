/**
 * Script para actualizar usuario a plan enterprise
 */

import { prisma } from "../lib/prisma";

async function main() {
  const email = "lucasdono391@gmail.com";

  console.log(`🔍 Buscando usuario: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`❌ Usuario no encontrado: ${email}`);
    console.log("\n💡 Usuarios disponibles:");
    const allUsers = await prisma.user.findMany({
      select: { email: true, name: true, plan: true }
    });
    allUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.name || 'sin nombre'}) - Plan: ${u.plan || 'free'}`);
    });
    return;
  }

  console.log(`✅ Usuario encontrado:`);
  console.log(`   Nombre: ${user.name || 'sin nombre'}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Plan actual: ${user.plan || 'free'}`);

  // Actualizar a enterprise
  const updated = await prisma.user.update({
    where: { email },
    data: {
      plan: 'enterprise'
    }
  });

  console.log(`\n🎉 ¡Usuario actualizado exitosamente!`);
  console.log(`   Plan nuevo: ${updated.plan}`);
  console.log(`   Email: ${updated.email}`);
  console.log(`\n✨ Beneficios de Enterprise:`);
  console.log(`   • Mensajes ilimitados`);
  console.log(`   • Tokens ilimitados`);
  console.log(`   • Agentes ilimitados`);
  console.log(`   • Sin rate limits`);
  console.log(`   • Acceso completo al behavior system`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
