/**
 * Shared Prompts - Lista de prompts compartidos por la comunidad
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Copy,
  Heart,
  Download,
  CheckCircle,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
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

interface SharedPrompt {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  systemPrompt: string;
  exampleInputs: string[];
  exampleOutputs: string[];
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

export default function SharedPromptsPage() {
  const t = useTranslations('community.share.prompts');
  const [prompts, setPrompts] = useState<SharedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortType>('popular');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadPrompts();
  }, [sortBy, selectedCategory]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (sortBy) params.append('sort', sortBy);
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/community/marketplace/prompts?${params}`);
      const data = await response.json();
      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error loading prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'personality', label: t('categories.personality'), color: 'from-pink-500 to-purple-500' },
    { id: 'roleplay', label: t('categories.roleplay'), color: 'from-purple-500 to-indigo-500' },
    { id: 'assistant', label: t('categories.assistant'), color: 'from-blue-500 to-cyan-500' },
    { id: 'creative', label: t('categories.creative'), color: 'from-orange-500 to-pink-500' },
    { id: 'educational', label: t('categories.educational'), color: 'from-green-500 to-emerald-500' },
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
                {t('header.subtitle', { count: prompts.length })}
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
                onKeyDown={(e) => e.key === 'Enter' && loadPrompts()}
                className="pl-10"
              />
            </div>
            <Button onClick={loadPrompts}>{t('search.button')}</Button>
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
        ) : prompts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <MessageSquare className="h-20 w-20 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-bold mb-2">{t('empty.title')}</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('empty.description')}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {prompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PromptCard prompt={prompt} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

function PromptCard({ prompt }: { prompt: SharedPrompt }) {
  const t = useTranslations('community.share.prompts.card');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.systemPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{prompt.name}</h3>
            <Badge variant="secondary">{prompt.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {prompt.description}
          </p>
          {prompt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prompt.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <LikeButton
          itemId={prompt.id}
          itemType="prompt"
          initialLiked={prompt.isLiked}
          initialLikes={prompt.stats.likes}
        />
      </div>

      {/* Prompt Preview */}
      <div className="bg-accent/50 border border-border rounded-2xl p-4 mb-4">
        <p className="text-sm font-mono text-muted-foreground line-clamp-3">
          {prompt.systemPrompt}
        </p>
      </div>

      {/* Actions & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{prompt.author.name}</span>
            <CreatorBadge reputation={prompt.author.reputation} />
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            {prompt.stats.downloads}
          </div>
        </div>

        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copied ? (
            <>
              <CheckCircle className="h-4 w-4" />
              {t('copied')}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {t('copy')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
