import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  count?: number;
  className?: string;
  variant?: "default" | "compact" | "detailed";
  showDividers?: boolean;
}

export function ListSkeleton({
  count = 5,
  className,
  variant = "default",
  showDividers = true
}: ListSkeletonProps) {
  return (
    <div className={cn("space-y-0", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="py-4 px-4 animate-pulse">
            {variant === "default" && (
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
            )}

            {variant === "compact" && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2.5 bg-muted rounded w-1/3" />
                </div>
              </div>
            )}

            {variant === "detailed" && (
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-6 w-16 bg-muted rounded-full" />
                    <div className="h-6 w-16 bg-muted rounded-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
          {showDividers && i < count - 1 && (
            <div className="h-px bg-border" />
          )}
        </div>
      ))}
    </div>
  );
}
