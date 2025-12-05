/**
 * Reset World Status (Emergency endpoint)
 * POST /api/worlds/[id]/reset-status
 *
 * Fuerza el reset del status del mundo a STOPPED
 * Útil cuando hay desincronización entre el estado en memoria y la BD
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from '@/lib/prisma';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/ResetStatus');

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
    log.info({ userId, worldId }, 'Resetting world status');

    // Verify ownership or predefined world
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      select: {
        userId: true,
        isPredefined: true,
        status: true,
      },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // Allow access if user owns the world OR if it's a predefined world
    if (world.userId !== userId && !world.isPredefined) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Detener simulación si está corriendo en memoria
    const isRunning = worldSimulationEngine.isSimulationRunning(worldId);
    if (isRunning) {
      log.info({ worldId }, 'Stopping simulation in memory');
      await worldSimulationEngine.stopSimulation(worldId);
    }

    // Forzar status a STOPPED en la base de datos
    await prisma.world.update({
      where: { id: worldId },
      data: { status: 'STOPPED' },
    });

    log.info({ userId, worldId }, 'World status reset successfully');

    return NextResponse.json({
      success: true,
      message: 'World status reset to STOPPED',
    });
  } catch (error) {
    log.error({ error }, 'Error resetting world status');
    return NextResponse.json(
      {
        error: 'Failed to reset status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
