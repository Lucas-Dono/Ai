/**
 * Tier-based Rate Limiting System
 *
 * Defines comprehensive limits for each user tier (Free, Plus, Ultra)
 * covering API requests, messages, resources, and features.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UserTier = "free" | "plus" | "ultra";

export interface RateLimitWindow {
  perMinute: number;
  perHour: number;
  perDay: number;
}

export interface ResourceLimits {
  // TOKEN-BASED LIMITS (justo y preciso)
  inputTokensPerDay: number;      // Tokens de entrada (usuario) por día
  outputTokensPerDay: number;     // Tokens de salida (IA) por día
  totalTokensPerDay: number;      // Total combinado por día
  inputTokensPerWeek: number;     // ANTI-ABUSE: Control semanal de entrada
  outputTokensPerWeek: number;    // ANTI-ABUSE: Control semanal de salida
  totalTokensPerWeek: number;     // ANTI-ABUSE: Control semanal total

  // OTHER RESOURCES
  contextMessages: number;         // Contexto histórico en prompts
  activeAgents: number;
  activeWorlds: number;
  charactersInMarketplace: number;
  imageGenerationPerDay: number;
  imageAnalysisPerMonth: number;
  imageAnalysisPerDay: number;    // ANTI-ABUSE: Límite diario para análisis de imágenes
  voiceMessagesPerMonth: number;
  voiceMessagesPerDay: number;    // ANTI-ABUSE: Límite diario para mensajes de voz
  proactiveMessagesPerDay: number; // Mensajes proactivos de la IA
}

export interface TierLimits {
  tier: UserTier;
  displayName: string;

  // API Rate Limiting
  apiRequests: RateLimitWindow;

  // Resource Limits
  resources: ResourceLimits;

  // Feature Flags
  features: {
    nsfwContent: boolean;
    advancedBehaviors: boolean;
    voiceMessages: boolean;
    priorityGeneration: boolean;
    apiAccess: boolean;
    exportConversations: boolean;
    customVoiceCloning: boolean;
  };

  // Cooldowns (in milliseconds)
  cooldowns: {
    messageCooldown: number;
    worldMessageCooldown: number;
    imageAnalysisCooldown: number;  // ← ANTI-BOT: Cooldown entre análisis de imágenes
    voiceMessageCooldown: number;   // ← ANTI-BOT: Cooldown entre mensajes de voz
  };
}

// ============================================================================
// TIER DEFINITIONS
// ============================================================================

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  free: {
    tier: "free",
    displayName: "Free (Bootstrap)",

    apiRequests: {
      perMinute: 10,
      perHour: 100,
      perDay: 300,
    },

    resources: {
      // TOKEN-BASED LIMITS: 10 mensajes/día (~3,500 tokens), 50 mensajes/semana (~17,500 tokens)
      inputTokensPerDay: 1_500,      // ~10 mensajes × 150 tokens input
      outputTokensPerDay: 2_000,     // ~10 mensajes × 200 tokens output
      totalTokensPerDay: 3_500,      // ~10 mensajes × 350 tokens total
      inputTokensPerWeek: 7_500,     // ~50 mensajes × 150 tokens
      outputTokensPerWeek: 10_000,   // ~50 mensajes × 200 tokens
      totalTokensPerWeek: 17_500,    // ~50 mensajes × 350 tokens

      // OTHER RESOURCES
      contextMessages: 10,
      activeAgents: 3,
      activeWorlds: 0, // Sin worlds (muy costoso)
      charactersInMarketplace: 0,
      imageGenerationPerDay: 0,
      imageAnalysisPerMonth: 2, // REDUCIDO: 2/mes (bootstrap)
      imageAnalysisPerDay: 1, // Max 1 análisis/día
      voiceMessagesPerMonth: 0,
      voiceMessagesPerDay: 0, // Sin voz en free
      proactiveMessagesPerDay: 0, // Sin proactive en free
    },

    features: {
      nsfwContent: false,
      advancedBehaviors: false, // Sin yandere, BPD, etc.
      voiceMessages: false,
      priorityGeneration: false,
      apiAccess: false,
      exportConversations: false,
      customVoiceCloning: false,
    },

    cooldowns: {
      messageCooldown: 5000, // ← ANTI-SPAM: 5 segundos entre mensajes (reducir carga)
      worldMessageCooldown: 15000, // 15 seconds (disuadir uso)
      imageAnalysisCooldown: 10000, // 10 segundos entre imágenes
      voiceMessageCooldown: 0, // N/A (sin acceso)
    },
  },

  plus: {
    tier: "plus",
    displayName: "Plus ($5/mes)",

    apiRequests: {
      perMinute: 30,
      perHour: 600,
      perDay: 3000,
    },

    resources: {
      // TOKEN-BASED LIMITS: 100 mensajes/día (~35,000 tokens), 500 mensajes/semana (~175,000 tokens)
      inputTokensPerDay: 15_000,     // ~100 mensajes × 150 tokens input
      outputTokensPerDay: 20_000,    // ~100 mensajes × 200 tokens output
      totalTokensPerDay: 35_000,     // ~100 mensajes × 350 tokens total
      inputTokensPerWeek: 75_000,    // ~500 mensajes × 150 tokens
      outputTokensPerWeek: 100_000,  // ~500 mensajes × 200 tokens
      totalTokensPerWeek: 175_000,   // ~500 mensajes × 350 tokens

      // OTHER RESOURCES
      contextMessages: 40, // 4x más contexto que free
      activeAgents: 15,
      activeWorlds: 3, // Worlds limitados (costosos)
      charactersInMarketplace: 5,
      imageGenerationPerDay: 10,
      imageAnalysisPerMonth: 30, // 1 imagen/día promedio
      imageAnalysisPerDay: 3, // ANTI-ABUSE: Max 3 análisis/día
      voiceMessagesPerMonth: 50, // Voz limitada ($0.17/msg)
      voiceMessagesPerDay: 5, // ANTI-ABUSE: Max 5 voz/día
      proactiveMessagesPerDay: 3, // 3 proactive/día
    },

    features: {
      nsfwContent: true, // ✅ NSFW habilitado
      advancedBehaviors: true, // ✅ Yandere, BPD, etc.
      voiceMessages: true,
      priorityGeneration: false, // Solo Ultra
      apiAccess: false,
      exportConversations: true,
      customVoiceCloning: false, // Solo Ultra
    },

    cooldowns: {
      messageCooldown: 2000, // ← 2 segundos entre mensajes (evitar spam)
      worldMessageCooldown: 3000, // 3 segundos
      imageAnalysisCooldown: 3000, // ← 3 segundos entre imágenes
      voiceMessageCooldown: 3000, // ← 3 segundos entre voz
    },
  },

  ultra: {
    tier: "ultra",
    displayName: "Ultra ($15/mes)",

    apiRequests: {
      perMinute: 100,
      perHour: 6000, // 100/min × 60
      perDay: 10000, // Generoso pero no ilimitado
    },

    resources: {
      // TOKEN-BASED LIMITS: 100 mensajes/día (~35,000 tokens), 700 mensajes/semana (~245,000 tokens)
      inputTokensPerDay: 15_000,     // ~100 mensajes × 150 tokens input
      outputTokensPerDay: 20_000,    // ~100 mensajes × 200 tokens output
      totalTokensPerDay: 35_000,     // ~100 mensajes × 350 tokens total
      inputTokensPerWeek: 105_000,   // ~700 mensajes × 150 tokens (USER PROPOSAL)
      outputTokensPerWeek: 140_000,  // ~700 mensajes × 200 tokens (USER PROPOSAL)
      totalTokensPerWeek: 245_000,   // ~700 mensajes × 350 tokens (USER PROPOSAL)

      // OTHER RESOURCES
      contextMessages: 100, // Máximo contexto (memoria profunda)
      activeAgents: 100, // Más que suficiente para power users
      activeWorlds: 20,
      charactersInMarketplace: 50,
      imageGenerationPerDay: 100,
      imageAnalysisPerMonth: 600, // 20/día × 30 = 600/mes
      imageAnalysisPerDay: 20, // Generoso pero no abusivo
      voiceMessagesPerMonth: 600, // 20/día × 30 = 600/mes
      voiceMessagesPerDay: 20, // Generoso pero no abusivo
      proactiveMessagesPerDay: 10, // Suficiente para proactividad sin spam
    },

    features: {
      nsfwContent: true,
      advancedBehaviors: true,
      voiceMessages: true,
      priorityGeneration: true, // ✅ Respuestas prioritarias
      apiAccess: true, // ✅ API access para power users
      exportConversations: true,
      customVoiceCloning: true, // ✅ Voice cloning personalizado
    },

    cooldowns: {
      messageCooldown: 1000, // ← ANTI-BOT: 1 segundo (imperceptible para humanos)
      worldMessageCooldown: 1000, // ← ANTI-BOT: 1 segundo
      imageAnalysisCooldown: 5000, // ← ANTI-BOT: 5 segundos (user proposal)
      voiceMessageCooldown: 5000, // ← ANTI-BOT: 5 segundos (user proposal)
    },
  },
};

// ============================================================================
// TOKEN <-> MESSAGE CONVERSION (for UI)
// ============================================================================

/**
 * Promedio de tokens por mensaje para conversiones UI
 * Basado en análisis de uso real:
 * - Input (usuario): ~150 tokens
 * - Output (AI): ~200 tokens
 * - Total: ~350 tokens por intercambio
 */
