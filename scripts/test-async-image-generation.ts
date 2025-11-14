/**
 * Test Script: Async Image Generation
 *
 * Prueba el flujo completo de generación asíncrona de imágenes:
 * 1. Simula que la IA quiere enviar una foto [IMAGE: descripción]
 * 2. Verifica que se genera un mensaje de espera contextual
 * 3. Verifica que se inicia la generación en segundo plano
 * 4. Hace polling hasta que la imagen esté lista
 * 5. Verifica que se envió el mensaje final con la imagen
 */

import { prisma } from '@/lib/prisma';
import { asyncImageGenerator } from '@/lib/multimedia/async-image-generator';

async function testAsyncImageGeneration() {
  console.log('🧪 Testing Async Image Generation\n');

  try {
    // 1. Buscar un agente de prueba
    const testAgent = await prisma.agent.findFirst({
      select: {
        id: true,
        name: true,
        personality: true,
        description: true,
        systemPrompt: true,
        referenceImageUrl: true,
        userId: true,
      },
    });

    if (!testAgent) {
      console.error('❌ No test agent found. Create an agent first.');
      process.exit(1);
    }

    console.log(`✅ Found test agent: ${testAgent.name} (${testAgent.id})\n`);

    // 2. Iniciar generación asíncrona
    console.log('🚀 Starting async image generation...');
    const result = await asyncImageGenerator.startAsyncGeneration({
      agentId: testAgent.id,
      agentName: testAgent.name,
      agentPersonality: testAgent.personality || testAgent.description || 'Persona amigable',
      agentSystemPrompt: testAgent.systemPrompt || undefined,
      userId: testAgent.userId as string,
      referenceImageUrl: testAgent.referenceImageUrl ?? undefined,
      description: 'Una selfie mía en la playa al atardecer',
    });

    console.log(`\n✅ Async generation started!`);
    console.log(`   Pending Generation ID: ${result.pendingGenerationId}`);
    console.log(`   Waiting Message ID: ${result.waitingMessage.id}`);
    console.log(`   Waiting Message: "${result.waitingMessage.content}"\n`);

    // 3. Hacer polling cada 5 segundos para ver el estado
    console.log('⏳ Polling for completion (checking every 5 seconds)...\n');

    let attempts = 0;
    const maxAttempts = 60; // 5 minutos máximo

    while (attempts < maxAttempts) {
      attempts++;

      const pending = await prisma.pendingImageGeneration.findUnique({
        where: { id: result.pendingGenerationId },
      });

      if (!pending) {
        console.error('❌ Pending generation not found');
        process.exit(1);
      }

      console.log(`   [${attempts}/${maxAttempts}] Status: ${pending.status}`);

      if (pending.status === 'completed') {
        console.log('\n✅ Image generation COMPLETED!\n');
        console.log(`   Image URL: ${pending.imageUrl}`);
        console.log(`   Completed Message ID: ${pending.completedMessageId}`);

        // Obtener mensaje completado
        if (pending.completedMessageId) {
          const completedMessage = await prisma.message.findUnique({
            where: { id: pending.completedMessageId },
          });

          if (completedMessage) {
            console.log(`   Completed Message: "${completedMessage.content}"`);
            console.log(`   Multimedia:`, JSON.stringify(completedMessage.metadata, null, 2));
          }
        }

        console.log('\n🎉 Test PASSED - Async image generation works!\n');
        process.exit(0);
      }

      if (pending.status === 'failed') {
        console.error(`\n❌ Image generation FAILED: ${pending.errorMessage}\n`);
        process.exit(1);
      }

      // Esperar 5 segundos antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.error('\n❌ Test TIMEOUT - Image generation took too long\n');
    process.exit(1);
  } catch (error) {
    console.error('\n❌ Test FAILED:', error);
    process.exit(1);
  }
}

// Ejecutar test
testAsyncImageGeneration();
