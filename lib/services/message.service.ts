/**
 * Message Service
 *
 * Handles all message-related business logic with optimized database queries
 * Eliminates N+1 query problems by using strategic includes and parallel queries
 */

import { prisma } from '@/lib/prisma';
import { getLLMProvider } from '@/lib/llm/provider';
import { createMemoryManager } from '@/lib/memory/manager';
import { behaviorOrchestrator } from '@/lib/behavior-system';
import { hybridEmotionalOrchestrator } from '@/lib/emotional-system/hybrid-orchestrator';
import { getRelationshipStage, shouldAdvanceStage } from '@/lib/relationship/stages';
import { getPromptForStage, getPromptForMessageNumber } from '@/lib/relationship/prompt-generator';
import { getEmotionalSummary } from '@/lib/emotions/system';
import { interceptKnowledgeCommand, buildExpandedPrompt, logCommandUsage } from '@/lib/profile/knowledge-interceptor';
import { getTopRelevantCommand } from '@/lib/profile/command-detector';
import { getKnowledgeGroup } from '@/lib/profile/knowledge-retrieval';
import { buildTemporalPrompt } from '@/lib/context/temporal';
import { interceptRememberCommands, buildReminderContext } from '@/lib/events/remember-interceptor';
import { interceptPersonCommands, buildPeopleContext } from '@/lib/people/person-interceptor';
import { getUserWeather, buildWeatherPrompt } from '@/lib/context/weather';
import { markProactiveMessageResponded } from '@/lib/proactive/proactive-service';
import { interceptSearchCommand } from '@/lib/memory/search-interceptor';
import { storeMessageSelectively } from '@/lib/memory/selective-storage';
import type { StagePrompts } from '@/lib/relationship/prompt-generator';
import type { RelationshipStage } from '@/lib/relationship/stages';
import type { PlutchikEmotionState } from '@/lib/emotions/plutchik';
import { createLogger, startTimer } from '@/lib/logger';

const log = createLogger('MessageService');

interface ProcessMessageInput {
  agentId: string;
  userId: string;
  content: string;
  messageType?: 'text' | 'audio' | 'gif' | 'image';
  metadata?: Record<string, unknown>;
}

interface ProcessMessageOutput {
  userMessage: {
    id: string;
    content: string;
    createdAt: Date;
  };
  assistantMessage: {
    id: string;
    content: string;
    createdAt: Date;
    metadata: Record<string, unknown>;
  };
  emotions: {
    dominant: string[];
    secondary: string[];
    mood: string;
    pad: { valence: number; arousal: number; dominance: number };
    detailed: Record<string, number>;
  };
  state: {
    trust: number;
    affinity: number;
    respect: number;
  };
  relationship: {
    stage: string;
    totalInteractions: number;
    stageChanged: boolean;
  };
  behaviors: {
    active: string[];
    phase?: number;
    safetyLevel: string;
    triggers: string[];
  };
  usage: {
    messagesRemaining: number | 'unlimited';
    tokensUsed: number;
  };
}

