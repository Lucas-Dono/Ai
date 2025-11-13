import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVeniceClient } from "@/lib/emotional-system/llm/venice";
import { EmotionalEngine } from "@/lib/relations/engine";
import { auth } from "@/lib/auth";
import { worldMessageBodySchema, formatValidationError } from "@/lib/validation/api-schemas";
import type { RelationPrivateState } from "@/types/prisma-json";
import { getContextLimit } from "@/lib/usage/context-limits";
import {
  checkWorldMessageLimit,
  checkWorldCooldown,
  checkSpamProtection,
  checkFloodProtection,
  checkTierRateLimit
} from "@/lib/redis/ratelimit";
import { trackWorldMessageUsage, checkTierResourceLimit } from "@/lib/usage/daily-limits";
import { canSendMessage, trackTokenUsage, estimateTokensFromText, getTokenUsageStats } from "@/lib/usage/token-limits";
import { getWorldStateRedis } from "@/lib/worlds/world-state-redis";
import { WorldPauseService } from "@/lib/services/world-pause.service";

// Aumentar timeout a 60 segundos para generación de respuestas
export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;
    const body = await req.json();

    // Validar datos con Zod
    const validation = worldMessageBodySchema.safeParse(body);
    if (!validation.success) {
      console.error('[World Message] Datos inválidos:', validation.error);
      return NextResponse.json(
        formatValidationError(validation.error),
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // SECURITY FIX #3: Verificar autenticación y obtener userId de la sesión
    // NUNCA confiar en el userId del body - previene suplantación de identidad
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userPlan = session.user.plan || 'free';

    // 🔒 TIER-BASED RATE LIMITING: API requests (all windows)
    const rateLimitResult = await checkTierRateLimit(userId, userPlan);
    if (!rateLimitResult.success) {
      console.log(`[World Message] Tier rate limit exceeded for user ${userId} (${rateLimitResult.violatedWindow})`);
      const error = rateLimitResult.error!;
      return NextResponse.json(error, {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimitResult.reset?.toString() || "0",
          "X-RateLimit-Tier": rateLimitResult.tier,
          "X-RateLimit-Window": rateLimitResult.violatedWindow || "unknown",
          "Retry-After": rateLimitResult.reset
            ? Math.ceil(rateLimitResult.reset - Date.now() / 1000).toString()
            : "60",
        },
      });
    }

    // 🔒 TOKEN-BASED LIMITS: Verificar límite diario de tokens
    const estimatedInputTokens = estimateTokensFromText(content);
    const tokenQuota = await canSendMessage(userId, userPlan, estimatedInputTokens);

    if (!tokenQuota.allowed) {
      console.log(`[World Message] Token quota exceeded for user ${userId}`);
      return NextResponse.json(
        {
          error: tokenQuota.reason || 'Daily token limit exceeded',
          messagesUsedToday: tokenQuota.messagesUsedToday,
          messagesLimitToday: tokenQuota.messagesLimitToday,
          canUseRewarded: tokenQuota.canUseRewarded,
          upgradeUrl: userPlan === 'free' ? '/dashboard/billing' : undefined,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': tokenQuota.messagesLimitToday.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(Date.now() / 1000 + 86400).toString(),
            'Retry-After': '86400',
          }
        }
      );
    }

    // 🔒 RATE LIMITING: Verificar cooldown entre mensajes
    const cooldownCheck = await checkWorldCooldown(worldId, userId, userPlan);
    if (!cooldownCheck.allowed) {
      console.log(`[World Message] Cooldown activo para usuario ${userId} en mundo ${worldId}`);
      return NextResponse.json(
        {
          error: cooldownCheck.reason,
          retryAfter: cooldownCheck.retryAfter
        },
        {
          status: 429,
          headers: {
            'Retry-After': cooldownCheck.retryAfter?.toString() || '5',
          }
        }
      );
    }

    // 🔒 RATE LIMITING: Verificar protección anti-spam
    const spamCheck = await checkSpamProtection(worldId, userId, content);
    if (!spamCheck.allowed) {
      console.log(`[World Message] Spam detectado para usuario ${userId} en mundo ${worldId}`);
      return NextResponse.json(
        { error: spamCheck.reason },
        { status: 429 }
      );
    }

    // 🔒 RATE LIMITING: Verificar protección anti-flooding
    const floodCheck = await checkFloodProtection(worldId, userId, userPlan);
    if (!floodCheck.allowed) {
      console.log(`[World Message] Flooding detectado para usuario ${userId} en mundo ${worldId}`);
      return NextResponse.json(
        { error: floodCheck.reason },
        { status: 429 }
      );
    }

    // Obtener límite de contexto dinámico basado en tier
    const contextLimit = getContextLimit(userPlan);

    // 🔥 REDIS: Adquirir lock para prevenir race conditions
    const redisService = getWorldStateRedis();
    const lock = await redisService.lockWorld(worldId, 30);

    if (!lock.acquired) {
      console.log(`[World Message] World ${worldId} is locked, retrying...`);
      return NextResponse.json(
        { error: "World is busy processing another message, please try again" },
        { status: 503, headers: { 'Retry-After': '2' } }
      );
    }

    try {
      // Obtener mundo y sus agentes
      const world = await prisma.world.findUnique({
        where: { id: worldId },
        include: {
          worldAgents: {
            include: {
              agent: true,
            },
          },
        },
      });

      if (!world) {
        return NextResponse.json({ error: "World not found" }, { status: 404 });
      }

      // AUTO-RESUME: Reactivar mundo si estaba pausado
      if (world.isPaused) {
        console.log(`[World Message] World ${worldId} is paused, resuming...`);
        const resumeResult = await WorldPauseService.resumeWorld(worldId, userId);

        if (!resumeResult.success) {
          console.error(`[World Message] Failed to resume world: ${resumeResult.message}`);
          return NextResponse.json(
            { error: "Failed to resume world", details: resumeResult.message },
            { status: 500 }
          );
        }

        console.log(`[World Message] World ${worldId} resumed successfully`);
      }

      // Actualizar lastActiveAt
      await WorldPauseService.updateLastActive(worldId);

    // Obtener el último turnNumber para incrementar
    const lastInteraction = await prisma.worldInteraction.findFirst({
      where: { worldId },
      orderBy: { turnNumber: 'desc' },
      select: { turnNumber: true },
    });

    const nextTurnNumber = (lastInteraction?.turnNumber || 0) + 1;

    console.log(`[World Message] Usuario envió mensaje, turno #${nextTurnNumber}`);

    // Para visual novel: solo generar respuesta del siguiente personaje en el turno
    // No todos los personajes responden a cada mensaje
    const venice = getVeniceClient();

    // Obtener la última interacción para determinar quién responde
    // (todas las interacciones deberían tener speakerId en un visual novel)
    const lastAgentInteraction = await prisma.worldInteraction.findFirst({
      where: { worldId },
      orderBy: { turnNumber: "desc" },
      include: { speaker: true }
    });

    // Determinar qué agente debería responder
    // Si es el primer mensaje, usar el primer agente del mundo
    // Si no, rotar al siguiente agente
    let respondingAgent = world.worldAgents[0]?.agent;

    if (lastAgentInteraction?.speaker) {
      const currentIndex = world.worldAgents.findIndex(
        wa => wa.agent.id === lastAgentInteraction.speaker.id
      );
      const nextIndex = (currentIndex + 1) % world.worldAgents.length;
      respondingAgent = world.worldAgents[nextIndex]?.agent;
    }

    if (!respondingAgent) {
      throw new Error("No hay agentes en este mundo");
    }

    // Obtener interacciones recientes del mundo para contexto
    const recentInteractions = await prisma.worldInteraction.findMany({
      where: { worldId },
      orderBy: { createdAt: "desc" },
      take: contextLimit, // 🔥 DYNAMIC: 10 (free) | 30 (plus) | 100 (ultra)
    });

    // Construir historial de mensajes incluyendo el mensaje actual del usuario
    const messageHistory = [
      ...recentInteractions.reverse().map((i) => ({
        role: "assistant" as const,
        content: i.content,
      })),
      {
        role: "user" as const,
        content,
      }
    ];

    // Obtener relación del agente con el usuario
    let relation = await prisma.relation.findFirst({
      where: {
        subjectId: respondingAgent.id,
        targetId: userId,
      },
    });

    if (!relation) {
      relation = await prisma.relation.create({
        data: {
          subjectId: respondingAgent.id,
          targetId: userId,
          targetType: "user",
          trust: 0.5,
          affinity: 0.5,
          respect: 0.5,
          privateState: { love: 0, curiosity: 0 },
          visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
        },
      });
    }

    const privateState = relation.privateState as RelationPrivateState | null;

    const currentState = {
      valence: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      trust: relation.trust,
      affinity: relation.affinity,
      respect: relation.respect,
      love: privateState?.love || 0,
      curiosity: privateState?.curiosity || 0,
    };

    // Analizar y actualizar emociones
    const newState = EmotionalEngine.analyzeMessage(content, currentState);

    await prisma.relation.update({
      where: { id: relation.id },
      data: {
        trust: newState.trust,
        affinity: newState.affinity,
        respect: newState.respect,
        privateState: { love: newState.love, curiosity: newState.curiosity },
        visibleState: {
          trust: newState.trust,
          affinity: newState.affinity,
          respect: newState.respect,
        },
      },
    });

    // Ajustar prompt
    const adjustedPrompt = EmotionalEngine.adjustPromptForEmotion(
      respondingAgent.systemPrompt,
      newState
    );

    // Generar UNA sola respuesta con Venice (sin censura)
    console.log(`[World Message] Generando respuesta de ${respondingAgent.name}...`);
    console.log(`[World Message] Mensajes en historial: ${messageHistory.length}`);

    let response: string;
    try {
      response = await venice.generateWithMessages({
        systemPrompt: `${adjustedPrompt}\n\nEstás en un mundo grupal llamado "${world.name}". Otros agentes están presentes. Responde considerando el contexto grupal.`,
        messages: messageHistory,
        temperature: 0.9,
        maxTokens: 800,
      });

      console.log(`[World Message] Respuesta recibida de ${respondingAgent.name}: ${response.substring(0, 100)}...`);
    } catch (error) {
      console.error(`[World Message] Error generando respuesta de ${respondingAgent.name}:`, error);
      throw error;
    }

    // Guardar respuesta del agente como WorldInteraction
    const agentInteraction = await prisma.worldInteraction.create({
      data: {
        worldId,
        speakerId: respondingAgent.id,
        content: response,
        interactionType: 'dialogue',
        turnNumber: nextTurnNumber,
        speakerEmotion: EmotionalEngine.getVisibleEmotions(newState),
        metadata: {
          agentName: respondingAgent.name,
          userMessage: content, // Guardar el mensaje del usuario para contexto
        },
      },
    });

      console.log(`[World Message] Interacción guardada: Turn #${nextTurnNumber}`);

      // 🔥 TOKEN TRACKING: Registrar uso de tokens
      const outputTokens = estimateTokensFromText(response);
      await trackTokenUsage(
        userId,
        estimatedInputTokens,
        outputTokens,
        {
          worldId,
          agentId: respondingAgent.id,
          messageContent: content.substring(0, 100), // First 100 chars for debugging
        }
      );

      console.log(`[World Message] Token tracking - Input: ${estimatedInputTokens}, Output: ${outputTokens}`);

      // 🔥 REDIS: Invalidar cache para forzar recarga en próxima request
      await redisService.invalidateCache(worldId);

      // Get updated token usage stats for response
      const tokenStats = await getTokenUsageStats(userId, userPlan);

      // Retornar en el formato que espera el frontend con headers de rate limit
      const responseHeaders = new Headers();

      // Token-based quota headers (shown as messages for UX)
      responseHeaders.set('X-Resource-Quota-Messages-Used', tokenStats.messages.used.toString());
      responseHeaders.set('X-Resource-Quota-Messages-Limit', tokenStats.messages.limit.toString());
      responseHeaders.set('X-Resource-Quota-Messages-Remaining', tokenStats.messages.remaining.toString());
      // Actual token counts (for debugging)
      responseHeaders.set('X-Resource-Quota-Tokens-Used', tokenStats.tokens.total.used.toString());
      responseHeaders.set('X-Resource-Quota-Tokens-Limit', tokenStats.tokens.total.limit.toString());

      return NextResponse.json({
        success: true,
        responses: [{
          message: {
            id: agentInteraction.id,
            role: 'assistant',
            content: response,
            agentId: respondingAgent.id,
            metadata: {
              agentName: respondingAgent.name,
              emotions: EmotionalEngine.getVisibleEmotions(newState),
            }
          }
        }],
        // Token-based quota info (shown as messages for UX)
        quota: {
          messagesUsed: tokenStats.messages.used,
          messagesLimit: tokenStats.messages.limit,
          messagesRemaining: tokenStats.messages.remaining,
          tier: tokenStats.tier,
          tokens: {
            input: tokenStats.tokens.input,
            output: tokenStats.tokens.output,
            total: tokenStats.tokens.total,
            rewarded: tokenStats.tokens.rewarded,
          },
        },
      }, { headers: responseHeaders });

    } finally {
      // 🔥 REDIS: Siempre liberar el lock
      await redisService.unlockWorld(worldId, lock.lockId);
    }

  } catch (error) {
    console.error("Error sending message to world:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
