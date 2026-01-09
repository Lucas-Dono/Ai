/**
 * API: Agentes por Historia
 * GET /api/stories/agents - Obtener agentes históricos agrupados por nicho
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { StoryNicheType } from '@/lib/stories/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Obtener todos los agentes públicos (filtraremos por story niche en JS)
    const allAgents = await prisma.agent.findMany({
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
        kind: true
      },
      take: 100
    });

    // Filtrar solo agentes con story niche
    const agents = allAgents.filter(agent => {
      const fields = agent.aiGeneratedFields as any;
      return fields?.storyNiche?.type;
    });

    // Agrupar por nicho
    const agentsByStory: Record<string, any[]> = {
      war_figures: [],
      pop_culture: [],
      controversial: []
    };

    agents.forEach(agent => {
      const aiFields = agent.aiGeneratedFields as any;
      const nicheType = aiFields?.storyNiche?.type as StoryNicheType;

      if (nicheType && agentsByStory[nicheType]) {
        agentsByStory[nicheType].push(agent);
      }
    });

    return NextResponse.json({
      agentsByStory
    });
  } catch (error) {
    console.error('Error fetching agents by story:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
