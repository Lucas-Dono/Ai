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
  private apiKey: string;
  private baseURL: string = "https://openrouter.ai/api/v1";
  private model: string = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free"; // Modelo GRATIS para generación de prompts

  constructor() {
    // Verificar que existe la API key de OpenRouter
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY no está configurada");
    }

    this.apiKey = apiKey;
    console.log('[LLM] Inicializando OpenRouter con modelo GRATIS...');
    console.log('[LLM] API Key detectada:', apiKey ? 'Sí ✓' : 'No ✗');
    console.log('[LLM] Modelo:', this.model);
  }

  async generate(options: GenerateOptions): Promise<string> {
    const { systemPrompt, messages, temperature = 0.9, maxTokens = 1000 } = options;

    try {
      // Construir mensajes en formato OpenAI
      const formattedMessages = [
        { role: "system" as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }))
      ];

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://creador-inteligencias.com",
          "X-Title": "Creador de Inteligencias"
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          temperature,
          max_tokens: maxTokens
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("OpenRouter API error:", error);
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "";
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
      console.log('[LLM] Generando perfil con OpenRouter...');

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;

      if (!text) {
        throw new Error("OpenRouter no retornó texto en la respuesta");
      }
      console.log('[LLM] Respuesta de OpenRouter recibida');

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
