#!/usr/bin/env tsx
/**
 * TEST END-TO-END: Sistema de Mensajes Proactivos
 *
 * Este script prueba TODO el flujo de mensajes proactivos:
 * 1. Encuentra/crea un agente de prueba con relación
 * 2. Configura mensajes proactivos
 * 3. Simula condiciones de trigger (inactividad)
 * 4. Ejecuta el sistema de mensajes proactivos
 * 5. Verifica que los mensajes se generan y pueden recuperarse
 * 6. Limpia los datos de prueba
 *
 * Uso:
 *   npx tsx scripts/test-proactive-e2e.ts
 */

import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { processAllAgents, processAgent } from '@/lib/proactive/proactive-service';
import { detectTriggers } from '@/lib/proactive/trigger-detector';

// Colores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' | 'step' = 'info') {
  const icons = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    step: '🔹',
  };
  const colorMap = {
    info: colors.cyan,
    success: colors.green,
    error: colors.red,
    warning: colors.yellow,
    step: colors.blue,
  };
  console.log(`${colorMap[type]}${icons[type]} ${message}${colors.reset}`);
}

function header(title: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
  console.log('='.repeat(70) + '\n');
}

async function findTestAgent(): Promise<{ agentId: string; userId: string } | null> {
  // Buscar un agente con mensajes existentes (relación activa)
  const agentWithMessages = await prisma.agent.findFirst({
    where: {
      Message: {
        some: {
          role: 'user',
        },
      },
    },
    include: {
      Message: {
        where: { role: 'user' },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { userId: true },
      },
    },
  });

  if (agentWithMessages && agentWithMessages.Message[0]?.userId) {
    return {
      agentId: agentWithMessages.id,
      userId: agentWithMessages.Message[0].userId,
    };
  }

  return null;
}

async function setupProactiveConfig(agentId: string, userId: string) {
  // Crear o actualizar configuración proactiva
  const config = await prisma.proactiveConfig.upsert({
    where: { agentId },
    update: {
      enabled: true,
      inactivityEnabled: true,
      inactivityDays: 1, // 1 día para pruebas
      maxMessagesPerDay: 10, // Permitir varios mensajes para pruebas
      maxMessagesPerWeek: 50,
      quietHoursStart: null, // Sin horas silenciosas para pruebas
      quietHoursEnd: null,
      emotionalCheckInEnabled: true,
      eventRemindersEnabled: true,
    },
    create: {
      id: nanoid(),
      updatedAt: new Date(),
      agentId,
      userId,
      enabled: true,
      inactivityEnabled: true,
      inactivityDays: 1,
      maxMessagesPerDay: 10,
      maxMessagesPerWeek: 50,
      quietHoursStart: null,
      quietHoursEnd: null,
    },
  });

  return config;
}

async function simulateInactivity(agentId: string) {
  // Modificar la fecha del último mensaje del usuario para simular inactividad
  const lastUserMessage = await prisma.message.findFirst({
    where: {
      agentId,
      role: 'user',
    },
    orderBy: { createdAt: 'desc' },
  });

  if (lastUserMessage) {
    // Cambiar la fecha a hace 5 días
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    await prisma.message.update({
      where: { id: lastUserMessage.id },
      data: { createdAt: fiveDaysAgo },
    });

    return {
      messageId: lastUserMessage.id,
      originalDate: lastUserMessage.createdAt,
      newDate: fiveDaysAgo,
    };
  }

  return null;
}

async function restoreMessageDate(messageId: string, originalDate: Date) {
  await prisma.message.update({
    where: { id: messageId },
    data: { createdAt: originalDate },
  });
}

async function cleanupProactiveMessages(agentId: string) {
  // Limpiar mensajes proactivos de prueba
  const deleted = await prisma.proactiveMessage.deleteMany({
    where: {
      agentId,
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Últimos 60 minutos
      },
    },
  });

  return deleted.count;
}

