#!/usr/bin/env tsx
/**
 * Script de Migración: Crear y Enriquecer PersonalityCores
 *
 * Para cada agente:
 * 1. Si NO tiene PersonalityCore → crear uno con valores por defecto + dimensiones enriquecidas
 * 2. Si SÍ tiene PersonalityCore → migrar a formato enriquecido
 *
 * IMPORTANTE: Este script modifica la base de datos. Hacer backup antes de ejecutar.
 *
 * Uso:
 *   npx tsx scripts/create-and-migrate-personality-cores.ts
 *   npx tsx scripts/create-and-migrate-personality-cores.ts --dry-run
 */

import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { inferFacetsFromBigFive } from '@/lib/psychological-analysis/facet-inference';
import { normalizeCoreValuesToStringArray } from '@/lib/psychological-analysis/corevalues-normalizer';
import type { BigFiveFacets, DarkTriad, AttachmentProfile, PsychologicalNeeds } from '@/lib/psychological-analysis/types';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// ============================================================================
// UTILIDADES DE LOGGING
// ============================================================================

const log = {
  info: (msg: string) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  debug: (msg: string) => VERBOSE && console.log(`\x1b[90m  ${msg}\x1b[0m`),
  section: (msg: string) => console.log(`\n\x1b[1m${msg}\x1b[0m`),
};

// ============================================================================
// INFERENCIA DE BIG FIVE DESDE PERFIL
// ============================================================================

function inferBigFiveFromAgent(agent: any): {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
} {
  // Valores por defecto balanceados
  const defaults = {
    openness: 60,
    conscientiousness: 55,
    extraversion: 50,
    agreeableness: 65,
    neuroticism: 45,
  };

  // Si tiene profile con psychology, usarlo
  if (agent.profile && typeof agent.profile === 'object' && 'psychology' in agent.profile) {
    const psychology = (agent.profile as any).psychology;
    if (psychology && psychology.bigFive) {
      return {
        openness: psychology.bigFive.openness || defaults.openness,
        conscientiousness: psychology.bigFive.conscientiousness || defaults.conscientiousness,
        extraversion: psychology.bigFive.extraversion || defaults.extraversion,
        agreeableness: psychology.bigFive.agreeableness || defaults.agreeableness,
        neuroticism: psychology.bigFive.neuroticism || defaults.neuroticism,
      };
    }
  }

  // Fallback: analizar descripción/personalidad
  const text = `${agent.description || ''} ${agent.personality || ''}`.toLowerCase();

  let bigFive = { ...defaults };

  // Análisis heurístico simple
  if (text.includes('creativ') || text.includes('imaginativ') || text.includes('artist')) {
    bigFive.openness += 20;
  }
  if (text.includes('organized') || text.includes('disciplin') || text.includes('responsabl')) {
    bigFive.conscientiousness += 15;
  }
  if (text.includes('social') || text.includes('extrovert') || text.includes('outgoing')) {
    bigFive.extraversion += 20;
  }
  if (text.includes('kind') || text.includes('compassion') || text.includes('empat')) {
    bigFive.agreeableness += 15;
  }
  if (text.includes('anxious') || text.includes('nervous') || text.includes('worry')) {
    bigFive.neuroticism += 20;
  }

  // Clamp values
  Object.keys(bigFive).forEach(key => {
    bigFive[key as keyof typeof bigFive] = Math.min(100, Math.max(0, bigFive[key as keyof typeof bigFive]));
  });

  return bigFive;
}

// ============================================================================
// INFERENCIA DE ATTACHMENT STYLE
// ============================================================================

function inferAttachmentProfile(bigFive: {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}): AttachmentProfile {
  const { neuroticism, extraversion, agreeableness } = bigFive;

  let primaryStyle: AttachmentProfile['primaryStyle'] = 'secure';
  let intensity = 50;

  if (neuroticism > 70 && extraversion > 60) {
    primaryStyle = 'anxious';
    intensity = Math.min(neuroticism, 85);
  } else if (neuroticism < 40 && agreeableness > 60 && extraversion > 50) {
    primaryStyle = 'secure';
    intensity = 40;
  } else if (extraversion < 40 && agreeableness < 50) {
    primaryStyle = 'avoidant';
    intensity = Math.min(100 - extraversion, 80);
  } else if (neuroticism > 60 && extraversion < 50 && agreeableness < 50) {
    primaryStyle = 'fearful-avoidant';
    intensity = Math.min((neuroticism + (100 - extraversion)) / 2, 90);
  }

  return {
    primaryStyle,
    intensity: Math.round(intensity),
    manifestations: [],
  };
}

// ============================================================================
// INFERENCIA DE DARK TRIAD
// ============================================================================

