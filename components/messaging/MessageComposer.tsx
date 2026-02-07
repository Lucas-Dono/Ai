'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageComposerProps {
  onSend: (content: string) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  sending?: boolean;
}

export function MessageComposer({
  onSend,
  disabled = false,
  placeholder = 'Escribe un mensaje...',
  maxLength = 2000,
  sending = false,
}: MessageComposerProps) {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!content.trim() || sending || disabled) return;

    const messageToSend = content.trim();
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      await onSend(messageToSend);
    } catch (error) {
      // Si hay error, restaurar el mensaje
      setContent(messageToSend);
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setContent(textarea.value);

    // Auto-resize
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const isDisabled = disabled || sending;
  const canSend = content.trim().length > 0 && !isDisabled;
  const remainingChars = maxLength - content.length;
  const showCounter = content.length > maxLength * 0.8;

  return (
    <div className="border-t border-border bg-background p-4">
      <div
        className={cn(
          'relative flex items-end gap-2 p-3 rounded-2xl border-2 transition-all',
          isFocused ? 'border-primary bg-accent/50' : 'border-border bg-card',
          isDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* Botón de adjuntar (futuro) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          disabled={isDisabled}
          title="Adjuntar archivo (próximamente)"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={isDisabled}
            maxLength={maxLength}
            className="min-h-[40px] max-h-[120px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
            rows={1}
          />

          {/* Contador de caracteres */}
          {showCounter && (
            <div
              className={cn(
                'absolute bottom-1 right-1 text-xs',
                remainingChars < 100 ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {remainingChars}
            </div>
          )}
        </div>

        {/* Botón de emoji (futuro) */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          disabled={isDisabled}
          title="Emojis (próximamente)"
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* Botón de enviar */}
        <Button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className={cn(
            'flex-shrink-0 h-9 w-9 transition-all',
            canSend ? 'scale-100' : 'scale-90'
          )}
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Presiona Enter para enviar, Shift + Enter para nueva línea
      </p>
    </div>
  );
}
