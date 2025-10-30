/**
 * VENICE AI CLIENT
 *
 * Cliente para Venice API - Privado, seguro y sin censura
 * Compatible con OpenAI API spec
 *
 * Pricing:
 * - Input: $0.20 per million tokens
 * - Output: $0.90 per million tokens
 */

import { LLMRequest, LLMResponse } from "../types";

export interface VeniceConfig {
  apiKey?: string; // Single key (deprecated, use apiKeys)
  apiKeys?: string[]; // Multiple keys for rotation
  baseURL?: string;
  defaultModel?: string;
}

export interface VeniceMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface VeniceRequestBody {
  model: string;
  messages: VeniceMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
  stream?: boolean;
}

export class VeniceClient {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: VeniceConfig) {
    // Support both single key (deprecated) and multiple keys
    if (config.apiKeys && config.apiKeys.length > 0) {
      this.apiKeys = config.apiKeys;
    } else if (config.apiKey) {
      this.apiKeys = [config.apiKey];
    } else {
      throw new Error("VeniceClient requires apiKey or apiKeys");
    }

    this.baseURL = config.baseURL || "https://api.venice.ai/api/v1";
    this.defaultModel = config.defaultModel || "llama-3.3-70b";

    console.log('[Venice] 🏝️  Inicializando cliente privado...');
    console.log('[Venice] API Keys disponibles:', this.apiKeys.length);
    console.log('[Venice] API Key activa: #1');
    console.log('[Venice] Modelo por defecto:', this.defaultModel);
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
      console.error('[Venice] ⚠️  Todas las API keys han sido intentadas');
      return false;
    }

    console.log(`[Venice] 🔄 Rotando a API key #${this.currentKeyIndex + 1}`);
    return true;
  }

  /**
   * Genera respuesta del LLM con rotación automática de API keys
   */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const messages: VeniceMessage[] = [
          {
            role: "user",
            content: request.prompt,
          },
        ];

        const body: VeniceRequestBody = {
          model: request.model || this.defaultModel,
          messages,
          temperature: request.temperature ?? 0.8,
          max_tokens: request.maxTokens ?? 1000,
          top_p: 0.9,
          stop: request.stopSequences,
        };

        const currentKey = this.getCurrentApiKey();
        console.log(`[Venice] 🚀 Sending request to ${body.model} with API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Venice] ❌ Error ${response.status}:`, errorText);

          // Detectar errores de cuota (429, 403, o mensajes de quota/rate limit)
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit') ||
                               errorText.toLowerCase().includes('rate-limited') ||
                               errorText.toLowerCase().includes('insufficient credits');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[Venice] 💳 Error de cuota detectado, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Venice API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        const elapsedMs = Date.now() - startTime;
        console.log(`[Venice] ✅ Response received in ${elapsedMs}ms`);

        return {
          text: data.choices[0]?.message?.content || "",
          model: data.model,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, lanzar inmediatamente
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
          console.error("[Venice] ❌ Generation error:", error);
          throw error;
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[Venice] ❌ Todas las API keys agotaron su cuota');
    throw new Error("Todas las API keys de Venice han agotado su cuota. Por favor, agregue más créditos o keys.");
  }

  /**
   * Genera respuesta con system prompt + múltiples mensajes (compatible con format de mundos)
   */
  async generateWithMessages(options: {
    systemPrompt: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<string> {
    const { systemPrompt, messages, temperature, maxTokens, model } = options;

    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const veniceMessages: VeniceMessage[] = [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const body: VeniceRequestBody = {
          model: model || this.defaultModel,
          messages: veniceMessages,
          temperature: temperature ?? 0.9,
          max_tokens: maxTokens ?? 1000,
          top_p: 0.9,
        };

        const currentKey = this.getCurrentApiKey();
        console.log(`[Venice] 🚀 Generating with ${messages.length} messages using API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Venice] ❌ Error ${response.status}:`, errorText);

          // Detectar errores de cuota
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit') ||
                               errorText.toLowerCase().includes('rate-limited') ||
                               errorText.toLowerCase().includes('insufficient credits');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[Venice] 💳 Error de cuota detectado en generateWithMessages, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Venice API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return data.choices[0]?.message?.content || "";
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, lanzar inmediatamente
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
          console.error("[Venice] ❌ Generation error:", error);
          throw error;
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[Venice] ❌ Todas las API keys agotaron su cuota en generateWithMessages');
    throw new Error("Todas las API keys de Venice han agotado su cuota. Por favor, agregue más créditos o keys.");
  }

  /**
   * Genera respuesta con system prompt + user message con rotación automática de API keys
   */
  async generateWithSystemPrompt(
    systemPrompt: string,
    userMessage: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    let lastError: Error | null = null;
    const maxRetries = this.apiKeys.length;

    // Intentar con cada API key disponible
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const messages: VeniceMessage[] = [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ];

        const body: VeniceRequestBody = {
          model: options?.model || this.defaultModel,
          messages,
          temperature: options?.temperature ?? 0.8,
          max_tokens: options?.maxTokens ?? 1000,
          top_p: 0.9,
        };

        const currentKey = this.getCurrentApiKey();
        console.log(`[Venice] 🚀 Generating with system prompt using API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentKey}`,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Venice] ❌ Error ${response.status}:`, errorText);

          // Detectar errores de cuota
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit') ||
                               errorText.toLowerCase().includes('rate-limited') ||
                               errorText.toLowerCase().includes('insufficient credits');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[Venice] 💳 Error de cuota detectado en generateWithSystemPrompt, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`Venice API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        return {
          text: data.choices[0]?.message?.content || "",
          model: data.model,
          usage: {
            promptTokens: data.usage?.prompt_tokens || 0,
            completionTokens: data.usage?.completion_tokens || 0,
            totalTokens: data.usage?.total_tokens || 0,
          },
        };
      } catch (error) {
        lastError = error as Error;

        // Si no es error de cuota, lanzar inmediatamente
        if (!lastError.message.includes('Quota') && !lastError.message.includes('429')) {
          console.error("[Venice] ❌ Generation error:", error);
          throw error;
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[Venice] ❌ Todas las API keys agotaron su cuota en generateWithSystemPrompt');
    throw new Error("Todas las API keys de Venice han agotado su cuota. Por favor, agregue más créditos o keys.");
  }

  /**
   * Genera JSON estructurado
   */
  async generateJSON<T = any>(
    systemPrompt: string,
    userMessage: string,
    options?: {
      model?: string;
      temperature?: number;
    }
  ): Promise<T> {
    const response = await this.generateWithSystemPrompt(
      systemPrompt + "\n\nResponde ÚNICAMENTE con JSON válido, sin texto adicional.",
      userMessage,
      {
        ...options,
        temperature: options?.temperature ?? 0.3, // Más bajo para JSON
      }
    );

    try {
      // Extraer JSON del texto (a veces viene con ```json o texto extra)
      let jsonText = response.text.trim();

      // Remover markdown code blocks si existen
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }

      // Parsear JSON
      const parsed = JSON.parse(jsonText);
      return parsed as T;
    } catch (error) {
      console.error("[Venice] ❌ JSON parsing error:", error);
      console.error("[Venice] Raw response:", response.text);
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  }
}

/**
 * Carga múltiples API keys desde variables de entorno
 * Soporta VENICE_API_KEY o VENICE_API_KEY_1, VENICE_API_KEY_2, etc.
 */
function loadVeniceApiKeys(): string[] {
  const keys: string[] = [];

  // Intentar cargar VENICE_API_KEY (single key)
  const singleKey = process.env.VENICE_API_KEY;
  if (singleKey) {
    keys.push(singleKey);
  }

  // Intentar cargar VENICE_API_KEY_1, VENICE_API_KEY_2, etc.
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`VENICE_API_KEY_${i}`];
    if (key) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Cliente singleton de Venice
 */
let veniceClient: VeniceClient | null = null;

export function getVeniceClient(): VeniceClient {
  if (!veniceClient) {
    const apiKeys = loadVeniceApiKeys();

    if (apiKeys.length === 0) {
      throw new Error("No se encontraron API keys de Venice. Configure VENICE_API_KEY o VENICE_API_KEY_1, VENICE_API_KEY_2, etc.");
    }

    veniceClient = new VeniceClient({
      apiKeys,
      defaultModel: process.env.VENICE_MODEL || "llama-3.3-70b",
    });

    console.log("[Venice] 🏝️  Client initialized with private model");
  }

  return veniceClient;
}

/**
 * Modelos disponibles en Venice AI
 */
export const VENICE_MODELS = {
  // Llama 3.3 70B - Recomendado por defecto (mejor balance)
  DEFAULT: "llama-3.3-70b",

  // Llama 3.2 3B - Más rápido y económico
  FAST: "llama-3.2-3b",

  // Llama 3.1 405B - Mejor calidad (más caro)
  BEST: "llama-3.1-405b",
};

/**
 * Modelos recomendados para diferentes tareas
 */
export const RECOMMENDED_MODELS = {
  // Para appraisal rápido (barato y rápido)
  APPRAISAL: VENICE_MODELS.FAST,

  // Para generación de emociones (balance)
  EMOTION: VENICE_MODELS.FAST,

  // Para razonamiento interno (sin censura, emocional)
  REASONING: VENICE_MODELS.DEFAULT,

  // Para decisión de acción (rápido)
  ACTION: VENICE_MODELS.FAST,

  // Para respuesta final (sin censura, expresivo)
  RESPONSE: VENICE_MODELS.DEFAULT,

  // Para JSON estructurado (más preciso)
  JSON: VENICE_MODELS.DEFAULT,
};