export const TOKENS_PER_MESSAGE = {
  input: 150,
  output: 200,
  total: 350,
} as const;

/**
 * Convierte tokens a mensajes estimados (para mostrar en UI)
 */
export function tokensToMessages(tokens: number, type: 'input' | 'output' | 'total' = 'total'): number {
  if (tokens === -1) return -1; // Unlimited
  const divisor = TOKENS_PER_MESSAGE[type];
  return Math.floor(tokens / divisor);
}

/**
 * Convierte mensajes a tokens estimados (para cálculos)
 */
export function messagesToTokens(messages: number, type: 'input' | 'output' | 'total' = 'total'): number {
  if (messages === -1) return -1; // Unlimited
  const multiplier = TOKENS_PER_MESSAGE[type];
  return messages * multiplier;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get tier limits for a given plan
 */
export function getTierLimits(plan: string = "free"): TierLimits {
  const tier = plan.toLowerCase() as UserTier;
  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

/**
 * Check if a limit is unlimited
 */
export function isUnlimited(limit: number): boolean {
  return limit === -1;
}

/**
 * Check if a tier has a specific feature
 */
export function hasTierFeature(tier: UserTier, feature: keyof TierLimits["features"]): boolean {
  return TIER_LIMITS[tier].features[feature];
}

/**
 * Get resource limit value
 */
export function getResourceLimit(tier: UserTier, resource: keyof ResourceLimits): number {
  return TIER_LIMITS[tier].resources[resource];
}

/**
 * Check if resource usage is within limits
 */
export function isWithinLimit(currentUsage: number, limit: number): boolean {
  if (isUnlimited(limit)) return true;
  return currentUsage < limit;
}

/**
 * Calculate remaining quota
 */
export function getRemainingQuota(currentUsage: number, limit: number): number {
  if (isUnlimited(limit)) return -1; // Unlimited
  return Math.max(0, limit - currentUsage);
}

/**
 * Get upgrade message for a specific limit
 */
export function getUpgradeMessage(
  tier: UserTier,
  limitType: string,
  current: number,
  limit: number
): string {
  const tierName = TIER_LIMITS[tier].displayName;

  switch (tier) {
    case "free":
      return `Límite ${limitType} alcanzado (${current}/${limit}). Actualiza a Plus para límites más altos o Ultra para acceso ilimitado. /pricing`;

    case "plus":
      return `Límite ${limitType} alcanzado (${current}/${limit}). Actualiza a Ultra para acceso ilimitado y características premium. /pricing`;

    case "ultra":
      return `Límite ${limitType} alcanzado (${current}/${limit}). Por favor espera o contacta soporte.`;

    default:
      return `Límite ${limitType} alcanzado. Considera actualizar tu plan.`;
  }
}

/**
 * Get rate limit upgrade message
 */
export function getRateLimitUpgradeMessage(tier: UserTier): string {
  switch (tier) {
    case "free":
      return "Límite de solicitudes por minuto alcanzado (10/min). Actualiza a Plus para 30 req/min o Ultra para 100 req/min. /pricing";

    case "plus":
      return "Límite de solicitudes por minuto alcanzado (30/min). Actualiza a Ultra para 100 req/min sin límites horarios/diarios. /pricing";

    case "ultra":
      return "Límite de solicitudes por minuto alcanzado (100/min). Por favor espera un momento.";

    default:
      return "Límite de solicitudes alcanzado. Por favor espera un momento.";
  }
}

// ============================================================================
// ERROR RESPONSE BUILDERS
// ============================================================================

export interface RateLimitError {
  error: string;
  code: "RATE_LIMIT_EXCEEDED";
  tier: UserTier;
  limit: number;
  remaining: number;
  reset?: number;
  upgradeUrl: string;
  upgradeMessage: string;
}

export interface ResourceLimitError {
  error: string;
  code: "RESOURCE_LIMIT_EXCEEDED";
  tier: UserTier;
  resource: string;
  current: number;
  limit: number;
  upgradeUrl: string;
  upgradeMessage: string;
}

/**
 * Build rate limit error response
 */
export function buildRateLimitError(
  tier: UserTier,
  limit: number,
  remaining: number,
  reset?: number
): RateLimitError {
  return {
    error: "Rate limit exceeded",
    code: "RATE_LIMIT_EXCEEDED",
    tier,
    limit,
    remaining,
    reset,
    upgradeUrl: "/pricing",
    upgradeMessage: getRateLimitUpgradeMessage(tier),
  };
}

/**
 * Build resource limit error response
 */
export function buildResourceLimitError(
  tier: UserTier,
  resource: string,
  current: number,
  limit: number
): ResourceLimitError {
  return {
    error: "Resource limit exceeded",
    code: "RESOURCE_LIMIT_EXCEEDED",
    tier,
    resource,
    current,
    limit,
    upgradeUrl: "/pricing",
    upgradeMessage: getUpgradeMessage(tier, resource, current, limit),
  };
}

// ============================================================================
// COMPARISON & ANALYTICS
// ============================================================================

/**
 * Compare two tiers
 */
export function compareTiers(tierA: UserTier, tierB: UserTier): number {
  const order: Record<UserTier, number> = { free: 0, plus: 1, ultra: 2 };
  return order[tierA] - order[tierB];
}

/**
 * Get next tier for upgrade
 */
export function getNextTier(currentTier: UserTier): UserTier | null {
  if (currentTier === "free") return "plus";
  if (currentTier === "plus") return "ultra";
  return null; // Already at top tier
}

/**
 * Get tier benefits for comparison
 */
export interface TierComparison {
  tier: UserTier;
  limits: TierLimits;
  improvements: string[];
}

export function getTierComparison(fromTier: UserTier, toTier: UserTier): TierComparison {
  const fromLimits = TIER_LIMITS[fromTier];
  const toLimits = TIER_LIMITS[toTier];

  const improvements: string[] = [];

  // API requests
  if (toLimits.apiRequests.perMinute > fromLimits.apiRequests.perMinute) {
    improvements.push(`${toLimits.apiRequests.perMinute} solicitudes/min (antes: ${fromLimits.apiRequests.perMinute})`);
  }

  // Messages
  if (toLimits.resources.messagesPerDay !== fromLimits.resources.messagesPerDay) {
    const toMsg = isUnlimited(toLimits.resources.messagesPerDay) ? "ilimitados" : toLimits.resources.messagesPerDay;
    improvements.push(`${toMsg} mensajes/día`);
  }

  // Agents
  if (toLimits.resources.activeAgents > fromLimits.resources.activeAgents) {
    improvements.push(`${toLimits.resources.activeAgents} agentes activos`);
  }

  // Worlds
  if (toLimits.resources.activeWorlds > fromLimits.resources.activeWorlds) {
    improvements.push(`${toLimits.resources.activeWorlds} mundos activos`);
  }

  // Features
  Object.entries(toLimits.features).forEach(([feature, enabled]) => {
    if (enabled && !fromLimits.features[feature as keyof TierLimits["features"]]) {
      improvements.push(`✅ ${feature}`);
    }
  });

  return {
    tier: toTier,
    limits: toLimits,
    improvements,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TIER_LIMITS;
