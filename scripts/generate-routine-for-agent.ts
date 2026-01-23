/**
 * UTILITY SCRIPT: Generate Routine for Specific Agent(s)
 *
 * Generate routines for specific agents by ID or user email
 *
 * Usage:
 *   # Single agent by ID
 *   npx tsx scripts/generate-routine-for-agent.ts --agent-id=clxx123
 *
 *   # All agents for a user
 *   npx tsx scripts/generate-routine-for-agent.ts --user-email=user@example.com
 *
 *   # With custom parameters
 *   npx tsx scripts/generate-routine-for-agent.ts --agent-id=clxx123 --realism=immersive --timezone="America/New_York"
 */

import { prisma } from "@/lib/prisma";
import { generateAndSaveRoutine } from "@/lib/routine/routine-generator";
import type { RealismLevel } from "@/types/routine";

// ============================================
// PARSE ARGUMENTS
// ============================================

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : undefined;
}

const agentId = getArg('agent-id');
const userEmail = getArg('user-email');
const realismLevel = (getArg('realism') || 'moderate') as RealismLevel;
const timezone = getArg('timezone');
const customPrompt = getArg('prompt');

console.log('='.repeat(60));
console.log('ROUTINE GENERATION UTILITY');
console.log('='.repeat(60));
console.log(`Agent ID: ${agentId || 'N/A'}`);
console.log(`User Email: ${userEmail || 'N/A'}`);
console.log(`Realism Level: ${realismLevel}`);
console.log(`Timezone: ${timezone || 'Auto-detect'}`);
console.log(`Custom Prompt: ${customPrompt ? 'Yes' : 'No'}`);
console.log('='.repeat(60));
console.log();

// ============================================
// VALIDATION
// ============================================

if (!agentId && !userEmail) {
  console.error('❌ Error: Must provide either --agent-id or --user-email');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/generate-routine-for-agent.ts --agent-id=clxx123');
  console.log('  npx tsx scripts/generate-routine-for-agent.ts --user-email=user@example.com');
  process.exit(1);
}

if (!['subtle', 'moderate', 'immersive'].includes(realismLevel)) {
  console.error('❌ Error: Invalid realism level. Must be: subtle, moderate, or immersive');
  process.exit(1);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function detectTimezone(profile: any): string {
  const city = profile?.basicIdentity?.city?.toLowerCase() || '';

  const timezoneMap: Record<string, string> = {
    'buenos aires': 'America/Argentina/Buenos_Aires',
    'madrid': 'Europe/Madrid',
    'barcelona': 'Europe/Madrid',
    'mexico': 'America/Mexico_City',
    'cdmx': 'America/Mexico_City',
    'santiago': 'America/Santiago',
    'bogota': 'America/Bogota',
    'lima': 'America/Lima',
    'new york': 'America/New_York',
    'los angeles': 'America/Los_Angeles',
    'london': 'Europe/London',
    'tokyo': 'Asia/Tokyo',
    'paris': 'Europe/Paris',
    'berlin': 'Europe/Berlin',
    'sydney': 'Australia/Sydney',
    'mumbai': 'Asia/Kolkata',
    'dubai': 'Asia/Dubai',
  };

  for (const [cityName, tz] of Object.entries(timezoneMap)) {
    if (city.includes(cityName)) {
      return tz;
    }
  }

  return 'America/Argentina/Buenos_Aires'; // Default
}

async function generateForAgent(agent: any): Promise<void> {
  console.log(`\n📝 Generating routine for: ${agent.name}`);
  console.log(`   ID: ${agent.id}`);
  console.log(`   User: ${agent.User?.email} (${agent.User?.plan})`);

  // Check if already has routine
  const existingRoutine = await prisma.characterRoutine.findUnique({
    where: { agentId: agent.id },
  });

  if (existingRoutine) {
    console.log(`   ⚠️  Agent already has a routine (ID: ${existingRoutine.id})`);
    console.log(`   Skipping...`);
    return;
  }

  // Check premium status
  if (!['plus', 'ultra'].includes(agent.User?.plan || '')) {
    console.log(`   ❌ User is not premium (plan: ${agent.User?.plan})`);
    console.log(`   Skipping...`);
    return;
  }

  // Detect timezone
  const profile = agent.profile as any;
  const detectedTimezone = timezone || detectTimezone(profile);
  const occupation = profile?.occupation?.current || 'Unknown occupation';

  console.log(`   📍 Timezone: ${detectedTimezone}`);
  console.log(`   💼 Occupation: ${occupation}`);
  console.log(`   🎚️  Realism: ${realismLevel}`);

  try {
    const routineId = await generateAndSaveRoutine(
      agent.id,
      agent.userId,
      {
        timezone: detectedTimezone,
        realismLevel,
        customPrompt,
      }
    );

    console.log(`   ✅ Routine created: ${routineId}`);

    // Fetch and display created routine
    const routine = await prisma.characterRoutine.findUnique({
      where: { id: routineId },
      include: {
        RoutineTemplate: true,
      },
    });

    if (routine) {
      console.log(`   📋 Templates created: ${routine.RoutineTemplate.length}`);
      console.log('\n   Templates:');
      for (const template of routine.RoutineTemplate) {
        console.log(`      - ${template.name} (${template.type}): ${template.startTime} - ${template.endTime}`);
      }
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  let agents: any[] = [];

  // Get agents
  if (agentId) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        User: {
          select: {
            id: true,
            plan: true,
            email: true,
          },
        },
        PersonalityCore: true,
      },
    });

    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    agents = [agent];
  } else if (userEmail) {
    const userAgents = await prisma.agent.findMany({
      where: {
        User: {
          email: userEmail,
        },
      },
      include: {
        User: {
          select: {
            id: true,
            plan: true,
            email: true,
          },
        },
        PersonalityCore: true,
      },
    });

    if (userAgents.length === 0) {
      throw new Error(`No agents found for user: ${userEmail}`);
    }

    agents = userAgents;
    console.log(`Found ${agents.length} agents for user ${userEmail}\n`);
  }

  // Generate routines
  let successful = 0;
  let skipped = 0;
  let failed = 0;

  for (const agent of agents) {
    try {
      await generateForAgent(agent);
      successful++;
    } catch (error) {
      if (error instanceof Error && error.message.includes('already has')) {
        skipped++;
      } else {
        failed++;
        console.error(`\n❌ Failed for agent ${agent.name}:`, error);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total agents: ${agents.length}`);
  console.log(`✅ Created: ${successful}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(60));
}

// ============================================
// EXECUTION
// ============================================

main()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
