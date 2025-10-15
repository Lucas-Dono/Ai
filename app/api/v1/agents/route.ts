import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { withAPIAuth } from "@/lib/api/auth";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: List all agents
 *     description: Get a list of all agents owned by the authenticated user
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kind
 *         schema:
 *           type: string
 *           enum: [companion, assistant]
 *         description: Filter by agent type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Number of agents to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of agents to skip
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(req: NextRequest) {
  return withAPIAuth(req, async (userId) => {
    const { searchParams } = req.nextUrl;
    const kind = searchParams.get("kind");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: { userId: string; kind?: string } = { userId };
    if (kind) where.kind = kind;

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.agent.count({ where }),
    ]);

    return NextResponse.json({
      agents,
      total,
      limit,
      offset,
    });
  });
}

/**
 * @swagger
 * /api/v1/agents:
 *   post:
 *     summary: Create a new agent
 *     description: Create a new AI agent (companion or assistant)
 *     tags: [Agents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - kind
 *             properties:
 *               name:
 *                 type: string
 *                 example: Luna
 *               kind:
 *                 type: string
 *                 enum: [companion, assistant]
 *                 example: companion
 *               personality:
 *                 type: string
 *                 example: Friendly, empathetic, patient
 *               purpose:
 *                 type: string
 *                 example: Provide emotional support
 *               tone:
 *                 type: string
 *                 example: Warm and caring
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 *       400:
 *         description: Bad request
 *       403:
 *         description: Agent quota exceeded
 *       429:
 *         description: Rate limit exceeded
 */
export async function POST(req: NextRequest) {
  return withAPIAuth(req, async (userId) => {
    // Check agent quota
    const quotaCheck = await canUseResource(userId, "agent");
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
    const { name, kind, personality, purpose, tone } = body;

    if (!name || !kind) {
      return NextResponse.json(
        { error: "name and kind are required" },
        { status: 400 }
      );
    }

    if (!["companion", "assistant"].includes(kind)) {
      return NextResponse.json(
        { error: "kind must be 'companion' or 'assistant'" },
        { status: 400 }
      );
    }

    // Generate profile with LLM
    const llm = getLLMProvider();
    const { profile, systemPrompt } = await llm.generateProfile({
      name,
      kind,
      personality,
      purpose,
      tone,
    });

    // Create agent
    const agent = await prisma.agent.create({
      data: {
        userId,
        kind,
        name,
        description: personality || purpose,
        personality,
        purpose,
        tone,
        profile: profile as Record<string, string | number | boolean | null>,
        systemPrompt,
        visibility: "private",
      },
    });

    // Create initial relation
    await prisma.relation.create({
      data: {
        subjectId: agent.id,
        targetId: userId,
        targetType: "user",
        trust: 0.5,
        affinity: 0.5,
        respect: 0.5,
        privateState: { love: 0, curiosity: 0 },
        visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
      },
    });

    // Track usage
    await trackUsage(userId, "agent", 1, agent.id, {
      name: agent.name,
      kind: agent.kind,
    });

    return NextResponse.json(agent, { status: 201 });
  });
}
