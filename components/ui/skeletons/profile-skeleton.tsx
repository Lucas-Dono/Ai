import { cn } from "@/lib/utils";

interface ProfileSkeletonProps {
  className?: string;
  variant?: "card" | "page";
}

export function ProfileSkeleton({
  className,
  variant = "card"
}: ProfileSkeletonProps) {
  if (variant === "page") {
    return (
      <div className={cn("space-y-6 animate-pulse", className)}>
        {/* Header */}
        <div className="relative">
          {/* Cover */}
          <div className="h-48 bg-muted rounded-2xl" />

          {/* Avatar */}
          <div className="absolute -bottom-12 left-6">
            <div className="h-24 w-24 rounded-full bg-muted border-4 border-background" />
          </div>
        </div>

        {/* Info */}
        <div className="pt-14 px-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-4 bg-muted rounded w-32" />
          </div>

          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
          <div className="h-3 bg-muted rounded w-3/4" />

          {/* Stats */}
          <div className="flex gap-6 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-6 bg-muted rounded w-12" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 bg-muted rounded w-32" />
            <div className="h-10 bg-muted rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4 animate-pulse", className)}>
      {/* Avatar + Name */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-32" />
          <div className="h-3 bg-muted rounded w-24" />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
      </div>

      {/* Stats */}
      <div className="flex gap-4 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 space-y-1.5">
            <div className="h-4 bg-muted rounded w-12" />
            <div className="h-3 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
