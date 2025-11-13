# Sentry Integration Examples

Ejemplos prácticos de cómo integrar Sentry en las diferentes partes de la aplicación.

## API Routes

### Ejemplo 1: GET Endpoint Simple

```typescript
// app/api/worlds/route.ts
import { withSentryMonitoring } from "@/lib/sentry";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const GET = withSentryMonitoring(
  async (request: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worlds = await prisma.world.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ worlds });
  },
  {
    operationName: "GET /api/worlds",
    trackPerformance: true,
    trackErrors: true,
  }
);
```

### Ejemplo 2: POST Endpoint con Error Handling

```typescript
// app/api/agents/route.ts
import { withSentryMonitoring, captureDatabaseError } from "@/lib/sentry";

export const POST = withSentryMonitoring(
  async (request: NextRequest) => {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    try {
      const agent = await prisma.agent.create({
        data: {
          ...body,
          userId: session.user.id,
        },
      });

      return NextResponse.json({ agent }, { status: 201 });
    } catch (error) {
      if (error instanceof Error) {
        captureDatabaseError(error, {
          operation: "create",
          model: "Agent",
          userId: session.user.id,
        });
      }

      return NextResponse.json(
        { error: "Failed to create agent" },
        { status: 500 }
      );
    }
  },
  {
    operationName: "POST /api/agents",
  }
);
```

### Ejemplo 3: Dynamic Route con Params

```typescript
// app/api/agents/[id]/route.ts
import { withSentryMonitoring, trackDatabaseOperation } from "@/lib/sentry";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = withSentryMonitoring(
  async (request: NextRequest, context: RouteContext) => {
    const { id } = await context.params;

    trackDatabaseOperation("findUnique", "Agent");

    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json({ agent });
  },
  {
    operationName: "GET /api/agents/:id",
  }
);
```

## React Components

### Ejemplo 1: Chat Component

```typescript
// components/chat/ChatInput.tsx
"use client";

import { useState } from "react";
import { useSentry } from "@/hooks/useSentry";
import { trackChatMessage } from "@/lib/sentry/breadcrumbs";

export function ChatInput({ agentId }: { agentId: string }) {
  const [message, setMessage] = useState("");
  const { captureError, trackClick } = useSentry();

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      // Track user interaction
      trackClick("send-message-button", {
        agentId,
        messageLength: message.length,
      });

      // Track chat message
      trackChatMessage(agentId, "sent", message.length);

      // Send message
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Track response
      trackChatMessage(agentId, "received", data.response.length);

      setMessage("");
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, {
          operation: "sendChatMessage",
          feature: "chat",
          metadata: {
            agentId,
            messageLength: message.length,
          },
        });
      }
    }
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

### Ejemplo 2: World Creator Component

```typescript
// components/worlds/WorldCreator.tsx
"use client";

import { useSentry } from "@/hooks/useSentry";
import { measurePerformance } from "@/lib/sentry";

export function WorldCreator() {
  const { captureError, trackClick } = useSentry();

  const handleCreate = async (worldData: any) => {
    trackClick("create-world-button", {
      complexity: worldData.complexity,
    });

    try {
      // Measure creation performance
      const result = await measurePerformance(
        "World Creation",
        "world.create",
        async () => {
          const response = await fetch("/api/worlds", {
            method: "POST",
            body: JSON.stringify(worldData),
          });

          if (!response.ok) {
            throw new Error("Failed to create world");
          }

          return await response.json();
        },
        {
          tags: {
            complexity: worldData.complexity,
          },
        }
      );

      return result;
    } catch (error) {
      if (error instanceof Error) {
        captureError(error, {
          operation: "createWorld",
          feature: "worlds",
          metadata: {
            complexity: worldData.complexity,
          },
        });
      }
      throw error;
    }
  };

  return (
    <div>
      {/* Your world creator UI */}
    </div>
  );
}
```

## Server Actions

### Ejemplo 1: Create Agent Action

```typescript
// app/actions/agents.ts
"use server";

import { captureCustomError, trackDatabaseOperation } from "@/lib/sentry";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function createAgent(data: any) {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    trackDatabaseOperation("create", "Agent");

    const agent = await prisma.agent.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    return { success: true, agent };
  } catch (error) {
    if (error instanceof Error) {
      captureCustomError(error, {
        operation: "createAgent",
        feature: "agents",
        module: "server-actions",
        userId: session.user.id,
        metadata: data,
      });
    }

    return { success: false, error: "Failed to create agent" };
  }
}
```

## LLM/AI Integration

### Ejemplo 1: LLM Provider Wrapper

```typescript
// lib/llm/provider.ts
import { captureAIError, trackAIOperation } from "@/lib/sentry";

