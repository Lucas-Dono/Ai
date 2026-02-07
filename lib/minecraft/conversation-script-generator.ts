/**
 * Generador de Guiones Conversacionales Completos
 *
 * Genera conversaciones estructuradas con inicio, desarrollo y cierre
 */

import { v4 as uuidv4 } from "uuid";
import { getVeniceClient, RECOMMENDED_MODELS } from "@/lib/emotional-system/llm/venice";
import { createLogger } from "@/lib/logger";
import {
  ConversationScript,
  ConversationPhase,
  DialogueLine,
  ScriptGenerationOptions,
  ScriptGenerationResult,
  ConversationTemplate,
} from "./conversation-script-types";

const log = createLogger("ConversationScriptGenerator");

/**
 * Templates de conversaciones pre-definidas
 */
const CONVERSATION_TEMPLATES: ConversationTemplate[] = [
  {
    id: "casual_weather",
    name: "Conversación sobre el clima",
    topic: "El clima de hoy",
    category: "casual",
    minParticipants: 2,
    maxParticipants: 3,
    lines: [
      { speakerIndex: 0, message: "Hola {name1}, ¿cómo estás?", phase: ConversationPhase.GREETING },
      { speakerIndex: 1, message: "Hola! Muy bien, gracias. ¿Y tú?", phase: ConversationPhase.GREETING },
      {
        speakerIndex: 0,
        message: "Bien también. Qué buen día hace, ¿no?",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 1,
        message: "Sí, el sol está brillante hoy. Perfecto para trabajar afuera.",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 0,
        message: "Totalmente. Ayer llovió tanto que no pude salir.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 1,
        message: "Sí, yo también me quedé en casa. El trueno era ensordecedor.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 0,
        message: "Bueno, al menos ahora el jardín está bien regado.",
        phase: ConversationPhase.CONCLUSION,
      },
      {
        speakerIndex: 1,
        message: "Cierto, eso es bueno. Bueno, debo irme.",
        phase: ConversationPhase.CONCLUSION,
      },
      { speakerIndex: 0, message: "Nos vemos luego!", phase: ConversationPhase.FAREWELL },
      { speakerIndex: 1, message: "Hasta pronto, cuídate!", phase: ConversationPhase.FAREWELL },
    ],
  },
  {
    id: "work_planning",
    name: "Planificando trabajo",
    topic: "Tareas del día",
    category: "work",
    minParticipants: 2,
    maxParticipants: 3,
    lines: [
      { speakerIndex: 0, message: "Buenos días, {name1}.", phase: ConversationPhase.GREETING },
      { speakerIndex: 1, message: "Buenos días. ¿Qué hay que hacer hoy?", phase: ConversationPhase.GREETING },
      {
        speakerIndex: 0,
        message: "Tenemos que terminar la cerca del norte.",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 1,
        message: "Ah, cierto. ¿Trajiste suficiente madera?",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 0,
        message: "Sí, tengo lo necesario. También hay que revisar las cosechas.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 1,
        message: "Perfecto. Yo puedo encargarme de las cosechas.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 0,
        message: "Genial. Si terminamos temprano, mejor aún.",
        phase: ConversationPhase.CONCLUSION,
      },
      {
        speakerIndex: 1,
        message: "De acuerdo. Empecemos entonces.",
        phase: ConversationPhase.CONCLUSION,
      },
      { speakerIndex: 0, message: "¡Vamos!", phase: ConversationPhase.FAREWELL },
    ],
  },
  {
    id: "gossip_news",
    name: "Chisme del pueblo",
    topic: "Noticias recientes",
    category: "gossip",
    minParticipants: 2,
    maxParticipants: 3,
    lines: [
      { speakerIndex: 0, message: "¿Escuchaste lo que pasó ayer?", phase: ConversationPhase.GREETING },
      { speakerIndex: 1, message: "No, ¿qué pasó?", phase: ConversationPhase.GREETING },
      {
        speakerIndex: 0,
        message: "Dicen que vieron zombies cerca del bosque.",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 1,
        message: "¿En serio? Eso suena peligroso.",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 0,
        message: "Sí, por eso los guardias reforzaron la patrulla.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 1,
        message: "Menos mal. Espero que no se acerquen mucho.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 0,
        message: "Yo también. Hay que estar atentos.",
        phase: ConversationPhase.CONCLUSION,
      },
      {
        speakerIndex: 1,
        message: "Definitivamente. Gracias por avisar.",
        phase: ConversationPhase.CONCLUSION,
      },
      { speakerIndex: 0, message: "De nada, cuídate.", phase: ConversationPhase.FAREWELL },
      { speakerIndex: 1, message: "Igualmente!", phase: ConversationPhase.FAREWELL },
    ],
  },
  {
    id: "storytelling",
    name: "Contando anécdotas",
    topic: "Historias del pasado",
    category: "storytelling",
    minParticipants: 2,
    maxParticipants: 3,
    lines: [
      {
        speakerIndex: 0,
        message: "¿Te conté alguna vez sobre mi viaje al desierto?",
        phase: ConversationPhase.GREETING,
      },
      { speakerIndex: 1, message: "No, cuéntame!", phase: ConversationPhase.GREETING },
      {
        speakerIndex: 0,
        message: "Fue hace años. El sol era tan intenso que casi me deshidrato.",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 1,
        message: "Wow, suena peligroso. ¿Cómo sobreviviste?",
        phase: ConversationPhase.TOPIC_INTRODUCTION,
      },
      {
        speakerIndex: 0,
        message: "Encontré un oasis justo a tiempo. La suerte estuvo de mi lado.",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 1,
        message: "Qué alivio. ¿Volviste después?",
        phase: ConversationPhase.DEVELOPMENT,
      },
      {
        speakerIndex: 0,
        message: "Nunca más. El desierto no es para mí.",
        phase: ConversationPhase.CONCLUSION,
      },
      {
        speakerIndex: 1,
        message: "Lo entiendo. Buena historia, gracias por compartirla.",
        phase: ConversationPhase.CONCLUSION,
      },
      { speakerIndex: 0, message: "Un gusto!", phase: ConversationPhase.FAREWELL },
    ],
  },
];

