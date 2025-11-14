#!/usr/bin/env tsx
/**
 * Test Script para Sistema de Comportamiento Proactivo V2
 *
 * Uso:
 *   npx tsx scripts/test-proactive-system-v2.ts <agentId> <userId>
 *
 * Ejemplo:
 *   npx tsx scripts/test-proactive-system-v2.ts clxxx123 user456
 */

import { proactiveBehavior } from '@/lib/proactive-behavior';
import { prisma } from '@/lib/prisma';

async function testProactiveSystemV2(agentId: string, userId: string) {
  console.log('\n🤖 SISTEMA DE COMPORTAMIENTO PROACTIVO V2 - TEST SUITE\n');
  console.log('='.repeat(70) + '\n');

  console.log(`Agent ID: ${agentId}`);
  console.log(`User ID: ${userId}\n`);

  try {
    // ============================================
    // TEST 1: Detección de Triggers
    // ============================================
    console.log('📍 TEST 1: Detección de Triggers\n');
    console.log('-'.repeat(70));

    const triggers = await proactiveBehavior.detectTriggers(agentId, userId);

    if (triggers.length === 0) {
      console.log('\n  ❌ No se detectaron triggers\n');
      console.log('  Esto es normal si:');
      console.log('    - No hay suficiente inactividad');
      console.log('    - No hay topics pendientes');
      console.log('    - No hay life events próximos');
      console.log('    - Cooldown está activo (12-24h)\n');
    } else {
      console.log(`\n  ✅ Triggers detectados: ${triggers.length}\n`);

      for (let i = 0; i < triggers.length; i++) {
        const trigger = triggers[i];
        console.log(`  🎯 Trigger #${i + 1}:`);
        console.log(`     Tipo: ${trigger.type}`);
        console.log(`     Prioridad: ${(trigger.priority * 100).toFixed(0)}%`);
        console.log(`     Razón: ${trigger.reason}`);

        if (trigger.context.unresolvedTopic) {
          console.log(`     Topic: "${trigger.context.unresolvedTopic.topic}"`);
          if (trigger.context.unresolvedTopic.expectedResolutionDate) {
            console.log(
              `     Fecha esperada: ${new Date(trigger.context.unresolvedTopic.expectedResolutionDate).toLocaleDateString()}`
            );
          }
        }

        if (trigger.context.event) {
          console.log(`     Evento: ${trigger.context.event.description}`);
          if (trigger.context.hoursUntil) {
            console.log(`     En: ${trigger.context.hoursUntil.toFixed(1)}h`);
          }
        }

        if (trigger.context.milestone) {
          console.log(`     Milestone: ${trigger.context.milestone}`);
        }

        if (trigger.context.lastEmotion) {
          const emotions = trigger.context.lastEmotion;
          const dominant = Object.entries(emotions)
            .sort((a: any, b: any) => b[1] - a[1])[0];
          console.log(`     Emoción dominante: ${dominant[0]} (${(dominant[1] as number * 100).toFixed(0)}%)`);
        }

        console.log('');
      }
    }

    console.log('='.repeat(70) + '\n');

    // ============================================
    // TEST 2: Verificación de Timing
    // ============================================
    console.log('⏰ TEST 2: Verificación de Timing\n');
    console.log('-'.repeat(70) + '\n');

    const timezone = 'America/Argentina/Buenos_Aires';
    const canSend = await proactiveBehavior.shouldSendNow(agentId, userId, timezone);

    const now = new Date();
    const hour = now.getHours();

    console.log(`  Hora actual: ${hour}:${now.getMinutes().toString().padStart(2, '0')}`);
    console.log(`  Timezone: ${timezone}`);
    console.log(`  Puede enviar ahora: ${canSend.shouldSend ? '✅ SÍ' : '❌ NO'}`);
    console.log(`  Razón: ${canSend.reason}`);

    if (canSend.suggestedTime) {
      console.log(`  Momento sugerido: ${canSend.suggestedTime.toLocaleString('es-AR')}`);
    }

    console.log('\n' + '='.repeat(70) + '\n');

    // ============================================
    // TEST 3: Generación de Mensaje (Preview)
    // ============================================
    if (triggers.length > 0) {
      console.log('💬 TEST 3: Generación de Mensaje (Preview)\n');
      console.log('-'.repeat(70) + '\n');

      const topTrigger = triggers[0];

      console.log(`  Generando mensaje para trigger: ${topTrigger.type}`);
      console.log(`  Prioridad: ${(topTrigger.priority * 100).toFixed(0)}%\n`);

      try {
        const message = await proactiveBehavior.generateMessage(
          agentId,
          userId,
          topTrigger
        );

        console.log('  ✅ Mensaje generado!\n');
        console.log('  ┌─────────────────────────────────────────────────────────────┐');
        console.log(`  │ ${message.padEnd(60)} │`);
        console.log('  └─────────────────────────────────────────────────────────────┘\n');
      } catch (error: any) {
        console.log(`  ❌ Error generando mensaje: ${error.message}\n`);
      }

      console.log('='.repeat(70) + '\n');
    } else {
      console.log('💬 TEST 3: Generación de Mensaje (Preview)\n');
      console.log('-'.repeat(70) + '\n');
      console.log('  ⏭️ Saltado (no hay triggers)\n');
      console.log('='.repeat(70) + '\n');
    }

    // ============================================
    // TEST 4: Check & Send Completo
    // ============================================
    console.log('🚀 TEST 4: Check & Send Completo\n');
    console.log('-'.repeat(70) + '\n');

    console.log('  Ejecutando checkAndSend()...\n');

    const result = await proactiveBehavior.checkAndSend(agentId, userId, timezone);

    if (result.sent) {
      console.log('  ✅ MENSAJE ENVIADO!\n');
      console.log('  ┌─────────────────────────────────────────────────────────────┐');
      console.log(`  │ ${result.message!.substring(0, 60).padEnd(60)} │`);
      if (result.message!.length > 60) {
        console.log(`  │ ${result.message!.substring(60, 120).padEnd(60)} │`);
      }
      console.log('  └─────────────────────────────────────────────────────────────┘\n');
      console.log(`  Trigger: ${result.trigger?.type}`);
      console.log(`  Prioridad: ${(result.trigger!.priority * 100).toFixed(0)}%`);
      console.log(`  Razón: ${result.trigger?.reason}\n`);
    } else {
      console.log('  ❌ NO SE ENVIÓ MENSAJE\n');
      console.log(`  Razón: ${result.reason}`);

      if (result.trigger) {
        console.log(`  Trigger detectado: ${result.trigger.type} (prioridad: ${(result.trigger.priority * 100).toFixed(0)}%)`);
      }

      if (result.scheduledFor) {
        console.log(`  Programado para: ${result.scheduledFor.toLocaleString('es-AR')}`);
      }

      console.log('');
    }

    console.log('='.repeat(70) + '\n');

    // ============================================
    // TEST 5: Analytics
    // ============================================
    console.log('📊 TEST 5: Analytics (últimos 30 días)\n');
    console.log('-'.repeat(70) + '\n');

    const metrics = await proactiveBehavior.getMetrics(agentId, userId, 30);

    if (metrics.totalSent === 0) {
      console.log('  ℹ️ Sin datos históricos\n');
      console.log('  Envía algunos mensajes proactivos y vuelve a ejecutar este test\n');
    } else {
      console.log('  Resumen General:');
      console.log(`    Total enviados: ${metrics.totalSent}`);
      console.log(`    Con respuesta: ${metrics.totalResponded}`);
      console.log(`    Tasa de respuesta: ${metrics.responseRate.toFixed(1)}%`);
      console.log(
        `    Tiempo promedio de respuesta: ${metrics.avgResponseTimeMinutes.toFixed(0)} min`
      );

      const trendEmoji =
        metrics.lastWeekTrend === 'up'
          ? '📈'
          : metrics.lastWeekTrend === 'down'
            ? '📉'
            : '➡️';
      console.log(`    Tendencia: ${trendEmoji} ${metrics.lastWeekTrend === 'up' ? 'Al alza' : metrics.lastWeekTrend === 'down' ? 'A la baja' : 'Estable'}\n`);

      if (Object.keys(metrics.byType).length > 0) {
        console.log('  Performance por Tipo:');
        const sortedTypes = Object.entries(metrics.byType).sort(
          (a, b) => b[1].responseRate - a[1].responseRate
        );

        for (const [type, data] of sortedTypes.slice(0, 5)) {
          console.log(
            `    ${type.padEnd(20)}: ${data.responseRate.toFixed(1).padStart(5)}% (${data.sent} enviados, ${data.avgResponseTimeMinutes.toFixed(0)} min avg)`
          );
        }
        console.log('');
      }

      // Mejores horarios
      const hoursByResponseRate = Object.entries(metrics.byHour)
        .filter(([_, data]) => data.sent > 0)
        .map(([hour, data]) => ({
          hour: parseInt(hour),
          responseRate: (data.responded / data.sent) * 100,
          sent: data.sent,
        }))
        .sort((a, b) => b.responseRate - a.responseRate)
        .slice(0, 5);

      if (hoursByResponseRate.length > 0) {
        console.log('  Mejores Horarios:');
        for (const { hour, responseRate, sent } of hoursByResponseRate) {
          console.log(
            `    ${hour.toString().padStart(2, '0')}:00 - ${responseRate.toFixed(1).padStart(5)}% (${sent} enviados)`
          );
        }
        console.log('');
      }
    }

    console.log('='.repeat(70) + '\n');

    // ============================================
    // TEST 6: Insights
    // ============================================
    console.log('💡 TEST 6: Insights Accionables\n');
    console.log('-'.repeat(70) + '\n');

    const insights = await proactiveBehavior.getInsights(agentId, userId);

    if (insights.length === 0) {
      console.log('  ℹ️ Sin insights disponibles (necesita más datos)\n');
    } else {
      for (const insight of insights) {
        const emoji =
          insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${emoji} ${insight.message}`);
      }
      console.log('');
    }

    console.log('='.repeat(70) + '\n');

    // ============================================
    // TEST 7: Mejor Momento
    // ============================================
    console.log('🕐 TEST 7: Mejor Momento para Enviar\n');
    console.log('-'.repeat(70) + '\n');

    const bestTime = await proactiveBehavior.getBestSendTime(agentId, userId, timezone);

    const hoursUntil = (bestTime.getTime() - Date.now()) / (1000 * 60 * 60);

    console.log(`  Mejor momento calculado: ${bestTime.toLocaleString('es-AR')}`);
    console.log(`  Tiempo restante: ${hoursUntil.toFixed(1)}h`);
    console.log('');

    console.log('='.repeat(70) + '\n');

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('📋 RESUMEN DEL TEST\n');
    console.log('='.repeat(70) + '\n');

    if (result.sent) {
      console.log('  🎉 ¡Sistema funcionando perfectamente!');
      console.log('     Un mensaje proactivo fue generado y enviado.\n');
      console.log(`     Tipo: ${result.trigger?.type}`);
      console.log(`     Mensaje: "${result.message?.substring(0, 60)}..."\n`);
    } else if (triggers.length > 0) {
      console.log('  ⚠️ Sistema funcionando, pero no se envió mensaje');
      console.log(`     Razón: ${result.reason}\n`);

      if (result.scheduledFor) {
        console.log(`     El mensaje está programado para: ${result.scheduledFor.toLocaleString('es-AR')}\n`);
      }
    } else {
      console.log('  ℹ️ Sistema OK, sin triggers activos');
      console.log('     Esto es normal. El sistema espera condiciones apropiadas.\n');
      console.log('     Para forzar un trigger, puedes:');
      console.log('       - Modificar createdAt del último mensaje (inactividad)');
      console.log('       - Agregar topics sin resolver en internalState');
      console.log('       - Crear life events próximos\n');
    }

    console.log('='.repeat(70) + '\n');

    console.log('✅ Testing completado!\n');
  } catch (error: any) {
    console.error('\n❌ ERROR durante testing:');
    console.error(error);
    console.error('');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============================================
// Main
// ============================================

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n📖 Uso: npx tsx scripts/test-proactive-system-v2.ts <agentId> <userId>\n');
  console.log('Ejemplo:');
  console.log('  npx tsx scripts/test-proactive-system-v2.ts clxxx123 user456\n');
  process.exit(1);
}

const [agentId, userId] = args;

testProactiveSystemV2(agentId, userId)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
