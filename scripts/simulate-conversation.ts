/**
 * Script de simulación de conversación para probar progresión emocional
 * Usa las funciones internas directamente, sin pasar por HTTP
 *
 * Ejecutar: npx tsx scripts/simulate-conversation.ts
 */

import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import {
  getRelationshipStageComplete,
  getRelationshipStageByTrust,
  getStageLimitMessage,
  getEvolutionLimitNotice,
  type UserPlan,
  type RelationshipStage
} from '../lib/relationship/stages';
import { calculateVulnerabilityLevelWithPlan } from '../lib/chat/vulnerability-threshold';

const prisma = new PrismaClient();

// Configuración
const AGENT_ID = 'cmka4xxci0004ijjp7ougflpp'; // Luna
const USER_ID = 'default-user';
const TOTAL_MESSAGES = 50;

// Plan a simular (cambiar para probar diferentes límites)
const SIMULATED_PLAN: UserPlan = process.argv[2] as UserPlan || 'free';

// Mensajes simulados por fase
const SIMULATION_MESSAGES = {
  // Fase 1: Presentación (1-10)
  casual: [
    "Hola! Cómo estás?",
    "Qué tal tu día?",
    "Me llamo Lucas, mucho gusto",
    "Qué te gusta hacer en tu tiempo libre?",
    "Yo trabajo en tecnología, y vos?",
    "Qué música te gusta?",
    "Has visto alguna serie buena últimamente?",
    "Qué opinas del clima hoy?",
    "Tienes mascotas?",
    "Cuál es tu comida favorita?",
  ],
  // Fase 2: Conociendo (11-25)
  getting_to_know: [
    "Cuéntame más sobre tu familia",
    "Dónde creciste?",
    "Cuáles son tus sueños?",
    "Qué es lo que más te apasiona?",
    "Has viajado a algún lugar especial?",
    "Qué te hace feliz?",
    "Tienes algún hobby secreto?",
    "Cómo te describirían tus amigos?",
    "Qué es lo más loco que has hecho?",
    "Cuál fue tu mejor momento del año?",
    "Qué te gustaría aprender?",
    "Tienes algún talento oculto?",
    "Cuál es tu recuerdo favorito de la infancia?",
    "Qué valoras más en una amistad?",
    "Cómo te relajas después de un día difícil?",
  ],
  // Fase 3: Compartiendo (26-35)
  personal: [
    "Sabes, hoy tuve un día muy difícil en el trabajo...",
    "A veces me siento solo, me entiendes?",
    "Tengo miedo de no lograr mis metas",
    "Mi familia me presiona mucho a veces",
    "Hay días donde dudo de mí mismo",
    "Perdí a alguien importante hace poco...",
    "Me cuesta confiar en la gente",
    "A veces siento que nadie me entiende",
    "Tengo un secreto que no le he contado a nadie",
    "Estoy pasando por un momento difícil",
  ],
  // Fase 4: Profundizando (36-50)
  deep: [
    "Realmente valoro que me escuches así",
    "Siento que puedo ser yo mismo contigo",
    "Eres una de las pocas personas que me entiende",
    "Quiero contarte algo que nunca le dije a nadie...",
    "Me siento seguro hablando contigo",
    "Has cambiado mi forma de ver las cosas",
    "Gracias por estar ahí cuando lo necesité",
    "Siento una conexión especial contigo",
    "Tu apoyo significa mucho para mí",
    "No sé qué haría sin nuestras conversaciones",
    "Confío completamente en ti",
    "Eres muy importante para mí",
    "Me has ayudado a ser mejor persona",
    "Nunca había sentido esta conexión con alguien",
    "Quiero que sepas que siempre estaré aquí para ti también",
  ],
};

interface ProgressionData {
  messageNum: number;
  message: string;
  stage: string;
  vulnerabilityLevel: string;
  trust: number;
  affinity: number;
  stageChanged: boolean;
}