function inferDarkTriad(bigFive: {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}): DarkTriad {
  const { agreeableness, conscientiousness, neuroticism } = bigFive;

  let machiavellianism = 20;
  let narcissism = 15;
  let psychopathy = 10;

  if (agreeableness < 40 && conscientiousness > 60) {
    machiavellianism = 40 + Math.round((100 - agreeableness) * 0.2);
  }
  if (agreeableness < 40 && neuroticism < 40) {
    narcissism = 35 + Math.round((100 - agreeableness) * 0.15);
  }
  if (agreeableness < 30 && neuroticism < 30) {
    psychopathy = 30 + Math.round((100 - agreeableness) * 0.2);
  }

  return {
    machiavellianism: Math.min(machiavellianism, 100),
    narcissism: Math.min(narcissism, 100),
    psychopathy: Math.min(psychopathy, 100),
  };
}

// ============================================================================
// INFERENCIA DE PSYCHOLOGICAL NEEDS
// ============================================================================

function inferPsychologicalNeeds(bigFive: {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}): PsychologicalNeeds {
  return {
    connection: bigFive.extraversion / 100,
    autonomy: (100 - bigFive.neuroticism) / 100,
    competence: (bigFive.conscientiousness + bigFive.openness) / 200,
    novelty: bigFive.openness / 100,
  };
}

// ============================================================================
// CREAR PERSONALITYCORE NUEVO
// ============================================================================

async function createPersonalityCoreForAgent(agent: any) {
  log.info(`Creando PersonalityCore para "${agent.name}" (${agent.id})`);

  // 1. Inferir Big Five
  const bigFive = inferBigFiveFromAgent(agent);
  log.debug(`  Big Five inferido: O=${bigFive.openness} C=${bigFive.conscientiousness} E=${bigFive.extraversion} A=${bigFive.agreeableness} N=${bigFive.neuroticism}`);

  // 2. Core values por defecto
  const coreValuesArray = ['honestidad', 'lealtad', 'compasión'];

  // 3. Inferir dimensiones enriquecidas
  const facets: BigFiveFacets = inferFacetsFromBigFive(bigFive);
  const darkTriad: DarkTriad = inferDarkTriad(bigFive);
  const attachmentProfile: AttachmentProfile = inferAttachmentProfile(bigFive);
  const psychologicalNeeds: PsychologicalNeeds = inferPsychologicalNeeds(bigFive);

  // 4. Construir coreValues enriquecido
  const enrichedCoreValues = {
    values: coreValuesArray,
    bigFiveFacets: facets,
    darkTriad,
    attachmentProfile,
    psychologicalNeeds,
  };

  log.debug(`  ✨ Dimensiones enriquecidas generadas`);
  log.debug(`     - Attachment: ${attachmentProfile.primaryStyle} (${attachmentProfile.intensity}%)`);
  log.debug(`     - Dark Triad: M=${darkTriad.machiavellianism} N=${darkTriad.narcissism} P=${darkTriad.psychopathy}`);

  // 5. Crear en BD
  if (!DRY_RUN) {
    await prisma.personalityCore.create({
      data: {
        id: nanoid(),
        agentId: agent.id,
        openness: bigFive.openness,
        conscientiousness: bigFive.conscientiousness,
        extraversion: bigFive.extraversion,
        agreeableness: bigFive.agreeableness,
        neuroticism: bigFive.neuroticism,
        coreValues: enrichedCoreValues as any,
        moralSchemas: [],
        baselineEmotions: {
          joy: 0.5,
          sadness: 0.3,
          anger: 0.2,
          fear: 0.3,
          surprise: 0.5,
          disgust: 0.2,
          trust: 0.5,
          anticipation: 0.5,
        },
      },
    });
    log.success(`  ✓ PersonalityCore creado`);
  } else {
    log.info(`  [DRY-RUN] PersonalityCore no creado`);
  }

  return { created: true, agentId: agent.id };
}

// ============================================================================
// MIGRAR PERSONALITYCORE EXISTENTE
// ============================================================================

