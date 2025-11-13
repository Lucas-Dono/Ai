/**
 * Community Share Hub - Centro de compartir creaciones
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Search,
  Users,
  MessageSquare,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useTranslations } from "next-intl";

type ShareTab = 'characters' | 'prompts' | 'themes';
type SortType = 'featured' | 'trending' | 'new';

export default function ShareHubPage() {
  const t = useTranslations('community.share');
  const [activeTab, setActiveTab] = useState<ShareTab>('characters');
  const [sortBy, setSortBy] = useState<SortType>('featured');
  const [searchQuery, setSearchQuery] = useState("");

  const sortOptions = [
    { value: 'featured' as SortType, label: t('sort.featured'), icon: Star },
    { value: 'trending' as SortType, label: t('sort.trending'), icon: TrendingUp },
    { value: 'new' as SortType, label: t('sort.new'), icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-blue-300 bg-clip-text text-transparent mb-2">
                {t('header.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('header.subtitle')}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ShareTab)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-14">
              <TabsTrigger value="characters" className="gap-2 text-base">
                <Users className="h-5 w-5" />
                {t('tabs.characters')}
              </TabsTrigger>
              <TabsTrigger value="prompts" className="gap-2 text-base">
                <MessageSquare className="h-5 w-5" />
                {t('tabs.prompts')}
              </TabsTrigger>
              <TabsTrigger value="themes" className="gap-2 text-base">
                <Palette className="h-5 w-5" />
                {t('tabs.themes')}
              </TabsTrigger>
            </TabsList>

            {/* Sort Options */}
            <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all",
                    sortBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent hover:bg-accent/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>

            <TabsContent value="characters" className="mt-8">
              <CharactersSection sortBy={sortBy} searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="prompts" className="mt-8">
              <PromptsSection sortBy={sortBy} searchQuery={searchQuery} />
            </TabsContent>

            <TabsContent value="themes" className="mt-8">
              <ThemesSection sortBy={sortBy} searchQuery={searchQuery} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Placeholder sections
function CharactersSection({ sortBy, searchQuery }: { sortBy: SortType; searchQuery: string }) {
  const t = useTranslations('community.share.sections.characters');
  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="text-center py-12">
        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">{t('title')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('description')}
        </p>
        <Link href="/community/share/characters">
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            {t('button')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function PromptsSection({ sortBy, searchQuery }: { sortBy: SortType; searchQuery: string }) {
  const t = useTranslations('community.share.sections.prompts');
  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">{t('title')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('description')}
        </p>
        <Link href="/community/share/prompts">
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            {t('button')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ThemesSection({ sortBy, searchQuery }: { sortBy: SortType; searchQuery: string }) {
  const t = useTranslations('community.share.sections.themes');
  return (
    <div className="max-w-7xl mx-auto px-6 pb-12">
      <div className="text-center py-12">
        <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">{t('title')}</h3>
        <p className="text-muted-foreground mb-6">
          {t('description')}
        </p>
        <Link href="/community/share/themes">
          <Button>
            <Sparkles className="h-4 w-4 mr-2" />
            {t('button')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
