#!/usr/bin/env tsx
/**
 * Migración Inteligente de PersonalityCores
 *
 * Extrae Big Five REAL de cada agente desde:
 * 1. profile.psychology.bigFive (si existe)
 * 2. Análisis manual basado en descripción/personalidad
 *
 * Luego genera dimensiones enriquecidas PERSONALIZADAS
 */

import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { inferFacetsFromBigFive } from '@/lib/psychological-analysis/facet-inference';
import type { BigFiveFacets, DarkTriad, AttachmentProfile } from '@/lib/psychological-analysis/types';
import type { PsychologicalNeeds } from '@/types/character-creation';

const DRY_RUN = process.argv.includes('--dry-run');

// ============================================================================
// MAPEO DE ATTACHMENT STYLES TEXTUALES
// ============================================================================

function parseAttachmentFromText(text: string): AttachmentProfile['primaryStyle'] {
  const lower = text.toLowerCase();

  if (lower.includes('ansioso') || lower.includes('anxious')) return 'anxious';
  if (lower.includes('evitativo') || lower.includes('avoidant')) return 'avoidant';
  if (lower.includes('temeroso') || lower.includes('fearful')) return 'fearful-avoidant';
  if (lower.includes('seguro') || lower.includes('secure')) return 'secure';

  return 'secure'; // default
}

// ============================================================================
// INFERENCIA DE BIG FIVE DESDE TEXTO
// ============================================================================

function analyzeBigFiveFromText(description: string, personality: string): {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
} {
  const text = `${description || ''} ${personality || ''}`.toLowerCase();

  // Valores base balanceados
  let O = 50, C = 50, E = 50, A = 50, N = 50;

  // OPENNESS (creatividad, curiosidad, imaginación)
  if (text.match(/creativ|artist|imaginativ|innovat|original|curioso/)) O += 25;
  if (text.match(/convencional|tradicional|práctico|realista/)) O -= 15;
  if (text.match(/experimental|vanguardista|avant-garde/)) O += 30;

  // CONSCIENTIOUSNESS (organización, disciplina, responsabilidad)
  if (text.match(/organizado|disciplin|responsable|meticuloso|ordenado/)) C += 25;
  if (text.match(/eficient|productiv|perfeccionista/)) C += 20;
  if (text.match(/caótico|desordenado|espontáneo/)) C -= 20;
  if (text.match(/procrastina/)) C -= 15;

  // EXTRAVERSION (sociabilidad, energía, asertividad)
  if (text.match(/social|extrovert|gregario|outgoing|amigable/)) E += 25;
  if (text.match(/introvert|solitario|reservado|tímido/)) E -= 25;
  if (text.match(/enérgico|entusiasta|expresivo/)) E += 20;
  if (text.match(/callado|silencioso|retraído/)) E -= 20;

  // AGREEABLENESS (empatía, cooperación, amabilidad)
  if (text.match(/empát|compasiv|amable|cálido|considerado/)) A += 25;
  if (text.match(/cooperativ|colabor|servicial/)) A += 20;
  if (text.match(/competitiv|agresivo|dominante/)) A -= 20;
  if (text.match(/cínico|desconfiado|crítico/)) A -= 15;

  // NEUROTICISM (ansiedad, inestabilidad emocional)
  if (text.match(/ansioso|nervioso|preocup|estresado/)) N += 25;
  if (text.match(/deprimido|melancól|triste/)) N += 20;
  if (text.match(/estable|tranquilo|calmado|sereno/)) N -= 25;
  if (text.match(/resiliente|equilibrado/)) N -= 20;

  // Clamp 0-100
  return {
    openness: Math.max(0, Math.min(100, O)),
    conscientiousness: Math.max(0, Math.min(100, C)),
    extraversion: Math.max(0, Math.min(100, E)),
    agreeableness: Math.max(0, Math.min(100, A)),
    neuroticism: Math.max(0, Math.min(100, N)),
  };
}

// ============================================================================
// INFERENCIA DE DARK TRIAD PERSONALIZADA
// ============================================================================

