/**
 * Cron Job Script: Proactive Messaging
 *
 * This script should be run periodically (e.g., every hour) to process
 * proactive messages for all agents.
 *
 * Usage:
 * - Manual: npx tsx scripts/run-proactive-messaging.ts
 * - Cron: Add to crontab or use Vercel Cron
 * - API: Can also be triggered via POST /api/proactive
 */

import { processAllAgents } from '@/lib/proactive/proactive-service';
import { createLogger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const log = createLogger('ProactiveCron');

async function main() {
  log.info('🤖 Starting proactive messaging cron job');

  try {
    await processAllAgents();
    log.info('✅ Proactive messaging cron job completed successfully');
  } catch (error) {
    log.error({ error }, '❌ Proactive messaging cron job failed');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
