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

export interface VeniceImageParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  userTier?: 'free' | 'plus' | 'ultra'; // Para seleccionar modelo apropiado
}

export interface VeniceImageResult {
  imageUrl: string;
  revisedPrompt?: string;
  generationTime: number;
}

/**
 * Tipos de errores que puede devolver Venice API
 */
enum VeniceErrorType {
  SERVER_OVERLOAD = "SERVER_OVERLOAD",     // Servidor saturado, esperar y reintentar
  QUOTA_ERROR = "QUOTA_ERROR",             // Error de rate limit, rotar key
  INSUFFICIENT_CREDITS = "INSUFFICIENT_CREDITS", // Sin créditos, fallar definitivamente
  SERVER_ERROR = "SERVER_ERROR",           // Error 500, reintentar
  UNKNOWN = "UNKNOWN"                      // Otros errores, fallar
}

/**
 * Clasifica el tipo de error basándose en el código de estado y mensaje
 */
function classifyVeniceError(statusCode: number, errorText: string): VeniceErrorType {
  const lowerError = errorText.toLowerCase();

  // Error 500 - Problema del servidor
  if (statusCode === 500 || statusCode === 502 || statusCode === 503) {
    return VeniceErrorType.SERVER_ERROR;
  }

  // Error 429 - Puede ser saturación o quota
  if (statusCode === 429) {
    // Mensajes que indican saturación temporal del servidor
    if (
      lowerError.includes('overload') ||
      lowerError.includes('saturado') ||
      lowerError.includes('busy') ||
      lowerError.includes('too many requests') ||
      lowerError.includes('try again later') ||
      lowerError.includes('intente más tarde') ||
      lowerError.includes('please retry')
    ) {
      return VeniceErrorType.SERVER_OVERLOAD;
    }

    // Mensajes que indican falta de créditos
    if (
      lowerError.includes('insufficient credits') ||
      lowerError.includes('créditos insuficientes') ||
      lowerError.includes('no credits') ||
      lowerError.includes('balance')
    ) {
      return VeniceErrorType.INSUFFICIENT_CREDITS;
    }

    // Otros mensajes de quota/rate limit (asumir que es quota de API key)
    if (
      lowerError.includes('quota') ||
      lowerError.includes('rate limit') ||
      lowerError.includes('rate-limited')
    ) {
      return VeniceErrorType.QUOTA_ERROR;
    }

    // Si es 429 pero no podemos clasificarlo, asumir sobrecarga
    return VeniceErrorType.SERVER_OVERLOAD;
  }

  // Error 403 - Usualmente es problema de autenticación o quota
  if (statusCode === 403) {
    if (lowerError.includes('insufficient credits') || lowerError.includes('créditos insuficientes')) {
      return VeniceErrorType.INSUFFICIENT_CREDITS;
    }
    return VeniceErrorType.QUOTA_ERROR;
  }

  return VeniceErrorType.UNKNOWN;
}

/**
 * Espera un número específico de milisegundos
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Estados del Circuit Breaker
 */
enum CircuitState {
  CLOSED = "CLOSED",       // Funcionando normalmente
  OPEN = "OPEN",           // Servidor saturado, pausado
  HALF_OPEN = "HALF_OPEN"  // Probando si el servidor se recuperó
}

/**
 * Circuit Breaker global para coordinar pausas entre todos los usuarios
 */
class VeniceCircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private openedAt: number = 0;
  private failureCount: number = 0;
  private readonly cooldownMs: number = 30000; // 30 segundos
  private readonly maxFailures: number = 15;
  private lastSuccessAt: number = Date.now();
  private waitingPromises: Array<() => void> = [];

  /**
   * Verifica si el circuito permite hacer una llamada
   */
  async canAttempt(): Promise<boolean> {
    const now = Date.now();

    switch (this.state) {
      case CircuitState.CLOSED:
        // Funcionando normalmente
        return true;

      case CircuitState.OPEN:
        // Verificar si ya pasó el tiempo de cooldown
        if (now - this.openedAt >= this.cooldownMs) {
          console.log('[Venice Circuit Breaker] ⚡ Cambiando a HALF_OPEN, probando conexión...');
          this.state = CircuitState.HALF_OPEN;
          return true;
        }

        // Aún en cooldown, esperar
        const remainingMs = this.cooldownMs - (now - this.openedAt);
        console.log(`[Venice Circuit Breaker] 🔴 Circuito ABIERTO. Esperando ${Math.ceil(remainingMs / 1000)}s antes de reintentar...`);

        // Esperar hasta que termine el cooldown
        await sleep(remainingMs);
        return this.canAttempt(); // Recursivamente verificar de nuevo

      case CircuitState.HALF_OPEN:
        // Solo permitir un intento a la vez en modo HALF_OPEN
        // Otros usuarios esperan a ver el resultado
        if (this.waitingPromises.length > 0) {
          console.log('[Venice Circuit Breaker] 🟡 Esperando resultado del intento de prueba...');
          await new Promise<void>(resolve => {
            this.waitingPromises.push(resolve);
          });
          // Después de esperar, verificar recursivamente el nuevo estado
          return this.canAttempt();
        }
        return true;
    }
  }

  /**
   * Registra un intento exitoso
   */
  recordSuccess(): void {
    const wasOpen = this.state !== CircuitState.CLOSED;

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastSuccessAt = Date.now();

    if (wasOpen) {
      console.log('[Venice Circuit Breaker] ✅ Circuito CERRADO. Servidor funcionando normalmente.');

      // Notificar a todos los usuarios esperando
      this.waitingPromises.forEach(resolve => resolve());
      this.waitingPromises = [];
    }
  }

  /**
   * Registra un fallo por saturación del servidor
   */
  recordServerOverload(): void {
    this.failureCount++;

    console.log(`[Venice Circuit Breaker] ⚠️  Saturación detectada (${this.failureCount}/${this.maxFailures})`);

    if (this.failureCount >= this.maxFailures) {
      console.log('[Venice Circuit Breaker] 🛑 Máximo de reintentos alcanzado. Deteniendo intentos.');
      this.state = CircuitState.OPEN;
      this.openedAt = Date.now();

      // Rechazar todos los usuarios esperando en HALF_OPEN
      this.waitingPromises.forEach(resolve => resolve());
      this.waitingPromises = [];

      throw new Error(`Servidor de Venice saturado después de ${this.maxFailures} intentos (${Math.ceil(this.failureCount * this.cooldownMs / 60000)} minutos). Por favor, intente más tarde.`);
    }

    // Si estamos en HALF_OPEN y falló, volver a OPEN
    if (this.state === CircuitState.HALF_OPEN) {
      console.log('[Venice Circuit Breaker] 🔴 Intento de prueba falló. Volviendo a OPEN.');
      this.state = CircuitState.OPEN;
      this.openedAt = Date.now();

      // Rechazar usuarios esperando
      this.waitingPromises.forEach(resolve => resolve());
      this.waitingPromises = [];
    } else if (this.state === CircuitState.CLOSED) {
      // Primer fallo, abrir el circuito
      console.log('[Venice Circuit Breaker] 🔴 Abriendo circuito. Entrando en modo de pausa.');
      this.state = CircuitState.OPEN;
      this.openedAt = Date.now();
    }
  }

  /**
   * Obtiene el estado actual del circuito
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Obtiene estadísticas del circuito
   */
  getStats(): { state: string; failureCount: number; maxFailures: number; cooldownSeconds: number } {
    return {
      state: this.state,
      failureCount: this.failureCount,
      maxFailures: this.maxFailures,
      cooldownSeconds: this.cooldownMs / 1000
    };
  }

  /**
   * Resetea el circuito (útil para testing)
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.openedAt = 0;
    this.waitingPromises = [];
    console.log('[Venice Circuit Breaker] 🔄 Circuito reseteado manualmente.');
  }
}

/**
 * Instancia global del circuit breaker
 */
const globalCircuitBreaker = new VeniceCircuitBreaker();

