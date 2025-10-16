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
  private baseURL: string = "https://generativelanguage.googleapis.com/v1beta";
  private model: string = "gemini-1.5-flash"; // Modelo GRATIS de Google

  constructor() {
    // Verificar que existe la API key de Google AI
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY no está configurada");
    }

    this.apiKey = apiKey;
    console.log('[LLM] Inicializando Google AI (Gemini) con modelo GRATIS...');
    console.log('[LLM] API Key detectada:', apiKey ? 'Sí ✓' : 'No ✗');
    console.log('[LLM] Modelo:', this.model);
  }

  async generate(options: GenerateOptions): Promise<string> {
    const { systemPrompt, messages, temperature = 0.9, maxTokens = 1000 } = options;

    try {
      // Gemini usa un formato diferente: combina system prompt con el primer user message
      // y convierte roles (user/model en vez de user/assistant)
      const contents = [];

      // Agregar system prompt como primer user message
      let firstUserContent = systemPrompt + "\n\n";

      // Combinar mensajes en formato Gemini
      for (const msg of messages) {
        if (msg.role === "user") {
          firstUserContent += msg.content;
          contents.push({
            role: "user",
            parts: [{ text: firstUserContent }]
          });
          firstUserContent = ""; // Reset
        } else if (msg.role === "assistant") {
          contents.push({
            role: "model",
            parts: [{ text: msg.content }]
          });
        }
      }

      const response = await fetch(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            }
          })
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("Gemini API error:", error);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
      console.log('[LLM] Generando perfil con Gemini...');

      const response = await fetch(
        `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              role: "user",
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.9,
              maxOutputTokens: 2000,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini no retornó texto en la respuesta");
      }
      console.log('[LLM] Respuesta de Gemini recibida');

      // Extraer JSON de la respuesta (Gemini a veces incluye markdown)
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
        systemPrompt: `Eres una IA con el nombre de ${rawData.name || "una IA"}, diseñada como ${rawData.kind === 'companion' ? 'una compañera' : 'un asistente'} para el usuario. Tu personalidad es ${rawData.personality || "amigable y conversacional"}, lo cual se refleja en tu tono ${rawData.tone || "amigable"}. Tu principal propósito es ${rawData.purpose || "ayudar al usuario"}. Mantén una actitud positiva y acessible mientras interactúas con el usuario.`,
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
