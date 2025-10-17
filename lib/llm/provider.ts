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

  // Gemini 2.5 Flash-Lite: $0.40/M tokens - Para tareas de alta frecuencia (stage prompts)
  private modelLite: string = "gemini-2.5-flash-lite";

  // Gemini 2.5 Flash: $2.50/M tokens - Para tareas complejas (profile generation)
  private modelFull: string = "gemini-2.5-flash";

  constructor() {
    // Verificar que existe la API key de Google AI
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY no está configurada");
    }

    this.apiKey = apiKey;
    console.log('[LLM] Inicializando Google AI (Gemini 2.5)...');
    console.log('[LLM] API Key detectada:', apiKey ? 'Sí ✓' : 'No ✗');
    console.log('[LLM] Modelo para prompts:', this.modelLite, '($0.40/M tokens)');
    console.log('[LLM] Modelo para profiles:', this.modelFull, '($2.50/M tokens)');
  }

  /**
   * Genera texto usando Gemini 2.5 Flash-Lite (optimizado para stage prompts).
   * Usa el modelo más económico ($0.40/M tokens) para tareas de alta frecuencia.
   */
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

      console.log('[LLM] Usando modelo:', this.modelLite, 'para generación de prompts');

      const response = await fetch(
        `${this.baseURL}/models/${this.modelLite}:generateContent?key=${this.apiKey}`,
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
        const errorText = await response.text();
        console.error('[LLM] Gemini Flash-Lite HTTP error:', response.status);
        console.error('[LLM] Gemini Flash-Lite error response:', errorText);
        throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[LLM] Gemini Flash-Lite response:', JSON.stringify(data, null, 2));

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!text) {
        console.error('[LLM] Gemini Flash-Lite response sin texto:', JSON.stringify(data, null, 2));
        throw new Error("Gemini no retornó texto en la respuesta");
      }

      return text;
    } catch (error) {
      console.error("[LLM] Error al generar respuesta:", error);
      throw new Error("No se pudo generar una respuesta de la IA");
    }
  }

  /**
   * Genera un perfil completo usando Gemini 2.5 Flash (modelo completo).
   * Usa el modelo más potente ($2.50/M tokens) para razonamiento complejo.
   * Se ejecuta solo 1 vez por agente, por lo que el costo es mínimo.
   */
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
      console.log('[LLM] Generando perfil con Gemini 2.5 Flash (modelo completo)...');

      const response = await fetch(
        `${this.baseURL}/models/${this.modelFull}:generateContent?key=${this.apiKey}`,
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
        const errorText = await response.text();
        console.error('[LLM] Gemini Flash HTTP error:', response.status);
        console.error('[LLM] Gemini Flash error response:', errorText);
        throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[LLM] Gemini Flash raw response:', JSON.stringify(data, null, 2));

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        console.error('[LLM] Gemini Flash response sin texto:', JSON.stringify(data, null, 2));
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