/**
 * Modelos de imagen disponibles en Venice AI
 *
 * Pricing y características:
 * - z-image-turbo: $0.01/imagen (100 imágenes = $1) - Buena calidad, rápido
 * - imagineart-1.5-pro: $0.05/imagen (20 imágenes = $1) - Realismo superior, mejor manejo de luces
 *
 * La diferencia está en el MODELO, no en specs técnicas.
 * imagineart-1.5-pro produce imágenes con mejor calidad inherente incluso con mismos parámetros.
 */
export const VENICE_IMAGE_MODELS = {
  // z-image-turbo - Buena calidad para FREE tier
  TURBO: "z-image-turbo",

  // imagineart-1.5-pro - Realismo superior para PLUS/ULTRA
  PRO: "imagineart-1.5-pro",
};

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
    this.defaultModel = config.defaultModel || "venice-uncensored";

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
   * Método privado para ejecutar llamadas a Venice API con reintentos inteligentes y circuit breaker
   */
  private async executeWithRetry(body: VeniceRequestBody): Promise<any> {
    let lastError: Error | null = null;
    const maxKeyRetries = this.apiKeys.length;
    const maxServerErrorRetries = 3;

    let serverErrorAttempts = 0;

    // Intentar con cada API key disponible
    for (let keyAttempt = 0; keyAttempt < maxKeyRetries; keyAttempt++) {
      // Resetear contadores al cambiar de key
      serverErrorAttempts = 0;

      // Bucle de reintentos para errores temporales
      while (true) {
        try {
          // Verificar el circuit breaker antes de intentar
          const canProceed = await globalCircuitBreaker.canAttempt();
          if (!canProceed) {
            throw new Error('Circuit breaker rechazó el intento');
          }

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
            const errorType = classifyVeniceError(response.status, errorText);

            console.error(`[Venice] ❌ Error ${response.status} (${errorType}):`, errorText);

            // Manejar según el tipo de error
            switch (errorType) {
              case VeniceErrorType.SERVER_OVERLOAD:
                // Registrar en el circuit breaker (maneja pausas globalmente)
                globalCircuitBreaker.recordServerOverload();
                // Continuar para reintentar (el circuit breaker controlará las pausas)
                continue;

              case VeniceErrorType.SERVER_ERROR:
                serverErrorAttempts++;
                if (serverErrorAttempts <= maxServerErrorRetries) {
                  const backoffMs = Math.pow(2, serverErrorAttempts - 1) * 1000; // 1s, 2s, 4s
                  console.log(`[Venice] 🔄 Error del servidor. Reintentando en ${backoffMs/1000}s (${serverErrorAttempts}/${maxServerErrorRetries})...`);
                  await sleep(backoffMs);
                  continue; // Reintentar con la misma key
                } else {
                  console.log('[Venice] ⚠️  Máximo de reintentos por error del servidor alcanzado. Intentando con siguiente API key...');
                  lastError = new Error(`Server error after ${maxServerErrorRetries} retries`);
                  break; // Pasar a la siguiente key
                }

              case VeniceErrorType.QUOTA_ERROR:
                if (this.rotateApiKey()) {
                  console.log('[Venice] 💳 Error de rate limit detectado, intentando con siguiente API key...');
                  lastError = new Error(`Rate limit exceeded on key #${this.currentKeyIndex}`);
                  break; // Pasar a la siguiente key
                } else {
                  throw new Error("Todas las API keys han alcanzado su rate limit. Por favor, espere un momento antes de reintentar.");
                }

              case VeniceErrorType.INSUFFICIENT_CREDITS:
                console.error('[Venice] 💰 Créditos insuficientes detectados.');
                throw new Error("Créditos insuficientes en Venice AI. Por favor, agregue más créditos a su cuenta.");

              case VeniceErrorType.UNKNOWN:
              default:
                throw new Error(`Venice API error: ${response.status} - ${errorText}`);
            }
          } else {
            // Respuesta exitosa - registrar en el circuit breaker
            const data = await response.json();
            globalCircuitBreaker.recordSuccess();
            return data;
          }
        } catch (error) {
          // Si es un error de fetch (network) o parsing, lanzar inmediatamente
          if (error instanceof TypeError || (error as any).name === 'SyntaxError') {
            console.error("[Venice] ❌ Network or parsing error:", error);
            throw error;
          }

          // Si es un error que lanzamos nosotros, propagar
          if (error instanceof Error &&
              (error.message.includes('Créditos insuficientes') ||
               error.message.includes('Venice API error') ||
               error.message.includes('rate limit') ||
               error.message.includes('Servidor de Venice saturado'))) {
            throw error;
          }

          lastError = error as Error;
          break; // Pasar a la siguiente key
        }

        // Salir del bucle while si rompimos el switch
        break;
      }

      // Si llegamos aquí y no hay lastError, algo salió mal
      if (!lastError) {
        lastError = new Error('Unknown error occurred');
      }
    }

    // Si llegamos aquí, todas las keys fallaron
    console.error('[Venice] ❌ Todas las API keys fallaron después de múltiples reintentos');
    throw new Error("Todas las API keys de Venice han fallado. Por favor, verifique su cuenta o intente más tarde.");
  }

  /**
   * Genera respuesta del LLM con manejo inteligente de errores y reintentos
   */
  async generate(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();

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

    const data = await this.executeWithRetry(body);

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

    const data = await this.executeWithRetry(body);

    return data.choices[0]?.message?.content || "";
  }

  /**
   * Genera respuesta con system prompt + user message con manejo inteligente de reintentos
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

    const data = await this.executeWithRetry(body);

    return {
      text: data.choices[0]?.message?.content || "",
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
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

  /**
   * Selecciona el modelo de imagen apropiado basado en el tier del usuario
   *
   * - FREE: z-image-turbo ($0.01/imagen) - 100 imágenes = $1 USD
   * - PLUS: imagineart-1.5-pro ($0.05/imagen) - 20 imágenes = $1 USD
   * - ULTRA: imagineart-1.5-pro ($0.05/imagen) - 20 imágenes = $1 USD
   *
   * imagineart-1.5-pro tiene mejor realismo y manejo de luces inherentemente,
   * incluso con los mismos parámetros técnicos (resolución, quality, etc).
   *
   * Con un usuario PLUS/ULTRA que paga $10, obtenemos presupuesto para 200 imágenes.
   */
  private selectImageModel(userTier: 'free' | 'plus' | 'ultra'): string {
    switch (userTier) {
      case 'free':
        return VENICE_IMAGE_MODELS.TURBO; // $0.01 por imagen - Buena calidad
      case 'plus':
      case 'ultra':
        return VENICE_IMAGE_MODELS.PRO; // $0.05 por imagen - Realismo superior
      default:
        return VENICE_IMAGE_MODELS.TURBO;
    }
  }

  /**
   * Genera una imagen usando Venice AI con modelos tier-based
   *
   * Modelos y costos:
   * - FREE: z-image-turbo ($0.01/imagen) - Buena calidad, rápido
   * - PLUS/ULTRA: imagineart-1.5-pro ($0.05/imagen) - Realismo superior, mejor manejo de luces
   *
   * La diferencia está en el MODELO, no en la resolución.
   * imagineart-1.5-pro tiene mejor calidad inherente con los mismos parámetros.
   */
  async generateImage(params: VeniceImageParams): Promise<VeniceImageResult> {
    try {
      // Seleccionar modelo basado en tier
      const model = this.selectImageModel(params.userTier || 'free');

      console.log(`[Venice Image] 🎨 Generando imagen con ${model}...`);
      const startTime = Date.now();

      // Construir prompt completo (combinando prompt + negative prompt)
      let fullPrompt = params.prompt;

      if (params.negativePrompt) {
        fullPrompt += `\n\nNegative: ${params.negativePrompt}`;
      }

      const requestBody = {
        model,
        prompt: fullPrompt,
        n: 1,
        size: `${params.width || 1024}x${params.height || 1024}`,
        quality: 'standard', // Mismo para todos, la diferencia está en el modelo
        style: params.style || 'natural',
      };

      const currentKey = this.getCurrentApiKey();
      const response = await fetch(`${this.baseURL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Venice Image] ❌ Error:', response.status, errorText);
        throw new Error(`Venice Image API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Venice API retorna formato OpenAI-like: { created, data: [{ b64_json: "..." }] }
      if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        console.error('[Venice Image] Invalid response format:', JSON.stringify(data).substring(0, 500));
        throw new Error('Invalid response from Venice Image API - no b64_json in data array');
      }

      const generationTime = (Date.now() - startTime) / 1000;
      console.log(`[Venice Image] ✅ Imagen generada en ${generationTime.toFixed(2)}s`);

      // Convertir base64 a data URL
      const base64Image = data.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${base64Image}`;

      return {
        imageUrl,
        revisedPrompt: fullPrompt, // Venice no retorna revised prompt
        generationTime,
      };
    } catch (error) {
      console.error('[Venice Image] ❌ Error generando imagen:', error);
      throw error;
    }
  }


  /**
   * Mejora un prompt de usuario a formato optimizado para modelos de imagen
   *
   * Transforma descripciones narrativas en cualquier idioma a keywords
   * optimizadas en inglés con énfasis apropiado.
   *
   * Usa Qwen 3 4B (muy económico: $0.15/M output, $0.05/M input)
   *
   * Límites por tier:
   * - FREE: 2 enhancements/día
   * - PLUS: 10 enhancements/día
   * - ULTRA: 30 enhancements/día
   *
   * Ejemplo:
   * Input: "mujer joven con moño, remera beige, ojos verdes"
   * Output: "professional portrait, young woman, (elegant bun:1.4), (beige top:1.5), (green eyes:1.3), photorealistic, 8k"
   */
  async enhanceImagePrompt(userPrompt: string): Promise<string> {
    const systemPrompt = `Eres un experto en optimización de prompts para modelos de generación de imágenes (Stable Diffusion, DALL-E, Midjourney).

Tu tarea: Transformar descripciones narrativas en keywords optimizadas separadas por comas.

REGLAS OBLIGATORIAS:
1. Convertir TODO a inglés (incluso si input está en español, francés, chino, etc)
2. Separar keywords con comas (NO frases completas)
3. Agregar énfasis con () en características importantes:
   - Características únicas/críticas: (keyword:1.4) o (keyword:1.5)
   - Características importantes: (keyword:1.2) o (keyword:1.3)
   - Características normales: sin paréntesis
4. Mantener estructura: [tipo imagen], [sujeto], [características con énfasis], [calidad]
5. Máximo 75-100 palabras
6. NO usar negative prompts (modelos modernos no los necesitan)
7. Si el usuario especifica estilo (anime, cartoon, realistic), respetarlo

EJEMPLOS:

Input: "mujer joven de cabello castaño ondulado con moño elegante, viste remera beige y vestido marrón, tiene ojos verdes brillantes y maquillaje natural"
Output: professional portrait photo, young woman, (elegant bun hairstyle:1.4), brown wavy hair, (beige top:1.5), brown dress, (bright green eyes:1.3), natural makeup, soft lighting, photorealistic, 8k

Input: "homme avec cheveux courts noirs, lunettes rondes, chemise blanche"
Output: professional portrait photo, man, (short black hair:1.2), (round glasses:1.3), white shirt, natural lighting, photorealistic, 8k

Input: "chica anime de pelo rosa largo, ojos azules grandes, uniforme escolar"
Output: anime style portrait, teenage girl, (long pink hair:1.3), (large blue eyes:1.3), school uniform, detailed anime art, vibrant colors

Input: "elderly woman, gray hair in braid, warm smile, knitted sweater"
Output: professional portrait photo, elderly woman, (gray hair in braid:1.2), (warm gentle smile:1.2), knitted sweater, soft natural lighting, photorealistic, 8k

IMPORTANTE: Solo retorna el prompt optimizado, nada más.`;

    const response = await this.generateWithMessages({
      systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      model: VENICE_MODELS.QWEN_3_4B, // Modelo económico
      temperature: 0.3, // Baja temperatura para consistencia
      maxTokens: 300, // Aumentado para incluir razonamiento + respuesta
    });

    // Filtrar bloques <think> del output (el modelo puede usarlos para razonar mejor)
    // Mantener el razonamiento mejora la calidad, pero no lo mostramos al usuario
    let enhancedPrompt = response.trim();

    // Remover cualquier bloque <think>...</think>
    enhancedPrompt = enhancedPrompt.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // Remover bloque <think> sin cerrar (si quedó cortado)
    enhancedPrompt = enhancedPrompt.replace(/<think>[\s\S]*/gi, '').trim();

    console.log('[Venice Prompt Enhancer] Original:', userPrompt);
    console.log('[Venice Prompt Enhancer] Enhanced:', enhancedPrompt);

    return enhancedPrompt;
  }

  /**
   * Genera imagen de avatar optimizada para personajes
   *
   * La diferencia entre tiers está en el MODELO usado:
   * - FREE: z-image-turbo ($0.01/imagen) - Buena calidad
   * - PLUS/ULTRA: imagineart-1.5-pro ($0.05/imagen) - Realismo superior, mejor manejo de luces
   *
   * Mismo tamaño (1024x1024) para todos - diferencia en calidad del modelo.
   *
   * NO usa negative prompt por defecto (modelos 2025-2026 son buenos sin él).
   * Los usuarios pueden especificarlo solo si necesitan casos específicos.
   */
  async generateAvatar(params: {
    description: string;
    age?: number;
    gender?: 'male' | 'female' | 'non-binary';
    userTier?: 'free' | 'plus' | 'ultra';
    negativePrompt?: string; // Opcional - solo para casos específicos donde el usuario lo necesite
  }): Promise<VeniceImageResult> {
    let prompt = `professional portrait photo, ${params.description}`;

    if (params.age) {
      prompt += `, ${params.age} years old`;
    }

    if (params.gender) {
      const genderMap = {
        'male': 'male',
        'female': 'female',
        'non-binary': 'androgynous person'
      };
      prompt += `, ${genderMap[params.gender]}`;
    }

    prompt += ', high quality, realistic, detailed face, professional headshot, studio lighting, 8k';

    console.log('[Venice Avatar] Positive prompt:', prompt);
    if (params.negativePrompt) {
      console.log('[Venice Avatar] Negative prompt (user provided):', params.negativePrompt);
    }

    return this.generateImage({
      prompt,
      negativePrompt: params.negativePrompt, // undefined si no se provee (modelos modernos no lo necesitan)
      width: 1024,
      height: 1024,
      style: 'natural',
      userTier: params.userTier || 'free',
    });
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
 * Obtiene el circuit breaker global de Venice
 * Útil para monitoreo, estadísticas, o reseteo manual en testing
 */
export function getVeniceCircuitBreaker() {
  return {
    getState: () => globalCircuitBreaker.getState(),
    getStats: () => globalCircuitBreaker.getStats(),
    reset: () => globalCircuitBreaker.reset(),
  };
}

/**
 * Modelos disponibles en Venice AI (Texto)
 */
export const VENICE_MODELS = {
  // Llama 3.3 70B - Recomendado por defecto (mejor balance)
  DEFAULT: "llama-3.3-70b",

  // Llama 3.2 3B - Más rápido y económico
  FAST: "llama-3.2-3b",

  // Llama 3.1 405B - Mejor calidad (más caro)
  BEST: "llama-3.1-405b",

  // Qwen 3 4B - Para diálogos ambientales ($0.15/M output, $0.05/M input)
  QWEN_3_4B: "qwen3-4b",
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

  // Para diálogos ambientales en Minecraft (económico, rápido)
  AMBIENT_DIALOGUE: VENICE_MODELS.QWEN_3_4B,
};
