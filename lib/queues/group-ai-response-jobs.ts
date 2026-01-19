/**
 * BullMQ Jobs for Group AI Responses
 *
 * Procesa respuestas de IAs en grupos de forma asíncrona:
 * - FLUSH_BUFFER: Procesar buffer de mensajes y decidir qué IAs responderán
 * - GENERATE_RESPONSE: Generar respuesta de una IA específica
 */

import { Queue, QueueEvents } from "bullmq";
import type { BufferedMessage } from "@/lib/groups/group-message-buffer.service";

// Check if Redis is configured for BullMQ
const isRedisConfigured = !!(
  process.env.REDIS_URL ||
  (process.env.REDIS_HOST && process.env.REDIS_PORT)
);

// Connection config para BullMQ
const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
};

// ============================================================================
// QUEUE DEFINITIONS
// ============================================================================

export const groupAIResponseQueue = isRedisConfigured
  ? new Queue("group-ai-responses", { connection })
  : null;

export const GroupAIJobTypes = {
  FLUSH_BUFFER: "flush-buffer",
  GENERATE_RESPONSE: "generate-response",
} as const;

// ============================================================================
// JOB DATA INTERFACES
// ============================================================================

export interface FlushBufferJobData {
  groupId: string;
}

export interface GenerateResponseJobData {
  groupId: string;
  agentId: string;
  agentName: string;
  triggeredByUserId: string;
  triggeredByUserName: string;
  bufferedMessages: BufferedMessage[];
  dispositionScore: number;
  responseIndex: number; // 0 = primera IA, 1 = segunda, etc.

  // Director Conversacional
  sceneDirective?: {
    sceneCode: string;
    role: string; // "PROTAGONISTA", "ANTAGONISTA", etc.
    directive: string; // Instrucción específica
    targetAgents?: string[]; // IDs de agentes a los que debe dirigirse
    emotionalTone?: string; // Tono emocional esperado
    maxLength?: number; // Longitud sugerida
  };
}

// ============================================================================
// JOB SCHEDULERS
// ============================================================================

/**
 * Encolar flush de buffer de mensajes
 *
 * @param groupId - ID del grupo
 * @param delayMs - Delay antes de ejecutar (para acumular mensajes)
 */
export async function enqueueBufferFlush(
  groupId: string,
  delayMs: number
): Promise<void> {
  if (!groupAIResponseQueue) {
    console.warn("[GroupAIJobs] Redis not configured, skipping buffer flush job");
    // Fallback: ejecutar directamente
    const { handleBufferFlush } = await import("./group-ai-response-worker");
    setTimeout(() => handleBufferFlush({ groupId }), delayMs);
    return;
  }

  // Usar jobId único para evitar duplicados
  const jobId = `flush:${groupId}`;

  // Verificar si ya existe un job pendiente para este grupo
  const existingJob = await groupAIResponseQueue.getJob(jobId);
  if (existingJob) {
    const state = await existingJob.getState();
    if (state === "waiting" || state === "delayed") {
      // Ya hay un flush pendiente, no crear otro
      console.log(`[GroupAIJobs] Flush already pending for group ${groupId}`);
      return;
    }
  }

  await groupAIResponseQueue.add(
    GroupAIJobTypes.FLUSH_BUFFER,
    { groupId } as FlushBufferJobData,
    {
      jobId,
      delay: delayMs,
      removeOnComplete: true,
      removeOnFail: 5, // Mantener últimos 5 jobs fallidos
    }
  );

  console.log(`[GroupAIJobs] Buffer flush scheduled for group ${groupId} in ${delayMs}ms`);
}

/**
 * Encolar generación de respuesta de una IA
 */
export async function enqueueAIResponse(
  data: GenerateResponseJobData
): Promise<void> {
  if (!groupAIResponseQueue) {
    console.warn("[GroupAIJobs] Redis not configured, skipping AI response job");
    // Fallback: ejecutar directamente con delay
    const { handleGenerateResponse } = await import("./group-ai-response-worker");
    setTimeout(() => handleGenerateResponse(data), data.responseIndex * 2500);
    return;
  }

  // Calcular delay basado en el índice de respuesta
  // Primera IA responde inmediatamente, siguientes con delay
  const baseDelay = data.responseIndex * 2000;
  const jitter = Math.random() * 1500;
  const delay = baseDelay + jitter;

  await groupAIResponseQueue.add(
    GroupAIJobTypes.GENERATE_RESPONSE,
    data,
    {
      delay: Math.round(delay),
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: 10,
    }
  );

  console.log(
    `[GroupAIJobs] AI response scheduled for ${data.agentName} (${data.agentId}) in group ${data.groupId}, delay: ${Math.round(delay)}ms`
  );
}

/**
 * Cancelar jobs pendientes para un grupo
 * Útil cuando el grupo se desactiva o hay un error
 */
export async function cancelGroupJobs(groupId: string): Promise<void> {
  if (!groupAIResponseQueue) return;

  // Cancelar flush pendiente
  const flushJob = await groupAIResponseQueue.getJob(`flush:${groupId}`);
  if (flushJob) {
    await flushJob.remove();
  }

  // Nota: Los jobs de respuesta individual no tienen jobId predecible,
  // por lo que no podemos cancelarlos fácilmente.
  // En producción, podríamos usar un patrón con prefijos y SCAN.
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

const queueEvents = isRedisConfigured
  ? new QueueEvents("group-ai-responses", { connection })
  : null;

if (queueEvents) {
  queueEvents.on("completed", ({ jobId, returnvalue }) => {
    console.log(`[GroupAIQueue] Job ${jobId} completed`);
  });

  queueEvents.on("failed", ({ jobId, failedReason }) => {
    console.error(`[GroupAIQueue] Job ${jobId} failed:`, failedReason);
  });

  queueEvents.on("stalled", ({ jobId }) => {
    console.warn(`[GroupAIQueue] Job ${jobId} stalled`);
  });
}

// ============================================================================
// CLEANUP
// ============================================================================

export async function closeGroupAIJobs(): Promise<void> {
  if (queueEvents) {
    await queueEvents.close();
  }
  if (groupAIResponseQueue) {
    await groupAIResponseQueue.close();
  }
  console.log("[GroupAIJobs] Queue closed");
}

// Log warning if Redis is not configured
if (!isRedisConfigured) {
  console.warn("[GroupAIJobs] ⚠️  Redis not configured - using in-memory fallback");
}
