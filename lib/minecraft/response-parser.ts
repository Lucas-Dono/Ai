import {
  ResponsePart,
  AgentCommand,
  MinecraftAgentResponse,
} from "@/types/minecraft-chat";
import { nanoid } from "nanoid";

/**
 * Response Parser
 *
 * Parsea respuestas estructuradas del LLM y las convierte en
 * objetos MinecraftAgentResponse con partes separadas.
 *
 * Soporta:
 * - Mensajes simples (solo speech)
 * - Mensajes con comandos (speech + command + continuation)
 * - Redirecciones (speech + redirect_question)
 */
export class ResponseParser {
  /**
   * Parsea respuesta estructurada del LLM
   */
  parseStructuredResponse(
    llmResponse: any,
    agentId: string,
    agentName: string,
    turnNumber: number
  ): MinecraftAgentResponse {
    const parts = llmResponse.parts || [];

    // Extraer contenido completo (para retrocompatibilidad)
    const fullContent = parts
      .filter((p: any) => p.type === "speech" || p.type === "continuation")
      .map((p: any) => p.content)
      .join(" ");

    // Extraer emoción y animación del primer speech part
    const firstSpeech = parts.find((p: any) => p.type === "speech");
    const emotion = firstSpeech?.emotion || "neutral";
    const animationHint = firstSpeech?.animationHint || "talking";

    return {
      messageId: nanoid(),
      agentId,
      agentName,
      content: fullContent,
      parts: parts as ResponsePart[],
      emotion,
      emotionalIntensity: this.estimateEmotionalIntensity(emotion),
      timestamp: new Date(),
      turnNumber,
      animationHint: animationHint as any,
    };
  }

  /**
   * Extrae comandos de una respuesta
   */
  extractCommands(response: MinecraftAgentResponse): AgentCommand[] {
    if (!response.parts) return [];

    return response.parts
      .filter((p) => p.type === "command")
      .map((p) => (p as any).command as AgentCommand);
  }

  /**
   * Verifica si la respuesta tiene comandos que pausan el mensaje
   */
  hasPausingCommands(response: MinecraftAgentResponse): boolean {
    const commands = this.extractCommands(response);
    return commands.some((cmd) => cmd.pauseMessage);
  }

  /**
   * Obtiene el mensaje de continuación (después de comandos)
   */
  getContinuationMessage(response: MinecraftAgentResponse): string | null {
    if (!response.parts) return null;

    const continuation = response.parts.find((p) => p.type === "continuation");
    return continuation ? (continuation as any).content : null;
  }

  /**
   * Separa respuesta en fases (pre-comando, post-comando)
   */
  splitResponsePhases(response: MinecraftAgentResponse): {
    beforeCommand: string;
    command: AgentCommand | null;
    afterCommand: string | null;
  } {
    if (!response.parts) {
      return {
        beforeCommand: response.content,
        command: null,
        afterCommand: null,
      };
    }

    const parts = response.parts;
    const commandIndex = parts.findIndex((p) => p.type === "command");

    if (commandIndex === -1) {
      return {
        beforeCommand: response.content,
        command: null,
        afterCommand: null,
      };
    }

    // Contenido antes del comando
    const beforeParts = parts.slice(0, commandIndex);
    const beforeCommand = beforeParts
      .filter((p) => p.type === "speech")
      .map((p) => (p as any).content)
      .join(" ");

    // Comando
    const command = (parts[commandIndex] as any).command as AgentCommand;

    // Contenido después del comando
    const afterParts = parts.slice(commandIndex + 1);
    const afterCommand =
      afterParts.length > 0
        ? afterParts
            .filter((p) => p.type === "speech" || p.type === "continuation")
            .map((p) => (p as any).content)
            .join(" ")
        : null;

    return {
      beforeCommand,
      command,
      afterCommand,
    };
  }

  /**
   * Convierte respuesta estructurada a formato simple (para compatibilidad)
   */
  toSimpleResponse(response: MinecraftAgentResponse): {
    agentId: string;
    agentName: string;
    content: string;
    animationHint: string;
  } {
    return {
      agentId: response.agentId,
      agentName: response.agentName,
      content: response.content,
      animationHint: response.animationHint || "talking",
    };
  }

  /**
   * Estima intensidad emocional basada en la emoción
   */
  private estimateEmotionalIntensity(emotion: string): number {
    const intensityMap: Record<string, number> = {
      neutral: 0.3,
      happy: 0.7,
      sad: 0.6,
      angry: 0.9,
      surprised: 0.8,
      thinking: 0.4,
      curious: 0.5,
      friendly: 0.6,
    };

    return intensityMap[emotion] || 0.5;
  }

  /**
   * Valida que una respuesta estructurada tenga el formato correcto
   */
  validateStructuredResponse(llmResponse: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!llmResponse.parts || !Array.isArray(llmResponse.parts)) {
      errors.push("Missing or invalid 'parts' array");
      return { valid: false, errors };
    }

    if (llmResponse.parts.length === 0) {
      errors.push("'parts' array is empty");
      return { valid: false, errors };
    }

    // Validar cada parte
    llmResponse.parts.forEach((part: any, index: number) => {
      if (!part.type) {
        errors.push(`Part ${index}: missing 'type' field`);
      } else if (!["speech", "command", "continuation"].includes(part.type)) {
        errors.push(`Part ${index}: invalid type '${part.type}'`);
      }

      if (part.type === "speech" && !part.content) {
        errors.push(`Part ${index}: speech part missing 'content'`);
      }

      if (part.type === "command" && !part.command) {
        errors.push(`Part ${index}: command part missing 'command' object`);
      }

      if (part.type === "continuation" && !part.content) {
        errors.push(`Part ${index}: continuation part missing 'content'`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Exportar instancia singleton
export const responseParser = new ResponseParser();
