/**
 * Real-Time Chat Interface Component
 * WebSocket-powered chat with streaming responses, typing indicators, and presence
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { generateGradient, getInitials } from "@/lib/utils";
import { useChatSocket } from "@/hooks/useSocket";
import { useTyping, useRemoteTyping } from "@/hooks/useTyping";
import { EmotionalSystemPanel } from "./EmotionalSystemPanel";
import type {
  ChatMessageEvent,
  StreamChunkEvent,
  MessageCompleteEvent,
  RelationUpdateEvent,
} from "@/lib/socket/events";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    emotions?: string[];
    relationLevel?: string;
    tokensUsed?: number;
  };
  isStreaming?: boolean;
}

interface RealTimeChatInterfaceProps {
  agentId: string;
  agentName: string;
  userId: string;
  apiKey: string;
  initialMessages?: Message[];
  initialEmotions?: string[];
  initialRelationLevel?: string;
  initialRelationState?: {
    trust: number;
    affinity: number;
    respect: number;
  };
}

export function RealTimeChatInterface({
  agentId,
  agentName,
  userId,
  apiKey,
  initialMessages = [],
  initialEmotions = [],
  initialRelationLevel = "Relación neutral",
  initialRelationState = { trust: 0.5, affinity: 0.5, respect: 0.5 },
}: RealTimeChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [emotions, setEmotions] = useState<string[]>(initialEmotions);
  const [relationLevel, setRelationLevel] = useState(initialRelationLevel);
  const [relationState, setRelationState] = useState(initialRelationState);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket connection
  const { socket, isConnected, sendMessage, sendTyping, on, off } = useChatSocket(
    agentId,
    userId,
    apiKey
  );

  // Typing indicators
  const { isTyping: isUserTyping, startTyping, stopTyping } = useTyping({
    onTypingStart: () => sendTyping(true),
    onTypingStop: () => sendTyping(false),
  });

  const { typingUsers, setUserTyping } = useRemoteTyping();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data: ChatMessageEvent) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.id,
          role: data.role,
          content: data.content,
          metadata: data.metadata,
        },
      ]);
    };

    const handleMessageStream = (data: StreamChunkEvent) => {
      setStreamingMessageId(data.messageId);

      setMessages((prev) => {
        const existing = prev.find(
          (m) => m.id === data.messageId && m.isStreaming
        );

        if (existing) {
          return prev.map((m) =>
            m.id === data.messageId
              ? { ...m, content: m.content + data.chunk }
              : m
          );
        } else {
          return [
            ...prev,
            {
              id: data.messageId,
              role: "assistant",
              content: data.chunk,
              isStreaming: true,
            },
          ];
        }
      });
    };

    const handleMessageComplete = (data: MessageCompleteEvent) => {
      setStreamingMessageId(null);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId
            ? {
                ...m,
                content: data.fullContent,
                metadata: data.metadata,
                isStreaming: false,
              }
            : m
        )
      );

      setEmotions(data.metadata.emotions);
      setRelationLevel(data.metadata.relationLevel);
      setRelationState(data.metadata.state);
    };

    const handleTyping = (data: { isTyping: boolean }) => {
      setUserTyping("agent", data.isTyping);
    };

    const handleRelationUpdate = (data: RelationUpdateEvent) => {
      setEmotions(data.emotions);
      setRelationLevel(data.relationLevel);
      setRelationState(data.state);
    };

    const handleError = (data: { code: string; message: string }) => {
      console.error("[Chat] Error:", data);
      alert(`Error: ${data.message}`);
    };

    on("chat:message", handleMessage);
    on("chat:message:stream", handleMessageStream);
    on("chat:message:complete", handleMessageComplete);
    on("chat:typing", handleTyping);
    on("relation:updated", handleRelationUpdate);
    on("chat:error", handleError);

    return () => {
      off("chat:message", handleMessage);
      off("chat:message:stream", handleMessageStream);
      off("chat:message:complete", handleMessageComplete);
      off("chat:typing", handleTyping);
      off("relation:updated", handleRelationUpdate);
      off("chat:error", handleError);
    };
  }, [socket, on, off, setUserTyping]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !isConnected) return;

    // Add user message optimistically
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: "user",
        content: input,
      },
    ]);

    // Send via WebSocket
    sendMessage(input);

    setInput("");
    stopTyping();
  }, [input, isConnected, sendMessage, stopTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (e.target.value.trim()) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const isAgentTyping = typingUsers.includes("agent");
  const canSend = input.trim() && isConnected && !streamingMessageId;

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-sm text-yellow-600 dark:text-yellow-400">
          Connecting to real-time chat...
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={message.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-4 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar
                className={message.role === "assistant" ? "border-2 border-primary" : ""}
              >
                <AvatarFallback
                  className={
                    message.role === "assistant"
                      ? "bg-gradient-to-br from-primary to-secondary text-white"
                      : "bg-muted"
                  }
                  style={
                    message.role === "assistant"
                      ? { background: generateGradient(agentName) }
                      : undefined
                  }
                >
                  {message.role === "assistant" ? getInitials(agentName) : "U"}
                </AvatarFallback>
              </Avatar>

              <div
                className={`flex-1 max-w-2xl ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block rounded-2xl px-6 py-3 ${
                    message.role === "assistant"
                      ? "bg-card border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {message.content}
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                  )}
                </div>

                {message.metadata?.emotions &&
                  message.metadata.emotions.length > 0 && (
                    <div className="mt-2 flex gap-1 flex-wrap">
                      {message.metadata.emotions.map((emotion, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isAgentTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-4"
          >
            <Avatar className="border-2 border-primary">
              <AvatarFallback
                className="bg-gradient-to-br from-primary to-secondary text-white"
                style={{ background: generateGradient(agentName) }}
              >
                {getInitials(agentName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 max-w-2xl">
              <div className="inline-block rounded-2xl px-6 py-3 bg-card border border-border">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Escribe tu mensaje..."
              className="flex-1"
              disabled={!isConnected || !!streamingMessageId}
            />
            <Button onClick={handleSend} size="icon" disabled={!canSend}>
              {streamingMessageId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Status indicators */}
          <div className="mt-2 text-xs text-muted-foreground">
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full" />
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Emotional System Panel (toggleable) */}
      <EmotionalSystemPanel
        agentName={agentName}
        emotionalState={{
          emotions,
          relationLevel: parseInt(relationLevel) || 50,
          relationState,
        }}
      />
    </div>
  );
}
