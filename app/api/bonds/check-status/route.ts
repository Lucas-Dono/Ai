import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/bonds/check-status
 * Verificar el estado del bond entre un usuario y un agente
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      );
    }

    // Check if user has an active bond with this agent
    const existingBond = await prisma.symbolicBond.findFirst({
      where: {
        userId: session.user.id,
        agentId,
        status: { in: ["active", "dormant", "fragile", "at_risk"] },
      },
      select: {
        id: true,
        tier: true,
        affinityLevel: true,
        rarityTier: true,
        status: true,
        daysInactive: true,
        lastInteraction: true,
      },
    });

    if (existingBond) {
      return NextResponse.json({
        hasBond: true,
        bondId: existingBond.id,
        tier: existingBond.tier,
        affinityLevel: existingBond.affinityLevel,
        rarityTier: existingBond.rarityTier,
        status: existingBond.status,
        daysInactive: existingBond.daysInactive,
      });
    }

    // Check if bond can be established
    // Get agent's bond configuration
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        bondConfig: true,
        symbolicBonds: {
          where: { status: "active" },
          select: { tier: true },
        },
      },
    });

    if (!agent || !agent.bondConfig) {
      return NextResponse.json({
        hasBond: false,
        canEstablish: false,
        reason: "Este agente no tiene vínculos simbólicos habilitados",
      });
    }

    const config = agent.bondConfig as any;
    const tiers = config.tiers || {};

    // Check each tier to see if there's availability
    let canEstablishAny = false;
    let reason = "Todos los tipos de vínculo están llenos";

    for (const [tierName, tierConfig] of Object.entries(tiers) as any) {
      if (!tierConfig.enabled) continue;

      const currentSlots = agent.symbolicBonds.filter(
        (b) => b.tier === tierName
      ).length;

      if (currentSlots < tierConfig.maxSlots) {
        canEstablishAny = true;
        reason = `Disponible: ${tierName.replace(/_/g, " ")}`;
        break;
      }
    }

    // Check if user is in queue
    const queuePosition = await prisma.bondQueuePosition.findFirst({
      where: {
        userId: session.user.id,
        agentId,
      },
      select: {
        position: true,
        tier: true,
      },
    });

    return NextResponse.json({
      hasBond: false,
      canEstablish: canEstablishAny,
      reason,
      inQueue: !!queuePosition,
      queuePosition: queuePosition?.position,
      queueTier: queuePosition?.tier,
    });
  } catch (error: any) {
    console.error("[API] Error checking bond status:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
