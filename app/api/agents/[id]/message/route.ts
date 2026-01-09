/**
 * Message API Endpoint
 *
 * POST /api/agents/[id]/message
 * - Receives user message
 * - Processes through emotional and behavior systems
 * - Generates agent response
 * - Returns complete interaction data
 *
 * OPTIMIZED:
 * - Uses service layer for business logic
 * - Validates input with Zod
 * - Structured logging with Pino
 * - Eliminated N+1 queries
 * - Proper error handling
 */

import { NextRequest, NextResponse } from "next/server";
import { checkTierRateLimit } from "@/lib/redis/ratelimit";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";
import { getAuthenticatedUser } from "@/lib/auth-helper";
import { messageService } from "@/lib/services/message.service";
import { messageInputSchema, formatZodError } from "@/lib/validation/schemas";
import { apiLogger as log, logError, createTimer } from "@/lib/logging";
import { ZodError } from "zod";
import { handlePrismaError, isPrismaError } from "@/lib/api/prisma-error-handler";
import { withAuth, parsePagination, createPaginationResult } from "@/lib/api/middleware";
import { HuggingFaceVisionClient } from "@/lib/vision/huggingface-vision";
import { prisma } from "@/lib/prisma";
import { LifeEventsTimelineService } from "@/lib/life-events/timeline.service";
import { checkTierResourceLimit, trackMessageUsage, canAnalyzeImage, trackImageAnalysisUsage } from "@/lib/usage/daily-limits";
import { canSendMessage, trackTokenUsage, estimateTokensFromText, getTokenUsageStats } from "@/lib/usage/token-limits";
import { semanticCache } from "@/lib/cache/semantic-cache";
import { checkCooldown, trackCooldown } from "@/lib/usage/cooldown-tracker";
import { trackEvent, EventType } from "@/lib/analytics/kpi-tracker";
import { ConversationTrackingService } from "@/lib/services/conversation-tracking.service";
import { decryptMessageIfNeeded } from "@/lib/encryption/message-encryption";

/**
 * GET /api/agents/[id]/message
 * Get message history for an agent
 */
