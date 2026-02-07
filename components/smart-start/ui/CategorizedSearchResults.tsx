'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Database, Tv, Gamepad2, BookOpen, Globe } from 'lucide-react';
import type { SearchResult, SearchSourceId } from '@/lib/smart-start/core/types';
import { SearchResultCard } from './SearchResultCard';

interface CategorizedSearchResultsProps {
  results: SearchResult[];
  onSelectResult: (result: SearchResult) => void;
  selectedIndex?: number;
}

interface SourceCategory {
  id: string;
  name: string;
  icon: any;
  sources: SearchSourceId[];
  color: string;
}

// Define source categories
const SOURCE_CATEGORIES: SourceCategory[] = [
  {
    id: 'anime',
    name: 'Anime & Manga',
    icon: Database,
    sources: ['anilist', 'myanimelist', 'jikan'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'tv',
    name: 'Películas y Series',
    icon: Tv,
    sources: ['tmdb', 'tvmaze'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'games',
    name: 'Videojuegos',
    icon: Gamepad2,
    sources: ['igdb'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'encyclopedia',
    name: 'Enciclopedia',
    icon: BookOpen,
    sources: ['wikipedia', 'wikidata'],
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 'web',
    name: 'Web',
    icon: Globe,
    sources: ['firecrawl'],
    color: 'from-gray-500 to-slate-600',
  },
];

/**
 * CategorizedSearchResults - Groups and displays search results by source category
 * Makes it easy for users to browse results by type
 */
export function CategorizedSearchResults({
  results,
  onSelectResult,
  selectedIndex = -1,
}: CategorizedSearchResultsProps) {
  // Categorize results
  const categorizedResults = useMemo(() => {
    const categories = new Map<string, SearchResult[]>();

    for (const result of results) {
      const category = SOURCE_CATEGORIES.find(cat =>
        cat.sources.includes(result.source)
      );

      const categoryId = category?.id || 'other';

      if (!categories.has(categoryId)) {
        categories.set(categoryId, []);
      }

      categories.get(categoryId)!.push(result);
    }

    return categories;
  }, [results]);

  // Get ordered categories (only those with results)
  const orderedCategories = SOURCE_CATEGORIES.filter(cat =>
    categorizedResults.has(cat.id)
  );

  // Add "other" category if it exists
  if (categorizedResults.has('other')) {
    orderedCategories.push({
      id: 'other',
      name: 'Otros',
      icon: Globe,
      sources: [],
      color: 'from-gray-400 to-gray-500',
    });
  }

  if (orderedCategories.length === 0) {
    return null;
  }

  // If only one category, show flat list
  if (orderedCategories.length === 1) {
    const category = orderedCategories[0];
    const categoryResults = categorizedResults.get(category.id) || [];

    return (
      <div className="space-y-3">
        {categoryResults.map((result, idx) => {
          const globalIndex = results.indexOf(result);
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={selectedIndex === globalIndex ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}
            >
              <SearchResultCard
                result={result}
                onSelect={() => onSelectResult(result)}
                showIndex={globalIndex < 9}
                index={globalIndex + 1}
              />
            </motion.div>
          );
        })}
      </div>
    );
  }

  // Multiple categories - show grouped
  return (
    <div className="space-y-8">
      {orderedCategories.map(category => {
        const categoryResults = categorizedResults.get(category.id) || [];
        const Icon = category.icon;

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {categoryResults.length} {categoryResults.length === 1 ? 'resultado' : 'resultados'}
                </p>
              </div>
            </div>

            {/* Category Results */}
            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-800">
              {categoryResults.map((result, idx) => {
                const globalIndex = results.indexOf(result);
                return (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={selectedIndex === globalIndex ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}
                  >
                    <SearchResultCard
                      result={result}
                      onSelect={() => onSelectResult(result)}
                      showIndex={globalIndex < 9}
                      index={globalIndex + 1}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
