/**
 * Manual Test Script for Age Verification System
 *
 * Este script permite testear manualmente el sistema de verificación de edad
 * directamente desde la consola sin necesidad de UI.
 *
 * IMPORTANTE: Solo para testing en desarrollo
 */

import { prisma } from "../lib/prisma";

interface TestCase {
  name: string;
  birthDate: Date;
  expectedAge: number;
  expectedIsAdult: boolean;
  expectedBlocked: boolean;
  description: string;
}

const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Calculate test cases dynamically based on current date
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDay = today.getDate();

const testCases: TestCase[] = [
  {
    name: "Case 1: Minor under 13 (BLOCKED)",
    birthDate: new Date(currentYear - 10, currentMonth, currentDay), // 10 years old
    expectedAge: 10,
    expectedIsAdult: false,
    expectedBlocked: true,
    description: "Should be blocked - COPPA compliance",
  },
  {
    name: "Case 2: Minor 13-17 (ALLOWED, RESTRICTED)",
    birthDate: new Date(currentYear - 16, currentMonth, currentDay), // 16 years old
    expectedAge: 16,
    expectedIsAdult: false,
    expectedBlocked: false,
    description: "Should be allowed without NSFW access",
  },
  {
    name: "Case 3: Adult 18+ (ALLOWED, FULL ACCESS)",
    birthDate: new Date(currentYear - 25, currentMonth, currentDay), // 25 years old
    expectedAge: 25,
    expectedIsAdult: true,
    expectedBlocked: false,
    description: "Should be allowed with full access",
  },
  {
    name: "Case 4: Exactly 13 years old (ALLOWED)",
    birthDate: new Date(currentYear - 13, currentMonth, currentDay), // Exactly 13
    expectedAge: 13,
    expectedIsAdult: false,
    expectedBlocked: false,
    description: "Edge case: exactly 13 years old",
  },
  {
    name: "Case 5: Exactly 18 years old (ADULT)",
    birthDate: new Date(currentYear - 18, currentMonth, currentDay), // Exactly 18
    expectedAge: 18,
    expectedIsAdult: true,
    expectedBlocked: false,
    description: "Edge case: exactly 18 years old",
  },
  {
    name: "Case 6: Just turned 13 (1 day ago)",
    birthDate: new Date(currentYear - 13, currentMonth, currentDay - 1), // 13 + 1 day
    expectedAge: 13,
    expectedIsAdult: false,
    expectedBlocked: false,
    description: "Edge case: just turned 13 yesterday",
  },
  {
    name: "Case 7: Almost 13 (tomorrow)",
    birthDate: new Date(currentYear - 13, currentMonth, currentDay + 1), // 12 + 364 days
    expectedAge: 12,
    expectedIsAdult: false,
    expectedBlocked: true,
    description: "Edge case: turns 13 tomorrow - should still be blocked",
  },
];

async function runTests() {
  console.log("\n🧪 AGE VERIFICATION SYSTEM - TEST SUITE\n");
  console.log("=" .repeat(60));

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`   Description: ${testCase.description}`);
    console.log(`   Birth Date: ${testCase.birthDate.toLocaleDateString()}`);

    const actualAge = calculateAge(testCase.birthDate);
    const actualIsAdult = actualAge >= 18;
    const actualBlocked = actualAge < 13;

    console.log(`\n   Expected:`);
    console.log(`     - Age: ${testCase.expectedAge}`);
    console.log(`     - Is Adult: ${testCase.expectedIsAdult}`);
    console.log(`     - Blocked: ${testCase.expectedBlocked}`);

    console.log(`\n   Actual:`);
    console.log(`     - Age: ${actualAge}`);
    console.log(`     - Is Adult: ${actualIsAdult}`);
    console.log(`     - Blocked: ${actualBlocked}`);

    const ageMatch = actualAge === testCase.expectedAge;
    const adultMatch = actualIsAdult === testCase.expectedIsAdult;
    const blockMatch = actualBlocked === testCase.expectedBlocked;

    const testPassed = ageMatch && adultMatch && blockMatch;

    if (testPassed) {
      console.log(`\n   ✅ PASSED`);
      passed++;
    } else {
      console.log(`\n   ❌ FAILED`);
      if (!ageMatch) console.log(`      - Age mismatch`);
      if (!adultMatch) console.log(`      - Adult status mismatch`);
      if (!blockMatch) console.log(`      - Block status mismatch`);
      failed++;
    }

    console.log(`\n${"-".repeat(60)}`);
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`\n📊 TEST RESULTS:`);
  console.log(`   Total: ${testCases.length}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log(`\n🎉 All tests passed!`);
  } else {
    console.log(`\n⚠️  Some tests failed. Review the logic.`);
  }

  console.log(`\n${"=".repeat(60)}\n`);
}

async function testDatabaseIntegration(userEmail: string) {
  console.log("\n🗄️  DATABASE INTEGRATION TEST\n");
  console.log("=" .repeat(60));

  try {
    // Find test user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        birthDate: true,
        ageVerified: true,
        isAdult: true,
        ageVerifiedAt: true,
      },
    });

    if (!user) {
      console.log(`\n❌ User not found: ${userEmail}`);
      console.log(`\nCreate a test user first or use an existing email.`);
      return;
    }

    console.log(`\n✅ User found:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Birth Date: ${user.birthDate?.toLocaleDateString() || "Not set"}`);
    console.log(`   Age Verified: ${user.ageVerified}`);
    console.log(`   Is Adult: ${user.isAdult}`);
    console.log(`   Verified At: ${user.ageVerifiedAt?.toLocaleString() || "Not verified"}`);

    if (user.birthDate) {
      const age = calculateAge(user.birthDate);
      console.log(`\n   Calculated Age: ${age} years`);

      // Verify consistency
      const expectedIsAdult = age >= 18;
      const expectedBlocked = age < 13;

      if (user.isAdult !== expectedIsAdult) {
        console.log(`\n   ⚠️  WARNING: isAdult flag (${user.isAdult}) doesn't match calculated age (${age})`);
      }

      if (expectedBlocked) {
        console.log(`\n   ⚠️  WARNING: This user should be blocked (age < 13)`);
      }
    }
  } catch (error) {
    console.error(`\n❌ Database error:`, error);
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n${"=".repeat(60)}\n`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // Run algorithm tests
    await runTests();
  } else if (args[0] === "--db" && args[1]) {
    // Test database integration with specific user
    await testDatabaseIntegration(args[1]);
  } else {
    console.log(`
Usage:
  # Run algorithm tests
  npx tsx scripts/test-age-verification.ts

  # Test database integration
  npx tsx scripts/test-age-verification.ts --db user@example.com
    `);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