export class LLMProvider {
  async chat(prompt: string, model: string): Promise<string> {
    const startTime = Date.now();

    try {
      trackAIOperation("openrouter", model, "chat");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API failed with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      const duration = Date.now() - startTime;
      trackAIOperation("openrouter", model, "chat", duration);

      return content;
    } catch (error) {
      if (error instanceof Error) {
        captureAIError(error, {
          provider: "openrouter",
          model,
          operation: "chat",
          promptLength: prompt.length,
        });
      }
      throw error;
    }
  }
}
```

### Ejemplo 2: Emotional System Integration

```typescript
// lib/emotional-system/hybrid-orchestrator.ts
import { captureAIError, measurePerformance } from "@/lib/sentry";

export class HybridOrchestrator {
  async processEmotion(input: string): Promise<EmotionalState> {
    return await measurePerformance(
      "Emotion Processing",
      "emotion.process",
      async () => {
        try {
          const emotion = await this.detectEmotion(input);
          return emotion;
        } catch (error) {
          if (error instanceof Error) {
            captureAIError(error, {
              provider: "openrouter",
              model: this.model,
              operation: "emotion_detection",
              promptLength: input.length,
            });
          }
          throw error;
        }
      },
      {
        tags: {
          feature: "emotional-system",
        },
      }
    );
  }
}
```

## Database Operations

### Ejemplo 1: User Repository

```typescript
// lib/repositories/user.repository.ts
import { captureDatabaseError, trackDatabaseOperation } from "@/lib/sentry";

export class UserRepository {
  async findById(userId: string) {
    try {
      trackDatabaseOperation("findUnique", "User");

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        captureDatabaseError(error, {
          operation: "findUnique",
          model: "User",
          userId,
        });
      }
      throw error;
    }
  }

  async updateSubscription(userId: string, tier: string) {
    try {
      trackDatabaseOperation("update", "User");

      const user = await prisma.user.update({
        where: { id: userId },
        data: { subscriptionTier: tier },
      });

      return user;
    } catch (error) {
      if (error instanceof Error) {
        captureDatabaseError(error, {
          operation: "update",
          model: "User",
          userId,
        });
      }
      throw error;
    }
  }
}
```

## Middleware

### Ejemplo 1: Auth Middleware con Tracking

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { trackAuthEvent, addBreadcrumb } from "@/lib/sentry";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("next-auth.session-token");

  addBreadcrumb("Middleware check", "auth", {
    path: request.nextUrl.pathname,
    hasToken: !!token,
  });

  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    trackAuthEvent("failed");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

## Background Jobs

### Ejemplo 1: Cron Job con Monitoring

```typescript
// app/api/cron/cleanup/route.ts
import { measurePerformance, captureCustomError } from "@/lib/sentry";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await measurePerformance(
      "Cleanup Cron Job",
      "cron.cleanup",
      async () => {
        // Delete old sessions
        const deletedSessions = await prisma.session.deleteMany({
          where: {
            expires: {
              lt: new Date(),
            },
          },
        });

        // Pause inactive worlds
        const pausedWorlds = await prisma.world.updateMany({
          where: {
            lastActiveAt: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24h ago
            },
            status: "active",
          },
          data: {
            status: "paused",
          },
        });

        return {
          deletedSessions: deletedSessions.count,
          pausedWorlds: pausedWorlds.count,
        };
      },
      {
        tags: {
          job: "cleanup",
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      captureCustomError(error, {
        operation: "cronCleanup",
        feature: "cron",
        tags: {
          critical: "true",
        },
      });
    }

    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
```

## Error Boundaries

### Ejemplo 1: Global Error Boundary

```typescript
// app/error.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-4">
              Hemos registrado el error y lo revisaremos pronto.
            </p>
            <Button onClick={reset}>Intentar de nuevo</Button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### Ejemplo 2: Component Error Boundary

```typescript
// components/ErrorBoundary.tsx
"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.withScope((scope) => {
      scope.setContext("react_error_info", {
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-500 rounded">
          <h3>Error en el componente</h3>
          <button onClick={() => this.setState({ hasError: false })}>
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## WebSocket Integration

### Ejemplo 1: Socket.io with Sentry

```typescript
// lib/socket/server.ts
import { captureCustomError, addBreadcrumb } from "@/lib/sentry";

io.on("connection", (socket) => {
  addBreadcrumb("WebSocket connection", "socket", {
    socketId: socket.id,
  });

  socket.on("chat:message", async (data) => {
    try {
      addBreadcrumb("Chat message via WebSocket", "socket", {
        socketId: socket.id,
        messageLength: data.message.length,
      });

      // Process message
      const response = await processMessage(data.message);

      socket.emit("chat:response", response);
    } catch (error) {
      if (error instanceof Error) {
        captureCustomError(error, {
          operation: "socketChatMessage",
          feature: "websocket",
          metadata: {
            socketId: socket.id,
          },
        });
      }

      socket.emit("chat:error", { error: "Failed to process message" });
    }
  });
});
```

## Next Steps

Para más ejemplos, ver:
- [Custom Error Utilities](../lib/sentry/custom-error.ts)
- [Breadcrumbs](../lib/sentry/breadcrumbs.ts)
- [API Middleware](../lib/sentry/api-middleware.ts)
- [Examples File](../lib/sentry/examples.ts)
