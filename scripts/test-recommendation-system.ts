/**
 * Test completo del Sistema de Recomendaciones IA
 *
 * Verifica:
 * 1. Tracking de interacciones
 * 2. Actualización de perfil de usuario
 * 3. Generación de candidatos
 * 4. Ranking con LLM
 * 5. Cache de recomendaciones
 */

import { prisma } from "@/lib/prisma";
import { trackInteraction, getUserProfile, getUserInteractionHistory } from "@/lib/recommendations/tracker";
import { generateRecommendations } from "@/lib/recommendations/engine";

async function testRecommendationSystem() {
  console.log("🧪 Iniciando test del Sistema de Recomendaciones\n");

  // 1. Obtener un usuario de prueba
  const testUser = await prisma.user.findFirst();

  if (!testUser) {
    console.error("❌ No se encontró ningún usuario en la base de datos");
    return;
  }

  console.log(`✅ Usuario de prueba: ${testUser.email} (ID: ${testUser.id})\n`);

  // 2. Obtener agentes públicos para trackear
  const agents = await prisma.agent.findMany({
    where: {
      visibility: "public",
      userId: null,
    },
    take: 3,
  });

  if (agents.length === 0) {
    console.error("❌ No se encontraron agentes públicos");
    return;
  }

  console.log(`✅ Agentes encontrados: ${agents.length}`);
  agents.forEach((a, i) => console.log(`   ${i + 1}. ${a.name} (${a.id})`));
  console.log("");

  // 3. Trackear interacciones simuladas
  console.log("📊 Trackeando interacciones simuladas...\n");

  for (const agent of agents) {
    await trackInteraction({
      userId: testUser.id,
      itemType: "agent",
      itemId: agent.id,
      interactionType: "view",
    });
    console.log(`   ✓ View trackeado: ${agent.name}`);

    // Simular chat con diferentes métricas
    await trackInteraction({
      userId: testUser.id,
      itemType: "agent",
      itemId: agent.id,
      interactionType: "chat",
      duration: Math.floor(Math.random() * 600) + 60, // 1-10 min
      messageCount: Math.floor(Math.random() * 20) + 5, // 5-25 mensajes
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 estrellas
    });
    console.log(`   ✓ Chat trackeado: ${agent.name}`);
  }

  console.log("");

  // 4. Verificar perfil de usuario actualizado
  console.log("👤 Verificando perfil de usuario...\n");
  const profile = await getUserProfile(testUser.id);

  console.log("   Perfil actualizado:");
  console.log(`   - Interacciones totales: ${profile.interactionCount}`);
  console.log(`   - Tiempo total: ${Math.floor(profile.totalTimeSpent / 60)}min`);
  console.log(`   - Duración promedio: ${Math.floor(profile.avgSessionDuration / 60)}min`);
  console.log(`   - Rating promedio: ${profile.avgRating?.toFixed(2) || "N/A"}`);
  console.log(`   - Hora preferida: ${profile.preferredTimeOfDay || "N/A"}`);
  console.log(`   - Categorías favoritas: ${(profile.favoriteCategories as string[]).join(", ") || "Ninguna"}`);
  console.log(`   - Tags favoritos: ${(profile.favoriteTags as string[]).slice(0, 5).join(", ") || "Ninguno"}`);
  console.log("");

  // 5. Verificar historial
  console.log("📜 Verificando historial de interacciones...\n");
  const history = await getUserInteractionHistory(testUser.id, 10);

  console.log(`   Últimas ${history.length} interacciones:`);
  history.slice(0, 5).forEach((h, i) => {
    console.log(`   ${i + 1}. ${h.interactionType} - ${h.itemType} ${h.itemId.substring(0, 8)}... (${h.duration || 0}s)`);
  });
  console.log("");

  // 6. Generar recomendaciones
  console.log("🎯 Generando recomendaciones...\n");
  const startTime = Date.now();

  const recommendations = await generateRecommendations(testUser.id);

  const duration = Date.now() - startTime;
  console.log(`   ✓ Recomendaciones generadas en ${duration}ms\n`);

  // 7. Mostrar resultados
  console.log("🌟 Resultados:\n");
  console.log(`   Total de recomendaciones: ${recommendations.length}\n`);

  recommendations.slice(0, 5).forEach((rec, i) => {
    console.log(`   ${i + 1}. [${rec.itemType.toUpperCase()}] ${rec.name}`);
    console.log(`      Score: ${Math.round(rec.score * 100)}%`);
    console.log(`      Razón: ${rec.reason}`);
    if (rec.tags && rec.tags.length > 0) {
      console.log(`      Tags: ${rec.tags.slice(0, 3).join(", ")}`);
    }
    console.log("");
  });

  // 8. Verificar cache
  console.log("💾 Verificando cache...\n");
  const cache = await prisma.recommendationCache.findFirst({
    where: { userId: testUser.id },
    orderBy: { generatedAt: "desc" },
  });

  if (cache) {
    console.log("   ✓ Cache creado exitosamente");
    console.log(`   - Algoritmo: ${cache.algorithm}`);
    console.log(`   - Generado: ${cache.generatedAt.toLocaleString()}`);
    console.log(`   - Expira: ${cache.expiresAt.toLocaleString()}`);
    console.log(`   - Items en cache: ${(cache.recommendations as any[]).length}`);
  } else {
    console.log("   ⚠️  No se encontró cache");
  }

  console.log("");

  // 9. Test de regeneración
  console.log("🔄 Testeando regeneración de cache...\n");

  // Invalidar cache
  await prisma.recommendationCache.deleteMany({
    where: { userId: testUser.id },
  });
  console.log("   ✓ Cache invalidado");

  // Regenerar
  const regeneratedRecs = await generateRecommendations(testUser.id);
  console.log(`   ✓ Nuevas recomendaciones generadas: ${regeneratedRecs.length}\n`);

  // 10. Estadísticas finales
  console.log("📈 Estadísticas del Sistema:\n");

  const totalInteractions = await prisma.userInteraction.count();
  const totalProfiles = await prisma.userProfile.count();
  const totalCaches = await prisma.recommendationCache.count();

  console.log(`   - Total interacciones en DB: ${totalInteractions}`);
  console.log(`   - Total perfiles de usuario: ${totalProfiles}`);
  console.log(`   - Total caches activos: ${totalCaches}`);

  console.log("\n✅ Test completado exitosamente!\n");
}

// Ejecutar test
testRecommendationSystem()
  .catch((error) => {
    console.error("❌ Error en el test:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
