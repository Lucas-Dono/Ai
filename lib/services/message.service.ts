/**
 * Message Service
 *
 * Handles all message-related business logic with optimized database queries
 * Eliminates N+1 query problems by using strategic includes and parallel queries
 */

import { prisma } from '@/lib/prisma';
import { getLLMProvider } from '@/lib/llm/provider';
import { getVeniceClient } from '@/lib/emotional-system/llm/venice';
import { createMemoryManager } from '@/lib/memory/manager';
import { behaviorOrchestrator } from '@/lib/behavior-system';
import { hybridEmotionalOrchestrator } from '@/lib/emotional-system/hybrid-orchestrator';
import { getContextualModularPrompt } from '@/lib/behavior-system/prompts/modular-prompts';
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
import { memoryQueryHandler } from '@/lib/memory/memory-query-handler';
import { processInteractionForBond } from '@/lib/bonds/bond-progression-service';
import type { StagePrompts } from '@/lib/relationship/prompt-generator';
import type { RelationshipStage } from '@/lib/relationship/stages';
import type { PlutchikEmotionState } from '@/lib/emotions/plutchik';
import { createLogger, startTimer } from '@/lib/logger';
import { getContextLimit } from '@/lib/usage/context-limits';
import { trackLLMCall } from '@/lib/cost-tracking/tracker';
import { estimateTokens } from '@/lib/cost-tracking/calculator';
import { compressContext } from '@/lib/memory/context-compression';
import { detectMemoryReferences } from '@/lib/memory/memory-reference-detector';

type EmotionType = 'joy' | 'trust' | 'fear' | 'surprise' | 'sadness' | 'disgust' | 'anger' | 'anticipation';

const log = createLogger('MessageService');

interface ProcessMessageInput {
  agentId: string;
  userId: string;
  content: string;
  messageType?: 'text' | 'audio' | 'gif' | 'image';
  metadata?: Record<string, unknown>;
  userPlan?: string; // Plan del usuario para determinar límite de contexto
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
    const { agentId, userId, content, messageType = 'text', metadata = {}, userPlan = 'free' } = input;

    log.info({ agentId, userId, messageType, userPlan }, 'Processing message');

