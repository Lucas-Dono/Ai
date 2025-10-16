"use client";

/**
 * WhatsApp-Style Chat Interface
 *
 * Chat profesional estilo WhatsApp con soporte multimodal:
 * - Mensajes de texto
 * - Audio inline
 * - Imágenes con expresiones emocionales
 * - Indicadores de estado
 * - Notificaciones de sonido
 */

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Mic,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
  Volume2,
  X,
  Search,
  Download,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { VoiceRecorder } from "./VoiceRecorder";
import { ImageUploader } from "./ImageUploader";
import { MessageReactions } from "./MessageReactions";
import { ChatSearch } from "./ChatSearch";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { StickerGifPicker } from "./StickerGifPicker";
import { exportConversationToPDF } from "@/lib/utils/pdf-export";
import { useTheme } from "@/contexts/ThemeContext";
import { ImmersionToggle } from "./ImmersionToggle";
import { BehaviorPanel } from "./BehaviorPanel";
import { EmotionalStateDisplay } from "./EmotionalStateDisplay";

export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  reacted: boolean;
}

export interface Message {
  id: string;
  type: "user" | "agent";
  content: {
    text?: string;
    audio?: string; // URL del audio
    image?: string; // URL de la imagen
    emotion?: string; // Emoción detectada
  };
  timestamp: Date;
  status: "sending" | "sent" | "delivered" | "read";
  agentName?: string;
  agentAvatar?: string;
  reactions?: Reaction[];
  // Metadata del behavior system
  behaviorData?: {
    active: string[];
    phase?: number;
    safetyLevel: "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";
    triggers: string[];
    intensity?: number;
  };
  emotionalData?: {
    state: {
      trust: number;
      affinity: number;
      respect: number;
    };
    emotions: string[];
    relationLevel: number;
  };
}

interface WhatsAppChatProps {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  userId: string;
}

