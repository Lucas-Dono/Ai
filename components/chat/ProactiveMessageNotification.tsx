/**
 * Componente de Notificación de Mensajes Proactivos
 *
 * Muestra mensajes proactivos de la IA con animaciones y opciones de interacción.
 * Se integra con el chat y permite al usuario ver y responder a mensajes proactivos.
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProactiveMessages, type ProactiveMessage } from "@/hooks/useProactiveMessages";
import { cn } from "@/lib/utils";

interface ProactiveMessageNotificationProps {
  agentId: string;
  agentName?: string;
  onMessageClick?: (message: ProactiveMessage) => void;
  className?: string;
  /**
   * Si true, muestra los mensajes inline en el chat
   * Si false, muestra como notificación flotante
   */
  inline?: boolean;
}

export function ProactiveMessageNotification({
  agentId,
  agentName = "IA",
  onMessageClick,
  className,
  inline = false,
}: ProactiveMessageNotificationProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const { messages, markAsRead, markAsDismissed, isLoading } = useProactiveMessages(
    agentId,
    {
      enabled: true, // Ahora usa sistema singleton - seguro para múltiples instancias
      pollingInterval: 600000, // 10 minutos (compartido entre todas las instancias del mismo agentId)
      onNewMessage: (message) => {
        // Reproducir sonido de notificación (opcional)
        playNotificationSound();

        // Mostrar notificación del sistema (si está permitido)
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          new Notification(`Mensaje de ${agentName}`, {
            body: message.content.substring(0, 100) + "...",
            icon: "/logo.png",
            tag: message.id,
          });
        }
      },
    }
  );

  const currentMessage = messages[currentMessageIndex];

  // Auto-avanzar a siguiente mensaje si hay más de uno
  useEffect(() => {
    if (messages.length > 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }, 10000); // 10 segundos por mensaje

      return () => clearTimeout(timer);
    }
  }, [currentMessageIndex, messages.length]);

  // Función para reproducir sonido
  const playNotificationSound = () => {
    if (typeof window !== "undefined" && "Audio" in window) {
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Silenciar errores de autoplay
        });
      } catch (error) {
        // Silenciar errores de audio
      }
    }
  };

  // Solicitar permiso de notificaciones
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const handleDismiss = async () => {
    if (currentMessage) {
      await markAsDismissed(currentMessage.id);

      if (messages.length > 1) {
        setCurrentMessageIndex((prev) => (prev + 1) % (messages.length - 1));
      } else {
        setIsVisible(false);
      }
    }
  };

  const handleClick = async () => {
    if (currentMessage) {
      await markAsRead(currentMessage.id);

      if (onMessageClick) {
        onMessageClick(currentMessage);
      }

      if (messages.length > 1) {
        setCurrentMessageIndex((prev) => (prev + 1) % (messages.length - 1));
      } else {
        setIsVisible(false);
      }
    }
  };

  // Obtener icono según tipo de trigger
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "inactivity":
        return <Clock className="w-5 h-5" />;
      case "follow_up":
        return <MessageCircle className="w-5 h-5" />;
      case "emotional_checkin":
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  // Obtener color según tipo de trigger
  const getTriggerColor = (triggerType: string) => {
    switch (triggerType) {
      case "inactivity":
        return "from-blue-500 to-blue-600";
      case "follow_up":
        return "from-purple-500 to-purple-600";
      case "emotional_checkin":
        return "from-pink-500 to-pink-600";
      case "celebration":
        return "from-yellow-500 to-yellow-600";
      case "life_event":
        return "from-green-500 to-green-600";
      default:
        return "from-purple-500 to-purple-600";
    }
  };

  if (!currentMessage || !isVisible) {
    return null;
  }

  // Modo inline (para mostrar dentro del chat)
  if (inline) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "relative rounded-2xl p-4 mb-4 shadow-lg border",
            "bg-gradient-to-br",
            getTriggerColor(currentMessage.triggerType),
            "border-white/20",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                {getTriggerIcon(currentMessage.triggerType)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {agentName}
                </p>
                <p className="text-white/80 text-xs">
                  Mensaje proactivo
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Contenido */}
          <p className="text-white mb-4 leading-relaxed">
            {currentMessage.content}
          </p>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              onClick={handleClick}
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
              size="sm"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Responder
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
            >
              Más tarde
            </Button>
          </div>

          {/* Indicador de múltiples mensajes */}
          {messages.length > 1 && (
            <div className="flex gap-1 justify-center mt-3">
              {messages.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    idx === currentMessageIndex
                      ? "w-4 bg-white"
                      : "w-1 bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Modo flotante (notificación en la esquina)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentMessage.id}
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ duration: 0.3, type: "spring" }}
        className={cn(
          "fixed bottom-4 right-4 z-50 max-w-sm",
          "rounded-2xl shadow-2xl border overflow-hidden",
          "bg-gradient-to-br",
          getTriggerColor(currentMessage.triggerType),
          "border-white/20",
          className
        )}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                {getTriggerIcon(currentMessage.triggerType)}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">
                  {agentName}
                </p>
                <p className="text-white/80 text-xs">
                  tiene un mensaje para ti
                </p>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Contenido */}
          <p className="text-white mb-4 text-sm leading-relaxed line-clamp-3">
            {currentMessage.content}
          </p>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              onClick={handleClick}
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
              size="sm"
            >
              Ver mensaje
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
            >
              Cerrar
            </Button>
          </div>

          {/* Indicador de múltiples mensajes */}
          {messages.length > 1 && (
            <div className="flex gap-1 justify-center mt-3">
              {messages.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    idx === currentMessageIndex
                      ? "w-4 bg-white"
                      : "w-1 bg-white/50"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Barra de progreso de auto-cierre (opcional) */}
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: 10, ease: "linear" }}
          className="h-1 bg-white/30"
        />
      </motion.div>
    </AnimatePresence>
  );
}
