"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GroupMessageBubble } from "./GroupMessageBubble";
import { GroupMessageInput } from "./GroupMessageInput";
import { Loader2, AlertCircle } from "lucide-react";

interface GroupMessageThreadProps {
  groupId: string;
  currentUserId: string;
  initialMessages?: any[];
}

export function GroupMessageThread({
  groupId,
  currentUserId,
  initialMessages = [],
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
        className="flex-1 overflow-y-auto"
      >
        {/* Load more indicator */}
        {hasMore && (
          <div className="flex justify-center py-4">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <button
                onClick={loadMoreMessages}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cargar mensajes anteriores
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="space-y-1">
          {messages.map((message) => (
            <GroupMessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onReply={handleReply}
            />
          ))}
        </div>

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">
                No hay mensajes todavía
              </p>
              <p className="text-sm text-muted-foreground">
                Sé el primero en enviar un mensaje
              </p>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <GroupMessageInput
        groupId={groupId}
        onSend={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  );
}
