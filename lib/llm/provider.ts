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
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private baseURL: string = "https://generativelanguage.googleapis.com/v1beta";

  // Gemini 2.5 Flash-Lite: $0.40/M tokens - Para tareas de alta frecuencia (stage prompts)
  private modelLite: string = "gemini-2.5-flash-lite";

  // Gemini 2.5 Flash: $2.50/M tokens - Para tareas complejas (profile generation)
  private modelFull: string = "gemini-2.5-flash";

  constructor() {
    // Cargar múltiples API keys de Gemini para rotación
    // Formato: GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
    this.apiKeys = this.loadApiKeys();

    if (this.apiKeys.length === 0) {
      throw new Error("No se encontraron API keys de Google AI. Configure GOOGLE_AI_API_KEY o GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.");
    }

    console.log('[LLM] Inicializando Google AI (Gemini 2.5)...');
    console.log('[LLM] API Keys disponibles:', this.apiKeys.length);
    console.log('[LLM] API Key activa: #1');
    console.log('[LLM] Modelo para prompts:', this.modelLite, '($0.40/M tokens)');
    console.log('[LLM] Modelo para profiles:', this.modelFull, '($2.50/M tokens)');
  }

  /**
   * Carga múltiples API keys desde variables de entorno
   * Soporta GOOGLE_AI_API_KEY o GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
   */
  private loadApiKeys(): string[] {
    const keys: string[] = [];

    // Intentar cargar GOOGLE_AI_API_KEY (single key)
    const singleKey = process.env.GOOGLE_AI_API_KEY;
    if (singleKey) {
      keys.push(singleKey);
    }

    // Intentar cargar GOOGLE_AI_API_KEY_1, GOOGLE_AI_API_KEY_2, etc.
    for (let i = 1; i <= 10; i++) {
      const key = process.env[`GOOGLE_AI_API_KEY_${i}`];
      if (key) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Obtiene la API key activa actual
   */
  private getCurrentApiKey(): string {
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Rota a la siguiente API key disponible
   * Retorna true si hay más keys, false si ya se probaron todas
   */
  private rotateApiKey(): boolean {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;

    // Si volvimos al inicio, significa que probamos todas las keys
    if (this.currentKeyIndex === 0) {
      console.error('[LLM] ⚠️  Todas las API keys de Gemini han sido intentadas');
      return false;
    }

    console.log(`[LLM] 🔄 Rotando a API key #${this.currentKeyIndex + 1}`);
    return true;
  }

  /**
   * Genera texto usando Gemini 2.5 Flash-Lite (optimizado para stage prompts).
   * Usa el modelo más económico ($0.40/M tokens) para tareas de alta frecuencia.
   * Implementa rotación automática de API keys en caso de error de cuota.
   */
  async generate(options: GenerateOptions): Promise<string> {
    const { systemPrompt, messages, temperature = 0.9, maxTokens = 1000 } = options;

    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
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

        const currentKey = this.getCurrentApiKey();
        console.log(`[LLM] Usando modelo: ${this.modelLite} con API key #${this.currentKeyIndex + 1}`);

        const response = await fetch(
          `${this.baseURL}/models/${this.modelLite}:generateContent?key=${currentKey}`,
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

          // Detectar errores de cuota (429, 403, o mensajes de quota)
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[LLM] Error de cuota detectado, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[LLM] Gemini Flash-Lite response received');

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
          console.error('[LLM] Gemini Flash-Lite response sin texto:', JSON.stringify(data, null, 2));
          throw new Error("Gemini no retornó texto en la respuesta");
        }

        return text;
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, lanzar inmediatamente
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
          console.error("[LLM] Error al generar respuesta:", error);
          throw new Error("No se pudo generar una respuesta de la IA");
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[LLM] ❌ Todas las API keys de Gemini agotaron su cuota');
    throw new Error("Todas las API keys de Gemini han agotado su cuota. Por favor, agregue más keys o espere a que se renueven.");
  }

  /**
   * Genera un perfil completo usando Gemini 2.5 Flash (modelo completo).
   * Usa el modelo más potente ($2.50/M tokens) para razonamiento complejo.
   * Se ejecuta solo 1 vez por agente, por lo que el costo es mínimo.
   * Implementa rotación automática de API keys en caso de error de cuota.
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

    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const currentKey = this.getCurrentApiKey();
        console.log(`[LLM] Generando perfil con Gemini 2.5 Flash usando API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(
          `${this.baseURL}/models/${this.modelFull}:generateContent?key=${currentKey}`,
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

          // Detectar errores de cuota (429, 403, o mensajes de quota)
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[LLM] Error de cuota detectado en generateProfile, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Gemini HTTP error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('[LLM] Gemini Flash response received');

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          console.error('[LLM] Gemini Flash response sin texto:', JSON.stringify(data, null, 2));
          throw new Error("Gemini no retornó texto en la respuesta");
        }

        // Extraer JSON de la respuesta (Gemini a veces incluye markdown)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No se pudo extraer JSON de la respuesta");
        }

        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, intentar con fallback
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
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

    // Si llegamos aquí, todas las keys fallaron por cuota
    console.error('[LLM] ❌ Todas las API keys de Gemini agotaron su cuota en generateProfile');
    console.error('[LLM] Usando fallback debido a agotamiento de cuota');

    // En caso de agotamiento total, usar fallback en vez de fallar
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

// Singleton
let llmProvider: LLMProvider | null = null;

export function getLLMProvider(): LLMProvider {
  if (!llmProvider) {
    llmProvider = new LLMProvider();
  }
  return llmProvider;
}