export function WhatsAppChat({
  agentId,
  agentName,
  agentAvatar,
  userId,
}: WhatsAppChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showStickerGifPicker, setShowStickerGifPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  // Estados del behavior system
  const [showBehaviorInfo, setShowBehaviorInfo] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [latestBehaviorData, setLatestBehaviorData] = useState<Message["behaviorData"] | null>(null);
  const [latestEmotionalData, setLatestEmotionalData] = useState<Message["emotionalData"] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const socket = useSocket();
  const { theme } = useTheme();

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Escuchar mensajes del socket
  useEffect(() => {
    if (!socket) return;

    // @ts-expect-error - Socket events need to be typed properly
    socket.on("agent:message", (data: any) => {
      handleAgentMessage(data);
    });

    // @ts-expect-error - Socket events need to be typed properly
    socket.on("agent:typing", (data: { agentId: string; isTyping: boolean }) => {
      if (data.agentId === agentId) {
        setIsTyping(data.isTyping);
      }
    });

    // @ts-expect-error - Socket events need to be typed properly
    socket.on("message:reactions:updated", (data: {
      messageId: string;
      reactions: Reaction[];
    }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, reactions: data.reactions }
            : msg
        )
      );
    });

    // Unirse a la sala del agente
    // @ts-expect-error - Socket events need to be typed properly
    socket.emit("join:agent:room", { agentId });

    return () => {
      // Salir de la sala del agente
      // @ts-expect-error - Socket events need to be typed properly
      socket.emit("leave:agent:room", { agentId });

      // @ts-expect-error - Socket events need to be typed properly
      socket.off("agent:message");
      // @ts-expect-error - Socket events need to be typed properly
      socket.off("agent:typing");
      // @ts-expect-error - Socket events need to be typed properly
      socket.off("message:reactions:updated");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, agentId]);

  // Manejar mensaje del agente
  const handleAgentMessage = (data: {
    messageId: string;
    agentId: string;
    content: {
      text?: string;
      audioUrl?: string;
      imageUrl?: string;
      emotion?: string;
    };
    // Metadata del behavior system
    behaviors?: {
      active: string[];
      phase?: number;
      safetyLevel: "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";
      triggers: string[];
      intensity?: number;
    };
    emotional?: {
      state: {
        trust: number;
        affinity: number;
        respect: number;
      };
      emotions: string[];
      relationLevel: number;
    };
  }) => {
    if (data.agentId !== agentId) return;

    const newMessage: Message = {
      id: data.messageId,
      type: "agent",
      content: {
        text: data.content.text,
        audio: data.content.audioUrl,
        image: data.content.imageUrl,
        emotion: data.content.emotion,
      },
      timestamp: new Date(),
      status: "delivered",
      agentName,
      agentAvatar,
      behaviorData: data.behaviors,
      emotionalData: data.emotional,
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);

    // Actualizar estado del behavior system con los datos más recientes
    if (data.behaviors) {
      setLatestBehaviorData(data.behaviors);
    }
    if (data.emotional) {
      setLatestEmotionalData(data.emotional);
    }

    // Reproducir sonido de notificación
    playNotificationSound();

    // Auto-reproducir audio si hay
    if (data.content.audioUrl) {
      setTimeout(() => {
        const audio = new Audio(data.content.audioUrl);
        audio.play().catch(console.error);
      }, 300);
    }
  };

  // Enviar mensaje
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: {
        text: messageText,
      },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Enviar mensaje via HTTP API
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageText,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Actualizar mensaje del usuario a "sent"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );

      // Agregar respuesta del agente con metadata del behavior system
      const agentMessage: Message = {
        id: data.message.id,
        type: "agent",
        content: {
          text: data.message.content,
        },
        timestamp: new Date(data.message.createdAt),
        status: "delivered",
        agentName,
        agentAvatar,
        behaviorData: data.behaviors,
        emotionalData: {
          state: data.state,
          emotions: data.emotions,
          relationLevel: data.relationLevel,
        },
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Actualizar estado del behavior system
      if (data.behaviors) {
        setLatestBehaviorData(data.behaviors);
      }
      if (data.state) {
        setLatestEmotionalData({
          state: data.state,
          emotions: data.emotions,
          relationLevel: data.relationLevel,
        });
      }

      setIsTyping(false);

      // Reproducir sonido de notificación
      playNotificationSound();

      // Si también hay socket, emitir para sincronizar con otros clientes
      if (socket) {
        // @ts-expect-error - Socket events need to be typed properly
        socket.emit("user:message", {
          agentId,
          userId,
          message: messageText,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);

      // Marcar mensaje como error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id
            ? { ...msg, status: "sent", content: { text: "⚠️ Error al enviar mensaje" } }
            : msg
        )
      );
    }
  };

  // Manejar Enter para enviar
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reproducir sonido de notificación
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  // Enviar mensaje de voz
  const sendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    if (!socket) return;

    // Crear mensaje temporal con audio
    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      type: "user",
      content: {
        audio: URL.createObjectURL(audioBlob),
      },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowVoiceRecorder(false);

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-message.webm");
      formData.append("duration", duration.toString());

      // Enviar al endpoint de transcripción
      const response = await fetch(`/api/agents/${agentId}/upload/audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload audio");
      }

      const data = await response.json();

      // Actualizar mensaje con transcripción y análisis emocional
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: data.messageId,
                content: {
                  audio: msg.content.audio,
                  text: data.transcription,
                },
                status: "sent",
              }
            : msg
        )
      );

      // Emitir al socket con la transcripción
      // @ts-expect-error - Socket events need to be typed properly
      socket.emit("user:message", {
        agentId,
        userId,
        message: data.transcription,
        metadata: {
          type: "audio",
          emotion: data.emotional.emotion,
          intensity: data.emotional.intensity,
          tone: data.emotional.tone,
          duration,
        },
      });
    } catch (error) {
      console.error("Error uploading audio:", error);

      // Marcar como error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                status: "sent",
                content: {
                  ...msg.content,
                  text: "⚠️ Error al procesar audio",
                },
              }
            : msg
        )
      );
    }
  };

  // Enviar imagen
  const sendImageMessage = async (imageFile: File, caption?: string) => {
    if (!socket) return;

    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("agentId", agentId);
    formData.append("userId", userId);
    if (caption) formData.append("caption", caption);

    // TODO: Implementar endpoint para recibir imagen
    // Por ahora, simulamos el envío
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: {
        image: URL.createObjectURL(imageFile),
        text: caption,
      },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowImageUploader(false);

    // Simular envío exitoso
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);
  };

  // Enviar sticker o GIF
  const sendStickerOrGif = async (
    url: string,
    type: "sticker" | "gif"
  ) => {
    if (!socket) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: {
        // Para stickers (emojis) usamos texto
        // Para GIFs usamos imagen
        ...(type === "sticker" ? { text: url } : { image: url }),
      },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowStickerGifPicker(false);

    // Simular envío exitoso
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
    }, 500);

    // TODO: Emitir al socket
    if (socket) {
      // @ts-expect-error - Socket events need to be typed properly
      socket.emit("user:message", {
        agentId,
        userId,
        message: type === "sticker" ? url : `[GIF: ${url}]`,
      });
    }
  };

  // Reaccionar a mensaje
  const handleReaction = (messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;

        const reactions = msg.reactions || [];
        const existingReaction = reactions.find((r) => r.emoji === emoji);

        if (existingReaction) {
          // Ya reaccionó con este emoji, remover
          if (existingReaction.reacted) {
            return {
              ...msg,
              reactions: reactions
                .map((r) =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count - 1,
                        reacted: false,
                        users: r.users.filter((u) => u !== userId),
                      }
                    : r
                )
                .filter((r) => r.count > 0),
            };
          } else {
            // Agregar reacción
            return {
              ...msg,
              reactions: reactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      reacted: true,
                      users: [...r.users, userId],
                    }
                  : r
              ),
            };
          }
        } else {
          // Nueva reacción
          return {
            ...msg,
            reactions: [
              ...reactions,
              { emoji, count: 1, users: [userId], reacted: true },
            ],
          };
        }
      })
    );

    // Emitir al socket para sincronizar con backend
    if (socket) {
      // @ts-expect-error - Socket events need to be typed properly
      socket.emit("message:react", { messageId, emoji, userId });
    }
  };

  // Remover reacción
  const handleRemoveReaction = (messageId: string, emoji: string) => {
    handleReaction(messageId, emoji);
  };

  // Manejar selección de resultado de búsqueda
  const handleSearchResultSelect = (messageId: string) => {
    setHighlightedMessageId(messageId);

    // Scroll al mensaje
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Remover resaltado después de 3 segundos
      setTimeout(() => {
        setHighlightedMessageId(null);
      }, 3000);
    }
  };

  // Exportar conversación a PDF
  const exportToPDF = async () => {
    try {
      await exportConversationToPDF(messages, {
        agentName,
        userName: "Usuario",
        includeImages: true,
        includeTimestamps: true,
      });
    } catch (error) {
      console.error("Error exportando a PDF:", error);
      alert("Error al exportar la conversación. Intenta de nuevo.");
    }
  };

  return (
    <div
      className="flex h-full relative"
      style={{ backgroundColor: theme.colors.bgPrimary }}
    >
      {/* Chat principal */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header estilo WhatsApp */}
        <div
          className="border-b px-4 py-3 flex items-center gap-3"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderColor,
          }}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={agentAvatar} />
            <AvatarFallback>{agentName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: theme.colors.textPrimary }}>
              {agentName}
            </h3>
            {isTyping && (
              <p className="text-sm animate-pulse" style={{ color: theme.colors.accentPrimary }}>
                escribiendo...
              </p>
            )}
          </div>

          {/* Acciones del header */}
          <div className="flex items-center gap-2">
            {/* Toggle de inmersión */}
            <ImmersionToggle
              onToggle={(show) => setShowBehaviorInfo(show)}
              defaultValue={showBehaviorInfo}
            />
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="hover:bg-opacity-10"
              style={{ color: theme.colors.textMuted }}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportToPDF}
              className="hover:bg-opacity-10"
              style={{ color: theme.colors.textMuted }}
            >
              <Download className="h-5 w-5" />
            </Button>
            {/* Toggle del sidebar (solo en desktop) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-opacity-10 hidden lg:flex"
              style={{ color: theme.colors.textMuted }}
            >
              {sidebarOpen ? (
                <PanelRightClose className="h-5 w-5" />
              ) : (
                <PanelRightOpen className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Barra de búsqueda avanzada */}
        {showSearch && (
          <ChatSearch
            messages={messages}
            onResultSelect={handleSearchResultSelect}
            onClose={() => setShowSearch(false)}
          />
        )}

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onImageClick={setSelectedImage}
              onReact={handleReaction}
              onRemoveReaction={handleRemoveReaction}
              userId={userId}
              isHighlighted={message.id === highlightedMessageId}
            />
          ))}

          {/* Indicador de "escribiendo..." */}
          {isTyping && (
            <div className="flex items-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={agentAvatar} />
                <AvatarFallback>{agentName[0]}</AvatarFallback>
              </Avatar>
              <div className="bg-[#1f1f1f] rounded-2xl rounded-tl-sm px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensaje */}
        <div
          className="border-t px-4 py-3"
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderColor,
          }}
        >
        {/* Mostrar grabadora de voz */}
        {showVoiceRecorder && (
          <div className="mb-3">
            <VoiceRecorder
              onSend={sendVoiceMessage}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* Mostrar subidor de imagen */}
        {showImageUploader && (
          <div className="mb-3">
            <ImageUploader
              onSend={sendImageMessage}
              onCancel={() => setShowImageUploader(false)}
            />
          </div>
        )}

        {/* Mostrar selector de stickers/GIFs */}
        {showStickerGifPicker && (
          <div className="mb-3 flex justify-center">
            <StickerGifPicker
              onSend={sendStickerOrGif}
              onClose={() => setShowStickerGifPicker(false)}
            />
          </div>
        )}

        {/* Barra de input normal */}
        {!showVoiceRecorder && !showImageUploader && !showStickerGifPicker && (
          <div className="flex items-end gap-2">
            {/* Botones de acciones */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowStickerGifPicker(true)}
                className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-full h-10 w-10"
              >
                <Smile className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImageUploader(true)}
                className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-full h-10 w-10"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVoiceRecorder(true)}
                className="text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-full h-10 w-10"
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>

            {/* Input de texto */}
            <div
              className="flex-1 rounded-3xl px-4 py-2 flex items-center gap-2"
              style={{ backgroundColor: theme.colors.bgTertiary }}
            >
              <Textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[24px] max-h-[120px]"
                style={{
                  color: theme.colors.textPrimary,
                }}
                rows={1}
              />
            </div>

            {/* Botón de envío */}
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="rounded-full h-12 w-12 p-0 disabled:opacity-50"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                color: "white",
              }}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}
        </div>

        {/* Visor de imagen full-screen */}
        {selectedImage && (
          <ImageViewer
            imageUrl={selectedImage}
            onClose={() => setSelectedImage(null)}
          />
        )}

        {/* Audio de notificación (oculto) */}
        <audio
          ref={audioRef}
          src="/sounds/notification.mp3"
          preload="auto"
        />
      </div>

      {/* Sidebar con información del behavior system */}
      {showBehaviorInfo && (
        <aside
          className={cn(
            "border-l transition-all duration-300 overflow-y-auto",
            sidebarOpen ? "w-80" : "w-0",
            "hidden lg:block" // Solo visible en desktop
          )}
          style={{
            backgroundColor: theme.colors.bgSecondary,
            borderColor: theme.colors.borderColor,
          }}
        >
          {sidebarOpen && (
            <div className="p-4 space-y-4">
              {/* Estado Emocional */}
              {latestEmotionalData && (
                <EmotionalStateDisplay
                  state={latestEmotionalData.state}
                  emotions={latestEmotionalData.emotions}
                  relationLevel={latestEmotionalData.relationLevel}
                />
              )}

              {/* Panel de Behavior */}
              {latestBehaviorData && (
                <BehaviorPanel
                  agentId={agentId}
                  behaviorData={latestBehaviorData}
                  intensity={latestBehaviorData.intensity}
                />
              )}

              {/* Mensaje informativo si no hay datos */}
              {!latestBehaviorData && !latestEmotionalData && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  <p>La información del comportamiento</p>
                  <p>aparecerá después del primer mensaje</p>
                </div>
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  );
}

// Componente de burbuja de mensaje
function MessageBubble({
  message,
  onImageClick,
  onReact,
  onRemoveReaction,
  userId,
  isHighlighted,
}: {
  message: Message;
  onImageClick: (url: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  userId: string;
  isHighlighted?: boolean;
}) {
  const isUser = message.type === "user";
  const { theme } = useTheme();

  return (
    <div
      id={`message-${message.id}`}
      className={cn(
        "flex items-start gap-2 animate-in slide-in-from-bottom-2 duration-300 transition-all",
        isUser ? "flex-row-reverse" : "flex-row",
        isHighlighted && "ring-2 ring-yellow-500 rounded-2xl p-2"
      )}
    >
      {/* Avatar (solo para agente) */}
      {!isUser && message.agentAvatar && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={message.agentAvatar} />
          <AvatarFallback>{message.agentName?.[0]}</AvatarFallback>
        </Avatar>
      )}

      {/* Contenedor de mensaje */}
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Imagen (si existe) */}
        {message.content.image && (
          <div
            className={cn(
              "rounded-2xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity",
              isUser ? "rounded-tr-sm" : "rounded-tl-sm"
            )}
            onClick={() => onImageClick(message.content.image!)}
          >
            <img
              src={message.content.image}
              alt="Expresión"
              className="w-full h-auto max-w-[300px] object-cover"
            />
          </div>
        )}

        {/* Audio (si existe) */}
        {message.content.audio && (
          <AudioPlayer audioUrl={message.content.audio} isUser={isUser} />
        )}

        {/* Texto (si existe) */}
        {message.content.text && (
          <div>
            <div
              className={cn(
                "rounded-2xl px-4 py-2",
                isUser ? "rounded-tr-sm" : "rounded-tl-sm"
              )}
              style={{
                backgroundColor: isUser
                  ? theme.colors.userMessageBg
                  : theme.colors.agentMessageBg,
                color: isUser
                  ? theme.colors.userMessageText
                  : theme.colors.agentMessageText,
              }}
            >
              <p className="text-sm whitespace-pre-wrap break-words">
                {message.content.text}
              </p>

              {/* Timestamp y estado */}
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 text-xs",
                  isUser ? "justify-end" : ""
                )}
                style={{
                  color: isUser
                    ? "rgba(255, 255, 255, 0.7)"
                    : theme.colors.textMuted,
                }}
              >
                <span>
                  {format(message.timestamp, "HH:mm", { locale: es })}
                </span>
                {isUser && <MessageStatus status={message.status} />}
              </div>
            </div>

            {/* Reacciones */}
            {message.reactions && message.reactions.length > 0 && (
              <MessageReactions
                reactions={message.reactions}
                onReact={(emoji) => onReact(message.id, emoji)}
                onRemoveReaction={(emoji) => onRemoveReaction(message.id, emoji)}
                compact={true}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de estado de mensaje
function MessageStatus({ status }: { status: Message["status"] }) {
  if (status === "sending") {
    return <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />;
  }

  if (status === "sent") {
    return <Check className="h-4 w-4 text-gray-400" />;
  }

  if (status === "delivered" || status === "read") {
    return (
      <CheckCheck
        className={cn(
          "h-4 w-4",
          status === "read" ? "text-blue-500" : "text-gray-400"
        )}
      />
    );
  }

  return null;
}

// Componente de reproductor de audio
function AudioPlayer({
  audioUrl,
  isUser,
}: {
  audioUrl: string;
  isUser: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-2 flex items-center gap-3 min-w-[200px]",
        isUser
          ? "bg-green-600 text-white rounded-tr-sm"
          : "bg-[#1f1f1f] text-white rounded-tl-sm"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        className="h-10 w-10 rounded-full hover:bg-white/10"
      >
        {isPlaying ? (
          <div className="w-4 h-4 flex gap-0.5">
            <div className="w-1 h-full bg-white"></div>
            <div className="w-1 h-full bg-white"></div>
          </div>
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs opacity-70">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}

// Componente visor de imagen full-screen
function ImageViewer({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
      >
        <X className="h-6 w-6" />
      </Button>

      <img
        src={imageUrl}
        alt="Imagen ampliada"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
