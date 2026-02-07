/**
 * LikeButton - Botón de like con animación de corazón
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, useEmotionalSparkles } from "@/components/effects/Sparkles";

interface LikeButtonProps {
  itemId: string;
  itemType: 'character' | 'prompt' | 'theme';
  initialLiked?: boolean;
  initialLikes?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
  className?: string;
}

export function LikeButton({
  itemId,
  itemType,
  initialLiked = false,
  initialLikes = 0,
  size = 'md',
  variant = 'outline',
  showCount = true,
  className,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);
  const { showSparkles, sparklesConfig, triggerSparkles } = useEmotionalSparkles();

  const handleLike = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isAnimating) return;

    try {
      setIsAnimating(true);
      const newLiked = !isLiked;
      setIsLiked(newLiked);
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

      // Trigger animation
      if (newLiked) {
        // Heart burst animation will be handled by AnimatePresence
        triggerSparkles({ emotion: "love", intensity: 7, duration: 1.5 });
      }

      // API endpoint varies by type
      const endpoint = itemType === 'character'
        ? `/api/community/marketplace/characters/${itemId}/rate`
        : itemType === 'prompt'
        ? `/api/community/marketplace/prompts/${itemId}/rate`
        : `/api/marketplace/themes/${itemId}/rating`;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newLiked ? 5 : 0 }),
      });
    } catch (error) {
      console.error('Error liking item:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(initialLikes);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-9',
    lg: 'h-10',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <>
    <div className="relative">
      <Button
        variant={variant}
        size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
        onClick={handleLike}
        className={cn(
          sizeClasses[size],
          "gap-2 relative overflow-visible",
          isLiked && "text-red-500 border-red-500/50",
          className
        )}
      >
        <motion.div
          animate={isLiked && isAnimating ? {
            scale: [1, 1.3, 1],
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={cn(
              iconSizes[size],
              isLiked && "fill-current"
            )}
          />
        </motion.div>

        {showCount && (
          <AnimatePresence mode="wait">
            <motion.span
              key={likesCount}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium"
            >
              {likesCount}
            </motion.span>
          </AnimatePresence>
        )}
      </Button>

      {/* Heart particles animation */}
      <AnimatePresence>
        {isLiked && isAnimating && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: 0,
                  scale: 1,
                  x: Math.cos((i * Math.PI * 2) / 5) * 30,
                  y: Math.sin((i * Math.PI * 2) / 5) * 30,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
    <Sparkles show={showSparkles} {...sparklesConfig} />
    </>
  );
}
