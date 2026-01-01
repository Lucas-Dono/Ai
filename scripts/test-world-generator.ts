#!/usr/bin/env tsx

/**
 * Test script para el World Generator
 * Ejecutar: npx tsx scripts/test-world-generator.ts
 *
 * NOTA: Este script está deshabilitado porque el sistema de Worlds
 * fue migrado al sistema de Groups. Este archivo se mantiene solo
 * como referencia histórica.
 */

// import { getWorldGenerator } from '../lib/worlds/world-generator';

async function main() {
  console.log('⚠️  This test is disabled: World system migrated to Groups\n');
  console.log('The world-generator module no longer exists.\n');
  return;

  /* console.log('🧪 Testing World Generator with Gemini\n');

  const generator = getWorldGenerator();

  const testCases = [
    {
      description: "Quiero una oficina de detectives en los años 40. Hay un detective duro, su asistente inteligente, y un cliente misterioso que llega con un caso de asesinato.",
      worldType: 'story' as const,
      complexity: 'medium' as const,
      characterCount: 3,
    },
    {
      description: "Una sala de chat donde tres amigos hablan sobre videojuegos y anime. Uno es el gamer hardcore, otro el otaku, y el tercero es más casual.",
      worldType: 'chat' as const,
      complexity: 'simple' as const,
      characterCount: 3,
    },
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TEST CASE ${i + 1}: ${testCase.worldType.toUpperCase()}`);
    console.log(`${'='.repeat(60)}\n`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Character count: ${testCase.characterCount}\n`);

    try {
      const startTime = Date.now();
      const result = await generator.generateWorld(testCase);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ SUCCESS (${elapsed}s)\n`);
      console.log(`📝 Scenario (${result.scenario.length} chars):`);
      console.log(result.scenario.substring(0, 200) + '...\n');

      console.log(`🎬 Initial Context (${result.initialContext.length} chars):`);
      console.log(result.initialContext.substring(0, 200) + '...\n');

      console.log(`👥 Characters (${result.suggestedAgents.length}):`);
      result.suggestedAgents.forEach((agent: any, idx: number) => {
        console.log(`  ${idx + 1}. ${agent.name} (${agent.importanceLevel}) - ${agent.role}`);
        console.log(`     ${agent.description.substring(0, 100)}...`);
      });

      if (result.suggestedEvents && result.suggestedEvents.length > 0) {
        console.log(`\n📅 Events (${result.suggestedEvents.length}):`);
        result.suggestedEvents.forEach((event: any, idx: number) => {
          console.log(`  ${idx + 1}. ${event.name} (${event.triggerType})`);
        });
      }

      if (result.storyScript) {
        console.log(`\n📖 Story Script:`);
        console.log(`   Title: ${result.storyScript.title}`);
        console.log(`   Genre: ${result.storyScript.genre}`);
        console.log(`   Acts: ${result.storyScript.totalActs}`);
      }

      console.log(`\n💡 Tips (${result.tips?.length || 0}):`);
      result.tips?.forEach((tip: string, idx: number) => {
        console.log(`  ${idx + 1}. ${tip}`);
      });

    } catch (error) {
      console.error('❌ ERROR:', error);
      if (error instanceof Error) {
        console.error('Message:', error.message);
        console.error('Stack:', error.stack?.substring(0, 500));
      }
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🎉 Test completed!');
  console.log(`${'='.repeat(60)}\n`);
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