export class ConversationScriptGenerator {
  /**
   * Cache de guiones generados
   * Key: hash de participantes + topic
   */
  private static scriptCache = new Map<string, ConversationScript>();

  /**
   * Generar hash para caché
   */
  private static generateCacheKey(participants: any[], topic: string): string {
    const ids = participants.map((p) => p.agentId).sort().join("_");
    return `${ids}_${topic.replace(/\s+/g, "_")}`;
  }

  /**
   * Generar guión conversacional completo
   */
  static async generateScript(
    options: ScriptGenerationOptions
  ): Promise<ScriptGenerationResult> {
    const { participants, location, contextHint, topic, desiredLength = 12, useTemplate = true } =
      options;

    // Validar participantes
    if (participants.length < 2) {
      throw new Error("Se requieren al menos 2 participantes");
    }

    // Determinar tema si no se provee
    const conversationTopic = topic || this.generateRandomTopic(participants);

    // Verificar caché
    const cacheKey = this.generateCacheKey(participants, conversationTopic);
    const cached = this.scriptCache.get(cacheKey);

    if (cached && !options.forceAI) {
      log.info({ scriptId: cached.scriptId, topic: conversationTopic }, "Using cached script");
      return {
        script: cached,
        cached: true,
        cost: 0,
        source: "cache",
      };
    }

    // Intentar usar template primero
    if (useTemplate && !options.forceAI) {
      const templateScript = this.generateFromTemplate(participants, location, contextHint);

      if (templateScript) {
        log.info({
          scriptId: templateScript.scriptId,
          topic: templateScript.topic,
        }, "Using template script");

        // Cachear
        this.scriptCache.set(cacheKey, templateScript);

        return {
          script: templateScript,
          cached: false,
          cost: 0,
          source: "template",
        };
      }
    }

    // Generar con IA (más costoso pero personalizado)
    log.info({ topic: conversationTopic, participants: participants.length }, "Generating AI script");

    const aiScript = await this.generateWithAI(
      participants,
      conversationTopic,
      location,
      contextHint,
      desiredLength
    );

    // Cachear
    this.scriptCache.set(cacheKey, aiScript.script);

    return aiScript;
  }

