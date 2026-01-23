import { prisma } from "@/lib/prisma";

async function main() {
  const agents = await prisma.agent.findMany({
    where: {
      id: {
        startsWith: 'premium_'
      }
    },
    include: {
      PersonalityCore: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  for (const agent of agents) {
    const profile = agent.profile as any;

    console.log('='.repeat(80));
    console.log(`${agent.name}`);
    console.log('='.repeat(80));
    console.log(`ID: ${agent.id}`);
    console.log();

    // Basic Identity
    if (profile?.basicIdentity) {
      console.log('📋 BASIC IDENTITY:');
      console.log(`   Full Name: ${profile.basicIdentity.fullName || agent.name}`);
      console.log(`   Age: ${profile.basicIdentity.age || 'N/A'}`);
      console.log(`   City: ${profile.basicIdentity.city || 'N/A'}`);
      console.log(`   Living: ${profile.basicIdentity.livingSituation || 'N/A'}`);
      console.log();
    }

    // Occupation
    if (profile?.occupation) {
      console.log('💼 OCCUPATION:');
      console.log(`   Current: ${profile.occupation.current || 'N/A'}`);
      console.log(`   Workplace: ${profile.occupation.workplace || 'N/A'}`);
      console.log(`   Schedule: ${profile.occupation.schedule || 'N/A'}`);
      console.log(`   Income: ${profile.occupation.incomeLevel || 'N/A'}`);
      console.log();
    }

    // Daily Routine
    if (profile?.dailyRoutine) {
      console.log('⏰ DAILY ROUTINE (FROM PROFILE):');
      console.log(`   Chronotype: ${profile.dailyRoutine.chronotype || 'N/A'}`);
      console.log(`   Wake Up: ${profile.dailyRoutine.wakeUpTime || 'N/A'}`);
      console.log(`   Bed Time: ${profile.dailyRoutine.bedTime || 'N/A'}`);
      console.log(`   Sleep Hours: ${profile.dailyRoutine.averageSleepHours || 'N/A'}`);
      console.log(`   Most Productive: ${profile.dailyRoutine.mostProductiveTime || 'N/A'}`);
      console.log();

      if (profile.dailyRoutine.morningRoutine) {
        console.log(`   Morning: ${profile.dailyRoutine.morningRoutine}`);
        console.log();
      }
      if (profile.dailyRoutine.afternoonRoutine) {
        console.log(`   Afternoon: ${profile.dailyRoutine.afternoonRoutine}`);
        console.log();
      }
      if (profile.dailyRoutine.eveningRoutine) {
        console.log(`   Evening: ${profile.dailyRoutine.eveningRoutine}`);
        console.log();
      }
    }

    // Personality
    if (agent.PersonalityCore) {
      console.log('🧠 PERSONALITY (BIG FIVE):');
      console.log(`   Openness: ${agent.PersonalityCore.openness}/100`);
      console.log(`   Conscientiousness: ${agent.PersonalityCore.conscientiousness}/100 ${getConscientiousnessNote(agent.PersonalityCore.conscientiousness)}`);
      console.log(`   Extraversion: ${agent.PersonalityCore.extraversion}/100`);
      console.log(`   Agreeableness: ${agent.PersonalityCore.agreeableness}/100`);
      console.log(`   Neuroticism: ${agent.PersonalityCore.neuroticism}/100`);
      console.log();
    }

    // Interests
    if (profile?.interests) {
      console.log('🎯 INTERESTS:');
      if (profile.interests.hobbies) {
        const hobbies = profile.interests.hobbies.map((h: any) =>
          typeof h === 'string' ? h : h.hobby
        );
        console.log(`   Hobbies: ${hobbies.join(', ')}`);
      }
      if (profile.interests.sports?.practices) {
        console.log(`   Sports: ${profile.interests.sports.practices.join(', ')}`);
      }
      if (profile.interests.music?.artists) {
        console.log(`   Music: ${profile.interests.music.artists.slice(0, 3).join(', ')}`);
      }
      console.log();
    }

    console.log('\n');
  }
}

function getConscientiousnessNote(value: number): string {
  if (value >= 80) return '→ Very punctual, organized';
  if (value >= 60) return '→ Generally punctual';
  if (value >= 40) return '→ Moderate flexibility';
  if (value >= 20) return '→ Very flexible, spontaneous';
  return '→ Extremely spontaneous';
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
