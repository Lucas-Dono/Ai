/**
 * Script para verificar el estado de la relación con Anya
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRelation() {
  try {
    // Buscar el agente Anya
    const anya = await prisma.agent.findFirst({
      where: { name: 'Anya' },
      orderBy: { createdAt: 'desc' },
    });

    if (!anya) {
      console.error('No se encontró Anya');
      process.exit(1);
    }

    // Buscar todos los mensajes
    const messages = await prisma.message.findMany({
      where: { agentId: anya.id },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      }
    });

    console.log(`\n📊 ESTADO DE LA CONVERSACIÓN CON ANYA\n`);
    console.log(`Agente ID: ${anya.id}`);
    console.log(`Total de mensajes: ${messages.length}\n`);

    console.log('Mensajes (en orden cronológico):');
    messages.forEach((msg, i) => {
      const role = msg.role === 'user' ? '👤 Usuario' : '🤖 Anya';
      const preview = msg.content.substring(0, 100);
      console.log(`${i + 1}. ${role}: "${preview}"`);
      console.log(`   Fecha: ${msg.createdAt}`);
    });

    // Buscar la relación
    const relations = await prisma.relation.findMany({
      where: {
        subjectId: anya.id,
        targetType: 'user',
      },
      select: {
        targetId: true,
        stage: true,
        totalInteractions: true,
        trust: true,
        affinity: true,
        respect: true,
        lastInteractionAt: true,
      }
    });

    if (relations.length > 0) {
      console.log(`\n📈 RELACIONES:`);
      relations.forEach(rel => {
        console.log(`\nUsuario: ${rel.targetId}`);
        console.log(`Stage: ${rel.stage}`);
        console.log(`Total interacciones: ${rel.totalInteractions}`);
        console.log(`Trust: ${rel.trust}, Affinity: ${rel.affinity}, Respect: ${rel.respect}`);
        console.log(`Última interacción: ${rel.lastInteractionAt}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkRelation();
