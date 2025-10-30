/**
 * Motor de Recomendación estilo Netflix/Spotify
 * Arquitectura de 2 fases: Candidate Generation → Ranking
 */

import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { getUserProfile, getUserInteractionHistory } from "./tracker";

export interface Recommendation {
  itemType: "agent" | "world";
  itemId: string;
  name: string;
  description?: string;
  score: number;
  reason: string;
  tags?: string[];
  avatar?: string | null;
}

/**
 * FASE 1: Generación de Candidatos
 * Obtiene ~100-200 items potenciales de múltiples fuentes
 */
async function generateCandidates(userId: string): Promise<{
  agents: any[];
  worlds: any[];
}> {
  const profile = await getUserProfile(userId);
  const history = await getUserInteractionHistory(userId, 50);

  // IDs de items ya interactuados (para evitar repetir)
  const interactedItemIds = new Set(history.map((h) => h.itemId));

  // 1. TRENDING (Popular ahora)
  const trendingWorlds = await prisma.world.findMany({
    where: {
      isPredefined: true,
      visibility: "public",
      id: { notIn: Array.from(interactedItemIds) },
    },
    orderBy: { viewCount: "desc" },
    take: 20,
    include: {
      _count: {
        select: { interactions: true, worldAgents: true },
      },
    },
  });

  // 2. COLLABORATIVE FILTERING BÁSICO (usuarios similares)
  // Encontrar usuarios que interactuaron con los mismos items
  const userItemIds = history.map((h) => h.itemId);

  const similarUserInteractions = await prisma.userInteraction.findMany({
    where: {
      itemId: { in: userItemIds },
      userId: { not: userId },
    },
    distinct: ["userId"],
    take: 10,
  });

  const similarUserIds = similarUserInteractions.map((i) => i.userId);

  // Obtener items que les gustaron a usuarios similares
  const collaborativeItems = await prisma.userInteraction.findMany({
    where: {
      userId: { in: similarUserIds },
      itemType: "agent",
      rating: { gte: 4 }, // Solo los que calificaron bien
      itemId: { notIn: Array.from(interactedItemIds) },
    },
    distinct: ["itemId"],
    take: 30,
  });

  const collaborativeAgentIds = collaborativeItems.map((i) => i.itemId);

  // 3. CONTENT-BASED (Similar a lo que le gustó)
  const likedAgentIds = history
    .filter((h) => h.itemType === "agent" && (h.rating || 0) >= 4)
    .map((h) => h.itemId);

  const likedAgents = await prisma.agent.findMany({
    where: { id: { in: likedAgentIds } },
    select: { tags: true, kind: true },
  });

  // Extraer tags de los que le gustaron
  const likedTags = new Set<string>();
  const likedKinds = new Set<string>();

  likedAgents.forEach((agent) => {
    if (agent.tags && Array.isArray(agent.tags)) {
      (agent.tags as string[]).forEach((tag) => likedTags.add(tag));
    }
    likedKinds.add(agent.kind);
  });

  // Buscar agentes con tags similares
  const contentBasedAgents = await prisma.agent.findMany({
    where: {
      OR: [
        ...(Array.from(likedTags).length > 0
          ? [{ tags: { hasSome: Array.from(likedTags) } }]
          : []),
        { kind: { in: Array.from(likedKinds) } },
      ],
      id: { notIn: Array.from(interactedItemIds) },
      userId: null, // Solo agentes públicos
      visibility: "public",
    },
    take: 30,
    include: {
      _count: { select: { reviews: true } },
    },
  });

  // 4. HIGH RATED (Bien calificados en general)
  const highRatedAgents = await prisma.agent.findMany({
    where: {
      rating: { gte: 4.0 },
      id: { notIn: Array.from(interactedItemIds) },
      userId: null,
      visibility: "public",
    },
    orderBy: { rating: "desc" },
    take: 20,
    include: {
      _count: { select: { reviews: true } },
    },
  });

  // 5. NEW/FRESH (Contenido nuevo)
  const freshAgents = await prisma.agent.findMany({
    where: {
      id: { notIn: Array.from(interactedItemIds) },
      userId: null,
      visibility: "public",
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días
      },
    },
    orderBy: { createdAt: "desc" },
    take: 15,
    include: {
      _count: { select: { reviews: true } },
    },
  });

  // Obtener agentes colaborativos
  const collaborativeAgents = await prisma.agent.findMany({
    where: {
      id: { in: collaborativeAgentIds },
    },
    include: {
      _count: { select: { reviews: true } },
    },
  });

  // Combinar y deduplicar
  const allAgents = [
    ...collaborativeAgents,
    ...contentBasedAgents,
    ...highRatedAgents,
    ...freshAgents,
  ];

  const uniqueAgents = Array.from(
    new Map(allAgents.map((agent) => [agent.id, agent])).values()
  );

  return {
    agents: uniqueAgents,
    worlds: trendingWorlds,
  };
}

/**
 * FASE 2: Ranking con LLM
 * Analiza historial y rankea los candidatos
 */