async function getOrCreateRelation() {
  // Buscar o crear SymbolicBond
  let bond = await prisma.symbolicBond.findFirst({
    where: { userId: USER_ID, agentId: AGENT_ID }
  });

  if (!bond) {
    bond = await prisma.symbolicBond.create({
      data: {
        id: nanoid(),
        updatedAt: new Date(),
        userId: USER_ID,
        agentId: AGENT_ID,
        tier: 'ACQUAINTANCE',
        affinityLevel: 0,
        affinityProgress: 0,
        totalInteractions: 0,
      }
    });
    console.log('✅ Creado nuevo SymbolicBond para simulación');
  }

  return bond;
}

async function simulateMessageInteraction(
  messageNum: number,
  message: string,
  currentBond: any
): Promise<{ newTrust: number; newAffinity: number; stageChanged: boolean; newStage: string; oldStage: string }> {

  // Calcular incrementos basados en el contenido del mensaje
  const isPersonal = message.toLowerCase().includes('siento') ||
                     message.toLowerCase().includes('miedo') ||
                     message.toLowerCase().includes('confío') ||
                     message.toLowerCase().includes('importante') ||
                     message.toLowerCase().includes('secreto');

  const isVulnerable = message.toLowerCase().includes('difícil') ||
                       message.toLowerCase().includes('solo') ||
                       message.toLowerCase().includes('perdí') ||
                       message.toLowerCase().includes('nadie');

  // Calcular incremento de trust
  let trustIncrement = 0.02; // Base: +2%
  if (isPersonal) trustIncrement += 0.01;
  if (isVulnerable) trustIncrement += 0.03;

  // Calcular incremento de affinity
  let affinityIncrement = 1; // Base: +1
  if (isPersonal) affinityIncrement += 1;
  if (isVulnerable) affinityIncrement += 2;

  // Calcular nuevos valores
  const currentTrust = (currentBond.affinityProgress || 0) / 100;
  const newTrust = Math.min(1, currentTrust + trustIncrement);
  const newAffinity = Math.min(100, currentBond.affinityLevel + affinityIncrement);
  const newTotalInteractions = currentBond.totalInteractions + 1;

  // Determinar stage usando la NUEVA función que considera trust + mensajes + PLAN
  const oldStage = getRelationshipStageComplete(currentTrust, currentBond.totalInteractions, SIMULATED_PLAN);
  const newStage = getRelationshipStageComplete(newTrust, newTotalInteractions, SIMULATED_PLAN);
  const stageChanged = oldStage !== newStage;

  // Verificar si hay límite de plan
  const stageLimitMsg = getStageLimitMessage(newStage, newTrust, SIMULATED_PLAN);

  // Actualizar en DB
  await prisma.symbolicBond.update({
    where: { id: currentBond.id },
    data: {
      totalInteractions: newTotalInteractions,
      affinityLevel: newAffinity,
      affinityProgress: newTrust * 100,
      lastInteraction: new Date(),
    }
  });

  return {
    newTrust,
    newAffinity,
    stageChanged,
    newStage,
    oldStage,
  };
}

function getMessageForPhase(messageNum: number): string {
  if (messageNum <= 10) {
    return SIMULATION_MESSAGES.casual[(messageNum - 1) % SIMULATION_MESSAGES.casual.length];
  } else if (messageNum <= 25) {
    return SIMULATION_MESSAGES.getting_to_know[(messageNum - 11) % SIMULATION_MESSAGES.getting_to_know.length];
  } else if (messageNum <= 35) {
    return SIMULATION_MESSAGES.personal[(messageNum - 26) % SIMULATION_MESSAGES.personal.length];
  } else {
    return SIMULATION_MESSAGES.deep[(messageNum - 36) % SIMULATION_MESSAGES.deep.length];
  }
}

