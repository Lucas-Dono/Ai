/**
 * ANTI-GAMING DETECTION SYSTEM
 *
 * Detecta patrones sospechosos que intentan "gamear" el sistema:
 * - Spam de mensajes sin contenido real
 * - Copy-paste detectado
 * - Patrones de bot (timing perfecto, mensajes idénticos)
 * - Farming de múltiples cuentas
 * - Comportamiento no-humano
 */

import { prisma } from "@/lib/prisma";
import stringSimilarity from "string-similarity";

// Thresholds para detección
const THRESHOLDS = {
  MESSAGE_SIMILARITY: 0.85, // Si >85% similar a mensajes anteriores = sospechoso
  MIN_MESSAGE_LENGTH: 10, // Mensajes muy cortos son spam
  MAX_MESSAGES_PER_MINUTE: 10, // Humanos no escriben tan rápido consistentemente
  MIN_TIME_BETWEEN_MESSAGES: 2000, // 2 segundos mínimo entre mensajes
  SUSPICIOUS_SCORE_THRESHOLD: 0.7, // Score >0.7 = flagear para review
  BOT_PATTERN_SCORE: 0.8, // Score >0.8 = muy probablemente bot
};

export interface SuspiciousActivity {
  userId: string;
  agentId: string;
  type: string;
  score: number; // 0-1, donde 1 = muy sospechoso
  evidence: string[];
  timestamp: Date;
}

/**
 * Analiza si un mensaje es sospechoso
 */
export async function analyzeMessageForGaming(
  userId: string,
  agentId: string,
  message: string,
  metadata?: any
): Promise<{ suspicious: boolean; score: number; reasons: string[] }> {
  const reasons: string[] = [];
  let score = 0;

  // 1. Verificar longitud del mensaje
  if (message.length < THRESHOLDS.MIN_MESSAGE_LENGTH) {
    reasons.push("Mensaje muy corto");
    score += 0.2;
  }

  // 2. Obtener últimos mensajes del usuario con este agente
  const recentMessages = await prisma.message.findMany({
    where: {
      userId,
      agentId,
      role: "user",
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // Última hora
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      content: true,
      createdAt: true,
    },
  });

  // 3. Verificar similitud con mensajes recientes (copy-paste detection)
  if (recentMessages.length > 0) {
    const similarities = recentMessages.map((msg) =>
      stringSimilarity.compareTwoStrings(message, msg.content)
    );

    const highestSimilarity = Math.max(...similarities);
    const similarCount = similarities.filter(
      (s) => s > THRESHOLDS.MESSAGE_SIMILARITY
    ).length;

    if (highestSimilarity > THRESHOLDS.MESSAGE_SIMILARITY) {
      reasons.push(
        `Mensaje muy similar a anteriores (${(highestSimilarity * 100).toFixed(1)}%)`
      );
      score += 0.3;
    }

    if (similarCount >= 3) {
      reasons.push(`Múltiples mensajes casi idénticos (${similarCount})`);
      score += 0.2;
    }
  }

  // 4. Verificar timing entre mensajes (bot pattern detection)
  if (recentMessages.length >= 5) {
    const timeDiffs = [];
    for (let i = 0; i < recentMessages.length - 1; i++) {
      const diff =
        recentMessages[i].createdAt.getTime() -
        recentMessages[i + 1].createdAt.getTime();
      timeDiffs.push(diff);
    }

    // Calcular varianza de tiempos
    const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const variance =
      timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) /
      timeDiffs.length;
    const stdDev = Math.sqrt(variance);

    // Timing muy consistente = probablemente bot
    if (stdDev < 500 && avgDiff < 5000) {
      // Menos de 0.5s de variación y promedio <5s
      reasons.push(
        `Patrón de timing robótico (σ=${(stdDev / 1000).toFixed(2)}s)`
      );
      score += 0.4;
    }

    // Mensajes demasiado rápidos
    const fastMessages = timeDiffs.filter(
      (d) => d < THRESHOLDS.MIN_TIME_BETWEEN_MESSAGES
    ).length;
    if (fastMessages > 3) {
      reasons.push(`Mensajes muy rápidos (${fastMessages} <2s)`);
      score += 0.3;
    }
  }

  // 5. Verificar rate de mensajes (spike detection)
  const messagesLastMinute = recentMessages.filter(
    (msg) => msg.createdAt.getTime() > Date.now() - 60 * 1000
  ).length;

  if (messagesLastMinute > THRESHOLDS.MAX_MESSAGES_PER_MINUTE) {
    reasons.push(
      `Demasiados mensajes en 1 minuto (${messagesLastMinute}/${THRESHOLDS.MAX_MESSAGES_PER_MINUTE})`
    );
    score += 0.3;
  }

  // 6. Detectar patrones de texto predecibles
  const predictablePatterns = [
    /^(hi|hello|hey)\s*$/i,
    /^\.+$/,
    /^(.)\1{10,}$/, // Caracteres repetidos (aaaaaaaaaa)
    /^(test|testing|test123)$/i,
  ];

  for (const pattern of predictablePatterns) {
    if (pattern.test(message)) {
      reasons.push("Patrón de texto predecible detectado");
      score += 0.2;
      break;
    }
  }

  // 7. Verificar si el mensaje tiene contenido emocional real
  const emotionalWords = [
    "love",
    "hate",
    "happy",
    "sad",
    "angry",
    "excited",
    "worried",
    "grateful",
    "afraid",
    "curious",
    // Español
    "amor",
    "odio",
    "feliz",
    "triste",
    "enojado",
    "emocionado",
    "preocupado",
    "agradecido",
    "miedo",
    "curioso",
  ];

  const hasEmotionalContent = emotionalWords.some((word) =>
    message.toLowerCase().includes(word)
  );

  // Mensajes largos sin emoción real son sospechosos
  if (message.length > 50 && !hasEmotionalContent && score > 0) {
    score += 0.1;
  }

  // Normalizar score a 0-1
  score = Math.min(score, 1);

  return {
    suspicious: score >= THRESHOLDS.SUSPICIOUS_SCORE_THRESHOLD,
    score,
    reasons,
  };
}

