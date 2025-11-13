/**
 * OPENROUTER CLIENT
 *
 * Cliente para OpenRouter API que soporta múltiples modelos,
 * incluyendo modelos sin censura para compañeros emocionales
 */

import { LLMRequest, LLMResponse } from "../types";

export interface OpenRouterConfig {
  apiKey?: string; // Single key (deprecated, use apiKeys)
  apiKeys?: string[]; // Multiple keys for rotation
  baseURL?: string;
  defaultModel?: string;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequestBody {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string[];
  stream?: boolean;
}

export class OpenRouterClient {
  private apiKeys: string[];
  private currentKeyIndex: number = 0;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: OpenRouterConfig) {
    // Support both single key (deprecated) and multiple keys
    if (config.apiKeys && config.apiKeys.length > 0) {
      this.apiKeys = config.apiKeys;
    } else if (config.apiKey) {
      this.apiKeys = [config.apiKey];
    } else {
      throw new Error("OpenRouterClient requires apiKey or apiKeys");
    }

    this.baseURL = config.baseURL || "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

    console.log('[OpenRouter] Inicializando cliente...');
    console.log('[OpenRouter] API Keys disponibles:', this.apiKeys.length);
    console.log('[OpenRouter] API Key activa: #1');
    console.log('[OpenRouter] Modelo por defecto:', this.defaultModel);
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
      console.error('[OpenRouter] ⚠️  Todas las API keys han sido intentadas');
      return false;
    }

    console.log(`[OpenRouter] 🔄 Rotando a API key #${this.currentKeyIndex + 1}`);
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
        const messages: OpenRouterMessage[] = [
          {
            role: "user",
            content: request.prompt,
          },
        ];

        const body: OpenRouterRequestBody = {
          model: request.model || this.defaultModel,
          messages,
          temperature: request.temperature ?? 0.8,
          max_tokens: request.maxTokens ?? 1000,
          top_p: 0.9,
          stop: request.stopSequences,
        };

        const currentKey = this.getCurrentApiKey();
        console.log(`[OpenRouter] Sending request to ${body.model} with API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentKey}`,
            "HTTP-Referer": "http://localhost:3000", // Para analytics
            "X-Title": "Circuit Prompt AI", // Para analytics
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[OpenRouter] Error ${response.status}:`, errorText);

          // Detectar errores de cuota (429, 403, o mensajes de quota/rate limit)
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit') ||
                               errorText.toLowerCase().includes('rate-limited');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[OpenRouter] Error de cuota detectado, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        const elapsedMs = Date.now() - startTime;
        console.log(`[OpenRouter] Response received in ${elapsedMs}ms`);

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
          console.error("[OpenRouter] Generation error:", error);
          throw error;
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[OpenRouter] ❌ Todas las API keys agotaron su cuota');
    throw new Error("Todas las API keys de OpenRouter han agotado su cuota. Por favor, agregue más keys o espere a que se renueven.");
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
        const messages: OpenRouterMessage[] = [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userMessage,
          },
        ];

        const body: OpenRouterRequestBody = {
          model: options?.model || this.defaultModel,
          messages,
          temperature: options?.temperature ?? 0.8,
          max_tokens: options?.maxTokens ?? 1000,
          top_p: 0.9,
        };

        const currentKey = this.getCurrentApiKey();
        console.log(`[OpenRouter] Generating with system prompt using API key #${this.currentKeyIndex + 1}...`);

        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Circuit Prompt AI",
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[OpenRouter] Error ${response.status}:`, errorText);

          // Detectar errores de cuota
          const isQuotaError = response.status === 429 ||
                               response.status === 403 ||
                               errorText.toLowerCase().includes('quota') ||
                               errorText.toLowerCase().includes('rate limit') ||
                               errorText.toLowerCase().includes('rate-limited');

          if (isQuotaError && this.rotateApiKey()) {
            console.log('[OpenRouter] Error de cuota detectado en generateWithSystemPrompt, intentando con siguiente API key...');
            lastError = new Error(`Quota exceeded on key #${this.currentKeyIndex}`);
            continue; // Reintentar con siguiente key
          }

          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
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
          console.error("[OpenRouter] Generation error:", error);
          throw error;
        }
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[OpenRouter] ❌ Todas las API keys agotaron su cuota en generateWithSystemPrompt');
    throw new Error("Todas las API keys de OpenRouter han agotado su cuota. Por favor, agregue más keys o espere a que se renueven.");
  }

  /**
   * Genera JSON estructurado (mejor con Claude o GPT-4)
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
      console.error("[OpenRouter] JSON parsing error:", error);
      console.error("[OpenRouter] Raw response:", response.text);
      throw new Error(`Failed to parse JSON response: ${error}`);
    }
  }
}

/**
 * Carga múltiples API keys desde variables de entorno
 * Soporta OPENROUTER_API_KEY o OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, etc.
 */
function loadOpenRouterApiKeys(): string[] {
  const keys: string[] = [];

  // Intentar cargar OPENROUTER_API_KEY (single key)
  const singleKey = process.env.OPENROUTER_API_KEY;
  if (singleKey) {
    keys.push(singleKey);
  }

  // Intentar cargar OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, etc.
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`OPENROUTER_API_KEY_${i}`];
    if (key) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Cliente singleton de OpenRouter
 */
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    const apiKeys = loadOpenRouterApiKeys();

    if (apiKeys.length === 0) {
      throw new Error("No se encontraron API keys de OpenRouter. Configure OPENROUTER_API_KEY o OPENROUTER_API_KEY_1, OPENROUTER_API_KEY_2, etc.");
    }

    openRouterClient = new OpenRouterClient({
      apiKeys,
      defaultModel: process.env.MODEL_UNCENSORED || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    });

    console.log("[OpenRouter] Client initialized with uncensored model");
  }

  return openRouterClient;
}

/**
 * Modelos recomendados para diferentes tareas
 */
export const RECOMMENDED_MODELS = {
  // Para appraisal rápido (barato y rápido)
  APPRAISAL: "google/gemini-2.0-flash-exp:free",

  // Para generación de emociones (barato)
  EMOTION: "google/gemini-2.0-flash-exp:free",

  // Para razonamiento interno (sin censura, emocional)
  REASONING: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",

  // Para decisión de acción (rápido)
  ACTION: "google/gemini-2.0-flash-exp:free",

  // Para respuesta final (sin censura, expresivo)
  RESPONSE: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",

  // Para JSON estructurado (si hay budget, usar Claude)
  JSON: "anthropic/claude-3.5-sonnet:beta", // Mejor para JSON, pero caro
  JSON_CHEAP: "google/gemini-2.0-flash-exp:free", // Alternativa económica
};
