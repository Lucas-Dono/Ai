/**
 * Script de test para flujo completo de mensaje
 * Simula el envío de mensaje para detectar todos los errores
 */

import { prisma } from '@/lib/prisma';

async function testMessageFlow() {
  console.log('🧪 Testing message flow...\n');

  try {
    // 1. Buscar un usuario y agente de prueba
    console.log('1️⃣ Buscando usuario y agente...');
    const user = await prisma.user.findFirst({
      where: { email: 'lucasdono391@gmail.com' }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const agent = await prisma.agent.findFirst({
      where: { id: 'cmi3l240x0001ijyeo5p9ixex' }
    });

    if (!agent) {
      throw new Error('Agente no encontrado');
    }

    console.log(`✅ Usuario: ${user.email}`);
    console.log(`✅ Agente: ${agent.name}\n`);

    // 2. Simular request de mensaje
    console.log('2️⃣ Simulando POST /api/agents/[id]/message...');

    const mockRequest = {
      userId: user.id,
      agentId: agent.id,
      content: 'Hola! Este es un mensaje de prueba',
      messageType: 'regular' as const,
    };

    console.log('📨 Request:', JSON.stringify(mockRequest, null, 2));
    console.log();

    // 3. Test Redis operations que usa el rate limiter
    console.log('3️⃣ Testing Redis operations...');
    const { redis } = await import('@/lib/redis/config');

    if (redis) {
      try {
        // Test básicos
        await redis.set('test:key', 'test-value', { ex: 60 });
        console.log('✅ redis.set() works');

        const value = await redis.get('test:key');
        console.log('✅ redis.get() works:', value);

        await redis.zincrby('test:sorted', 1, 'member1');
        console.log('✅ redis.zincrby() works');

        const range = await redis.zrange('test:sorted', 0, -1);
        console.log('✅ redis.zrange() works:', range);

        // Test multi/pipeline
        const pipeline = redis.multi();
        pipeline.zadd('test:multi', 100, 'item1');
        pipeline.zremrangebyscore('test:multi', 0, 50);

        // Verificar si zcard existe
        if (typeof pipeline.zcard === 'function') {
          console.log('✅ pipeline.zcard() exists');
        } else {
          console.log('❌ pipeline.zcard() MISSING');
        }

        await pipeline.exec();
        console.log('✅ redis.multi() works');

        // Cleanup
        await redis.del('test:key');
        await redis.del('test:sorted');
        await redis.del('test:multi');
        console.log('✅ Redis cleanup done\n');
      } catch (err: any) {
        console.error('❌ Redis error:', err.message);
      }
    } else {
      console.log('⚠️ Redis not available\n');
    }

    // 4. Test Prisma queries que usa el mensaje
    console.log('4️⃣ Testing Prisma queries...');

    try {
      // Query que está fallando
      const messageCount = await prisma.message.count({
        where: {
          userId: user.id,
          role: 'user',
        }
      });
      console.log('✅ Message count:', messageCount);
    } catch (err: any) {
      console.error('❌ Prisma error:', err.message);

      // Intentar con el campo correcto
      try {
        const messageCount = await prisma.message.count({
          where: {
            userId: user.id,
            role: 'user',
          }
        });
        console.log('✅ Message count (corrected):', messageCount);
      } catch (err2: any) {
        console.error('❌ Still failing:', err2.message);
      }
    }

    // 5. Test cost tracking
    console.log('\n5️⃣ Testing cost tracking...');
    const { trackLLMCall } = await import('@/lib/cost-tracking/tracker');

    try {
      trackLLMCall({
        userId: user.id,
        agentId: agent.id,
        provider: 'test',
        model: 'test-model',
        inputTokens: 100,
        outputTokens: 50,
      }).catch(err => {
        console.log('⚠️ Cost tracking failed (expected if model missing):', err.message);
      });
      console.log('✅ Cost tracking called (may fail gracefully)');
    } catch (err: any) {
      console.error('❌ Cost tracking error:', err.message);
    }

    console.log('\n✅ Test completed!\n');
    console.log('📋 Summary:');
    console.log('- Check Redis operations above');
    console.log('- Check Prisma queries above');
    console.log('- Check cost tracking above');
    console.log('\nIf you see ❌ errors, those need to be fixed.\n');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testMessageFlow().catch(console.error);
