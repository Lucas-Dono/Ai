import { prisma } from "@/lib/prisma";
import { getVeniceClient } from "@/lib/emotional-system/llm/venice";
import { ProximityDetector } from "./proximity-detector";
import {
  MinecraftPlayer,
  MinecraftAgent,
  ProximityContext,
  DirectorAnalysis,
  ConversationContext,
  DIRECTOR_CONSTANTS,
  GROUP_KEYWORDS,
  AMBIGUOUS_REFERENCES,
} from "@/types/minecraft-chat";

/**
 * Conversational Director para Minecraft
 *
 * Analiza el contexto completo y decide:
 * - ¿Quién debe responder? (individual, grupal, redirección)
 * - ¿Qué comandos ejecutar? (movimiento, redirecciones)
 * - ¿Cómo estructurar la respuesta? (partes, continuaciones)
 *
 * El objetivo es generar TODO el plan en una sola llamada LLM para minimizar costos.
 */
export class ConversationalDirector {
  private readonly proximityDetector = new ProximityDetector();

  /**
   * Analiza el contexto completo y genera plan de respuesta
   */
  async analyzeContext(
    player: MinecraftPlayer,
    message: string,
    nearbyAgents: MinecraftAgent[],
    proximityContext: ProximityContext
  ): Promise<DirectorAnalysis> {
    // 1. Cargar contexto conversacional reciente
    const conversationContext = await this.loadConversationContext(
      player.userId!,
      nearbyAgents.map((a) => a.agentId)
    );

    // 2. Detectar contexto visual (mirando a NPC + distancia)
    const visualContext = this.analyzeVisualContext(
      proximityContext,
      conversationContext
    );

    // 3. Detectar menciones y ambigüedades
    const linguisticContext = this.analyzeLinguisticContext(
      message,
      nearbyAgents
    );

    // 4. Determinar tipo de conversación
    const conversationType = this.determineConversationType(
      visualContext,
      linguisticContext,
      conversationContext
    );

    // 5. Seleccionar responders
    const responders = this.selectResponders(
      conversationType,
      visualContext,
      linguisticContext,
      proximityContext,
      conversationContext
    );

    // 6. Planificar movimientos si es necesario
    const movementPlan = this.planMovements(
      proximityContext,
      responders.primaryResponderId
    );

    return {
      conversationType,
      primaryResponderId: responders.primaryResponderId,
      secondaryResponders: responders.secondaryResponders,
      reasoning: responders.reasoning,
      detectedContext: {
        ...visualContext,
        ...linguisticContext,
      },
      requiresMovement: movementPlan.length > 0,
      movementPlan,
    };
  }

