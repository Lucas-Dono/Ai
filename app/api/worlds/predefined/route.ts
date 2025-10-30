/**
 * Predefined Worlds API
 * GET /api/worlds/predefined - Lista todos los mundos predefinidos disponibles
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/Predefined');

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get('category');
    const difficulty = req.nextUrl.searchParams.get('difficulty');
    const featured = req.nextUrl.searchParams.get('featured');

    log.info({ category, difficulty, featured }, 'Listing predefined worlds');

    // Construir filtros
    const where: any = { isPredefined: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;
    if (featured === 'true') where.featured = true;

    const worlds = await prisma.world.findMany({
      where,
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
        },
        simulationState: true,
        _count: {
          select: {
            messages: true,
            interactions: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      worlds: worlds.map(world => ({
        id: world.id,
        name: world.name,
        description: world.description,
        scenario: world.scenario,
        category: world.category,
        difficulty: world.difficulty,
        featured: world.featured,
        isPredefined: world.isPredefined,
        agentCount: world.worldAgents.length,
        agents: world.worldAgents.map(wa => ({
          id: wa.agent.id,
          name: wa.agent.name,
          description: wa.agent.description,
          avatar: wa.agent.avatar,
          kind: wa.agent.kind,
          gender: wa.agent.gender,
          role: wa.role,
        })),
        messageCount: world._count.messages,
        interactionCount: world._count.interactions,
        createdAt: world.createdAt,
      })),
      categories: await getCategories(),
      difficulties: ['beginner', 'intermediate', 'advanced'],
    });
  } catch (error) {
    log.error({ error }, 'Error listing predefined worlds');
    return NextResponse.json(
      { error: 'Failed to list predefined worlds' },
      { status: 500 }
    );
  }
}

async function getCategories() {
  const result = await prisma.world.findMany({
    where: { isPredefined: true },
    select: { category: true },
    distinct: ['category'],
  });

  return result
    .map(r => r.category)
    .filter(Boolean) as string[];
}
