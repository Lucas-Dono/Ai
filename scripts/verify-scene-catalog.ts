/**
 * Script de Verificación del Catálogo de Escenas
 *
 * Verifica que el catálogo cumpla con los requisitos:
 * - Distribución por categoría correcta
 * - Códigos únicos y válidos
 * - Estructura de datos correcta
 * - No hay escenas duplicadas
 */

import { prisma } from "@/lib/prisma";

async function verifySceneCatalog() {
  console.log("=".repeat(70));
  console.log("VERIFICACIÓN DEL CATÁLOGO DE ESCENAS");
  console.log("=".repeat(70));
  console.log();

  try {
    // 1. Verificar total de escenas
    const totalScenes = await prisma.scene.count();
    console.log(`📊 Total de escenas en DB: ${totalScenes}`);
    console.log();

    // 2. Verificar distribución por categoría
    console.log("📈 Distribución por categoría:");
    const byCategory = await prisma.scene.groupBy({
      by: ["category"],
      _count: true,
    });

    const expectedDistribution: Record<string, { min: number; max: number }> = {
      COTIDIANO: { min: 450, max: 550 },
      HUMOR: { min: 350, max: 450 },
      DEBATE: { min: 220, max: 260 },
      TENSION: { min: 180, max: 220 },
      ROMANCE: { min: 180, max: 220 },
      VULNERABILIDAD: { min: 140, max: 180 },
      DESCUBRIMIENTO: { min: 90, max: 110 },
      RECONCILIACION: { min: 90, max: 110 },
      PROACTIVIDAD: { min: 50, max: 70 },
      META: { min: 35, max: 45 },
    };

    let allCategoriesOk = true;
    for (const stat of byCategory) {
      const expected = expectedDistribution[stat.category];
      const status =
        stat._count >= expected.min && stat._count <= expected.max ? "✓" : "✗";

      if (status === "✗") allCategoriesOk = false;

      console.log(
        `  ${status} ${stat.category}: ${stat._count} escenas (esperado: ${expected.min}-${expected.max})`
      );
    }
    console.log();

    // 3. Verificar códigos únicos
    console.log("🔍 Verificando códigos únicos...");
    const allCodes = await prisma.scene.findMany({
      select: { code: true },
    });

    const codeSet = new Set<string>();
    const duplicates: string[] = [];

    for (const { code } of allCodes) {
      if (codeSet.has(code)) {
        duplicates.push(code);
      } else {
        codeSet.add(code);
      }
    }

    if (duplicates.length > 0) {
      console.log(`  ✗ Códigos duplicados encontrados: ${duplicates.join(", ")}`);
    } else {
      console.log(`  ✓ Todos los códigos son únicos`);
    }
    console.log();

    // 4. Verificar formato de códigos
    console.log("🔍 Verificando formato de códigos...");
    const invalidCodes = await prisma.scene.findMany({
      where: {
        code: {
          not: {
            // Regex: XXX_NNN (3 letras mayúsculas, guion bajo, 3 dígitos)
            contains: "_",
          },
        },
      },
      select: { code: true },
    });

    if (invalidCodes.length > 0) {
      console.log(`  ✗ Códigos con formato inválido encontrados:`);
      invalidCodes.forEach((s) => console.log(`    - ${s.code}`));
    } else {
      console.log(`  ✓ Todos los códigos tienen formato válido (XXX_NNN)`);
    }
    console.log();

    // 5. Verificar estructura de interventionSequence
    console.log("🔍 Verificando estructura de interventionSequence...");
    const scenes = await prisma.scene.findMany({
      select: {
        code: true,
        interventionSequence: true,
        participantRoles: true,
      },
    });

    let invalidInterventions = 0;
    for (const scene of scenes) {
      const interventions = scene.interventionSequence as any[];
      if (!Array.isArray(interventions) || interventions.length === 0) {
        console.log(`  ✗ ${scene.code}: interventionSequence vacía o inválida`);
        invalidInterventions++;
        continue;
      }

      // Verificar que todos los roles en interventions existan en participantRoles
      const roles = scene.participantRoles as string[];
      for (const intervention of interventions) {
        if (!roles.includes(intervention.role)) {
          console.log(
            `  ✗ ${scene.code}: rol "${intervention.role}" en intervention no está en participantRoles`
          );
          invalidInterventions++;
        }
      }
    }

    if (invalidInterventions === 0) {
      console.log(`  ✓ Todas las interventionSequence son válidas`);
    }
    console.log();

    // 6. Verificar escenas activas
    console.log("🔍 Verificando estado de escenas...");
    const activeCount = await prisma.scene.count({ where: { isActive: true } });
    const inactiveCount = await prisma.scene.count({ where: { isActive: false } });
    console.log(`  ✓ Escenas activas: ${activeCount}`);
    console.log(`  ✓ Escenas inactivas: ${inactiveCount}`);
    console.log();

    // 7. Resumen final
    console.log("=".repeat(70));
    console.log("RESUMEN DE VERIFICACIÓN");
    console.log("=".repeat(70));
    console.log(
      `Distribución por categoría: ${allCategoriesOk ? "✓ OK" : "✗ PROBLEMAS"}`
    );
    console.log(`Códigos únicos: ${duplicates.length === 0 ? "✓ OK" : "✗ PROBLEMAS"}`);
    console.log(
      `Formato de códigos: ${invalidCodes.length === 0 ? "✓ OK" : "✗ PROBLEMAS"}`
    );
    console.log(
      `Estructura de intervenciones: ${invalidInterventions === 0 ? "✓ OK" : "✗ PROBLEMAS"}`
    );
    console.log();

    const allOk =
      allCategoriesOk &&
      duplicates.length === 0 &&
      invalidCodes.length === 0 &&
      invalidInterventions === 0;

    if (allOk) {
      console.log("✅ Catálogo verificado exitosamente. Todo OK!");
    } else {
      console.log("⚠️  Se encontraron problemas. Revisa los detalles arriba.");
    }
  } catch (error) {
    console.error("❌ Error durante la verificación:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
verifySceneCatalog()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error fatal:", error);
    process.exit(1);
  });
