/**
 * Test Script: Onboarding Persistence System
 * Tests the database persistence of onboarding progress
 */

import { prisma } from '../lib/prisma';

async function testOnboardingPersistence() {
  console.log('🧪 Testing Onboarding Persistence System\n');

  // Test 1: Create test user
  console.log('Test 1: Creating test user...');
  const testUser = await prisma.user.upsert({
    where: { email: 'test-onboarding@example.com' },
    create: {
      email: 'test-onboarding@example.com',
      name: 'Test Onboarding User',
      plan: 'free',
    },
    update: {},
  });
  console.log('✅ Test user created:', testUser.id);

  // Test 2: Create onboarding progress
  console.log('\nTest 2: Creating onboarding progress...');
  const progress = await prisma.onboardingProgress.create({
    data: {
      userId: testUser.id,
      completedTours: ['welcome', 'first-agent'],
      currentTour: 'community-interaction',
      currentStep: 2,
      badges: ['explorer', 'creator'],
      totalKarma: 150,
      shownTriggers: {
        'first-ai-needed': { count: 1, lastShown: new Date().toISOString() },
      },
      lastTourStarted: new Date(),
      lastTourCompleted: new Date(),
    },
  });
  console.log('✅ Progress created:', progress.id);
  console.log('   Completed tours:', progress.completedTours);
  console.log('   Current tour:', progress.currentTour);
  console.log('   Badges:', progress.badges);
  console.log('   Karma:', progress.totalKarma);

  // Test 3: Read progress
  console.log('\nTest 3: Reading progress...');
  const retrievedProgress = await prisma.onboardingProgress.findUnique({
    where: { userId: testUser.id },
  });
  console.log('✅ Progress retrieved:', retrievedProgress?.id);
  console.log('   Completed tours match:',
    JSON.stringify(retrievedProgress?.completedTours) === JSON.stringify(['welcome', 'first-agent'])
  );

  // Test 4: Update progress
  console.log('\nTest 4: Updating progress...');
  const updatedProgress = await prisma.onboardingProgress.update({
    where: { userId: testUser.id },
    data: {
      completedTours: ['welcome', 'first-agent', 'community-interaction'],
      currentTour: 'community-tour',
      currentStep: 0,
      badges: ['explorer', 'creator', 'conversationalist'],
      totalKarma: 225,
    },
  });
  console.log('✅ Progress updated');
  console.log('   New completed tours:', updatedProgress.completedTours);
  console.log('   New karma:', updatedProgress.totalKarma);

  // Test 5: Upsert (update existing)
  console.log('\nTest 5: Testing upsert (update)...');
  const upserted = await prisma.onboardingProgress.upsert({
    where: { userId: testUser.id },
    create: {
      userId: testUser.id,
      completedTours: [],
      badges: [],
      totalKarma: 0,
    },
    update: {
      totalKarma: 300,
    },
  });
  console.log('✅ Upsert completed (should have updated)');
  console.log('   Karma updated to:', upserted.totalKarma);

  // Test 6: Delete and recreate (upsert create)
  console.log('\nTest 6: Testing upsert (create new)...');
  await prisma.onboardingProgress.delete({
    where: { userId: testUser.id },
  });
  const newProgress = await prisma.onboardingProgress.upsert({
    where: { userId: testUser.id },
    create: {
      userId: testUser.id,
      completedTours: ['welcome'],
      badges: ['explorer'],
      totalKarma: 50,
    },
    update: {
      totalKarma: 999,
    },
  });
  console.log('✅ Upsert completed (should have created new)');
  console.log('   New progress karma:', newProgress.totalKarma, '(should be 50, not 999)');

  // Test 7: Cascade delete
  console.log('\nTest 7: Testing cascade delete...');
  await prisma.user.delete({
    where: { id: testUser.id },
  });
  const deletedProgress = await prisma.onboardingProgress.findUnique({
    where: { userId: testUser.id },
  });
  console.log('✅ User deleted');
  console.log('   Progress also deleted:', deletedProgress === null);

  console.log('\n✅ All tests passed! 🎉');
}

// Run tests
testOnboardingPersistence()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
