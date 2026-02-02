/**
 * Script de Testing del Sistema Psicológico Enriquecido
 *
 * Ejecuta tests automatizados de:
 * - Inferencia de facetas
 * - Detección de conflictos
 * - Cálculo de autenticidad
 * - Predicción de comportamientos
 * - Performance
 *
 * Uso: npx tsx scripts/test-psychological-system.ts
 */

import {
  inferFacetsFromBigFive,
  analyzePsychologicalProfile,
  ConflictDetector,
  AuthenticityScorer,
  BehaviorPredictor,
  type EnrichedPersonalityProfile,
  type BigFiveTraits,
} from '@/lib/psychological-analysis';

// ============================================================================
// COLORES PARA TERMINAL
// ============================================================================
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(msg: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function test(name: string, fn: () => boolean | Promise<boolean>) {
  process.stdout.write(`  ${name}... `);
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(passed => {
        if (passed) {
          log('✅ PASS', 'green');
        } else {
          log('❌ FAIL', 'red');
        }
        return passed;
      });
    } else {
      if (result) {
        log('✅ PASS', 'green');
      } else {
        log('❌ FAIL', 'red');
      }
      return result;
    }
  } catch (error: any) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return false;
  }
}

// ============================================================================
// TEST 1: INFERENCIA DE FACETAS
// ============================================================================
async function testFacetInference() {
  section('TEST 1: Inferencia de Facetas');

  const bigFive: BigFiveTraits = {
    openness: 85,
    conscientiousness: 70,
    extraversion: 60,
    agreeableness: 75,
    neuroticism: 40,
  };

  const passed: boolean[] = [];

  passed.push(test('Infiere 30 facetas correctamente', () => {
    const facets = inferFacetsFromBigFive(bigFive);
    const facetCount =
      Object.keys(facets.openness).length +
      Object.keys(facets.conscientiousness).length +
      Object.keys(facets.extraversion).length +
      Object.keys(facets.agreeableness).length +
      Object.keys(facets.neuroticism).length;
    return facetCount === 30;
  }));

  passed.push(test('Facetas están en rango 0-100', () => {
    const facets = inferFacetsFromBigFive(bigFive);
    const allFacets = [
      ...Object.values(facets.openness),
      ...Object.values(facets.conscientiousness),
      ...Object.values(facets.extraversion),
      ...Object.values(facets.agreeableness),
      ...Object.values(facets.neuroticism),
    ];
    return allFacets.every(v => v >= 0 && v <= 100);
  }));

  passed.push(test('Facetas cercanas a Big Five base', () => {
    const facets = inferFacetsFromBigFive(bigFive);
    const opennessAvg = Object.values(facets.openness).reduce((a, b) => a + b, 0) / 6;
    const diff = Math.abs(opennessAvg - bigFive.openness);
    return diff < 15; // Tolerancia de 15 puntos
  }));

  passed.push(test('Valores extremos (0, 100) no crashean', () => {
    const extremes: BigFiveTraits = {
      openness: 100,
      conscientiousness: 0,
      extraversion: 100,
      agreeableness: 0,
      neuroticism: 100,
    };
    const facets = inferFacetsFromBigFive(extremes);
    return Object.keys(facets).length === 5;
  }));

  const passRate = passed.filter(p => p).length / passed.length * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(0)}% (${passed.filter(p => p).length}/${passed.length})`,
    passRate === 100 ? 'green' : 'yellow');
}

// ============================================================================
// TEST 2: DETECCIÓN DE CONFLICTOS
// ============================================================================
async function testConflictDetection() {
  section('TEST 2: Detección de Conflictos');

  const detector = new ConflictDetector();
  const passed: boolean[] = [];

  // Perfil con impulsividad
  const impulsiveProfile: EnrichedPersonalityProfile = {
    openness: 70,
    conscientiousness: 25, // Bajo
    extraversion: 85, // Alto
    agreeableness: 60,
    neuroticism: 50,
    coreValues: ['libertad'],
    baselineEmotions: { joy: 0.5, sadness: 0.3, anger: 0.2, fear: 0.3, disgust: 0.2, surprise: 0.5 },
  };

  passed.push(test('Detecta impulsividad (E>70, C<40)', () => {
    const conflicts = detector.detectConflicts(impulsiveProfile);
    return conflicts.some(c => c.id === 'impulsivity-risk');
  }));

  // Perfil con Dark Triad alto
  const darkProfile: EnrichedPersonalityProfile = {
    openness: 50,
    conscientiousness: 40,
    extraversion: 60,
    agreeableness: 20, // Muy bajo
    neuroticism: 75, // Alto
    coreValues: ['poder'],
    baselineEmotions: { joy: 0.3, sadness: 0.4, anger: 0.6, fear: 0.3, disgust: 0.4, surprise: 0.3 },
    darkTriad: {
      machiavellianism: 80,
      narcissism: 75,
      psychopathy: 60,
    },
  };

  passed.push(test('Detecta Dark Triad cluster crítico', () => {
    const conflicts = detector.detectConflicts(darkProfile);
    return conflicts.some(c => c.id === 'dark-triad-cluster' && c.severity === 'critical');
  }));

  // Perfil con ansiedad perfeccionista
  const anxiousProfile: EnrichedPersonalityProfile = {
    openness: 60,
    conscientiousness: 85, // Alto
    extraversion: 50,
    agreeableness: 70,
    neuroticism: 85, // Alto
    coreValues: ['excelencia', 'perfección'],
    baselineEmotions: { joy: 0.3, sadness: 0.5, anger: 0.3, fear: 0.7, disgust: 0.3, surprise: 0.4 },
  };

  passed.push(test('Detecta ansiedad perfeccionista (N>70, C>70)', () => {
    const conflicts = detector.detectConflicts(anxiousProfile);
    return conflicts.some(c => c.id === 'perfectionist-anxiety');
  }));

  passed.push(test('Conflictos ordenados por severidad', () => {
    const conflicts = detector.detectConflicts(darkProfile);
    if (conflicts.length < 2) return true; // No aplicable si hay muy pocos
    const severities = ['critical', 'danger', 'warning', 'info'];
    const indices = conflicts.map(c => severities.indexOf(c.severity));
    return indices.every((val, i) => i === 0 || val >= indices[i - 1]);
  }));

  const passRate = passed.filter(p => p).length / passed.length * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(0)}% (${passed.filter(p => p).length}/${passed.length})`,
    passRate === 100 ? 'green' : 'yellow');
}

