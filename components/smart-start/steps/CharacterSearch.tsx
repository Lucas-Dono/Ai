'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, AlertCircle, Sparkles, Filter, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchResultCard } from '../ui/SearchResultCard';
import { HighConfidenceMatchModal } from '../ui/HighConfidenceMatchModal';
import { useSmartStart } from '../context/SmartStartContext';
import { shouldShowHighConfidenceModal } from '@/lib/smart-start/utils/string-similarity';
import { POPULAR_CHARACTERS, type PopularCharacter } from '@/lib/smart-start/data/popular-characters';
import { genreService } from '@/lib/smart-start/services/genre-service';
import type { GenreId, SubGenreId } from '@/lib/smart-start/core/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyboardPills, type PillOption } from '../ui/accessible/KeyboardPills';

export function CharacterSearch() {
  const t = useTranslations('smartStart.characterSearch');
  const {
    searchCharacters,
    selectSearchResult,
    searchQuery,
    searchResults,
    isSearching,
    error,
    clearError,
  } = useSmartStart();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHighConfidenceModal, setShowHighConfidenceModal] = useState(false);
  const [highConfidenceResult, setHighConfidenceResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [genreFilter, setGenreFilter] = useState<GenreId | 'all'>('all');
  const [subgenreFilter, setSubgenreFilter] = useState<SubGenreId | 'all'>('all');

  // Get all genres for filter options
  const allGenres = genreService.getAllGenres();
  const selectedGenreObj = genreFilter !== 'all' ? genreService.getGenre(genreFilter as GenreId) : null;
  const availableSubgenres = selectedGenreObj?.subgenres || [];

  // Filter utility function
  const applyFilters = useCallback((characters: PopularCharacter[]) => {
    return characters.filter(char => {
      // Gender filter
      if (genderFilter !== 'all' && char.gender !== genderFilter) {
        return false;
      }

      // Genre filter
      if (genreFilter !== 'all' && char.suggestedGenre !== genreFilter) {
        return false;
      }

      // Subgenre filter
      if (subgenreFilter !== 'all' && char.suggestedSubgenre !== subgenreFilter) {
        return false;
      }

      return true;
    });
  }, [genderFilter, genreFilter, subgenreFilter]);

  // Reset subgenre when genre changes
  useEffect(() => {
    setSubgenreFilter('all');
  }, [genreFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setGenderFilter('all');
    setGenreFilter('all');
    setSubgenreFilter('all');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = genderFilter !== 'all' || genreFilter !== 'all' || subgenreFilter !== 'all';

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Check for high-confidence match after search results arrive
  useEffect(() => {
    if (searchResults.length > 0 && !isSearching) {
      const topResult = searchResults[0];
      const matchScore = topResult.confidence || 0;

      if (shouldShowHighConfidenceModal(matchScore)) {
        setHighConfidenceResult(topResult);
        setShowHighConfidenceModal(true);
      }
    }
  }, [searchResults, isSearching]);

  const handleSearch = async (query?: string) => {
    const searchTerm = query || localQuery;
    if (!searchTerm.trim()) return;

    if (query) setLocalQuery(query);
    setHasSearched(true);
    setShowHighConfidenceModal(false);
    setHighConfidenceResult(null);
    await searchCharacters(searchTerm);
  };

  const handleHighConfidenceConfirm = () => {
    if (highConfidenceResult) {
      setShowHighConfidenceModal(false);
      selectSearchResult(highConfidenceResult);
    }
  };

  const handleHighConfidenceShowMore = () => {
    setShowHighConfidenceModal(false);
    setHighConfidenceResult(null);
    // Results remain visible, user can browse them
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Keyboard navigation for results
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in input
      if (document.activeElement === inputRef.current) {
        return;
      }

      if (searchResults.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(searchResults.length - 1, prev + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            selectSearchResult(searchResults[selectedIndex]);
          }
          break;
        case '/':
          e.preventDefault();
          inputRef.current?.focus();
          break;
        default:
          // Number keys for quick selection (1-9)
          const num = parseInt(e.key);
          if (!isNaN(num) && num >= 1 && num <= Math.min(9, searchResults.length)) {
            e.preventDefault();
            selectSearchResult(searchResults[num - 1]);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex, selectSearchResult]);

  // Auto-scroll to results when they appear
  useEffect(() => {
    if (searchResults.length > 0 && resultsRef.current && !isSearching) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }, 100);
    }
  }, [searchResults.length, isSearching]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          placeholder={t('searchPlaceholder')}
          value={localQuery}
          onChange={e => setLocalQuery(e.target.value)}
          onKeyDown={handleInputKeyDown}
          disabled={isSearching}
          className="text-base h-11"
          autoFocus
        />
        <Button
          onClick={handleSearch}
          disabled={!localQuery.trim() || isSearching}
          size="lg"
          className="px-6"
        >
          {isSearching ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              {t('searchButton')}
            </>
          )}
        </Button>
      </div>

      {/* Filter Pills Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Gender Pills */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sexo</p>
          <KeyboardPills
            options={[
              { id: 'all', label: 'Todos' },
              { id: 'male', label: 'Masculino' },
              { id: 'female', label: 'Femenino' },
            ]}
            selected={[genderFilter]}
            onChange={(selected) => setGenderFilter(selected[0] as 'all' | 'male' | 'female')}
            multiple={false}
            orientation="horizontal"
          />
        </div>

        {/* Genre Pills */}
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Género</p>
          <KeyboardPills
            options={[
              { id: 'all', label: 'Todos' },
              ...allGenres.map(genre => ({ id: genre.id, label: genre.name }))
            ]}
            selected={[genreFilter]}
            onChange={(selected) => setGenreFilter(selected[0] as GenreId | 'all')}
            multiple={false}
            orientation="horizontal"
          />
        </div>

        {/* Subgenre Pills */}
        {genreFilter !== 'all' && availableSubgenres.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sub-género</p>
            <KeyboardPills
              options={[
                { id: 'all', label: 'Todos' },
                ...availableSubgenres.map(subgenre => ({ id: subgenre.id, label: subgenre.name }))
              ]}
              selected={[subgenreFilter]}
              onChange={(selected) => setSubgenreFilter(selected[0] as SubGenreId | 'all')}
              multiple={false}
              orientation="horizontal"
            />
          </motion.div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isSearching && <SearchLoadingSkeleton />}

      {/* Results */}
      {!isSearching && hasSearched && searchResults.length > 0 && (
        <div ref={resultsRef} className="space-y-6">
          {/* Results header */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {searchResults.length === 1
              ? t('resultsFound', { count: searchResults.length })
              : t('resultsFoundPlural', { count: searchResults.length })
            }
          </p>

          {/* Results grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((result, idx) => (
              <div
                key={result.id}
                className={cn(
                  'transition-all',
                  selectedIndex === idx && 'ring-2 ring-primary ring-offset-2 rounded-xl'
                )}
              >
                <SearchResultCard
                  result={result}
                  onSelect={() => selectSearchResult(result)}
                  showIndex={idx < 9}
                  index={idx + 1}
                />
              </div>
            ))}
          </div>

          {/* Keyboard hints */}
          <div className="flex justify-center gap-6 text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">↑↓</kbd>
              <span>{t('keyboard.navigate')}</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">Enter</kbd>
              <span>{t('keyboard.select')}</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">1-9</kbd>
              <span>{t('keyboard.quickAccess')}</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">/</kbd>
              <span>{t('keyboard.searchAgain')}</span>
            </div>
          </div>
        </div>
      )}

      {/* No Results State */}
      {!isSearching && hasSearched && searchResults.length === 0 && !error && (
        <NoResultsState query={localQuery} onRetry={handleSearch} />
      )}

      {/* Empty State */}
      {!isSearching && !hasSearched && (
        <EmptySearchState onExampleSelect={handleSearch} applyFilters={applyFilters} />
      )}

      {/* High Confidence Match Modal */}
      {highConfidenceResult && (
        <HighConfidenceMatchModal
          isOpen={showHighConfidenceModal}
          result={highConfidenceResult}
          matchScore={highConfidenceResult.confidence || 0}
          onConfirm={handleHighConfidenceConfirm}
          onShowMore={handleHighConfidenceShowMore}
          onClose={() => setShowHighConfidenceModal(false)}
        />
      )}
    </div>
  );
}

function SearchLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <div
          key={i}
          className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-800"
        >
          <div className="space-y-4">
            {/* Image skeleton */}
            <div className="w-full h-40 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse -mx-6 -mt-6 mb-4" />
            {/* Title skeleton */}
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface NoResultsStateProps {
  query: string;
  onRetry: () => void;
}

function NoResultsState({ query, onRetry }: NoResultsStateProps) {
  const t = useTranslations('smartStart.characterSearch.noResults');

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {t('title')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {t('message', { query })}
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onRetry}>
          {t('tryAgain')}
        </Button>
        <Button onClick={() => window.history.back()}>
          {t('goBack')}
        </Button>
      </div>
    </div>
  );
}

