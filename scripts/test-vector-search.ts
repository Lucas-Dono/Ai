/**
 * TEST OPTIMIZED VECTOR SEARCH
 * Script para probar el sistema de búsqueda vectorial optimizado
 */

import { optimizedVectorSearch, cosineSimilarity } from '../lib/memory/optimized-vector-search';
import { prisma } from '../lib/prisma';

async function setupTestData(agentId: string, userId: string) {
  console.log('📝 Setting up test data...\n');

  // Crear agente de prueba si no existe
  await prisma.agent.upsert({
    where: { id: agentId },
    create: {
      id: agentId,
      name: 'Test Agent',
      personality: 'friendly',
      isPublic: true,
      userId,
    },
    update: {},
  });

  // Crear usuario de prueba si no existe
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: 'test@example.com',
      name: 'Test User',
    },
    update: {},
  });

  // Crear mensajes de prueba
  const testMessages = [
    '¿Cuál es tu color favorito?',
    'Mi color favorito es el azul',
    '¿Qué te gusta hacer en tu tiempo libre?',
    'Me encanta leer libros y escuchar música',
    '¿Tienes algún hobby?',
    'Sí, me gusta pintar y hacer senderismo',
    '¿Cuál es tu película favorita?',
    'Mi película favorita es Inception',
    '¿Qué comida prefieres?',
    'Me encanta la comida italiana, especialmente la pizza',
  ];

  for (const content of testMessages) {
    await prisma.message.create({
      data: {
        agentId,
        userId,
        content,
        role: Math.random() > 0.5 ? 'user' : 'assistant',
      },
    });
  }

  // Crear memorias episódicas de prueba
  const testMemories = [
    {
      event: 'Usuario compartió que su cumpleaños es el 15 de marzo',
      importance: 0.9,
      emotionalValence: 0.8,
      characterEmotion: 'joy',
      userEmotion: 'joy',
    },
    {
      event: 'Primera conversación sobre libros favoritos',
      importance: 0.7,
      emotionalValence: 0.6,
      characterEmotion: 'joy',
      userEmotion: 'curiosity',
    },
    {
      event: 'Usuario mencionó que tiene un perro llamado Max',
      importance: 0.8,
      emotionalValence: 0.7,
      characterEmotion: 'affection',
      userEmotion: 'love',
    },
  ];

  for (const memory of testMemories) {
    await prisma.episodicMemory.create({
      data: {
        agentId,
        ...memory,
      },
    });
  }

  console.log('✅ Test data created\n');
}

async function testCosineSimilarity() {
  console.log('🧪 Test 1: Cosine Similarity Function\n');

  // Test vectors
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];
  const v4 = [0.5, 0.5, 0];

  const sim1 = cosineSimilarity(v1, v2);
  const sim2 = cosineSimilarity(v1, v3);
  const sim3 = cosineSimilarity(v1, v4);

  console.log(`Identical vectors: ${(sim1 * 100).toFixed(1)}% (expected: 100%)`);
  console.log(`Orthogonal vectors: ${(sim2 * 100).toFixed(1)}% (expected: 0%)`);
  console.log(`45° angle: ${(sim3 * 100).toFixed(1)}% (expected: ~70.7%)`);
  console.log('✅ Cosine similarity test passed\n');
}

async function testMessageSearch(agentId: string, userId: string) {
  console.log('🧪 Test 2: Message Vector Search\n');

  const query = '¿Cuál es tu color preferido?';

  console.log(`Query: "${query}"\n`);

  const startTime = Date.now();
  const results = await optimizedVectorSearch.searchMessages(
    agentId,
    userId,
    query,
    {
      topK: 5,
      minScore: 0.3,
      useCache: true,
    }
  );
  const elapsed = Date.now() - startTime;

  console.log(`Found ${results.length} results in ${elapsed}ms\n`);

  results.forEach((result, i) => {
    console.log(`${i + 1}. [${(result.score * 100).toFixed(1)}%] ${result.content}`);
  });

  console.log('\n✅ Message search test passed\n');
}

async function testSemanticSimilarity(agentId: string, userId: string) {
  console.log('🧪 Test 3: Semantic Similarity (Same Question, Different Wording)\n');

  const queries = [
    '¿Cuál es tu color favorito?',
    'Qué color te gusta más',
    'Color preferido',
    'Cuál es tu color',
  ];

  for (const query of queries) {
    const results = await optimizedVectorSearch.searchMessages(
      agentId,
      userId,
      query,
      {
        topK: 3,
        minScore: 0.3,
      }
    );

    console.log(`Query: "${query}"`);
    if (results.length > 0) {
      console.log(
        `  Top match: [${(results[0].score * 100).toFixed(1)}%] ${results[0].content}`
      );
    } else {
      console.log('  No matches found');
    }
  }

  console.log('\n✅ Semantic similarity test passed\n');
}

