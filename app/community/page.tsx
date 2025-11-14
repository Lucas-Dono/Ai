/**
 * Community Feed Page - Feed principal mejorado con filtros B2C
 */

"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Clock,
  Star,
  Users,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  HelpCircle,
  BookOpen,
  Filter,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useFeed, type FeedFilter, type PostType } from "@/hooks/useFeed";
import { PostCard } from "@/components/community";
import { useTranslations } from "next-intl";
import { usePopularCommunities } from "@/hooks/usePopularCommunities";
import { ModerationSuggestions } from "@/components/moderation/ModerationSuggestions";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { EmptyFeed } from "@/components/ui/empty-states/empty-feed";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorBoundary } from "@/components/error-boundary";

export default function CommunityPage() {
  const t = useTranslations('community');
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isAuthenticated = sessionStatus === "authenticated";
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('hot');
  const [postType, setPostType] = useState<PostType>('all');
  const [searchQuery, setSearchQuery] = useState("");

  const { posts, loading, votePost, savePost, loadMore, hasMore, refresh } = useFeed({
    filter: feedFilter,
    postType,
  });

  const { communities: popularCommunities, loading: communitiesLoading } = usePopularCommunities({
    limit: 3,
  });

  const feedTabs = [
    { type: 'hot' as FeedFilter, label: t('filters.feed.hot'), icon: TrendingUp },
    { type: 'new' as FeedFilter, label: t('filters.feed.new'), icon: Clock },
    { type: 'top' as FeedFilter, label: t('filters.feed.top'), icon: Star },
    { type: 'following' as FeedFilter, label: t('filters.feed.following'), icon: Users },
  ];

  const postTypeTabs = [
    { type: 'all' as PostType, label: t('filters.postType.all'), icon: Filter },
    { type: 'showcase' as PostType, label: t('filters.postType.showcase'), icon: Sparkles },
    { type: 'discussion' as PostType, label: t('filters.postType.discussion'), icon: MessageSquare },
    { type: 'question' as PostType, label: t('filters.postType.question'), icon: HelpCircle },
    { type: 'guide' as PostType, label: t('filters.postType.guide'), icon: BookOpen },
  ];

  return (
    <ErrorBoundary variant="page">
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 lg:pb-0" data-tour="community-feed">
      {/* Hero Header */}
      <div className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur-xl safe-area-inset-top">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-1 md:mb-2">
                {t('header.title')}
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm">
                {t('header.subtitle')}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={isAuthenticated ? "/community/share" : "/login?callbackUrl=/community/share"}>
                <Button variant="outline" size="lg" className="gap-2 min-h-[44px] md:min-h-0">
                  <Sparkles className="h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden sm:inline">{t('header.shareHub')}</span>
                </Button>
              </Link>
              <Link href={isAuthenticated ? "/community/create" : "/login?callbackUrl=/community/create"}>
                <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 min-h-[44px] md:min-h-0" data-tour="create-post-button">
                  <Plus className="h-4 md:h-5 w-4 md:w-5" />
                  <span className="hidden sm:inline">
                    {isAuthenticated ? t('header.createPost') : 'Registrarse para crear'}
                  </span>
                  <span className="sm:hidden">
                    {isAuthenticated ? t('header.createPostShort') : 'Registro'}
                  </span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Anonymous User Banner */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-3 md:p-4 mb-3 md:mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                  <UserCircle2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    Navegando como invitado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Regístrate para crear posts, comentar y votar
                  </p>
                </div>
                <Link href="/login?callbackUrl=/community">
                  <Button size="sm" variant="outline" className="hidden sm:flex">
                    Iniciar sesión
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-3 md:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 h-11 md:h-10"
            />
          </div>

          {/* Feed Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3 -mx-4 px-4 md:mx-0 md:px-0" data-tour="feed-filters">
            {feedTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setFeedFilter(tab.type)}
                className={cn(
                  "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-full whitespace-nowrap transition-all min-h-[44px] md:min-h-0",
                  feedFilter === tab.type
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                    : "bg-background/50 hover:bg-background/80 text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span className="text-xs md:text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Post Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0" data-tour="post-type-filters">
            {postTypeTabs.map((tab) => (
              <button
                key={tab.type}
                onClick={() => setPostType(tab.type)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap transition-all text-[10px] md:text-xs font-semibold min-h-[36px] md:min-h-0",
                  postType === tab.type
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-background/30 hover:bg-background/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content with Pull-to-Refresh */}
      <PullToRefresh onRefresh={refresh} className="lg:h-auto">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 md:py-20">
                <LoadingIndicator
                  variant="inline"
                  size="lg"
                  message={t('loading.feed')}
                />
              </div>
            ) : posts.length === 0 ? (
              // Empty State - Using EmptyFeed component
              <EmptyFeed
                title={t('empty.title')}
                description={t('empty.description')}
                actionLabel={t('empty.button')}
                onAction={() => router.push('/community/create')}
              />
            ) : (
              <>
                {/* Posts List */}
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PostCard
                        post={post}
                        onVote={votePost}
                        onSave={savePost}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={loadMore}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                      className="min-h-[44px]"
                    >
                      {loading ? t('loadMore.loading') : t('loadMore.button')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar - Hidden on mobile */}
          <div className="hidden lg:block space-y-4">
            {/* Moderation Suggestions */}
            <ModerationSuggestions maxSuggestions={2} compact={true} />

            {/* Popular Communities */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4" data-tour="popular-communities">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {t('sidebar.popularCommunities.title')}
              </h3>

              {communitiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-accent/30 rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : popularCommunities.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('sidebar.popularCommunities.noCommunities') || 'Aún no hay comunidades creadas'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('sidebar.popularCommunities.beFirst') || '¡Sé el primero en crear una!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {popularCommunities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/community/${community.slug}`}
                      className="block hover:bg-accent/50 rounded-2xl p-2 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: community.primaryColor }}
                        />
                        <span className="font-semibold text-sm">{community.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('sidebar.popularCommunities.members', {
                          count: community.memberCount.toLocaleString()
                        })}
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Link href="/community/explore" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    {t('sidebar.popularCommunities.viewAll')}
                  </Button>
                </Link>
                <Link href="/community/communities/create" className="flex-1">
                  <Button size="sm" className="w-full gap-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="h-3 w-3" />
                    {t('sidebar.popularCommunities.create')}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
              <h3 className="font-semibold mb-3 text-sm">{t('sidebar.guidelines.title')}</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />
                  <span>{t('sidebar.guidelines.rule1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />
                  <span>{t('sidebar.guidelines.rule2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />
                  <span>{t('sidebar.guidelines.rule3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1" />
                  <span>{t('sidebar.guidelines.rule4')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
      </PullToRefresh>
    </div>
    </ErrorBoundary>
  );
}
