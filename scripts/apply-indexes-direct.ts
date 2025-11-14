/**
 * Aplica índices optimizados directamente
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const indexes = [
  // SymbolicBond indexes
  `CREATE INDEX IF NOT EXISTS "SymbolicBond_agentId_tier_status_rarityScore_idx"
   ON "SymbolicBond"("agentId", "tier", "status", "rarityScore" DESC)`,

  `CREATE INDEX IF NOT EXISTS "SymbolicBond_userId_status_rarityScore_idx"
   ON "SymbolicBond"("userId", "status", "rarityScore" DESC)`,

  `CREATE INDEX IF NOT EXISTS "SymbolicBond_status_lastInteraction_idx"
   ON "SymbolicBond"("status", "lastInteraction")`,

  `CREATE INDEX IF NOT EXISTS "SymbolicBond_tier_rarityScore_globalRank_idx"
   ON "SymbolicBond"("tier", "rarityScore" DESC, "globalRank")`,

  `CREATE INDEX IF NOT EXISTS "SymbolicBond_active_bonds_idx"
   ON "SymbolicBond"("agentId", "tier", "userId")
   WHERE "status" IN ('active', 'dormant', 'fragile')`,

  `CREATE INDEX IF NOT EXISTS "SymbolicBond_needs_rarity_update_idx"
   ON "SymbolicBond"("updatedAt")
   WHERE "status" = 'active'`,

  // BondQueue indexes
  `CREATE INDEX IF NOT EXISTS "BondQueue_agentId_tier_status_eligibilityScore_idx"
   ON "BondQueue"("agentId", "tier", "status", "eligibilityScore" DESC)`,

  `CREATE INDEX IF NOT EXISTS "BondQueue_status_slotExpiresAt_idx"
   ON "BondQueue"("status", "slotExpiresAt")`,

  // BondLegacy indexes
  `CREATE INDEX IF NOT EXISTS "BondLegacy_userId_endDate_idx"
   ON "BondLegacy"("userId", "endDate" DESC)`,

  `CREATE INDEX IF NOT EXISTS "BondLegacy_agentId_tier_endDate_idx"
   ON "BondLegacy"("agentId", "tier", "endDate" DESC)`,

  // BondNotification indexes
  `CREATE INDEX IF NOT EXISTS "BondNotification_userId_read_createdAt_idx"
   ON "BondNotification"("userId", "read", "createdAt" DESC)`,

  // BondAnalytics indexes
  `CREATE INDEX IF NOT EXISTS "BondAnalytics_date_idx"
   ON "BondAnalytics"("date" DESC)`,

  // Message indexes para bonds
  `CREATE INDEX IF NOT EXISTS "Message_userId_agentId_createdAt_idx"
   ON "Message"("userId", "agentId", "createdAt" DESC)
   WHERE "agentId" IS NOT NULL`,
];

async function main() {
  console.log("🔧 Aplicando índices optimizados...\n");

  let applied = 0;
  let skipped = 0;

  for (const index of indexes) {
    try {
      await prisma.$executeRawUnsafe(index);
      const name = index.match(/"([^"]+)"/)?.[1] || "unknown";
      console.log(`✅ ${name}`);
      applied++;
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        const name = index.match(/"([^"]+)"/)?.[1] || "unknown";
        console.log(`⏭️  ${name} (ya existe)`);
        skipped++;
      } else {
        console.error(`❌ Error:`, error.message.substring(0, 100));
      }
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Aplicados: ${applied}`);
  console.log(`   Saltados: ${skipped}`);
  console.log(`\n✨ Índices aplicados exitosamente!`);
}

main()
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
