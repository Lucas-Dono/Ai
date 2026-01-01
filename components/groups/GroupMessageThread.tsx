"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GroupMessageBubble } from "./GroupMessageBubble";
import { GroupMessageInput } from "./GroupMessageInput";
import { Loader2, AlertCircle, Hash } from "lucide-react";

interface GroupMessageThreadProps {
  groupId: string;
  currentUserId: string;
  initialMessages?: any[];
  groupName?: string;
}

export function GroupMessageThread({
  groupId,
  currentUserId,
  initialMessages = [],
  groupName = "este grupo",
}: GroupMessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);

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

  const handleSendMessage = async (content: string, replyToId?: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          replyToId,
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

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <GroupMessageInput
        groupId={groupId}
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        placeholder="Envía un mensaje..."
      />
    </div>
  );
}
