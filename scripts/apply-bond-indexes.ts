/**
 * Script para aplicar índices optimizados de bonds
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🔧 Aplicando índices optimizados para Symbolic Bonds...\n");

  const sqlPath = join(
    process.cwd(),
    "prisma/migrations/20250112_optimize_bonds_indexes/migration.sql"
  );

  const sql = readFileSync(sqlPath, "utf-8");

  // Split por statement (cada línea que empieza con CREATE o COMMENT)
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let applied = 0;
  let skipped = 0;

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
      console.log(`✅ ${statement.substring(0, 80)}...`);
      applied++;
    } catch (error: any) {
      if (error.message.includes("already exists")) {
        console.log(`⏭️  ${statement.substring(0, 80)}... (ya existe)`);
        skipped++;
      } else {
        console.error(`❌ Error:`, error.message);
      }
    }
  }

  console.log(`\n📊 Resumen:`);
  console.log(`   Aplicados: ${applied}`);
  console.log(`   Saltados: ${skipped}`);
  console.log(`\n✨ Índices optimizados aplicados exitosamente!`);
}

main()
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
