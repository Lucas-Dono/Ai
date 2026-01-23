/**
 * MIGRATION SCRIPT: Add Routines to Existing Agents
 *
 * This script generates AI-powered routines for all existing agents
 * belonging to Premium (Plus/Ultra) users.
 *
 * Usage:
 *   npx tsx scripts/migrate-existing-agents-to-routines.ts [--dry-run] [--batch-size=10]
 */

import { prisma } from "@/lib/prisma";
import { generateAndSaveRoutine } from "@/lib/routine/routine-generator";

// ============================================
// CONFIGURATION
// ============================================

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 10;
const delayBetweenBatches = 2000; // 2 seconds between batches to avoid rate limits

console.log('='.repeat(60));
console.log('ROUTINE MIGRATION SCRIPT');
console.log('='.repeat(60));
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE (will create routines)'}`);
console.log(`Batch size: ${batchSize}`);
console.log('='.repeat(60));
console.log();

// ============================================
// HELPER FUNCTIONS
// ============================================

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEligibleAgents() {
  console.log('🔍 Finding eligible agents...');

  // Get all agents from premium users that don't have routines yet
  const agents = await prisma.agent.findMany({
    where: {
      AND: [
        {
          User: {
            plan: {
              in: ['plus', 'ultra']
            }
          }
        },
        {
          CharacterRoutine: null // Don't have routine yet
        }
      ]
    },
    include: {
      User: {
        select: {
          id: true,
          plan: true,
          email: true,
        }
      },
      PersonalityCore: true,
    },
    orderBy: {
      createdAt: 'desc' // Newest first
    }
  });

  console.log(`✅ Found ${agents.length} eligible agents\n`);

  return agents;
}

async function migrateAgent(agent: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`  📝 Generating routine for: ${agent.name}`);
    console.log(`     User: ${agent.User?.email} (${agent.User?.plan})`);

    if (isDryRun) {
      console.log(`     ⚠️  DRY RUN - Would generate routine`);
      return { success: true };
    }

    // Extract profile data
    const profile = agent.profile as any;
    const occupation = profile?.occupation?.current || 'Unknown occupation';

    // Determine timezone based on location
    let timezone = 'America/Argentina/Buenos_Aires'; // Default
    if (profile?.basicIdentity?.city) {
      const city = profile.basicIdentity.city.toLowerCase();
      if (city.includes('madrid') || city.includes('barcelona')) {
        timezone = 'Europe/Madrid';
      } else if (city.includes('mexico') || city.includes('cdmx')) {
        timezone = 'America/Mexico_City';
      } else if (city.includes('santiago')) {
        timezone = 'America/Santiago';
      } else if (city.includes('bogota')) {
        timezone = 'America/Bogota';
      } else if (city.includes('lima')) {
        timezone = 'America/Lima';
      } else if (city.includes('new york')) {
        timezone = 'America/New_York';
      } else if (city.includes('los angeles')) {
        timezone = 'America/Los_Angeles';
      } else if (city.includes('london')) {
        timezone = 'Europe/London';
      } else if (city.includes('tokyo')) {
        timezone = 'Asia/Tokyo';
      }
    }

    // Generate routine
    const routineId = await generateAndSaveRoutine(
      agent.id,
      agent.userId,
      {
        timezone,
        realismLevel: 'moderate', // Default to moderate
        customPrompt: undefined,
      }
    );

    console.log(`     ✅ Routine created: ${routineId}`);
    console.log(`     📍 Timezone: ${timezone}`);
    console.log(`     💼 Occupation: ${occupation}`);

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`     ❌ Error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// MAIN MIGRATION
// ============================================

async function main() {
  const startTime = Date.now();

  // Get eligible agents
  const agents = await getEligibleAgents();

  if (agents.length === 0) {
    console.log('✅ No agents to migrate. All premium agents already have routines!');
    return;
  }

  // Confirmation
  if (!isDryRun) {
    console.log('⚠️  WARNING: This will generate routines for all agents using AI.');
    console.log('⚠️  This will consume Gemini API quota.');
    console.log();
    console.log(`Starting migration of ${agents.length} agents in 5 seconds...`);
    console.log('Press Ctrl+C to cancel');
    console.log();
    await delay(5000);
  }

  // Statistics
  const stats = {
    total: agents.length,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ agentId: string; agentName: string; error: string }>,
  };

  // Process in batches
  console.log('🚀 Starting migration...\n');

  for (let i = 0; i < agents.length; i += batchSize) {
    const batch = agents.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(agents.length / batchSize);

    console.log(`\n📦 Batch ${batchNumber}/${totalBatches} (${batch.length} agents)`);
    console.log('-'.repeat(60));

    // Process batch
    for (const agent of batch) {
      const result = await migrateAgent(agent);

      if (result.success) {
        stats.successful++;
      } else {
        stats.failed++;
        stats.errors.push({
          agentId: agent.id,
          agentName: agent.name,
          error: result.error || 'Unknown error',
        });
      }

      // Small delay between agents to avoid overwhelming the API
      await delay(500);
    }

    // Delay between batches
    if (i + batchSize < agents.length) {
      console.log(`\n⏸️  Waiting ${delayBetweenBatches/1000}s before next batch...`);
      await delay(delayBetweenBatches);
    }
  }

  // Final statistics
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);

  console.log('\n' + '='.repeat(60));
  console.log('MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total agents: ${stats.total}`);
  console.log(`✅ Successful: ${stats.successful}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log('='.repeat(60));

  if (stats.errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    console.log('-'.repeat(60));
    for (const error of stats.errors) {
      console.log(`Agent: ${error.agentName} (${error.agentId})`);
      console.log(`Error: ${error.error}`);
      console.log('-'.repeat(60));
    }
  }

  if (isDryRun) {
    console.log('\n⚠️  This was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to actually create routines.');
  }
}

// ============================================
// EXECUTION
// ============================================

main()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
