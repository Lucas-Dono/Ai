/**
 * Hook useProactiveMessages para React Native
 *
 * Hook completo y production-ready para manejar mensajes proactivos en mobile.
 * Incluye polling, notificaciones locales, vibración, analytics y manejo de errores.
 *
 * @module hooks/useProactiveMessages
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Platform, Vibration, AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { Audio } from "expo-av";
import { proactiveApi, ProactiveAPIError } from "../services/api/proactive.api";
import type {
  ProactiveMessage,
  UseProactiveMessagesOptions,
  UseProactiveMessagesReturn,
  ProactiveMessageAnalytics,
} from "../../types/proactive-messages";

// Re-export ProactiveMessage for components
export type { ProactiveMessage } from "../../types/proactive-messages";

// Configurar handler de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Hook principal para manejar mensajes proactivos
 *
 * @param agentId - ID del agente
 * @param options - Opciones de configuración
 * @returns Objeto con mensajes y funciones de control
 *
 * @example
 * ```typescript
 * const {
 *   messages,
 *   isLoading,
 *   markAsRead,
 *   hasMessages
 * } = useProactiveMessages("agent-123", {
 *   pollingInterval: 60000, // 1 minuto
 *   enableVibration: true,
 *   onNewMessage: (msg) => console.log("Nuevo mensaje:", msg.content)
 * });
 * ```
 */
