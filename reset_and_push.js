// reset_and_push.js - Reset database and apply new schema
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

async function resetAndPush() {
  try {
    console.log('🔄 Resetting database and applying new emotional system schema...\n');

    // Ejecutar prisma db push con reset
    console.log('📦 Running prisma db push...');
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset --skip-generate', {
      cwd: process.cwd()
    });

    console.log(stdout);
    if (stderr && !stderr.includes('warn')) {
      console.error(stderr);
    }

    console.log('\n✅ Database reset complete!');
    console.log('📝 New tables created:');
    console.log('   - PersonalityCore (Big Five + Values)');
    console.log('   - InternalState (Emotions + Mood + Needs)');
    console.log('   - EpisodicMemory (Event memories with embeddings)');
    console.log('   - SemanticMemory (Facts about user)');
    console.log('   - ProceduralMemory (Behavioral patterns)');
    console.log('   - CharacterGrowth (Relationship dynamics)');

    console.log('\n🔄 Generating Prisma Client...');
    const { stdout: genStdout } = await execAsync('npx prisma generate');
    console.log(genStdout);

    console.log('\n✅ All done! Ready to implement emotional system.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndPush();
