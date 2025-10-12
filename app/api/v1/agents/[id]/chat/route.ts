import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { EmotionalEngine } from "@/lib/relations/engine";
import { withAPIAuth } from "@/lib/api/auth";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";

/**
 * @swagger
 * /api/v1/agents/{id}/chat:
 *   post:
 *     summary: Send message to agent
 *     description: Send a message to an agent and receive a response with emotional analysis
 *     tags: [Chat]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: Hello! How are you today?
 *     responses:
 *       200:
 *         description: Agent response with emotional state
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                 emotions:
 *                   type: array
 *                   items:
 *                     type: string
 *                 relationLevel:
 *                   type: string
 *                 state:
 *                   type: object
 *                   properties:
 *                     trust:
 *                       type: number
 *                     affinity:
 *                       type: number
 *                     respect:
 *                       type: number
 *                 usage:
 *                   type: object
 *                   properties:
 *                     messagesRemaining:
 *                       type: number
 *                     tokensUsed:
 *                       type: number
 *       403:
 *         description: Message quota exceeded
 *       404:
 *         description: Agent not found
 *       429:
 *         description: Rate limit exceeded
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAPIAuth(req, async (userId) => {
    const { id: agentId } = await params;

    // Check message quota
    const quotaCheck = await canUseResource(userId, "message");
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        {
          error: quotaCheck.reason,
          current: quotaCheck.current,
          limit: quotaCheck.limit,
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      );
    }

    // Get agent
    const agent = await prisma.agent.findFirst({
      where: { id: agentId, userId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Save user message
    await prisma.message.create({
      data: {
        agentId,
        userId,
        role: "user",
        content: message,
      },
    });

    // Get or create relation
    let relation = await prisma.relation.findFirst({
      where: {
        subjectId: agentId,
        targetId: userId,
        targetType: "user",
      },
    });

    if (!relation) {
      relation = await prisma.relation.create({
        data: {
          subjectId: agentId,
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

    // Analyze emotion
    const currentState = {
      valence: 0.5,
      arousal: 0.5,
      dominance: 0.5,
      trust: relation.trust,
      affinity: relation.affinity,
      respect: relation.respect,
      love: (relation.privateState as { love?: number }).love || 0,
      curiosity: (relation.privateState as { curiosity?: number }).curiosity || 0,
    };

    const newState = EmotionalEngine.analyzeMessage(message, currentState);

    // Update relation
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

    // Get recent messages
    const recentMessages = await prisma.message.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Adjust prompt
    const adjustedPrompt = EmotionalEngine.adjustPromptForEmotion(
      agent.systemPrompt,
      newState
    );

    // Generate response
    const llm = getLLMProvider();
    const response = await llm.generate({
      systemPrompt: adjustedPrompt,
      messages: recentMessages.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const estimatedTokens = Math.ceil((message.length + response.length) / 4);

    // Save response
    await prisma.message.create({
      data: {
        agentId,
        role: "assistant",
        content: response,
        metadata: {
          emotions: EmotionalEngine.getVisibleEmotions(newState),
          relationLevel: EmotionalEngine.getRelationshipLevel(newState),
          tokensUsed: estimatedTokens,
        },
      },
    });

    // Track usage
    await Promise.all([
      trackUsage(userId, "message", 1, agentId, {
        agentName: agent.name,
        contentLength: message.length,
        responseLength: response.length,
      }),
      trackUsage(userId, "tokens", estimatedTokens, agentId, {
        model: "gemini",
        agentId,
      }),
    ]);

    return NextResponse.json({
      response,
      emotions: EmotionalEngine.getVisibleEmotions(newState),
      relationLevel: EmotionalEngine.getRelationshipLevel(newState),
      state: {
        trust: newState.trust,
        affinity: newState.affinity,
        respect: newState.respect,
      },
      usage: {
        messagesRemaining:
          quotaCheck.limit === -1
            ? "unlimited"
            : quotaCheck.limit! - quotaCheck.current! - 1,
        tokensUsed: estimatedTokens,
      },
    });
  });
}