    // Obtener límite de contexto dinámico basado en tier
    const contextLimit = getContextLimit(userPlan);
    log.debug({ userPlan, contextLimit }, 'Dynamic context limit applied');

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
          take: contextLimit, // 🔥 DYNAMIC: 10 (free) | 30 (plus) | 100 (ultra)
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
            metadata: true,
            userId: true,
            worldId: true,
            agentId: true,
          },
        }),
      ]);

      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Allow access to:
      // 1. User's own agents (agent.userId === userId)
      // 2. System/predefined agents (agent.userId === null)
      // 3. Public agents (agent.visibility === 'public')
      const isOwnAgent = agent.userId === userId;
      const isSystemAgent = agent.userId === null;
      const isPublicAgent = agent.visibility === 'public';

      if (!isOwnAgent && !isSystemAgent && !isPublicAgent) {
        throw new Error('Forbidden: Agent is not accessible');
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
            metadata: messageMetadata as any,
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
        dominantEmotion: (emotionalSummary.dominant[0] || 'joy') as any,
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
        activeDyads as any,
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

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // MEMORY QUERY DETECTION (Semantic Search)
      // Detecta preguntas sobre el pasado ("¿recuerdas cuando...?")
      // y recupera memorias relevantes ANTES de generar respuesta
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      try {
        const memoryQueryResult = await memoryQueryHandler.handleQuery(
          content,
          agentId,
          userId,
          {
            maxMemories: 5,
            minSimilarity: 0.5,
            maxTokens: 1000,
            useSemanticSearch: true,
          }
        );

        if (memoryQueryResult.detected && memoryQueryResult.contextPrompt) {
          log.info(
            {
              queryType: memoryQueryResult.detection.queryType,
              confidence: memoryQueryResult.detection.confidence,
              memoriesFound: memoryQueryResult.metadata.memoriesFound,
              searchTimeMs: memoryQueryResult.metadata.searchTimeMs,
            },
            'Memory query detected - adding memory context'
          );

          // Agregar contexto de memorias al prompt
          enhancedPrompt += '\n\n' + memoryQueryResult.contextPrompt;
        }
      } catch (error) {
        log.warn({ error }, 'Error en memory query detection, continuando sin ella');
        // No fallar el mensaje completo si falla la detección
      }

      // RAG: Build enhanced prompt with memory context
      const memoryManager = createMemoryManager(agentId, userId);
      const finalPrompt = await memoryManager.buildEnhancedPrompt(
        enhancedPrompt,
        contentForAI
      );

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // PROMPT MODULAR INJECTION (con adaptación dialectal)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Extraer información del personaje para adaptación dialectal
      const agentProfile = agent.profile as any;
      const characterOrigin =
        agentProfile?.origin ||
        agentProfile?.nationality ||
        agentProfile?.country ||
        agentProfile?.birthplace ||
        agentProfile?.world ||
        undefined;

      // Obtener usuario para NSFW consent
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { nsfwConsent: true },
      });

      // Inyectar prompt modular según personalidad, relación y contexto
      const modularPrompt = await getContextualModularPrompt({
        // ✅ NUEVO: Usar campo explícito de la DB (preferido)
        personalityVariant: agent.personalityVariant || undefined,
        // ⚠️ FALLBACK: Solo si no hay variant asignado (agentes antiguos)
        personalityTraits: !agent.personalityVariant ? (agent.personality || '') : undefined,
        relationshipStage: relation.stage,
        recentMessages: recentMessages.map(m => m.content).slice(0, 5),
        nsfwMode: agent.nsfwMode && (currentUser?.nsfwConsent || false),
        // ✅ NUEVO: Tier del usuario para clasificación inteligente
        userTier: userPlan === 'ultra' ? 'ultra' : userPlan === 'plus' ? 'plus' : 'free',
        characterInfo: characterOrigin ? {
          origin: characterOrigin,
          name: agent.name,
          age: agentProfile?.age,
        } : undefined,
      });

      // Agregar prompt modular al prompt final
      let enhancedPromptFinal = finalPrompt;
      if (modularPrompt) {
        enhancedPromptFinal += '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
        enhancedPromptFinal += '🎯 GUÍA CONTEXTUAL DE COMPORTAMIENTO:\n';
        enhancedPromptFinal += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
        enhancedPromptFinal += modularPrompt;
        enhancedPromptFinal += '\n\n⚠️ IMPORTANTE: Esta guía define CÓMO debes comportarte según tu personalidad y el contexto actual. Síguela naturalmente.\n';

        log.info({
          agentId,
          hasModularPrompt: true,
          hasDialectAdaptation: !!characterOrigin,
          characterOrigin: characterOrigin || 'none'
        }, 'Modular prompt injected with dialect adaptation');
      }

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // LLM GENERATION WITH VENICE (24B UNCENSORED)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const veniceClient = getVeniceClient();

      log.info({ agentId, userId, model: 'venice-uncensored' }, 'Generating response with Venice');

      // Construir array de mensajes: mensajes recientes + mensaje actual del usuario
      const allMessages = [
        ...recentMessages.reverse().map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          id: m.id,
          createdAt: m.createdAt,
        })),
        {
          role: 'user' as const,
          content: contentForAI,
          id: userMessage.id,
          createdAt: userMessage.createdAt,
        }
      ];

      // Apply context compression (optimizes old messages)
      const compressionResult = await compressContext(allMessages, contextLimit);

      if (compressionResult.compressionApplied) {
        log.info({
          originalCount: compressionResult.originalCount,
          compressedCount: compressionResult.compressedCount,
          contextLimit,
        }, 'Context compression applied');
      }

      // Use compressed messages for LLM
      const conversationMessages = compressionResult.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Generar respuesta con Venice (uncensored, 24b params)
      const veniceResponse = await veniceClient.generateWithMessages({
        systemPrompt: enhancedPromptFinal,
        messages: conversationMessages,
        temperature: 0.95, // Mayor creatividad para IA de 24b
        maxTokens: 1500,   // Respuestas más largas y detalladas
        model: 'venice-uncensored',
      });

      let response = veniceResponse;

      // Track Venice cost (async, non-blocking)
      const inputTokensFirst = estimateTokens(
        enhancedPromptFinal + '\n' + conversationMessages.map(m => m.content).join('\n')
      );
      const outputTokensFirst = estimateTokens(response);
      trackLLMCall({
        userId,
        agentId,
        provider: 'venice',
        model: 'venice-uncensored',
        inputTokens: inputTokensFirst,
        outputTokens: outputTokensFirst,
        metadata: { messageType, stage: 'initial-generation', hasModularPrompt: !!modularPrompt },
      }).catch(err => log.warn({ error: err.message }, 'Failed to track Venice cost'));

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

        // Regenerar con Venice y conocimiento expandido
        const veniceExpandedResponse = await veniceClient.generateWithMessages({
          systemPrompt: expandedPrompt,
          messages: conversationMessages,
          temperature: 0.95,
          maxTokens: 1500,
          model: 'venice-uncensored',
        });

        response = veniceExpandedResponse;

        // Track knowledge expansion Venice cost
        const inputTokensExpanded = estimateTokens(
          expandedPrompt + '\n' + conversationMessages.map(m => m.content).join('\n')
        );
        const outputTokensExpanded = estimateTokens(response);
        trackLLMCall({
          userId,
          agentId,
          provider: 'venice',
          model: 'venice-uncensored',
          inputTokens: inputTokensExpanded,
          outputTokens: outputTokensExpanded,
          metadata: { messageType, stage: 'knowledge-expansion', command: interceptResult.command },
        }).catch(err => log.warn({ error: err.message }, 'Failed to track Venice cost'));

        // Limpiar tags de conocimiento de la nueva respuesta
        const finalInterceptResult = await interceptKnowledgeCommand(agentId, response);
        response = finalInterceptResult.cleanResponse;
      } else {
        // Si no hay comando, pero limpiar tags que puedan haber quedado
        response = interceptResult.cleanResponse;
      }

      // SEARCH command interception (memoria inteligente)
      const searchResult = await interceptSearchCommand(agentId, userId, response);
      let memoryContext = ''; // Initialize memory context variable

      if (searchResult.shouldIntercept && searchResult.memoryContext) {
        memoryContext = searchResult.memoryContext; // Capture memory context for later use
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

        // Track memory search LLM cost
        const inputTokensSearch = estimateTokens(
          expandedPromptWithMemory + '\n' + conversationMessages.map(m => m.content).join('\n')
        );
        const outputTokensSearch = estimateTokens(response);
        trackLLMCall({
          userId,
          agentId,
          provider: 'google',
          model: process.env.GEMINI_MODEL_LITE || 'gemini-2.5-flash-lite',
          inputTokens: inputTokensSearch,
          outputTokens: outputTokensSearch,
          metadata: { messageType, stage: 'memory-search', searchQuery: searchResult.searchQuery },
        }).catch(err => log.warn({ error: err.message }, 'Failed to track LLM cost'));

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
      const { multimedia, finalResponse, isAsync } = await this.processMultimedia(
        response,
        agentId,
        {
          name: agent.name,
          personality: agent.personality,
          description: agent.description,
          referenceImageUrl: agent.referenceImageUrl,
          voiceId: agent.voiceId,
          systemPrompt: agent.systemPrompt,
        },
        userId,
        userPlan  // Pasar tier para aplicar límites
      );

      // Si la generación es asíncrona, el mensaje ya fue enviado
      // y el finalResponse contiene el mensaje de espera
      if (isAsync) {
        log.info({ agentId, userId }, 'Async image generation started - returning waiting message');
      }

      const estimatedTokens = Math.ceil((content.length + finalResponse.length) / 4);

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // MEMORY REFERENCE DETECTION (🆕 Memory Highlights Feature)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      const memoryReferences = detectMemoryReferences(finalResponse, memoryContext);

      if (memoryReferences.length > 0) {
        log.info(
          { agentId, userId, referenceCount: memoryReferences.length },
          'Memory references detected in agent response'
        );
      }

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
              // 🆕 Memory Highlights: Add detected memory references
              memoryReferences: memoryReferences.length > 0
                ? memoryReferences.map(ref => ({
                    type: ref.type,
                    content: ref.content,
                    originalTimestamp: ref.originalTimestamp?.toISOString(),
                    context: ref.context,
                    confidence: ref.confidence,
                  }))
                : undefined,
            } as any,
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

      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // BOND PROGRESSION: Update symbolic bond (non-blocking)
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      this.getOrCreateBond(agentId, userId)
        .then(bond => {
          return processInteractionForBond(
            bond.id,
            content, // user message
            finalResponse, // agent response
            {
              conversationId: userMessage.conversationId || undefined,
              emotionalState: {
                intensity: Math.max(
                  emotionalSummary.pad.valence,
                  emotionalSummary.pad.arousal
                ),
                valence: emotionalSummary.pad.valence,
              },
              memoryCreated: memoryReferences.length > 0,
            }
          );
        })
        .then(result => {
          if (result.success && result.milestone) {
            log.info(
              { bondId: result, milestone: result.milestone, affinityChange: result.affinityChange },
              'Bond milestone reached'
            );
          }
        })
        .catch(err =>
          log.warn({ error: err.message }, 'Failed to process bond progression')
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
   * Get or create symbolic bond between agent and user
   * Bonds track the deeper relationship progression beyond basic stats
   */
  private async getOrCreateBond(agentId: string, userId: string) {
    const existing = await prisma.symbolicBond.findFirst({
      where: {
        agentId,
        userId,
      },
    });

    if (existing) return existing;

    // Create new bond starting as ACQUAINTANCE
    return prisma.symbolicBond.create({
      data: {
        agentId,
        userId,
        tier: 'ACQUAINTANCE',
        status: 'active',
        affinityLevel: 0,
        totalInteractions: 0,
        durationDays: 0,
        rarityScore: 0.1,
        rarityTier: 'Common',
      },
    });
  }

  /**
   * Build emotional context string for prompt
   */
  private buildEmotionalContext(
    emotionalSummary: {
      dominant: string[];
      mood: string;
      pad: { valence: number; arousal: number; dominance: number };
    },
    activeDyads: Array<{
      label: string;
      intensity: number;
      components: [string, string, string];
    }>,
    metadata: {
      emotionalStability: number;
      path: string;
    }
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
   *
   * Detecta si hay tags [IMAGE:] y decide si generar síncronamente (rápido)
   * o asíncronamente (AI Horde con tiempos largos)
   *
   * IMPORTANTE: Aplica límites configurables según tier y estrategia (.env)
   */
  private async processMultimedia(
    response: string,
    agentId: string,
    agent: {
      name: string;
      personality: string | null;
      description: string | null;
      referenceImageUrl: string | null;
      voiceId: string | null;
      systemPrompt?: string;
    },
    userId: string,
    userPlan: string = 'free'
  ): Promise<{ multimedia: Array<Record<string, unknown>>; finalResponse: string; isAsync?: boolean }> {
    const { parseMultimediaTags, validateMultimediaUsage } = await import('@/lib/multimedia/parser');

    const parsedResponse = parseMultimediaTags(response);
    const multimediaValidation = validateMultimediaUsage(parsedResponse);

    if (!parsedResponse.hasMultimedia || !multimediaValidation.valid) {
      return { multimedia: [], finalResponse: response };
    }

    // Detectar si hay imágenes (que requieren generación asíncrona)
    const imageTags = parsedResponse.multimediaTags.filter((tag) => tag.type === 'image');
    const audioTags = parsedResponse.multimediaTags.filter((tag) => tag.type === 'audio');

    // Si hay imágenes, verificar límites y usar generación ASÍNCRONA
    if (imageTags.length > 0) {
      log.info({ count: imageTags.length, userPlan }, 'Detected image tags - checking limits');

      // Verificar límites para usuarios FREE
      const { canUseFreeMultimedia } = await import('@/lib/multimedia/limits');
      const limitCheck = await canUseFreeMultimedia(userId, 'image', userPlan);

      if (!limitCheck.allowed) {
        log.warn(
          { userId, userPlan, reason: limitCheck.reason },
          'Image generation blocked by limits'
        );

        // Retornar mensaje de upgrade en lugar de la imagen
        return {
          multimedia: [],
          finalResponse: limitCheck.upgradeMessage || 'Actualiza a Plus para usar generación de imágenes.',
          isAsync: false,
        };
      }

      // Si está permitido, generar
      const { asyncImageGenerator } = await import('@/lib/multimedia/async-image-generator');

      // Generar solo la PRIMERA imagen de forma asíncrona
      const firstImageTag = imageTags[0];

      const result = await asyncImageGenerator.startAsyncGeneration({
        agentId,
        agentName: agent.name,
        agentPersonality: agent.personality || agent.description || '',
        agentSystemPrompt: agent.systemPrompt,
        userId,
        referenceImageUrl: agent.referenceImageUrl || undefined,
        description: firstImageTag.description,
      });

      // Si es trial lifetime, agregar información al mensaje de espera
      if (limitCheck.current !== undefined && limitCheck.limit !== undefined) {
        const remaining = limitCheck.limit - limitCheck.current - 1; // -1 porque ya se está usando una
        result.waitingMessage.content += ` (Fotos restantes: ${remaining}/${limitCheck.limit})`;
      }

      // Retornar el mensaje de espera (sin multimedia aún)
      return {
        multimedia: [],
        finalResponse: result.waitingMessage.content,
        isAsync: true,
      };
    }

    // Si solo hay audio, verificar límites y generar síncronamente (es rápido con ElevenLabs)
    if (audioTags.length > 0) {
      log.debug({ count: audioTags.length, userPlan }, 'Detected audio tags - checking limits');

      // Verificar límites para usuarios FREE
      const { canUseFreeMultimedia } = await import('@/lib/multimedia/limits');
      const limitCheck = await canUseFreeMultimedia(userId, 'voice', userPlan);

      if (!limitCheck.allowed) {
        log.warn(
          { userId, userPlan, reason: limitCheck.reason },
          'Voice generation blocked by limits'
        );

        // Retornar mensaje de upgrade en lugar del audio
        return {
          multimedia: [],
          finalResponse: limitCheck.upgradeMessage || 'Actualiza a Plus para usar mensajes de voz.',
          isAsync: false,
        };
      }

      // Si está permitido, generar
      const { MultimediaGenerator } = await import('@/lib/multimedia/generator');
      const generator = new MultimediaGenerator();

      const multimedia = await generator.generateMultimediaContent(audioTags, {
        agentId,
        agentName: agent.name,
        agentPersonality: agent.personality || agent.description || '',
        referenceImageUrl: agent.referenceImageUrl || undefined,
        voiceId: agent.voiceId || undefined,
        userId,
      });

      // Si es trial lifetime, agregar información al response
      let finalResponse = parsedResponse.textContent;
      if (limitCheck.current !== undefined && limitCheck.limit !== undefined) {
        const remaining = limitCheck.limit - limitCheck.current - 1;
        finalResponse += ` (Mensajes de voz restantes: ${remaining}/${limitCheck.limit})`;
      }

      return {
        multimedia: multimedia as unknown as Array<Record<string, unknown>>,
        finalResponse,
      };
    }

    return { multimedia: [], finalResponse: response };
  }
}

// Export singleton instance
export const messageService = new MessageService();
