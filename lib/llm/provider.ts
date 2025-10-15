import { GoogleGenAI } from "@google/genai";

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
  private ai: GoogleGenAI;

  constructor() {
    // Verificar que existe la API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY no está configurada");
    }

    console.log('[LLM] Inicializando GoogleGenAI...');
    console.log('[LLM] API Key detectada:', apiKey ? 'Sí ✓' : 'No ✗');
    console.log('[LLM] API Key primeros caracteres:', apiKey.substring(0, 10) + '...');

    // Usar constructor vacío como en el script de prueba exitoso
    // La librería buscará automáticamente GEMINI_API_KEY en las variables de entorno
    this.ai = new GoogleGenAI({});
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
      const model = await this.ai.models.get({ model: "gemini-2.0-flash-exp" });
      // @ts-expect-error - API method exists but not in type definitions
      const chat = model.startChat({
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
      console.log('[LLM] Generando perfil con Gemini 2.5 Flash...');

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.9,
          thinkingConfig: {
            thinkingBudget: 0, // Deshabilitar pensamiento para mayor velocidad
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini no retornó texto en la respuesta");
      }
      console.log('[LLM] Respuesta de Gemini recibida');

      // Extraer JSON de la respuesta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No se pudo extraer JSON de la respuesta");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("[LLM] Error al generar perfil, usando fallback:", error);
      // Fallback: devolver datos básicos
      const fallback = {
        profile: {
          name: rawData.name,
          kind: rawData.kind,
          personality: rawData.personality,
          purpose: rawData.purpose,
          tone: rawData.tone,
          traits: ["amigable", "conversacional"],
          emotions: { joy: 0.7, calm: 0.8 },
        },
        systemPrompt: `Eres ${rawData.name || "una IA"}${rawData.kind === 'companion' ? ', un compañero emocional' : ', un asistente'}. ${rawData.personality || ""} ${rawData.purpose || ""} Usa un tono ${rawData.tone || "amigable"}.`,
      };
      console.log('[LLM] Usando perfil fallback:', fallback);
      return fallback;
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
