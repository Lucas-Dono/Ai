import { getVeniceClient, RECOMMENDED_MODELS } from "@/lib/emotional-system/llm/venice";
import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/logger";

const log = createLogger({ module: "AmbientDialogueService" });

interface DialogueParticipant {
  agentId: string;
  name: string;
  personality: string; // Resumen corto de personalidad
}

interface AmbientDialogueRequest {
  participants: DialogueParticipant[];
  location: string; // e.g., "minecraft:overworld"
  contextHint?: string; // e.g., "cerca de una fogata", "en el mercado"
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
   * Obtener diálogo desde cache o generar nuevo
   */
  static async getAmbientDialogue(
    request: AmbientDialogueRequest
  ): Promise<AmbientDialogueResponse> {
    const groupHash = this.generateGroupHash(request.participants, request.contextHint);

    // Verificar cache (40% probabilidad de reusar si existe)
    const cachedDialogues = this.dialogueCache.get(groupHash);
    if (cachedDialogues && Math.random() < 0.4) {
      log.info("Reusing cached dialogue", { groupHash, count: cachedDialogues.length });

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

    // Generar nuevo diálogo
    log.info("Generating new ambient dialogue", {
      participants: request.participants.length,
      location: request.location,
    });

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
        maxTokens: 150, // Respuestas cortas
      });

      // Enriquecer con nombres de agentes
      const dialogues = response.data.dialogues.map((d) => {
        const participant = request.participants.find((p) => p.agentId === d.agentId);
        return {
          ...d,
          agentName: participant?.name || "NPC",
        };
      });

      const totalTokens = response.usage?.total_tokens || 0;

      log.info("Ambient dialogue generated", {
        dialogues: dialogues.length,
        tokens: totalTokens,
        cost: (totalTokens * 0.15) / 1_000_000, // ~$0.15 por millón
      });

      return {
        dialogues,
        groupHash: this.generateGroupHash(request.participants, request.contextHint),
        totalTokens,
      };
    } catch (error) {
      log.error("Failed to generate ambient dialogue", { error });

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
      log.info("Clearing dialogue cache", { size: this.dialogueCache.size });
      this.dialogueCache.clear();
      this.usageHistory.clear();
    }
  }
}