async function migratePersonalityCore(personalityCore: any) {
  log.info(`Migrando PersonalityCore para Agent ${personalityCore.agentId}`);

  const bigFive = {
    openness: personalityCore.openness,
    conscientiousness: personalityCore.conscientiousness,
    extraversion: personalityCore.extraversion,
    agreeableness: personalityCore.agreeableness,
    neuroticism: personalityCore.neuroticism,
  };

  const currentCoreValues = personalityCore.coreValues;
  const coreValuesArray = normalizeCoreValuesToStringArray(currentCoreValues);

  // Verificar si ya tiene formato enriquecido
  if (
    typeof currentCoreValues === 'object' &&
    !Array.isArray(currentCoreValues) &&
    currentCoreValues !== null &&
    ('bigFiveFacets' in currentCoreValues || 'darkTriad' in currentCoreValues)
  ) {
    log.warn(`  ⏭️  Ya tiene formato enriquecido, saltando...`);
    return { skipped: true, reason: 'already_enriched' };
  }

  // Inferir dimensiones enriquecidas
  const facets: BigFiveFacets = inferFacetsFromBigFive(bigFive);
  const darkTriad: DarkTriad = inferDarkTriad(bigFive);
  const attachmentProfile: AttachmentProfile = inferAttachmentProfile(bigFive);
  const psychologicalNeeds: PsychologicalNeeds = inferPsychologicalNeeds(bigFive);

  const enrichedCoreValues = {
    values: coreValuesArray,
    bigFiveFacets: facets,
    darkTriad,
    attachmentProfile,
    psychologicalNeeds,
  };

  log.debug(`  ✨ Dimensiones enriquecidas generadas`);

  if (!DRY_RUN) {
    await prisma.personalityCore.update({
      where: { id: personalityCore.id },
      data: {
        coreValues: enrichedCoreValues as any,
      },
    });
    log.success(`  ✓ PersonalityCore migrado`);
  } else {
    log.info(`  [DRY-RUN] Cambios no aplicados`);
  }

  return { migrated: true, agentId: personalityCore.agentId };
}

// ============================================================================
// FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  log.section('═══════════════════════════════════════════════════════════════');
  log.section('  CREAR Y MIGRAR: PersonalityCores Enriquecidos');
  log.section('═══════════════════════════════════════════════════════════════');

  if (DRY_RUN) {
    log.warn('MODO DRY-RUN: No se aplicarán cambios a la base de datos');
  } else {
    log.warn('⚠️  MODO PRODUCCIÓN: Los cambios se aplicarán a la base de datos');
  }

  console.log('');

  // 1. Contar agentes
  const totalAgents = await prisma.agent.count();
  log.info(`Total de Agentes: ${totalAgents}`);

  if (totalAgents === 0) {
    log.warn('No hay agentes para procesar');
    return;
  }

  // 2. Obtener todos los agentes con sus PersonalityCores
  log.info('Cargando agentes...');
  const agents = await prisma.agent.findMany({
    include: {
      PersonalityCore: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const withoutCore = agents.filter(a => !a.PersonalityCore);
  const withCore = agents.filter(a => a.PersonalityCore);

  log.success(`${agents.length} agentes cargados`);
  log.info(`  - Sin PersonalityCore: ${withoutCore.length}`);
  log.info(`  - Con PersonalityCore: ${withCore.length}\n`);

  // 3. Crear PersonalityCores faltantes
  if (withoutCore.length > 0) {
    log.section('Creando PersonalityCores faltantes...\n');

    let created = 0;
    let errors = 0;

    for (const agent of withoutCore) {
      try {
        await createPersonalityCoreForAgent(agent);
        created++;
      } catch (error) {
        errors++;
        log.error(`Error al crear PersonalityCore para ${agent.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    log.section(`\n✓ PersonalityCores creados: ${created}`);
    if (errors > 0) log.error(`✗ Errores: ${errors}`);
  }

  // 4. Migrar PersonalityCores existentes
  if (withCore.length > 0) {
    log.section('\nMigrando PersonalityCores existentes...\n');

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const agent of withCore) {
      try {
        const result = await migratePersonalityCore(agent.PersonalityCore);
        if (result.skipped) {
          skipped++;
        } else {
          migrated++;
        }
      } catch (error) {
        errors++;
        log.error(`Error al migrar PersonalityCore de ${agent.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    log.section(`\n✓ PersonalityCores migrados: ${migrated}`);
    log.warn(`⏭️  Saltados: ${skipped}`);
    if (errors > 0) log.error(`✗ Errores: ${errors}`);
  }

  // 5. Resumen final
  log.section('\n═══════════════════════════════════════════════════════════════');
  log.section('  RESUMEN FINAL');
  log.section('═══════════════════════════════════════════════════════════════\n');

  log.success(`✨ Proceso completado`);
  log.info(`Total de agentes procesados: ${agents.length}\n`);

  if (DRY_RUN) {
    log.section('💡 Para aplicar los cambios, ejecuta sin --dry-run:');
    log.info('   npx tsx scripts/create-and-migrate-personality-cores.ts\n');
  }
}

// ============================================================================
// EJECUCIÓN
// ============================================================================

main()
  .catch((error) => {
    log.error(`Error fatal: ${error instanceof Error ? error.message : String(error)}`);
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
