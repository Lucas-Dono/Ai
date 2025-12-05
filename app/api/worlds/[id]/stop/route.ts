/**
 * Stop World Simulation
 * POST /api/worlds/[id]/stop
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from '@/lib/prisma';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/Stop');

export async function POST(
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
    log.info({ userId, worldId }, 'Stopping world simulation');

    // Verify ownership or predefined world
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      select: { userId: true, isPredefined: true, status: true },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // Allow access if user owns the world OR if it's a predefined world
    if (world.userId !== userId && !world.isPredefined) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (world.status === 'STOPPED') {
      return NextResponse.json(
        { error: 'Simulation already stopped' },
        { status: 400 }
      );
    }

    // Stop simulation
    await worldSimulationEngine.stopSimulation(worldId);

    log.info({ userId, worldId }, 'Simulation stopped successfully');

    return NextResponse.json({
      success: true,
      message: 'Simulation stopped',
    });
  } catch (error) {
    log.error({ error }, 'Error stopping simulation');
    return NextResponse.json(
      {
        error: 'Failed to stop simulation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
