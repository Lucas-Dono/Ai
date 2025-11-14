/**
 * Script de prueba para el sistema de eventos aplicados
 *
 * Demuestra cómo aplicar eventos a agentes y verificar su impacto.
 */

import { prisma } from '@/lib/prisma';
import { getEventApplicationService } from '@/lib/worlds/event-application.service';
import { EventType } from '@/lib/worlds/event-types';

async function testEventApplication() {
  console.log('🎯 Testing Event Application System\n');

  // 1. Buscar un mundo de prueba (o crear uno)
  let world = await prisma.world.findFirst({
    where: { name: { contains: 'Test' } },
    include: {
      worldAgents: {
        take: 1,
        include: { agent: true },
      },
    },
  });

  if (!world || world.worldAgents.length === 0) {
    console.log('⚠️  No se encontró mundo de prueba con agentes');
    console.log('Creando mundo de prueba...\n');

    // Crear agente de prueba
    const testAgent = await prisma.agent.create({
      data: {
        name: 'María Test',
        description: 'Agente de prueba para sistema de eventos',
        systemPrompt: 'Eres María, una estudiante alegre.',
        kind: 'companion',
        profile: {},
        userId: null, // Sistema
        visibility: 'private',
      },
    });

    // Crear mundo de prueba
    world = await prisma.world.create({
      data: {
        name: 'Test World - Events',
        description: 'Mundo de prueba para sistema de eventos',
        userId: null, // Sistema
        visibility: 'private',
        worldAgents: {
          create: {
            agentId: testAgent.id,
          },
        },
      },
      include: {
        worldAgents: {
          include: { agent: true },
        },
      },
    });
  }

  const worldId = world.id;
  const agentId = world.worldAgents[0].agentId;
  const agentName = world.worldAgents[0].agent.name;

  console.log(`✅ Usando mundo: ${world.name} (${worldId})`);
  console.log(`✅ Usando agente: ${agentName} (${agentId})\n`);

  const eventService = getEventApplicationService(worldId);

  // ========================================
  // TEST 1: ILLNESS EVENT
  // ========================================
  console.log('━'.repeat(60));
  console.log('TEST 1: Aplicar evento de ENFERMEDAD');
  console.log('━'.repeat(60));

  const illnessResult = await eventService.applyEvent({
    worldId,
    agentId,
    eventType: EventType.ILLNESS,
    eventData: {
      healthDelta: -0.3,
      energyDelta: -0.4,
      duration: 5,
      description: `${agentName} se enfermó con gripe`,
    },
    reason: 'Test: Epidemia en la escuela',
  });

  console.log('\n✅ Resultado:', JSON.stringify(illnessResult, null, 2));

  // Verificar estado
  let stateDescription = await eventService.getAgentStateDescription(agentId);
  console.log('\n📊 Estado del agente:', stateDescription);

  let activeEffects = await eventService.getActiveEffects(agentId);
  console.log(`\n🔮 Efectos activos: ${activeEffects.length}`);
  activeEffects.forEach((effect) => {
    console.log(`  - ${effect.type}: severidad ${(effect.severity * 100).toFixed(0)}%, expira ${effect.expiresAt ? new Date(effect.expiresAt).toLocaleDateString() : 'nunca'}`);
  });

  // ========================================
  // TEST 2: SKILL LEARNED
  // ========================================
  console.log('\n' + '━'.repeat(60));
  console.log('TEST 2: Aplicar evento de APRENDIZAJE');
  console.log('━'.repeat(60));

  const skillResult = await eventService.applyEvent({
    worldId,
    agentId,
    eventType: EventType.SKILL_LEARNED,
    eventData: {
      skillName: 'Programación Python',
      skillLevel: 20,
      category: 'intellectual',
      description: `${agentName} aprendió Python básico`,
    },
    reason: 'Test: Completó curso online',
  });

  console.log('\n✅ Resultado:', JSON.stringify(skillResult, null, 2));

  stateDescription = await eventService.getAgentStateDescription(agentId);
  console.log('\n📊 Estado del agente:', stateDescription);

  // ========================================
  // TEST 3: ITEM ACQUIRED
  // ========================================
  console.log('\n' + '━'.repeat(60));
  console.log('TEST 3: Aplicar evento de ITEM OBTENIDO');
  console.log('━'.repeat(60));

  const itemResult = await eventService.applyEvent({
    worldId,
    agentId,
    eventType: EventType.ITEM_ACQUIRED,
    eventData: {
      itemName: 'Espada mágica',
      quantity: 1,
      category: 'weapon',
      description: `${agentName} encontró una espada mágica`,
    },
    reason: 'Test: Exploración del bosque',
  });

  console.log('\n✅ Resultado:', JSON.stringify(itemResult, null, 2));

  stateDescription = await eventService.getAgentStateDescription(agentId);
  console.log('\n📊 Estado del agente:', stateDescription);

  // ========================================
  // TEST 4: SKILL IMPROVED
  // ========================================
  console.log('\n' + '━'.repeat(60));
  console.log('TEST 4: Aplicar evento de MEJORA DE SKILL');
  console.log('━'.repeat(60));

  const improveResult = await eventService.applyEvent({
    worldId,
    agentId,
    eventType: EventType.SKILL_IMPROVED,
    eventData: {
      skillName: 'Programación Python',
      skillLevel: 15, // Mejora en 15 puntos
      description: `${agentName} mejoró sus habilidades de Python`,
    },
    reason: 'Test: Práctica adicional',
  });

  console.log('\n✅ Resultado:', JSON.stringify(improveResult, null, 2));

  stateDescription = await eventService.getAgentStateDescription(agentId);
  console.log('\n📊 Estado del agente:', stateDescription);

  // ========================================
  // TEST 5: RECOVERY
  // ========================================
  console.log('\n' + '━'.repeat(60));
  console.log('TEST 5: Aplicar evento de RECUPERACIÓN');
  console.log('━'.repeat(60));

  const recoveryResult = await eventService.applyEvent({
    worldId,
    agentId,
    eventType: EventType.RECOVERY,
    eventData: {
      healthDelta: 0.3,
      energyDelta: 0.2,
      duration: null, // Instantáneo
      description: `${agentName} se está recuperando`,
    },
    reason: 'Test: Medicación y reposo',
  });

  console.log('\n✅ Resultado:', JSON.stringify(recoveryResult, null, 2));

  stateDescription = await eventService.getAgentStateDescription(agentId);
  console.log('\n📊 Estado del agente:', stateDescription);

  // ========================================
  // RESUMEN FINAL
  // ========================================
  console.log('\n' + '━'.repeat(60));
  console.log('RESUMEN FINAL');
  console.log('━'.repeat(60));

  const finalAgent = await prisma.worldAgent.findUnique({
    where: {
      worldId_agentId: { worldId, agentId },
    },
  });

  console.log('\n📊 Estado final del agente:');
  console.log(`  - Health: ${(finalAgent!.health * 100).toFixed(0)}%`);
  console.log(`  - Energy: ${(finalAgent!.energy * 100).toFixed(0)}%`);
  console.log(`  - Skills: ${Array.isArray(finalAgent!.skills) ? (finalAgent!.skills as any[]).length : 0}`);
  console.log(`  - Inventory: ${Array.isArray(finalAgent!.inventory) ? (finalAgent!.inventory as any[]).length : 0}`);
  console.log(`  - Status Effects: ${Array.isArray(finalAgent!.statusEffects) ? (finalAgent!.statusEffects as any[]).length : 0}`);

  if (Array.isArray(finalAgent!.skills) && (finalAgent!.skills as any[]).length > 0) {
    console.log('\n🎓 Skills:');
    (finalAgent!.skills as any[]).forEach((skill: any) => {
      console.log(`  - ${skill.name}: nivel ${skill.level}`);
    });
  }

  if (Array.isArray(finalAgent!.inventory) && (finalAgent!.inventory as any[]).length > 0) {
    console.log('\n🎒 Inventario:');
    (finalAgent!.inventory as any[]).forEach((item: any) => {
      console.log(`  - ${item.name} x${item.quantity}`);
    });
  }

  activeEffects = await eventService.getActiveEffects(agentId);
  if (activeEffects.length > 0) {
    console.log('\n🔮 Efectos activos:');
    activeEffects.forEach((effect) => {
      const daysLeft = effect.expiresAt
        ? Math.ceil((new Date(effect.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : '∞';
      console.log(
        `  - ${effect.type}: ${(effect.severity * 100).toFixed(0)}% (expira en ${daysLeft} días)`
      );
    });
  }

  console.log('\n✅ Tests completados exitosamente!\n');
}

// Ejecutar tests
testEventApplication()
  .catch((error) => {
    console.error('❌ Error en tests:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
