/**
 * API: Agentes por Vibe
 * GET /api/vibes/agents - Obtener agentes agrupados por vibe con ordenamiento personalizado
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_VIBE_ORDER, type VibeType } from '@/lib/vibes/config';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id;

    // Obtener todos los agentes públicos (filtraremos por vibes en JS)
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
      take: 200
    });

    // Agrupar por vibe (asignar uno si no tiene)
    const agentsByVibe: Record<string, any[]> = {
      chaotic_energy: [],
      comfort_zone: [],
      love_connection: [],
      adventure: []
    };

    const vibeKeys = Object.keys(agentsByVibe);

    allAgents.forEach((agent, index) => {
      const aiFields = agent.aiGeneratedFields as any;
      let primaryVibe = aiFields?.vibes?.primary;

      // Si no tiene vibe, asignar uno basado en el hash del nombre para consistencia
      if (!primaryVibe || !agentsByVibe[primaryVibe]) {
        let hash = 0;
        for (let i = 0; i < agent.name.length; i++) {
          hash = agent.name.charCodeAt(i) + ((hash << 5) - hash);
        }
        primaryVibe = vibeKeys[Math.abs(hash) % vibeKeys.length];
      }

      agentsByVibe[primaryVibe].push(agent);
    });

    // Obtener orden óptimo según interacciones del usuario
    let orderedVibes: VibeType[];

    if (userId) {
      orderedVibes = await getOptimalVibeOrder(userId);
    } else {
      orderedVibes = DEFAULT_VIBE_ORDER;
    }

    return NextResponse.json({
      orderedVibes,
      agentsByVibe
    });
  } catch (error) {
    console.error('Error fetching agents by vibe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Obtener orden óptimo de vibes según interacciones del usuario
 */
async function getOptimalVibeOrder(userId: string): Promise<VibeType[]> {
  try {
    // Obtener últimas 50 interacciones del usuario
    const interactions = await prisma.userInteraction.findMany({
      where: {
        userId,
        itemType: 'agent'
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        itemId: true
      }
    });

    if (interactions.length === 0) {
      return DEFAULT_VIBE_ORDER;
    }

    // Obtener agentes de esas interacciones
    const agentIds = interactions.map(i => i.itemId);
    const agents = await prisma.agent.findMany({
      where: {
        id: { in: agentIds }
      },
      select: {
        id: true,
        aiGeneratedFields: true
      }
    });

    // Contar interacciones por vibe
    const vibeCount: Record<string, number> = {};

    agents.forEach(agent => {
      const aiFields = agent.aiGeneratedFields as any;
      const vibe = aiFields?.vibes?.primary;

      if (vibe) {
        vibeCount[vibe] = (vibeCount[vibe] || 0) + 1;
      }
    });

    // Ordenar por frecuencia
    const sortedVibes = Object.entries(vibeCount)
      .sort((a, b) => b[1] - a[1])
      .map(([vibe]) => vibe as VibeType);

    // Agregar vibes faltantes al final
    const allVibes: VibeType[] = ['chaotic_energy', 'comfort_zone', 'love_connection', 'adventure'];
    allVibes.forEach(vibe => {
      if (!sortedVibes.includes(vibe)) {
        sortedVibes.push(vibe);
      }
    });

    return sortedVibes;
  } catch (error) {
    console.error('Error calculating optimal vibe order:', error);
    return DEFAULT_VIBE_ORDER;
  }
}
