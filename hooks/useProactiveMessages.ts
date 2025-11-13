/**
 * Hook para manejar mensajes proactivos de la IA
 *
 * Este hook hace polling al servidor para obtener mensajes proactivos
 * y proporciona funciones para marcarlos como leídos o respondidos.
 *
 * Uso:
 * ```tsx
 * const { messages, markAsRead, markAsDismissed, isLoading } = useProactiveMessages(agentId);
 * ```
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
  /**
   * Intervalo de polling en milisegundos
   * @default 60000 (1 minuto)
   */
  pollingInterval?: number;

  /**
   * Si debe hacer polling automáticamente
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback cuando se recibe un nuevo mensaje
   */
  onNewMessage?: (message: ProactiveMessage) => void;

  /**
   * Callback cuando hay un error
   */
  onError?: (error: Error) => void;
}

export function useProactiveMessages(
  agentId: string | null | undefined,
  options: UseProactiveMessagesOptions = {}
) {
  const {
    pollingInterval = 60000, // 1 minuto por defecto
    enabled = true,
    onNewMessage,
    onError,
  } = options;

  const [messages, setMessages] = useState<ProactiveMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ref para mantener track de mensajes ya vistos
  const seenMessageIds = useRef<Set<string>>(new Set());
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch mensajes proactivos del servidor
   */
  const fetchMessages = useCallback(async () => {
    if (!agentId || !enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/agents/${agentId}/proactive-messages`);

      if (!response.ok) {
        throw new Error(`Failed to fetch proactive messages: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.messages) {
        const newMessages = data.messages as ProactiveMessage[];

        // Detectar mensajes nuevos
        const unseenMessages = newMessages.filter(
          (msg) => !seenMessageIds.current.has(msg.id)
        );

        // Agregar a la lista de vistos
        unseenMessages.forEach((msg) => {
          seenMessageIds.current.add(msg.id);
        });

        // Notificar sobre mensajes nuevos
        if (unseenMessages.length > 0 && onNewMessage) {
          unseenMessages.forEach((msg) => onNewMessage(msg));
        }

        setMessages(newMessages);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      if (onError) {
        onError(error);
      }
      console.error("[useProactiveMessages] Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [agentId, enabled, onNewMessage, onError]);

  /**
   * Marcar mensaje como leído
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!agentId) return;

      try {
        const response = await fetch(`/api/agents/${agentId}/proactive-messages`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            status: "read",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark message as read");
        }

        // Remover mensaje de la lista local
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (err) {
        console.error("[useProactiveMessages] Error marking message as read:", err);
        throw err;
      }
    },
    [agentId]
  );

  /**
   * Marcar mensaje como descartado
   */
  const markAsDismissed = useCallback(
    async (messageId: string) => {
      if (!agentId) return;

      try {
        const response = await fetch(`/api/agents/${agentId}/proactive-messages`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            status: "dismissed",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to dismiss message");
        }

        // Remover mensaje de la lista local
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (err) {
        console.error("[useProactiveMessages] Error dismissing message:", err);
        throw err;
      }
    },
    [agentId]
  );

  /**
   * Responder a un mensaje proactivo
   */
  const respondToMessage = useCallback(
    async (messageId: string, userResponse: string) => {
      if (!agentId) return;

      try {
        const response = await fetch(`/api/agents/${agentId}/proactive-messages`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messageId,
            status: "read",
            userResponse,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to respond to message");
        }

        // Remover mensaje de la lista local
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        return true;
      } catch (err) {
        console.error("[useProactiveMessages] Error responding to message:", err);
        throw err;
      }
    },
    [agentId]
  );

  /**
   * Refrescar mensajes manualmente
   */
  const refresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  /**
   * Setup polling
   */
  useEffect(() => {
    if (!agentId || !enabled) {
      return;
    }

    // Fetch inicial
    fetchMessages();

    // Setup polling interval
    pollingTimeoutRef.current = setInterval(() => {
      fetchMessages();
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingTimeoutRef.current) {
        clearInterval(pollingTimeoutRef.current);
      }
    };
  }, [agentId, enabled, pollingInterval, fetchMessages]);

  /**
   * Limpiar cuando cambia el agente
   */
  useEffect(() => {
    setMessages([]);
    seenMessageIds.current.clear();
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
