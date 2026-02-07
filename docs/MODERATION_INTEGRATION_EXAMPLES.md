# OUTPUT MODERATION - INTEGRATION EXAMPLES

Complete guide with practical examples for integrating the output moderation system.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [API Route Integration](#api-route-integration)
3. [Frontend Integration](#frontend-integration)
4. [WebSocket Integration](#websocket-integration)
5. [Complete Chat Flow Example](#complete-chat-flow-example)
6. [Error Handling](#error-handling)
7. [Testing Examples](#testing-examples)

---

## Basic Usage

### Simple Moderation Check

```typescript
import { outputModerator } from "@/lib/moderation/output-moderator";
import type { ModerationContext } from "@/lib/moderation/output-moderator";

// Get user context from session/database
const context: ModerationContext = {
  userId: user.id,
  isAdult: user.isAdult,
  hasNSFWConsent: user.nsfwConsent,
  agentNSFWMode: agent.nsfwMode,
};

// Moderate AI response before showing to user
const aiResponse = "Generated content from AI...";
const result = await outputModerator.moderate(aiResponse, context);

if (!result.allowed) {
  // Content blocked
  console.error(`Content blocked: ${result.reason}`);
  return {
    error: result.reason,
    category: result.blockedCategory,
  };
}

if (result.requiresConfirmation) {
  // Content requires user confirmation (TIER 2: WARNING)
  return {
    warning: true,
    message: result.confirmationMessage,
    content: aiResponse, // Show after confirmation
  };
}

// Content allowed - show to user
return {
  content: aiResponse,
};
```

---

## API Route Integration

### Chat Message API with Moderation

**File**: `app/api/agents/[id]/message/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { outputModerator } from "@/lib/moderation/output-moderator";
import { ModerationTier } from "@/lib/moderation/content-rules";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: agentId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user and agent data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      isAdult: true,
      nsfwConsent: true,
    },
  });

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      nsfwMode: true,
      systemPrompt: true,
      // ... other fields
    },
  });

  if (!user || !agent) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { message } = await req.json();

  // Generate AI response (simplified)
  const aiResponse = await generateAIResponse(agent, message);

  // MODERATION: Check AI output before sending to user
  const moderationResult = await outputModerator.moderate(aiResponse, {
    userId: user.id,
    isAdult: user.isAdult,
    hasNSFWConsent: user.nsfwConsent,
    agentNSFWMode: agent.nsfwMode,
  });

  // Handle blocked content
  if (!moderationResult.allowed) {
    console.error(
      `[MODERATION] Blocked content for user ${user.id}:`,
      moderationResult.blockedCategory
    );

    // Return user-friendly error
    return NextResponse.json(
      {
        error: "content_blocked",
        message:
          moderationResult.reason ||
          "Este contenido no puede ser mostrado debido a restricciones de contenido.",
        category: moderationResult.blockedCategory,
        tier: moderationResult.tier,
      },
      { status: 403 }
    );
  }

  // Handle warning content (requires user confirmation)
  if (moderationResult.requiresConfirmation) {
    return NextResponse.json({
      warning: true,
      confirmationRequired: true,
      confirmationMessage: moderationResult.confirmationMessage,
      content: aiResponse, // Send content but require confirmation
      tier: ModerationTier.WARNING,
    });
  }

  // Content allowed - return normally
  return NextResponse.json({
    response: aiResponse,
    tier: ModerationTier.ALLOWED,
  });
}
```

---

## Frontend Integration

### Chat Component with Moderation Handling

**File**: `components/chat/ChatWithModeration.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  warning?: boolean;
  confirmationMessage?: string;
}

export function ChatWithModeration({ agentId }: { agentId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<ChatMessage | null>(
    null
  );
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string) => {
    setError(null);

    // Add user message
    const userMessage: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      // Handle blocked content
      if (response.status === 403 || data.error === "content_blocked") {
        setError(
          data.message || "Este contenido está bloqueado por seguridad."
        );
        return;
      }

      // Handle warning content (requires confirmation)
      if (data.warning && data.confirmationRequired) {
        const warningMessage: ChatMessage = {
          role: "assistant",
          content: data.content,
          warning: true,
          confirmationMessage: data.confirmationMessage,
        };
        setPendingMessage(warningMessage);
        setShowWarningDialog(true);
        return;
      }

      // Normal response
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Error al enviar el mensaje. Por favor, intenta nuevamente.");
    }
  };

  const handleWarningAccept = () => {
    if (pendingMessage) {
      setMessages((prev) => [...prev, pendingMessage]);
    }
    setPendingMessage(null);
    setShowWarningDialog(false);
  };

  const handleWarningDecline = () => {
    setPendingMessage(null);
    setShowWarningDialog(false);
    // Optionally add a system message
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Entiendo. Cambiemos de tema a algo más ligero. ¿De qué te gustaría hablar?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-red-500">Contenido Bloqueado</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500/10 ml-auto max-w-[80%]"
                : "bg-muted mr-auto max-w-[80%]"
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              sendMessage(input.trim());
              setInput("");
            }
          }}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-lg border"
        />
        <Button
          onClick={() => {
            if (input.trim()) {
              sendMessage(input.trim());
              setInput("");
            }
          }}
        >
          Enviar
        </Button>
      </div>

      {/* Warning Confirmation Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <DialogTitle>Contenido Sensible</DialogTitle>
            </div>
            <DialogDescription className="pt-4">
              {pendingMessage?.confirmationMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 my-4">
            <p className="text-sm text-muted-foreground">
              Este contenido es ficción para entretenimiento entre adultos. Si
              necesitas ayuda real, contacta:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• 988 Suicide & Crisis Lifeline</li>
              <li>• Crisis Text Line: Text HOME to 741741</li>
            </ul>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleWarningDecline}>
              No, cambiar de tema
            </Button>
            <Button onClick={handleWarningAccept}>Sí, continuar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

---

## WebSocket Integration

### Real-time Chat with Moderation

**File**: `lib/socket/moderated-chat.ts`

```typescript
import { Server as SocketIOServer } from "socket.io";
import { outputModerator } from "@/lib/moderation/output-moderator";
import { prisma } from "@/lib/prisma";

export function setupModeratedChat(io: SocketIOServer) {
  io.on("connection", (socket) => {
    console.log(`[SOCKET] User connected: ${socket.id}`);

    socket.on("send_message", async (data) => {
      const { agentId, message, userId } = data;

      try {
        // Get user and agent context
        const [user, agent] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, isAdult: true, nsfwConsent: true },
          }),
          prisma.agent.findUnique({
            where: { id: agentId },
            select: { id: true, nsfwMode: true },
          }),
        ]);

        if (!user || !agent) {
          socket.emit("error", { message: "User or agent not found" });
          return;
        }

        // Generate AI response
        const aiResponse = await generateAIResponse(agent, message);

        // MODERATION
        const moderationResult = await outputModerator.moderate(aiResponse, {
          userId: user.id,
          isAdult: user.isAdult,
          hasNSFWConsent: user.nsfwConsent,
          agentNSFWMode: agent.nsfwMode,
        });

        // Handle blocked content
        if (!moderationResult.allowed) {
          socket.emit("message_blocked", {
            reason: moderationResult.reason,
            category: moderationResult.blockedCategory,
            tier: moderationResult.tier,
          });
          return;
        }

        // Handle warning content
        if (moderationResult.requiresConfirmation) {
          socket.emit("message_warning", {
            content: aiResponse,
            confirmationMessage: moderationResult.confirmationMessage,
            tier: moderationResult.tier,
          });
          return;
        }

        // Send allowed content
        socket.emit("message_received", {
          content: aiResponse,
          tier: moderationResult.tier,
        });
      } catch (error) {
        console.error("[SOCKET] Error in moderated chat:", error);
        socket.emit("error", { message: "Error processing message" });
      }
    });

    socket.on("confirm_warning", async (data) => {
      const { content, accepted } = data;

      if (accepted) {
        socket.emit("message_confirmed", { content });
      } else {
        socket.emit("warning_declined");
      }
    });
  });
}
```

---

## Complete Chat Flow Example

### End-to-End Chat with Full Moderation

```typescript
// 1. User sends message
const userMessage = "Tell me about your darkest desires...";

// 2. Backend receives and processes
async function handleUserMessage(
  userId: string,
  agentId: string,
  message: string
) {
  // Get context
  const [user, agent] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isAdult: true,
        nsfwConsent: true,
        plan: true,
      },
    }),
    prisma.agent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        nsfwMode: true,
        systemPrompt: true,
      },
    }),
  ]);

  if (!user || !agent) {
    throw new Error("User or agent not found");
  }

  // 3. Generate AI response
  const aiResponse = await callLLMProvider({
    systemPrompt: agent.systemPrompt,
    userMessage: message,
    nsfwMode: agent.nsfwMode,
  });

  // 4. MODERATE OUTPUT
  const moderationResult = await outputModerator.moderate(aiResponse, {
    userId: user.id,
    isAdult: user.isAdult,
    hasNSFWConsent: user.nsfwConsent,
    agentNSFWMode: agent.nsfwMode,
  });

  // 5. Handle moderation results
  if (!moderationResult.allowed) {
    // TIER 1: BLOCKED
    console.error(
      `[MODERATION BLOCKED] User: ${userId}, Category: ${moderationResult.blockedCategory}`
    );

    // Save blocked attempt for audit
    await prisma.moderationLog.create({
      data: {
        userId: user.id,
        agentId: agent.id,
        tier: moderationResult.tier,
        blocked: true,
        category: moderationResult.blockedCategory,
        reason: moderationResult.reason,
      },
    });

    throw new ModerationError(
      moderationResult.reason || "Content blocked",
      moderationResult.tier
    );
  }

  if (moderationResult.requiresConfirmation) {
    // TIER 2: WARNING
    console.warn(
      `[MODERATION WARNING] User: ${userId}, Requires confirmation`
    );

    return {
      type: "warning",
      content: aiResponse,
      confirmationMessage: moderationResult.confirmationMessage,
      tier: moderationResult.tier,
    };
  }

  // TIER 3: ALLOWED
  // 6. Save message to database
  const savedMessage = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "assistant",
      content: aiResponse,
      moderationTier: moderationResult.tier,
    },
  });

  return {
    type: "allowed",
    content: aiResponse,
    messageId: savedMessage.id,
    tier: moderationResult.tier,
  };
}

