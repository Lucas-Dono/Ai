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
import { checkRateLimit } from "@/lib/redis/ratelimit";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";
import { auth } from "@/lib/auth";
import { messageService } from "@/lib/services/message.service";
import { messageInputSchema, formatZodError } from "@/lib/validation/schemas";
import { createLogger, logError } from "@/lib/logger";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

const log = createLogger('API/Message');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // AUTHENTICATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const session = await auth();
    if (!session?.user?.id) {
      log.warn({ agentId }, 'Unauthorized access attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userPlan = session.user.plan || "free";

    log.info({ agentId, userId }, 'Message request received');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RATE LIMITING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const rateLimitResult = await checkRateLimit(userId, userPlan);
    if (!rateLimitResult.success) {
      log.warn({ userId, userPlan }, 'Rate limit exceeded');
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          limit: rateLimitResult.limit,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "0",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.reset?.toString() || "0",
          },
        }
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // QUOTA CHECK
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const quotaCheck = await canUseResource(userId, "message");
    if (!quotaCheck.allowed) {
      log.warn({ userId, quota: quotaCheck }, 'Message quota exceeded');
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          current: quotaCheck.current,
          limit: quotaCheck.limit,
          upgrade: "/pricing",
        },
        { status: 403 }
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INPUT VALIDATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const body = await req.json();
    const validation = messageInputSchema.safeParse(body);

    if (!validation.success) {
      log.warn({ errors: validation.error.errors }, 'Invalid input data');
      return NextResponse.json(
        formatZodError(validation.error),
        { status: 400 }
      );
    }

    const { content, messageType, metadata } = validation.data;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MESSAGE PROCESSING (Service Layer)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const result = await messageService.processMessage({
      agentId,
      userId,
      content,
      messageType,
      metadata,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // TRACK USAGE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await trackUsage(userId, "message", 1, result.assistantMessage.id, {
      agentId,
      tokensUsed: result.usage.tokensUsed,
    });

    log.info(
      {
        agentId,
        userId,
        messageId: result.assistantMessage.id,
        tokensUsed: result.usage.tokensUsed,
      },
      'Message processed successfully'
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RESPONSE
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
    }, {
      headers: {
        "X-RateLimit-Limit": rateLimitResult.limit?.toString() || "0",
        "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
      },
    });

  } catch (error) {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ERROR HANDLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // Handle validation errors
    if (error instanceof ZodError) {
      log.warn({ errors: error.errors }, 'Validation error');
      return NextResponse.json(
        formatZodError(error),
        { status: 400 }
      );
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        log.warn({ error: error.message }, 'Resource not found');
        return NextResponse.json(
          { error: "Agent or relation not found" },
          { status: 404 }
        );
      }

      if (error.code === 'P2002') {
        log.warn({ error: error.message }, 'Unique constraint violation');
        return NextResponse.json(
          { error: "Duplicate resource" },
          { status: 409 }
        );
      }
    }

    // Handle generic errors
    logError(error, { context: 'Message processing failed' });

    return NextResponse.json(
      {
        error: "Failed to process message",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
