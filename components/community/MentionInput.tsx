"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentionUser {
  id: string;
  name: string | null;
  image: string | null;
  canMention: boolean;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface MentionInputRef {
  focus: () => void;
  blur: () => void;
  insertMention: (user: MentionUser) => void;
}

// Regex para encontrar menciones en el texto @[nombre](userId)
const MENTION_REGEX = /@\[([^\]]+)\]\(([^)]+)\)/g;

// Regex para detectar @ al escribir
const TRIGGER_REGEX = /@(\w*)$/;

export const MentionInput = forwardRef<MentionInputRef, MentionInputProps>(
  (
    {
      value,
      onChange,
      placeholder = "Escribe un comentario...",
      className,
      minHeight = 80,
      maxHeight = 200,
      disabled = false,
      autoFocus = false,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [triggerPosition, setTriggerPosition] = useState<{
      top: number;
      left: number;
    } | null>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
      insertMention: (user: MentionUser) => {
        if (user.canMention) {
          insertMentionAtCursor(user);
        }
      },
    }));

    // Fetch suggestions
    const fetchSuggestions = useCallback(async (query: string) => {
      if (!query) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/mentions/autocomplete?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.users || []);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    }, []);

    // Debounced fetch
    useEffect(() => {
      if (!searchQuery) {
        setSuggestions([]);
        return;
      }

      const timer = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 200);

      return () => clearTimeout(timer);
    }, [searchQuery, fetchSuggestions]);

    // Handle text change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPosition = e.target.selectionStart;

      // Check if we're typing a mention
      const textBeforeCursor = newValue.slice(0, cursorPosition);
      const match = textBeforeCursor.match(TRIGGER_REGEX);

      if (match) {
        setSearchQuery(match[1]);
        setShowSuggestions(true);

        // Calculate position for suggestions
        if (textareaRef.current) {
          // Simple positioning - show below textarea
          const rect = textareaRef.current.getBoundingClientRect();
          setTriggerPosition({
            top: rect.height + 4,
            left: 0,
          });
        }
      } else {
        setShowSuggestions(false);
        setSearchQuery("");
      }

      // Extract mentions from text
      const mentions: string[] = [];
      let mentionMatch;
      while ((mentionMatch = MENTION_REGEX.exec(newValue)) !== null) {
        mentions.push(mentionMatch[2]); // userId
      }

      onChange(newValue, mentions);
    };

    // Insert mention at cursor
    const insertMentionAtCursor = (user: MentionUser) => {
      if (!textareaRef.current || !user.canMention) return;

      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const textAfterCursor = value.slice(cursorPosition);

      // Find the @ trigger position
      const match = textBeforeCursor.match(TRIGGER_REGEX);
      if (!match) return;

      const triggerStart = textBeforeCursor.lastIndexOf("@");
      const beforeTrigger = value.slice(0, triggerStart);
      const mentionText = `@[${user.name || "Usuario"}](${user.id})`;

      const newValue = beforeTrigger + mentionText + " " + textAfterCursor;

      // Extract mentions
      const mentions: string[] = [];
      let mentionMatch;
      while ((mentionMatch = MENTION_REGEX.exec(newValue)) !== null) {
        mentions.push(mentionMatch[2]);
      }

      onChange(newValue, mentions);
      setShowSuggestions(false);
      setSearchQuery("");

      // Restore focus
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = beforeTrigger.length + mentionText.length + 1;
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Enter":
        case "Tab":
          if (suggestions[selectedIndex]?.canMention) {
            e.preventDefault();
            insertMentionAtCursor(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setShowSuggestions(false);
          setSearchQuery("");
          break;
      }
    };

    // Close suggestions when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          suggestionsRef.current &&
          !suggestionsRef.current.contains(e.target as Node) &&
          textareaRef.current &&
          !textareaRef.current.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name: string | null) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Render display value (convert mentions to visible @name format)
    const getDisplayValue = () => {
      return value.replace(MENTION_REGEX, "@$1");
    };

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={getDisplayValue()}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            "resize-none transition-all",
            className
          )}
          style={{
            minHeight,
            maxHeight,
          }}
        />

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && (suggestions.length > 0 || isLoading) && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full max-h-48 overflow-y-auto bg-popover border border-border rounded-xl shadow-lg mt-1"
              style={triggerPosition ? { top: triggerPosition.top } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="py-1">
                  {suggestions.map((user, index) => (
                    <button
                      key={user.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                        index === selectedIndex
                          ? "bg-accent"
                          : "hover:bg-accent/50",
                        !user.canMention && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => {
                        if (user.canMention) {
                          insertMentionAtCursor(user);
                        }
                      }}
                      disabled={!user.canMention}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user.image || undefined}
                          alt={user.name || ""}
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-xs">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {user.name || "Usuario"}
                          </span>
                          {!user.canMention && (
                            <Lock className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        {!user.canMention && (
                          <span className="text-xs text-muted-foreground">
                            No permite menciones
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MentionInput.displayName = "MentionInput";

// Utility function to extract mentions from text
export function extractMentions(text: string): string[] {
  const mentions: string[] = [];
  let match;
  while ((match = MENTION_REGEX.exec(text)) !== null) {
    mentions.push(match[2]);
  }
  return mentions;
}

// Utility function to render text with mention links
export function renderMentions(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const regex = new RegExp(MENTION_REGEX.source, "g");

  while ((match = regex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // Add mention link
    const [fullMatch, name, userId] = match;
    parts.push(
      <a
        key={`mention-${match.index}`}
        href={`/profile/${userId}`}
        className="text-primary font-medium hover:underline"
      >
        @{name}
      </a>
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}
