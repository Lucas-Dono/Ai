import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAgent() {
  const agentId = 'cmj4m65fe0001ij7on14obld4';

  console.log(`🗑️  Eliminando Agent ${agentId}...`);

  try {
    await prisma.agent.delete({
      where: { id: agentId },
    });
    console.log('✅ Agent eliminado exitosamente');
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.log('ℹ️  Agent no encontrado (ya fue eliminado)');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  await prisma.$disconnect();
}

deleteAgent().catch(console.error);
