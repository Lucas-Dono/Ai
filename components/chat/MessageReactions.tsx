"use client";

/**
 * Message Reactions Component
 *
 * Sistema de reacciones a mensajes tipo WhatsApp/iMessage
 * - Emojis rápidos
 * - Selector de emojis completo
 * - Contador de reacciones
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  reacted: boolean;
}

interface MessageReactionsProps {
  reactions: Reaction[];
  onReact: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  compact?: boolean;
}

const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "🔥", "👍"];

const EMOJI_CATEGORIES = {
  "Emociones": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "😍", "🥰", "😘", "😗", "😙", "😚", "🤗", "🤩", "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣", "😥", "😮", "🤐", "😯", "😪", "😫", "😴", "😌", "😛", "😜", "😝", "🤤", "😒", "😓", "😔", "😕", "🙃", "🤑", "😲", "☹️", "🙁", "😖", "😞", "😟", "😤", "😢", "😭", "😦", "😧", "😨", "😩", "🤯", "😬", "😰", "😱", "🥵", "🥶"],
  "Gestos": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
  "Corazones": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
  "Símbolos": ["✨", "⭐", "🌟", "💫", "🔥", "💯", "💢", "💥", "💨", "💦", "🎉", "🎊", "🎁", "🎈"],
};

export function MessageReactions({
  reactions,
  onReact,
  onRemoveReaction,
  compact = false,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReactionClick = (emoji: string) => {
    const existing = reactions.find((r) => r.emoji === emoji);
    if (existing?.reacted) {
      onRemoveReaction(emoji);
    } else {
      onReact(emoji);
    }
    setShowPicker(false);
  };

  if (compact) {
    // Vista compacta - solo mostrar reacciones existentes
    if (reactions.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            onClick={() => handleReactionClick(reaction.emoji)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
              reaction.reacted
                ? "bg-blue-600/20 border border-blue-600"
                : "bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#3a3a3a]"
            )}
          >
            <span>{reaction.emoji}</span>
            <span className="text-gray-400">{reaction.count}</span>
          </button>
        ))}
      </div>
    );
  }

  // Vista completa con selector
  return (
    <div className="relative">
      {/* Quick reactions */}
      <div className="flex items-center gap-1 mb-2">
        {QUICK_REACTIONS.map((emoji) => {
          const reaction = reactions.find((r) => r.emoji === emoji);
          return (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              onClick={() => handleReactionClick(emoji)}
              className={cn(
                "h-8 w-8 p-0 text-lg hover:bg-[#2a2a2a]",
                reaction?.reacted && "bg-blue-600/20"
              )}
            >
              {emoji}
              {reaction && reaction.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {reaction.count}
                </span>
              )}
            </Button>
          );
        })}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPicker(!showPicker)}
          className="h-8 w-8 p-0 hover:bg-[#2a2a2a]"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Emoji picker */}
      {showPicker && (
        <div className="absolute left-0 top-full mt-2 bg-[#1f1f1f] border border-[#2a2a2a] rounded-2xl p-3 shadow-xl z-50 max-w-sm">
          <div className="max-h-60 overflow-y-auto space-y-3">
            {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
              <div key={category}>
                <h4 className="text-xs text-gray-400 mb-1 font-semibold">
                  {category}
                </h4>
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReactionClick(emoji)}
                      className="h-8 w-8 text-lg hover:bg-[#2a2a2a] rounded transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