async function rankCandidatesWithLLM(
  userId: string,
  candidates: { agents: any[]; worlds: any[] }
): Promise<Recommendation[]> {
  const llm = getLLMProvider();
  const profile = await getUserProfile(userId);
  const history = await getUserInteractionHistory(userId, 30);

  // Construir resumen del historial
  const historyItems = await Promise.all(
    history.slice(0, 10).map(async (h) => {
      if (h.itemType === "agent") {
        const agent = await prisma.agent.findUnique({
          where: { id: h.itemId },
          select: { name: true, description: true, kind: true },
        });
        return {
          type: "agent",
          name: agent?.name || "Unknown",
          description: agent?.description || "",
          duration: h.duration,
          rating: h.rating,
        };
      } else {
        const world = await prisma.world.findUnique({
          where: { id: h.itemId },
          select: { name: true, description: true, category: true },
        });
        return {
          type: "world",
          name: world?.name || "Unknown",
          description: world?.description || "",
          duration: h.duration,
        };
      }
    })
  );

  // Construir lista de candidatos para el LLM
  const candidatesList = [
    ...candidates.agents.map((a) => ({
      type: "agent",
      id: a.id,
      name: a.name,
      description: a.description || "",
      kind: a.kind,
      tags: a.tags || [],
      rating: a.rating || 0,
      reviewCount: a._count?.reviews || 0,
    })),
    ...candidates.worlds.map((w) => ({
      type: "world",
      id: w.id,
      name: w.name,
      description: w.description || "",
      category: w.category || "",
      viewCount: w.viewCount || 0,
      agentCount: w._count?.worldAgents || 0,
    })),
  ];

  // Prompt para el LLM
  const prompt = `Eres un sistema de recomendación experto. Analiza el historial del usuario y recomienda los mejores items.

HISTORIAL DEL USUARIO:
${historyItems.map((h, i) => `${i + 1}. ${h.name} (${h.type}) - ${h.duration}s ${h.rating ? `⭐${h.rating}` : ""}`).join("\n")}

PERFIL DEL USUARIO:
- Categorías favoritas: ${(profile.favoriteCategories as string[]).join(", ") || "Ninguna"}
- Tags favoritos: ${(profile.favoriteTags as string[]).slice(0, 5).join(", ") || "Ninguno"}
- Tiempo promedio de sesión: ${Math.floor(profile.avgSessionDuration / 60)}min
- Hora preferida: ${profile.preferredTimeOfDay || "cualquiera"}

CANDIDATOS DISPONIBLES (${candidatesList.length} items):
${candidatesList.map((c, i) => `${i + 1}. [${c.type.toUpperCase()}] ${c.name} - ${c.description.substring(0, 100)}`).join("\n")}

TAREA:
Selecciona los 10 mejores items para recomendar a este usuario.
Para cada uno, explica en 1 línea POR QUÉ lo recomiendas basándote en su historial.

FORMATO DE RESPUESTA (JSON):
{
  "recommendations": [
    {
      "itemId": "id_del_item",
      "score": 0.95,
      "reason": "Te gustó Einstein, este científico también te fascinará"
    }
  ]
}

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`;

  try {
    const response = await llm.generate({
      systemPrompt: "Eres un sistema de recomendación experto.",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      maxTokens: 2000,
    });
    const jsonMatch = response.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const recommendations: Recommendation[] = [];

    for (const rec of parsed.recommendations) {
      const candidate = candidatesList.find((c) => c.id === rec.itemId);
      if (candidate) {
        recommendations.push({
          itemType: candidate.type as "agent" | "world",
          itemId: candidate.id,
          name: candidate.name,
          description: candidate.description,
          score: rec.score || 0.5,
          reason: rec.reason,
          tags: "tags" in candidate ? (candidate.tags as string[]) : [],
          avatar: ("avatar" in candidate ? candidate.avatar : null) as string | null,
        });
      }
    }

    return recommendations;
  } catch (error) {
    console.error("Error ranking with LLM:", error);

    // Fallback: ranking simple por score
    return candidatesList.slice(0, 10).map((c) => ({
      itemType: c.type as "agent" | "world",
      itemId: c.id,
      name: c.name,
      description: c.description,
      score: 0.5,
      reason: "Recomendado basado en tendencias",
      tags: "tags" in c ? (c.tags as string[]) : [],
      avatar: null,
    }));
  }
}

/**
 * Genera recomendaciones para un usuario
 */
export async function generateRecommendations(
  userId: string
): Promise<Recommendation[]> {
  console.log("🎯 Generando recomendaciones para", userId);

  // Verificar si hay cache válido
  const cached = await prisma.recommendationCache.findFirst({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { generatedAt: "desc" },
  });

  if (cached) {
    console.log("✅ Usando cache de recomendaciones");
    return cached.recommendations as unknown as Recommendation[];
  }

  console.log("🔄 Generando nuevas recomendaciones...");

  // FASE 1: Generar candidatos
  const candidates = await generateCandidates(userId);
  console.log(`📋 Candidatos: ${candidates.agents.length} agents, ${candidates.worlds.length} worlds`);

  // FASE 2: Ranking con LLM
  const recommendations = await rankCandidatesWithLLM(userId, candidates);
  console.log(`⭐ Recomendaciones finales: ${recommendations.length}`);

  // Guardar en cache (24 horas)
  await prisma.recommendationCache.create({
    data: {
      userId,
      recommendations: recommendations as any,
      algorithm: "hybrid",
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  return recommendations;
}
