'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/lib/smart-start/core/types';

interface SearchResultCardProps {
  result: SearchResult;
  onSelect: () => void;
  showIndex?: boolean;
  index?: number;
}

// Map source to display name
const SOURCE_NAMES: Record<string, string> = {
  'anilist': 'Anime',
  'mal': 'Anime',
  'jikan': 'Anime',
  'tmdb': 'Movie/TV',
  'tvmaze': 'TV',
  'igdb': 'Game',
  'wikipedia': 'Wiki',
  'firecrawl': 'Web',
};

export function SearchResultCard({ result, onSelect, showIndex = false, index }: SearchResultCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = result.imageUrl || result.thumbnailUrl;
  const hasImage = !!imageUrl;
  const sourceDisplay = SOURCE_NAMES[result.source] || result.source;

  return (
    <motion.button
      onClick={onSelect}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
      className={cn(
        'relative p-6 rounded-xl border-2 transition-all text-left w-full',
        'hover:border-primary/50 hover:shadow-md',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950'
      )}
    >
      {/* Category Badge - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {sourceDisplay}
        </span>
      </div>

      {/* Quick Access Number - Top Left (only if showIndex) */}
      {showIndex && index !== undefined && index < 9 && (
        <div className="absolute top-3 left-3 z-10">
          <kbd className="px-1.5 py-0.5 text-xs bg-primary text-white rounded font-mono">
            {index}
          </kbd>
        </div>
      )}

      {/* Image - Full width */}
      <div className="mb-4 -mx-6 -mt-6">
        {hasImage ? (
          <img
            src={imageUrl}
            alt={result.name}
            className="w-full h-40 object-cover rounded-t-xl bg-gray-100 dark:bg-gray-800"
          />
        ) : (
          <div className="w-full h-40 rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Name - Always visible */}
      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
        {result.name}
      </h3>

      {/* Description - Only visible on hover */}
      <motion.div
        initial={false}
        animate={{
          height: isHovered ? 'auto' : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
        className="overflow-hidden"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
          {result.description || 'No description available.'}
        </p>
      </motion.div>
    </motion.button>
  );
}