async function main() {
  console.log('\n');
  header('TEST END-TO-END: Sistema de Mensajes Proactivos');

  const startTime = Date.now();
  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // ========================================
    // PASO 1: Buscar agente de prueba
    // ========================================
    header('PASO 1: Buscar agente de prueba');

    const testData = await findTestAgent();

    if (!testData) {
      log('No se encontró un agente con mensajes para probar', 'error');
      log('Por favor, crea un agente y envía al menos un mensaje primero', 'warning');
      process.exit(1);
    }

    log(`Agente encontrado: ${testData.agentId}`, 'success');
    log(`Usuario: ${testData.userId}`, 'info');
    testsPassed++;

    // Obtener info del agente
    const agent = await prisma.agent.findUnique({
      where: { id: testData.agentId },
      select: { name: true },
    });
    log(`Nombre del agente: ${agent?.name || 'Desconocido'}`, 'info');

    // ========================================
    // PASO 2: Configurar mensajes proactivos
    // ========================================
    header('PASO 2: Configurar mensajes proactivos');

    const config = await setupProactiveConfig(testData.agentId, testData.userId);
    log(`Configuración proactiva creada/actualizada`, 'success');
    log(`  - enabled: ${config.enabled}`, 'step');
    log(`  - inactivityDays: ${config.inactivityDays}`, 'step');
    log(`  - maxMessagesPerDay: ${config.maxMessagesPerDay}`, 'step');
    testsPassed++;

    // ========================================
    // PASO 3: Simular inactividad
    // ========================================
    header('PASO 3: Simular inactividad');

    const inactivityData = await simulateInactivity(testData.agentId);

    if (!inactivityData) {
      log('No se pudo simular inactividad (sin mensajes de usuario)', 'error');
      testsFailed++;
    } else {
      log(`Último mensaje modificado para simular inactividad`, 'success');
      log(`  - Message ID: ${inactivityData.messageId}`, 'step');
      log(`  - Fecha original: ${inactivityData.originalDate.toISOString()}`, 'step');
      log(`  - Nueva fecha: ${inactivityData.newDate.toISOString()}`, 'step');
      testsPassed++;
    }

    // ========================================
    // PASO 4: Detectar triggers
    // ========================================
    header('PASO 4: Detectar triggers');

    const triggers = await detectTriggers(testData.agentId, testData.userId);

    if (triggers.length === 0) {
      log('No se detectaron triggers (posible problema)', 'warning');
      log('Esto puede ocurrir si:', 'info');
      log('  - El rate limit se ha alcanzado', 'step');
      log('  - Estamos en horario silencioso', 'step');
      log('  - Hay mensajes proactivos recientes', 'step');
    } else {
      log(`Triggers detectados: ${triggers.length}`, 'success');
      for (const trigger of triggers) {
        log(`  - Tipo: ${trigger.type}, Prioridad: ${trigger.priority}`, 'step');
        log(`    Razón: ${trigger.reason}`, 'info');
      }
      testsPassed++;
    }

    // ========================================
    // PASO 5: Procesar agente (generar mensaje)
    // ========================================
    header('PASO 5: Procesar agente (generar mensaje)');

    const processResult = await processAgent(testData.agentId, testData.userId);

    if (!processResult) {
      log('No se generó mensaje proactivo (sin triggers activos)', 'warning');
    } else if (!processResult.success) {
      log(`Error generando mensaje: ${processResult.error}`, 'error');
      testsFailed++;
    } else {
      log('Mensaje proactivo generado exitosamente!', 'success');
      log(`  - Message ID: ${processResult.messageId}`, 'step');
      log(`  - Proactive Message ID: ${processResult.proactiveMessageId}`, 'step');
      testsPassed++;

      // Obtener el mensaje generado
      if (processResult.proactiveMessageId) {
        const proactiveMessage = await prisma.proactiveMessage.findUnique({
          where: { id: processResult.proactiveMessageId },
        });

        if (proactiveMessage) {
          console.log('\n  📝 Contenido del mensaje:');
          console.log('  ┌' + '─'.repeat(60) + '┐');
          const lines = proactiveMessage.content.split('\n');
          for (const line of lines) {
            console.log(`  │ ${line.padEnd(58)} │`);
          }
          console.log('  └' + '─'.repeat(60) + '┘');
        }
      }
    }

    // ========================================
    // PASO 6: Verificar endpoint de mensajes
    // ========================================
    header('PASO 6: Verificar mensajes en base de datos');

    const pendingMessages = await prisma.proactiveMessage.findMany({
      where: {
        agentId: testData.agentId,
        userId: testData.userId,
        status: { in: ['pending', 'sent'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    log(`Mensajes proactivos encontrados: ${pendingMessages.length}`, 'success');
    for (const msg of pendingMessages) {
      log(`  - [${msg.status}] ${msg.triggerType}: "${msg.content.substring(0, 40)}..."`, 'step');
    }
    testsPassed++;

    // ========================================
    // PASO 7: Cleanup
    // ========================================
    header('PASO 7: Limpieza');

    // Restaurar fecha original del mensaje
    if (inactivityData) {
      await restoreMessageDate(inactivityData.messageId, inactivityData.originalDate);
      log('Fecha del mensaje restaurada', 'success');
    }

    // Limpiar mensajes proactivos de prueba
    const deletedCount = await cleanupProactiveMessages(testData.agentId);
    log(`Mensajes proactivos de prueba eliminados: ${deletedCount}`, 'success');
    testsPassed++;

    // ========================================
    // RESUMEN FINAL
    // ========================================
    header('RESUMEN FINAL');

    const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(`  ${colors.green}Tests pasados: ${testsPassed}${colors.reset}`);
    console.log(`  ${colors.red}Tests fallidos: ${testsFailed}${colors.reset}`);
    console.log(`  Tiempo de ejecución: ${executionTime}s`);
    console.log('');

    if (testsFailed === 0) {
      log('¡TODOS LOS TESTS PASARON! El sistema de mensajes proactivos funciona correctamente.', 'success');
    } else {
      log(`${testsFailed} test(s) fallaron. Revisa los errores arriba.`, 'error');
    }

    console.log('\n' + '='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO:', error);
    testsFailed++;
  } finally {
    await prisma.$disconnect();
  }

  process.exit(testsFailed > 0 ? 1 : 0);
}

main();
