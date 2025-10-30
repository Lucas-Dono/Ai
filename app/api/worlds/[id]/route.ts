/**
 * World Detail API
 *
 * GET    /api/worlds/[id] - Get world details
 * PUT    /api/worlds/[id] - Update world
 * DELETE /api/worlds/[id] - Delete world
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { worldSimulationEngine } from '@/lib/worlds/simulation-engine';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';

const log = createLogger('API/Worlds/Detail');

const updateWorldSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  scenario: z.string().max(2000).optional().nullable(),
  initialContext: z.string().max(2000).optional().nullable(),
  rules: z.any().optional().nullable(),
  visibility: z.enum(['private', 'public', 'shared']).optional(),
  autoMode: z.boolean().optional(),
  turnsPerCycle: z.number().int().min(1).max(10).optional(),
  interactionDelay: z.number().int().min(1000).max(60000).optional(),
  maxInteractions: z.number().int().min(1).max(1000).optional().nullable(),
  allowEmotionalBonds: z.boolean().optional(),
  allowConflicts: z.boolean().optional(),
  topicFocus: z.string().max(200).optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;

    // Use getAuthenticatedUser to support both NextAuth and JWT
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    log.info({ userId, worldId }, 'Getting world details');

    const world = await prisma.world.findUnique({
      where: { id: worldId },
      include: {
        worldAgents: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                description: true,
                avatar: true,
                kind: true,
                gender: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        simulationState: true,
        agentRelations: true,
        _count: {
          select: {
            messages: true,
            interactions: true,
          },
        },
      },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    if (world.userId !== userId && world.visibility === 'private') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isRunning = worldSimulationEngine.isSimulationRunning(worldId);

    // Sincronizar estado si hay desincronización
    if (world.status === 'RUNNING' && !isRunning) {
      log.warn({ worldId }, 'World status desynchronized, updating to STOPPED');
      await prisma.world.update({
        where: { id: worldId },
        data: { status: 'STOPPED' },
      });
      world.status = 'STOPPED';
    } else if (world.status === 'STOPPED' && isRunning) {
      log.warn({ worldId }, 'World status desynchronized, updating to RUNNING');
      await prisma.world.update({
        where: { id: worldId },
        data: { status: 'RUNNING' },
      });
      world.status = 'RUNNING';
    }

    return NextResponse.json({
      world: {
        id: world.id,
        name: world.name,
        description: world.description,
        scenario: world.scenario,
        initialContext: world.initialContext,
        rules: world.rules,
        status: world.status,
        visibility: world.visibility,
        autoMode: world.autoMode,
        turnsPerCycle: world.turnsPerCycle,
        interactionDelay: world.interactionDelay,
        maxInteractions: world.maxInteractions,
        allowEmotionalBonds: world.allowEmotionalBonds,
        allowConflicts: world.allowConflicts,
        topicFocus: world.topicFocus,
        agents: world.worldAgents.map(wa => ({
          id: wa.agent.id,
          name: wa.agent.name,
          description: wa.agent.description,
          avatar: wa.agent.avatar,
          kind: wa.agent.kind,
          gender: wa.agent.gender,
          role: wa.role,
          isActive: wa.isActive,
          totalInteractions: wa.totalInteractions,
          lastInteractionAt: wa.lastInteractionAt,
          joinedAt: wa.joinedAt,
        })),
        simulationState: world.simulationState ? {
          currentTurn: world.simulationState.currentTurn,
          totalInteractions: world.simulationState.totalInteractions,
          lastSpeakerId: world.simulationState.lastSpeakerId,
          recentTopics: world.simulationState.recentTopics,
          activeSpeakers: world.simulationState.activeSpeakers,
          statistics: world.simulationState.statistics,
          startedAt: world.simulationState.startedAt,
          pausedAt: world.simulationState.pausedAt,
        } : null,
        relations: world.agentRelations.map(rel => ({
          id: rel.id,
          subjectId: rel.subjectId,
          targetId: rel.targetId,
          trust: rel.trust,
          affinity: rel.affinity,
          respect: rel.respect,
          attraction: rel.attraction,
          stage: rel.stage,
          totalInteractions: rel.totalInteractions,
        })),
        messageCount: world._count.messages,
        interactionCount: world._count.interactions,
        isRunning,
        createdAt: world.createdAt,
        updatedAt: world.updatedAt,
      },
    });
  } catch (error) {
    log.error({ error }, 'Error getting world details');
    return NextResponse.json(
      { error: 'Failed to get world details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;

    // Use getAuthenticatedUser to support both NextAuth and JWT
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();

    const validation = updateWorldSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;
    log.info({ userId, worldId }, 'Updating world');

    const existing = await prisma.world.findUnique({
      where: { id: worldId },
      select: { userId: true, status: true, isPredefined: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // No se pueden editar mundos predefinidos
    if (existing.isPredefined) {
      return NextResponse.json(
        { error: 'Cannot edit predefined worlds' },
        { status: 403 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existing.status === 'RUNNING') {
      return NextResponse.json(
        { error: 'Cannot update world while simulation is running' },
        { status: 400 }
      );
    }

    const updateData: any = { ...data, updatedAt: new Date() };
    const world = await prisma.world.update({
      where: { id: worldId },
      data: updateData,
    });

    log.info({ userId, worldId }, 'World updated successfully');

    return NextResponse.json({ world });
  } catch (error) {
    log.error({ error }, 'Error updating world');
    return NextResponse.json(
      { error: 'Failed to update world' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: worldId } = await params;

    // Use getAuthenticatedUser to support both NextAuth and JWT
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    log.info({ userId, worldId }, 'Deleting world');

    const existing = await prisma.world.findUnique({
      where: { id: worldId },
      select: { userId: true, status: true, isPredefined: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // No se pueden eliminar mundos predefinidos
    if (existing.isPredefined) {
      return NextResponse.json(
        { error: 'Cannot delete predefined worlds' },
        { status: 403 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (existing.status === 'RUNNING') {
      await worldSimulationEngine.stopSimulation(worldId);
    }

    await prisma.world.delete({
      where: { id: worldId },
    });

    log.info({ userId, worldId }, 'World deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error({ error }, 'Error deleting world');
    return NextResponse.json(
      { error: 'Failed to delete world' },
      { status: 500 }
    );
  }
}
