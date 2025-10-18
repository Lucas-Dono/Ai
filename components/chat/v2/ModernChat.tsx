/**
 * Modern Chat Component
 *
 * Complete redesign of WhatsAppChat with:
 * - Glassmorphism UI
 * - Smooth animations
 * - Better component structure
 * - Improved UX
 * - Full feature parity with original WhatsAppChat
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/components/chat/WhatsAppChat";
import { VoiceRecorder } from "@/components/chat/VoiceRecorder";
import { ImageUploader } from "@/components/chat/ImageUploader";
import { StickerGifPicker } from "@/components/chat/StickerGifPicker";
import { BehaviorPanel } from "@/components/chat/BehaviorPanel";
import { EmotionalStateDisplay } from "@/components/chat/EmotionalStateDisplay";
import { ChatSearch } from "@/components/chat/ChatSearch";
import { exportConversationToPDF } from "@/lib/utils/pdf-export";

interface ModernChatProps {
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  userId: string;
}

export function ModernChat({
  agentId,
  agentName,
  agentAvatar,
  userId,
}: ModernChatProps) {
  const sessionKey = `chat-messages-${agentId}-${userId}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Multimodal input states
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showStickerGifPicker, setShowStickerGifPicker] = useState(false);

  // Search and utility states
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Behavioral and emotional tracking
  const [latestBehaviorData, setLatestBehaviorData] = useState<Message["behaviorData"] | null>(null);
  const [latestEmotionalData, setLatestEmotionalData] = useState<Message["emotionalData"] | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from session storage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const restored: Message[] = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(restored);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [sessionKey]);

  // Save messages to session storage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const toSave = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        }));
        sessionStorage.setItem(sessionKey, JSON.stringify(toSave));
      } catch (error) {
        console.error('Error saving messages:', error);
      }
    }
  }, [messages, sessionKey]);

  // Update latest behavioral and emotional data when new messages arrive
  useEffect(() => {
    const lastAgentMessage = [...messages]
      .reverse()
      .find((msg) => msg.type === "agent");

    if (lastAgentMessage) {
      if (lastAgentMessage.behaviorData) {
        setLatestBehaviorData(lastAgentMessage.behaviorData);
      }
      if (lastAgentMessage.emotionalData) {
        setLatestEmotionalData(lastAgentMessage.emotionalData);
      }
    }
  }, [messages]);

  // Socket connection
  useEffect(() => {
    if (!socket) return;

    // @ts-ignore - Using typed socket events
    socket.on("agent:message", (data: any) => {
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
    });

    // @ts-ignore
    socket.on("agent:typing", (data: { agentId: string; isTyping: boolean }) => {
      if (data.agentId === agentId) {
        setIsTyping(data.isTyping);
      }
    });

    // @ts-ignore
    socket.emit("join:agent:room", { agentId });

    return () => {
      // @ts-ignore
      socket.emit("leave:agent:room", { agentId });
      // @ts-ignore
      socket.off("agent:message");
      // @ts-ignore
      socket.off("agent:typing");
    };
  }, [socket, agentId, agentName, agentAvatar]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage;
    const tempId = `temp-${Date.now()}`;

    const userMessage: Message = {
      id: tempId,
      type: "user",
      content: { text: messageText },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText,
          userId,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();

      // Update user message with real ID
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, id: data.userMessage.id, status: "sent" as const }
            : msg
        )
      );

      // Add agent message
      const agentMessage: Message = {
        id: data.message.id,
        type: "agent",
        content: { text: data.message.content },
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
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, status: "sent" as const, content: { text: "⚠️ Error al enviar" } }
            : msg
        )
      );
      setIsTyping(false);
    }
  };

  // Send voice message
  const sendVoiceMessage = async (audioBlob: Blob, duration: number) => {
    const tempId = `temp-voice-${Date.now()}`;
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice-message.webm");
    formData.append("userId", userId);
    formData.append("duration", duration.toString());

    const userMessage: Message = {
      id: tempId,
      type: "user",
      content: { text: `🎤 Mensaje de voz (${Math.round(duration)}s)` },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowVoiceRecorder(false);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send voice message");
      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, id: data.userMessage.id, status: "sent" as const } : msg
        )
      );

      const agentMessage: Message = {
        id: data.message.id,
        type: "agent",
        content: { text: data.message.content },
        timestamp: new Date(data.message.createdAt),
        status: "delivered",
        agentName,
        agentAvatar,
        behaviorData: data.behaviors,
        emotionalData: { state: data.state, emotions: data.emotions, relationLevel: data.relationLevel },
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending voice message:", error);
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "sent" as const } : msg)));
      setIsTyping(false);
    }
  };

  // Send image message
  const sendImageMessage = async (imageFile: File, caption?: string) => {
    const tempId = `temp-image-${Date.now()}`;
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("userId", userId);
    if (caption) formData.append("content", caption);

    const userMessage: Message = {
      id: tempId,
      type: "user",
      content: { text: caption || "📷 Imagen" },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowImageUploader(false);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to send image");
      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, id: data.userMessage.id, status: "sent" as const } : msg
        )
      );

      const agentMessage: Message = {
        id: data.message.id,
        type: "agent",
        content: { text: data.message.content },
        timestamp: new Date(data.message.createdAt),
        status: "delivered",
        agentName,
        agentAvatar,
        behaviorData: data.behaviors,
        emotionalData: { state: data.state, emotions: data.emotions, relationLevel: data.relationLevel },
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error("Error sending image:", error);
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "sent" as const } : msg)));
      setIsTyping(false);
    }
  };

  // Send sticker or GIF
  const sendStickerOrGif = async (url: string, type: "sticker" | "gif") => {
    const tempId = `temp-${type}-${Date.now()}`;

    const userMessage: Message = {
      id: tempId,
      type: "user",
      content: { text: type === "sticker" ? "🎭 Sticker" : "🎬 GIF" },
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowStickerGifPicker(false);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: url, userId, messageType: type }),
      });

      if (!response.ok) throw new Error(`Failed to send ${type}`);
      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, id: data.userMessage.id, status: "sent" as const } : msg
        )
      );

      const agentMessage: Message = {
        id: data.message.id,
        type: "agent",
        content: { text: data.message.content },
        timestamp: new Date(data.message.createdAt),
        status: "delivered",
        agentName,
        agentAvatar,
        behaviorData: data.behaviors,
        emotionalData: { state: data.state, emotions: data.emotions, relationLevel: data.relationLevel },
      };

      setMessages((prev) => [...prev, agentMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error(`Error sending ${type}:`, error);
      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? { ...msg, status: "sent" as const } : msg)));
      setIsTyping(false);
    }
  };

  // Search result handler
  const handleSearchResultSelect = (messageId: string) => {
    setHighlightedMessageId(messageId);
    setTimeout(() => setHighlightedMessageId(null), 3000);
  };

  // Export to PDF
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

  // Reset conversation
  const resetConversation = async () => {
    if (isResetting) return;

    setIsResetting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}/conversation/reset`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to reset conversation");

      setMessages([]);
      sessionStorage.removeItem(sessionKey);
      setShowResetConfirm(false);
      window.location.reload();
    } catch (error) {
      console.error("Error resetting conversation:", error);
      alert("Error al resetear la conversación. Intenta de nuevo.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex h-full relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Main Chat Container */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0">
        {/* Header */}
        <ChatHeader
          agentName={agentName}
          agentAvatar={agentAvatar}
          isTyping={isTyping}
          isOnline={true}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSearch={() => setShowSearch(!showSearch)}
          onExport={exportToPDF}
          onReset={() => setShowResetConfirm(true)}
        />

        {/* Search Bar */}
        {showSearch && (
          <ChatSearch
            messages={messages}
            onResultSelect={handleSearchResultSelect}
            onClose={() => setShowSearch(false)}
          />
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                id={message.id}
                content={message.content.text || ""}
                isUser={message.type === "user"}
                timestamp={message.timestamp}
                status={message.status}
                avatar={message.agentAvatar}
                agentName={message.agentName}
                reactions={message.reactions}
              />
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 px-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden shadow-lg">
                  {agentAvatar && (
                    <img src={agentAvatar} alt={agentName} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border border-white/30 shadow-lg">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                        }}
                        className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="px-6 pb-4">
            <VoiceRecorder
              onSend={sendVoiceMessage}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* Image Uploader */}
        {showImageUploader && (
          <div className="px-6 pb-4">
            <ImageUploader
              onSend={sendImageMessage}
              onCancel={() => setShowImageUploader(false)}
            />
          </div>
        )}

        {/* Sticker/GIF Picker */}
        {showStickerGifPicker && (
          <div className="px-6 pb-4 flex justify-center">
            <StickerGifPicker
              onSend={sendStickerOrGif}
              onClose={() => setShowStickerGifPicker(false)}
            />
          </div>
        )}

        {/* Input Area */}
        {!showVoiceRecorder && !showImageUploader && !showStickerGifPicker && (
          <ChatInput
            value={inputMessage}
            onChange={setInputMessage}
            onSend={sendMessage}
            onVoice={() => setShowVoiceRecorder(true)}
            onImage={() => setShowImageUploader(true)}
            onEmoji={() => setShowStickerGifPicker(true)}
          />
        )}
      </div>

      {/* Sidebar with Behavioral & Emotional Data */}
      <aside
        className={cn(
          "relative z-10 border-l transition-all duration-300 overflow-y-auto",
          sidebarOpen ? "w-80" : "w-0",
          "hidden lg:block",
          "bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl",
          "border-white/30 dark:border-gray-700/50"
        )}
      >
        {sidebarOpen && (
          <div className="p-4 space-y-4">
            {/* Emotional State */}
            {latestEmotionalData && (
              <EmotionalStateDisplay
                state={latestEmotionalData.state}
                emotions={latestEmotionalData.emotions}
                relationLevel={latestEmotionalData.relationLevel}
              />
            )}

            {/* Behavior Panel */}
            {latestBehaviorData && (
              <BehaviorPanel
                agentId={agentId}
                behaviorData={latestBehaviorData}
                intensity={latestBehaviorData.intensity}
              />
            )}

            {/* Empty State */}
            {!latestEmotionalData && !latestBehaviorData && (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                  <span className="text-3xl">💭</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Estado Emocional
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Envía un mensaje para ver el estado emocional y comportamiento del agente
                </p>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isResetting && setShowResetConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/30 dark:border-gray-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  ¿Resetear conversación?
                </h3>
                <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
                  Esto borrará <strong>todos los mensajes</strong>, resetará la relación y el estado emocional.
                  Esta acción <strong>no se puede deshacer</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowResetConfirm(false)}
                    disabled={isResetting}
                    className="hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={resetConversation}
                    disabled={isResetting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isResetting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Reseteando...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sí, resetear
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
