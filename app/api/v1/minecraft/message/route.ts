import { NextRequest, NextResponse } from "next/server";
import { minecraftMessageHandler } from "@/lib/minecraft/minecraft-message-handler";
import {
  MinecraftMessageRequestSchema,
  MinecraftChatError,
  MINECRAFT_ERROR_CODES,
} from "@/types/minecraft-chat";
import { checkTierRateLimit } from "@/lib/redis/ratelimit";
import { prisma } from "@/lib/prisma";
import { verifyToken, extractTokenFromHeader } from "@/lib/jwt";

/**
 * POST /api/v1/minecraft/message
 *
 * Endpoint principal para enviar mensajes desde Minecraft
 *
 * Autenticación: JWT token en header Authorization: Bearer <token>
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
  console.log('[Minecraft Message] ===== NUEVA REQUEST =====');
  console.log('[Minecraft Message] URL:', req.url);
  console.log('[Minecraft Message] Method:', req.method);
  console.log('[Minecraft Message] Headers:', Object.fromEntries(req.headers.entries()));

  try {
    // 1. Autenticación via JWT token
    const authHeader = req.headers.get("authorization");
    console.log('[Minecraft Message] Auth header:', authHeader ? 'PRESENTE' : 'AUSENTE');

    const token = extractTokenFromHeader(authHeader);
    console.log('[Minecraft Message] Token extraído:', token ? 'SÍ (longitud: ' + token.length + ')' : 'NO');

    if (!token) {
      console.log('[Minecraft Message] ❌ Token no encontrado');
      return NextResponse.json(
        { error: "Token requerido", code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    const tokenData = await verifyToken(token);
    console.log('[Minecraft Message] Token verificado:', tokenData ? 'SÍ ✅' : 'NO ❌');

    if (!tokenData) {
      console.log('[Minecraft Message] ❌ Token inválido');
      return NextResponse.json(
        { error: "Token inválido", code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED },
        { status: 401 }
      );
    }

    console.log('[Minecraft Message] User ID del token:', tokenData.userId);

    // Buscar usuario por ID del token
    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        plan: true,
      },
    });

    console.log('[Minecraft Message] Usuario encontrado:', user ? 'SÍ (plan: ' + user.plan + ')' : 'NO');

    if (!user) {
      console.log('[Minecraft Message] ❌ Usuario no encontrado');
      return NextResponse.json(
        { error: "Usuario no encontrado", code: MINECRAFT_ERROR_CODES.PLAYER_NOT_AUTHENTICATED },
        { status: 404 }
      );
    }

    // 2. Rate limiting por tier
    const rateLimitResult = await checkTierRateLimit(user.id, user.plan);
    console.log('[Minecraft Message] Rate limit check:', rateLimitResult.success ? 'PASS ✅' : 'FAIL ❌');

    if (!rateLimitResult.success) {
      console.log('[Minecraft Message] ❌ Rate limit excedido');
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
    console.log('[Minecraft Message] Parseando body JSON...');
    const body = await req.json();
    console.log('[Minecraft Message] Body parseado. Content length:', body.content?.length || 0);
    console.log('[Minecraft Message] Nearby agents:', body.nearbyAgents?.length || 0);

    const validation = MinecraftMessageRequestSchema.safeParse(body);
    console.log('[Minecraft Message] Validación de schema:', validation.success ? 'PASS ✅' : 'FAIL ❌');

    if (!validation.success) {
      console.log('[Minecraft Message] ❌ Validación falló:', validation.error.issues);
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
    console.log('[Minecraft Message] Mensaje válido. Contenido:', content.substring(0, 50));
    console.log('[Minecraft Message] Player:', player.name, '(', player.uuid, ')');

    // Asociar userId del usuario autenticado al player
    player.userId = user.id;

    // 4. Procesar mensaje
    console.log('[Minecraft Message] Procesando mensaje...');
    const result = await minecraftMessageHandler.processMessage(
      player,
      content,
      nearbyAgents,
      replyToId
    );

    console.log('[Minecraft Message] ✅ Mensaje procesado exitosamente');
    console.log('[Minecraft Message] Agentes que respondieron:', result.agentResponses?.length || 0);

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
    authentication: "JWT token en header Authorization: Bearer <token>",
    rateLimit: {
      free: "10 req/min, 100 req/hora, 300 req/día",
      plus: "30 req/min, 600 req/hora, 3000 req/día",
      ultra: "100 req/min, 6000 req/hora, 10000 req/día",
    },
    documentation: "https://docs.blaniel.com/minecraft-integration",
  });
}
