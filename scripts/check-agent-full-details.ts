/**
 * Script para obtener TODOS los campos de un agente
 * Sin filtros ni select - raw data completa
 */

import { prisma } from '../lib/prisma';

async function checkAgentFullDetails(agentId: string) {
  console.log('\n🔍 === DETALLES COMPLETOS DEL AGENTE ===\n');
  console.log(`Agent ID: ${agentId}\n`);

  try {
    // Obtener el agente con TODOS sus campos
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      console.log('❌ AGENTE NO ENCONTRADO\n');
      return;
    }

    console.log('✅ AGENTE ENCONTRADO - TODOS LOS CAMPOS:\n');
    console.log(JSON.stringify(agent, null, 2));

    // También verificar si hay algún registro relacionado que pueda estar ocultándolo
    console.log('\n\n🔍 === VERIFICANDO TABLAS RELACIONADAS ===\n');

    // AgentAvailability
    const availability = await prisma.agentAvailability.findUnique({
      where: { agentId },
    });
    console.log('AgentAvailability:', availability ? 'EXISTS' : 'NOT FOUND');
    if (availability) {
      console.log(JSON.stringify(availability, null, 2));
    }

    // PersonalityCore
    const personality = await prisma.personalityCore.findUnique({
      where: { agentId },
    });
    console.log('\nPersonalityCore:', personality ? 'EXISTS' : 'NOT FOUND');

    // InternalState
    const internalState = await prisma.internalState.findUnique({
      where: { agentId },
    });
    console.log('InternalState:', internalState ? 'EXISTS' : 'NOT FOUND');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n✅ === VERIFICACIÓN COMPLETADA ===\n');
}

const agentId = process.argv[2];
if (!agentId) {
  console.error('❌ Uso: npx tsx scripts/check-agent-full-details.ts <agentId>\n');
  process.exit(1);
}

checkAgentFullDetails(agentId);