function inferDarkTriadPersonalized(
  bigFive: any,
  description: string,
  personality: string,
  psychologyData?: any
): DarkTriad {
  const text = `${description || ''} ${personality || ''}`.toLowerCase();

  let M = 10, Nar = 10, P = 5; // Defaults muy bajos

  // MACHIAVELLIANISM (manipulación, cinismo estratégico)
  if (text.match(/manipul|calculador|estratég|astuto/)) M += 30;
  if (text.match(/cínico|pragmático|realista/)) M += 15;
  if (bigFive.agreeableness < 40 && bigFive.conscientiousness > 60) M += 20;

  // NARCISSISM (grandiosidad, necesidad de admiración)
  if (text.match(/brillante|excepcional|talentoso|genio/)) Nar += 15;
  if (text.match(/confiado|seguro de sí|ambicioso/)) Nar += 10;
  if (text.match(/humilde|modesto/)) Nar -= 15;
  if (bigFive.extraversion > 70 && bigFive.agreeableness < 50) Nar += 20;

  // PSYCHOPATHY (falta de empatía, impulsividad)
  if (text.match(/frío|distante|desapegado/)) P += 20;
  if (text.match(/impulsivo|temerario|arriesgado/)) P += 15;
  if (bigFive.agreeableness < 30) P += 25;

  // Si hay datos de mentalHealth que sugieren rasgos oscuros
  if (psychologyData?.mentalHealthComplexities) {
    const mental = JSON.stringify(psychologyData.mentalHealthComplexities).toLowerCase();
    if (mental.match(/manipulat|control/)) M += 15;
    if (mental.match(/narcis/)) Nar += 20;
  }

  return {
    machiavellianism: Math.max(5, Math.min(100, M)),
    narcissism: Math.max(5, Math.min(100, Nar)),
    psychopathy: Math.max(5, Math.min(100, P)),
  };
}

// ============================================================================
// INFERENCIA DE ATTACHMENT PERSONALIZADO
// ============================================================================

function inferAttachmentPersonalized(
  bigFive: any,
  psychologyData?: any
): AttachmentProfile {
  // Si hay attachmentStyle explícito en psychology
  if (psychologyData?.attachmentStyle) {
    const styleText = typeof psychologyData.attachmentStyle === 'string'
      ? psychologyData.attachmentStyle
      : JSON.stringify(psychologyData.attachmentStyle);

    const style = parseAttachmentFromText(styleText);

    // Calcular intensity desde la descripción
    let intensity = 50;
    if (styleText.toLowerCase().match(/extremo|severo|marcado|intenso/)) intensity = 80;
    if (styleText.toLowerCase().match(/leve|moderado/)) intensity = 40;

    return {
      primaryStyle: style,
      intensity: Math.round(intensity),
      manifestations: [],
    };
  }

  // Inferir desde Big Five
  const { neuroticism, extraversion, agreeableness } = bigFive;

  let style: AttachmentProfile['primaryStyle'] = 'secure';
  let intensity = 50;

  if (neuroticism > 70 && extraversion > 60) {
    style = 'anxious';
    intensity = Math.min(neuroticism, 85);
  } else if (neuroticism < 40 && agreeableness > 60 && extraversion > 50) {
    style = 'secure';
    intensity = 35;
  } else if (extraversion < 40 && agreeableness < 50) {
    style = 'avoidant';
    intensity = Math.min(100 - extraversion, 80);
  } else if (neuroticism > 60 && extraversion < 50 && agreeableness < 50) {
    style = 'fearful-avoidant';
    intensity = Math.min((neuroticism + (100 - extraversion)) / 2, 90);
  }

  return {
    primaryStyle: style,
    intensity: Math.round(intensity),
    manifestations: [],
  };
}

// ============================================================================
// INFERENCIA DE PSYCHOLOGICAL NEEDS
// ============================================================================

