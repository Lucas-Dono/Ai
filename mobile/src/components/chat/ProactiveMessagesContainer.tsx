/**
 * Componente ProactiveMessagesContainer
 *
 * Contenedor principal para gestionar y mostrar múltiples mensajes proactivos.
 * Maneja rotación automática, animaciones y callbacks de interacción.
 *
 * @module components/chat/ProactiveMessagesContainer
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { AnimatePresence } from "moti";
import { ProactiveMessageBanner } from "./ProactiveMessageBanner";
import { useProactiveMessages } from "@/hooks/useProactiveMessages";
import type { ProactiveMessagesContainerProps } from "../../../types/proactive-messages";

/**
 * Componente ProactiveMessagesContainer
 *
 * @example
 * ```tsx
 * <ProactiveMessagesContainer
 *   agentId="agent-123"
 *   agentName="Mi IA"
 *   onMessageResponse={(msg, response) => {
 *     console.log("Usuario respondió:", response);
 *   }}
 * />
 * ```
 */
export function ProactiveMessagesContainer({
  agentId,
  agentName,
  agentAvatar,
  onMessageResponse,
  onMessageRead,
  onMessageDismissed,
  containerStyle,
}: ProactiveMessagesContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Usar el hook de mensajes proactivos
  const {
    messages,
    markAsRead,
    markAsDismissed,
    hasMessages,
  } = useProactiveMessages(agentId, {
    pollingInterval: 60000, // 1 minuto
    enableVibration: true,
    enableSound: true,
    autoShowNotification: true,
    onNewMessage: (message) => {
      console.log("[ProactiveMessagesContainer] New message received:", message.id);
      // El banner aparecerá automáticamente
      setIsVisible(true);
    },
    onError: (error) => {
      console.error("[ProactiveMessagesContainer] Error:", error);
    },
  });

  // Mensaje actual
  const currentMessage = messages[currentIndex];

  /**
   * Auto-rotación de mensajes si hay múltiples
   */
  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 10000); // 10 segundos por mensaje

    return () => clearInterval(interval);
  }, [messages.length]);

  /**
   * Reset index cuando cambian los mensajes
   */
  useEffect(() => {
    if (currentIndex >= messages.length) {
      setCurrentIndex(0);
    }
  }, [messages.length, currentIndex]);

  /**
   * Handler cuando el usuario presiona el mensaje
   */
  const handleMessagePress = useCallback(async () => {
    if (!currentMessage) return;

    console.log("[ProactiveMessagesContainer] Message pressed:", currentMessage.id);

    try {
      // Marcar como leído
      await markAsRead(currentMessage.id);

      // Callback del padre
      if (onMessageRead) {
        onMessageRead(currentMessage);
      }

      // Si hay más mensajes, mostrar el siguiente
      if (messages.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % (messages.length - 1));
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("[ProactiveMessagesContainer] Error handling press:", error);
    }
  }, [currentMessage, markAsRead, onMessageRead, messages.length]);

  /**
   * Handler cuando el usuario descarta el mensaje
   */
  const handleMessageDismiss = useCallback(async () => {
    if (!currentMessage) return;

    console.log("[ProactiveMessagesContainer] Message dismissed:", currentMessage.id);

    try {
      // Marcar como descartado
      await markAsDismissed(currentMessage.id);

      // Callback del padre
      if (onMessageDismissed) {
        onMessageDismissed(currentMessage);
      }

      // Si hay más mensajes, mostrar el siguiente
      if (messages.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % (messages.length - 1));
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error("[ProactiveMessagesContainer] Error handling dismiss:", error);
    }
  }, [currentMessage, markAsDismissed, onMessageDismissed, messages.length]);

  // No renderizar si no hay mensajes o no es visible
  if (!hasMessages || !isVisible || !currentMessage) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <AnimatePresence>
        <ProactiveMessageBanner
          key={currentMessage.id}
          message={currentMessage}
          onPress={handleMessagePress}
          onDismiss={handleMessageDismiss}
          animated={true}
        />
      </AnimatePresence>

      {/* Indicador de múltiples mensajes */}
      {messages.length > 1 && (
        <View style={styles.indicator}>
          {messages.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  indicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(139, 92, 246, 0.3)", // purple-500 with opacity
  },
  dotActive: {
    width: 16,
    backgroundColor: "#8B5CF6", // purple-500
  },
});

/**
 * Export por defecto
 */
export default ProactiveMessagesContainer;
