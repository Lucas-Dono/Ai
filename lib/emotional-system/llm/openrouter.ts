/**
 * OPENROUTER CLIENT
 *
 * Cliente para OpenRouter API que soporta múltiples modelos,
 * incluyendo modelos sin censura para compañeros emocionales
 */

import { LLMRequest, LLMResponse } from "../types";

export interface OpenRouterConfig {
  apiKey: string;
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
  private apiKey: string;
  private baseURL: string;
  private defaultModel: string;

  constructor(config: OpenRouterConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || "https://openrouter.ai/api/v1";
    this.defaultModel = config.defaultModel || "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";
  }

  /**
   * Genera respuesta del LLM
   */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

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

      console.log(`[OpenRouter] Sending request to ${body.model}...`);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "http://localhost:3000", // Para analytics
          "X-Title": "Creador de Inteligencias", // Para analytics
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OpenRouter] Error ${response.status}:`, errorText);
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
      console.error("[OpenRouter] Generation error:", error);
      throw error;
    }
  }

  /**
   * Genera respuesta con system prompt + user message
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

      console.log(`[OpenRouter] Generating with system prompt...`);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Creador de Inteligencias",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
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
      console.error("[OpenRouter] Generation error:", error);
      throw error;
    }
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
 * Cliente singleton de OpenRouter
 */
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not found in environment variables");
    }

    openRouterClient = new OpenRouterClient({
      apiKey,
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
