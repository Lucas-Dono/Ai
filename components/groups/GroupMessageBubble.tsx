"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bot, Info } from "lucide-react";
import { useState } from "react";

interface GroupMessageBubbleProps {
  message: {
    id: string;
    content: string;
    contentType?: string;
    mediaUrl?: string | null;
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
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 rounded-full text-xs text-neutral-400">
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
      className={`flex gap-4 mb-6 ${isOwnMessage ? "flex-row-reverse" : ""} group relative z-10`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isAIMessage ? (
          <div className="relative">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName || "AI"}
                className="w-10 h-10 rounded-full object-cover border border-neutral-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center border border-neutral-700">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white p-[2px] rounded-full border-2 border-neutral-900">
              <Bot size={10} />
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 font-bold border border-neutral-600">
            TU
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`max-w-[70%] flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Author name and timestamp */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`font-medium text-sm ${isAIMessage ? 'text-indigo-400' : 'text-white'}`}>
            {isOwnMessage ? `Tú (${authorName || "Usuario"})` : authorName || "Usuario"}
          </span>
          <span className="text-[10px] text-neutral-500">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>

        {/* Reply preview */}
        {message.replyTo && (
          <div className="mb-2 pl-3 border-l-2 border-indigo-500/40 text-xs text-neutral-400">
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
          className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm
            ${isOwnMessage
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-[#262626] text-neutral-100 rounded-tl-sm border border-neutral-700'
            }`}
        >
          {/* Render based on content type */}
          {message.contentType === "gif" && message.mediaUrl ? (
            <div className="max-w-xs">
              <img
                src={message.mediaUrl}
                alt="GIF"
                className="rounded-lg w-full"
                loading="lazy"
              />
            </div>
          ) : message.contentType === "sticker" ? (
            <div className="text-6xl">{message.content}</div>
          ) : message.contentType === "emoji" ? (
            <div className="text-4xl">{message.content}</div>
          ) : message.contentType === "image" && message.mediaUrl ? (
            <div className="max-w-sm">
              <img
                src={message.mediaUrl}
                alt="Imagen"
                className="rounded-lg w-full"
                loading="lazy"
              />
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
