import { getVeniceClient, RECOMMENDED_MODELS } from "@/lib/emotional-system/llm/venice";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger("AmbientDialogueService");

interface DialogueParticipant {
  agentId: string;
  name: string;
  personality: string; // Resumen corto de personalidad
}

interface AmbientDialogueRequest {
  participants: DialogueParticipant[];
  location: string; // e.g., "minecraft:overworld"
  contextHint?: string; // e.g., "cerca de una fogata", "en el mercado"
  hasImportantHistory?: boolean; // Si hay conversaciones importantes previas
}

interface AmbientDialogueResponse {
  dialogues: Array<{
    agentId: string;
    agentName: string;
    message: string;
    emotion?: string;
  }>;
  groupHash: string; // Hash para cache
  totalTokens: number;
}

/**
 * Servicio de generación de diálogos ambientales para Minecraft
 *
 * Genera conversaciones cortas entre NPCs que el jugador puede escuchar
 * al pasar cerca de un grupo.
 */
export class AmbientDialogueService {
  /**
   * Cache de diálogos por grupo
   * Key: hash de participantes + contextHint
   * Value: array de diálogos generados
   */
  private static dialogueCache = new Map<
    string,
    Array<{ agentId: string; agentName: string; message: string }>
  >();

  /**
   * Historial de uso de diálogos
   * Key: groupHash
   * Value: índice del último diálogo usado
   */
  private static usageHistory = new Map<string, number>();

  /**
   * Generar hash único para un grupo de participantes
   */
  private static generateGroupHash(participants: DialogueParticipant[], contextHint?: string): string {
    const ids = participants.map((p) => p.agentId).sort();
    const baseHash = ids.join("_");
    return contextHint ? `${baseHash}_${contextHint}` : baseHash;
  }

  /**
   * Diálogos pre-armados
   */
  private static prebuiltDialogues: Array<{ text: string; category: string }> | null = null;

