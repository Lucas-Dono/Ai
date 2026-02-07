/**
 * Bottom Sheet Component
 *
 * Mobile-friendly modal that slides from bottom
 * - Swipe down to close
 * - Backdrop with blur
 * - Smooth animations
 * - Handle indicator
 *
 * UPDATED: Sincronizado con el theme móvil
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { mobileTheme } from "@/lib/mobile-theme";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  initialSnap?: number;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.9, 0.5, 0.25],
  initialSnap = 0,
}: BottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Swipe down to close
    if (velocity > 500 || offset > 150) {
      onClose();
      return;
    }

    // Snap to nearest point
    const windowHeight = window.innerHeight;
    const currentHeight = snapPoints[currentSnap] * windowHeight;
    const newHeight = currentHeight - offset;
    const newSnapPercentage = newHeight / windowHeight;

    // Find closest snap point
    let closestSnap = 0;
    let closestDiff = Math.abs(snapPoints[0] - newSnapPercentage);

    snapPoints.forEach((snap, index) => {
      const diff = Math.abs(snap - newSnapPercentage);
      if (diff < closestDiff) {
        closestDiff = diff;
        closestSnap = index;
      }
    });

    setCurrentSnap(closestSnap);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-50"
            style={{ backgroundColor: mobileTheme.colors.overlay }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: `${(1 - snapPoints[currentSnap]) * 100}%` }}
            exit={{ y: "100%" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50",
              "rounded-t-3xl overflow-hidden"
            )}
            style={{
              backgroundColor: mobileTheme.colors.background.secondary,
              boxShadow: mobileTheme.shadows.xl,
              maxHeight: "90vh",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
              <div
                className="w-12 h-1.5 rounded-full"
                style={{ backgroundColor: mobileTheme.colors.border.main }}
              />
            </div>

            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  borderBottomWidth: '1px',
                  borderBottomColor: mobileTheme.colors.border.light,
                }}
              >
                <h2
                  className="text-lg font-bold"
                  style={{ color: mobileTheme.colors.text.primary }}
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  style={{ borderRadius: `${mobileTheme.borderRadius.lg}px` }}
                >
                  <X
                    className="w-5 h-5"
                    style={{ color: mobileTheme.colors.text.primary }}
                  />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(90vh - 80px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
