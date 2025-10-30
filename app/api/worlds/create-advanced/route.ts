/**
 * Create World - Advanced Mode
 * POST /api/worlds/create-advanced - Crea un mundo con configuración manual completa
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación
const createAdvancedWorldSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  scenario: z.string().min(1).max(2000),
  format: z.enum(['chat', 'visual_novel']),
  visibility: z.enum(['private', 'public']),
  autoMode: z.boolean(),
  turnsPerCycle: z.number().int().min(1).max(10),
  agentIds: z.array(z.string()).min(1).max(20),
  events: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    triggerType: z.enum(['automatic', 'manual', 'progress']),
    requiredProgress: z.number().optional(),
  })).optional(),
  storyScript: z.object({
    title: z.string(),
    genre: z.string(),
    totalActs: z.number().int(),
  }).optional(),
});

// Timeout de 60 segundos
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Autenticación
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parsear y validar body
    const body = await req.json();
    const validation = createAdvancedWorldSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      scenario,
      format,
      visibility,
      autoMode,
      turnsPerCycle,
      agentIds,
      events,
      storyScript,
    } = validation.data;

    console.log('[API/CreateAdvanced] Creating world:', name);
    console.log('[API/CreateAdvanced] Format:', format);
    console.log('[API/CreateAdvanced] Agents:', agentIds.length);

    const isStoryMode = format === 'visual_novel';

    // Verificar que todos los agentes existen y pertenecen al usuario o son públicos
    const agents = await prisma.agent.findMany({
      where: {
        id: { in: agentIds },
        OR: [
          { userId: user.id },
          { userId: null, visibility: 'public' },
        ],
      },
    });

    if (agents.length !== agentIds.length) {
      return NextResponse.json(
        {
          success: false,
          error: 'Algunos agentes no existen o no tienes acceso a ellos',
        },
        { status: 400 }
      );
    }

    // Crear el mundo en la base de datos
    const world = await prisma.world.create({
      data: {
        name,
        description,
        scenario,
        userId: user.id,
        isPublic: visibility === 'public',
        status: 'PAUSED',

        // Configuraciones
        autoMode,
        turnsPerCycle,
        currentTurn: 0,
        currentCycle: 0,

        // Modo historia
        storyMode: isStoryMode,
        currentProgress: 0,

        // Metadata
        creationMode: 'advanced',
      },
    });

    console.log('[API/CreateAdvanced] World created:', world.id);

    // Vincular agentes existentes al mundo
    const worldAgentPromises = agentIds.map(async (agentId) => {
      await prisma.worldAgent.create({
        data: {
          worldId: world.id,
          agentId,
          role: 'participant',
          importanceLevel: 'main',
          joinedAt: new Date(),

          // Estado emocional inicial
          emotionalState: {
            joy: 0.5,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
            trust: 0.3,
          } as any,
        },
      });
    });

    await Promise.all(worldAgentPromises);
    console.log('[API/CreateAdvanced] Agents linked:', agentIds.length);

    // Crear eventos si es visual novel
    if (isStoryMode && events && events.length > 0) {
      const eventPromises = events.map(async (event) => {
        if (!event.name.trim()) return;

        await prisma.storyEvent.create({
          data: {
            worldId: world.id,
            eventType: 'story',
            eventName: event.name,
            description: event.description,
            triggerType: event.triggerType,
            requiredProgress: event.requiredProgress || 0,
            involvedCharacters: [],
          },
        });
      });

      await Promise.all(eventPromises);
      console.log('[API/CreateAdvanced] Events created:', events.length);
    }

    // Actualizar con story script si es visual novel
    if (isStoryMode && storyScript) {
      await prisma.world.update({
        where: { id: world.id },
        data: {
          worldSpec: {
            version: '1.0',
            creationMode: 'advanced',
            name,
            description,
            storyScript: {
              title: storyScript.title,
              genre: storyScript.genre,
              totalActs: storyScript.totalActs,
            },
          } as any,
        },
      });
      console.log('[API/CreateAdvanced] Story script configured');
    }

    return NextResponse.json({
      success: true,
      worldId: world.id,
    });
  } catch (error) {
    console.error('[API/CreateAdvanced] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create world',
      },
      { status: 500 }
    );
  }
}
