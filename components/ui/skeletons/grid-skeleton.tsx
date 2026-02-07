import { cn } from "@/lib/utils";

interface GridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
  variant?: "square" | "portrait" | "landscape";
}

export function GridSkeleton({
  count = 6,
  columns = 3,
  className,
  variant = "square"
}: GridSkeletonProps) {
  const aspectRatios = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-video"
  };

  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          {/* Image */}
          <div className={cn(
            "bg-muted rounded-xl w-full",
            aspectRatios[variant]
          )} />

          {/* Title */}
          <div className="space-y-2 px-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