  /**
   * Genera respuesta estructurada usando LLM
   *
   * Incluye todo en una sola llamada:
   * - Mensaje de speech
   * - Comandos de movimiento
   * - Redirecciones a otros agentes
   * - Mensajes de continuación
   */
  async generateStructuredResponse(
    analysis: DirectorAnalysis,
    player: MinecraftPlayer,
    message: string,
    nearbyAgents: MinecraftAgent[],
    conversationHistory: string
  ): Promise<any> {
    const primaryAgent = nearbyAgents.find(
      (a) => a.agentId === analysis.primaryResponderId
    );

    if (!primaryAgent) {
      throw new Error("Primary agent not found");
    }

    // Cargar datos completos del agente
    const agentData = await prisma.agent.findUnique({
      where: { id: primaryAgent.agentId },
      include: {
        PersonalityCore: true,
      },
    });

    if (!agentData) {
      throw new Error("Agent data not found");
    }

    // Construir prompt para el director
    const directorPrompt = this.buildDirectorPrompt(
      agentData,
      analysis,
      player,
      message,
      nearbyAgents,
      conversationHistory
    );

    // Llamar a LLM (una sola vez)
    const venice = getVeniceClient();
    const systemPrompt = `Eres un director conversacional para un mundo 3D de Minecraft.
Debes generar respuestas estructuradas que incluyan diálogo, comandos y acciones.

Responde SIEMPRE en formato JSON con esta estructura:
{
  "parts": [
    {
      "type": "speech",
      "content": "...",
      "emotion": "...",
      "animationHint": "..."
    },
    {
      "type": "command",
      "command": {
        "type": "redirect_question" | "move_closer" | "walk_to_agent",
        "targetAgentId": "...",
        "question": "...",
        "pauseMessage": true/false
      }
    },
    {
      "type": "continuation",
      "content": "...",
      "continuesAfterCommand": true
    }
  ]
}`;

    const completion = await venice.generateWithSystemPrompt(
      systemPrompt,
      directorPrompt,
      {
        model: "llama-3.3-70b",
        temperature: 0.8,
        maxTokens: 500,
      }
    );

    const content = completion.text;

    if (!content) {
      throw new Error("Venice returned empty response");
    }

    // Parse JSON response
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error("Failed to parse structured response:", content);
      // Fallback: respuesta simple
      return {
        parts: [
          {
            type: "speech",
            content: content,
            emotion: "neutral",
            animationHint: "talking",
          },
        ],
      };
    }
  }

  /**
   * Carga contexto conversacional reciente
   */
  private async loadConversationContext(
    userId: string,
    agentIds: string[]
  ): Promise<ConversationContext> {
    const recentMessages = await prisma.groupMessage.findMany({
      where: {
        userId,
        agentId: { in: agentIds },
        createdAt: {
          gte: new Date(
            Date.now() - DIRECTOR_CONSTANTS.CONVERSATION_CONTINUITY_WINDOW
          ),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        agentId: true,
        content: true,
        createdAt: true,
      },
    });

    const lastMessage = recentMessages[0];

    return {
      recentMessages: recentMessages.map((m) => ({
        agentId: m.agentId || "",
        content: m.content,
        timestamp: m.createdAt,
      })),
      lastSpokenAgentId: lastMessage?.agentId || null,
      lastSpokenAt: lastMessage?.createdAt || null,
      conversationContinuity:
        lastMessage &&
        Date.now() - lastMessage.createdAt.getTime() <
          DIRECTOR_CONSTANTS.CONVERSATION_CONTINUITY_WINDOW,
    };
  }

  /**
   * Analiza contexto visual (mirando a NPC, distancia)
   */
  private analyzeVisualContext(
    proximityContext: ProximityContext,
    conversationContext: ConversationContext
  ) {
    // Buscar NPC que está siendo mirado directamente
    const facingNPC = proximityContext.nearbyAgents.find(
      (a) => a.isFacing && a.distance <= DIRECTOR_CONSTANTS.INDIVIDUAL_DISTANCE_THRESHOLD / 2 // < 3.5 metros
    );

    return {
      isFacingNPC: !!facingNPC,
      facingNPCId: facingNPC?.agent.agentId || null,
      hasRecentHistory: conversationContext.conversationContinuity,
    };
  }

  /**
   * Analiza contexto lingüístico (menciones, ambigüedades)
   */
  private analyzeLinguisticContext(message: string, nearbyAgents: MinecraftAgent[]) {
    const lowerMessage = message.toLowerCase();

    // Detectar menciones de agentes
    const mentionedAgents = nearbyAgents
      .filter((agent) => {
        const lowerName = agent.name.toLowerCase();
        return (
          lowerMessage.includes(lowerName) ||
          lowerMessage.includes(`@${lowerName}`)
        );
      })
      .map((a) => a.agentId);

    // Detectar palabras clave grupales
    const groupKeywords = GROUP_KEYWORDS.filter((keyword) =>
      lowerMessage.includes(keyword)
    );

    // Detectar referencias ambiguas
    const ambiguousReference = AMBIGUOUS_REFERENCES.find((ref) =>
      lowerMessage.includes(ref)
    );

    return {
      mentionedAgents,
      groupKeywords: groupKeywords as string[],
      hasAmbiguity: !!ambiguousReference,
      ambiguousReference: ambiguousReference || null,
    };
  }

  /**
   * Determina tipo de conversación
   */
  private determineConversationType(
    visualContext: any,
    linguisticContext: any,
    conversationContext: ConversationContext
  ): "individual" | "group" | "redirected" {
    // Caso 1: Mirando a NPC + < 7 metros = individual
    if (visualContext.isFacingNPC) {
      return "individual";
    }

    // Caso 2: Mención explícita de un solo agente = individual
    if (linguisticContext.mentionedAgents.length === 1) {
      return "individual";
    }

    // Caso 3: Continuidad conversacional (habló hace < 1 min) = individual
    if (conversationContext.conversationContinuity) {
      return "individual";
    }

    // Caso 4: Palabras clave grupales = group
    if (linguisticContext.groupKeywords.length > 0) {
      return "group";
    }

    // Caso 5: Referencias ambiguas = redirected
    if (linguisticContext.hasAmbiguity) {
      return "redirected";
    }

    // Caso 6: Menciones múltiples = group
    if (linguisticContext.mentionedAgents.length > 1) {
      return "group";
    }

    // Default: individual (al agente más cercano)
    return "individual";
  }

  /**
   * Selecciona responders basado en el análisis
   */
  private selectResponders(
    conversationType: "individual" | "group" | "redirected",
    visualContext: any,
    linguisticContext: any,
    proximityContext: ProximityContext,
    conversationContext: ConversationContext
  ): {
    primaryResponderId: string;
    secondaryResponders: string[];
    reasoning: string;
  } {
    if (conversationType === "individual") {
      // Prioridad: mirando > mención > continuidad > cercanía
      let primaryId: string;
      let reasoning: string;

      if (visualContext.isFacingNPC) {
        primaryId = visualContext.facingNPCId!;
        reasoning = "Jugador está mirando directamente a este agente";
      } else if (linguisticContext.mentionedAgents.length === 1) {
        primaryId = linguisticContext.mentionedAgents[0];
        reasoning = "Agente mencionado explícitamente por nombre";
      } else if (conversationContext.conversationContinuity) {
        primaryId = conversationContext.lastSpokenAgentId!;
        reasoning = "Continuación de conversación reciente";
      } else {
        primaryId = proximityContext.nearbyAgents[0].agent.agentId;
        reasoning = "Agente más cercano al jugador";
      }

      return {
        primaryResponderId: primaryId,
        secondaryResponders: [],
        reasoning,
      };
    }

    if (conversationType === "group") {
      const primaryId = proximityContext.nearbyAgents[0].agent.agentId;
      const secondaryIds = proximityContext.nearbyAgents
        .slice(1, 3)
        .map((a) => a.agent.agentId);

      return {
        primaryResponderId: primaryId,
        secondaryResponders: secondaryIds,
        reasoning: "Conversación grupal detectada por palabras clave o menciones múltiples",
      };
    }

    // redirected
    return {
      primaryResponderId: proximityContext.nearbyAgents[0].agent.agentId,
      secondaryResponders: [],
      reasoning: "Referencia ambigua detectada, requiere redirección a otro agente",
    };
  }

  /**
   * Planifica movimientos necesarios
   */
  private planMovements(
    proximityContext: ProximityContext,
    primaryResponderId: string
  ): Array<{
    agentId: string;
    action: "move_closer" | "walk_to_agent" | "teleport_to_agent";
    reason: string;
  }> {
    const movements = [];

    const primaryAgent = proximityContext.nearbyAgents.find(
      (a) => a.agent.agentId === primaryResponderId
    );

    if (!primaryAgent) return [];

    const distanceInMeters = primaryAgent.distance * 2; // bloques a metros

    // Si está > 4 metros, acercarse a 3 metros
    if (distanceInMeters > DIRECTOR_CONSTANTS.MOVE_CLOSER_THRESHOLD) {
      movements.push({
        agentId: primaryResponderId,
        action: "move_closer" as const,
        reason: `Distancia actual ${distanceInMeters.toFixed(1)}m, acercándose a ${
          DIRECTOR_CONSTANTS.TARGET_DISTANCE
        }m`,
      });
    }

    return movements;
  }

  /**
   * Construye prompt para el director
   */
  private buildDirectorPrompt(
    agent: any,
    analysis: DirectorAnalysis,
    player: MinecraftPlayer,
    message: string,
    nearbyAgents: MinecraftAgent[],
    conversationHistory: string
  ): string {
    const agentName = agent.name;
    const playerName = player.name;

    let prompt = `Eres ${agentName} en el mundo de Minecraft. ${playerName} te está hablando.

CONTEXTO:
- Tipo de conversación: ${analysis.conversationType}
- ${analysis.reasoning}

`;

    // Agregar contexto de movimiento
    if (analysis.requiresMovement) {
      prompt += `MOVIMIENTO REQUERIDO:\n`;
      analysis.movementPlan.forEach((m) => {
        prompt += `- ${m.reason}\n`;
      });
      prompt += "\n";
    }

    // Agregar contexto de redirección
    if (analysis.detectedContext.hasAmbiguity) {
      prompt += `AMBIGÜEDAD DETECTADA:
El jugador usa "${analysis.detectedContext.ambiguousReference}" sin especificar quién.
Necesitas aclarar a quién se refiere y redirigir la pregunta a ese agente.

Agentes cercanos disponibles:
${nearbyAgents.map((a) => `- ${a.name} (ID: ${a.agentId})`).join("\n")}

`;
    }

    prompt += `HISTORIAL RECIENTE:
${conversationHistory}

MENSAJE DEL JUGADOR:
${playerName}: ${message}

INSTRUCCIONES:
`;

    if (analysis.conversationType === "redirected") {
      prompt += `1. Primero, pregunta aclarando: "¿Quién, [nombre del agente]?"
2. Luego, genera un comando de tipo "redirect_question" con:
   - targetAgentId: ID del agente al que rediriges
   - question: La pregunta reformulada para ese agente
3. NO generes la respuesta del otro agente (eso lo hará el sistema después)

Ejemplo de respuesta:
{
  "parts": [
    {
      "type": "speech",
      "content": "¿Quién, Sarah?",
      "emotion": "curious",
      "animationHint": "thinking"
    },
    {
      "type": "command",
      "command": {
        "type": "redirect_question",
        "targetAgentId": "agent_sarah_id",
        "question": "Sarah! ¿Qué piensas sobre [tema]?",
        "pauseMessage": false
      }
    }
  ]
}`;
    } else if (analysis.requiresMovement) {
      const movement = analysis.movementPlan[0];
      prompt += `1. Primero, indica que te vas a acercar/mover
2. Genera comando de tipo "${movement.action}"
3. Opcionalmente, agrega mensaje de continuación que se mostrará al llegar

Ejemplo:
{
  "parts": [
    {
      "type": "speech",
      "content": "Espera, déjame acercarme un poco",
      "emotion": "friendly",
      "animationHint": "beckoning"
    },
    {
      "type": "command",
      "command": {
        "type": "move_closer",
        "pauseMessage": true
      }
    },
    {
      "type": "continuation",
      "content": "Ahora sí, cuéntame...",
      "continuesAfterCommand": true
    }
  ]
}`;
    } else {
      prompt += `Responde de forma natural y breve (1-3 oraciones).
Mantén tu personalidad consistente.

Ejemplo:
{
  "parts": [
    {
      "type": "speech",
      "content": "¡Hola! Claro, te escucho.",
      "emotion": "friendly",
      "animationHint": "waving"
    }
  ]
}`;
    }

    return prompt;
  }
}

// Exportar instancia singleton
export const conversationalDirector = new ConversationalDirector();
