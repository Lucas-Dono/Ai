/**
 * Shared AI Characters - Grid de IAs compartidas por la comunidad
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Heart,
  Download,
  Eye,
  Sparkles,
  TrendingUp,
  Star,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SharedAICard } from "@/components/community/SharedAICard";
import { useTranslations } from "next-intl";

type SortType = 'popular' | 'new' | 'liked';

interface SharedCharacter {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatar?: string;
  author: {
    id: string;
    name: string;
  };
  stats: {
    downloads: number;
    likes: number;
    views: number;
  };
  isLiked: boolean;
  createdAt: string;
}

export default function SharedCharactersPage() {
  const t = useTranslations('community.share.characters');
  const [characters, setCharacters] = useState<SharedCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>('popular');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    loadCharacters();
  }, [sortBy, selectedCategory, selectedTags]);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sortBy) params.append('sort', sortBy);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','));
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/community/marketplace/characters?${params}`);
      const data = await response.json();
      setCharacters(data.characters || []);
    } catch (error) {
      console.error('Error loading characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCharacters();
  };

  const categories = [
    { id: 'anime', label: t('categories.anime'), color: 'from-pink-500 to-purple-500' },
    { id: 'realistic', label: t('categories.realistic'), color: 'from-blue-500 to-cyan-500' },
    { id: 'fantasy', label: t('categories.fantasy'), color: 'from-purple-500 to-pink-500' },
    { id: 'sci-fi', label: t('categories.sciFi'), color: 'from-cyan-500 to-blue-500' },
    { id: 'historical', label: t('categories.historical'), color: 'from-amber-500 to-orange-500' },
    { id: 'gaming', label: t('categories.gaming'), color: 'from-green-500 to-emerald-500' },
  ];

  const sortOptions = [
    { value: 'popular' as SortType, label: t('sort.popular'), icon: TrendingUp },
    { value: 'new' as SortType, label: t('sort.new'), icon: Clock },
    { value: 'liked' as SortType, label: t('sort.liked'), icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-1">
                {t('header.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('header.subtitle', { count: characters.length })}
              </p>
            </div>
            <Link href="/community/share">
              <Button variant="outline" size="sm">
                {t('header.back')}
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              {t('search.button')}
            </Button>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium",
                !selectedCategory
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent hover:bg-accent/80 text-muted-foreground"
              )}
            >
              {t('categories.all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium",
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white`
                    : "bg-accent hover:bg-accent/80 text-muted-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-2xl transition-all text-sm",
                  sortBy === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground"
                )}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : characters.length === 0 ? (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Sparkles className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('empty.description')}
            </p>
            <Link href="/dashboard">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                {t('empty.button')}
              </Button>
            </Link>
          </motion.div>
        ) : (
          // Characters Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {characters.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <SharedAICard character={character} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