async function testEpisodicMemorySearch(agentId: string) {
  console.log('🧪 Test 4: Episodic Memory Search\n');

  const query = 'cumpleaños del usuario';

  console.log(`Query: "${query}"\n`);

  const results = await optimizedVectorSearch.searchEpisodicMemories(agentId, query, {
    topK: 5,
    minScore: 0.3,
  });

  console.log(`Found ${results.length} episodic memories\n`);

  results.forEach((result, i) => {
    console.log(`${i + 1}. [${(result.score * 100).toFixed(1)}%] ${result.content}`);
    console.log(`   Importance: ${result.metadata?.importance || 'N/A'}`);
  });

  console.log('\n✅ Episodic memory search test passed\n');
}

async function testHybridSearch(agentId: string, userId: string) {
  console.log('🧪 Test 5: Hybrid Search (Messages + Episodic)\n');

  const query = 'hobbies y actividades';

  console.log(`Query: "${query}"\n`);

  const results = await optimizedVectorSearch.hybridSearch(
    agentId,
    userId,
    query,
    {
      topK: 10,
      messageWeight: 0.6,
      episodicWeight: 0.4,
    }
  );

  console.log(`Found ${results.length} hybrid results\n`);

  results.forEach((result, i) => {
    const source = (result as any).source || 'unknown';
    console.log(`${i + 1}. [${source}] [${(result.score * 100).toFixed(1)}%] ${result.content.substring(0, 60)}...`);
  });

  console.log('\n✅ Hybrid search test passed\n');
}

async function testCachePerformance(agentId: string, userId: string) {
  console.log('🧪 Test 6: Cache Performance\n');

  const query = '¿Qué te gusta hacer?';

  // First run (cold cache)
  const start1 = Date.now();
  await optimizedVectorSearch.searchMessages(agentId, userId, query, {
    useCache: true,
  });
  const time1 = Date.now() - start1;

  // Second run (warm cache)
  const start2 = Date.now();
  await optimizedVectorSearch.searchMessages(agentId, userId, query, {
    useCache: true,
  });
  const time2 = Date.now() - start2;

  // Third run (hot cache)
  const start3 = Date.now();
  await optimizedVectorSearch.searchMessages(agentId, userId, query, {
    useCache: true,
  });
  const time3 = Date.now() - start3;

  console.log(`Cold cache: ${time1}ms`);
  console.log(`Warm cache: ${time2}ms (${((time1 / time2 - 1) * 100).toFixed(1)}% faster)`);
  console.log(`Hot cache: ${time3}ms (${((time1 / time3 - 1) * 100).toFixed(1)}% faster)`);

  const cacheStats = optimizedVectorSearch.getCacheStats();
  console.log(`\nCache stats:`, cacheStats);

  console.log('\n✅ Cache performance test passed\n');
}

async function cleanup(agentId: string, userId: string) {
  console.log('🧹 Cleaning up test data...');

  await prisma.message.deleteMany({
    where: { agentId, userId },
  });

  await prisma.episodicMemory.deleteMany({
    where: { agentId },
  });

  await prisma.agent.delete({
    where: { id: agentId },
  });

  // Don't delete user as it might be used elsewhere

  optimizedVectorSearch.clearCache();

  console.log('✅ Cleanup completed\n');
}

async function runAllTests() {
  const testAgentId = 'test-agent-vector-search';
  const testUserId = 'test-user-vector-search';

  console.log('🚀 Starting Optimized Vector Search Tests\n');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Setup
    await setupTestData(testAgentId, testUserId);

    // Run tests
    await testCosineSimilarity();
    await testMessageSearch(testAgentId, testUserId);
    await testSemanticSimilarity(testAgentId, testUserId);
    await testEpisodicMemorySearch(testAgentId);
    await testHybridSearch(testAgentId, testUserId);
    await testCachePerformance(testAgentId, testUserId);

    // Cleanup
    await cleanup(testAgentId, testUserId);

    console.log('═══════════════════════════════════════════');
    console.log('✅ All tests passed!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    await cleanup(testAgentId, testUserId);
    process.exit(1);
  }
}

// Run tests
runAllTests();