/**
 * Calcula "genuineness score" de un usuario (0-1, donde 1 = muy genuino)
 */
export async function calculateGenuinenessScore(
  userId: string,
  agentId: string
): Promise<number> {
  // Obtener últimos 50 mensajes
  const messages = await prisma.message.findMany({
    where: {
      userId,
      agentId,
      role: "user",
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      content: true,
      createdAt: true,
    },
  });

  if (messages.length < 10) {
    return 0.5; // No hay suficientes datos
  }

  let genuinenessScore = 1.0;

  // Factor 1: Variedad de mensajes (evitar copy-paste)
  const uniqueMessages = new Set(messages.map((m) => m.content.toLowerCase()));
  const varietyRatio = uniqueMessages.size / messages.length;
  genuinenessScore *= 0.3 + varietyRatio * 0.7; // Penalizar baja variedad

  // Factor 2: Longitud promedio (mensajes muy cortos consistentemente = spam)
  const avgLength =
    messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  if (avgLength < 20) {
    genuinenessScore *= 0.7;
  } else if (avgLength > 100) {
    genuinenessScore *= 1.1; // Bonus por mensajes más desarrollados
  }

  // Factor 3: Varianza de timing (humanos son inconsistentes)
  if (messages.length >= 10) {
    const timeDiffs = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const diff =
        messages[i].createdAt.getTime() - messages[i + 1].createdAt.getTime();
      timeDiffs.push(diff);
    }

    const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
    const variance =
      timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) /
      timeDiffs.length;
    const stdDev = Math.sqrt(variance);

    // Alta varianza = más humano
    if (stdDev > 10000) {
      // >10s de variación
      genuinenessScore *= 1.1;
    } else if (stdDev < 1000) {
      // <1s de variación = robótico
      genuinenessScore *= 0.6;
    }
  }

  // Factor 4: Presencia de emociones y preguntas
  const emotionalMessages = messages.filter((m) =>
    /\b(feel|felt|think|believe|love|hate|happy|sad|worry|afraid|excited)\b/i.test(
      m.content
    )
  ).length;

  const questionsCount = messages.filter((m) => m.content.includes("?")).length;

  genuinenessScore *= 0.8 + (emotionalMessages / messages.length) * 0.2;
  genuinenessScore *= 0.9 + (questionsCount / messages.length) * 0.1;

  return Math.min(Math.max(genuinenessScore, 0), 1);
}

