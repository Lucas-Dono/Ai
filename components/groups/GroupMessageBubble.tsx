"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bot, User, Info } from "lucide-react";
import { useState } from "react";

interface GroupMessageBubbleProps {
  message: {
    id: string;
    content: string;
    authorType: string;
    isSystemMessage?: boolean;
    createdAt: Date;
    user?: {
      id: string;
      name: string | null;
      image: string | null;
    } | null;
    agent?: {
      id: string;
      name: string;
      avatar: string | null;
    } | null;
    replyTo?: {
      id: string;
      content: string;
      authorType: string;
      user?: {
        name: string | null;
      } | null;
      agent?: {
        name: string;
      } | null;
    } | null;
  };
  currentUserId?: string;
  onReply?: (message: any) => void;
}

export function GroupMessageBubble({
  message,
  currentUserId,
  onReply,
}: GroupMessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);

  // System messages
  if (message.isSystemMessage) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground">
          <Info className="w-3 h-3" />
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  const isOwnMessage =
    message.authorType === "user" && message.user?.id === currentUserId;
  const isAIMessage = message.authorType === "agent";

  const authorName = isAIMessage ? message.agent?.name : message.user?.name;
  const authorAvatar = isAIMessage ? message.agent?.avatar : message.user?.image;

  return (
    <div
      className={`flex gap-3 py-2 px-4 hover:bg-muted/30 transition-colors ${
        isOwnMessage ? "flex-row-reverse" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {authorAvatar ? (
          <img
            src={authorAvatar}
            alt={authorName || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            {isAIMessage ? (
              <Bot className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-primary" />
            )}
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? "items-end" : ""}`}>
        {/* Author name and timestamp */}
        <div
          className={`flex items-baseline gap-2 mb-1 ${
            isOwnMessage ? "flex-row-reverse" : ""
          }`}
        >
          <span className="font-medium text-sm">
            {authorName || "Usuario"}
            {isAIMessage && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold rounded">
                IA
              </span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>

        {/* Reply preview */}
        {message.replyTo && (
          <div
            className={`mb-2 pl-3 border-l-2 border-primary/40 text-xs text-muted-foreground ${
              isOwnMessage ? "text-right border-r-2 border-l-0 pr-3 pl-0" : ""
            }`}
          >
            <div className="font-medium">
              {message.replyTo.authorType === "user"
                ? message.replyTo.user?.name
                : message.replyTo.agent?.name}
            </div>
            <div className="line-clamp-1">{message.replyTo.content}</div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative inline-block max-w-[80%] px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : isAIMessage
              ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-bl-sm"
              : "bg-muted rounded-bl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {/* Action buttons (on hover) */}
          {showActions && onReply && (
            <button
              onClick={() => onReply(message)}
              className={`absolute -top-2 ${
                isOwnMessage ? "-left-2" : "-right-2"
              } p-1 bg-background border border-border rounded-full shadow-sm hover:bg-muted transition-colors opacity-0 group-hover:opacity-100`}
              title="Responder"
            >
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
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