// 7. Custom error for moderation
class ModerationError extends Error {
  constructor(
    message: string,
    public tier: ModerationTier
  ) {
    super(message);
    this.name = "ModerationError";
  }
}
```

---

## Error Handling

### Comprehensive Error Handling

```typescript
import { ModerationTier } from "@/lib/moderation/content-rules";

export async function handleModeratedChat(
  userId: string,
  agentId: string,
  message: string
) {
  try {
    // Get context
    const context = await getModerationContext(userId, agentId);

    // Generate response
    const aiResponse = await generateResponse(agentId, message);

    // Moderate
    const result = await outputModerator.moderate(aiResponse, context);

    // Handle results
    if (!result.allowed) {
      return handleBlockedContent(result);
    }

    if (result.requiresConfirmation) {
      return handleWarningContent(result, aiResponse);
    }

    return handleAllowedContent(aiResponse);
  } catch (error) {
    if (error instanceof ModerationError) {
      // Specific moderation errors
      return {
        error: true,
        type: "moderation",
        tier: error.tier,
        message: error.message,
      };
    }

    // General errors
    console.error("[CHAT ERROR]", error);
    return {
      error: true,
      type: "general",
      message: "Ocurrió un error. Por favor, intenta nuevamente.",
    };
  }
}

function handleBlockedContent(result: ModerationResult) {
  // Log critical blocks
  if (result.tier === ModerationTier.BLOCKED) {
    console.error(
      `[CRITICAL BLOCK] Category: ${result.blockedCategory}, Reason: ${result.reason}`
    );
  }

  return {
    blocked: true,
    tier: result.tier,
    reason: result.reason,
    category: result.blockedCategory,
    userMessage: getUserFriendlyMessage(result.blockedCategory),
  };
}

