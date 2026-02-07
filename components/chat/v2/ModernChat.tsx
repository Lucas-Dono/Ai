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
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { AlertTriangle, Trash2, AlertCircle, Zap } from "lucide-react";
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
import { RelationshipProgressBar } from "@/components/bonds/RelationshipProgressBar";
import {
  BondMilestoneNotification,
  useBondMilestones,
} from "@/components/bonds/BondMilestoneNotification";
import { useBondMilestoneDetector } from "@/hooks/useBondMilestoneDetector";
import { BondRiskAlert } from "@/components/bonds/BondRiskAlert";
import { useBondProgress } from "@/hooks/useBondProgress";
import { ChatSearch } from "@/components/chat/ChatSearch";
import { exportConversationToPDF } from "@/lib/utils/pdf-export";
import { TokenUsageDisplay } from "@/components/upgrade/TokenUsageDisplay";
import {
  UpgradeNotificationUI,
  useUpgradeNotifications,
} from "@/components/upgrade/UpgradeNotification";
import { getUpgradeNotification } from "@/lib/usage/upgrade-prompts";
import { Sparkles, useEmotionalSparkles } from "@/components/effects/Sparkles";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";
import { ProactiveMessageNotification } from "@/components/chat/ProactiveMessageNotification";

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
  const router = useRouter();
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Behavioral and emotional tracking
  const [latestBehaviorData, setLatestBehaviorData] = useState<Message["behaviorData"] | null>(null);
  const [latestEmotionalData, setLatestEmotionalData] = useState<Message["emotionalData"] | null>(null);

  // Upgrade notifications
  const {
    notification,
    showNotification,
    dismissNotification,
  } = useUpgradeNotifications();

  // Sparkles for first message and milestones
  const { showSparkles, sparklesConfig, triggerSparkles } = useEmotionalSparkles();

  // Upgrade modal for limit reached
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeContext, setUpgradeContext] = useState<{
    type: "limit_reached" | "feature_locked" | "voluntary";
    message?: string;
    limitType?: "messages" | "agents" | "worlds" | "images";
  } | undefined>();

  // PHASE 5: Quick Win #3 - Visual limit warning
  const [usageStats, setUsageStats] = useState<{
    current: number;
    limit: number;
    period: string;
  } | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");

  // Bond milestone notifications
  const {
    currentMilestone,
    showMilestone,
    dismissMilestone,
  } = useBondMilestones();

  // Detect bond milestones automatically
  useBondMilestoneDetector({
    agentId,
    agentName,
    agentAvatar,
    onMilestone: showMilestone,
    enabled: true,
  });

  // Get bond progress for risk alerts
  const { bondProgress } = useBondProgress(agentId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  // Auto-scroll
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent body scroll when chat is mounted
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load messages from backend (with sessionStorage fallback)
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Try to load from backend first (last 50 messages for performance)
        const res = await fetch(`/api/agents/${agentId}/message?limit=50`);

        if (res.ok) {
          const data = await res.json();
          const loadedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            type: msg.role === 'user' ? 'user' : 'agent',
            content: { text: msg.content },
            timestamp: new Date(msg.createdAt),
            metadata: msg.metadata,
            // Add agent info for all non-user messages
            ...(msg.role !== 'user' && {
              agentName: msg.agentName,
              agentAvatar: msg.agentAvatar,
            }),
          }));

          console.log(`[ModernChat] Loaded ${loadedMessages.length} messages from backend`);
          setMessages(loadedMessages);
          return;
        }

        // Fallback to sessionStorage if backend fails
        console.warn('[ModernChat] Failed to load from backend, trying sessionStorage');
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
        console.error('[ModernChat] Error loading messages:', error);

        // Final fallback to sessionStorage
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
        } catch (fallbackError) {
          console.error('[ModernChat] Fallback also failed:', fallbackError);
        }
      }
    };

    loadMessages();
  }, [agentId, sessionKey]);

  // PHASE 5: Quick Win #3 - Fetch usage stats for limit warning
  useEffect(() => {
    const fetchUsageStats = async () => {
      try {
        const response = await fetch("/api/billing/usage");
        if (response.ok) {
          const data = await response.json();
          setUsageStats(data.messages);

          // Fetch user plan from session or API
          const sessionResponse = await fetch("/api/auth/session");
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setUserPlan(sessionData?.user?.plan || "free");
          }
        }
      } catch (error) {
        console.error("[ModernChat] Error fetching usage stats:", error);
      }
    };

    fetchUsageStats();
    // Refresh every minute
    const interval = setInterval(fetchUsageStats, 60000);
    return () => clearInterval(interval);
  }, []);

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

  // Load initial emotional and behavioral state from server
  useEffect(() => {
    const loadAgentState = async () => {
      try {
        const res = await fetch(`/api/agents/${agentId}/state`);
        if (res.ok) {
          const data = await res.json();

          if (data.emotional) {
            setLatestEmotionalData(data.emotional);
          }

          if (data.behavior) {
            setLatestBehaviorData(data.behavior);
          }

          console.log('[ModernChat] Loaded agent state from server:', data);
        }
      } catch (error) {
        console.error('[ModernChat] Error loading agent state:', error);
      }
    };

    loadAgentState();
  }, [agentId]);

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

    const onAgentMessage = (data: any) => {
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
    };

    const onAgentTyping = (data: { agentId: string; isTyping: boolean }) => {
      if (data.agentId === agentId) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("agent:message", onAgentMessage);
    socket.on("agent:typing", onAgentTyping);

    socket.emit("join:agent:room", { agentId });

    return () => {
      socket.emit("leave:agent:room", { agentId });
      socket.off("agent:message", onAgentMessage);
      socket.off("agent:typing", onAgentTyping);
    };
  }, [socket, agentId, agentName, agentAvatar]);

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageText = inputMessage;
    const tempId = `temp-${Date.now()}`;

    // Check for first message or milestones
    const currentMessageCount = messages.filter(m => m.type === "user").length;
    const isFirstMessage = currentMessageCount === 0;
    const isMilestone = [10, 50, 100].includes(currentMessageCount + 1);

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

    // Trigger sparkles for special moments
    if (isFirstMessage) {
      triggerSparkles({ emotion: "excitement", intensity: 8, duration: 2 });
    } else if (isMilestone) {
      triggerSparkles({ emotion: "achievement", intensity: 7, duration: 1.5 });
    }

    // Track message for recommendations (silently, don't block UX)
    fetch("/api/recommendations/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        itemType: "agent",
        itemId: agentId,
        interactionType: "message",
        messageCount: 1,
      }),
    }).catch(() => {}); // Silent fail

    try {
      const response = await fetch(`/api/agents/${agentId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Check if it's a limit reached error
        if (response.status === 429 || errorData.error?.includes("límite") || errorData.error?.includes("limit")) {
          setUpgradeContext({
            type: "limit_reached",
            limitType: "messages",
            message: errorData.error || "Has alcanzado tu límite diario de mensajes",
          });
          setShowUpgradeModal(true);
          throw new Error(errorData.error || "Límite alcanzado");
        }

        throw new Error(errorData.error || "Failed to send message");
      }

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
        body: JSON.stringify({ content: url, messageType: type }),
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

  // Delete agent
  const deleteAgent = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete agent");
      }

      // Redirect to dashboard after successful deletion
      router.push("/dashboard");
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert(error instanceof Error ? error.message : "Error al eliminar el agente. Intenta de nuevo.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden overscroll-none">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

      {/* Animated mesh gradient - Hidden on mobile for performance */}
      <div className="absolute inset-0 opacity-30 hidden md:block">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      {/* Main Chat Container */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 w-full md:w-auto">
        {/* Upgrade Notification (if active) */}
        {notification && (
          <UpgradeNotificationUI
            notification={notification}
            onDismiss={dismissNotification}
            onPrimaryAction={() => router.push('/pricing')}
          />
        )}

        {/* Header */}
        <ChatHeader
          agentName={agentName}
          agentAvatar={agentAvatar}
          agentId={agentId}
          isTyping={isTyping}
          isOnline={true}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSearch={() => setShowSearch(!showSearch)}
          onExport={exportToPDF}
          onReset={() => setShowResetConfirm(true)}
          onDelete={() => setShowDeleteConfirm(true)}
        />

        {/* PHASE 5: Quick Win #3 - Visual Limit Warning Banner */}
        {usageStats && (
          (() => {
            const messagesLeft = usageStats.limit - usageStats.current;
            const shouldShowWarning = messagesLeft <= 5 && messagesLeft > 0;
            const isAtLimit = messagesLeft <= 0;

            if (!shouldShowWarning && !isAtLimit) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "mx-3 md:mx-4 mt-3 p-4 rounded-xl border-2 shadow-lg backdrop-blur-md",
                  isAtLimit
                    ? "bg-red-500/10 border-red-500/30 dark:bg-red-500/20"
                    : messagesLeft === 1
                    ? "bg-red-500/10 border-red-500/30 dark:bg-red-500/20"
                    : messagesLeft <= 3
                    ? "bg-orange-500/10 border-orange-500/30 dark:bg-orange-500/20"
                    : "bg-yellow-500/10 border-yellow-500/30 dark:bg-yellow-500/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      isAtLimit || messagesLeft === 1
                        ? "bg-red-500/20"
                        : messagesLeft <= 3
                        ? "bg-orange-500/20"
                        : "bg-yellow-500/20"
                    )}
                  >
                    <AlertCircle
                      className={cn(
                        "w-5 h-5",
                        isAtLimit || messagesLeft === 1
                          ? "text-red-600 dark:text-red-400"
                          : messagesLeft <= 3
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className={cn(
                        "font-semibold mb-1",
                        isAtLimit || messagesLeft === 1
                          ? "text-red-700 dark:text-red-300"
                          : messagesLeft <= 3
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-yellow-700 dark:text-yellow-300"
                      )}
                    >
                      {isAtLimit
                        ? "¡Límite alcanzado!"
                        : messagesLeft === 1
                        ? "¡Último mensaje!"
                        : `${messagesLeft} mensajes restantes`}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {isAtLimit
                        ? `Has alcanzado tu límite de ${usageStats.limit} mensajes ${usageStats.period === "day" ? "diarios" : "mensuales"}.`
                        : `Estás cerca de tu límite ${usageStats.period === "day" ? "diario" : "mensual"} de ${usageStats.limit} mensajes.`}
                      {userPlan === "free" && " Actualiza a Plus para continuar sin interrupciones."}
                    </p>
                    {userPlan === "free" && (
                      <Button
                        size="sm"
                        onClick={() => setShowUpgradeModal(true)}
                        className={cn(
                          "text-white",
                          isAtLimit || messagesLeft === 1
                            ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                            : messagesLeft <= 3
                            ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                            : "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800"
                        )}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {isAtLimit ? "Actualizar Ahora" : "Ver Planes"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()
        )}

        {/* Token Usage Warning (only shows when approaching limit) */}
        <TokenUsageDisplay
          showUpgradeHint={true}
          onUpgradeClick={() => router.push('/dashboard/billing')}
        />

        {/* Proactive Messages - Mensajes iniciados por la IA */}
        <ProactiveMessageNotification
          agentId={agentId}
          agentName={agentName}
          inline={true}
          className="mx-3 md:mx-4 mt-3"
          onMessageClick={(message) => {
            console.log('[ModernChat] Usuario interactuó con mensaje proactivo:', message);
            // El mensaje proactivo se mostrará como parte del chat
            // No necesitamos agregarlo manualmente ya que se renderiza inline
          }}
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
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6 space-y-2 overscroll-none safe-area-inset-bottom">
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
          <div className="px-3 md:px-6 pb-3 md:pb-4 safe-area-inset-bottom">
            <VoiceRecorder
              onSend={sendVoiceMessage}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          </div>
        )}

        {/* Image Uploader */}
        {showImageUploader && (
          <div className="px-3 md:px-6 pb-3 md:pb-4 safe-area-inset-bottom">
            <ImageUploader
              onSend={sendImageMessage}
              onCancel={() => setShowImageUploader(false)}
            />
          </div>
        )}

        {/* Sticker/GIF Picker */}
        {showStickerGifPicker && (
          <div className="px-3 md:px-6 pb-3 md:pb-4 flex justify-center safe-area-inset-bottom">
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

      {/* Sidebar with Behavioral & Emotional Data - Desktop Only */}
      <aside
        className={cn(
          "relative z-10 border-l transition-all duration-300 overflow-y-auto",
          sidebarOpen ? "w-80" : "w-0",
          "hidden lg:block",
          "bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl",
          "border-white/30 dark:border-gray-700/50",
          "max-h-screen"
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

            {/* Bond Risk Alert - Shows when bond is at risk */}
            {bondProgress?.hasBond && bondProgress.status && bondProgress.status !== 'active' && (
              <BondRiskAlert
                status={bondProgress.status}
                agentName={agentName}
                daysInactive={bondProgress.durationDays}
                onAction={() => {
                  // Scroll to input to encourage messaging
                  const input = document.querySelector('textarea');
                  if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
              />
            )}

            {/* Relationship Progress */}
            <RelationshipProgressBar
              agentId={agentId}
              variant="detailed"
            />

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

      {/* Delete Agent Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
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
                  ¿Eliminar agente permanentemente?
                </h3>
                <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
                  Esto eliminará <strong>el agente {agentName}</strong> y <strong>todos sus datos</strong> (mensajes, relación, comportamientos, etc.).
                  Esta acción <strong>no se puede deshacer</strong>.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="hover:bg-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={deleteAgent}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Eliminando...
                      </div>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sí, eliminar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sparkles for first message and milestones */}
      <Sparkles show={showSparkles} {...sparklesConfig} />

      {/* Upgrade Modal for limit reached */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentPlan="free" // TODO: Get from user session
        onUpgrade={async (planId) => {
          // Redirect to checkout
          const response = await fetch("/api/billing/checkout-unified", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ planId, interval: "month" }),
          });

          if (response.ok) {
            const { checkoutUrl } = await response.json();
            window.location.href = checkoutUrl;
          }
        }}
        context={upgradeContext}
      />

      {/* Bond Milestone Notifications */}
      <BondMilestoneNotification
        milestone={currentMilestone}
        onClose={dismissMilestone}
      />
    </div>
  );
}
