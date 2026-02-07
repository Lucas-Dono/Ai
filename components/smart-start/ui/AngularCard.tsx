'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getClipPathStyle, type ClipPathVariant } from '@/lib/smart-start/utils/clip-paths';
import type { PopularCharacter } from '@/lib/smart-start/data/popular-characters';

interface AngularCardProps {
  character: PopularCharacter;
  variant: 'featured' | 'regular' | 'flat';
  onClick: () => void;
  index?: number;
  clipPathVariant?: ClipPathVariant; // Optional: override automatic clip-path selection
}

/**
 * Angular Card Component
 * Displays character cards with angular/diagonal cuts
 * Supports 3 variants: Featured (dramatic), Regular (subtle), Flat (traditional)
 */
export function AngularCard({ character, variant, onClick, index = 0, clipPathVariant: customClipPath }: AngularCardProps) {
  const isFeatured = variant === 'featured';
  const isFlat = variant === 'flat';

  // Determine clip-path variant (use custom if provided, otherwise use default based on variant)
  const clipPathVariant: ClipPathVariant = customClipPath || (isFeatured ? 'featured' : isFlat ? 'flat' : 'regular');

  // Calculate stagger delay for entrance animation
  const animationDelay = index * 0.05;

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: animationDelay,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      whileHover={{
        scale: isFeatured ? 1.02 : 1.03,
        rotateX: isFeatured ? 2 : 3,
        rotateY: isFeatured ? 2 : 3,
        z: 50,
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        ...(!isFlat && getClipPathStyle(clipPathVariant)),
      }}
      className={cn(
        'group relative overflow-hidden text-left transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',

        // Size variants
        isFeatured && 'col-span-2 row-span-2',

        // Border radius (only for flat variant)
        isFlat && 'rounded-2xl',

        // Background and border
        'bg-white dark:bg-gray-900',
        'border-2 border-gray-200 dark:border-gray-800',
        'hover:border-primary/50 dark:hover:border-primary/50'
      )}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={character.imageUrl}
          alt={character.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            'group-hover:scale-110'
          )}
        />

        {/* Gradient Overlay */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-300',
            isFeatured
              ? 'bg-gradient-to-br from-black/60 via-black/40 to-transparent'
              : 'bg-gradient-to-t from-black/80 via-black/50 to-transparent',
            'group-hover:opacity-90'
          )}
        />

        {/* Glassmorphism Overlay on Hover */}
        <div
          className={cn(
            'absolute inset-0 backdrop-blur-sm bg-white/10 dark:bg-black/10',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
          )}
        />
      </div>

      {/* Content Container */}
      <div
        className={cn(
          'relative z-10 flex flex-col justify-end',
          isFeatured ? 'p-8 h-full min-h-[400px]' : 'p-6 h-full min-h-[240px]'
        )}
      >
        {/* Featured Badge */}
        {isFeatured && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: animationDelay + 0.2 }}
            className="absolute top-4 left-4"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-white">Featured</span>
            </div>
          </motion.div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {character.tags.slice(0, isFeatured ? 4 : 2).map(tag => (
            <span
              key={tag}
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                'bg-white/20 dark:bg-black/20 backdrop-blur-sm',
                'text-white border border-white/30'
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Character Info */}
        <div className="space-y-2">
          <h3
            className={cn(
              'font-bold text-white leading-tight',
              'transform transition-transform duration-300',
              'group-hover:translate-x-1',
              isFeatured ? 'text-3xl' : 'text-xl'
            )}
          >
            {character.name}
          </h3>

          <p
            className={cn(
              'text-gray-100 leading-relaxed',
              isFeatured ? 'text-base line-clamp-3' : 'text-sm line-clamp-2',
              'transform transition-all duration-300',
              'opacity-90 group-hover:opacity-100',
              'max-h-0 group-hover:max-h-24 overflow-hidden',
              isFeatured && 'max-h-24' // Always show description for featured
            )}
          >
            {character.description}
          </p>
        </div>

        {/* Hover Indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>

        {/* Particle Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          {[...Array(isFeatured ? 8 : 5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/60 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      {/* 3D Shadow Effect */}
      <div
        className={cn(
          'absolute -inset-1 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-300',
          'bg-gradient-to-br from-primary/20 to-purple-500/20',
          'group-hover:opacity-100',
          !isFlat && 'rounded-none' // Match clip-path shape
        )}
      />
    </motion.button>
  );
}