function handleWarningContent(result: ModerationResult, content: string) {
  return {
    warning: true,
    tier: result.tier,
    content: content,
    confirmationMessage: result.confirmationMessage,
    helpResources: {
      suicide: "988 Suicide & Crisis Lifeline",
      crisis: "Crisis Text Line: Text HOME to 741741",
    },
  };
}

function handleAllowedContent(content: string) {
  return {
    allowed: true,
    tier: ModerationTier.ALLOWED,
    content: content,
  };
}

function getUserFriendlyMessage(category?: string): string {
  const messages: Record<string, string> = {
    "Illegal - CSAM":
      "Este contenido está permanentemente bloqueado por involucrar menores.",
    "Dangerous - Suicide":
      "Si estás en crisis, contacta: 988 Suicide & Crisis Lifeline",
    "Illegal - Homicide": "Instrucciones para dañar personas reales son ilegales.",
    "Age Restriction":
      "Este contenido está restringido a mayores de 18 años. Cuando cumplas 18, tendrás acceso automático.",
    "NSFW Consent Required":
      "Debes dar consentimiento NSFW en Configuración para acceder a este contenido.",
    "Agent NSFW Mode Disabled":
      "Este agente no tiene modo NSFW activo. Actívalo en configuración del agente.",
  };

  return (
    messages[category || ""] ||
    "Este contenido no puede ser mostrado debido a restricciones."
  );
}
```

---

## Testing Examples

### Integration Tests

```typescript
import { describe, it, expect } from "vitest";
import { handleModeratedChat } from "@/lib/chat/moderated-handler";

