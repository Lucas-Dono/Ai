/**
 * Script de prueba para Cost Tracking System
 *
 * Este script genera datos de prueba para verificar que el sistema funciona
 *
 * Uso:
 *   npx tsx scripts/test-cost-tracking.ts
 */

import { trackLLMCall, trackEmbedding, trackImageGeneration, getCostSummary, getDailyCosts, getTopUsers, getCostProjection } from '../lib/cost-tracking/tracker';
import { calculateLLMCost, calculateEmbeddingCost, calculateImageCost } from '../lib/cost-tracking/calculator';

async function testCostTracking() {
  console.log('🚀 Testing Cost Tracking System...\n');

  // Test 1: Track LLM calls
  console.log('📝 Test 1: Tracking LLM calls...');

  const llmTests = [
    {
      userId: 'test-user-1',
      agentId: 'test-agent-1',
      provider: 'google',
      model: 'gemini-2.5-flash-lite',
      inputTokens: 1000,
      outputTokens: 500,
    },
    {
      userId: 'test-user-2',
      agentId: 'test-agent-2',
      provider: 'google',
      model: 'gemini-2.5-flash-lite',
      inputTokens: 2000,
      outputTokens: 800,
    },
  ];

  for (const test of llmTests) {
    const cost = calculateLLMCost(test.model, test.inputTokens, test.outputTokens);
    await trackLLMCall({
      ...test,
      metadata: { test: true },
    });
    console.log(`  ✓ Tracked LLM call: ${test.inputTokens + test.outputTokens} tokens, cost: $${cost.toFixed(6)}`);
  }

  // Test 2: Track embeddings
  console.log('\n📊 Test 2: Tracking embeddings...');

  const embeddingTests = [
    {
      userId: 'test-user-1',
      agentId: 'test-agent-1',
      provider: 'qwen-local',
      model: 'qwen3-embedding-0.6b-q8',
      tokens: 500,
    },
    {
      userId: 'test-user-2',
      agentId: 'test-agent-2',
      provider: 'qwen-local',
      model: 'qwen3-embedding-0.6b-q8',
      tokens: 800,
    },
  ];

  for (const test of embeddingTests) {
    const cost = calculateEmbeddingCost(test.model, test.tokens);
    await trackEmbedding({
      ...test,
      cost,
      metadata: { test: true },
    });
    console.log(`  ✓ Tracked embedding: ${test.tokens} tokens, cost: $${cost.toFixed(6)}`);
  }

  // Test 3: Track image generation
  console.log('\n🖼️  Test 3: Tracking image generation...');

  const imageTests = [
    {
      userId: 'test-user-1',
      agentId: 'test-agent-1',
      provider: 'aihorde',
      model: 'stable-diffusion-xl',
      resolution: '512x512',
    },
    {
      userId: 'test-user-2',
      agentId: 'test-agent-2',
      provider: 'fastsd-local',
      model: 'stable-diffusion-cpu',
      resolution: '512x512',
    },
  ];

  for (const test of imageTests) {
    const cost = calculateImageCost(test.model, test.resolution);
    await trackImageGeneration({
      ...test,
      cost,
      metadata: { test: true },
    });
    console.log(`  ✓ Tracked image: ${test.resolution}, cost: $${cost.toFixed(6)}`);
  }

  // Wait for buffer to flush (max 5 seconds)
  console.log('\n⏳ Waiting for buffer to flush...');
  await new Promise(resolve => setTimeout(resolve, 6000));

  // Test 4: Get cost summary
  console.log('\n📈 Test 4: Getting cost summary...');
  const summary = await getCostSummary();
  console.log(`  Total cost: $${summary.total.toFixed(6)}`);
  console.log(`  Total calls: ${summary.callCount}`);
  console.log(`  By type:`);
  for (const item of summary.byType) {
    console.log(`    - ${item.type}: $${item.cost.toFixed(6)} (${item.count} calls)`);
  }

  // Test 5: Get daily costs
  console.log('\n📅 Test 5: Getting daily costs...');
  const daily = await getDailyCosts(undefined, 7);
  console.log(`  Last 7 days: ${daily.length} days with data`);
  for (const day of daily.slice(-3)) {
    console.log(`    - ${new Date(day.date).toLocaleDateString()}: $${Number(day.cost).toFixed(6)} (${day.count} calls)`);
  }

  // Test 6: Get top users
  console.log('\n👥 Test 6: Getting top users...');
  const topUsers = await getTopUsers(5);
  console.log(`  Top ${topUsers.length} users:`);
  for (const user of topUsers) {
    console.log(`    - ${user.userId}: $${user.cost.toFixed(6)} (${user.count} calls)`);
  }

  // Test 7: Get cost projection
  console.log('\n🔮 Test 7: Getting cost projection...');
  const projection = await getCostProjection();
  console.log(`  Current month cost: $${projection.currentMonthCost.toFixed(2)}`);
  console.log(`  Daily average: $${projection.dailyAverage.toFixed(4)}`);
  console.log(`  Projected month end: $${projection.projectedMonthEnd.toFixed(2)}`);
  console.log(`  Trend: ${projection.trend} (${projection.trendPercentage.toFixed(1)}%)`);

  console.log('\n✅ All tests completed successfully!');
  console.log('\n📊 Next steps:');
  console.log('  1. Visit http://localhost:3000/dashboard/costs to see the dashboard');
  console.log('  2. Check the database: SELECT * FROM "CostTracking" ORDER BY "createdAt" DESC LIMIT 10;');
  console.log('  3. Test the API: curl http://localhost:3000/api/admin/costs?view=summary');
}

// Run tests
testCostTracking()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
