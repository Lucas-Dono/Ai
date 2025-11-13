/**
 * Shared Themes - Galería de temas del chat compartidos
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Palette,
  Download,
  Eye,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LikeButton } from "@/components/community/LikeButton";
import { CreatorBadge } from "@/components/community/CreatorBadge";
import { useTranslations } from "next-intl";

type SortType = 'popular' | 'new' | 'liked';

interface SharedTheme {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  userBubbleColor: string;
  agentBubbleColor: string;
  backgroundColor: string;
  backgroundGradient?: string[];
  accentColor: string;
  textColor?: string;
  backgroundImage?: string;
  author: {
    id: string;
    name: string;
    reputation: number;
  };
  stats: {
    downloads: number;
    likes: number;
  };
  isLiked: boolean;
  createdAt: string;
}

export default function SharedThemesPage() {
  const t = useTranslations('community.share.themes');
  const [themes, setThemes] = useState<SharedTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>('popular');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadThemes();
  }, [sortBy, selectedCategory]);

  const loadThemes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sortBy === 'popular') params.append('sort', 'downloads');
      else if (sortBy === 'new') params.append('sort', 'newest');
      else if (sortBy === 'liked') params.append('sort', 'rating');
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/marketplace/themes?${params}`);
      const data = await response.json();
      setThemes(data.themes || []);
    } catch (error) {
      console.error('Error loading themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'dark', label: t('categories.dark'), color: 'from-gray-700 to-gray-900' },
    { id: 'light', label: t('categories.light'), color: 'from-gray-100 to-gray-300' },
    { id: 'colorful', label: t('categories.colorful'), color: 'from-pink-500 via-purple-500 to-blue-500' },
    { id: 'minimal', label: t('categories.minimal'), color: 'from-gray-400 to-gray-600' },
    { id: 'anime', label: t('categories.anime'), color: 'from-pink-400 to-purple-400' },
    { id: 'nature', label: t('categories.nature'), color: 'from-green-400 to-emerald-500' },
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
                {t('header.subtitle', { count: themes.length })}
              </p>
            </div>
            <Link href="/community/share">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
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
                onKeyDown={(e) => e.key === 'Enter' && loadThemes()}
                className="pl-10"
              />
            </div>
            <Button onClick={loadThemes}>{t('search.button')}</Button>
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

          {/* Sort */}
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
        ) : themes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <Palette className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('empty.description')}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {themes.map((theme, index) => (
                <motion.div
                  key={theme.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ThemeCard theme={theme} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme }: { theme: SharedTheme }) {
  const t = useTranslations('community.share.themes.card');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    try {
      setApplying(true);
      // TODO: Implement apply theme logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplied(true);
    } catch (error) {
      console.error('Error applying theme:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all group">
      {/* Preview */}
      <div
        className="relative aspect-video p-4"
        style={{
          background: theme.backgroundGradient
            ? `linear-gradient(135deg, ${theme.backgroundGradient.join(', ')})`
            : theme.backgroundColor,
        }}
      >
        {theme.backgroundImage && (
          <img
            src={theme.backgroundImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}

        {/* Chat Bubbles Preview */}
        <div className="relative space-y-2">
          <div className="flex justify-end">
            <div
              className="px-3 py-2 rounded-2xl text-xs max-w-[70%]"
              style={{
                backgroundColor: theme.userBubbleColor,
                color: theme.textColor || '#ffffff',
              }}
            >
              {t('preview.userMessage')}
            </div>
          </div>
          <div className="flex justify-start">
            <div
              className="px-3 py-2 rounded-2xl text-xs max-w-[70%]"
              style={{
                backgroundColor: theme.agentBubbleColor,
                color: theme.textColor || '#ffffff',
              }}
            >
              {t('preview.aiResponse')}
            </div>
          </div>
        </div>

        {/* Like Button */}
        <div className="absolute top-2 right-2">
          <LikeButton
            itemId={theme.id}
            itemType="theme"
            initialLiked={theme.isLiked}
            initialLikes={theme.stats.likes}
            size="sm"
            showCount={false}
          />
        </div>

        {/* Category */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs">
            {theme.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {theme.name}
        </h3>
        {theme.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {theme.description}
          </p>
        )}

        {/* Tags */}
        {theme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {theme.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author & Stats */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium">{theme.author.name}</span>
            <CreatorBadge reputation={theme.author.reputation} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {theme.stats.downloads}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button
          onClick={handleApply}
          disabled={applying || applied}
          className="w-full gap-2"
          size="sm"
        >
          {applying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              {t('applying')}
            </>
          ) : applied ? (
            <>
              <CheckCircle className="h-4 w-4" />
              {t('applied')}
            </>
          ) : (
            <>
              <Palette className="h-4 w-4" />
              {t('apply')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
