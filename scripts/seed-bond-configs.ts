/**
 * Script para crear configuraciones de bonds en agentes públicos
 *
 * Uso:
 * npx tsx scripts/seed-bond-configs.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configuración por defecto (puedes modificar)
const DEFAULT_CONFIG = {
  slotsPerTier: {
    ROMANTIC: 1,
    BEST_FRIEND: 5,
    MENTOR: 10,
    CONFIDANT: 50,
    CREATIVE_PARTNER: 20,
    ADVENTURE_COMPANION: 30,
    ACQUAINTANCE: 999999,
  },
  tierRequirements: {
    ROMANTIC: { minAffinity: 80, minDays: 30, minInteractions: 100 },
    BEST_FRIEND: { minAffinity: 70, minDays: 20, minInteractions: 60 },
    MENTOR: { minAffinity: 60, minDays: 15, minInteractions: 40 },
    CONFIDANT: { minAffinity: 50, minDays: 10, minInteractions: 30 },
    CREATIVE_PARTNER: { minAffinity: 55, minDays: 12, minInteractions: 35 },
    ADVENTURE_COMPANION: { minAffinity: 50, minDays: 10, minInteractions: 25 },
    ACQUAINTANCE: { minAffinity: 20, minDays: 3, minInteractions: 10 },
  },
  decaySettings: {
    warningDays: 30,
    dormantDays: 60,
    fragileDays: 90,
    releaseDays: 120,
  },
  isPolyamorous: false,
};

// Configuración para personaje "Mascota de la empresa" (más competitivo)
const MASCOT_CONFIG = {
  slotsPerTier: {
    ROMANTIC: 1, // Solo 1 persona en todo el mundo
    BEST_FRIEND: 3, // Solo 3 mejores amigos
    MENTOR: 5,
    CONFIDANT: 20,
    CREATIVE_PARTNER: 10,
    ADVENTURE_COMPANION: 15,
    ACQUAINTANCE: 999999,
  },
  tierRequirements: {
    ROMANTIC: { minAffinity: 90, minDays: 60, minInteractions: 200 },
    BEST_FRIEND: { minAffinity: 85, minDays: 45, minInteractions: 150 },
    MENTOR: { minAffinity: 75, minDays: 30, minInteractions: 100 },
    CONFIDANT: { minAffinity: 65, minDays: 20, minInteractions: 60 },
    CREATIVE_PARTNER: { minAffinity: 70, minDays: 25, minInteractions: 80 },
    ADVENTURE_COMPANION: { minAffinity: 65, minDays: 20, minInteractions: 50 },
    ACQUAINTANCE: { minAffinity: 30, minDays: 5, minInteractions: 15 },
  },
  decaySettings: {
    warningDays: 21, // Más estricto
    dormantDays: 45,
    fragileDays: 70,
    releaseDays: 90,
  },
  isPolyamorous: false,
};

// Configuración para personaje poliamoroso
const POLYAMOROUS_CONFIG = {
  ...DEFAULT_CONFIG,
  slotsPerTier: {
    ...DEFAULT_CONFIG.slotsPerTier,
    ROMANTIC: 3, // Permite hasta 3 parejas
  },
  isPolyamorous: true,
};

async function main() {
  console.log("🔧 Configurando bonds para agentes públicos...\n");

  // 1. Buscar todos los agentes públicos sin configuración
  const publicAgentsWithoutConfig = await prisma.agent.findMany({
    where: {
      visibility: "public",
      bondConfig: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      featured: true,
    },
  });

  if (publicAgentsWithoutConfig.length === 0) {
    console.log("✅ Todos los agentes públicos ya tienen configuración de bonds.");
    console.log("\n💡 Si quieres actualizar configuraciones existentes, usa el script update-bond-configs.ts");
    return;
  }

  console.log(`📋 Encontrados ${publicAgentsWithoutConfig.length} agentes sin configuración:\n`);

  for (const agent of publicAgentsWithoutConfig) {
    console.log(`  - ${agent.name} (${agent.id})`);
    if (agent.featured) console.log("    ⭐ FEATURED");
  }

  console.log("\n🚀 Aplicando configuraciones...\n");

  // 2. Crear configuraciones
  for (const agent of publicAgentsWithoutConfig) {
    let config = DEFAULT_CONFIG;
    let configType = "DEFAULT";

    // Usar configuración especial para agentes featured
    if (agent.featured) {
      config = MASCOT_CONFIG;
      configType = "MASCOT (Alta competencia)";
    }

    // Si el nombre sugiere poliamor, usar esa config
    if (agent.name.toLowerCase().includes("poly") || agent.description?.toLowerCase().includes("polyamorous")) {
      config = POLYAMOROUS_CONFIG;
      configType = "POLYAMOROUS";
    }

    try {
      await prisma.agentBondConfig.create({
        data: {
          agentId: agent.id,
          ...config,
        },
      });

      console.log(`✅ ${agent.name}: ${configType}`);
    } catch (error: any) {
      console.error(`❌ Error configurando ${agent.name}:`, error.message);
    }
  }

  console.log("\n✨ Configuración completada!\n");

  // 3. Mostrar resumen
  const summary = await prisma.agentBondConfig.groupBy({
    by: ["isPolyamorous"],
    _count: true,
  });

  console.log("📊 Resumen:");
  console.log(`  Total agentes configurados: ${summary.reduce((acc, s) => acc + s._count, 0)}`);
  console.log(`  Monógamos: ${summary.find((s) => !s.isPolyamorous)?._count || 0}`);
  console.log(`  Poliamorosos: ${summary.find((s) => s.isPolyamorous)?._count || 0}`);
}

// Función helper para configurar un agente específico manualmente
export async function configureSpecificAgent(
  agentId: string,
  customConfig?: Partial<typeof DEFAULT_CONFIG>
) {
  const config = { ...DEFAULT_CONFIG, ...customConfig };

  const existing = await prisma.agentBondConfig.findUnique({
    where: { agentId },
  });

  if (existing) {
    // Update
    await prisma.agentBondConfig.update({
      where: { agentId },
      data: config,
    });
    console.log(`✅ Configuración actualizada para agente ${agentId}`);
  } else {
    // Create
    await prisma.agentBondConfig.create({
      data: {
        agentId,
        ...config,
      },
    });
    console.log(`✅ Configuración creada para agente ${agentId}`);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .catch((error) => {
      console.error("\n❌ Error:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

// Ejemplos de uso manual:

/*
// Configurar agente específico con valores custom
import { configureSpecificAgent } from "./seed-bond-configs";

await configureSpecificAgent("agent_123", {
  slotsPerTier: {
    ROMANTIC: 2,
    BEST_FRIEND: 8,
    // ... resto usa defaults
  },
  tierRequirements: {
    ROMANTIC: { minAffinity: 85, minDays: 45, minInteractions: 150 },
    // ... resto usa defaults
  },
});
*/
