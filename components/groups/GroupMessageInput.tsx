"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";

interface GroupMessageInputProps {
  groupId: string;
  onSend: (content: string, replyToId?: string) => Promise<void>;
  replyingTo?: {
    id: string;
    content: string;
    authorName: string;
  } | null;
  onCancelReply?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function GroupMessageInput({
  groupId,
  onSend,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = "Escribe un mensaje...",
}: GroupMessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [content]);

  // Focus on reply
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmedContent, replyingTo?.id);
      setContent("");
      if (onCancelReply) {
        onCancelReply();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-background">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-start gap-2 px-4 py-2 bg-muted/50 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span>Respondiendo a {replyingTo.authorName}</span>
            </div>
            <p className="text-sm text-foreground/80 line-clamp-2 pl-5">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-background rounded transition-colors"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="flex-1 resize-none bg-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed max-h-[200px]"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!content.trim() || disabled || isSending}
          className="flex-shrink-0 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:bg-primary"
          title="Enviar (Enter)"
        >
          <Send className={`w-5 h-5 ${isSending ? "animate-pulse" : ""}`} />
        </button>
      </div>

      {/* Helper text */}
      <div className="px-4 pb-2 text-xs text-muted-foreground">
        Presiona <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Enter</kbd>{" "}
        para enviar, <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">Shift+Enter</kbd>{" "}
        para nueva línea
      </div>
    </div>
  );
}
