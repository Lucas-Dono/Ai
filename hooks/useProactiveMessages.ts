/**
 * Hook mejorado para mensajes proactivos (V2)
 *
 * Mejoras:
 * - Sistema singleton: Solo UNA instancia de polling por agentId
 * - Estado compartido entre todos los componentes
 * - Sin bucles infinitos
 * - Deduplicación automática
 * - Limpieza automática cuando no hay suscriptores
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface ProactiveMessage {
  id: string;
  content: string;
  triggerType: string;
  createdAt: string;
  scheduledFor: string | null;
  context?: any;
}

interface UseProactiveMessagesOptions {
  pollingInterval?: number;
  enabled?: boolean;
  onNewMessage?: (message: ProactiveMessage) => void;
  onError?: (error: Error) => void;
}

// ============================================
// SINGLETON STATE MANAGER
// ============================================

interface PollingInstance {
  agentId: string;
  messages: ProactiveMessage[];
  isLoading: boolean;
  error: Error | null;
  seenMessageIds: Set<string>;
  subscribers: Set<SubscriberCallback>;
  pollingIntervalId: NodeJS.Timeout | null;
  pollingInterval: number;
  lastFetch: number;
}

type SubscriberCallback = (state: {
  messages: ProactiveMessage[];
  isLoading: boolean;
  error: Error | null;
}) => void;

class ProactiveMessagesManager {
  private instances = new Map<string, PollingInstance>();

  /**
   * Obtener o crear instancia para un agentId
   */
  private getInstance(agentId: string, pollingInterval: number): PollingInstance {
    if (!this.instances.has(agentId)) {
      this.instances.set(agentId, {
        agentId,
        messages: [],
        isLoading: false,
        error: null,
        seenMessageIds: new Set(),
        subscribers: new Set(),
        pollingIntervalId: null,
        pollingInterval,
        lastFetch: 0,
      });
    }
    return this.instances.get(agentId)!;
  }

  /**
   * Suscribirse a mensajes de un agente
   */
  subscribe(
    agentId: string,
    callback: SubscriberCallback,
    options: {
      pollingInterval: number;
      enabled: boolean;
      onNewMessage?: (message: ProactiveMessage) => void;
      onError?: (error: Error) => void;
    }
  ) {
    const instance = this.getInstance(agentId, options.pollingInterval);

    // Agregar suscriptor
    instance.subscribers.add(callback);

    // Notificar estado inicial
    callback({
      messages: instance.messages,
      isLoading: instance.isLoading,
      error: instance.error,
    });

    // Si está habilitado y no hay polling activo, iniciarlo
    if (options.enabled && !instance.pollingIntervalId) {
      this.startPolling(agentId, options);
    }

    // Retornar función de limpieza
    return () => {
      instance.subscribers.delete(callback);

      // Si no quedan suscriptores, detener polling y limpiar
      if (instance.subscribers.size === 0) {
        this.stopPolling(agentId);
        this.instances.delete(agentId);
      }
    };
  }

  /**
   * Iniciar polling para un agente
   */
  private startPolling(
    agentId: string,
    options: {
      pollingInterval: number;
      onNewMessage?: (message: ProactiveMessage) => void;
      onError?: (error: Error) => void;
    }
  ) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    // Fetch inicial
    this.fetchMessages(agentId, options);

    // Setup interval
    instance.pollingIntervalId = setInterval(() => {
      this.fetchMessages(agentId, options);
    }, options.pollingInterval);

    console.log(`[ProactiveMessages] Started polling for agent ${agentId} (interval: ${options.pollingInterval}ms)`);
  }

  /**
   * Detener polling para un agente
   */
  private stopPolling(agentId: string) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    if (instance.pollingIntervalId) {
      clearInterval(instance.pollingIntervalId);
      instance.pollingIntervalId = null;
      console.log(`[ProactiveMessages] Stopped polling for agent ${agentId}`);
    }
  }

  /**
   * Fetch mensajes del servidor
   */
  private async fetchMessages(
    agentId: string,
    options: {
      onNewMessage?: (message: ProactiveMessage) => void;
      onError?: (error: Error) => void;
    }
  ) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    // Evitar fetches simultáneos
    if (instance.isLoading) return;

    // Rate limiting: No hacer fetch si ya se hizo hace menos de 30 segundos
    const now = Date.now();
    if (now - instance.lastFetch < 30000) {
      return;
    }

    try {
      // Update loading state
      instance.isLoading = true;
      instance.error = null;
      this.notifySubscribers(agentId);

      const response = await fetch(`/api/agents/${agentId}/proactive-messages`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.messages) {
        const newMessages = data.messages as ProactiveMessage[];

        // Detectar mensajes nuevos
        const unseenMessages = newMessages.filter(
          (msg) => !instance.seenMessageIds.has(msg.id)
        );

        // Agregar a la lista de vistos
        unseenMessages.forEach((msg) => {
          instance.seenMessageIds.add(msg.id);
        });

        // Notificar sobre mensajes nuevos
        if (unseenMessages.length > 0 && options.onNewMessage) {
          unseenMessages.forEach((msg) => options.onNewMessage!(msg));
        }

        instance.messages = newMessages;
        instance.lastFetch = now;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      instance.error = error;

      if (options.onError) {
        options.onError(error);
      }

      console.error(`[ProactiveMessages] Error fetching for agent ${agentId}:`, error);
    } finally {
      instance.isLoading = false;
      this.notifySubscribers(agentId);
    }
  }

  /**
   * Notificar a todos los suscriptores de cambios
   */
  private notifySubscribers(agentId: string) {
    const instance = this.instances.get(agentId);
    if (!instance) return;

    const state = {
      messages: instance.messages,
      isLoading: instance.isLoading,
      error: instance.error,
    };

    instance.subscribers.forEach((callback) => {
      callback(state);
    });
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(agentId: string, messageId: string) {
    try {
      const response = await fetch(`/api/agents/${agentId}/proactive-messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, status: "read" }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }

      // Remover mensaje del estado local
      const instance = this.instances.get(agentId);
      if (instance) {
        instance.messages = instance.messages.filter((msg) => msg.id !== messageId);
        this.notifySubscribers(agentId);
      }
    } catch (err) {
      console.error(`[ProactiveMessages] Error marking as read:`, err);
      throw err;
    }
  }

  /**
   * Marcar mensaje como descartado
   */
  async markAsDismissed(agentId: string, messageId: string) {
    try {
      const response = await fetch(`/api/agents/${agentId}/proactive-messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, status: "dismissed" }),
      });

      if (!response.ok) {
        throw new Error("Failed to dismiss");
      }

      // Remover mensaje del estado local
      const instance = this.instances.get(agentId);
      if (instance) {
        instance.messages = instance.messages.filter((msg) => msg.id !== messageId);
        this.notifySubscribers(agentId);
      }
    } catch (err) {
      console.error(`[ProactiveMessages] Error dismissing:`, err);
      throw err;
    }
  }

  /**
   * Responder a mensaje
   */
  async respondToMessage(agentId: string, messageId: string, userResponse: string) {
    try {
      const response = await fetch(`/api/agents/${agentId}/proactive-messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, status: "read", userResponse }),
      });

      if (!response.ok) {
        throw new Error("Failed to respond");
      }

      // Remover mensaje del estado local
      const instance = this.instances.get(agentId);
      if (instance) {
        instance.messages = instance.messages.filter((msg) => msg.id !== messageId);
        this.notifySubscribers(agentId);
      }

      return true;
    } catch (err) {
      console.error(`[ProactiveMessages] Error responding:`, err);
      throw err;
    }
  }

  /**
   * Refrescar mensajes manualmente
   */
  refresh(agentId: string, options: { onNewMessage?: (message: ProactiveMessage) => void; onError?: (error: Error) => void }) {
    this.fetchMessages(agentId, options);
  }
}

// Instancia singleton global
const manager = new ProactiveMessagesManager();

// ============================================
// REACT HOOK
// ============================================

export function useProactiveMessages(
  agentId: string | null | undefined,
  options: UseProactiveMessagesOptions = {}
) {
  const {
    pollingInterval = 900000, // 15 minutos por defecto
    enabled = true,
    onNewMessage,
    onError,
  } = options;

  const [messages, setMessages] = useState<ProactiveMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs para callbacks estables
  const onNewMessageRef = useRef(onNewMessage);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onErrorRef.current = onError;
  }, [onNewMessage, onError]);

  // Suscripción al manager
  useEffect(() => {
    if (!agentId || !enabled) {
      setMessages([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const unsubscribe = manager.subscribe(
      agentId,
      (state) => {
        setMessages(state.messages);
        setIsLoading(state.isLoading);
        setError(state.error);
      },
      {
        pollingInterval,
        enabled,
        onNewMessage: onNewMessageRef.current,
        onError: onErrorRef.current,
      }
    );

    return unsubscribe;
  }, [agentId, enabled, pollingInterval]);

  // Funciones de acción
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!agentId) return;
      await manager.markAsRead(agentId, messageId);
    },
    [agentId]
  );

  const markAsDismissed = useCallback(
    async (messageId: string) => {
      if (!agentId) return;
      await manager.markAsDismissed(agentId, messageId);
    },
    [agentId]
  );

  const respondToMessage = useCallback(
    async (messageId: string, userResponse: string) => {
      if (!agentId) return false;
      return await manager.respondToMessage(agentId, messageId, userResponse);
    },
    [agentId]
  );

  const refresh = useCallback(() => {
    if (!agentId) return;
    manager.refresh(agentId, {
      onNewMessage: onNewMessageRef.current,
      onError: onErrorRef.current,
    });
  }, [agentId]);

  return {
    messages,
    isLoading,
    error,
    markAsRead,
    markAsDismissed,
    respondToMessage,
    refresh,
    hasMessages: messages.length > 0,
  };
}
