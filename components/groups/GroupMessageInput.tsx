"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip, Smile } from "lucide-react";
import { EmojiPickerComponent } from "@/components/chat/EmojiPickerComponent";
import { StickerGifPicker } from "@/components/chat/StickerGifPicker";

interface GroupMessageInputProps {
  groupId: string;
  onSend: (
    content: string,
    replyToId?: string,
    contentType?: string,
    mediaUrl?: string
  ) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
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
  onTyping,
  replyingTo,
  onCancelReply,
  disabled = false,
  placeholder = "Escribe un mensaje...",
}: GroupMessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerGifPicker, setShowStickerGifPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

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

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && onTyping) {
        onTyping(false);
      }
    };
  }, [onTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Typing indicator logic
    if (onTyping) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing start if not already typing
      if (newContent.length > 0 && !isTypingRef.current) {
        isTypingRef.current = true;
        onTyping(true);
      }

      // Set timeout to stop typing after 2 seconds of inactivity
      if (newContent.length > 0) {
        typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          onTyping(false);
        }, 2000);
      } else {
        // If content is empty, stop typing immediately
        if (isTypingRef.current) {
          isTypingRef.current = false;
          onTyping(false);
        }
      }
    }
  };

  const handleSend = async (
    messageContent?: string,
    messageContentType?: string,
    messageMediaUrl?: string
  ) => {
    const contentToSend = messageContent || content.trim();
    const contentTypeToSend = messageContentType || "text";

    if (!contentToSend || isSending) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current && onTyping) {
      isTypingRef.current = false;
      onTyping(false);
    }

    setIsSending(true);
    try {
      await onSend(contentToSend, replyingTo?.id, contentTypeToSend, messageMediaUrl);
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

  const handleEmojiSelect = (emoji: string) => {
    setContent((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleStickerOrGifSend = async (url: string, type: "sticker" | "gif") => {
    await handleSend(type === "sticker" ? url : "GIF", type, url);
    setShowStickerGifPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-white/5 z-20 shrink-0" style={{ backgroundColor: '#171717' }}>
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-start gap-2 px-4 py-2 bg-neutral-800/50 border-b border-neutral-700 mb-2 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-neutral-400 mb-0.5">
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
            <p className="text-sm text-neutral-200 line-clamp-2 pl-5">
              {replyingTo.content}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-neutral-700 rounded transition-colors text-neutral-400"
            title="Cancelar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="max-w-4xl mx-auto relative">
        <div className="flex items-end gap-3 bg-neutral-800/50 p-2 rounded-xl border border-neutral-700 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
          <button
            onClick={() => setShowStickerGifPicker(!showStickerGifPicker)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-lg transition-colors"
            title="Stickers y GIFs"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-neutral-500 resize-none py-2 max-h-32 min-h-[44px] focus:outline-none"
            rows={1}
          />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 text-neutral-400 hover:text-yellow-400 hover:bg-neutral-700 rounded-lg transition-colors"
              title="Emojis"
            >
              <Smile size={20} />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={!content.trim() || disabled || isSending}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
              title="Enviar (Enter)"
            >
              <Send size={18} className={isSending ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-0 z-50">
            <div className="bg-neutral-900 rounded-lg shadow-xl border border-neutral-700 p-2">
              <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
            </div>
          </div>
        )}

        {/* Sticker & GIF Picker */}
        {showStickerGifPicker && (
          <div className="absolute bottom-full mb-2 left-0 z-50">
            <StickerGifPicker
              onSend={handleStickerOrGifSend}
              onClose={() => setShowStickerGifPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
