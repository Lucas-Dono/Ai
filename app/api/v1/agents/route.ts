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

    // Get user's plan/tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true }
    });

    // Map user plan to generation tier
    const tier = (user?.plan || 'free') as 'free' | 'plus' | 'ultra';

    // Generate profile with LLM using user's tier
    const llm = getLLMProvider();
    const { profile, systemPrompt } = await llm.generateProfile({
      name,
      kind,
      personality,
      purpose,
      tone,
    }, tier);

    // Extract location from profile (for real-time weather system)
    let locationCity = null;
    let locationCountry = null;

    if (profile.currentLocation) {
      // LLM generates currentLocation in the profile
      locationCity = profile.currentLocation.city;
      locationCountry = profile.currentLocation.country;
    } else if (profile.background?.birthplace) {
      // Fallback to birthplace if no current location
      locationCity = profile.background.birthplace.city;
      locationCountry = profile.background.birthplace.country;
    }

    // Create agent with tier information
    const agent = await prisma.agent.create({
      data: {
        userId,
        kind,
        generationTier: tier, // Store which tier was used to generate this agent
        name,
        description: personality || purpose,
        personality,
        purpose,
        tone,
        profile: profile as Record<string, string | number | boolean | null>,
        systemPrompt,
        visibility: "private",
        locationCity, // For real-time weather system
        locationCountry, // For real-time weather system
      },
    });

    // For ULTRA tier: Create the exclusive psychological profiles
    if (tier === 'ultra' && profile.psychologicalProfile) {
      await prisma.psychologicalProfile.create({
        data: {
          agentId: agent.id,
          attachmentStyle: profile.psychologicalProfile.attachmentStyle || 'secure',
          attachmentDescription: profile.psychologicalProfile.attachmentDescription,
          primaryCopingMechanisms: profile.psychologicalProfile.primaryCopingMechanisms || [],
          unhealthyCopingMechanisms: profile.psychologicalProfile.unhealthyCopingMechanisms || [],
          copingTriggers: profile.psychologicalProfile.copingTriggers || [],
          emotionalRegulationBaseline: profile.psychologicalProfile.emotionalRegulationBaseline || 'estable',
          emotionalExplosiveness: profile.psychologicalProfile.emotionalExplosiveness || 30,
          emotionalRecoverySpeed: profile.psychologicalProfile.emotionalRecoverySpeed || 'moderado',
          mentalHealthConditions: profile.psychologicalProfile.mentalHealthConditions || [],
          therapyStatus: profile.psychologicalProfile.therapyStatus,
          medicationUse: profile.psychologicalProfile.medicationUse || false,
          mentalHealthStigma: profile.psychologicalProfile.mentalHealthStigma,
          defenseMethanisms: profile.psychologicalProfile.defenseMethanisms || {},
          traumaHistory: profile.psychologicalProfile.traumaHistory,
          resilienceFactors: profile.psychologicalProfile.resilienceFactors || [],
          selfAwarenessLevel: profile.psychologicalProfile.selfAwarenessLevel || 50,
          blindSpots: profile.psychologicalProfile.blindSpots || [],
          insightAreas: profile.psychologicalProfile.insightAreas || [],
        },
      });
    }

    if (tier === 'ultra' && profile.deepRelationalPatterns) {
      await prisma.deepRelationalPatterns.create({
        data: {
          agentId: agent.id,
          givingLoveLanguages: profile.deepRelationalPatterns.givingLoveLanguages || [],
          receivingLoveLanguages: profile.deepRelationalPatterns.receivingLoveLanguages || [],
          loveLanguageIntensities: profile.deepRelationalPatterns.loveLanguageIntensities || {},
          repeatingPatterns: profile.deepRelationalPatterns.repeatingPatterns || [],
          whyRepeats: profile.deepRelationalPatterns.whyRepeats,
          awarenessOfPatterns: profile.deepRelationalPatterns.awarenessOfPatterns || 'inconsciente',
          personalBoundaryStyle: profile.deepRelationalPatterns.personalBoundaryStyle || 'saludable',
          professionalBoundaryStyle: profile.deepRelationalPatterns.professionalBoundaryStyle || 'saludable',
          boundaryEnforcement: profile.deepRelationalPatterns.boundaryEnforcement || 50,
          boundaryGuilty: profile.deepRelationalPatterns.boundaryGuilty || false,
          conflictStyle: profile.deepRelationalPatterns.conflictStyle || 'colaborativo',
          conflictTriggers: profile.deepRelationalPatterns.conflictTriggers || [],
          healthyConflictSkills: profile.deepRelationalPatterns.healthyConflictSkills || [],
          unhealthyConflictPatterns: profile.deepRelationalPatterns.unhealthyConflictPatterns || [],
          trustBaseline: profile.deepRelationalPatterns.trustBaseline || 50,
          vulnerabilityComfort: profile.deepRelationalPatterns.vulnerabilityComfort || 50,
          trustRepairAbility: profile.deepRelationalPatterns.trustRepairAbility || 50,
          intimacyComfort: profile.deepRelationalPatterns.intimacyComfort || {},
          intimacyFears: profile.deepRelationalPatterns.intimacyFears || [],
          intimacyNeeds: profile.deepRelationalPatterns.intimacyNeeds || [],
          socialMaskLevel: profile.deepRelationalPatterns.socialMaskLevel || 30,
          authenticityByContext: profile.deepRelationalPatterns.authenticityByContext || {},
          socialEnergy: profile.deepRelationalPatterns.socialEnergy || 'neutral',
        },
      });
    }

    if (tier === 'ultra' && profile.philosophicalFramework) {
      await prisma.philosophicalFramework.create({
        data: {
          agentId: agent.id,
          optimismLevel: profile.philosophicalFramework.optimismLevel || 50,
          worldviewType: profile.philosophicalFramework.worldviewType,
          meaningSource: profile.philosophicalFramework.meaningSource,
          existentialStance: profile.philosophicalFramework.existentialStance,
          politicalLeanings: profile.philosophicalFramework.politicalLeanings,
          politicalEngagement: profile.philosophicalFramework.politicalEngagement || 30,
          activismLevel: profile.philosophicalFramework.activismLevel || 20,
          socialJusticeStance: profile.philosophicalFramework.socialJusticeStance,
          ethicalFramework: profile.philosophicalFramework.ethicalFramework,
          moralComplexity: profile.philosophicalFramework.moralComplexity || 50,
          moralRigidity: profile.philosophicalFramework.moralRigidity || 50,
          moralDilemmas: profile.philosophicalFramework.moralDilemmas,
          religiousBackground: profile.philosophicalFramework.religiousBackground,
          currentBeliefs: profile.philosophicalFramework.currentBeliefs,
          spiritualPractices: profile.philosophicalFramework.spiritualPractices || [],
          faithImportance: profile.philosophicalFramework.faithImportance || 30,
          lifePhilosophy: profile.philosophicalFramework.lifePhilosophy,
          coreBeliefs: profile.philosophicalFramework.coreBeliefs || [],
          dealbreakers: profile.philosophicalFramework.dealbreakers || [],
          personalMotto: profile.philosophicalFramework.personalMotto,
          epistomologyStance: profile.philosophicalFramework.epistomologyStance,
          scienceTrustLevel: profile.philosophicalFramework.scienceTrustLevel || 70,
          intuitionVsLogic: profile.philosophicalFramework.intuitionVsLogic || 50,
          growthMindset: profile.philosophicalFramework.growthMindset || 60,
          opennessToChange: profile.philosophicalFramework.opennessToChange || 50,
          philosophicalEvolution: profile.philosophicalFramework.philosophicalEvolution,
        },
      });
    }

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
