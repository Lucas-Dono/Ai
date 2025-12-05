'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Genre } from '../context/SmartStartContext';

interface GenreCardProps {
  genre: Genre;
  selected: boolean;
  onSelect: () => void;
}

export function GenreCard({ genre, selected, onSelect }: GenreCardProps) {
  // Get icon component dynamically
  const IconComponent = (Icons as any)[genre.icon] || Icons.Heart;

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      className={cn(
        'relative p-6 rounded-xl border-2 transition-all text-left w-full',
        'hover:border-primary/50 hover:shadow-md',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 dark:border-gray-800'
      )}
      role="radio"
      aria-checked={selected}
    >
      {/* Gradient background effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 transition-opacity',
          selected && 'opacity-10'
        )}
        style={{
          background: `linear-gradient(135deg, ${genre.gradient.from}, ${genre.gradient.to})`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors',
            selected
              ? 'bg-primary/20'
              : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700'
          )}
          style={
            selected
              ? {
                  background: `linear-gradient(135deg, ${genre.gradient.from}20, ${genre.gradient.to}30)`,
                }
              : undefined
          }
        >
          <IconComponent
            className={cn(
              'w-6 h-6 transition-colors',
              selected ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
            )}
          />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
          {genre.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {genre.description}
        </p>

        {/* Tags */}
        {genre.tags && genre.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {genre.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full transition-colors',
                  selected
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          layoutId="genre-selection"
          className="absolute inset-0 rounded-xl ring-2 ring-primary pointer-events-none"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}
