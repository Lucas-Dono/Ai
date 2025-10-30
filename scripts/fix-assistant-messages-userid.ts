/**
 * Migration Script: Add userId to assistant messages
 *
 * Problem: Assistant messages were created without userId, making them invisible
 * when loading message history (which filters by agentId AND userId).
 *
 * Solution: For each assistant message, find the corresponding user message
 * and copy its userId.
 */

import { prisma } from '../lib/prisma';

async function fixAssistantMessagesUserId() {
  console.log('🔍 Finding assistant messages without userId...\n');

  // Get all assistant messages that don't have userId
  const assistantMessages = await prisma.message.findMany({
    where: {
      role: 'assistant',
      userId: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log(`Found ${assistantMessages.length} assistant messages without userId\n`);

  if (assistantMessages.length === 0) {
    console.log('✅ All assistant messages already have userId. Nothing to fix!');
    return;
  }

  let fixed = 0;
  let skipped = 0;

  for (const assistantMsg of assistantMessages) {
    // Find the most recent user message before this assistant message
    // in the same conversation (same agentId)
    const userMessage = await prisma.message.findFirst({
      where: {
        agentId: assistantMsg.agentId,
        role: 'user',
        userId: { not: null },
        createdAt: { lte: assistantMsg.createdAt },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        userId: true,
      },
    });

    if (userMessage?.userId) {
      // Update assistant message with the userId
      await prisma.message.update({
        where: { id: assistantMsg.id },
        data: { userId: userMessage.userId },
      });

      fixed++;
      console.log(`✅ Fixed message ${assistantMsg.id} - assigned userId: ${userMessage.userId}`);
    } else {
      skipped++;
      console.log(`⚠️  Skipped message ${assistantMsg.id} - no matching user message found`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   - Total assistant messages without userId: ${assistantMessages.length}`);
  console.log(`   - Fixed: ${fixed}`);
  console.log(`   - Skipped (no user found): ${skipped}`);
  console.log('\n✅ Migration complete!\n');
}

// Run the migration
fixAssistantMessagesUserId()
  .then(() => {
    console.log('Disconnecting from database...');
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error('❌ Error during migration:', error);
    return prisma.$disconnect();
  });
