import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GenerateOptions {
  systemPrompt: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

export class LLMProvider {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generate(options: GenerateOptions): Promise<string> {
    const { systemPrompt, messages, temperature = 0.9, maxTokens = 1000 } = options;

    // Construir el historial de chat para Gemini
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    try {
      const chat = this.model.startChat({
        history,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      // Combinar system prompt con el último mensaje del usuario
      const prompt = `${systemPrompt}\n\nUsuario: ${lastMessage.content}`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error al generar respuesta:", error);
      throw new Error("No se pudo generar una respuesta de la IA");
    }
  }

  async generateProfile(rawData: Record<string, unknown>): Promise<{
    profile: Record<string, unknown>;
    systemPrompt: string;
  }> {
    const prompt = `Eres un diseñador de inteligencias artificiales. Tu tarea es crear un perfil detallado y un system prompt para una IA basándote en los siguientes datos:

${JSON.stringify(rawData, null, 2)}

Genera:
1. Un objeto JSON "profile" con campos estructurados (nombre, tipo, personalidad, emociones dominantes, propósito, etc.)
2. Un "systemPrompt" que defina el comportamiento de esta IA de forma clara y precisa.

Responde SOLO con un JSON válido con este formato:
{
  "profile": { ... },
  "systemPrompt": "..."
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extraer JSON de la respuesta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se pudo extraer JSON de la respuesta");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Error al generar perfil:", error);
      // Fallback: devolver datos básicos
      return {
        profile: rawData,
        systemPrompt: `Eres ${rawData.name || "una IA"}. ${rawData.personality || ""} ${rawData.purpose || ""}`,
      };
    }
  }
}

// Singleton
let llmProvider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!llmProvider) {
    llmProvider = new LLMProvider();
  }
  return llmProvider;
}
