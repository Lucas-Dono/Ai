/**
 * Script de Testing: Cooldowns y Límites Semanales
 *
 * Ejecutar: npx tsx scripts/test-cooldowns-limits.ts
 *
 * DEPRECATED: Este script está desactualizado y no es compatible con la API actual.
 * El sistema ahora usa límites basados en tokens (totalTokensPerWeek, inputTokensPerWeek, etc.)
 * en lugar de messagesPerWeek.
 *
 * Si necesitas tests similares, crea un nuevo script usando:
 * - getWeeklyUsage(userId, "tokens") en lugar de getWeeklyUsage(userId, "message")
 * - resources.totalTokensPerWeek en lugar de resources.messagesPerWeek
 */

// import { checkCooldown, trackCooldown, resetCooldown } from "@/lib/usage/cooldown-tracker";
// import { getWeeklyUsage } from "@/lib/usage/daily-limits";
// import { getTierLimits } from "@/lib/usage/tier-limits";
//
// const TEST_USER_ID = "test-user-cooldowns";
//
// async function testCooldowns() {
//   console.log("\n🧪 TESTING COOLDOWNS\n");
//   // ... resto del código comentado
// }
//
// async function testWeeklyLimits() {
//   console.log("\n🧪 TESTING WEEKLY LIMITS\n");
//
//   // Get weekly usage for test user
//   console.log("TEST 5: Weekly usage tracking");
//   const weeklyMessages = await getWeeklyUsage(TEST_USER_ID, "tokens"); // Actualizado
//   console.log("  Weekly tokens used:", weeklyMessages);
//
//   // Check tier limits
//   console.log("\nTEST 6: Tier weekly limits");
//   const freeLimits = getTierLimits("free");
//   const plusLimits = getTierLimits("plus");
//   const ultraLimits = getTierLimits("ultra");
//
//   console.log("  Free weekly limit:", freeLimits.resources.totalTokensPerWeek);
//   console.log("  Plus weekly limit:", plusLimits.resources.totalTokensPerWeek);
//   console.log("  Ultra weekly limit:", ultraLimits.resources.totalTokensPerWeek);
// }
//
// async function testCooldownTiming() {
//   // ... resto del código comentado
// }
//
// async function runAllTests() {
//   // ... resto del código comentado
// }
//
// // Run tests
// runAllTests().catch(console.error);

console.log('⚠️  Este script está desactualizado.');
console.log('El sistema ahora usa límites basados en tokens en lugar de mensajes.');
console.log('Para testear cooldowns y límites, actualiza el script para usar:');
console.log('  - getWeeklyUsage(userId, "tokens")');
console.log('  - resources.totalTokensPerWeek');
process.exit(0);