interface EmptySearchStateProps {
  onExampleSelect: (characterName: string) => void;
  applyFilters: (characters: PopularCharacter[]) => PopularCharacter[];
}

function EmptySearchState({ onExampleSelect, applyFilters }: EmptySearchStateProps) {
  const t = useTranslations('smartStart.characterSearch.emptyState');

  // Apply filters to popular characters
  const filteredCharacters = applyFilters(POPULAR_CHARACTERS);

  // Show first 8 filtered characters
  const exampleCharacters = filteredCharacters.slice(0, 8);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/30 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {t('title')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {t('message')}
        </p>
      </div>

      {/* Example Characters Grid */}
      {exampleCharacters.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Personajes populares
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (Haz clic para buscar)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {exampleCharacters.map((character, index) => (
            <motion.button
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onExampleSelect(character.name)}
              className="group relative p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all text-left bg-white dark:bg-gray-950"
            >
              {/* Character image */}
              <div className="w-full aspect-square mb-3 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 overflow-hidden relative">
                <img
                  src={character.imageUrl}
                  alt={character.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                    const icon = document.createElement('div');
                    icon.innerHTML = '<svg class="w-8 h-8 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>';
                    target.parentElement!.appendChild(icon.firstChild!);
                  }}
                />

                {/* Category badge - over the image */}
                <span className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded bg-gray-100/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-400 backdrop-blur-sm">
                  {character.category}
                </span>
              </div>

              {/* Character info */}
              <h5 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition-colors">
                {character.name}
              </h5>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {character.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {character.tags.slice(0, 2).map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          ))}
        </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No hay personajes que coincidan con los filtros
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Intenta ajustar los filtros o limpiarlos para ver más opciones
          </p>
        </div>
      )}

      {/* Helper text */}
      {exampleCharacters.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            O escribe cualquier nombre de personaje en el buscador
          </p>
        </div>
      )}
    </div>
  );
}
