/**
 * Test Script for Proactive Messaging System
 *
 * Tests:
 * 1. Config creation and management
 * 2. Trigger detection (inactivity, events, emotional)
 * 3. Message generation
 * 4. End-to-end proactive message flow
 */

import { prisma } from '@/lib/prisma';
import {
  detectTriggers,
  getOrCreateProactiveConfig,
  updateLastProactiveMessage,
} from '@/lib/proactive/trigger-detector';
import { generateProactiveMessage } from '@/lib/proactive/message-generator';
import { processAgent, getProactiveStats } from '@/lib/proactive/proactive-service';

let TEST_AGENT_ID: string;
let TEST_USER_ID: string;

async function setupTestAgent() {
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

  return agent;
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n');

  await prisma.proactiveMessage.deleteMany({
    where: {
      agentId: TEST_AGENT_ID,
      userId: TEST_USER_ID,
    },
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 1: CONFIGURATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testConfiguration() {
  console.log('⚙️  Test 1: Proactive Configuration\n');
  console.log('='.repeat(60));

  // Create or get config
  console.log('\n1. Creating/Getting proactive config...');
  const config = await getOrCreateProactiveConfig(TEST_AGENT_ID, TEST_USER_ID);

  console.log(`   ✓ Config created/retrieved`);
  console.log(`   - Enabled: ${config.enabled}`);
  console.log(`   - Max messages/day: ${config.maxMessagesPerDay}`);
  console.log(`   - Max messages/week: ${config.maxMessagesPerWeek}`);
  console.log(`   - Inactivity enabled: ${config.inactivityEnabled}`);
  console.log(`   - Inactivity days: ${config.inactivityDays}`);
  console.log(`   - Event reminders: ${config.eventRemindersEnabled}`);
  console.log(`   - Quiet hours: ${config.quietHoursStart}:00 - ${config.quietHoursEnd}:00`);

  console.log('\n' + '='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 2: TRIGGER DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testTriggerDetection() {
  console.log('🔔 Test 2: Trigger Detection\n');
  console.log('='.repeat(60));

  // Simulate inactivity by setting last message to 4 days ago
  console.log('\n1. Simulating user inactivity (4 days ago)...');

  const fourDaysAgo = new Date();
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  // Update last user message to 4 days ago
  const lastUserMsg = await prisma.message.findFirst({
    where: {
      agentId: TEST_AGENT_ID,
      role: 'user',
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (lastUserMsg) {
    await prisma.message.update({
      where: { id: lastUserMsg.id },
      data: {
        createdAt: fourDaysAgo,
      },
    });
  }

  // Detect triggers
  console.log('\n2. Detecting triggers...');
  const triggers = await detectTriggers(TEST_AGENT_ID, TEST_USER_ID);

  console.log(`\n   ✓ Found ${triggers.length} trigger(s):\n`);

  for (const trigger of triggers) {
    console.log(`   🔔 Trigger: ${trigger.type}`);
    console.log(`      Priority: ${trigger.priority}`);
    console.log(`      Reason: ${trigger.reason}`);
    console.log(`      Context:`, JSON.stringify(trigger.context, null, 2).split('\n').map(l => '      ' + l).join('\n').trim());
    console.log('');
  }

  console.log('='.repeat(60) + '\n');

  return triggers;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 3: MESSAGE GENERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testMessageGeneration(triggers: any[]) {
  console.log('💬 Test 3: Message Generation\n');
  console.log('='.repeat(60));

  if (triggers.length === 0) {
    console.log('\n   ⚠️  No triggers available, skipping message generation test\n');
    console.log('='.repeat(60) + '\n');
    return;
  }

  const trigger = triggers[0];

  console.log(`\n1. Generating proactive message for trigger: ${trigger.type}\n`);

  try {
    const message = await generateProactiveMessage(TEST_AGENT_ID, TEST_USER_ID, trigger);

    console.log('   ✓ Message generated successfully!\n');
    console.log('   📨 Generated message:');
    console.log('   ┌─────────────────────────────────────────────');
    console.log(`   │ ${message}`);
    console.log('   └─────────────────────────────────────────────\n');
  } catch (error) {
    console.log('   ❌ Message generation failed:', error);
  }

  console.log('='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 4: END-TO-END FLOW
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testEndToEnd() {
  console.log('🔄 Test 4: End-to-End Proactive Message Flow\n');
  console.log('='.repeat(60));

  console.log('\n1. Processing agent for proactive messages...\n');

  try {
    const result = await processAgent(TEST_AGENT_ID, TEST_USER_ID);

    if (!result) {
      console.log('   ℹ️  No proactive message sent (no triggers or rate limited)\n');
    } else if (result.success) {
      console.log('   ✓ Proactive message sent successfully!\n');
      console.log(`   - Message ID: ${result.messageId}`);
      console.log(`   - Proactive Message ID: ${result.proactiveMessageId}`);

      // Get the actual message
      const message = await prisma.message.findUnique({
        where: { id: result.messageId },
      });

      if (message) {
        console.log('\n   📨 Message content:');
        console.log('   ┌─────────────────────────────────────────────');
        console.log(`   │ ${message.content}`);
        console.log('   └─────────────────────────────────────────────\n');
      }

      // Get proactive message details
      const proactiveMsg = await prisma.proactiveMessage.findUnique({
        where: { id: result.proactiveMessageId },
      });

      if (proactiveMsg) {
        console.log('   📊 Proactive message details:');
        console.log(`      - Trigger type: ${proactiveMsg.triggerType}`);
        console.log(`      - Status: ${proactiveMsg.status}`);
        console.log(`      - Sent at: ${proactiveMsg.sentAt?.toISOString()}`);
      }
    } else {
      console.log('   ❌ Failed to send proactive message');
      console.log(`      Error: ${result.error}`);
    }
  } catch (error) {
    console.log('   ❌ Error in end-to-end test:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEST 5: STATISTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function testStatistics() {
  console.log('📊 Test 5: Proactive Message Statistics\n');
  console.log('='.repeat(60));

  const stats = await getProactiveStats(TEST_AGENT_ID);

  console.log('\n   Proactive messaging statistics:');
  console.log(`   - Sent last 24h: ${stats.sentLast24h}`);
  console.log(`   - Sent last week: ${stats.sentLastWeek}`);
  console.log(`   - Total sent: ${stats.total}`);
  console.log(`   - Response rate: ${stats.responseRate.toFixed(1)}%\n`);

  console.log('='.repeat(60) + '\n');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function main() {
  console.log('\n🧪 PROACTIVE MESSAGING SYSTEM TEST SUITE\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Setup
    await setupTestAgent();

    // Run tests
    await testConfiguration();
    const triggers = await testTriggerDetection();
    await testMessageGeneration(triggers);
    await testEndToEnd();
    await testStatistics();

    console.log('✅ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Note: Not cleaning up so you can inspect the messages in the UI
    console.log('💡 Tip: Check your chat UI to see the proactive message!');
    console.log('💡 Tip: To clean up test data, run the cleanup manually if needed\n');
    await prisma.$disconnect();
  }
}

main();
