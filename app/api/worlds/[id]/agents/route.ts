/**
 * World Agents API
 * POST   /api/worlds/[id]/agents - Add agent to world
 * DELETE /api/worlds/[id]/agents?agentId=xxx - Remove agent from world
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from "@/lib/auth-server";
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';

const log = createLogger('API/Worlds/Agents');

const addAgentSchema = z.object({
  agentId: z.string().cuid(),
  role: z.string().max(50).optional(),
});

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
    const body = await req.json();

    const validation = addAgentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { agentId, role } = validation.data;
    log.info({ userId, worldId, agentId }, 'Adding agent to world');

    // Verify world ownership
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      select: { userId: true, status: true },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    if (world.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (world.status === 'RUNNING') {
      return NextResponse.json(
        { error: 'Cannot add agents while simulation is running' },
        { status: 400 }
      );
    }

    // Verify agent ownership
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      select: { userId: true, name: true },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (agent.userId !== userId) {
      return NextResponse.json({ error: 'Agent not owned by user' }, { status: 403 });
    }

    // Check if agent already in world
    const existing = await prisma.worldAgent.findUnique({
      where: {
        worldId_agentId: {
          worldId,
          agentId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Agent already in world' },
        { status: 400 }
      );
    }

    // Add agent to world
    const worldAgent = await prisma.worldAgent.create({
      data: {
        worldId,
        agentId,
        role,
        isActive: true,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            description: true,
            avatar: true,
            kind: true,
          },
        },
      },
    });

    log.info({ userId, worldId, agentId }, 'Agent added to world successfully');

    return NextResponse.json({
      success: true,
      agent: {
        id: worldAgent.agent.id,
        name: worldAgent.agent.name,
        description: worldAgent.agent.description,
        avatar: worldAgent.agent.avatar,
        kind: worldAgent.agent.kind,
        role: worldAgent.role,
        isActive: worldAgent.isActive,
        joinedAt: worldAgent.joinedAt,
      },
    }, { status: 201 });
  } catch (error) {
    log.error({ error }, 'Error adding agent to world');
    return NextResponse.json(
      { error: 'Failed to add agent to world' },
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
    const user = await getAuthenticatedUser(req);

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const agentId = req.nextUrl.searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'agentId query parameter required' },
        { status: 400 }
      );
    }

    log.info({ userId, worldId, agentId }, 'Removing agent from world');

    // Verify world ownership
    const world = await prisma.world.findUnique({
      where: { id: worldId },
      select: { userId: true, status: true },
    });

    if (!world) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    if (world.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (world.status === 'RUNNING') {
      return NextResponse.json(
        { error: 'Cannot remove agents while simulation is running' },
        { status: 400 }
      );
    }

    // Remove agent from world
    await prisma.worldAgent.delete({
      where: {
        worldId_agentId: {
          worldId,
          agentId,
        },
      },
    });

    log.info({ userId, worldId, agentId }, 'Agent removed from world successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error({ error }, 'Error removing agent from world');
    return NextResponse.json(
      { error: 'Failed to remove agent from world' },
      { status: 500 }
    );
  }
}
