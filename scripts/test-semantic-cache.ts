/**
 * TEST SEMANTIC CACHE
 * Script para probar el sistema de caché semántico
 */

import { semanticCache } from '../lib/cache/semantic-cache';

async function testSemanticCache() {
  console.log('🧪 Testing Semantic Cache System\n');

  const agentId = 'test-agent-123';
  const model = 'qwen-2.5-72b-instruct';

  // Test 1: Basic SET and GET
  console.log('📝 Test 1: Basic SET and GET');
  await semanticCache.set(
    '¿Cuál es tu color favorito?',
    'Mi color favorito es el azul, me recuerda al océano.',
    agentId,
    { model, temperature: 0.7, ttl: 3600 }
  );
  console.log('✅ Response cached\n');

  const exactMatch = await semanticCache.get(
    '¿Cuál es tu color favorito?',
    agentId,
    { model, temperature: 0.7 }
  );
  console.log('Exact match:', exactMatch ? '✅ HIT' : '❌ MISS');
  if (exactMatch) {
    console.log('Response:', exactMatch);
  }
  console.log();

  // Test 2: Semantic Similarity (should hit cache)
  console.log('📝 Test 2: Semantic Similarity');
  const semanticTests = [
    'Cual es tu color preferido?',
    'Dime qué color te gusta más',
    'Qué color es tu favorito',
  ];

  for (const prompt of semanticTests) {
    const result = await semanticCache.get(prompt, agentId, {
      model,
      temperature: 0.7,
    });
    console.log(`"${prompt}"`);
    console.log('Result:', result ? '✅ HIT' : '❌ MISS');
    if (result) {
      console.log('Cached response:', result.substring(0, 50) + '...');
    }
    console.log();
  }

  // Test 3: Different question (should miss)
  console.log('📝 Test 3: Different Question (should MISS)');
  const differentQuestion = '¿Cuál es tu comida favorita?';
  const missResult = await semanticCache.get(differentQuestion, agentId, {
    model,
    temperature: 0.7,
  });
  console.log(`"${differentQuestion}"`);
  console.log('Result:', missResult ? '❌ Unexpected HIT' : '✅ MISS (expected)');
  console.log();

  // Test 4: Cache multiple responses
  console.log('📝 Test 4: Cache Multiple Responses');
  const testPrompts = [
    {
      prompt: '¿Qué te gusta hacer en tu tiempo libre?',
      response: 'Me encanta leer libros y escuchar música.',
    },
    {
      prompt: '¿Tienes algún hobby?',
      response: 'Sí, me gusta pintar y hacer senderismo.',
    },
    {
      prompt: '¿Cuál es tu película favorita?',
      response: 'Mi película favorita es Inception, me fascinan las historias complejas.',
    },
  ];

  for (const { prompt, response } of testPrompts) {
    await semanticCache.set(prompt, response, agentId, {
      model,
      temperature: 0.7,
      ttl: 3600,
    });
  }
  console.log(`✅ Cached ${testPrompts.length} responses\n`);

  // Test 5: Get Statistics
  console.log('📝 Test 5: Cache Statistics');
  const stats = await semanticCache.getStats(agentId);
  console.log('Stats:', JSON.stringify(stats, null, 2));
  console.log();

  // Test 6: Semantic hits on new responses
  console.log('📝 Test 6: Test Semantic Hits on New Prompts');
  const similarPrompts = [
    'Qué haces en tu tiempo libre',
    'Tienes hobbies',
    'Cual es tu film favorito',
  ];

  for (const prompt of similarPrompts) {
    const result = await semanticCache.get(prompt, agentId, {
      model,
      temperature: 0.7,
    });
    console.log(`"${prompt}"`);
    console.log('Result:', result ? '✅ HIT' : '❌ MISS');
    if (result) {
      console.log('Cached response:', result.substring(0, 60) + '...');
    }
    console.log();
  }

  // Test 7: Invalidate cache
  console.log('📝 Test 7: Invalidate Cache');
  await semanticCache.invalidate(agentId);
  console.log('✅ Cache invalidated\n');

  const afterInvalidate = await semanticCache.get(
    '¿Cuál es tu color favorito?',
    agentId,
    { model, temperature: 0.7 }
  );
  console.log(
    'After invalidate:',
    afterInvalidate ? '❌ Unexpected HIT' : '✅ MISS (expected)'
  );
  console.log();

  // Test 8: Performance Test
  console.log('📝 Test 8: Performance Test');

  // Cache 10 responses
  console.log('Caching 10 responses...');
  const startCache = Date.now();
  for (let i = 0; i < 10; i++) {
    await semanticCache.set(
      `Test question ${i}`,
      `Test answer ${i}`,
      agentId,
      { model, temperature: 0.7 }
    );
  }
  const cacheTime = Date.now() - startCache;
  console.log(`✅ Cached in ${cacheTime}ms (avg: ${cacheTime / 10}ms per item)`);

  // Retrieve 10 responses
  console.log('Retrieving 10 responses...');
  const startRetrieve = Date.now();
  let hits = 0;
  for (let i = 0; i < 10; i++) {
    const result = await semanticCache.get(`Test question ${i}`, agentId, {
      model,
      temperature: 0.7,
    });
    if (result) hits++;
  }
  const retrieveTime = Date.now() - startRetrieve;
  console.log(
    `✅ Retrieved in ${retrieveTime}ms (avg: ${retrieveTime / 10}ms per item)`
  );
  console.log(`Hit rate: ${hits}/10 (${(hits / 10) * 100}%)`);
  console.log();

  // Final stats
  console.log('📊 Final Statistics');
  const finalStats = await semanticCache.getStats(agentId);
  console.log(JSON.stringify(finalStats, null, 2));

  // Cleanup
  console.log('\n🧹 Cleanup');
  await semanticCache.invalidate(agentId);
  console.log('✅ Test cache cleaned up');

  console.log('\n✅ All tests completed!');
}

// Run tests
testSemanticCache().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
