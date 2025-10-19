/**
 * Test script for REMEMBER event system
 *
 * Tests:
 * 1. Parsing [REMEMBER:...] commands with different date formats
 * 2. Saving events to database
 * 3. Retrieving upcoming events
 * 4. Retrieving recent past events
 * 5. Building reminder context for prompts
 */

import { prisma } from '@/lib/prisma';
import {
  interceptRememberCommands,
  getUpcomingEvents,
  getRecentPastEvents,
  buildReminderContext,
} from '@/lib/events/remember-interceptor';

let TEST_AGENT_ID: string;
let TEST_USER_ID: string;

async function setupTestAgent() {
  // Use an existing agent from the database
  const agent = await prisma.agent.findFirst({
    include: {
      user: true,
    },
  });

  if (!agent) {
    throw new Error('No agents found in database. Please create an agent first.');
  }

  TEST_AGENT_ID = agent.id;
  TEST_USER_ID = agent.userId;

  console.log(`✓ Using agent: ${agent.name} (${agent.id})`);
  console.log(`✓ User ID: ${TEST_USER_ID}\n`);
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n');

  // Delete only test events
  await prisma.importantEvent.deleteMany({
    where: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
    },
  });
}

async function testDateParsing() {
  console.log('📅 Test 1: Date Format Parsing\n');
  console.log('=' .repeat(50));

  const testResponses = [
    // YYYY-MM-DD format
    'Espero que te vaya bien mañana! [REMEMBER:2025-10-23|medical|Cirugía de Max|high]',

    // DD/MM/YYYY format
    'Feliz cumpleaños! [REMEMBER:15/03/2025|birthday|Cumpleaños del usuario|critical]',

    // Relative: tomorrow
    'Mucha suerte con el examen! [REMEMBER:tomorrow|exam|Examen final de matemáticas|medium]',

    // Relative: in N days
    'Qué lindo viaje! [REMEMBER:in 5 days|special|Viaje a Bariloche|medium]',

    // Multiple events in one response
    'Te recuerdo dos cosas: [REMEMBER:2025-12-25|special|Navidad|low] y también [REMEMBER:2025-01-01|special|Año Nuevo|low]',
  ];

  for (const response of testResponses) {
    console.log(`\nResponse: "${response}"`);

    const result = await interceptRememberCommands(
      TEST_AGENT_ID,
      TEST_USER_ID,
      response
    );

    console.log(`  ✓ Detected ${result.commands.length} command(s)`);

    for (const cmd of result.commands) {
      console.log(`    - Date: ${cmd.date.toISOString()}`);
      console.log(`      Type: ${cmd.type}`);
      console.log(`      Description: ${cmd.description}`);
      console.log(`      Priority: ${cmd.priority}`);
    }

    console.log(`  ✓ Clean response: "${result.cleanResponse}"`);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

async function testDatabaseStorage() {
  console.log('💾 Test 2: Database Storage\n');
  console.log('=' .repeat(50));

  const events = await prisma.importantEvent.findMany({
    where: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
    },
    orderBy: {
      eventDate: 'asc',
    },
  });

  console.log(`\n✓ Found ${events.length} events in database:\n`);

  for (const event of events) {
    console.log(`  📌 ${event.description}`);
    console.log(`     Date: ${event.eventDate.toISOString().split('T')[0]}`);
    console.log(`     Type: ${event.type} | Priority: ${event.priority}`);
    console.log(`     Mentioned: ${event.mentioned} | Happened: ${event.eventHappened}\n`);
  }

  console.log('='.repeat(50) + '\n');
}

async function testUpcomingEvents() {
  console.log('🔜 Test 3: Upcoming Events Retrieval\n');
  console.log('=' .repeat(50));

  const upcoming = await getUpcomingEvents(TEST_AGENT_ID, TEST_USER_ID, 30);

  console.log(`\n✓ Found ${upcoming.length} upcoming events (next 30 days):\n`);

  for (const event of upcoming) {
    const daysUntil = Math.ceil(
      (event.eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const when = daysUntil === 0 ? 'HOY' : daysUntil === 1 ? 'MAÑANA' : `en ${daysUntil} días`;

    console.log(`  ${when}: ${event.description} [${event.priority}]`);
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

async function testRecentPastEvents() {
  console.log('⏮️  Test 4: Recent Past Events\n');
  console.log('=' .repeat(50));

  // Crear un evento en el pasado para probar
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(12, 0, 0, 0);

  await prisma.importantEvent.create({
    data: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
      eventDate: yesterday,
      type: 'medical',
      description: 'Cirugía de prueba (ayer)',
      priority: 'high',
      mentioned: false,
      eventHappened: false,
    },
  });

  const recentPast = await getRecentPastEvents(TEST_AGENT_ID, TEST_USER_ID, 3);

  console.log(`\n✓ Found ${recentPast.length} recent past events (not mentioned):\n`);

  for (const event of recentPast) {
    const daysAgo = Math.floor(
      (Date.now() - event.eventDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const when = daysAgo === 0 ? 'HOY' : daysAgo === 1 ? 'AYER' : `hace ${daysAgo} días`;

    console.log(`  ${when}: ${event.description} [${event.priority}]`);
    console.log(`     → Deberías preguntar cómo fue\n`);
  }

  console.log('='.repeat(50) + '\n');
}

async function testReminderContext() {
  console.log('📝 Test 5: Reminder Context Building\n');
  console.log('=' .repeat(50));

  const stages = ['stranger', 'acquaintance', 'friend', 'intimate'];

  for (const stage of stages) {
    console.log(`\n🔹 Relationship Stage: ${stage.toUpperCase()}\n`);

    const context = await buildReminderContext(
      TEST_AGENT_ID,
      TEST_USER_ID,
      stage
    );

    if (context) {
      console.log(context);
    } else {
      console.log('  (No reminder context - relationship stage too low or no events)');
    }

    console.log('\n' + '-'.repeat(50));
  }

  console.log('\n' + '='.repeat(50) + '\n');
}

async function main() {
  console.log('\n🧪 REMEMBER System Test Suite\n');
  console.log('='.repeat(50) + '\n');

  try {
    // Setup test agent first
    await setupTestAgent();

    // Run tests
    await testDateParsing();
    await testDatabaseStorage();
    await testUpcomingEvents();
    await testRecentPastEvents();
    await testReminderContext();

    console.log('✅ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup after tests
    console.log('🧹 Final cleanup...');
    await cleanup();
    await prisma.$disconnect();
  }
}

main();
