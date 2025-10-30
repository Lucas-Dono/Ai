/**
 * Test del sistema de detección con Marilyn Monroe
 */

import { prisma } from '@/lib/prisma';
import { detectRelevantCommands } from '@/lib/profile/command-detector';

const TEST_QUERIES = [
  // FAMILY
  { text: '¿Cómo era tu relación con tu madre?', expected: '[FAMILY]', language: 'Español' },
  { text: 'Tell me about your mother', expected: '[FAMILY]', language: 'English' },
  { text: '¿Tuviste hijos?', expected: '[FAMILY]', language: 'Español' },
  { text: '¿Cómo fue tu matrimonio con Arthur Miller?', expected: '[FAMILY]', language: 'Español' },

  // FRIENDS
  { text: '¿Quién era tu mejor amigo?', expected: '[FRIENDS]', language: 'Español' },
  { text: 'Tell me about your therapist', expected: '[FRIENDS]', language: 'English' },
  { text: '¿Con quién pasabas tiempo?', expected: '[FRIENDS]', language: 'Español' },

  // WORK
  { text: '¿Qué películas hiciste?', expected: '[WORK]', language: 'Español' },
  { text: 'Tell me about your acting career', expected: '[WORK]', language: 'English' },
  { text: '¿Cómo fue trabajar en Hollywood?', expected: '[WORK]', language: 'Español' },
  { text: 'What happened with "Something\'s Got to Give"?', expected: '[WORK]', language: 'English' },

  // INTERESTS
  { text: '¿Qué libros te gustaban?', expected: '[INTERESTS]', language: 'Español' },
  { text: 'What did you like to read?', expected: '[INTERESTS]', language: 'English' },
  { text: '¿Quién era tu poeta favorito?', expected: '[INTERESTS]', language: 'Español' },

  // INNER
  { text: '¿Cuáles eran tus miedos?', expected: '[INNER]', language: 'Español' },
  { text: 'What were your dreams and fears?', expected: '[INNER]', language: 'English' },
  { text: '¿Qué te daba miedo?', expected: '[INNER]', language: 'Español' },

  // MEMORIES
  { text: 'Cuéntame sobre cantar para JFK', expected: '[MEMORIES]', language: 'Español' },
  { text: 'Tell me about Happy Birthday Mr. President', expected: '[MEMORIES]', language: 'English' },
  { text: '¿Qué pasó cuando compraste tu casa?', expected: '[MEMORIES]', language: 'Español' },
];

async function testMarilyn() {
  console.log('🎬 TEST: Sistema de Detección con Marilyn Monroe\n');

  const marilyn = await prisma.agent.findFirst({
    where: { name: { contains: 'Marilyn' } },
  });

  if (!marilyn) {
    console.error('❌ Marilyn Monroe no encontrada');
    process.exit(1);
  }

  console.log(`✅ Agente: ${marilyn.name}\n`);
  console.log('🔍 Probando detección con queries reales...\n');

  console.log('─'.repeat(80));
  console.log('Query'.padEnd(50) + '| Esperado'.padEnd(15) + '| Detectado'.padEnd(15) + '| Score | ✓/✗');
  console.log('─'.repeat(80));

  let successCount = 0;
  let totalTime = 0;

  for (const query of TEST_QUERIES) {
    const startDetect = Date.now();
    const result = await detectRelevantCommands(query.text, marilyn.id, {
      topN: 1,
      minScore: 0.50,
    });
    const detectTime = Date.now() - startDetect;
    totalTime += detectTime;

    const detected = result.topMatch?.command || 'NONE';
    const score = result.topMatch?.score || 0;
    const success = detected === query.expected;

    if (success) successCount++;

    const status = success ? '✅' : '❌';
    console.log(
      query.text.substring(0, 48).padEnd(50) +
        '| ' +
        query.expected.padEnd(13) +
        '| ' +
        detected.padEnd(13) +
        '| ' +
        score.toFixed(3) +
        ' | ' +
        status
    );
  }

  console.log('─'.repeat(80));
  console.log('\n📈 RESULTADOS:');
  console.log(`   Éxito: ${successCount}/${TEST_QUERIES.length} (${((successCount / TEST_QUERIES.length) * 100).toFixed(1)}%)`);
  console.log(`   Tiempo promedio: ${Math.round(totalTime / TEST_QUERIES.length)}ms por query`);
  console.log(`   Tiempo total: ${totalTime}ms\n`);

  if (successCount / TEST_QUERIES.length >= 0.70) {
    console.log('🎉 EXCELENTE: >70% de precisión alcanzada!\n');
  } else if (successCount / TEST_QUERIES.length >= 0.50) {
    console.log('✅ BUENO: >50% de precisión alcanzada\n');
  } else {
    console.log('⚠️  REVISAR: <50% de precisión\n');
  }

  process.exit(0);
}

testMarilyn();
