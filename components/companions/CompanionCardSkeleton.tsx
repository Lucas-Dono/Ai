"use client";

export function CompanionCardSkeleton() {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl bg-[#141416] animate-pulse"
      style={{ aspectRatio: '3/5' }}
    >
      {/* Image Area Skeleton */}
      <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
        <div className="w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-700/50" />

        {/* Tier Badge Skeleton */}
        <div className="absolute top-3 left-3 z-10 w-12 h-5 bg-gray-700/70 rounded" />

        {/* Gradient Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-[60px] bg-gradient-to-t from-[#141416] to-transparent pointer-events-none" />
      </div>

      {/* Content Area Skeleton */}
      <div className="flex flex-1 flex-col bg-gradient-to-b from-[#141416] to-[#09090b] p-4">
        {/* Name Skeleton */}
        <div className="h-4 bg-gray-700/50 rounded mb-2 w-3/4" />

        {/* Description Skeleton (2 lines) */}
        <div className="space-y-1.5 mb-3">
          <div className="h-3 bg-gray-700/40 rounded w-full" />
          <div className="h-3 bg-gray-700/40 rounded w-5/6" />
        </div>

        {/* Categories Skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <div className="h-6 w-16 bg-gray-700/40 rounded-full" />
          <div className="h-6 w-20 bg-gray-700/40 rounded-full" />
        </div>

        {/* Button Skeleton */}
        <div className="mt-auto h-9 bg-gray-700/40 rounded-lg" />
      </div>
    </div>
  );
}