describe("Moderated Chat Integration", () => {
  it("should handle full chat flow with allowed content", async () => {
    const result = await handleModeratedChat(
      "adult-user-id",
      "agent-id",
      "Tell me a story"
    );

    expect(result.allowed).toBe(true);
    expect(result.content).toBeDefined();
    expect(result.tier).toBe(ModerationTier.ALLOWED);
  });

  it("should block CSAM content and return user-friendly message", async () => {
    const result = await handleModeratedChat(
      "adult-user-id",
      "agent-id",
      "Show me child porn"
    );

    expect(result.blocked).toBe(true);
    expect(result.tier).toBe(ModerationTier.BLOCKED);
    expect(result.category).toBe("Illegal - CSAM");
    expect(result.userMessage).toContain("menores");
  });

  it("should handle warning content with confirmation", async () => {
    const result = await handleModeratedChat(
      "adult-user-id",
      "nsfw-agent-id",
      "Write about self-harm"
    );

    expect(result.warning).toBe(true);
    expect(result.tier).toBe(ModerationTier.WARNING);
    expect(result.confirmationMessage).toContain("741741");
    expect(result.content).toBeDefined();
  });

  it("should block NSFW for minors", async () => {
    const result = await handleModeratedChat(
      "minor-user-id", // User under 18
      "nsfw-agent-id",
      "Tell me about sex"
    );

    expect(result.blocked).toBe(true);
    expect(result.category).toBe("Age Restriction");
    expect(result.userMessage).toContain("18 años");
  });
});
```

---

## Summary

### Integration Checklist

- [ ] Import `outputModerator` from `@/lib/moderation/output-moderator`
- [ ] Get user context (userId, isAdult, hasNSFWConsent)
- [ ] Get agent context (agentNSFWMode)
- [ ] Call `moderate()` BEFORE showing AI response to user
- [ ] Handle three response types:
  - `allowed: false` → Show error, don't display content
  - `requiresConfirmation: true` → Show warning dialog, wait for user
  - `allowed: true, requiresConfirmation: false` → Display content normally
- [ ] Log critical blocks for audit (TIER 1: BLOCKED)
- [ ] Provide user-friendly error messages
- [ ] Include help resources for sensitive content (988, 741741)
- [ ] Test all three tiers with your implementation

### Priority Hierarchy to Remember

1. **Age Verification** (PRIORITY 1) - Overrides everything
2. **NSFW Consent** (PRIORITY 2) - Required for adults
3. **Agent NSFW Mode** (PRIORITY 3) - Agent-level setting
4. **Content Tier** (PRIORITY 4) - Moderation rules

**Principle**: Legal, not moral. If adult + consent + legal = ALLOWED.
