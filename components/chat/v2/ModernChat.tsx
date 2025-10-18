/**
 * Modern Chat Component
 *
 * Complete redesign of WhatsAppChat with:
 * - Glassmorphism UI
 * - Smooth animations
 * - Better component structure
 * - Improved UX
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";
import type { Message } from "@/components/chat/WhatsAppChat";

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
          onSearch={() => {}}
          onExport={() => {}}
          onReset={() => {}}
        />

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

        {/* Input Area */}
        <ChatInput
          value={inputMessage}
          onChange={setInputMessage}
          onSend={sendMessage}
          onVoice={() => {}}
          onImage={() => {}}
          onEmoji={() => {}}
        />
      </div>
    </div>
  );
}
