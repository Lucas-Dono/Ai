/**
 * API: Feed de Descubrimiento
 * GET /api/discovery/feed - Feed infinito con mix aleatorio de vibes, historias y nuevos
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;

    // Fetch all public agents (we'll filter in JS to avoid Prisma JSON filter issues)
    const allPublicAgents = await prisma.agent.findMany({
      where: {
        visibility: 'public'
      },
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        categories: true,
        generationTier: true,
        aiGeneratedFields: true,
        kind: true,
        createdAt: true,
        userId: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filter agents by category in JavaScript
    const vibeAgents = allPublicAgents.filter(agent => {
      const fields = agent.aiGeneratedFields as any;
      return fields?.vibes?.primary;
    });

    const storyAgents = allPublicAgents.filter(agent => {
      const fields = agent.aiGeneratedFields as any;
      return fields?.storyNiche?.type;
    });

    const newAgents = allPublicAgents.filter(agent => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return agent.userId && agent.createdAt >= thirtyDaysAgo;
    });

    // Calculate how many agents to take from each category based on page
    const skip = (page - 1) * pageSize;

    // Mix: 40% vibes, 30% stories, 30% new (8, 6, 6 agents per page)
    const vibeCount = 8;
    const storyCount = 6;
    const newCount = 6;

    // Get random samples from each category
    const shuffleArray = <T,>(array: T[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const selectedVibes = shuffleArray(vibeAgents).slice(0, vibeCount);
    const selectedStories = shuffleArray(storyAgents).slice(0, storyCount);
    const selectedNew = shuffleArray(newAgents).slice(0, newCount);

    // Combine and shuffle all selected agents
    const allAgents = [...selectedVibes, ...selectedStories, ...selectedNew];
    const shuffled = shuffleArray(allAgents);

    // Apply pagination
    const paginatedAgents = shuffled.slice(skip, skip + pageSize);

    return NextResponse.json({
      agents: paginatedAgents,
      page,
      hasMore: shuffled.length > skip + pageSize || allPublicAgents.length > (page * pageSize)
    });
  } catch (error) {
    console.error('Error fetching discovery feed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
