/**
 * Create World from AI Specification
 * POST /api/worlds/create-from-spec - Crea un mundo basado en una generación de IA
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helper';
import { prisma } from '@/lib/prisma';
import type { AIWorldGeneration, WorldFormat, WorldSpec } from '@/lib/worlds/types';
import { getTemplateById } from '@/lib/worlds/templates';
import { z } from 'zod';

// Schema de validación
const createWorldSchema = z.object({
  worldName: z.string().min(1).max(100),
  format: z.enum(['chat', 'visual_novel']),
  templateId: z.string(),
  generation: z.object({
    scenario: z.string(),
    initialContext: z.string(),
    suggestedAgents: z.array(z.any()),
    suggestedEvents: z.array(z.any()).optional(),
    storyScript: z.any().optional(),
    tips: z.array(z.string()).optional(),
    existingAgentIds: z.array(z.string()).optional(), // IDs de agentes existentes
  }),
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
    const validation = createWorldSchema.safeParse(body);

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

    const { worldName, format, templateId, generation } = validation.data;
    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    console.log('[API/CreateWorld] Creating world:', worldName);
    console.log('[API/CreateWorld] Template:', template.name);
    console.log('[API/CreateWorld] Format:', format);

    // Verificar tier del usuario para visual novels
    const userTier = (user as any).tier || 'free';
    if (format === 'visual_novel' && userTier === 'free') {
      return NextResponse.json(
        { success: false, error: 'Visual novels require PRO tier' },
        { status: 403 }
      );
    }

    // Construir WorldSpec
    const isStoryMode = format === 'visual_novel';
    const worldSpec: WorldSpec = {
      version: '1.0',
      creationMode: 'simple',
      name: worldName,
      description: generation.scenario,

      simulation: {
        autoMode: isStoryMode,
        turnsPerCycle: isStoryMode ? 1 : 3,
        interactionDelay: 5000,
        allowEmotionalBonds: true,
        allowConflicts: true,
      },

      visibility: 'private',

      storyMode: isStoryMode,
      storyScript: generation.storyScript,

      characters: generation.suggestedAgents.map((agent, idx) => ({
        createNew: {
          name: agent.name,
          gender: agent.personality?.gender || 'unknown',
          description: agent.description,
          systemPrompt: `Eres ${agent.name}. ${agent.description}`,
          importanceLevel: agent.importanceLevel,
          role: agent.role,
          personality: {
            openness: agent.personality?.openness || 0.5,
            conscientiousness: agent.personality?.conscientiousness || 0.5,
            extraversion: agent.personality?.extraversion || 0.5,
            agreeableness: agent.personality?.agreeableness || 0.5,
            neuroticism: agent.personality?.neuroticism || 0.5,
            coreValues: agent.personality?.coreValues || [],
            traits: agent.personality?.traits || [],
          },
          initialEmotionalState: {
            joy: 0.5,
            sadness: 0,
            anger: 0,
            fear: 0,
            surprise: 0,
            trust: 0.3,
          },
        },
      })),

      events: generation.suggestedEvents || [],

      metadata: {
        templateId,
        templateName: template.name,
        genre: template.tags[0] || 'general',
        createdAt: new Date().toISOString(),
      },
    };

    // Crear el mundo en la base de datos
    const world = await prisma.world.create({
      data: {
        name: worldName,
        description: generation.scenario,
        scenario: generation.scenario,
        userId: user.id,
        isPublic: false,
        status: 'PAUSED',

        // Configuraciones basadas en el formato
        autoMode: isStoryMode,
        turnsPerCycle: isStoryMode ? 1 : 3,
        currentTurn: 0,
        currentCycle: 0,

        // Modo historia
        storyMode: isStoryMode,
        currentProgress: 0,

        // Guardar especificación completa
        worldSpec: worldSpec as any,
        creationMode: 'simple',
      },
    });

    console.log('[API/CreateWorld] World created:', world.id);

    // Crear o vincular agentes
    const useExistingAgents = generation.existingAgentIds && generation.existingAgentIds.length > 0;

    if (useExistingAgents) {
      // Modo: Usar agentes existentes
      console.log('[API/CreateWorld] Using existing agents:', generation.existingAgentIds);

      const agentPromises = generation.existingAgentIds!.map(async (agentId) => {
        // Verificar que el agente existe y pertenece al usuario
        const agent = await prisma.agent.findFirst({
          where: {
            id: agentId,
            userId: user.id,
          },
        });

        if (!agent) {
          console.warn('[API/CreateWorld] Agent not found or unauthorized:', agentId);
          return null;
        }

        // Crear WorldAgent (relación mundo-agente)
        await prisma.worldAgent.create({
          data: {
            worldId: world.id,
            agentId: agent.id,
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

        return agent;
      });

      await Promise.all(agentPromises);
      console.log('[API/CreateWorld] Linked existing agents');
    } else {
      // Modo: Crear nuevos agentes desde generación de IA
      console.log('[API/CreateWorld] Creating new agents from AI generation');

      const agentPromises = generation.suggestedAgents.map(async (agentSpec) => {
        const agent = await prisma.agent.create({
          data: {
            name: agentSpec.name,
            description: agentSpec.description,
            userId: user.id,
            isPublic: false,

            // Personalidad básica
            systemPrompt: `Eres ${agentSpec.name}. ${agentSpec.description}\n\nRol: ${agentSpec.role}`,
            voiceId: null,
            temperature: 0.8,
            maxTokens: 500,
          },
        });

        // Crear WorldAgent (relación mundo-agente)
        await prisma.worldAgent.create({
          data: {
            worldId: world.id,
            agentId: agent.id,
            role: agentSpec.role,
            importanceLevel: agentSpec.importanceLevel || 'secondary',
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

        return agent;
      });

      await Promise.all(agentPromises);
      console.log('[API/CreateWorld] Created new agents:', generation.suggestedAgents.length);
    }

    // Crear eventos de historia si es visual novel
    if (isStoryMode && generation.suggestedEvents && generation.suggestedEvents.length > 0) {
      const eventPromises = generation.suggestedEvents.map(async (event, idx) => {
        await prisma.storyEvent.create({
          data: {
            worldId: world.id,
            eventType: event.eventType || 'story',
            eventName: event.name,
            description: event.description,
            triggerType: event.triggerType || 'automatic',
            requiredProgress: event.requiredProgress || 0,
            involvedCharacters: [],
          },
        });
      });

      await Promise.all(eventPromises);
      console.log('[API/CreateWorld] Events created:', generation.suggestedEvents.length);
    }

    // Crear arcos de personajes principales (si es visual novel)
    if (isStoryMode) {
      const mainCharacters = generation.suggestedAgents.filter(
        (agent) => agent.importanceLevel === 'main'
      );

      const arcPromises = mainCharacters.map(async (agentSpec, idx) => {
        const agent = await prisma.agent.findFirst({
          where: {
            name: agentSpec.name,
            userId: user.id,
          },
        });

        if (agent) {
          await prisma.characterArc.create({
            data: {
              worldId: world.id,
              agentId: agent.id,
              arcName: `Arco de ${agentSpec.name}`,
              arcType: 'personal_growth',
              description: `Desarrollo del personaje ${agentSpec.name} a lo largo de la historia`,
              milestones: [
                {
                  name: 'Introducción',
                  description: `Conocemos a ${agentSpec.name}`,
                  progress: 0,
                },
                {
                  name: 'Desarrollo',
                  description: `${agentSpec.name} enfrenta desafíos`,
                  progress: 0.5,
                },
                {
                  name: 'Resolución',
                  description: `El arco de ${agentSpec.name} concluye`,
                  progress: 1,
                },
              ],
            },
          });
        }
      });

      await Promise.all(arcPromises);
      console.log('[API/CreateWorld] Character arcs created:', mainCharacters.length);
    }

    return NextResponse.json({
      success: true,
      worldId: world.id,
      message: 'World created successfully',
    });
  } catch (error) {
    console.error('[API/CreateWorld] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create world',
      },
      { status: 500 }
    );
  }
}