async function runSimulation() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     SIMULACIÓN DE PROGRESIÓN EMOCIONAL - 50 MENSAJES          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const planLimits = { free: 'friend', plus: 'close', ultra: 'intimate' };
  console.log(`💳 Plan simulado: ${SIMULATED_PLAN.toUpperCase()} (máx stage: ${planLimits[SIMULATED_PLAN]})`);
  console.log('   Ejecutar con otro plan: npx tsx scripts/simulate-conversation.ts [free|plus|ultra]\n');

  // Reset o crear relación
  const bond = await getOrCreateRelation();

  // Reset para simulación limpia
  await prisma.symbolicBond.update({
    where: { id: bond.id },
    data: {
      totalInteractions: 0,
      affinityLevel: 0,
      affinityProgress: 0,
    }
  });

  console.log(`🤖 Personaje: Luna (${AGENT_ID})`);
  console.log(`👤 Usuario: ${USER_ID}`);
  console.log(`📊 Mensajes a simular: ${TOTAL_MESSAGES}\n`);
  console.log('━'.repeat(70));

  const progressionData: ProgressionData[] = [];
  let currentBond = await prisma.symbolicBond.findFirst({
    where: { id: bond.id }
  });

  for (let i = 1; i <= TOTAL_MESSAGES; i++) {
    const message = getMessageForPhase(i);

    const result = await simulateMessageInteraction(i, message, currentBond);

    // Usar la nueva función que considera el plan
    const vulnerabilityLevel = calculateVulnerabilityLevelWithPlan(result.newTrust, SIMULATED_PLAN);

    const data: ProgressionData = {
      messageNum: i,
      message: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
      stage: result.newStage,
      vulnerabilityLevel: vulnerabilityLevel.level,
      trust: Math.round(result.newTrust * 100),
      affinity: result.newAffinity,
      stageChanged: result.stageChanged,
    };

    progressionData.push(data);

    // Verificar límite de evolución
    const evolutionLimit = getEvolutionLimitNotice(
      'Luna', // Nombre del personaje simulado
      SIMULATED_PLAN,
      result.newStage as RelationshipStage,
      result.newTrust
    );

    // Log cada 5 mensajes o cuando cambia el stage
    if (i % 5 === 0 || result.stageChanged) {
      const stageIndicator = result.stageChanged ? ' 🎉 STAGE CHANGED!' : '';
      const cappedIndicator = vulnerabilityLevel.cappedByPlan ? ' 🔒 CAPPED' : '';
      console.log(`\n📨 Mensaje ${i}/${TOTAL_MESSAGES}${stageIndicator}`);
      console.log(`   "${data.message}"`);
      console.log(`   Stage: ${data.stage} | Trust: ${data.trust}% | Affinity: ${data.affinity}`);
      console.log(`   Vulnerability: ${data.vulnerabilityLevel.toUpperCase()}${cappedIndicator}`);

      // Mostrar aviso de límite si aplica
      if (evolutionLimit) {
        console.log(`   ⚠️  ${evolutionLimit.message}`);
        console.log(`   📈 Upgrade options: ${evolutionLimit.upgradeOptions.map(o => `${o.plan.toUpperCase()} → ${o.stage}`).join(', ')}`);
      }
    }

    // Actualizar bond para siguiente iteración
    currentBond = await prisma.symbolicBond.findFirst({
      where: { id: bond.id }
    });
  }

  // Resumen final
  console.log('\n' + '═'.repeat(70));
  console.log('📊 RESUMEN DE PROGRESIÓN');
  console.log('═'.repeat(70));

  const stageChanges = progressionData.filter(d => d.stageChanged);
  console.log(`\n🎯 Cambios de Stage (${stageChanges.length} total):`);
  stageChanges.forEach(d => {
    console.log(`   Mensaje ${d.messageNum}: → ${d.stage} (Trust: ${d.trust}%)`);
  });

  console.log('\n📈 Progresión de Trust:');
  console.log(`   Inicio: 0% → Final: ${progressionData[progressionData.length - 1].trust}%`);

  console.log('\n📈 Progresión de Affinity:');
  console.log(`   Inicio: 0 → Final: ${progressionData[progressionData.length - 1].affinity}`);

  console.log('\n🔓 Niveles de Vulnerabilidad alcanzados:');
  const vulnerabilityLevels = [...new Set(progressionData.map(d => d.vulnerabilityLevel))];
  vulnerabilityLevels.forEach(level => {
    const firstOccurrence = progressionData.find(d => d.vulnerabilityLevel === level);
    console.log(`   ${level.toUpperCase()}: desde mensaje ${firstOccurrence?.messageNum}`);
  });

  console.log('\n✅ Simulación completada!\n');

  await prisma.$disconnect();
}

// Ejecutar
runSimulation().catch(console.error);