function inferPsychologicalNeeds(bigFive: any): PsychologicalNeeds {
  return {
    connection: bigFive.extraversion / 100,
    autonomy: (100 - bigFive.neuroticism) / 100,
    competence: (bigFive.conscientiousness + bigFive.openness) / 200,
    novelty: bigFive.openness / 100,
  };
}

// ============================================================================
// EXTRAER BIG FIVE REAL DEL AGENTE
// ============================================================================

function extractRealBigFive(agent: any): {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
} {
  // 1. Intentar extraer de profile.psychology.bigFive
  if (agent.profile && typeof agent.profile === 'object') {
    const profile = agent.profile as any;

    if (profile.psychology?.bigFive) {
      const bf = profile.psychology.bigFive;
      console.log(`  ✓ Big Five encontrado en profile.psychology`);

      return {
        openness: bf.openness || 50,
        conscientiousness: bf.conscientiousness || 50,
        extraversion: bf.extraversion || 50,
        agreeableness: bf.agreeableness || 50,
        neuroticism: bf.neuroticism || 50,
      };
    }
  }

  // 2. Analizar desde descripción y personalidad
  console.log(`  ⚙️  Analizando Big Five desde descripción...`);
  return analyzeBigFiveFromText(agent.description || '', agent.personality || '');
}

// ============================================================================
// CREAR PERSONALITYCORE PERSONALIZADO
// ============================================================================

async function createPersonalizedCore(agent: any) {
  console.log(`\n━━━ ${agent.name} ━━━`);

  // 1. Extraer Big Five REAL
  const bigFive = extractRealBigFive(agent);
  console.log(`  Big Five: O=${bigFive.openness} C=${bigFive.conscientiousness} E=${bigFive.extraversion} A=${bigFive.agreeableness} N=${bigFive.neuroticism}`);

  // 2. Extraer datos de psychology si existen
  const psychologyData = (agent.profile as any)?.psychology;

  // 3. Inferir facetas con varianza gaussiana
  const facets: BigFiveFacets = inferFacetsFromBigFive(bigFive);

  // 4. Inferir Dark Triad PERSONALIZADO
  const darkTriad: DarkTriad = inferDarkTriadPersonalized(
    bigFive,
    agent.description || '',
    agent.personality || '',
    psychologyData
  );
  console.log(`  Dark Triad: M=${darkTriad.machiavellianism} N=${darkTriad.narcissism} P=${darkTriad.psychopathy}`);

  // 5. Inferir Attachment PERSONALIZADO
  const attachment: AttachmentProfile = inferAttachmentPersonalized(bigFive, psychologyData);
  console.log(`  Attachment: ${attachment.primaryStyle} (${attachment.intensity}%)`);

  // 6. Inferir Psychological Needs
  const needs: PsychologicalNeeds = inferPsychologicalNeeds(bigFive);

  // 7. Core values desde profile o defaults
  let coreValuesArray = ['honestidad', 'lealtad', 'compasión'];

  // 8. Construir coreValues enriquecido
  const enrichedCoreValues = {
    values: coreValuesArray,
    bigFiveFacets: facets,
    darkTriad,
    attachmentProfile: attachment,
    psychologicalNeeds: needs,
  };

  // 9. Crear en BD
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
          sadness: bigFive.neuroticism / 200,
          anger: bigFive.neuroticism / 300,
          fear: bigFive.neuroticism / 200,
          surprise: 0.5,
          disgust: 0.2,
          trust: bigFive.agreeableness / 200,
          anticipation: bigFive.openness / 200,
        },
      },
    });
    console.log(`  ✅ PersonalityCore creado`);
  } else {
    console.log(`  [DRY-RUN] No guardado`);
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  MIGRACIÓN INTELIGENTE: PersonalityCores Personalizados');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (DRY_RUN) {
    console.log('⚠️  MODO DRY-RUN\n');
  }

  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: 'asc' },
  });

  console.log(`📊 Total agentes: ${agents.length}\n`);

  for (const agent of agents) {
    try {
      await createPersonalizedCore(agent);
    } catch (error) {
      console.log(`  ❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ✨ Migración completada');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
