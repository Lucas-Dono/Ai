import { NextRequest, NextResponse } from "next/server";
import { minecraftMessageHandler } from "@/lib/minecraft/minecraft-message-handler";
import {
  MinecraftMessageRequestSchema,
  MinecraftChatError,
  MINECRAFT_ERROR_CODES,
} from "@/types/minecraft-chat";
import { checkTierRateLimit } from "@/lib/redis/ratelimit";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/v1/minecraft/message
 *
 * Endpoint principal para enviar mensajes desde Minecraft
 *
 * Autenticación: API Key en header X-API-Key
 *
 * Body:
 * {
 *   "content": "Hola, ¿cómo están?",
 *   "player": {
 *     "uuid": "...",
 *     "name": "Steve",
 *     "position": { "x": 100, "y": 64, "z": 200, "yaw": 90, "pitch": 0 },
 *     "userId": "user_id_from_db" (opcional)
 *   },
 *   "nearbyAgents": [
 *     {
 *       "agentId": "agent_123",
 *       "entityId": 42,
 *       "name": "Alice",
 *       "position": { "x": 102, "y": 64, "z": 201 },
 *       "isActive": true
 *     }
 *   ],
 *   "replyToId": "msg_abc" (opcional),
 *   "config": { "maxResponders": 2 } (opcional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "userMessage": { "messageId": "...", "content": "...", "timestamp": "..." },
 *   "proximityContext": { ... },
 *   "agentResponses": [
 *     {
 *       "messageId": "...",
 *       "agentId": "...",
 *       "agentName": "Alice",
 *       "content": "¡Hola! Bien, gracias.",
 *       "emotion": "joy",
 *       "timestamp": "...",
 *       "animationHint": "waving"
 *     }
 *   ],
 *   "metadata": { "responseTime": 1234, "agentsEvaluated": 3, "agentsResponded": 1 }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Autenticación via API Key
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key requerida", code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    // Buscar usuario por API Key
    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: {
        id: true,
        plan: true,
        apiKey: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "API Key inválida", code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    // 2. Rate limiting por tier
    const rateLimitResult = await checkTierRateLimit(user.id, user.plan);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Límite de tasa excedido",
          code: MINECRAFT_ERROR_CODES.RATE_LIMIT_EXCEEDED,
          ...rateLimitResult.error
        },
        { status: 429 }
      );
    }

    // 3. Validar body
    const body = await req.json();
    const validation = MinecraftMessageRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          code: MINECRAFT_ERROR_CODES.INVALID_MESSAGE,
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { content, player, nearbyAgents, replyToId, config } = validation.data;

    // Asociar userId del usuario autenticado al player
    player.userId = user.id;

    // 4. Procesar mensaje
    const result = await minecraftMessageHandler.processMessage(
      player,
      content,
      nearbyAgents,
      replyToId
    );

    // 5. Retornar respuesta
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Error in Minecraft message endpoint:", error);

    if (error instanceof MinecraftChatError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        code: MINECRAFT_ERROR_CODES.GENERATION_FAILED
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/minecraft/message
 *
 * Retorna información sobre el endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/v1/minecraft/message",
    method: "POST",
    description: "Envía mensajes desde Minecraft y recibe respuestas de agentes IA",
    authentication: "API Key en header X-API-Key",
    rateLimit: {
      free: "10 req/min, 100 req/hora, 300 req/día",
      plus: "30 req/min, 600 req/hora, 3000 req/día",
      ultra: "100 req/min, 6000 req/hora, 10000 req/día",
    },
    documentation: "https://docs.blaniel.com/minecraft-integration",
  });
}
