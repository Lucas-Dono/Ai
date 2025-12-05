/**
 * World Interactions API
 * GET /api/worlds/[id]/interactions - Get world interactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/Interactions');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;
    const user = await getAuthenticatedUser(req);

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Parse query parameters
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const sinceTurn = req.nextUrl.searchParams.get('sinceTurn');

    log.info({ userId, worldId, limit, offset }, 'Getting world interactions');

    // Verify world access
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      select: { userId: true, isPredefined: true, visibility: true },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // Allow access if: user owns world, it's predefined, or it's not private
    const hasAccess =
      world.userId === userId ||
      world.isPredefined === true ||
      world.visibility !== 'private';

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build query
    const where: any = { worldId };
    if (sinceTurn) {
      where.turnNumber = { gte: parseInt(sinceTurn) };
    }

    // Get interactions
    const [interactions, totalCount] = await Promise.all([
      prisma.worldInteraction.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: Math.min(limit, 200), // Max 200
        skip: offset,
        select: {
          id: true,
          speakerId: true,
          targetId: true,
          content: true,
          interactionType: true,
          turnNumber: true,
          speakerEmotion: true,
          targetEmotion: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.worldInteraction.count({ where }),
    ]);

    // Get agent names for mapping
    const agentIds = Array.from(
      new Set(
        interactions.flatMap(i => [i.speakerId, i.targetId].filter(Boolean))
      )
    );

    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds as string[] } },
      select: { id: true, name: true, avatar: true },
    });

    const agentMap = new Map(agents.map(a => [a.id, a]));

    return NextResponse.json({
      interactions: interactions.map(interaction => ({
        id: interaction.id,
        speakerId: interaction.speakerId,
        speakerName: agentMap.get(interaction.speakerId)?.name || 'Unknown',
        speakerAvatar: agentMap.get(interaction.speakerId)?.avatar,
        targetId: interaction.targetId,
        targetName: interaction.targetId ? agentMap.get(interaction.targetId)?.name : null,
        content: interaction.content,
        interactionType: interaction.interactionType,
        turnNumber: interaction.turnNumber,
        speakerEmotion: interaction.speakerEmotion,
        targetEmotion: interaction.targetEmotion,
        metadata: interaction.metadata,
        createdAt: interaction.createdAt,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + interactions.length < totalCount,
      },
    });
  } catch (error) {
    log.error({ error }, 'Error getting world interactions');
    return NextResponse.json(
      { error: 'Failed to get interactions' },
      { status: 500 }
    );
  }
}