  /**
   * Generar guión desde template
   */
  private static generateFromTemplate(
    participants: any[],
    location: string,
    contextHint?: string
  ): ConversationScript | null {
    // Filtrar templates compatibles
    const compatibleTemplates = CONVERSATION_TEMPLATES.filter(
      (t) =>
        participants.length >= t.minParticipants && participants.length <= t.maxParticipants
    );

    if (compatibleTemplates.length === 0) {
      return null;
    }

    // Seleccionar template aleatorio
    const template =
      compatibleTemplates[Math.floor(Math.random() * compatibleTemplates.length)];

    // Construir líneas con nombres reales
    const lines: DialogueLine[] = template.lines.map((line, index) => {
      const speaker = participants[line.speakerIndex % participants.length];

      // Reemplazar placeholders
      let message = line.message;
      participants.forEach((p, i) => {
        message = message.replace(`{name${i}}`, p.name);
        message = message.replace("{name}", p.name);
        message = message.replace("{personality}", p.personality);
      });

      return {
        agentId: speaker.agentId,
        agentName: speaker.name,
        message,
        phase: line.phase,
        lineNumber: index,
      };
    });

    // Calcular duración (3-5 segundos por línea)
    const duration = lines.length * 4;

    const now = new Date();
    return {
      scriptId: uuidv4(),
      version: 1, // Primera versión
      participants,
      topic: template.topic,
      location,
      contextHint,
      lines,
      duration,
      createdAt: now,
      updatedAt: now,
      generatedBy: "template",
    };
  }

  /**
   * Generar guión con IA
   */
  private static async generateWithAI(
    participants: any[],
    topic: string,
    location: string,
    contextHint: string | undefined,
    desiredLength: number
  ): Promise<ScriptGenerationResult> {
    const venice = getVeniceClient();

    const participantInfo = participants
      .map((p, i) => `${i + 1}. ${p.name}: ${p.personality}`)
      .join("\n");

    const systemPrompt = `Eres un guionista experto para videojuegos.

Tu tarea es crear un GUIÓN CONVERSACIONAL COMPLETO para un grupo de NPCs en Minecraft.

La conversación debe tener estructura clara:
1. SALUDO (1-2 intercambios): Saludos iniciales naturales
2. INTRODUCCIÓN DEL TEMA (2-3 intercambios): Presentar el tema de conversación
3. DESARROLLO (3-5 intercambios): Explorar el tema con profundidad
4. CONCLUSIÓN (1-2 intercambios): Cerrar el tema elegantemente
5. DESPEDIDA (1-2 intercambios): Despedidas naturales

REGLAS IMPORTANTES:
- Total de ${desiredLength} líneas aproximadamente
- Mensajes cortos y naturales (8-20 palabras)
- Usar personalidad de cada NPC
- Conversación coherente de inicio a fin
- Español coloquial y natural
- Los jugadores deben poder entender la conversación completa si escuchan desde cualquier punto

PARTICIPANTES:
${participantInfo}

UBICACIÓN: ${location}
${contextHint ? `CONTEXTO: ${contextHint}` : ""}
TEMA: ${topic}`;

    const userPrompt = `Genera el guión conversacional completo.

Formato JSON:
{
  "lines": [
    {
      "agentId": "id_del_agente",
      "message": "mensaje corto y natural",
      "phase": "greeting|topic_introduction|development|conclusion|farewell"
    },
    ...
  ]
}`;

    try {
      const response = await venice.generateJSON<{
        lines: Array<{ agentId: string; message: string; phase: ConversationPhase }>;
      }>(systemPrompt, userPrompt, {
        model: RECOMMENDED_MODELS.AMBIENT_DIALOGUE, // Qwen 3 4B
        temperature: 0.85,
      });

      // Enriquecer con información de participantes
      const lines: DialogueLine[] = response.lines.map((line: { agentId: string; message: string; phase: ConversationPhase }, index: number) => {
        const participant = participants.find((p) => p.agentId === line.agentId);

        return {
          agentId: line.agentId,
          agentName: participant?.name || "NPC",
          message: line.message,
          phase: line.phase,
          lineNumber: index,
        };
      });

      const totalTokens = 0; // generateJSON doesn't return usage
      const cost = (totalTokens * 0.15) / 1_000_000; // $0.15 por millón tokens

      const now = new Date();
      const script: ConversationScript = {
        scriptId: uuidv4(),
        version: 1, // Primera versión
        participants,
        topic,
        location,
        contextHint,
        lines,
        duration: lines.length * 4, // 4 segundos por línea
        createdAt: now,
        updatedAt: now,
        generatedBy: "ai",
      };

      log.info({
        scriptId: script.scriptId,
        lines: lines.length,
        tokens: totalTokens,
        cost,
      }, "AI script generated");

      return {
        script,
        cached: false,
        cost,
        source: "ai",
      };
    } catch (error) {
      log.error({ error }, "Failed to generate AI script");

      // Fallback: usar template
      const fallbackScript = this.generateFromTemplate(participants, location, contextHint);

      if (fallbackScript) {
        return {
          script: fallbackScript,
          cached: false,
          cost: 0,
          source: "template",
        };
      }

      throw new Error("Failed to generate conversation script");
    }
  }

