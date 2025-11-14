/**
 * Script de Testing: Cooldowns y Límites Semanales
 *
 * Ejecutar: npx tsx scripts/test-cooldowns-limits.ts
 */

import { checkCooldown, trackCooldown, resetCooldown } from "@/lib/usage/cooldown-tracker";
import { getWeeklyUsage } from "@/lib/usage/daily-limits";
import { getTierLimits } from "@/lib/usage/tier-limits";

const TEST_USER_ID = "test-user-cooldowns";

async function testCooldowns() {
  console.log("\n🧪 TESTING COOLDOWNS\n");

  // Test 1: Free plan - 5 second cooldown
  console.log("TEST 1: Free plan message cooldown (5s)");
  await resetCooldown(TEST_USER_ID, "message");

  const check1 = await checkCooldown(TEST_USER_ID, "message", "free");
  console.log("  First check:", check1.allowed ? "✅ ALLOWED" : "❌ BLOCKED");

  if (check1.allowed) {
    await trackCooldown(TEST_USER_ID, "message", "free");
    console.log("  Tracked cooldown");

    const check2 = await checkCooldown(TEST_USER_ID, "message", "free");
    console.log("  Immediate second check:", check2.allowed ? "❌ ERROR - Should be blocked" : "✅ BLOCKED");
    console.log("  Wait time:", check2.waitMs, "ms");
    console.log("  Message:", check2.message);

    // Wait and check again
    console.log("  Waiting 5 seconds...");
    await new Promise(resolve => setTimeout(resolve, 5100));

    const check3 = await checkCooldown(TEST_USER_ID, "message", "free");
    console.log("  After 5s:", check3.allowed ? "✅ ALLOWED (cooldown expired)" : "❌ ERROR - Should be allowed");
  }

  // Test 2: Plus plan - 2 second cooldown
  console.log("\nTEST 2: Plus plan message cooldown (2s)");
  await resetCooldown(TEST_USER_ID, "message");

  await trackCooldown(TEST_USER_ID, "message", "plus");
  const check4 = await checkCooldown(TEST_USER_ID, "message", "plus");
  console.log("  Immediate check:", check4.allowed ? "❌ ERROR" : "✅ BLOCKED");
  console.log("  Wait time:", check4.waitMs, "ms (should be ~2000)");

  // Test 3: Ultra plan - 1 second cooldown
  console.log("\nTEST 3: Ultra plan message cooldown (1s)");
  await resetCooldown(TEST_USER_ID, "message");

  await trackCooldown(TEST_USER_ID, "message", "ultra");
  const check5 = await checkCooldown(TEST_USER_ID, "message", "ultra");
  console.log("  Immediate check:", check5.allowed ? "❌ ERROR" : "✅ BLOCKED");
  console.log("  Wait time:", check5.waitMs, "ms (should be ~1000)");

  // Test 4: Voice cooldown - 5 seconds for Ultra
  console.log("\nTEST 4: Ultra plan voice cooldown (5s)");
  await resetCooldown(TEST_USER_ID, "voice");

  await trackCooldown(TEST_USER_ID, "voice", "ultra");
  const check6 = await checkCooldown(TEST_USER_ID, "voice", "ultra");
  console.log("  Immediate check:", check6.allowed ? "❌ ERROR" : "✅ BLOCKED");
  console.log("  Wait time:", check6.waitMs, "ms (should be ~5000)");
}

async function testWeeklyLimits() {
  console.log("\n🧪 TESTING WEEKLY LIMITS\n");

  // Get weekly usage for test user
  console.log("TEST 5: Weekly usage tracking");
  const weeklyMessages = await getWeeklyUsage(TEST_USER_ID, "message");
  console.log("  Weekly messages used:", weeklyMessages);

  // Check tier limits
  console.log("\nTEST 6: Tier weekly limits");
  const freeLimits = getTierLimits("free");
  const plusLimits = getTierLimits("plus");
  const ultraLimits = getTierLimits("ultra");

  console.log("  Free weekly limit:", freeLimits.resources.messagesPerWeek);
  console.log("  Plus weekly limit:", plusLimits.resources.messagesPerWeek);
  console.log("  Ultra weekly limit:", ultraLimits.resources.messagesPerWeek);

  // Validate limits
  if (freeLimits.resources.messagesPerWeek === 50) {
    console.log("  ✅ Free: 50/week");
  } else {
    console.log("  ❌ Free: Expected 50, got", freeLimits.resources.messagesPerWeek);
  }

  if (plusLimits.resources.messagesPerWeek === 500) {
    console.log("  ✅ Plus: 500/week");
  } else {
    console.log("  ❌ Plus: Expected 500, got", plusLimits.resources.messagesPerWeek);
  }

  if (ultraLimits.resources.messagesPerWeek === 700) {
    console.log("  ✅ Ultra: 700/week (YOUR PROPOSAL)");
  } else {
    console.log("  ❌ Ultra: Expected 700, got", ultraLimits.resources.messagesPerWeek);
  }
}

async function testCooldownTiming() {
  console.log("\n🧪 TESTING COOLDOWN TIMING ACCURACY\n");

  console.log("TEST 7: Measure actual cooldown duration");
  await resetCooldown(TEST_USER_ID, "message");

  const start = Date.now();
  await trackCooldown(TEST_USER_ID, "message", "ultra");

  // Check immediately
  const check1 = await checkCooldown(TEST_USER_ID, "message", "ultra");
  const elapsed1 = Date.now() - start;
  console.log(`  After ${elapsed1}ms:`, check1.allowed ? "❌ ERROR" : "✅ BLOCKED", `(wait: ${check1.waitMs}ms)`);

  // Wait 500ms
  await new Promise(resolve => setTimeout(resolve, 500));
  const check2 = await checkCooldown(TEST_USER_ID, "message", "ultra");
  const elapsed2 = Date.now() - start;
  console.log(`  After ${elapsed2}ms:`, check2.allowed ? "❌ ERROR" : "✅ BLOCKED", `(wait: ${check2.waitMs}ms)`);

  // Wait until cooldown expires (1000ms total)
  await new Promise(resolve => setTimeout(resolve, 600));
  const check3 = await checkCooldown(TEST_USER_ID, "message", "ultra");
  const elapsed3 = Date.now() - start;
  console.log(`  After ${elapsed3}ms:`, check3.allowed ? "✅ ALLOWED" : "❌ ERROR - should be allowed");
}

async function runAllTests() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  COOLDOWNS & WEEKLY LIMITS - TEST SUITE");
  console.log("═══════════════════════════════════════════════════════");

  try {
    await testCooldowns();
    await testWeeklyLimits();
    await testCooldownTiming();

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("  ✅ ALL TESTS COMPLETED");
    console.log("═══════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(console.error);
