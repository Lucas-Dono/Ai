/**
 * Start World Simulation
 * POST /api/worlds/[id]/start
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/Start');

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    log.info({ userId, worldId }, 'Starting world simulation');

    // Verify ownership or predefined world
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      select: {
        userId: true,
        isPredefined: true,
        status: true,
        _count: {
          select: { worldAgents: { where: { isActive: true } } },
        },
      },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // Allow access if user owns the world OR if it's a predefined world
    if (world.userId !== userId && !world.isPredefined) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar si realmente está corriendo en memoria
    const isActuallyRunning = worldSimulationEngine.isSimulationRunning(worldId);

    if (world.status === 'RUNNING' && isActuallyRunning) {
      return NextResponse.json(
        { error: 'Simulation already running' },
        { status: 400 }
      );
    }

    // Si el status dice RUNNING pero no está corriendo en memoria, resetear el status
    if (world.status === 'RUNNING' && !isActuallyRunning) {
      log.warn({ worldId }, 'World status was RUNNING but simulation not in memory, resetting status');
      await prisma.world.update({
        where: { id: worldId },
        data: { status: 'STOPPED' },
      });
    }

    if (world._count.worldAgents < 2) {
      return NextResponse.json(
        { error: 'World must have at least 2 active agents' },
        { status: 400 }
      );
    }

    // Start simulation
    await worldSimulationEngine.startSimulation(worldId);

    log.info({ userId, worldId }, 'Simulation started successfully');

    return NextResponse.json({
      success: true,
      message: 'Simulation started',
    });
  } catch (error) {
    log.error({ error }, 'Error starting simulation');
    return NextResponse.json(
      {
        error: 'Failed to start simulation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