  /**
   * Generar tema aleatorio
   */
  private static generateRandomTopic(participants: any[]): string {
    const topics = [
      "El clima de hoy",
      "Planes para la semana",
      "Eventos recientes en el pueblo",
      "Historias del pasado",
      "Tareas pendientes",
      "Rumores del pueblo",
      "La cosecha de este año",
      "Los viajeros que pasaron",
      "Peligros cercanos",
      "Celebración próxima",
    ];

    return topics[Math.floor(Math.random() * topics.length)];
  }

  /**
   * Regenerar script existente con versión incrementada
   */
  static async regenerateScript(
    existingScript: ConversationScript,
    options?: Partial<ScriptGenerationOptions>
  ): Promise<ScriptGenerationResult> {
    log.info({
      scriptId: existingScript.scriptId,
      currentVersion: existingScript.version,
    }, "Regenerating script");

    // Generar nuevo script
    const result = await this.generateScript({
      participants: existingScript.participants,
      location: existingScript.location,
      contextHint: existingScript.contextHint,
      topic: existingScript.topic,
      ...options,
      forceAI: options?.forceAI ?? false, // Permitir usar templates en regeneración
    });

    // Mantener el mismo scriptId pero incrementar versión
    result.script.scriptId = existingScript.scriptId;
    result.script.version = existingScript.version + 1;
    result.script.createdAt = existingScript.createdAt; // Mantener fecha de creación original
    result.script.updatedAt = new Date(); // Nueva fecha de actualización

    // Actualizar caché
    const cacheKey = this.generateCacheKey(
      existingScript.participants,
      existingScript.topic
    );
    this.scriptCache.set(cacheKey, result.script);

    log.info({
      scriptId: result.script.scriptId,
      newVersion: result.script.version,
      source: result.source,
    }, "Script regenerated");

    return result;
  }

  /**
   * Invalidar script (incrementar versión para forzar actualización)
   */
  static invalidateScript(scriptId: string): void {
    // Buscar script en caché
    for (const [key, script] of this.scriptCache.entries()) {
      if (script.scriptId === scriptId) {
        script.version++;
        script.updatedAt = new Date();
        log.info({ scriptId, newVersion: script.version }, "Script invalidated");
        return;
      }
    }

    log.warn({ scriptId }, "Script not found for invalidation");
  }

  /**
   * Limpiar caché
   */
  static clearCache(): void {
    this.scriptCache.clear();
    log.info("Script cache cleared");
  }

  /**
   * Obtener estadísticas de caché
   */
  static getCacheStats() {
    return {
      cachedScripts: this.scriptCache.size,
      templates: CONVERSATION_TEMPLATES.length,
    };
  }
}
