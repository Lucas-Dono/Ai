/**
 * Pull To Refresh Component
 *
 * Mobile-friendly pull-to-refresh functionality
 * - Touch gesture detection
 * - Visual feedback with loading indicator
 * - Haptic feedback on trigger
 * - Customizable threshold and resistance
 * - Works with any scrollable container
 *
 * PHASE 2: Mobile Experience
 */

"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number; // Distance to trigger refresh (px)
  maxPullDistance?: number; // Maximum pull distance (px)
  disabled?: boolean;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  disabled = false,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { medium } = useHaptic();

  // Check if we're at the top of the container to allow pull
  const checkCanPull = () => {
    if (!containerRef.current) return false;
    const scrollTop = containerRef.current.scrollTop;
    return scrollTop === 0;
  };

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshing) return;

      const canPullNow = checkCanPull();
      setCanPull(canPullNow);

      if (!canPullNow) return;

      touchStartY = e.touches[0].clientY;
      startY.current = touchStartY;
      isDragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isRefreshing || !canPull) return;

      const touchY = e.touches[0].clientY;
      const deltaY = touchY - startY.current;

      if (deltaY > 0) {
        isDragging = true;

        // Apply resistance effect
        const resistance = 0.5;
        const distance = Math.min(deltaY * resistance, maxPullDistance);
        setPullDistance(distance);

        // Prevent default scrolling when pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isRefreshing || !isDragging) {
        setPullDistance(0);
        return;
      }

      if (pullDistance >= threshold) {
        // Trigger refresh with haptic feedback
        medium();
        setIsRefreshing(true);
        setPullDistance(threshold);

        try {
          await onRefresh();
        } catch (error) {
          console.error("[PullToRefresh] Error refreshing:", error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Reset if threshold not met
        setPullDistance(0);
      }

      isDragging = false;
      setCanPull(false);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, isRefreshing, pullDistance, threshold, maxPullDistance, medium, onRefresh, canPull]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const iconRotation = pullProgress * 180;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-y-auto",
        "lg:overflow-visible", // Only apply custom scroll behavior on mobile
        className
      )}
    >
      {/* Pull Indicator - ONLY ON MOBILE */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-50"
            style={{
              transform: `translateY(${Math.min(pullDistance - 50, 30)}px)`,
            }}
          >
            <div className="bg-background/95 backdrop-blur-xl rounded-full p-3 shadow-lg border border-border">
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <motion.div
                  animate={{ rotate: iconRotation }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <RefreshCw
                    className={cn(
                      "w-5 h-5 transition-colors",
                      pullProgress >= 1 ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content with transform on pull */}
      <div
        style={{
          transform:
            pullDistance > 0 && !isRefreshing
              ? `translateY(${Math.min(pullDistance * 0.3, 40)}px)`
              : undefined,
          transition: pullDistance === 0 ? "transform 0.2s ease-out" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
