/**
 * World Simulation Engine
 *
 * Motor de simulación que orquesta interacciones entre múltiples IAs en un mundo.
 * Maneja turnos, contexto grupal, relaciones entre IAs, y emisión de eventos.
 */

import { prisma } from '@/lib/prisma';
import { getVeniceClient } from '@/lib/emotional-system/llm/venice';
import { hybridEmotionalOrchestrator } from '@/lib/emotional-system/hybrid-orchestrator';
import { getEmotionalSummary } from '@/lib/emotions/system';
import { createLogger } from '@/lib/logger';
import { worldSocketEvents } from './socket-events';
import { getAIDirector, shouldDirectorEvaluate } from './ai-director';
import { getStoryEngine } from './story-engine';
import { getCharacterImportanceManager } from './character-importance-manager';
import { getNarrativeAnalyzer, type InteractionForAnalysis } from './narrative-analyzer';
import { getEmergentEventsGenerator } from './emergent-events';
import { getWorldStateRedis, withWorldLock, type WorldState as RedisWorldState } from './world-state-redis';
import { WorldAgentMemoryService, shouldSaveEpisode } from './world-agent-memory.service';
import { getEventApplicationService } from './event-application.service';
import type { WorldStatus } from '@prisma/client';

const log = createLogger('SimulationEngine');

interface SimulationWorldState {
  worldId: string;
  isRunning: boolean;
  intervalId?: NodeJS.Timeout;
}

interface AgentInfo {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  personality: any;
  emotionalState: any;
}

interface InteractionContext {
  world: any;
  agents: AgentInfo[];
  recentInteractions: any[];
  agentRelations: Map<string, any>; // Map de agentId -> relaciones con otros
}

/**
 * Motor de simulación de mundos
 */
export class WorldSimulationEngine {
  private activeWorlds: Map<string, SimulationWorldState> = new Map();

