import { cn } from "@/lib/utils";

interface ChatSkeletonProps {
  count?: number;
  className?: string;
}

export function ChatSkeleton({ count = 6, className }: ChatSkeletonProps) {
  return (
    <div className={cn("space-y-4 p-4", className)}>
      {Array.from({ length: count }).map((_, i) => {
        const isUser = i % 2 === 0;
        return (
          <div
            key={i}
            className={cn(
              "flex gap-3 animate-pulse",
              isUser ? "justify-end" : "justify-start"
            )}
          >
            {!isUser && (
              <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
            )}

            <div
              className={cn(
                "max-w-[70%] space-y-2",
                isUser && "items-end"
              )}
            >
              <div
                className={cn(
                  "h-14 bg-muted rounded-2xl",
                  isUser ? "rounded-tr-md w-48" : "rounded-tl-md w-56",
                  i % 3 === 0 && "w-64"
                )}
              />
              <div className="h-2.5 bg-muted/50 rounded w-16" />
            </div>

            {isUser && (
              <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
            )}
          </div>
        );
      })}
    </div>
  );
}