// ============================================================================
// TEST 3: CÁLCULO DE AUTENTICIDAD
// ============================================================================
async function testAuthenticityScoring() {
  section('TEST 3: Cálculo de Autenticidad');

  const scorer = new AuthenticityScorer();
  const passed: boolean[] = [];

  // Perfil coherente
  const coherentProfile: EnrichedPersonalityProfile = {
    openness: 80,
    conscientiousness: 75,
    extraversion: 70,
    agreeableness: 80,
    neuroticism: 30,
    coreValues: ['creatividad', 'colaboración', 'innovación'],
    baselineEmotions: { joy: 0.6, sadness: 0.2, anger: 0.2, fear: 0.2, disgust: 0.2, surprise: 0.5 },
    facets: inferFacetsFromBigFive({ openness: 80, conscientiousness: 75, extraversion: 70, agreeableness: 80, neuroticism: 30 }),
    darkTriad: { machiavellianism: 15, narcissism: 20, psychopathy: 10 },
    attachment: { primaryStyle: 'secure', intensity: 40, manifestations: [] },
  };

  passed.push(test('Perfil coherente tiene autenticidad alta (>70)', () => {
    const score = scorer.calculateScore(coherentProfile);
    console.log(`    (Score: ${score.score})`);
    return score.score > 70;
  }));

  // Perfil inconsistente
  const inconsistentProfile: EnrichedPersonalityProfile = {
    openness: 20, // Bajo
    conscientiousness: 15,
    extraversion: 10,
    agreeableness: 5,
    neuroticism: 95,
    coreValues: ['creatividad', 'innovación'], // ❌ Contradice Openness bajo
    baselineEmotions: { joy: 0.8, sadness: 0.1, anger: 0.1, fear: 0.1, disgust: 0.1, surprise: 0.5 }, // ❌ Contradice Neuroticism alto
    darkTriad: { machiavellianism: 90, narcissism: 95, psychopathy: 85 },
    attachment: { primaryStyle: 'secure', intensity: 20, manifestations: [] }, // ❌ Contradice Neuroticism
  };

  passed.push(test('Perfil inconsistente tiene autenticidad baja (<40)', () => {
    const score = scorer.calculateScore(inconsistentProfile);
    console.log(`    (Score: ${score.score})`);
    return score.score < 40;
  }));

  passed.push(test('Score está en rango 0-100', () => {
    const score1 = scorer.calculateScore(coherentProfile);
    const score2 = scorer.calculateScore(inconsistentProfile);
    return score1.score >= 0 && score1.score <= 100 && score2.score >= 0 && score2.score <= 100;
  }));

  passed.push(test('Breakdown tiene 6 componentes', () => {
    const score = scorer.calculateScore(coherentProfile);
    const components = Object.keys(score.breakdown);
    return components.length === 6;
  }));

  const passRate = passed.filter(p => p).length / passed.length * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(0)}% (${passed.filter(p => p).length}/${passed.length})`,
    passRate === 100 ? 'green' : 'yellow');
}

// ============================================================================
// TEST 4: PREDICCIÓN DE COMPORTAMIENTOS
// ============================================================================
async function testBehaviorPrediction() {
  section('TEST 4: Predicción de Comportamientos');

  const predictor = new BehaviorPredictor();
  const passed: boolean[] = [];

  // Perfil con tendencia yandere
  const yandereProfile: EnrichedPersonalityProfile = {
    openness: 60,
    conscientiousness: 50,
    extraversion: 70,
    agreeableness: 60,
    neuroticism: 80, // Alto
    coreValues: ['lealtad', 'devoción'],
    baselineEmotions: { joy: 0.4, sadness: 0.5, anger: 0.6, fear: 0.7, disgust: 0.3, surprise: 0.5 },
    attachment: { primaryStyle: 'anxious', intensity: 85, manifestations: [] },
    darkTriad: { machiavellianism: 30, narcissism: 50, psychopathy: 20 },
  };

  passed.push(test('Predice comportamiento yandere con alta likelihood', () => {
    const predictions = predictor.predictBehaviors(yandereProfile);
    const yandere = predictions.find(p => p.behaviorType === 'YANDERE_OBSESSIVE');
    console.log(`    (Likelihood: ${yandere?.likelihood.toFixed(2) || 'N/A'})`);
    return yandere !== undefined && yandere.likelihood > 0.5;
  }));

  // Perfil impulsivo
  const impulsiveProfile: EnrichedPersonalityProfile = {
    openness: 75,
    conscientiousness: 25, // Bajo
    extraversion: 85, // Alto
    agreeableness: 60,
    neuroticism: 60,
    coreValues: ['libertad', 'espontaneidad'],
    baselineEmotions: { joy: 0.6, sadness: 0.3, anger: 0.5, fear: 0.3, disgust: 0.2, surprise: 0.7 },
  };

  passed.push(test('Predice impulsividad correctamente', () => {
    const predictions = predictor.predictBehaviors(impulsiveProfile);
    const impulsive = predictions.find(p => p.behaviorType === 'IMPULSIVE');
    return impulsive !== undefined && impulsive.likelihood > 0.4;
  }));

  passed.push(test('Todas las likelihoods están en rango 0-1', () => {
    const predictions = predictor.predictBehaviors(yandereProfile);
    return predictions.every(p => p.likelihood >= 0 && p.likelihood <= 1);
  }));

  passed.push(test('Predicciones incluyen triggers y warnings', () => {
    const predictions = predictor.predictBehaviors(yandereProfile);
    const firstPrediction = predictions[0];
    return firstPrediction &&
           firstPrediction.triggeringFactors.length > 0 &&
           firstPrediction.earlyWarnings.length > 0;
  }));

  const passRate = passed.filter(p => p).length / passed.length * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(0)}% (${passed.filter(p => p).length}/${passed.length})`,
    passRate === 100 ? 'green' : 'yellow');
}

