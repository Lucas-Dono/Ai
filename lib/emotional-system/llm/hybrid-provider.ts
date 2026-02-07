/**
 * HYBRID LLM PROVIDER
 *
 * Sistema inteligente de selección de proveedor LLM por fase.
 *
 * Estrategia:
 * - Gemini (gratis): Fases técnicas que NO requieren contenido sin censura
 * - Venice (pago): Fases que generan texto visible o requieren autenticidad total
 *
 * Ahorro estimado: 60-70% en costos totales
 */

import { getVeniceClient, VENICE_MODELS } from './venice';
import { LLMRequest, LLMResponse } from '../types';
import { getLLMProvider } from '@/lib/llm/provider';

export type LLMPhase =
  | 'appraisal'      // ✅ Gemini - Evaluación técnica JSON
  | 'emotion'        // ✅ Gemini - Generación emociones JSON
  | 'reasoning'      // ❌ Venice - Pensamiento interno auténtico
  | 'action'         // ✅ Gemini - Decisión de acción JSON
  | 'response'       // ❌ Venice - Respuesta visible (CRÍTICO)
  | 'proactive';     // ❌ Venice - Mensaje proactivo visible (CRÍTICO)

/**
 * Configuración de provider por fase
 */
const PHASE_CONFIG: Record<LLMPhase, {
  provider: 'gemini' | 'venice';
  reason: string;
  model?: string;
}> = {
  appraisal: {
    provider: 'gemini',
    reason: 'Evaluación técnica numérica - No requiere sin censura',
  },
  emotion: {
    provider: 'gemini',
    reason: 'Generación de emociones JSON - No requiere sin censura',
  },
  reasoning: {
    provider: 'venice',
    reason: 'Pensamiento interno auténtico - Requiere honestidad total',
    model: VENICE_MODELS.DEFAULT,
  },
  action: {
    provider: 'gemini',
    reason: 'Decisión de acción JSON - No requiere sin censura',
  },
  response: {
    provider: 'venice',
    reason: 'CRÍTICO: Texto visible al usuario - Requiere sin censura total',
    model: VENICE_MODELS.DEFAULT,
  },
  proactive: {
    provider: 'venice',
    reason: 'CRÍTICO: Mensaje visible al usuario - Requiere sin censura total',
    model: VENICE_MODELS.DEFAULT,
  },
};

/**
 * Cliente híbrido que selecciona automáticamente el mejor provider
 */
export class HybridLLMProvider {
  private veniceClient = getVeniceClient();
  private geminiClient = getLLMProvider();

