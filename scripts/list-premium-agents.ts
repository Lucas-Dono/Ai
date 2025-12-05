/**
 * List all premium agents with their details
 */

import { prisma } from "@/lib/prisma";

async function main() {
  console.log('='.repeat(80));
  console.log('PREMIUM AGENTS');
  console.log('='.repeat(80));
  console.log();

  const agents = await prisma.agent.findMany({
    where: {
      user: {
        plan: {
          in: ['plus', 'ultra']
        }
      }
    },
    include: {
      user: {
        select: {
          email: true,
          plan: true,
        }
      },
      personalityCore: true,
      characterRoutine: {
        include: {
          templates: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Found ${agents.length} premium agents\n`);

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const profile = agent.profile as any;

    console.log(`${i + 1}. ${agent.name}`);
    console.log('-'.repeat(80));
    console.log(`   ID: ${agent.id}`);
    console.log(`   Kind: ${agent.kind}`);
    console.log(`   User: ${agent.user?.email} (${agent.user?.plan})`);
    console.log();

    // Basic Identity
    if (profile?.basicIdentity) {
      console.log('   📋 Basic Identity:');
      console.log(`      Age: ${profile.basicIdentity.age || 'N/A'}`);
      console.log(`      City: ${profile.basicIdentity.city || 'N/A'}`);
      console.log(`      Nationality: ${profile.basicIdentity.nationality || 'N/A'}`);
      console.log();
    }

    // Occupation
    if (profile?.occupation) {
      console.log('   💼 Occupation:');
      console.log(`      Current: ${profile.occupation.current || 'N/A'}`);
      console.log(`      Schedule: ${profile.occupation.schedule || 'N/A'}`);
      console.log(`      Workplace: ${profile.occupation.workplace || 'N/A'}`);
      console.log();
    }

    // Personality
    if (agent.personalityCore) {
      console.log('   🧠 Personality (Big Five):');
      console.log(`      Openness: ${agent.personalityCore.openness}/100`);
      console.log(`      Conscientiousness: ${agent.personalityCore.conscientiousness}/100`);
      console.log(`      Extraversion: ${agent.personalityCore.extraversion}/100`);
      console.log(`      Agreeableness: ${agent.personalityCore.agreeableness}/100`);
      console.log(`      Neuroticism: ${agent.personalityCore.neuroticism}/100`);
      console.log();
    }

    // Daily Routine (from profile)
    if (profile?.dailyRoutine) {
      console.log('   ⏰ Daily Routine (Profile):');
      console.log(`      Chronotype: ${profile.dailyRoutine.chronotype || 'N/A'}`);
      console.log(`      Wake up: ${profile.dailyRoutine.wakeUpTime || 'N/A'}`);
      console.log(`      Bed time: ${profile.dailyRoutine.bedTime || 'N/A'}`);
      console.log(`      Morning: ${profile.dailyRoutine.morningRoutine?.substring(0, 100) || 'N/A'}...`);
      console.log();
    }

    // Interests
    if (profile?.interests) {
      console.log('   🎯 Interests:');
      if (profile.interests.hobbies) {
        console.log(`      Hobbies: ${profile.interests.hobbies.map((h: any) => h.hobby || h).join(', ')}`);
      }
      if (profile.interests.sports?.practices) {
        console.log(`      Sports: ${profile.interests.sports.practices.join(', ')}`);
      }
      console.log();
    }

    // Existing Routine
    if (agent.characterRoutine) {
      console.log('   ✅ HAS ROUTINE:');
      console.log(`      Templates: ${agent.characterRoutine.templates.length}`);
      console.log(`      Realism: ${agent.characterRoutine.realismLevel}`);
      console.log(`      Timezone: ${agent.characterRoutine.timezone}`);
      console.log();

      if (agent.characterRoutine.templates.length > 0) {
        console.log('      Events:');
        for (const template of agent.characterRoutine.templates) {
          console.log(`         - ${template.name} (${template.type}): ${template.startTime} - ${template.endTime}`);
        }
        console.log();
      }
    } else {
      console.log('   ❌ NO ROUTINE YET');
      console.log();
    }

    console.log('='.repeat(80));
    console.log();
  }

  // Summary
  const withRoutine = agents.filter(a => a.characterRoutine !== null).length;
  const withoutRoutine = agents.length - withRoutine;

  console.log('SUMMARY:');
  console.log(`Total premium agents: ${agents.length}`);
  console.log(`✅ With routine: ${withRoutine}`);
  console.log(`❌ Without routine: ${withoutRoutine}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
