/**
 * Socket.IO Server Configuration
 * Handles real-time WebSocket connections with authentication and room management
 */

import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  getRoomName,
  TYPING_TIMEOUT,
} from "./events";
import { registerChatEvents, registerReactionEvents } from "./chat-events";
import { prisma } from "@/lib/prisma";
import { getLLMProvider } from "@/lib/llm/provider";
import { EmotionalEngine } from "@/lib/relations/engine";
import { canUseResource, trackUsage } from "@/lib/usage/tracker";
import { checkRateLimit } from "@/lib/redis/ratelimit";
import { createMemoryManager } from "@/lib/memory/manager";
import { warmupQwenModel } from "@/lib/memory/qwen-embeddings";

type SocketServer = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
type AuthenticatedSocket = Socket<ClientToServerEvents, ServerToClientEvents> & {
  userId?: string;
};

let io: SocketServer | null = null;

// Store typing timeouts
const typingTimeouts = new Map<string, NodeJS.Timeout>();

/**
 * Initialize Socket.IO server
 */
/**
 * Lista de orígenes permitidos para CORS en WebSockets
 * Debe coincidir con la configuración del middleware
 */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'https://creador-inteligencias.vercel.app',
  process.env.NEXTAUTH_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

/**
 * Validar origen para CORS de Socket.IO
 * Implementa validación estricta, no usa wildcards
 */
function validateSocketOrigin(origin: string, callback: (err: Error | null, success?: boolean) => void) {
  // Desarrollo: permitir localhost y 127.0.0.1 con cualquier puerto
  if (process.env.NODE_ENV === 'development') {
    const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
    if (localhostPattern.test(origin)) {
      return callback(null, true);
    }
  }

  // Producción: validación exacta contra whitelist
  if (ALLOWED_ORIGINS.includes(origin)) {
    return callback(null, true);
  }

  // Origen no permitido
  console.warn('[SocketServer] CORS: Origin not allowed:', origin);
  callback(new Error('Not allowed by CORS'));
}