export function useProactiveMessages(
  agentId: string | null | undefined,
  options: UseProactiveMessagesOptions = {}
): UseProactiveMessagesReturn {
  const {
    pollingInterval = 60000, // 1 minuto por defecto
    enabled = true,
    onNewMessage,
    onError,
    autoShowNotification = true,
    enableVibration = true,
    enableSound = true,
  } = options;

  // Estados
  const [messages, setMessages] = useState<ProactiveMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs para mantener track de estado
  const seenMessageIds = useRef<Set<string>>(new Set());
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundObjectRef = useRef<Audio.Sound | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Reproducir sonido de notificación
   */
  const playNotificationSound = useCallback(async () => {
    if (!enableSound) return;

    try {
      // Limpiar sonido anterior si existe
      if (soundObjectRef.current) {
        await soundObjectRef.current.unloadAsync();
      }

      // Cargar y reproducir nuevo sonido
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/sounds/notification.mp3"),
        { shouldPlay: true, volume: 0.5 }
      );

      soundObjectRef.current = sound;

      // Limpiar cuando termine
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.warn("[useProactiveMessages] Error playing sound:", error);
    }
  }, [enableSound]);

  /**
   * Vibrar el dispositivo
   */
  const vibrateDevice = useCallback(() => {
    if (!enableVibration) return;

    try {
      // Patrón de vibración: espera, vibra, espera, vibra
      if (Platform.OS === "ios") {
        Vibration.vibrate([0, 200, 100, 200]);
      } else {
        // Android soporta patrones más complejos
        Vibration.vibrate([0, 250, 100, 250, 100, 150]);
      }
    } catch (error) {
      console.warn("[useProactiveMessages] Error vibrating:", error);
    }
  }, [enableVibration]);

  /**
   * Mostrar notificación local
   */
  const showLocalNotification = useCallback(async (message: ProactiveMessage, agentName?: string) => {
    if (!autoShowNotification) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: agentName ? `Mensaje de ${agentName}` : "Nuevo mensaje",
          body: message.content.substring(0, 120) + (message.content.length > 120 ? "..." : ""),
          data: {
            messageId: message.id,
            agentId: message.agentId,
            triggerType: message.triggerType,
          },
          sound: enableSound ? "default" : undefined,
          badge: 1,
          categoryIdentifier: "proactive-message",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Inmediato
      });

      console.log("[useProactiveMessages] Local notification scheduled");
    } catch (error) {
      console.error("[useProactiveMessages] Error showing notification:", error);
    }
  }, [autoShowNotification, enableSound]);

  /**
   * Enviar evento de analytics
   */
  const trackAnalytics = useCallback(async (event: Partial<ProactiveMessageAnalytics>) => {
    try {
      // Aquí puedes integrar con tu sistema de analytics (Firebase, Amplitude, etc.)
      console.log("[useProactiveMessages] Analytics event:", event);

      // Ejemplo con Firebase Analytics
      // await analytics().logEvent(event.eventType, event);
    } catch (error) {
      console.warn("[useProactiveMessages] Error tracking analytics:", error);
    }
  }, []);

  /**
   * Fetch mensajes proactivos del servidor
   */
  const fetchMessages = useCallback(async () => {
    if (!agentId || !enabled) return;

    // No hacer fetch si la app está en background
    if (appState.current !== "active") {
      console.log("[useProactiveMessages] Skipping fetch - app not active");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log(`[useProactiveMessages] Fetching messages for agent: ${agentId}`);
      const newMessages = await proactiveApi.getPendingMessages(agentId);

      // Detectar mensajes nuevos
      const unseenMessages = newMessages.filter(
        (msg: ProactiveMessage) => !seenMessageIds.current.has(msg.id)
      );

      // Procesar mensajes nuevos
      if (unseenMessages.length > 0) {
        console.log(`[useProactiveMessages] Found ${unseenMessages.length} new messages`);

        // Agregar a la lista de vistos
        unseenMessages.forEach((msg: ProactiveMessage) => {
          seenMessageIds.current.add(msg.id);
        });

        // Para cada mensaje nuevo
        for (const msg of unseenMessages) {
          // Vibrar
          vibrateDevice();

          // Reproducir sonido
          await playNotificationSound();

          // Mostrar notificación local
          await showLocalNotification(msg);

          // Track analytics
          await trackAnalytics({
            eventType: "proactive_message_received",
            messageId: msg.id,
            agentId: msg.agentId,
            triggerType: msg.triggerType,
            timestamp: new Date().toISOString(),
          });

          // Callback del usuario
          if (onNewMessage) {
            onNewMessage(msg);
          }

          // Pequeña espera entre mensajes para no saturar
          if (unseenMessages.length > 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }
      }

      setMessages(newMessages);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error("Unknown error");
      console.error("[useProactiveMessages] Error fetching messages:", errorObj);
      setError(errorObj);

      if (onError) {
        onError(errorObj);
      }
    } finally {
      setIsLoading(false);
    }
  }, [agentId, enabled, onNewMessage, onError, vibrateDevice, playNotificationSound, showLocalNotification, trackAnalytics]);

  /**
   * Marcar mensaje como leído
   */
  const markAsRead = useCallback(
    async (messageId: string) => {
      if (!agentId) return;

      try {
        console.log(`[useProactiveMessages] Marking message as read: ${messageId}`);
        await proactiveApi.markAsRead(agentId, messageId);

        // Track analytics
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          const timeToRead = message.deliveredAt
            ? new Date().getTime() - new Date(message.deliveredAt).getTime()
            : undefined;

          await trackAnalytics({
            eventType: "proactive_message_read",
            messageId,
            agentId,
            triggerType: message.triggerType,
            timestamp: new Date().toISOString(),
            metadata: {
              timeToRead,
            },
          });
        }

        // Remover mensaje de la lista local
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (err) {
        console.error("[useProactiveMessages] Error marking message as read:", err);
        throw err;
      }
    },
    [agentId, messages, trackAnalytics]
  );

  /**
   * Marcar mensaje como descartado
   */
  const markAsDismissed = useCallback(
    async (messageId: string) => {
      if (!agentId) return;

      try {
        console.log(`[useProactiveMessages] Marking message as dismissed: ${messageId}`);
        await proactiveApi.markAsDismissed(agentId, messageId);

        // Track analytics
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          await trackAnalytics({
            eventType: "proactive_message_dismissed",
            messageId,
            agentId,
            triggerType: message.triggerType,
            timestamp: new Date().toISOString(),
          });
        }

        // Remover mensaje de la lista local
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      } catch (err) {
        console.error("[useProactiveMessages] Error marking message as dismissed:", err);
        throw err;
      }
    },
    [agentId, messages, trackAnalytics]
  );

  /**
   * Responder a un mensaje proactivo
   */
  const respondToMessage = useCallback(
    async (messageId: string, userResponse: string): Promise<boolean> => {
      if (!agentId) return false;

      try {
        console.log(`[useProactiveMessages] Responding to message: ${messageId}`);
        const success = await proactiveApi.respondToMessage(agentId, messageId, userResponse);

        // Track analytics
        const message = messages.find((m) => m.id === messageId);
        if (message) {
          await trackAnalytics({
            eventType: "proactive_message_responded",
            messageId,
            agentId,
            triggerType: message.triggerType,
            timestamp: new Date().toISOString(),
            metadata: {
              responseLength: userResponse.length,
            },
          });
        }

        // Remover mensaje de la lista local
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        return success;
      } catch (err) {
        console.error("[useProactiveMessages] Error responding to message:", err);
        throw err;
      }
    },
    [agentId, messages, trackAnalytics]
  );

  /**
   * Refrescar mensajes manualmente
   */
  const refresh = useCallback(async () => {
    console.log("[useProactiveMessages] Manual refresh triggered");
    await fetchMessages();
  }, [fetchMessages]);

  /**
   * Setup polling interval
   */
  useEffect(() => {
    if (!agentId || !enabled) {
      console.log("[useProactiveMessages] Polling disabled");
      return;
    }

    console.log(`[useProactiveMessages] Setting up polling (interval: ${pollingInterval}ms)`);

    // Fetch inicial
    fetchMessages();

    // Setup polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchMessages();
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [agentId, enabled, pollingInterval, fetchMessages]);

  /**
   * Limpiar cuando cambia el agente
   */
  useEffect(() => {
    setMessages([]);
    seenMessageIds.current.clear();
    setError(null);
  }, [agentId]);

  /**
   * Monitorear estado de la app (foreground/background)
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(`[useProactiveMessages] App state changed: ${appState.current} -> ${nextAppState}`);

      // Si volvemos a foreground, hacer fetch inmediato
      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        console.log("[useProactiveMessages] App became active - fetching messages");
        fetchMessages();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [fetchMessages]);

  /**
   * Cleanup de recursos al desmontar
   */
  useEffect(() => {
    return () => {
      // Limpiar sonido
      if (soundObjectRef.current) {
        soundObjectRef.current.unloadAsync().catch(() => {});
      }

      // Limpiar polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    markAsRead,
    markAsDismissed,
    respondToMessage,
    refresh,
    hasMessages: messages.length > 0,
    messageCount: messages.length,
  };
}

/**
 * Export por defecto
 */
export default useProactiveMessages;
