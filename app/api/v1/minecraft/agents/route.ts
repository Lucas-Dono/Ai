import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MINECRAFT_ERROR_CODES } from "@/types/minecraft-chat";

/**
 * GET /api/v1/minecraft/agents
 *
 * Lista todos los agentes del usuario disponibles para Minecraft
 *
 * Headers:
 * - X-API-Key: API key del usuario
 *
 * Query params:
 * - ?active=true (opcional): Solo agentes activos
 *
 * Response:
 * {
 *   "agents": [
 *     {
 *       "id": "agent_123",
 *       "name": "Alice",
 *       "avatar": "https://...",
 *       "personality": {
 *         "extraversion": 75,
 *         "agreeableness": 80
 *       },
 *       "isActive": true
 *     }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Autenticación
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API Key requerida",
          code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "API Key inválida",
          code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED,
        },
        { status: 401 }
      );
    }

    // 2. Obtener parámetros
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";

    // 3. Buscar agentes del usuario
    const agents = await prisma.agent.findMany({
      where: {
        userId: user.id,
        ...(activeOnly && { isActive: true }),
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        PersonalityCore: {
          select: {
            extraversion: true,
            agreeableness: true,
            conscientiousness: true,
            neuroticism: true,
            openness: true,
          },
        },
        profile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 4. Formatear respuesta
    const formattedAgents = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      personality: agent.PersonalityCore || {},
      profile: {
        age: (agent.profile as any)?.identidad?.edad,
        occupation: (agent.profile as any)?.ocupacion?.profesion,
        gender: (agent.profile as any)?.identidad?.genero,
      },
      isActive: true, // Simplificado: siempre true
    }));

    return NextResponse.json({
      agents: formattedAgents,
      total: formattedAgents.length,
    });
  } catch (error) {
    console.error("Error fetching Minecraft agents:", error);
    return NextResponse.json(
      {
        error: "Error al obtener agentes",
        code: MINECRAFT_ERROR_CODES.GENERATION_FAILED,
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS para CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });
}