export class MessageService {
  /**
   * Process incoming message and generate response
   *
   * ✅ OPTIMIZED: Single query with strategic includes to avoid N+1
   * ✅ PARALLEL: Independent operations run concurrently
   */
  async processMessage(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
    const timer = startTimer();
    const { agentId, userId, content, messageType = 'text', metadata = {} } = input;

    log.info({ agentId, userId, messageType }, 'Processing message');

    try {
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // OPTIMIZATION 1: Single query with all related data
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const [agent, recentMessages] = await Promise.all([
        prisma.agent.findUnique({
          where: { id: agentId },
          include: {
            personalityCore: true,
            internalState: true,
            semanticMemory: true,
            characterGrowth: true,
            behaviorProfiles: true,
            user: {
              select: {
                location: true,
              },
            },
          },
        }),
        prisma.message.findMany({
          where: { agentId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
            metadata: true,
          },
        }),
      ]);

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      if (agent.userId !== userId) {
        throw new Error('Forbidden: Agent does not belong to user');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // OPTIMIZATION 2: Determine AI-facing content
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      let contentForAI = content;
      const contentForUser = content;
      let messageMetadata: Record<string, unknown> = { ...metadata };

      if (messageType === 'gif' && metadata.description) {
        contentForAI = `[El usuario envió un GIF de: ${metadata.description}]`;
        messageMetadata = {
          ...metadata,
          messageType: 'gif',
          gifDescription: metadata.description,
        };
      } else if (messageType === 'audio') {
        messageMetadata = {
          ...metadata,
          messageType: 'audio',
          audioDuration: metadata.duration,
        };
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PARALLEL EXECUTION 1: Save user message + Get/Create relation
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const [userMessage, relation] = await Promise.all([
        prisma.message.create({
          data: {
            agentId,
            userId,
            role: 'user',
            content: contentForUser,
            metadata: messageMetadata,
          },
        }),
        this.getOrCreateRelation(agentId, userId),
      ]);

      // Check if this is a response to a proactive message
      const lastAssistantMessage = await prisma.message.findFirst({
        where: {
          agentId,
          role: 'assistant',
          createdAt: {
            lt: userMessage.createdAt,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (lastAssistantMessage) {
        // Mark proactive message as responded if applicable
        markProactiveMessageResponded(lastAssistantMessage.id).catch(err =>
          log.warn({ error: err, messageId: lastAssistantMessage.id }, 'Failed to mark proactive message as responded')
        );
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // RELATIONSHIP PROGRESSION
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const newTotalInteractions = relation.totalInteractions + 1;
      const newStage = getRelationshipStage(newTotalInteractions);
      const stageChanged = shouldAdvanceStage(
        newTotalInteractions,
        relation.stage as RelationshipStage
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // EMOTIONAL SYSTEM PROCESSING
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      log.debug({ agentId }, 'Processing emotions with Hybrid System');
      const emotionTimer = startTimer();

      const hybridResult = await hybridEmotionalOrchestrator.processMessage({
        agentId,
        userMessage: contentForAI,
        userId,
        generateResponse: false,
      });

      log.debug(
        { duration: emotionTimer(), path: hybridResult.metadata.path },
        'Emotional processing complete'
      );

      const newEmotionState = hybridResult.emotionState;
      const activeDyads = hybridResult.activeDyads;
      const emotionalSummary = getEmotionalSummary(newEmotionState);

      // Add dyads to summary
      emotionalSummary.secondary = activeDyads.slice(0, 3).map(d => d.label);

      // Map emotions to relation metrics
      const trust = newEmotionState.trust;
      const affinity = (newEmotionState.joy + newEmotionState.trust) / 2;
      const respect = (newEmotionState.trust + newEmotionState.anticipation) / 2;

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // BEHAVIOR SYSTEM PROCESSING
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const behaviorOrchestration = await behaviorOrchestrator.processIncomingMessage({
        agent,
        userMessage,
        recentMessages,
        dominantEmotion: (emotionalSummary.dominant[0] || 'joy') as EmotionType,
        emotionalState: {
          valence: emotionalSummary.pad.valence,
          arousal: emotionalSummary.pad.arousal,
          dominance: emotionalSummary.pad.dominance,
        },
      });

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // BUILD ENHANCED PROMPT (con sistema de mensajes progresivos)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const stagePrompts = agent.stagePrompts as StagePrompts | null;

      // Calcular número de mensaje del agente (cuántos mensajes ha enviado)
      const agentMessageCount = await prisma.message.count({
        where: {
          agentId,
          userId,
          role: 'assistant',
        },
      });

      const messageNumber = agentMessageCount + 1;

      // Usar sistema de mensajes progresivos (1-3) o stage-based (4+)
      const basePrompt = messageNumber <= 3
        ? getPromptForMessageNumber(messageNumber, newTotalInteractions, stagePrompts, {
            systemPrompt: agent.systemPrompt,
            name: agent.name,
          })
        : getPromptForStage(stagePrompts, newStage, agent.systemPrompt);

      // Emotional context with dyads
      const emotionalContext = this.buildEmotionalContext(
        emotionalSummary,
        activeDyads,
        hybridResult.metadata
      );

      // Weather context (if user has location configured)
      let weatherContext: string | undefined;
      if (agent.user?.location) {
        const weather = await getUserWeather(agent.user.location);
        if (weather) {
          weatherContext = buildWeatherPrompt(weather);
        }
      }

      // Temporal context (date, time, special events, weather)
      const temporalContext = buildTemporalPrompt(newStage, undefined, weatherContext);

      // Reminder context (important events to remember)
      const reminderContext = await buildReminderContext(agentId, userId, newStage);

      // People context (important people in user's life)
      const peopleContext = await buildPeopleContext(agentId, userId, newStage);

      let enhancedPrompt = basePrompt + '\n\n' + emotionalContext + '\n\n' + temporalContext;

      if (reminderContext) {
        enhancedPrompt += reminderContext;
      }

      if (peopleContext) {
        enhancedPrompt += peopleContext;
      }

      // Add behavior system prompt
      if (behaviorOrchestration.enhancedSystemPrompt) {
        enhancedPrompt += '\n\n' + behaviorOrchestration.enhancedSystemPrompt;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PROACTIVE KNOWLEDGE LOADING (Embeddings-based)
      // Detecta qué información del profile es relevante y la carga
      // ANTES de enviar al LLM, evitando roundtrips
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      try {
        const relevantCommand = await getTopRelevantCommand(content, agentId);

        if (relevantCommand) {
          log.debug({ relevantCommand, query: content.substring(0, 50) }, 'Comando relevante detectado');

          // Cargar el conocimiento relevante
          const knowledgeContext = await getKnowledgeGroup(agentId, relevantCommand);

          // Agregar al prompt
          enhancedPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          enhancedPrompt += `📌 INFORMACIÓN RELEVANTE PARA ESTA CONVERSACIÓN:\n`;
          enhancedPrompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          enhancedPrompt += knowledgeContext;
          enhancedPrompt += `\n\n⚠️ IMPORTANTE: Esta información es relevante para la pregunta del usuario.\n`;
          enhancedPrompt += `Úsala naturalmente en tu respuesta, pero NO menciones que "consultaste" algo.\n`;
          enhancedPrompt += `Responde como si siempre hubieras tenido esta información en tu memoria.\n`;
        }
      } catch (error) {
        log.warn({ error }, 'Error en detección proactiva de conocimiento, continuando sin ella');
        // No fallar el mensaje completo si falla la detección
      }

      // RAG: Build enhanced prompt with memory context
      const memoryManager = createMemoryManager(agentId, userId);
      const finalPrompt = await memoryManager.buildEnhancedPrompt(
        enhancedPrompt,
        contentForAI
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // LLM GENERATION
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const llm = getLLMProvider();

      // Construir array de mensajes: mensajes recientes + mensaje actual del usuario
      const conversationMessages = [
        ...recentMessages.reverse().map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        {
          role: 'user' as const,
          content: contentForAI,
        }
      ];

      let response = await llm.generate({
        systemPrompt: finalPrompt,
        messages: conversationMessages,
      });

      // Knowledge command interception
      const interceptResult = await interceptKnowledgeCommand(agentId, response);

      if (interceptResult.shouldIntercept && interceptResult.knowledgeContext) {
        log.debug({ command: interceptResult.command }, 'Knowledge command detected');

        await logCommandUsage(
          agentId,
          interceptResult.command!,
          interceptResult.knowledgeContext.length
        );

        const expandedPrompt = buildExpandedPrompt(
          finalPrompt,
          interceptResult.knowledgeContext,
          interceptResult.command!
        );

        response = await llm.generate({
          systemPrompt: expandedPrompt,
          messages: conversationMessages,
        });

        // Limpiar tags de conocimiento de la nueva respuesta
        const finalInterceptResult = await interceptKnowledgeCommand(agentId, response);
        response = finalInterceptResult.cleanResponse;
      } else {
        // Si no hay comando, pero limpiar tags que puedan haber quedado
        response = interceptResult.cleanResponse;
      }

      // SEARCH command interception (memoria inteligente)
      const searchResult = await interceptSearchCommand(agentId, userId, response);

      if (searchResult.shouldIntercept && searchResult.memoryContext) {
        log.debug(
          { searchQuery: searchResult.searchQuery },
          'SEARCH command detected, executing memory search'
        );

        // Agregar contexto de memoria al prompt y regenerar
        const expandedPromptWithMemory = finalPrompt + searchResult.memoryContext;

        response = await llm.generate({
          systemPrompt: expandedPromptWithMemory,
          messages: conversationMessages,
        });

        // Limpiar el response en caso de que la IA siga teniendo [SEARCH:...]
        response = searchResult.cleanResponse;
      }

      // REMEMBER command interception
      const rememberResult = await interceptRememberCommands(agentId, userId, response);

      if (rememberResult.shouldIntercept) {
        log.debug(
          { count: rememberResult.commands.length },
          'REMEMBER commands detected and saved'
        );
        // Use clean response (with [REMEMBER:...] removed)
        response = rememberResult.cleanResponse;
      }

      // PERSON command interception
      const personResult = await interceptPersonCommands(agentId, userId, response);

      if (personResult.shouldIntercept) {
        log.debug(
          { count: personResult.commands.length },
          'PERSON commands detected and saved'
        );
        // Use clean response (with [PERSON:...] removed)
        response = personResult.cleanResponse;
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // SAFETY: Check for empty response after all interceptors
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      if (!response || response.trim().length === 0) {
        log.error(
          { originalResponse: response },
          'Response became empty after interceptors - regenerating'
        );

        // Regenerate without commands
        response = await llm.generate({
          systemPrompt: finalPrompt + '\n\n⚠️ IMPORTANTE: NO uses comandos ([INTERESTS], [WORK], etc.) en tu respuesta. Responde directamente con texto natural.',
          messages: conversationMessages,
        });

        // Clean again just in case
        const finalClean = await interceptKnowledgeCommand(agentId, response);
        response = finalClean.cleanResponse;

        // If STILL empty, provide fallback
        if (!response || response.trim().length === 0) {
          response = 'Hola! ¿Cómo estás? 😊';
          log.warn('Using fallback response after empty regeneration');
        }
      }

      // Content moderation for behaviors
      if (behaviorOrchestration.activeBehaviors.length > 0) {
        const primaryBehavior = behaviorOrchestration.activeBehaviors[0];
        const behaviorProfile = agent.behaviorProfiles.find(
          bp => bp.behaviorType === primaryBehavior.behaviorType
        );

        const moderation = behaviorOrchestration.moderator.moderateResponse(
          response,
          primaryBehavior.behaviorType,
          behaviorProfile?.currentPhase || 1,
          agent.nsfwMode || false
        );

        if (!moderation.allowed) {
          response = moderation.warning || 'Lo siento, no puedo continuar con este tipo de contenido.';
        } else if (moderation.modifiedResponse) {
          response = moderation.modifiedResponse;
        }
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // MULTIMEDIA PROCESSING
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const { multimedia, finalResponse } = await this.processMultimedia(
        response,
        agentId,
        agent,
        userId
      );

      const estimatedTokens = Math.ceil((content.length + finalResponse.length) / 4);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PARALLEL EXECUTION 2: Save all data + Track usage
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const [assistantMessage] = await Promise.all([
        prisma.message.create({
          data: {
            agentId,
            userId, // Important: Include userId so messages are scoped to user
            role: 'assistant',
            content: finalResponse,
            metadata: {
              multimedia: multimedia.length > 0 ? multimedia : undefined,
              emotions: {
                dominant: emotionalSummary.dominant,
                secondary: emotionalSummary.secondary,
                mood: emotionalSummary.mood,
                pad: emotionalSummary.pad,
                visible: emotionalSummary.dominant,
              },
              relationLevel: newStage, // Use relationship stage instead of mood
              tokensUsed: estimatedTokens,
              behaviors: {
                active: behaviorOrchestration.metadata.behaviorsActive,
                phase: behaviorOrchestration.metadata.phase,
                safetyLevel: behaviorOrchestration.metadata.safetyLevel,
                triggers: behaviorOrchestration.metadata.triggers,
              },
            },
          },
        }),
        // Update relation
        prisma.relation.update({
          where: { id: relation.id },
          data: {
            trust,
            affinity,
            respect,
            privateState: {
              love: (newEmotionState.joy + newEmotionState.trust) / 2,
              curiosity: (newEmotionState.surprise + newEmotionState.anticipation) / 2,
            },
            visibleState: { trust, affinity, respect },
            totalInteractions: newTotalInteractions,
            stage: newStage,
            lastInteractionAt: new Date(),
          },
        }),
        // Update internal state
        prisma.internalState.update({
          where: { agentId },
          data: {
            currentEmotions: newEmotionState as any,
            moodValence: emotionalSummary.pad.valence,
            moodArousal: emotionalSummary.pad.arousal,
            moodDominance: emotionalSummary.pad.dominance,
            lastUpdated: new Date(),
          },
        }),
      ]);

      // Store embeddings SELECTIVAMENTE (solo mensajes importantes, no bloqueante)
      // Esto reduce costos en 95% (~40K embeddings/día → ~2K embeddings/día)
      storeMessageSelectively(
        userMessage.id,
        content,
        'user',
        agentId,
        userId
      ).catch(err =>
        log.warn({ error: err.message }, 'Failed to store user message embedding')
      );

      storeMessageSelectively(
        assistantMessage.id,
        finalResponse,
        'assistant',
        agentId,
        userId
      ).catch(err =>
        log.warn({ error: err.message }, 'Failed to store assistant message embedding')
      );

      log.info({ duration: timer(), agentId, userId }, 'Message processed successfully');

      return {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          createdAt: userMessage.createdAt,
        },
        assistantMessage: {
          id: assistantMessage.id,
          content: assistantMessage.content,
          createdAt: assistantMessage.createdAt,
          metadata: assistantMessage.metadata as Record<string, unknown>,
        },
        emotions: {
          dominant: emotionalSummary.dominant,
          secondary: emotionalSummary.secondary,
          mood: emotionalSummary.mood,
          pad: emotionalSummary.pad,
          detailed: {
            joy: Math.round(newEmotionState.joy * 100),
            trust: Math.round(newEmotionState.trust * 100),
            fear: Math.round(newEmotionState.fear * 100),
            surprise: Math.round(newEmotionState.surprise * 100),
            sadness: Math.round(newEmotionState.sadness * 100),
            disgust: Math.round(newEmotionState.disgust * 100),
            anger: Math.round(newEmotionState.anger * 100),
            anticipation: Math.round(newEmotionState.anticipation * 100),
          },
        },
        state: { trust, affinity, respect },
        relationship: {
          stage: newStage,
          totalInteractions: newTotalInteractions,
          stageChanged,
        },
        behaviors: {
          active: behaviorOrchestration.metadata.behaviorsActive,
          phase: behaviorOrchestration.metadata.phase,
          safetyLevel: behaviorOrchestration.metadata.safetyLevel,
          triggers: behaviorOrchestration.metadata.triggers,
        },
        usage: {
          messagesRemaining: 'unlimited', // TODO: Implement quota
          tokensUsed: estimatedTokens,
        },
      };
    } catch (error) {
      log.error({ error, agentId, userId, duration: timer() }, 'Failed to process message');
      throw error;
    }
  }

  /**
   * Get or create relation between agent and user
   * OPTIMIZED: Uses findFirst with upsert pattern
   */
  private async getOrCreateRelation(agentId: string, userId: string) {
    const existing = await prisma.relation.findFirst({
      where: {
        subjectId: agentId,
        targetId: userId,
        targetType: 'user',
      },
    });

    if (existing) return existing;

    return prisma.relation.create({
      data: {
        subjectId: agentId,
        targetId: userId,
        targetType: 'user',
        trust: 0.5,
        affinity: 0.5,
        respect: 0.5,
        privateState: { love: 0, curiosity: 0 },
        visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
        stage: 'stranger',
        totalInteractions: 0,
      },
    });
  }

  /**
   * Build emotional context string for prompt
   */
  private buildEmotionalContext(
    emotionalSummary: any,
    activeDyads: any[],
    metadata: any
  ): string {
    let context = `\nEstado emocional actual:\n- Emociones primarias: ${emotionalSummary.dominant.join(', ')}\n`;

    if (activeDyads.length > 0) {
      const dyadDescriptions = activeDyads.slice(0, 3).map(dyad => {
        const intensity = (dyad.intensity * 100).toFixed(0);
        return `${dyad.label} (${intensity}% - ${dyad.components[0]}+${dyad.components[2]})`;
      }).join(', ');

      context += `- Emociones secundarias (dyads): ${dyadDescriptions}\n`;
    }

    context += `- Mood general: ${emotionalSummary.mood}\n`;
    context += `- Valence (placer): ${(emotionalSummary.pad.valence * 100).toFixed(0)}%\n`;
    context += `- Arousal (activación): ${(emotionalSummary.pad.arousal * 100).toFixed(0)}%\n`;
    context += `- Estabilidad emocional: ${(metadata.emotionalStability * 100).toFixed(0)}%\n`;
    context += `\nRefleja estas emociones de manera sutil en tu tono y respuestas.`;

    return context;
  }

  /**
   * Process multimedia tags in response
   */
  private async processMultimedia(
    response: string,
    agentId: string,
    agent: any,
    userId: string
  ): Promise<{ multimedia: any[]; finalResponse: string }> {
    const { parseMultimediaTags, validateMultimediaUsage } = await import('@/lib/multimedia/parser');
    const { MultimediaGenerator } = await import('@/lib/multimedia/generator');

    const parsedResponse = parseMultimediaTags(response);
    const multimediaValidation = validateMultimediaUsage(parsedResponse);

    if (!parsedResponse.hasMultimedia || !multimediaValidation.valid) {
      return { multimedia: [], finalResponse: response };
    }

    log.debug({ count: parsedResponse.multimediaTags.length }, 'Generating multimedia');

    const generator = new MultimediaGenerator();
    const multimedia = await generator.generateMultimediaContent(
      parsedResponse.multimediaTags,
      {
        agentId,
        agentName: agent.name,
        agentPersonality: agent.personality || agent.description || '',
        referenceImageUrl: agent.referenceImageUrl || undefined,
        voiceId: agent.voiceId || undefined,
        userId,
      }
    );

    return {
      multimedia,
      finalResponse: parsedResponse.textContent,
    };
  }
}

// Export singleton instance
export const messageService = new MessageService();
