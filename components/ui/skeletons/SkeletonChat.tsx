/**
 * SKELETON CHAT
 * Loading placeholder para chat/mensajes
 */

import { cn } from '@/lib/utils';

interface SkeletonChatProps {
  className?: string;
  /** Número de mensajes */
  messageCount?: number;
}

export function SkeletonChat({ className, messageCount = 3 }: SkeletonChatProps) {
  return (
    <div
      className={cn('space-y-4', className)}
      role="status"
      aria-label="Loading chat..."
    >
      {Array.from({ length: messageCount }).map((_, i) => (
        <SkeletonMessage key={i} isUser={i % 2 === 0} />
      ))}
    </div>
  );
}

/**
 * Mensaje individual
 */
function SkeletonMessage({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={cn(
        'flex gap-3 animate-pulse',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />

      {/* Mensaje */}
      <div
        className={cn(
          'max-w-[70%] space-y-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Nombre */}
        <div className="h-3 bg-muted rounded w-20" />

        {/* Bubble */}
        <div
          className={cn(
            'rounded-2xl p-4 space-y-2',
            isUser ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-4/5" />
          <div className="h-3 bg-muted rounded w-3/5" />
        </div>

        {/* Timestamp */}
        <div className="h-2 bg-muted rounded w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton para typing indicator
 */
export function SkeletonTyping() {
  return (
    <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted w-fit">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">Escribiendo...</span>
    </div>
  );
}