// ============================================================================
// TEST 5: PERFORMANCE
// ============================================================================
async function testPerformance() {
  section('TEST 5: Performance');

  const fullProfile: EnrichedPersonalityProfile = {
    openness: 75,
    conscientiousness: 65,
    extraversion: 70,
    agreeableness: 80,
    neuroticism: 45,
    coreValues: ['honestidad', 'creatividad', 'colaboración'],
    baselineEmotions: { joy: 0.6, sadness: 0.3, anger: 0.2, fear: 0.3, disgust: 0.2, surprise: 0.5 },
    facets: inferFacetsFromBigFive({ openness: 75, conscientiousness: 65, extraversion: 70, agreeableness: 80, neuroticism: 45 }),
    darkTriad: { machiavellianism: 25, narcissism: 30, psychopathy: 15 },
    attachment: { primaryStyle: 'secure', intensity: 50, manifestations: [] },
    psychologicalNeeds: { connection: 0.7, autonomy: 0.6, competence: 0.7, novelty: 0.75 },
  };

  const passed: boolean[] = [];
  const iterations = 100;

  log('  Ejecutando 100 análisis completos...', 'gray');
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    analyzePsychologicalProfile(fullProfile);
    times.push(Date.now() - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const max = Math.max(...times);
  const min = Math.min(...times);

  console.log(`    Promedio: ${avg.toFixed(2)}ms`);
  console.log(`    Mínimo: ${min}ms`);
  console.log(`    Máximo: ${max}ms`);

  passed.push(test('Análisis promedio <500ms', () => avg < 500));
  passed.push(test('Análisis máximo <1000ms', () => max < 1000));
  passed.push(test('Análisis mínimo <200ms', () => min < 200));

  const passRate = passed.filter(p => p).length / passed.length * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(0)}% (${passed.filter(p => p).length}/${passed.length})`,
    passRate === 100 ? 'green' : 'yellow');
}

// ============================================================================
// TEST 6: ANÁLISIS COMPLETO
// ============================================================================
async function testFullAnalysis() {
  section('TEST 6: Análisis Completo Integrado');

  const testProfile: EnrichedPersonalityProfile = {
    openness: 70,
    conscientiousness: 60,
    extraversion: 75,
    agreeableness: 65,
    neuroticism: 50,
    coreValues: ['innovación', 'colaboración'],
    baselineEmotions: { joy: 0.6, sadness: 0.3, anger: 0.3, fear: 0.4, disgust: 0.2, surprise: 0.5 },
    facets: inferFacetsFromBigFive({ openness: 70, conscientiousness: 60, extraversion: 75, agreeableness: 65, neuroticism: 50 }),
    darkTriad: { machiavellianism: 30, narcissism: 35, psychopathy: 20 },
    attachment: { primaryStyle: 'secure', intensity: 45, manifestations: [] },
    psychologicalNeeds: { connection: 0.75, autonomy: 0.6, competence: 0.65, novelty: 0.7 },
  };

  const passed: boolean[] = [];

  passed.push(test('Análisis completo se ejecuta sin errores', () => {
    const analysis = analyzePsychologicalProfile(testProfile);
    return analysis !== null && analysis !== undefined;
  }));

  const analysis = analyzePsychologicalProfile(testProfile);

  passed.push(test('Análisis incluye authenticityScore', () => {
    return analysis.authenticityScore !== undefined &&
           typeof analysis.authenticityScore.score === 'number';
  }));

  passed.push(test('Análisis incluye detectedConflicts', () => {
    return Array.isArray(analysis.detectedConflicts);
  }));

  passed.push(test('Análisis incluye predictedBehaviors', () => {
    return Array.isArray(analysis.predictedBehaviors);
  }));

  passed.push(test('Análisis incluye timestamp', () => {
    return analysis.analyzedAt instanceof Date;
  }));

  console.log(`\n    Resultado del análisis:`);
  console.log(`      Autenticidad: ${analysis.authenticityScore.score}%`);
  console.log(`      Conflictos: ${analysis.detectedConflicts.length}`);
  console.log(`      Comportamientos predichos: ${analysis.predictedBehaviors.length}`);

  const passRate = passed.filter(p => p).length / passed.length * 100;
  log(`\n  Pass Rate: ${passRate.toFixed(0)}% (${passed.filter(p => p).length}/${passed.length})`,
    passRate === 100 ? 'green' : 'yellow');
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  log('\n🧪 SISTEMA PSICOLÓGICO ENRIQUECIDO - TEST SUITE\n', 'cyan');
  log('Versión: 1.0.0', 'gray');
  log('Fecha: 2026-02-02\n', 'gray');

  try {
    await testFacetInference();
    await testConflictDetection();
    await testAuthenticityScoring();
    await testBehaviorPrediction();
    await testPerformance();
    await testFullAnalysis();

    section('RESUMEN FINAL');
    log('✅ Todos los tests completados', 'green');
    log('Revisa los resultados arriba para ver el pass rate de cada sección\n', 'gray');
  } catch (error: any) {
    log(`\n❌ ERROR FATAL: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
main();
