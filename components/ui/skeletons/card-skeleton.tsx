import { cn } from "@/lib/utils";

interface CardSkeletonProps {
  count?: number;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export function CardSkeleton({
  count = 1,
  className,
  variant = "default"
}: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "rounded-xl border bg-card text-card-foreground shadow animate-pulse",
            className
          )}
        >
          {variant === "default" && (
            <div className="p-6 space-y-4">
              {/* Avatar + Title */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-3 bg-muted rounded w-4/6" />
              </div>

              {/* Footer */}
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-muted rounded w-20" />
                <div className="h-8 bg-muted rounded w-20" />
              </div>
            </div>
          )}

          {variant === "compact" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2.5 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          )}

          {variant === "detailed" && (
            <div className="p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="flex gap-2 mt-2">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-4/5" />
                <div className="h-3 bg-muted rounded w-3/5" />
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-4 bg-muted rounded w-16" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <div className="h-9 bg-muted rounded w-24" />
                <div className="h-9 bg-muted rounded w-24" />
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