  /**
   * Genera respuesta usando el provider óptimo para la fase
   */
  async generate(
    phase: LLMPhase,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const config = PHASE_CONFIG[phase];

    console.log(`[HybridLLM] Phase: ${phase} → Provider: ${config.provider.toUpperCase()} (${config.reason})`);

    if (config.provider === 'venice') {
      // Usar Venice para fases críticas
      return this.veniceClient.generate({
        ...request,
        model: config.model || request.model,
      });
    } else {
      // Usar Gemini para fases técnicas
      // Gemini devuelve string directamente, no objeto { text }
      const responseText = await this.geminiClient.generate({
        systemPrompt: '',
        messages: [
          { role: 'user', content: request.prompt }
        ],
      });

      // Convertir a formato LLMResponse
      return {
        text: responseText,
        model: process.env.GEMINI_MODEL_LITE || 'gemini-2.5-flash-lite',
        usage: {
          promptTokens: 0,  // Gemini no devuelve usage
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    }
  }

  /**
   * Genera con system prompt
   */
  async generateWithSystemPrompt(
    phase: LLMPhase,
    systemPrompt: string,
    userMessage: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const config = PHASE_CONFIG[phase];

    console.log(`[HybridLLM] Phase: ${phase} → Provider: ${config.provider.toUpperCase()}`);

    if (config.provider === 'venice') {
      return this.veniceClient.generateWithSystemPrompt(
        systemPrompt,
        userMessage,
        {
          model: config.model,
          ...options,
        }
      );
    } else {
      // Gemini: Combinar system prompt + user message
      const combinedPrompt = `${systemPrompt}\n\n${userMessage}`;
      const responseText = await this.geminiClient.generate({
        systemPrompt: '',
        messages: [
          { role: 'user', content: combinedPrompt }
        ],
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      });

      // Convertir a formato LLMResponse
      return {
        text: responseText,
        model: process.env.GEMINI_MODEL_LITE || 'gemini-2.5-flash-lite',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    }
  }

  /**
   * Genera JSON estructurado
   */
  async generateJSON<T = any>(
    phase: LLMPhase,
    systemPrompt: string,
    userMessage: string,
    options?: {
      temperature?: number;
    }
  ): Promise<T> {
    const config = PHASE_CONFIG[phase];

    console.log(`[HybridLLM] Phase: ${phase} → Provider: ${config.provider.toUpperCase()} (JSON)`);

    if (config.provider === 'venice') {
      return this.veniceClient.generateJSON<T>(
        systemPrompt,
        userMessage,
        {
          model: config.model,
          ...options,
        }
      );
    } else {
      // Gemini: Generar y parsear
      const combinedPrompt = `${systemPrompt}\n\nResponde ÚNICAMENTE con JSON válido, sin texto adicional.\n\n${userMessage}`;

      // Gemini devuelve string directamente
      const responseText = await this.geminiClient.generate({
        systemPrompt: '',
        messages: [
          { role: 'user', content: combinedPrompt }
        ],
        temperature: options?.temperature,
      });

      // Parsear JSON
      let jsonText = responseText.trim();

      // Remover markdown code blocks si existen
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }

      try {
        return JSON.parse(jsonText) as T;
      } catch (error) {
        console.error('[HybridLLM] JSON parsing error:', error);
        console.error('[HybridLLM] Raw response:', responseText);
        throw new Error(`Failed to parse JSON response: ${error}`);
      }
    }
  }

  /**
   * Obtiene configuración para una fase
   */
  getPhaseConfig(phase: LLMPhase) {
    return PHASE_CONFIG[phase];
  }

  /**
   * Calcula ahorro estimado vs usar solo Venice
   */
  async estimateSavings(messagesPerDay: number): Promise<{
    veniceOnlyCost: number;
    hybridCost: number;
    savings: number;
    savingsPercent: number;
  }> {
    // Costos estimados por fase (en USD)
    const VENICE_COST_PER_PHASE = {
      appraisal: 0.0001,
      emotion: 0.00012,
      reasoning: 0.0004,
      action: 0.00008,
      response: 0.0015,
    };

    const GEMINI_COST_PER_PHASE = {
      appraisal: 0, // Gratis dentro de cuota
      emotion: 0,
      reasoning: 0,
      action: 0,
      response: 0,
    };

    // Costo con todo Venice
    const veniceOnlyPerMessage =
      VENICE_COST_PER_PHASE.appraisal +
      VENICE_COST_PER_PHASE.emotion +
      VENICE_COST_PER_PHASE.reasoning +
      VENICE_COST_PER_PHASE.action +
      VENICE_COST_PER_PHASE.response;

    // Costo híbrido
    const hybridPerMessage =
      GEMINI_COST_PER_PHASE.appraisal +        // Gemini
      GEMINI_COST_PER_PHASE.emotion +          // Gemini
      VENICE_COST_PER_PHASE.reasoning +        // Venice
      GEMINI_COST_PER_PHASE.action +           // Gemini
      VENICE_COST_PER_PHASE.response;          // Venice

    const veniceOnlyCost = veniceOnlyPerMessage * messagesPerDay * 30; // Mes
    const hybridCost = hybridPerMessage * messagesPerDay * 30;
    const savings = veniceOnlyCost - hybridCost;
    const savingsPercent = (savings / veniceOnlyCost) * 100;

    return {
      veniceOnlyCost,
      hybridCost,
      savings,
      savingsPercent,
    };
  }
}

/**
 * Cliente singleton híbrido
 */
let hybridClient: HybridLLMProvider | null = null;

export function getHybridLLMProvider(): HybridLLMProvider {
  if (!hybridClient) {
    hybridClient = new HybridLLMProvider();
    console.log('[HybridLLM] 🔀 Hybrid provider initialized');
    console.log('[HybridLLM] Gemini: appraisal, emotion, action');
    console.log('[HybridLLM] Venice: reasoning, response, proactive');
  }

  return hybridClient;
}
