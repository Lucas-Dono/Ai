/**
 * Script para limpiar personajes duplicados y con nombres incorrectos de la BD
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// IDs que QUEREMOS MANTENER (los que tienen nombres correctos)
const KEEP_IDS = [
  'historical_albert_einstein',
  'premium_luna_digital_intimacy',
  'premium_marcus_quantum_mind',
  'historical_marilyn_monroe',
  'premium_sofia_emotional_archaeologist',
  'free_ana_demo',
  'free_carlos_demo',
];

async function main() {
  console.log('🧹 LIMPIEZA DE PERSONAJES DUPLICADOS Y CON NOMBRES INCORRECTOS\n');

  // Obtener todos los agentes del sistema
  const allAgents = await prisma.agent.findMany({
    where: { userId: null },
    select: { id: true, name: true },
  });

  console.log(`📋 Total de agentes del sistema: ${allAgents.length}\n`);

  // Identificar cuáles eliminar
  const toDelete = allAgents.filter(a => !KEEP_IDS.includes(a.id));

  console.log(`🗑️  Personajes a eliminar: ${toDelete.length}\n`);

  if (toDelete.length === 0) {
    console.log('✅ No hay personajes para eliminar');
    await prisma.$disconnect();
    return;
  }

  // Mostrar lista
  toDelete.forEach((a, i) => {
    console.log(`${i + 1}. ${a.name}`);
    console.log(`   ID: ${a.id}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🗑️  Eliminando personajes...\n');

  // Eliminar uno por uno
  let deleted = 0;
  let errors = 0;

  for (const agent of toDelete) {
    try {
      await prisma.agent.delete({
        where: { id: agent.id },
      });
      console.log(`✅ Eliminado: ${agent.name} (${agent.id})`);
      deleted++;
    } catch (error) {
      console.error(`❌ Error eliminando ${agent.name}:`, error instanceof Error ? error.message : error);
      errors++;
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Eliminados: ${deleted}`);
  console.log(`❌ Errores: ${errors}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Verificar cuántos quedan
  const remaining = await prisma.agent.count({
    where: { userId: null },
  });

  console.log(`📋 Personajes del sistema restantes: ${remaining}`);
  console.log('   (Deberían ser los 7 que queremos mantener)\n');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