  /**
   * Cargar diálogos pre-armados desde archivo
   */
  private static async loadPrebuiltDialogues(): Promise<void> {
    if (this.prebuiltDialogues) return;

    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      const filePath = path.join(
        process.cwd(),
        "Juego/Blaniel-MC/src/main/resources/data/ambient_dialogues.json"
      );

      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      this.prebuiltDialogues = data.dialogues;

      log.info({ count: this.prebuiltDialogues?.length || 0 }, "Loaded prebuilt dialogues");
    } catch (error) {
      log.warn({ error }, "Failed to load prebuilt dialogues, using fallback");
      this.prebuiltDialogues = [
        { text: "Qué buen día hace, ¿no?", category: "clima" },
        { text: "Sí, hace un clima agradable.", category: "clima" },
        { text: "¿Has visto algo interesante por aquí?", category: "observaciones" },
        { text: "No mucho, todo tranquilo.", category: "observaciones" },
        { text: "Me pregunto qué habrá para cenar.", category: "planes" },
      ];
    }
  }

  /**
   * Seleccionar diálogo pre-armado aleatorio
   */
  private static selectPrebuiltDialogue(
    participants: DialogueParticipant[]
  ): AmbientDialogueResponse {
    if (!this.prebuiltDialogues || this.prebuiltDialogues.length === 0) {
      // Fallback mínimo
      return {
        dialogues: [
          {
            agentId: participants[0].agentId,
            agentName: participants[0].name,
            message: "Qué día más tranquilo.",
          },
        ],
        groupHash: this.generateGroupHash(participants),
        totalTokens: 0,
      };
    }

    // Seleccionar 1-2 diálogos aleatorios
    const count = Math.random() < 0.6 ? 1 : 2; // 60% un mensaje, 40% dos mensajes
    const selectedDialogues = [];

    for (let i = 0; i < count && i < participants.length; i++) {
      const randomDialogue =
        this.prebuiltDialogues[Math.floor(Math.random() * this.prebuiltDialogues.length)];

      selectedDialogues.push({
        agentId: participants[i].agentId,
        agentName: participants[i].name,
        message: randomDialogue.text,
      });
    }

    return {
      dialogues: selectedDialogues,
      groupHash: this.generateGroupHash(participants),
      totalTokens: 0,
    };
  }

  /**
   * Obtener diálogo: pre-armado o generado con IA
   *
   * Estrategia:
   * - Sin historial importante: 100% pre-armados
   * - Con historial importante: 30% IA, 70% pre-armados
   */
  static async getAmbientDialogue(
    request: AmbientDialogueRequest
  ): Promise<AmbientDialogueResponse> {
    // Asegurar que los diálogos pre-armados estén cargados
    await this.loadPrebuiltDialogues();

    const groupHash = this.generateGroupHash(request.participants, request.contextHint);

    // Decidir si usar IA o pre-armados
    const useAI = request.hasImportantHistory && Math.random() < 0.3; // 30% si hay historial

    if (!useAI) {
      // Usar diálogo pre-armado
      log.info({
        groupHash,
        hasImportantHistory: request.hasImportantHistory || false,
      }, "Using prebuilt dialogue");

      return this.selectPrebuiltDialogue(request.participants);
    }

    // Usar IA (con cache)
    log.info({
      groupHash,
      hasImportantHistory: true,
    }, "Using AI-generated dialogue");

    // Verificar cache (40% probabilidad de reusar si existe)
    const cachedDialogues = this.dialogueCache.get(groupHash);
    if (cachedDialogues && Math.random() < 0.4) {
      log.info({ groupHash, count: cachedDialogues.length }, "Reusing cached AI dialogue");

      // Rotar entre diálogos cacheados
      const lastIndex = this.usageHistory.get(groupHash) || 0;
      const nextIndex = (lastIndex + 1) % cachedDialogues.length;
      this.usageHistory.set(groupHash, nextIndex);

      return {
        dialogues: [cachedDialogues[nextIndex]],
        groupHash,
        totalTokens: 0, // Cache hit
      };
    }

    // Generar nuevo diálogo con IA
    const dialogue = await this.generateDialogue(request);

    // Cachear para uso futuro
    if (!this.dialogueCache.has(groupHash)) {
      this.dialogueCache.set(groupHash, []);
    }
    this.dialogueCache.get(groupHash)!.push(...dialogue.dialogues);

    // Limitar tamaño del cache (máximo 5 diálogos por grupo)
    const cache = this.dialogueCache.get(groupHash)!;
    if (cache.length > 5) {
      cache.shift(); // Eliminar el más antiguo
    }

    return dialogue;
  }

  /**
   * Generar diálogo usando Qwen 3 4B
   */
  private static async generateDialogue(
    request: AmbientDialogueRequest
  ): Promise<AmbientDialogueResponse> {
    const venice = getVeniceClient();

    // Construir contexto de participantes
    const participantInfo = request.participants
      .map((p, i) => `${i + 1}. ${p.name}: ${p.personality}`)
      .join("\n");

    const systemPrompt = `Eres un generador de diálogos ambientales para un juego de Minecraft.

Tu tarea es crear una conversación CORTA (1-2 líneas por persona) entre los NPCs listados.
El diálogo debe sonar natural y espontáneo, como si el jugador escuchara una conversación casual al pasar.

REGLAS:
- Solo 1 respuesta por NPC (2-3 NPCs máximo hablan)
- Mensajes MUY cortos (5-15 palabras)
- Temática casual: clima, eventos recientes, planes, anécdotas
- NO diálogos épicos o dramáticos
- NO preguntas filosóficas
- Usar personalidad de cada NPC
- Español natural y coloquial

PARTICIPANTES:
${participantInfo}

UBICACIÓN: ${request.location}
${request.contextHint ? `CONTEXTO: ${request.contextHint}` : ""}`;

    const userPrompt = `Genera un diálogo breve entre estos NPCs.

Formato JSON:
{
  "dialogues": [
    { "agentId": "id1", "message": "mensaje corto y natural" },
    { "agentId": "id2", "message": "respuesta corta" }
  ]
}`;

    try {
      const response = await venice.generateJSON<{
        dialogues: Array<{ agentId: string; message: string; emotion?: string }>;
      }>(systemPrompt, userPrompt, {
        model: RECOMMENDED_MODELS.AMBIENT_DIALOGUE, // Qwen 3 4B - económico
        temperature: 0.9, // Alta creatividad
      });

      // Enriquecer con nombres de agentes
      const dialogues = response.dialogues.map((d: { agentId: string; message: string; emotion?: string }) => {
        const participant = request.participants.find((p) => p.agentId === d.agentId);
        return {
          ...d,
          agentName: participant?.name || "NPC",
        };
      });

      const totalTokens = 0; // generateJSON doesn't return usage

      log.info({
        dialogues: dialogues.length,
        tokens: totalTokens,
        cost: (totalTokens * 0.15) / 1_000_000, // ~$0.15 por millón
      }, "Ambient dialogue generated");

      return {
        dialogues,
        groupHash: this.generateGroupHash(request.participants, request.contextHint),
        totalTokens,
      };
    } catch (error) {
      log.error({ error }, "Failed to generate ambient dialogue");

      // Fallback: diálogo genérico
      return {
        dialogues: [
          {
            agentId: request.participants[0].agentId,
            agentName: request.participants[0].name,
            message: "Qué buen día, ¿no?",
          },
          {
            agentId: request.participants[1]?.agentId || request.participants[0].agentId,
            agentName: request.participants[1]?.name || request.participants[0].name,
            message: "Sí, hace un clima agradable.",
          },
        ],
        groupHash: this.generateGroupHash(request.participants, request.contextHint),
        totalTokens: 0,
      };
    }
  }

  /**
   * Obtener información resumida de agentes para diálogos
   */
  static async getParticipantInfo(agentIds: string[]): Promise<DialogueParticipant[]> {
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: {
        id: true,
        name: true,
        profile: true,
      },
    });

    return agents.map((agent) => {
      const profile = agent.profile as any;
      const personality = profile?.identity?.personalityOverview ||
        profile?.identity?.shortBio ||
        "NPC amigable";

      return {
        agentId: agent.id,
        name: agent.name,
        personality: personality.substring(0, 100), // Máximo 100 chars
      };
    });
  }

  /**
   * Limpiar cache antiguo (llamar periódicamente)
   */
  static clearOldCache(): void {
    if (this.dialogueCache.size > 100) {
      log.info({ size: this.dialogueCache.size }, "Clearing dialogue cache");
      this.dialogueCache.clear();
      this.usageHistory.clear();
    }
  }
}