export function initSocketServer(httpServer: HTTPServer): SocketServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: validateSocketOrigin,
      credentials: true,
    },
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // WARMUP: Pre-calentar modelo de embeddings
  // Esto evita cold start en la primera búsqueda del usuario
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  warmupQwenModel().catch(error => {
    console.warn('[SocketServer] Failed to warmup Qwen model:', error.message);
    console.warn('[SocketServer] Embeddings funcionará en modo degradado (solo keywords)');
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      // Validate token - check if it's an API key
      const user = await prisma.user.findUnique({
        where: { apiKey: token },
        select: { id: true, plan: true },
      });

      if (!user) {
        return next(new Error("Invalid authentication token"));
      }

      // Check rate limit
      const rateLimitResult = await checkRateLimit(
        `socket:${user.id}`,
        user.plan || "free"
      );

      if (!rateLimitResult.success) {
        return next(new Error("Rate limit exceeded"));
      }

      socket.userId = user.id;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Connection handler
  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`[Socket] User connected: ${userId}`);

    // Join user's personal room
    socket.join(getRoomName.user(userId));

    // Emit connection confirmation
    socket.emit("system:connection", {
      connected: true,
      timestamp: Date.now(),
    });

    // Socket server is guaranteed to be initialized at this point
    const socketServer = io!;

    // Register multimodal chat events
    registerChatEvents(socketServer, socket);

    // Register reaction events
    registerReactionEvents(socketServer, socket);

    // Handle presence online
    handlePresenceOnline(socket, userId);

    // Chat: Join agent room
    socket.on("chat:join", async (data) => {
      try {
        const agent = await prisma.agent.findFirst({
          where: { id: data.agentId, userId },
        });

        if (!agent) {
          socket.emit("chat:error", {
            code: "AGENT_NOT_FOUND",
            message: "Agent not found",
            timestamp: Date.now(),
          });
          return;
        }

        const roomName = getRoomName.chat(data.agentId, userId);
        socket.join(roomName);

        console.log(`[Socket] User ${userId} joined chat ${roomName}`);
      } catch (error) {
        console.error("[Socket] Error joining chat:", error);
        socket.emit("chat:error", {
          code: "JOIN_ERROR",
          message: "Failed to join chat",
          timestamp: Date.now(),
        });
      }
    });

    // Chat: Leave agent room
    socket.on("chat:leave", (data) => {
      const roomName = getRoomName.chat(data.agentId, userId);
      socket.leave(roomName);
      console.log(`[Socket] User ${userId} left chat ${roomName}`);
    });

    // Chat: Send message with streaming
    socket.on("chat:message", async (data) => {
      try {
        await handleChatMessage(socket, io!, data);
      } catch (error) {
        console.error("[Socket] Error handling message:", error);
        socket.emit("chat:error", {
          code: "MESSAGE_ERROR",
          message: "Failed to process message",
          timestamp: Date.now(),
        });
      }
    });

    // Chat: Typing indicator
    socket.on("chat:typing", (data) => {
      handleTypingIndicator(io!, data);
    });

    // Agent: Subscribe to updates
    socket.on("agent:subscribe", async (data) => {
      try {
        const agent = await prisma.agent.findFirst({
          where: { id: data.agentId, userId },
        });

        if (agent) {
          socket.join(getRoomName.agent(data.agentId));
        }
      } catch (error) {
        console.error("[Socket] Error subscribing to agent:", error);
      }
    });

    // Agent: Unsubscribe from updates
    socket.on("agent:unsubscribe", (data) => {
      socket.leave(getRoomName.agent(data.agentId));
    });

    // Presence: Manual online
    socket.on("presence:online", (data) => {
      handlePresenceOnline(socket, data.userId);
    });

    // Presence: Manual offline
    socket.on("presence:offline", (data) => {
      handlePresenceOffline(io!, data.userId);
    });

    // Disconnect handler
    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${userId}`);
      handlePresenceOffline(io!, userId);
    });
  });

  console.log("[Socket] Socket.IO server initialized");
  return io;
}

/**
 * Handle chat message with streaming response
 */
async function handleChatMessage(
  socket: AuthenticatedSocket,
  io: SocketServer,
  data: { agentId: string; message: string; userId: string }
) {
  const { agentId, message, userId } = data;

  // Check message quota
  const quotaCheck = await canUseResource(userId, "message");
  if (!quotaCheck.allowed) {
    socket.emit("chat:error", {
      code: "QUOTA_EXCEEDED",
      message: quotaCheck.reason || "Message quota exceeded",
      details: { current: quotaCheck.current, limit: quotaCheck.limit },
      timestamp: Date.now(),
    });
    return;
  }

  // Get agent
  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId },
  });

  if (!agent) {
    socket.emit("chat:error", {
      code: "AGENT_NOT_FOUND",
      message: "Agent not found",
      timestamp: Date.now(),
    });
    return;
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      agentId,
      userId,
      role: "user",
      content: message,
    },
  });

  // Emit user message to room
  const roomName = getRoomName.chat(agentId, userId);
  io.to(roomName).emit("chat:message", {
    id: userMessage.id,
    agentId,
    userId,
    role: "user",
    content: message,
    timestamp: Date.now(),
  });

  // Get or create relation
  let relation = await prisma.relation.findFirst({
    where: {
      subjectId: agentId,
      targetId: userId,
      targetType: "user",
    },
  });

  if (!relation) {
    relation = await prisma.relation.create({
      data: {
        subjectId: agentId,
        targetId: userId,
        targetType: "user",
        trust: 0.5,
        affinity: 0.5,
        respect: 0.5,
        privateState: { love: 0, curiosity: 0 },
        visibleState: { trust: 0.5, affinity: 0.5, respect: 0.5 },
      },
    });
  }

  // Analyze emotion
  const currentState = {
    valence: 0.5,
    arousal: 0.5,
    dominance: 0.5,
    trust: relation.trust,
    affinity: relation.affinity,
    respect: relation.respect,
    love: (relation.privateState as { love?: number }).love || 0,
    curiosity: (relation.privateState as { curiosity?: number }).curiosity || 0,
  };

  const newState = EmotionalEngine.analyzeMessage(message, currentState);

  // Update relation
  await prisma.relation.update({
    where: { id: relation.id },
    data: {
      trust: newState.trust,
      affinity: newState.affinity,
      respect: newState.respect,
      privateState: { love: newState.love, curiosity: newState.curiosity },
      visibleState: {
        trust: newState.trust,
        affinity: newState.affinity,
        respect: newState.respect,
      },
    },
  });

  // Emit relation update
  io.to(roomName).emit("relation:updated", {
    agentId,
    userId,
    state: {
      trust: newState.trust,
      affinity: newState.affinity,
      respect: newState.respect,
    },
    relationLevel: EmotionalEngine.getRelationshipLevel(newState),
    emotions: EmotionalEngine.getVisibleEmotions(newState),
    timestamp: Date.now(),
  });

  // Get recent messages for context
  const recentMessages = await prisma.message.findMany({
    where: { agentId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Create memory manager for RAG
  const memoryManager = createMemoryManager(agentId, userId);

  // Adjust prompt based on emotional state
  const emotionalPrompt = EmotionalEngine.adjustPromptForEmotion(
    agent.systemPrompt,
    newState
  );

  // Build enhanced prompt with RAG context
  const adjustedPrompt = await memoryManager.buildEnhancedPrompt(
    emotionalPrompt,
    message
  );

  // Start typing indicator
  io.to(roomName).emit("chat:typing", {
    agentId,
    isTyping: true,
    timestamp: Date.now(),
  });

  // Generate response with streaming
  const llm = getLLMProvider();
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  let fullResponse = "";
  let chunkIndex = 0;

  try {
    // For streaming, we'd use the LLM's streaming API
    // For now, simulate streaming by chunking the response
    const response = await llm.generate({
      systemPrompt: adjustedPrompt,
      messages: recentMessages.reverse().map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // Simulate streaming by splitting response into chunks
    const words = response.split(" ");
    const chunkSize = 3;

    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(" ") + " ";
      fullResponse += chunk;

      io.to(roomName).emit("chat:message:stream", {
        agentId,
        messageId,
        chunk,
        index: chunkIndex++,
        timestamp: Date.now(),
      });

      // Small delay to simulate streaming
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    fullResponse = fullResponse.trim();

    // Stop typing indicator
    io.to(roomName).emit("chat:typing", {
      agentId,
      isTyping: false,
      timestamp: Date.now(),
    });

    const estimatedTokens = Math.ceil((message.length + fullResponse.length) / 4);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        agentId,
        role: "assistant",
        content: fullResponse,
        metadata: {
          emotions: EmotionalEngine.getVisibleEmotions(newState),
          relationLevel: EmotionalEngine.getRelationshipLevel(newState),
          tokensUsed: estimatedTokens,
        },
      },
    });

    // Emit completion
    io.to(roomName).emit("chat:message:complete", {
      agentId,
      messageId: assistantMessage.id,
      fullContent: fullResponse,
      timestamp: Date.now(),
      metadata: {
        emotions: EmotionalEngine.getVisibleEmotions(newState),
        relationLevel: EmotionalEngine.getRelationshipLevel(newState),
        tokensUsed: estimatedTokens,
        state: {
          trust: newState.trust,
          affinity: newState.affinity,
          respect: newState.respect,
        },
      },
    });

    // Track usage and store memories
    await Promise.all([
      trackUsage(userId, "message", 1, agentId, {
        agentName: agent.name,
        contentLength: message.length,
        responseLength: fullResponse.length,
      }),
      trackUsage(userId, "tokens", estimatedTokens, agentId, {
        model: "gemini",
        agentId,
      }),
      // Store user message in memory
      memoryManager.storeMessage(message, "user", {
        messageId: assistantMessage.id,
      }),
      // Store assistant response in memory
      memoryManager.storeMessage(fullResponse, "assistant", {
        messageId: assistantMessage.id,
        emotions: EmotionalEngine.getVisibleEmotions(newState),
        relationLevel: EmotionalEngine.getRelationshipLevel(newState),
      }),
    ]);
  } catch (error) {
    console.error("[Socket] Error generating response:", error);
    io.to(roomName).emit("chat:error", {
      code: "GENERATION_ERROR",
      message: "Failed to generate response",
      timestamp: Date.now(),
    });

    // Stop typing indicator
    io.to(roomName).emit("chat:typing", {
      agentId,
      isTyping: false,
      timestamp: Date.now(),
    });
  }
}

/**
 * Handle typing indicator with timeout
 */
function handleTypingIndicator(
  io: SocketServer,
  data: { agentId: string; userId: string; isTyping: boolean }
) {
  const { agentId, userId, isTyping } = data;
  const roomName = getRoomName.chat(agentId, userId);
  const timeoutKey = `${agentId}:${userId}`;

  // Clear existing timeout
  const existingTimeout = typingTimeouts.get(timeoutKey);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // Emit typing event
  io.to(roomName).emit("chat:typing", {
    agentId,
    userId,
    isTyping,
    timestamp: Date.now(),
  });

  // Set timeout to auto-stop typing
  if (isTyping) {
    const timeout = setTimeout(() => {
      io.to(roomName).emit("chat:typing", {
        agentId,
        userId,
        isTyping: false,
        timestamp: Date.now(),
      });
      typingTimeouts.delete(timeoutKey);
    }, TYPING_TIMEOUT) as unknown as NodeJS.Timeout;

    typingTimeouts.set(timeoutKey, timeout);
  }
}

/**
 * Handle user going online
 */
function handlePresenceOnline(socket: AuthenticatedSocket, userId: string) {
  socket.to(getRoomName.global()).emit("presence:user:online", {
    userId,
    timestamp: Date.now(),
  });
}

/**
 * Handle user going offline
 */
function handlePresenceOffline(io: SocketServer, userId: string) {
  io.to(getRoomName.global()).emit("presence:user:offline", {
    userId,
    timestamp: Date.now(),
  });
}

/**
 * Get Socket.IO instance
 */
export function getSocketServer(): SocketServer | null {
  return io;
}

/**
 * Emit agent update to all subscribers
 */
export async function emitAgentUpdate(agentId: string, updates: Record<string, unknown>) {
  if (!io) return;

  io.to(getRoomName.agent(agentId)).emit("agent:updated", {
    agentId,
    updates,
    timestamp: Date.now(),
  });
}

/**
 * Emit agent deletion to all subscribers
 */
export async function emitAgentDeleted(agentId: string) {
  if (!io) return;

  io.to(getRoomName.agent(agentId)).emit("agent:deleted", {
    agentId,
  });
}

/**
 * Send system notification to user
 */
export async function sendSystemNotification(
  userId: string,
  notification: {
    type: "info" | "warning" | "error" | "success";
    title: string;
    message: string;
    action?: { label: string; url: string };
  }
) {
  if (!io) return;

  io.to(getRoomName.user(userId)).emit("system:notification", {
    ...notification,
    timestamp: Date.now(),
  });
}
