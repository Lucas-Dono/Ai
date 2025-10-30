/**
 * Clone World API
 * POST /api/worlds/[id]/clone - Clona un mundo predefinido para el usuario
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const log = createLogger('API/Worlds/Clone');

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
    log.info({ userId, worldId }, 'Cloning world');

    // Obtener el mundo original con todos sus datos
    const originalWorld = await prisma.world.findUnique({
      where: { id: worldId },
      include: {
        worldAgents: {
          include: {
            agent: {
              include: {
                personalityCore: true,
                internalState: true,
                semanticMemory: true,
              },
            },
          },
        },
      },
    });

    if (!originalWorld) {
      return NextResponse.json({ error: 'World not found' }, { status: 404 });
    }

    // Solo se pueden clonar mundos predefinidos
    if (!originalWorld.isPredefined) {
      return NextResponse.json(
        { error: 'Only predefined worlds can be cloned' },
        { status: 400 }
      );
    }

    log.info({ userId, worldId, worldName: originalWorld.name }, 'Cloning predefined world');

    // Crear una copia del mundo para el usuario
    const clonedWorld = await prisma.world.create({
      data: {
        userId,
        name: `${originalWorld.name} (Mi Copia)`,
        description: originalWorld.description,
        category: originalWorld.category,
        difficulty: originalWorld.difficulty,
        scenario: originalWorld.scenario,
        initialContext: originalWorld.initialContext,
        rules: originalWorld.rules as any,
        isPredefined: false, // Ya no es predefinido
        featured: false,
        visibility: 'private', // Las copias son privadas
        autoMode: originalWorld.autoMode,
        interactionDelay: originalWorld.interactionDelay,
        maxInteractions: originalWorld.maxInteractions,
        allowEmotionalBonds: originalWorld.allowEmotionalBonds,
        allowConflicts: originalWorld.allowConflicts,
        topicFocus: originalWorld.topicFocus,
        simulationState: {
          create: {
            currentTurn: 0,
            totalInteractions: 0,
          },
        },
      },
    });

    // Clonar los agentes y agregarlos al nuevo mundo
    for (const worldAgent of originalWorld.worldAgents) {
      const originalAgent = worldAgent.agent;

      // Crear una copia del agente para el usuario
      const clonedAgent = await prisma.agent.create({
        data: {
          userId,
          name: originalAgent.name,
          kind: originalAgent.kind,
          gender: originalAgent.gender,
          description: originalAgent.description,
          systemPrompt: originalAgent.systemPrompt,
          profile: originalAgent.profile as any,
          visibility: 'private', // Las copias de agentes son privadas
          // Clonar sistemas emocionales
          personalityCore: originalAgent.personalityCore ? {
            create: {
              openness: originalAgent.personalityCore.openness,
              conscientiousness: originalAgent.personalityCore.conscientiousness,
              extraversion: originalAgent.personalityCore.extraversion,
              agreeableness: originalAgent.personalityCore.agreeableness,
              neuroticism: originalAgent.personalityCore.neuroticism,
              coreValues: originalAgent.personalityCore.coreValues as any,
              moralSchemas: originalAgent.personalityCore.moralSchemas as any,
              backstory: originalAgent.personalityCore.backstory,
              baselineEmotions: originalAgent.personalityCore.baselineEmotions as any,
            },
          } : undefined,
          internalState: originalAgent.internalState ? {
            create: {
              currentEmotions: originalAgent.internalState.currentEmotions as any,
              moodValence: originalAgent.internalState.moodValence,
              moodArousal: originalAgent.internalState.moodArousal,
              moodDominance: originalAgent.internalState.moodDominance,
              activeGoals: originalAgent.internalState.activeGoals as any,
              conversationBuffer: originalAgent.internalState.conversationBuffer as any,
            },
          } : undefined,
          semanticMemory: originalAgent.semanticMemory ? {
            create: {
              userFacts: originalAgent.semanticMemory.userFacts as any,
              userPreferences: originalAgent.semanticMemory.userPreferences as any,
              relationshipStage: originalAgent.semanticMemory.relationshipStage,
            },
          } : undefined,
        },
      });

      // Agregar el agente clonado al mundo clonado
      await prisma.worldAgent.create({
        data: {
          worldId: clonedWorld.id,
          agentId: clonedAgent.id,
          role: worldAgent.role,
          isActive: worldAgent.isActive,
        },
      });

      log.debug({ agentId: clonedAgent.id, agentName: clonedAgent.name }, 'Agent cloned');
    }

    log.info({ userId, clonedWorldId: clonedWorld.id }, 'World cloned successfully');

    return NextResponse.json({
      success: true,
      world: {
        id: clonedWorld.id,
        name: clonedWorld.name,
        description: clonedWorld.description,
        category: clonedWorld.category,
        scenario: clonedWorld.scenario,
      },
    }, { status: 201 });
  } catch (error) {
    log.error({ error }, 'Error cloning world');
    return NextResponse.json(
      {
        error: 'Failed to clone world',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