export const GET = withAuth(async (req, { params, user }) => {
  try {
    const { id: agentId } = params;
    const userId = user.id;

    log.info({ agentId, userId }, 'Loading message history');

    // Parse pagination params with safe defaults
    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams, {
      defaultLimit: 50,
      maxLimit: 100,
    });

    // Load messages from database
    // Filter by both agentId and userId to get conversation between user and agent
    const messages = await prisma.message.findMany({
      where: {
        agentId,
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip: offset,
      take: limit,
      include: {
        agent: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        agentId,
        userId,
      },
    });

    log.info({ agentId, userId, count: messages.length, total: totalCount }, 'Message history loaded');

    // Desencriptar mensajes antes de devolverlos
    return NextResponse.json({
      messages: messages.map(msg => ({
        id: msg.id,
        content: decryptMessageIfNeeded(msg.content, msg.iv, msg.authTag),
        role: msg.role,
        metadata: msg.metadata,
        createdAt: msg.createdAt,
        agentName: msg.agent?.name || null,
        agentAvatar: msg.agent?.avatar || null,
      })),
      pagination: createPaginationResult({ limit, offset }, totalCount, messages.length),
    });

  } catch (error) {
    if (isPrismaError(error)) {
      return handlePrismaError(error, { context: 'Loading message history' });
    }
    logError(log, error, { context: 'Loading message history failed' });
    return NextResponse.json(
      {
        error: "Failed to load message history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const timer = createTimer(log, 'Process message');

  try {
    const { id: agentId } = await params;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // AUTHENTICATION (supports both NextAuth cookies and JWT tokens)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const user = await getAuthenticatedUser(req);
    if (!user) {
      log.warn({ agentId }, 'Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const userPlan = user.plan || "free";

    log.info({ agentId, userId, userPlan }, 'Message request received');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // COOLDOWN CHECK (Anti-Bot Protection)
    // Free: 5s, Plus: 2s, Ultra: 1s
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const cooldownCheck = await checkCooldown(userId, "message", userPlan);

    if (!cooldownCheck.allowed) {
      log.warn({
        userId,
        userPlan,
        waitMs: cooldownCheck.waitMs,
      }, 'Message blocked by cooldown');

      return NextResponse.json({
        error: cooldownCheck.message || "Por favor espera antes de enviar otro mensaje",
        code: "COOLDOWN_ACTIVE",
        waitMs: cooldownCheck.waitMs,
        retryAfter: new Date(Date.now() + cooldownCheck.waitMs).toISOString(),
      }, {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(cooldownCheck.waitMs / 1000).toString(),
          "X-Cooldown-Type": "message",
          "X-Cooldown-Wait-Ms": cooldownCheck.waitMs.toString(),
        },
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TIER-BASED RATE LIMITING (comprehensive)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const rateLimitResult = await checkTierRateLimit(userId, userPlan);
    if (!rateLimitResult.success) {
      log.warn({
        userId,
        userPlan,
        tier: rateLimitResult.tier,
        violatedWindow: rateLimitResult.violatedWindow
      }, 'Tier rate limit exceeded');

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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INPUT PARSING (Support both JSON and FormData for images)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const contentType = req.headers.get('content-type') || '';
    let body: any;
    let imageFile: File | null = null;
    let imageCaption: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // IMAGE UPLOAD HANDLING
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const formData = await req.formData();
      imageFile = (formData as any).get('image') as File | null;

      if (!imageFile) {
        return NextResponse.json(
          { error: "No image file provided" },
          { status: 400 }
        );
      }

      log.info({ userId, imageSize: imageFile.size }, 'Image upload detected');

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // COOLDOWN CHECK for Images (Anti-Bot Protection)
      // Free: 10s, Plus: 3s, Ultra: 5s
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const imageCooldownCheck = await checkCooldown(userId, "image", userPlan);

      if (!imageCooldownCheck.allowed) {
        log.warn({
          userId,
          userPlan,
          waitMs: imageCooldownCheck.waitMs,
        }, 'Image analysis blocked by cooldown');

        return NextResponse.json({
          error: imageCooldownCheck.message || "Por favor espera antes de analizar otra imagen",
          code: "COOLDOWN_ACTIVE",
          waitMs: imageCooldownCheck.waitMs,
          retryAfter: new Date(Date.now() + imageCooldownCheck.waitMs).toISOString(),
        }, {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(imageCooldownCheck.waitMs / 1000).toString(),
            "X-Cooldown-Type": "image",
            "X-Cooldown-Wait-Ms": imageCooldownCheck.waitMs.toString(),
          },
        });
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ANTI-ABUSE: Verificar límites diarios Y mensuales de análisis de imágenes
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const imageCheck = await canAnalyzeImage(userId, userPlan);

      if (!imageCheck.allowed) {
        log.warn({
          userId,
          userPlan,
          current: imageCheck.current,
          limit: imageCheck.limit,
          reason: imageCheck.reason,
        }, 'Image analysis limit exceeded');

        return NextResponse.json(
          {
            error: imageCheck.reason || "Límite de análisis de imágenes alcanzado",
            current: imageCheck.current,
            limit: imageCheck.limit,
            canUseRewarded: imageCheck.canUseRewarded,
            upgradeUrl: "/pricing",
          },
          { status: 429 }
        );
      }

      // Generar caption de la imagen con HuggingFace Vision
      try {
        const visionClient = new HuggingFaceVisionClient({});

        // Convertir File a base64
        const arrayBuffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';
        const imageBase64 = `data:${mimeType};base64,${base64}`;

        log.info({ userId }, 'Generating image caption with HuggingFace Vision...');
        const result = await visionClient.generateCaption({ imageBase64 });
        imageCaption = result.caption;

        log.info({ userId, caption: imageCaption.substring(0, 100) }, 'Image caption generated successfully');

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ANTI-ABUSE: Registrar uso de análisis de imagen (después de éxito)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        await trackImageAnalysisUsage(userId, false);
        log.info({ userId }, 'Image analysis usage tracked');

      } catch (error) {
        log.error({ error }, 'Error generating image caption');
        return NextResponse.json(
          {
            error: "Error al procesar la imagen. Por favor, intenta de nuevo.",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 }
        );
      }

      // Construir body desde FormData
      body = {
        content: (formData as any).get('content') || imageCaption || "He enviado una imagen",
        messageType: 'image',
        metadata: {
          imageCaption,
          originalFileName: imageFile.name,
          imageSize: imageFile.size,
          imageMimeType: imageFile.type,
        },
      };
    } else {
      // JSON request (text message)
      body = await req.json();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INPUT VALIDATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const validation = messageInputSchema.safeParse(body);

    if (!validation.success) {
      log.warn({ errors: validation.error.issues }, 'Invalid input data');
      return NextResponse.json(
        formatZodError(validation.error),
        { status: 400 }
      );
    }

    let { content } = validation.data;
    const { messageType, metadata } = validation.data;

    // Si hay un caption de imagen, enriquecer el contenido
    if (imageCaption) {
      content = `[Imagen: ${imageCaption}]\n\n${content}`;
      log.info({ enrichedContent: content.substring(0, 150) }, 'Content enriched with image caption');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LOAD AGENT (needed for complexity-based limits)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        generationTier: true,
        nsfwMode: true,
        nsfwLevel: true,
        name: true,
      },
    });

    if (!agent) {
      log.warn({ agentId }, 'Agent not found');
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const characterTier = (agent.generationTier || 'free') as 'free' | 'plus' | 'ultra';

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TOKEN-BASED LIMIT CHECK (with complexity multiplier)
    // More complex characters consume limits faster
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const { calculateEffectiveTokens } = await import('@/lib/usage/dynamic-limits');

    const actualInputTokens = estimateTokensFromText(content);
    const effectiveInputTokens = calculateEffectiveTokens(
      actualInputTokens,
      userPlan as 'free' | 'plus' | 'ultra',
      characterTier
    );

    const tokenQuota = await canSendMessage(userId, userPlan, effectiveInputTokens);

    if (!tokenQuota.allowed) {
      log.warn({
        userId,
        userPlan,
        characterTier,
        actualTokens: actualInputTokens,
        effectiveTokens: effectiveInputTokens,
        messagesUsed: tokenQuota.messagesUsedToday,
        messagesLimit: tokenQuota.messagesLimitToday,
        inputTokensUsed: tokenQuota.inputTokensUsed,
        inputTokensLimit: tokenQuota.inputTokensLimit,
      }, 'Token quota exceeded');

      return NextResponse.json({
        error: tokenQuota.reason || 'Daily token limit exceeded',
        messagesUsedToday: tokenQuota.messagesUsedToday,
        messagesLimitToday: tokenQuota.messagesLimitToday,
        canUseRewarded: tokenQuota.canUseRewarded,
        upgradeUrl: userPlan === 'free' ? '/dashboard/billing' : undefined,
        characterComplexity: characterTier, // Inform user about complexity impact
      }, { status: 429 });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CONTENT MODERATION (before processing)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const { moderateMessage } = await import('@/lib/moderation/moderation.service');
    const moderationResult = await moderateMessage(userId, content, {
      agentId,
      quickCheck: false, // Full check for all messages
    });

    if (moderationResult.blocked) {
      log.warn({
        userId,
        agentId,
        severity: moderationResult.severity,
        reason: moderationResult.reason,
        violationId: moderationResult.violationId,
      }, 'Message blocked by moderation system');

      return NextResponse.json({
        error: 'Contenido no permitido',
        reason: moderationResult.reason,
        suggestion: moderationResult.suggestion,
        severity: moderationResult.severity,
        action: moderationResult.action,
      }, { status: 400 });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MESSAGE PROCESSING (Service Layer with Semantic Cache)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Try to get from semantic cache first
    const cacheKey = `${agentId}:${content}`;
    const cachedResponse = await semanticCache.get(
      content,
      agentId,
      {
        model: 'qwen-2.5-72b-instruct', // Model used in orchestrator
        temperature: 0.7,
      }
    );

    let result;
    let fromCache = false;

    if (cachedResponse) {
      // Cache HIT - Parse cached response
      try {
        result = JSON.parse(cachedResponse);
        fromCache = true;
        log.info({ agentId, userId, similarity: 'high' }, 'Semantic cache HIT - using cached response');
      } catch (error) {
        log.warn({ error }, 'Failed to parse cached response, generating new one');
        result = await messageService.processMessage({
          agentId,
          userId,
          content,
          messageType,
          metadata,
          userPlan,
        });
      }
    } else {
      // Cache MISS - Generate new response
      result = await messageService.processMessage({
        agentId,
        userId,
        content,
        messageType,
        metadata,
        userPlan,
      });

      // Cache the response for future use (async, don't block)
      semanticCache.set(
        content,
        JSON.stringify(result),
        agentId,
        {
          model: 'qwen-2.5-72b-instruct',
          temperature: 0.7,
          ttl: 7 * 24 * 60 * 60, // 7 days
        }
      ).catch((error) => {
        log.warn({ error }, 'Failed to cache response');
      });

      log.info({ agentId, userId }, 'Semantic cache MISS - generated new response');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TRACK TOKEN USAGE (with complexity multiplier)
    // Complex characters consume more tokens from daily limit
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const actualOutputTokens = estimateTokensFromText(result.assistantMessage.content);
    const effectiveOutputTokens = calculateEffectiveTokens(
      actualOutputTokens,
      userPlan as 'free' | 'plus' | 'ultra',
      characterTier
    );

    await trackTokenUsage(
      userId,
      effectiveInputTokens, // Track effective tokens (with complexity multiplier)
      effectiveOutputTokens, // Track effective tokens (with complexity multiplier)
      {
        agentId,
        messageId: result.assistantMessage.id,
        userMessageContent: content.substring(0, 100), // First 100 chars for debugging
      }
    );

    log.info({
      userId,
      agentId,
      characterTier,
      actualInputTokens,
      actualOutputTokens,
      effectiveInputTokens,
      effectiveOutputTokens,
      totalEffectiveTokens: effectiveInputTokens + effectiveOutputTokens,
      complexityMultiplier: effectiveInputTokens / actualInputTokens,
    }, 'Token usage tracked with complexity multiplier');

    // Get updated token usage stats for response
    const tokenStats = await getTokenUsageStats(userId, userPlan);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NARRATIVE ARC DETECTION (async, no await)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Detectar arcos narrativos en el mensaje del usuario (sin bloquear respuesta)
    LifeEventsTimelineService.processMessage({
      message: content,
      timestamp: new Date(),
      agentId,
      userId,
    }).catch((error) => {
      log.warn({ error, agentId, userId }, 'Failed to process narrative arc detection');
    });

    timer.end({
      agentId,
      userId,
      messageId: result.assistantMessage.id,
      tokensUsed: result.usage.tokensUsed,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // COOLDOWN TRACKING (after successful processing)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await trackCooldown(userId, "message", userPlan);
    if (imageCaption) {
      // Track image cooldown too if image was analyzed
      await trackCooldown(userId, "image", userPlan);
    }
    log.info({ userId, userPlan }, 'Cooldowns tracked successfully');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ANALYTICS TRACKING (Fase 6 - User Experience & Engagement)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      // Check if this is the user's first message ever
      const messageCount = await prisma.message.count({
        where: {
          userId: userId,
          role: "user",
        },
      });

      if (messageCount === 1) {
        // This is the first message - track for UX metrics
        await trackEvent(EventType.FIRST_MESSAGE_SENT, {
          userId,
          agentId,
          messageId: result.userMessage.id,
          sessionId: result.userMessage.sessionId,
        });
        log.info({ userId, agentId }, 'TRACKING: First message sent event tracked');
      }

      // Track every message for engagement metrics
      await trackEvent(EventType.MESSAGE_SENT, {
        userId,
        agentId,
        messageId: result.userMessage.id,
        sessionId: result.userMessage.sessionId,
        messageLength: content.length,
      });
    } catch (trackError) {
      // No lanzar error si falla el tracking, solo loguearlo
      log.warn({ trackError }, 'Failed to track message analytics events');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CONVERSATION TRACKING (Tu Círculo)
    // Update conversation tracking for recent conversations widget
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    try {
      // Track both user and assistant messages
      await ConversationTrackingService.trackMessage(userId, agentId, 'user');
      await ConversationTrackingService.trackMessage(userId, agentId, 'assistant');
      log.info({ userId, agentId }, 'Conversation tracking updated successfully');
    } catch (trackError) {
      // No lanzar error si falla el tracking, solo loguearlo
      log.warn({ trackError }, 'Failed to update conversation tracking');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RESPONSE (with comprehensive rate limit headers)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    return NextResponse.json({
      // User message data
      userMessage: result.userMessage,

      // Agent message data
      message: result.assistantMessage,

      // Emotional state
      emotions: result.emotions,
      state: result.state,
      relationLevel: result.emotions.mood,

      // Relationship progression
      relationship: result.relationship,

      // Behavior system
      behaviors: result.behaviors,

      // Usage tracking
      usage: result.usage,

      // Resource quota info (token-based, shown as messages for UX)
      quota: {
        messagesUsed: tokenStats.messages.used,
        messagesLimit: tokenStats.messages.limit,
        messagesRemaining: tokenStats.messages.remaining,
        tier: tokenStats.tier,
        // Detailed token info (for debugging/advanced users)
        tokens: {
          input: tokenStats.tokens.input,
          output: tokenStats.tokens.output,
          total: tokenStats.tokens.total,
          rewarded: tokenStats.tokens.rewarded,
        },
      },

      // Cache info
      cache: {
        hit: fromCache,
        enabled: true,
      },
    }, {
      headers: {
        "X-RateLimit-Limit": rateLimitResult.limit.toString(),
        "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
        "X-RateLimit-Tier": rateLimitResult.tier,
        "X-RateLimit-Reset": rateLimitResult.reset?.toString() || "0",
        // Token-based quota (shown as messages for UX)
        "X-Resource-Quota-Messages-Used": tokenStats.messages.used.toString(),
        "X-Resource-Quota-Messages-Limit": tokenStats.messages.limit.toString(),
        "X-Resource-Quota-Messages-Remaining": tokenStats.messages.remaining.toString(),
        // Actual token counts (for debugging)
        "X-Resource-Quota-Tokens-Used": tokenStats.tokens.total.used.toString(),
        "X-Resource-Quota-Tokens-Limit": tokenStats.tokens.total.limit.toString(),
        // Cache headers
        "X-Cache-Status": fromCache ? "HIT" : "MISS",
      },
    });

  } catch (error) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ERROR HANDLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Handle validation errors
    if (error instanceof ZodError) {
      log.warn({ errors: error.issues }, 'Validation error');
      return NextResponse.json(
        formatZodError(error),
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (isPrismaError(error)) {
      return handlePrismaError(error, { context: 'Message processing' });
    }

    // Handle generic errors
    logError(log, error, { context: 'Message processing failed' });

    return NextResponse.json(
      {
        error: "Failed to process message",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