  /**
   * Inicia la simulación de un mundo
   */
  async startSimulation(worldId: string): Promise<void> {
    log.info({ worldId }, 'Starting world simulation');

    // Verificar si ya está corriendo
    if (this.activeWorlds.has(worldId)) {
      log.warn({ worldId }, 'Simulation already running');
      return;
    }

    // 🔥 REDIS: Adquirir lock para prevenir race conditions
    const redisService = getWorldStateRedis();
    const lock = await redisService.lockWorld(worldId, 60);

    if (!lock.acquired) {
      log.warn({ worldId }, '⚠️  Could not acquire lock - simulation may already be starting');
      throw new Error('World is locked by another process');
    }

    try {
      // Cargar mundo con todos sus agentes
      const world = await prisma.world.findUnique({
        where: { id: worldId },
        include: {
          worldAgents: {
            where: { isActive: true },
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
          simulationState: true,
        },
      });

    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    // OPTIMIZATION: Verificar si el mundo está pausado por auto-pause
    if (world.isPaused) {
      log.warn({ worldId, pauseReason: world.pauseReason }, 'Cannot start simulation: world is paused');
      throw new Error(`World is paused (reason: ${world.pauseReason}). Resume world before starting simulation.`);
    }

    if (world.worldAgents.length < 2) {
      throw new Error('World must have at least 2 active agents to start simulation');
    }

    // Inicializar o recuperar simulation state
    let simState = world.simulationState;
    if (!simState) {
      simState = await prisma.worldSimulationState.create({
        data: {
          worldId,
          currentTurn: 0,
          totalInteractions: 0,
          startedAt: new Date(),
        },
      });
    } else {
      await prisma.worldSimulationState.update({
        where: { id: simState.id },
        data: {
          resumedAt: new Date(),
        },
      });
    }

      // Actualizar estado a RUNNING
      await prisma.world.update({
        where: { id: worldId },
        data: { status: 'RUNNING' },
      });

      // 🔥 REDIS: Cargar estado inicial a cache
      const initialState = await redisService.getWorldState(worldId);
      if (initialState) {
        log.info({ worldId }, '✅ World state loaded into Redis cache');
      }

      // Emitir evento de cambio de estado
      worldSocketEvents.emitStatusChange({
        worldId,
        status: 'RUNNING',
        currentTurn: simState?.currentTurn || 0,
        totalInteractions: simState?.totalInteractions || 0,
        timestamp: new Date(),
      });

      // Configurar loop de simulación
      const worldState: SimulationWorldState = {
        worldId,
        isRunning: true,
      };

      this.activeWorlds.set(worldId, worldState);

      // Ejecutar primer turno inmediatamente
      this.executeSimulationTurn(worldId).catch(err => {
        log.error({ error: err, worldId }, 'Error in first simulation turn');
      });

      // Si está en modo auto, configurar intervalo
      if (world.autoMode) {
        const interval = setInterval(async () => {
          const state = this.activeWorlds.get(worldId);
          if (!state || !state.isRunning) {
            clearInterval(interval);
            return;
          }

          try {
            await this.executeSimulationTurn(worldId);
          } catch (error) {
            log.error({ error, worldId }, 'Error in simulation turn');
            // En caso de error, pausar la simulación
            await this.pauseSimulation(worldId);
            clearInterval(interval);
          }
        }, world.interactionDelay) as unknown as NodeJS.Timeout;

        worldState.intervalId = interval;
      }

      log.info({ worldId }, 'Simulation started successfully');

    } finally {
      // 🔥 REDIS: Liberar lock
      await redisService.unlockWorld(worldId, lock.lockId);
    }
  }

  /**
   * Pausa la simulación de un mundo
   */
  async pauseSimulation(worldId: string): Promise<void> {
    log.info({ worldId }, 'Pausing world simulation');

    const worldState = this.activeWorlds.get(worldId);
    if (!worldState) {
      log.warn({ worldId }, 'World not running');
      return;
    }

    // Detener intervalo
    if (worldState.intervalId) {
      clearInterval(worldState.intervalId);
    }

    worldState.isRunning = false;
    this.activeWorlds.delete(worldId);

    // Actualizar estado en BD
    const [, simState] = await Promise.all([
      prisma.world.update({
        where: { id: worldId },
        data: { status: 'PAUSED' },
      }),
      prisma.worldSimulationState.update({
        where: { worldId },
        data: { pausedAt: new Date() },
      }),
    ]);

    // Emitir evento de cambio de estado
    worldSocketEvents.emitStatusChange({
      worldId,
      status: 'PAUSED',
      currentTurn: simState.currentTurn,
      totalInteractions: simState.totalInteractions,
      timestamp: new Date(),
    });

    log.info({ worldId }, 'Simulation paused successfully');
  }

  /**
   * Detiene completamente la simulación de un mundo
   */
  async stopSimulation(worldId: string): Promise<void> {
    log.info({ worldId }, 'Stopping world simulation');

    const worldState = this.activeWorlds.get(worldId);
    if (worldState) {
      if (worldState.intervalId) {
        clearInterval(worldState.intervalId);
      }
      this.activeWorlds.delete(worldId);
    }

    // Actualizar estado en BD
    const [, simState] = await Promise.all([
      prisma.world.update({
        where: { id: worldId },
        data: { status: 'STOPPED' },
      }),
      prisma.worldSimulationState.update({
        where: { worldId },
        data: { stoppedAt: new Date() },
      }),
    ]);

    // Emitir evento de cambio de estado
    worldSocketEvents.emitStatusChange({
      worldId,
      status: 'STOPPED',
      currentTurn: simState.currentTurn,
      totalInteractions: simState.totalInteractions,
      timestamp: new Date(),
    });

    log.info({ worldId }, 'Simulation stopped successfully');
  }

  /**
   * Ejecuta un turno de simulación
   */
  private async executeSimulationTurn(worldId: string): Promise<void> {
    const timer = Date.now();
    log.debug({ worldId }, 'Executing simulation turn');

    // OPTIMIZATION: Verificar que el mundo no esté pausado antes de procesar
    const pauseCheck = await prisma.world.findUnique({
      where: { id: worldId },
      select: { isPaused: true, pauseReason: true },
    });

    if (pauseCheck?.isPaused) {
      log.warn(
        { worldId, pauseReason: pauseCheck.pauseReason },
        'Skipping turn: world is paused'
      );
      await this.pauseSimulation(worldId);
      return;
    }

    // Cargar contexto completo
    const context = await this.loadInteractionContext(worldId);

    // Verificar límite de interacciones si existe
    if (context.world.maxInteractions &&
        context.world.maxInteractions <= context.recentInteractions.length) {
      log.info({ worldId }, 'Max interactions reached, stopping simulation');
      await this.stopSimulation(worldId);
      return;
    }

    // Seleccionar siguiente agente que hablará
    const speakerAgent = await this.selectNextSpeaker(context);

    if (!speakerAgent) {
      log.warn({ worldId }, 'No speaker selected, pausing simulation');
      await this.pauseSimulation(worldId);
      return;
    }

    log.debug({ worldId, speakerId: speakerAgent.id }, 'Speaker selected');

    // Generar respuesta del agente en contexto grupal
    const response = await this.generateAgentResponse(speakerAgent, context);

    // Guardar interacción
    const interaction = await this.saveInteraction(
      worldId,
      speakerAgent.id,
      response,
      context
    );

    // Actualizar relaciones entre agentes
    await this.updateAgentRelations(worldId, speakerAgent.id, response, context);

    // Actualizar simulation state
    const updatedSimState = await this.updateSimulationState(worldId, speakerAgent.id, context);

    // Emitir evento WebSocket para notificar a clientes
    worldSocketEvents.emitInteraction({
      worldId,
      interactionId: interaction.id,
      speakerId: speakerAgent.id,
      speakerName: speakerAgent.name,
      speakerAvatar: undefined,
      targetId: undefined,
      targetName: undefined,
      content: response,
      turnNumber: interaction.turnNumber,
      speakerEmotion: interaction.speakerEmotion,
      interactionType: 'dialogue',
      timestamp: interaction.createdAt,
    });

    // ========================================
    // NARRATIVE ANALYSIS & EMERGENT EVENTS
    // ========================================
    // Analizar narrativa cada 10 turnos (optimizado para costos)
    // Reducido de 3 a 10 para minimizar requests innecesarios
    if (updatedSimState.totalInteractions % 10 === 0 && updatedSimState.totalInteractions > 0) {
      try {
        // 1. Obtener interacciones recientes para análisis
        const recentInteractions = await prisma.worldInteraction.findMany({
          where: { worldId },
          orderBy: { turn: 'desc' },
          take: 20,
          include: {
            speaker: {
              select: { name: true },
            },
          },
        });

        const interactionsForAnalysis: InteractionForAnalysis[] = recentInteractions.reverse().map(i => ({
          id: i.id,
          speakerId: i.speakerId,
          speakerName: i.speaker.name,
          content: i.content,
          sentiment: i.sentiment || undefined,
          turn: i.turnNumber,
          emotionalState: i.speakerEmotion as any,
        }));

        // 2. Analizar narrativa
        const analyzer = getNarrativeAnalyzer(worldId);
        const { metrics, warnings } = await analyzer.analyze(interactionsForAnalysis);

        log.info(
          {
            worldId,
            metrics: {
              repetition: metrics.repetitionScore.toFixed(2),
              tension: metrics.dramaticTension.toFixed(2),
              engagement: metrics.engagementScore.toFixed(2),
              balance: metrics.speakerBalance.toFixed(2),
            },
            warningsCount: warnings.length,
          },
          '📊 Narrative analysis completed'
        );

        // 3. Loggear warnings críticos
        for (const warning of warnings.filter(w => w.severity === 'critical' || w.severity === 'high')) {
          log.warn(
            {
              worldId,
              type: warning.type,
              severity: warning.severity,
              message: warning.message,
            },
            `⚠️  ${warning.message}`
          );
        }

        // 4. Generar evento emergente si es necesario
        const emergentGenerator = getEmergentEventsGenerator(worldId);

        // Limpiar evento emergente si ya expiró (después de 3 turnos)
        const activeEvent = await emergentGenerator.getActiveEvent();
        if (activeEvent) {
          const eventAge = updatedSimState.totalInteractions - (activeEvent.turnTriggered || 0);
          if (eventAge >= 3) {
            await emergentGenerator.clearEvent();
            log.info({ worldId }, '🎪 Emergent event cleared (expired)');
          }
        } else {
          // Solo generar nuevo evento si no hay uno activo
          const emergentEvent = await emergentGenerator.evaluateAndGenerate(metrics, warnings);
          if (emergentEvent) {
            await emergentGenerator.applyEvent(emergentEvent, updatedSimState.totalInteractions);
          }
        }

      } catch (analysisError) {
        log.error({ worldId, error: analysisError }, 'Narrative analysis failed (non-critical)');
      }
    }

    // ========================================
    // DIRECTOR AI EVALUATION
    // ========================================
    // El Director evalúa cada interacción y toma decisiones narrativas
    if (await shouldDirectorEvaluate(worldId, updatedSimState.totalInteractions)) {
      try {
        const director = getAIDirector(worldId);
        await director.evaluateAndAct(updatedSimState.totalInteractions);

        // Actualizar progreso de historia
        const storyEngine = getStoryEngine(worldId);
        await storyEngine.updateStoryProgress();

        // Calcular métricas de importancia de personajes
        const importanceManager = getCharacterImportanceManager(worldId);
        await importanceManager.calculateImportanceMetrics();

      } catch (directorError) {
        log.error({ worldId, error: directorError }, 'Director evaluation failed (non-critical)');
      }
    }

    const duration = Date.now() - timer;
    log.debug(
      { worldId, speakerId: speakerAgent.id, duration },
      'Simulation turn completed'
    );
  }

  /**
   * Carga todo el contexto necesario para una interacción
   * 🔥 OPTIMIZADO: Usa Redis cache para reducir DB queries
   */
  private async loadInteractionContext(worldId: string): Promise<InteractionContext> {
    const redisService = getWorldStateRedis();

    // 🔥 REDIS: Intentar cargar de cache primero
    const cachedState = await redisService.getWorldState(worldId);

    if (cachedState) {
      // Cache HIT: usar datos de Redis
      log.debug({ worldId }, '✅ Using cached world state');

      const [agentsWithDetails, relations] = await Promise.all([
        // Solo necesitamos cargar detalles de personalidad y estado
        prisma.worldAgent.findMany({
          where: { worldId, isActive: true },
          include: {
            agent: {
              include: {
                personalityCore: true,
                internalState: true,
                semanticMemory: true,
              },
            },
          },
        }),

        // Cargar relaciones entre agentes (menos frecuentes, OK desde DB)
        prisma.agentToAgentRelation.findMany({
          where: { worldId },
        }),
      ]);

      const world = {
        ...cachedState.world,
        simulationState: cachedState.simulationState,
      };

      // Construir mapa de agentes
      const agentInfos: AgentInfo[] = agentsWithDetails.map(wa => ({
        id: wa.agent.id,
        name: wa.agent.name,
        description: wa.agent.description || '',
        systemPrompt: wa.agent.systemPrompt,
        personality: wa.agent.personalityCore,
        emotionalState: wa.agent.internalState,
      }));

      // Construir mapa de relaciones por agente
      const agentRelations = new Map<string, any[]>();
      for (const agent of agentInfos) {
        const rels = relations.filter(r => r.subjectId === agent.id);
        agentRelations.set(agent.id, rels);
      }

      return {
        world: world as any,
        agents: agentInfos,
        recentInteractions: cachedState.recentInteractions.slice(-20),
        agentRelations,
      };
    }

    // Cache MISS: cargar de DB (fallback)
    log.debug({ worldId }, '⚠️  Cache miss - loading from DB');

    const [world, agents, recentInteractions, relations] = await Promise.all([
      // Cargar mundo
      prisma.world.findUnique({
        where: { id: worldId },
        include: {
          simulationState: true,
        },
      }),

      // Cargar agentes activos
      prisma.worldAgent.findMany({
        where: { worldId, isActive: true },
        include: {
          agent: {
            include: {
              personalityCore: true,
              internalState: true,
              semanticMemory: true,
            },
          },
        },
      }),

      // Cargar interacciones recientes (últimas 20)
      prisma.worldInteraction.findMany({
        where: { worldId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // Cargar relaciones entre agentes
      prisma.agentToAgentRelation.findMany({
        where: { worldId },
      }),
    ]);

    if (!world) {
      throw new Error(`World ${worldId} not found`);
    }

    // Construir mapa de agentes
    const agentInfos: AgentInfo[] = agents.map(wa => ({
      id: wa.agent.id,
      name: wa.agent.name,
      description: wa.agent.description || '',
      systemPrompt: wa.agent.systemPrompt,
      personality: wa.agent.personalityCore,
      emotionalState: wa.agent.internalState,
    }));

    // Construir mapa de relaciones por agente
    const agentRelations = new Map<string, any[]>();
    for (const agent of agentInfos) {
      const rels = relations.filter(r => r.subjectId === agent.id);
      agentRelations.set(agent.id, rels);
    }

    return {
      world,
      agents: agentInfos,
      recentInteractions: recentInteractions.reverse(), // Orden cronológico
      agentRelations,
    };
  }

  /**
   * Selecciona el próximo agente que hablará
   *
   * Algoritmo:
   * - Evita que el mismo agente hable dos veces seguidas
   * - Balancea la participación de todos los agentes
   * - Considera el contexto de la conversación
   * - Respeta sugerencias del Director AI (en story mode)
   * - Prioriza personajes según importancia narrativa
   */
  private async selectNextSpeaker(context: InteractionContext): Promise<AgentInfo | null> {
    const { agents, recentInteractions, world } = context;

    if (agents.length === 0) return null;
    if (agents.length === 1) return agents[0];

    // Obtener sugerencia del Director (si está en story mode)
    let directorSuggestion: string | undefined;
    if (world.storyMode && world.currentSceneDirection) {
      const sceneDir = world.currentSceneDirection as any;
      directorSuggestion = sceneDir?.nextSpeakerSuggestion;
    }

    // Obtener último hablante
    const lastInteraction = recentInteractions[recentInteractions.length - 1];
    const lastSpeakerId = lastInteraction?.speakerId;

    // Obtener estadísticas de participación
    const participationCounts = new Map<string, number>();
    for (const agent of agents) {
      const count = recentInteractions.filter(i => i.speakerId === agent.id).length;
      participationCounts.set(agent.id, count);
    }

    // Obtener información de importancia desde WorldAgent
    const worldAgentsMap = new Map<string, any>();
    const worldAgents = await prisma.worldAgent.findMany({
      where: { worldId: world.id, isActive: true },
    });
    worldAgents.forEach(wa => worldAgentsMap.set(wa.agentId, wa));

    // Calcular scores para cada agente
    const scores = agents
      .filter(a => a.id !== lastSpeakerId) // Evitar repetir speaker
      .map(agent => {
        let score = 0;

        // Factor 1: Menor participación = mayor score (balance)
        const participation = participationCounts.get(agent.id) || 0;
        const avgParticipation =
          Array.from(participationCounts.values()).reduce((a, b) => a + b, 0) / agents.length;
        score += Math.max(0, avgParticipation - participation) * 10;

        // Factor 2: Estado emocional (agentes con alta activación hablan más)
        if (agent.emotionalState) {
          const arousal = agent.emotionalState.moodArousal || 0.5;
          score += arousal * 5;
        }

        // Factor 3: Personalidad extroversión (Big Five)
        if (agent.personality) {
          const extraversion = (agent.personality.extraversion || 50) / 100;
          score += extraversion * 3;
        }

        // Factor 4: Si fue mencionado en la última interacción
        if (lastInteraction && lastInteraction.content.toLowerCase().includes(agent.name.toLowerCase())) {
          score += 15;
        }

        // Factor 5: Importancia narrativa (en story mode)
        const worldAgent = worldAgentsMap.get(agent.id);
        if (worldAgent && world.storyMode) {
          const importanceLevel = worldAgent.importanceLevel;
          if (importanceLevel === 'main') {
            score += 20; // Protagonistas hablan mucho más
          } else if (importanceLevel === 'secondary') {
            score += 8; // Secundarios hablan moderadamente
          }
          // Filler characters no reciben bonus
        }

        // Factor 6: Sugerencia del Director AI (MÁXIMA PRIORIDAD)
        if (directorSuggestion && agent.name === directorSuggestion) {
          score += 50; // Fuerte boost del Director
          log.debug(
            { worldId: world.id, agentName: agent.name },
            '🎬 Director suggested this speaker'
          );
        }

        // Factor 7: Si está en foco del Director
        if (worldAgent?.isFocused && worldAgent.focusedUntil && new Date(worldAgent.focusedUntil) > new Date()) {
          score += 12;
        }

        return { agent, score };
      });

    // Ordenar por score y seleccionar con algo de aleatoriedad
    scores.sort((a, b) => b.score - a.score);

    // Top 3 candidatos
    const topCandidates = scores.slice(0, Math.min(3, scores.length));

    // Selección con pesos (el mejor tiene más probabilidad pero no es 100%)
    const totalScore = topCandidates.reduce((sum, c) => sum + c.score, 0);
    let random = Math.random() * totalScore;

    for (const candidate of topCandidates) {
      random -= candidate.score;
      if (random <= 0) {
        return candidate.agent;
      }
    }

    // Fallback
    return topCandidates[0]?.agent || agents[0];
  }

  /**
   * Genera la respuesta de un agente considerando el contexto grupal
   */
  private async generateAgentResponse(
    speaker: AgentInfo,
    context: InteractionContext
  ): Promise<string> {
    const { world, agents, recentInteractions } = context;

    // Construir prompt de contexto grupal
    const groupContextPrompt = await this.buildGroupContextPrompt(speaker, context);

    // Construir historial de conversación
    const conversationHistory = recentInteractions
      .slice(-10) // Últimas 10 interacciones
      .map(interaction => {
        const speakerName = agents.find(a => a.id === interaction.speakerId)?.name || 'Unknown';
        return `${speakerName}: ${interaction.content}`;
      })
      .join('\n');

    // Obtener dirección de escena del Director (si existe)
    let directorGuidance = '';
    if (world.storyMode && world.currentSceneDirection) {
      const sceneDir = world.currentSceneDirection as any;
      if (sceneDir) {
        directorGuidance = `\n=== DIRECCIÓN DE ESCENA ===
Tono sugerido: ${sceneDir.tone || 'balanced'}
Intensidad emocional: ${sceneDir.emotionalIntensity || 0.5}
Ritmo: ${sceneDir.pacing || 'medium'}
${sceneDir.narrativeGuidance ? `Guía narrativa: ${sceneDir.narrativeGuidance}` : ''}
`;
      }
    }

    // Obtener evento emergente activo (si existe)
    let emergentEventPrompt = '';
    if (world.storyMode && world.currentEmergentEvent) {
      const event = world.currentEmergentEvent as any;
      emergentEventPrompt = `\n=== 🎪 EVENTO EMERGENTE ===
${event.name}: ${event.description}

${event.prompt}

IMPORTANTE: Este evento acaba de ocurrir. Reacciona naturalmente a esta nueva situación.
`;
    }

    // Construir prompt completo
    const fullPrompt = `${speaker.systemPrompt}

${groupContextPrompt}

=== CONVERSACIÓN RECIENTE ===
${conversationHistory || '(Inicio de la conversación)'}
${directorGuidance}
${emergentEventPrompt}

=== INSTRUCCIONES ===
Responde como ${speaker.name} en este contexto grupal. Tu respuesta debe:
- Ser natural y coherente con la conversación
- Reflejar tu personalidad y estado emocional actual
- Considerar las relaciones con los otros agentes
- No ser demasiado larga (máximo 2-3 oraciones)
- Avanzar la conversación de forma interesante
${world.storyMode ? '- Seguir la dirección de escena sugerida (tone, pacing)' : ''}
${emergentEventPrompt ? '- REACCIONAR al evento emergente que acaba de ocurrir' : ''}

NO incluyas tu nombre al inicio de la respuesta, solo el contenido.`;

    // Generar respuesta con Venice (sin censura, mejor para simulación)
    const venice = getVeniceClient();
    const response = await venice.generateWithSystemPrompt(
      fullPrompt,
      'Continúa la conversación de forma natural.',
      {
        model: 'llama-3.3-70b', // Modelo balanceado
        temperature: 0.8,
        maxTokens: 300, // ~2-3 oraciones
      }
    );

    return response.text.trim();
  }

  /**
   * Construye el prompt de contexto grupal para un agente
   */
  private async buildGroupContextPrompt(speaker: AgentInfo, context: InteractionContext): Promise<string> {
    const { world, agents, agentRelations } = context;

    const otherAgents = agents.filter(a => a.id !== speaker.id);
    const speakerRelations = agentRelations.get(speaker.id) || [];

    let prompt = `\n=== CONTEXTO DEL MUNDO ===\n`;
    prompt += `Mundo: ${world.name}\n`;
    if (world.description) {
      prompt += `Descripción: ${world.description}\n`;
    }
    if (world.scenario) {
      prompt += `Escenario: ${world.scenario}\n`;
    }
    if (world.initialContext) {
      prompt += `Contexto: ${world.initialContext}\n`;
    }

    prompt += `\n=== OTROS PARTICIPANTES ===\n`;
    for (const agent of otherAgents) {
      prompt += `\n- ${agent.name}`;
      if (agent.description) {
        prompt += `: ${agent.description}`;
      }

      // Añadir información de relación si existe
      const relation = speakerRelations.find((r: any) => r.targetId === agent.id);
      if (relation) {
        const stage = relation.stage;
        const trust = (relation.trust * 100).toFixed(0);
        const affinity = (relation.affinity * 100).toFixed(0);
        prompt += `\n  Relación: ${stage} (confianza: ${trust}%, afinidad: ${affinity}%)`;
      }
    }

    prompt += `\n\n=== TU ESTADO ACTUAL ===\n`;
    if (speaker.emotionalState) {
      const emotions = speaker.emotionalState.currentEmotions;
      const topEmotions = Object.entries(emotions)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .map(([emotion, value]: any) => `${emotion} (${(value * 100).toFixed(0)}%)`)
        .join(', ');
      prompt += `Estado emocional: ${topEmotions}\n`;
    }

    // ========================================
    // ESTADO FÍSICO Y EFECTOS PERSISTENTES
    // ========================================
    try {
      const eventService = getEventApplicationService(world.id);
      const stateDescription = await eventService.getAgentStateDescription(speaker.id);

      if (stateDescription) {
        prompt += `\nEstado físico: ${stateDescription}\n`;

        // Obtener efectos activos
        const activeEffects = await eventService.getActiveEffects(speaker.id);
        if (activeEffects.length > 0) {
          prompt += `\nEfectos activos:\n`;
          for (const effect of activeEffects.slice(0, 3)) {
            const effectDesc = effect.metadata?.description || effect.type;
            const severity = (effect.severity * 100).toFixed(0);
            prompt += `  - ${effectDesc} (severidad: ${severity}%)\n`;
          }
        }
      }
    } catch (error) {
      // Si falla, continuar sin estado físico
      log.warn({ speakerId: speaker.id, error }, 'Failed to load agent state for prompt');
    }

    // ========================================
    // EPISODIC MEMORY: Memorias relevantes
    // ========================================
    try {
      const memoryService = new WorldAgentMemoryService(world.id);

      // Construir query basada en conversación reciente
      const recentContent = context.recentInteractions
        .slice(-5)
        .map(i => i.content)
        .join(' ');

      const memories = await memoryService.retrieveRelevantEpisodes({
        agentId: speaker.id,
        query: recentContent,
        limit: 3, // Máximo 3 memorias para no saturar el prompt
        minImportance: 0.5,
        emotionalContext: {
          currentEmotion: this.getDominantEmotion(speaker.emotionalState?.currentEmotions),
          currentValence: this.calculateEmotionalValence(speaker.emotionalState?.currentEmotions || {}),
        },
      });

      if (memories.length > 0) {
        prompt += `\n=== MEMORIAS RELEVANTES ===\n`;
        for (const { memory, relevanceReason } of memories) {
          const turnsAgo = (context.world.simulationState?.currentTurn || 0) - memory.turnNumber;
          prompt += `\n- (Turno ${memory.turnNumber}, hace ${turnsAgo} turnos): ${memory.event}`;

          if (memory.dominantEmotion) {
            prompt += ` [${memory.dominantEmotion}]`;
          }
        }
        prompt += `\n`;
      }
    } catch (error) {
      // Si falla, continuar sin memorias
      log.warn({ speakerId: speaker.id, error }, 'Failed to load episodic memories for prompt');
    }

    return prompt;
  }

  /**
   * Guarda una interacción en la base de datos
   */
  private async saveInteraction(
    worldId: string,
    speakerId: string,
    content: string,
    context: InteractionContext
  ): Promise<any> {
    const simState = context.world.simulationState;
    const turnNumber = (simState?.currentTurn || 0) + 1;

    // Obtener estado emocional del speaker
    const speaker = context.agents.find(a => a.id === speakerId);
    const speakerEmotion = speaker?.emotionalState?.currentEmotions || null;

    // Crear mensaje en tabla Message (para compatibilidad)
    const message = await prisma.message.create({
      data: {
        worldId,
        role: 'assistant',
        content,
        metadata: {
          speakerId,
          speakerName: speaker?.name,
          turnNumber,
          emotions: speakerEmotion,
        },
      },
    });

    // Crear interacción específica de mundo
    const interaction = await prisma.worldInteraction.create({
      data: {
        worldId,
        speakerId,
        content,
        messageId: message.id,
        speakerEmotion,
        interactionType: 'dialogue',
        turnNumber,
        metadata: {},
      },
    });

    // Actualizar estadísticas del WorldAgent
    await prisma.worldAgent.update({
      where: {
        worldId_agentId: {
          worldId,
          agentId: speakerId,
        },
      },
      data: {
        totalInteractions: { increment: 1 },
        lastInteractionAt: new Date(),
      },
    });

    // ========================================
    // EPISODIC MEMORY: Guardar eventos importantes
    // ========================================
    await this.saveEpisodicMemoryIfImportant(
      worldId,
      speakerId,
      content,
      turnNumber,
      context
    );

    return interaction;
  }

  /**
   * Actualiza las relaciones entre agentes basándose en la interacción
   */
  private async updateAgentRelations(
    worldId: string,
    speakerId: string,
    content: string,
    context: InteractionContext
  ): Promise<void> {
    const { agents } = context;
    const otherAgents = agents.filter(a => a.id !== speakerId);

    for (const targetAgent of otherAgents) {
      // Obtener o crear relación
      let relation = await prisma.agentToAgentRelation.findUnique({
        where: {
          worldId_subjectId_targetId: {
            worldId,
            subjectId: speakerId,
            targetId: targetAgent.id,
          },
        },
      });

      if (!relation) {
        relation = await prisma.agentToAgentRelation.create({
          data: {
            worldId,
            subjectId: speakerId,
            targetId: targetAgent.id,
            trust: 0.5,
            affinity: 0.5,
            respect: 0.5,
            attraction: 0.5,
          },
        });
      }

      // Analizar el contenido para determinar el tipo de interacción
      const sentiment = this.analyzeSentiment(content);

      // Actualizar métricas relacionales
      const updates: any = {
        totalInteractions: { increment: 1 },
        lastInteractionAt: new Date(),
      };

      if (sentiment > 0.3) {
        updates.positiveInteractions = { increment: 1 };
        updates.affinity = { increment: 0.02 };
        updates.trust = { increment: 0.01 };
      } else if (sentiment < -0.3) {
        updates.negativeInteractions = { increment: 1 };
        updates.affinity = { decrement: 0.02 };
      } else {
        updates.neutralInteractions = { increment: 1 };
      }

      // Progresión de stage basado en interacciones
      const newTotal = relation.totalInteractions + 1;
      if (newTotal >= 20 && relation.stage === 'strangers') {
        updates.stage = 'acquaintances';
      } else if (newTotal >= 50 && relation.stage === 'acquaintances') {
        updates.stage = 'friends';
      } else if (newTotal >= 100 && relation.stage === 'friends') {
        updates.stage = 'close';
      }

      await prisma.agentToAgentRelation.update({
        where: { id: relation.id },
        data: updates,
      });

      // También actualizar la relación inversa (bidireccional)
      await this.ensureBidirectionalRelation(
        worldId,
        targetAgent.id,
        speakerId,
        sentiment
      );
    }
  }

  /**
   * Asegura que existe la relación bidireccional y la actualiza
   */
  private async ensureBidirectionalRelation(
    worldId: string,
    subjectId: string,
    targetId: string,
    sentiment: number
  ): Promise<void> {
    const relation = await prisma.agentToAgentRelation.upsert({
      where: {
        worldId_subjectId_targetId: {
          worldId,
          subjectId,
          targetId,
        },
      },
      create: {
        worldId,
        subjectId,
        targetId,
        trust: 0.5,
        affinity: 0.5 + sentiment * 0.1,
        respect: 0.5,
        attraction: 0.5,
      },
      update: {
        totalInteractions: { increment: 1 },
        lastInteractionAt: new Date(),
      },
    });
  }

  /**
   * Analiza el sentiment de un texto (-1 a 1)
   * TODO: Implementar análisis más sofisticado con NLP
   */
  private analyzeSentiment(text: string): number {
    const positiveWords = ['gracias', 'bien', 'excelente', 'genial', 'feliz', 'amor', 'bueno', 'agradable'];
    const negativeWords = ['mal', 'terrible', 'odio', 'triste', 'horrible', 'desagradable', 'molesto'];

    const lowerText = text.toLowerCase();
    let score = 0;

    for (const word of positiveWords) {
      if (lowerText.includes(word)) score += 0.2;
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) score -= 0.2;
    }

    return Math.max(-1, Math.min(1, score));
  }

  /**
   * Actualiza el estado de simulación del mundo
   * 🔥 OPTIMIZADO: Actualiza Redis inmediatamente, DB en background
   */
  private async updateSimulationState(
    worldId: string,
    speakerId: string,
    context: InteractionContext
  ): Promise<{ currentTurn: number; totalInteractions: number }> {
    const simState = context.world.simulationState;

    if (!simState) {
      log.warn({ worldId }, 'No simulation state found');
      return { currentTurn: 0, totalInteractions: 0 };
    }

    const newTurn = (simState.currentTurn || 0) + 1;
    const newTotal = (simState.totalInteractions || 0) + 1;

    // Actualizar active speakers (últimos 5)
    const activeSpeakers = Array.isArray(simState.activeSpeakers)
      ? simState.activeSpeakers
      : [];
    const updatedSpeakers = [speakerId, ...activeSpeakers.filter((id: string) => id !== speakerId)].slice(0, 5);

    // 🔥 REDIS: Actualizar cache primero (fast path)
    const redisService = getWorldStateRedis();
    const cachedState = await redisService.getWorldState(worldId);

    if (cachedState && cachedState.simulationState) {
      // Actualizar en memoria
      cachedState.simulationState.currentTurn = newTurn;
      cachedState.simulationState.totalInteractions = newTotal;
      cachedState.simulationState.lastSpeakerId = speakerId;
      cachedState.simulationState.activeSpeakers = updatedSpeakers;
      cachedState.simulationState.lastUpdated = new Date();

      // Guardar en Redis (no bloqueante)
      await redisService.saveWorldState(worldId, cachedState);

      log.debug({ worldId, turn: newTurn }, '✅ State updated in Redis cache');
    }

    // 🔥 OPTIMIZATION: Actualizar DB solo cada 10 turnos o si Redis falla
    if (newTurn % 10 === 0 || !cachedState) {
      const updated = await prisma.worldSimulationState.update({
        where: { id: simState.id },
        data: {
          currentTurn: newTurn,
          totalInteractions: newTotal,
          lastSpeakerId: speakerId,
          activeSpeakers: updatedSpeakers,
          lastUpdated: new Date(),
        },
      });

      log.debug({ worldId, turn: newTurn }, '💾 State synced to database');

      return { currentTurn: updated.currentTurn, totalInteractions: updated.totalInteractions };
    }

    // Retornar valores en memoria
    return { currentTurn: newTurn, totalInteractions: newTotal };
  }

  /**
   * Guarda episodio en memoria episódica si es importante
   *
   * Criterios para guardar:
   * - Eventos emergentes (siempre)
   * - Alta importancia narrativa (importance > 0.7)
   * - Alto arousal emocional (arousal > 0.8)
   * - Interacciones entre múltiples agentes con importancia moderada
   */
  private async saveEpisodicMemoryIfImportant(
    worldId: string,
    speakerId: string,
    content: string,
    turnNumber: number,
    context: InteractionContext
  ): Promise<void> {
    try {
      const speaker = context.agents.find(a => a.id === speakerId);
      if (!speaker) return;

      // Calcular importance basada en múltiples factores
      let importance = 0.5; // Base

      // Factor 1: Eventos emergentes son siempre importantes
      const isEmergentEvent = context.world.currentEmergentEvent !== null;
      if (isEmergentEvent) {
        importance = Math.max(importance, 0.8);
      }

      // Factor 2: Estado emocional del speaker
      const emotionalState = speaker.emotionalState?.currentEmotions || {};
      const emotionalIntensity = Object.values(emotionalState).reduce((sum: number, val: any) => sum + val, 0) / Object.keys(emotionalState).length;

      if (emotionalIntensity > 0.7) {
        importance = Math.max(importance, 0.7);
      }

      // Factor 3: Menciones de otros agentes (interacción social importante)
      const mentionedAgents = context.agents.filter(a =>
        a.id !== speakerId && content.toLowerCase().includes(a.name.toLowerCase())
      );

      if (mentionedAgents.length > 0) {
        importance = Math.max(importance, 0.6);
      }

      // Factor 4: Story mode - eventos en momentos clave de la historia
      if (context.world.storyMode && context.world.storyProgress) {
        const progress = context.world.storyProgress as number;
        // Hitos narrativos importantes: inicio, acto 2, climax, final
        if (progress < 0.1 || (progress > 0.4 && progress < 0.6) || progress > 0.85) {
          importance = Math.max(importance, 0.7);
        }
      }

      // Calcular emotional arousal
      const emotionalArousal = speaker.emotionalState?.moodArousal || 0.5;

      // Calcular emotional valence
      const emotionalValence = this.calculateEmotionalValence(emotionalState);

      // Determinar agentes involucrados (mencionados + speaker)
      const involvedAgentIds = [
        ...mentionedAgents.map(a => a.id),
      ];

      // Verificar si debe guardarse
      const shouldSave = shouldSaveEpisode({
        importance,
        emotionalArousal,
        involvedAgentsCount: involvedAgentIds.length + 1, // +1 por el speaker
        isEmergentEvent,
      });

      if (!shouldSave) {
        return;
      }

      // Guardar episodio para el speaker
      const memoryService = new WorldAgentMemoryService(worldId);
      await memoryService.saveEpisode({
        agentId: speakerId,
        event: content,
        involvedAgentIds,
        turnNumber,
        importance,
        emotionalArousal,
        emotionalValence,
        dominantEmotion: this.getDominantEmotion(emotionalState),
        agentEmotions: {
          [speakerId]: emotionalState,
        },
        metadata: {
          isEmergentEvent,
          storyProgress: context.world.storyProgress,
          mentionedAgents: mentionedAgents.map(a => ({ id: a.id, name: a.name })),
        },
      });

      // También guardar para agentes mencionados (desde su perspectiva)
      for (const mentionedAgent of mentionedAgents) {
        const observedEvent = `${speaker.name} dijo: "${content}"`;

        await memoryService.saveEpisode({
          agentId: mentionedAgent.id,
          event: observedEvent,
          involvedAgentIds: [speakerId, ...involvedAgentIds.filter(id => id !== mentionedAgent.id)],
          turnNumber,
          importance: importance * 0.8, // Ligeramente menos importante para observadores
          emotionalArousal: emotionalArousal * 0.7,
          emotionalValence,
          metadata: {
            isObserved: true,
            speakerId,
            speakerName: speaker.name,
          },
        });
      }

      log.debug(
        {
          worldId,
          speakerId,
          turnNumber,
          importance,
          involvedCount: involvedAgentIds.length + 1
        },
        '💾 Episodic memory saved'
      );

    } catch (error) {
      log.error({ error, worldId, speakerId }, 'Failed to save episodic memory');
      // No bloqueante - continuar simulación
    }
  }

  /**
   * Calcula valence emocional promedio (-1 a 1)
   */
  private calculateEmotionalValence(emotions: any): number {
    const positiveEmotions = ['joy', 'satisfaction', 'relief', 'happy_for', 'pride', 'admiration', 'gratitude', 'liking', 'affection', 'love'];
    const negativeEmotions = ['distress', 'disappointment', 'fears_confirmed', 'resentment', 'pity', 'shame', 'reproach', 'anger', 'disliking'];

    let positiveSum = 0;
    let negativeSum = 0;

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if (positiveEmotions.includes(emotion)) {
        positiveSum += intensity as number;
      } else if (negativeEmotions.includes(emotion)) {
        negativeSum += intensity as number;
      }
    }

    const total = positiveSum + negativeSum;
    if (total === 0) return 0;

    return (positiveSum - negativeSum) / total;
  }

  /**
   * Obtiene la emoción dominante
   */
  private getDominantEmotion(emotions: any): string | undefined {
    if (!emotions || Object.keys(emotions).length === 0) return undefined;

    let maxEmotion = '';
    let maxIntensity = 0;

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if ((intensity as number) > maxIntensity) {
        maxIntensity = intensity as number;
        maxEmotion = emotion;
      }
    }

    return maxEmotion;
  }

  /**
   * Obtiene el estado actual de un mundo
   */
  isSimulationRunning(worldId: string): boolean {
    const state = this.activeWorlds.get(worldId);
    return state?.isRunning || false;
  }

  /**
   * Limpia todas las simulaciones activas (para shutdown)
   */
  async cleanup(): Promise<void> {
    log.info({ count: this.activeWorlds.size }, 'Cleaning up active simulations');

    for (const worldId of this.activeWorlds.keys()) {
      await this.pauseSimulation(worldId);
    }

    this.activeWorlds.clear();
  }
}

// Export singleton instance
export const worldSimulationEngine = new WorldSimulationEngine();
