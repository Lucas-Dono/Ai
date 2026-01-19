"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GroupMessageBubble } from "./GroupMessageBubble";
import { GroupMessageInput } from "./GroupMessageInput";
import { Loader2, AlertCircle, Hash } from "lucide-react";
import { useGroupSocket } from "@/hooks/useGroupSocket";
import type { GroupMessageEvent, GroupTypingEvent } from "@/lib/socket/events";

interface GroupMessageThreadProps {
  groupId: string;
  currentUserId: string;
  currentUserName: string | null;
  initialMessages?: any[];
  groupName?: string;
  socketToken: string | null;
}

export function GroupMessageThread({
  groupId,
  currentUserId,
  currentUserName,
  initialMessages = [],
  groupName = "este grupo",
  socketToken,
}: GroupMessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [aiResponding, setAiResponding] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);

  // Socket connection for real-time updates
  const {
    isConnected,
    sendTyping,
    onMessage,
    onTyping,
    onAIResponding,
    onAIStopped,
  } = useGroupSocket(groupId, currentUserId, {
    token: socketToken || undefined,
    userName: currentUserName || "Usuario",
  });

  // Subscribe to real-time messages
  useEffect(() => {
    if (!isConnected) return;

    const unsubMessage = onMessage((message: GroupMessageEvent) => {
      // Ignore own messages from socket - they're added via HTTP response
      // This prevents duplicates since the same message arrives from both HTTP and socket
      if (message.authorType === 'user' && message.authorId === currentUserId) {
        return;
      }

      // Avoid duplicates by checking message ID
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    const unsubTyping = onTyping((event: GroupTypingEvent) => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        if (event.isTyping) {
          updated.set(event.userId, event.userName);
        } else {
          updated.delete(event.userId);
        }
        return updated;
      });
    });

    const unsubAIResponding = onAIResponding((data) => {
      setAiResponding(data.agentName);
    });

    const unsubAIStopped = onAIStopped(() => {
      setAiResponding(null);
    });

    return () => {
      unsubMessage();
      unsubTyping();
      unsubAIResponding();
      unsubAIStopped();
    };
  }, [isConnected, onMessage, onTyping, onAIResponding, onAIStopped]);

  // Load initial messages if not provided
  useEffect(() => {
    if (initialMessages.length === 0) {
      loadMessages();
    }
  }, [groupId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      scrollToBottom();
    }
  }, [messages.length]);

  const loadMessages = async (before?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = before
        ? `/api/groups/${groupId}/messages?before=${before}&limit=50`
        : `/api/groups/${groupId}/messages?limit=50`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Error al cargar mensajes");
      }

      const data = await response.json();

      if (before) {
        // Prepend older messages
        setMessages((prev) => [...data.messages, ...prev]);
        setHasMore(data.hasMore);

        // Maintain scroll position
        requestAnimationFrame(() => {
          if (scrollContainerRef.current) {
            const newScrollHeight = scrollContainerRef.current.scrollHeight;
            scrollContainerRef.current.scrollTop =
              newScrollHeight - previousScrollHeight.current;
          }
        });
      } else {
        // Initial load
        setMessages(data.messages);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("No se pudieron cargar los mensajes");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreMessages = useCallback(() => {
    if (isLoading || !hasMore || messages.length === 0) return;

    if (scrollContainerRef.current) {
      previousScrollHeight.current = scrollContainerRef.current.scrollHeight;
    }

    const oldestMessage = messages[0];
    loadMessages(oldestMessage.id);
  }, [isLoading, hasMore, messages]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop } = scrollContainerRef.current;

    // Load more when scrolled near top
    if (scrollTop < 100 && hasMore && !isLoading) {
      loadMoreMessages();
    }
  }, [hasMore, isLoading, loadMoreMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (
    content: string,
    replyToId?: string,
    contentType?: string,
    mediaUrl?: string
  ) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          replyToId,
          contentType: contentType || "text",
          mediaUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar mensaje");
      }

      const data = await response.json();

      // Add message optimistically
      setMessages((prev) => [...prev, data.message]);

      // Clear reply
      setReplyingTo(null);
    } catch (err: any) {
      console.error("Error sending message:", err);
      alert(err.message || "Error al enviar mensaje");
    }
  };

  const handleReply = (message: any) => {
    const authorName =
      message.authorType === "user"
        ? message.user?.name
        : message.agent?.name;

    setReplyingTo({
      id: message.id,
      content: message.content,
      authorName: authorName || "Usuario",
    });
  };

  if (error && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => loadMessages()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto relative"
        style={{ backgroundColor: '#171717' }}
      >
        <div className="px-4 py-4">
          {/* Welcome message */}
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-500 mb-8">
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                <Hash size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Bienvenido a #{groupName}</h3>
              <p className="text-sm max-w-md">Este es el comienzo de tu historial de mensajes.</p>
            </div>
          )}

          {/* Load more indicator */}
          {hasMore && messages.length > 0 && (
            <div className="flex justify-center py-4">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              ) : (
                <button
                  onClick={loadMoreMessages}
                  className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cargar mensajes anteriores
                </button>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <GroupMessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onReply={handleReply}
            />
          ))}

          {/* Typing indicator */}
          {(typingUsers.size > 0 || aiResponding) && (
            <div className="px-2 py-2 text-xs text-neutral-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span>
                {aiResponding
                  ? `${aiResponding} está pensando...`
                  : typingUsers.size === 1
                  ? `${Array.from(typingUsers.values())[0]} está escribiendo...`
                  : typingUsers.size === 2
                  ? `${Array.from(typingUsers.values()).join(" y ")} están escribiendo...`
                  : `${typingUsers.size} personas están escribiendo...`}
              </span>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <GroupMessageInput
        groupId={groupId}
        onSend={handleSendMessage}
        onTyping={sendTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        placeholder="Envía un mensaje..."
      />
    </div>
  );
}