/**
 * Detecta farming de múltiples cuentas (misma persona, múltiples usuarios)
 */
export async function detectMultiAccounting(
  userId: string
): Promise<{ suspicious: boolean; relatedAccounts: string[]; confidence: number }> {
  // Obtener fingerprint data del usuario (si existe)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { metadata: true, createdAt: true },
  });

  if (!user?.metadata) {
    return { suspicious: false, relatedAccounts: [], confidence: 0 };
  }

  const metadata = user.metadata as any;
  const fingerprint = metadata.fingerprint;

  if (!fingerprint) {
    return { suspicious: false, relatedAccounts: [], confidence: 0 };
  }

  // Buscar otros usuarios con fingerprints similares
  // Esto requeriría implementar fingerprinting del lado del cliente
  // Por ahora, placeholder

  // En producción, buscarías por:
  // - IP addresses compartidas
  // - Device fingerprints similares
  // - Patrones de uso idénticos
  // - Browser/OS identical

  return { suspicious: false, relatedAccounts: [], confidence: 0 };
}

/**
 * Flag usuario para review manual
 */
export async function flagUserForReview(
  userId: string,
  reason: string,
  evidence: any
) {
  // Crear registro en tabla de moderación
  console.log(`[AntiGaming] Flagging user ${userId} for review: ${reason}`);

  // En producción, crear entry en ModerationAction
  await prisma.moderationAction.create({
    data: {
      moderatorId: "system", // Sistema automático
      targetType: "user",
      targetId: userId,
      action: "flag_suspicious",
      reason,
      metadata: evidence,
    },
  });
}

/**
 * Penalización progresiva por comportamiento sospechoso
 */
export async function applyGamingPenalty(
  userId: string,
  severity: "low" | "medium" | "high"
) {
  const penalties = {
    low: {
      cooldownHours: 1,
      affinityPenalty: 0.95, // -5% en siguiente cálculo
      message: "Comportamiento sospechoso detectado. Cooldown de 1 hora.",
    },
    medium: {
      cooldownHours: 24,
      affinityPenalty: 0.8, // -20%
      message: "Patrón de gaming detectado. Cooldown de 24 horas.",
    },
    high: {
      cooldownHours: 168, // 7 días
      affinityPenalty: 0.5, // -50%
      message:
        "Comportamiento de bot detectado. Cuenta bajo revisión por 7 días.",
    },
  };

  const penalty = penalties[severity];

  // Actualizar metadata del usuario con penalización
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { metadata: true },
  });

  const metadata = (user?.metadata as any) || {};
  metadata.gamingPenalty = {
    appliedAt: new Date().toISOString(),
    severity,
    expiresAt: new Date(
      Date.now() + penalty.cooldownHours * 60 * 60 * 1000
    ).toISOString(),
    affinityMultiplier: penalty.affinityPenalty,
  };

  await prisma.user.update({
    where: { id: userId },
    data: { metadata },
  });

  console.log(`[AntiGaming] Applied ${severity} penalty to user ${userId}`);

  return penalty;
}

/**
 * Verificar si usuario tiene penalización activa
 */
export async function checkActivePenalty(userId: string): Promise<{
  hasPenalty: boolean;
  severity?: string;
  expiresAt?: string;
  affinityMultiplier?: number;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { metadata: true },
  });

  const metadata = (user?.metadata as any) || {};
  const penalty = metadata.gamingPenalty;

  if (!penalty) {
    return { hasPenalty: false };
  }

  const expiresAt = new Date(penalty.expiresAt);
  if (expiresAt < new Date()) {
    // Penalización expiró
    return { hasPenalty: false };
  }

  return {
    hasPenalty: true,
    severity: penalty.severity,
    expiresAt: penalty.expiresAt,
    affinityMultiplier: penalty.affinityMultiplier,
  };
}

export default {
  analyzeMessageForGaming,
  calculateGenuinenessScore,
  detectMultiAccounting,
  flagUserForReview,
  applyGamingPenalty,
  checkActivePenalty,
};
