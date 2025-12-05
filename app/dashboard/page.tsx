"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Network,
  Users,
  Copy,
  Crown,
  Play,
  Heart,
  Search,
  Filter,
  Sparkles,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { TrendingWorldsCarousel } from "@/components/worlds/TrendingWorldsCarousel";
import { RecommendedForYou } from "@/components/recommendations/RecommendedForYou";
import { SpecialEventBanner } from "@/components/upgrade/SpecialEventBanner";
import { PullToRefresh } from "@/components/mobile/PullToRefresh";
import { EmptyState } from "@/components/ui/empty-states/EmptyState";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { ErrorBoundary } from "@/components/error-boundary";
import { useTranslations } from "next-intl";
import { ProactiveMessagesWidget } from "@/components/dashboard/ProactiveMessagesWidget";
import { useSession } from "next-auth/react";
import { FilterBar, type FilterState } from "@/components/dashboard/FilterBar";

interface Agent {
  id: string;
  name: string;
  kind: string;
  description?: string;
  userId?: string | null;
  featured?: boolean;
  cloneCount?: number;
  avatar?: string | null;
  createdAt?: string;
  rating?: number | null;
  visibility?: string | null;
  nsfwMode?: boolean | null;
  nsfwLevel?: string | null;
  generationTier?: string | null;
  tags?: string[] | null;
  _count?: {
    reviews: number;
  };
}

interface World {
  id: string;
  name: string;
  description?: string;
  category?: string;
  difficulty?: string;
  featured?: boolean;
  isPredefined?: boolean;
  agents?: Agent[];
  agentCount?: number;
  interactionCount?: number;
}

// Helper function to get category color
const getCategoryColor = (index: number) => {
  const colors = [
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "bg-pink-500/20 text-pink-400 border-pink-500/30",
    "bg-green-500/20 text-green-400 border-green-500/30",
    "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ];
  return colors[index % colors.length];
};

// Helper to extract tags from description or name
const extractTags = (agent: Agent, t: any): string[] => {
  const tags: string[] = [];

  // Common patterns
  if (agent.description?.toLowerCase().includes("científico") || agent.description?.toLowerCase().includes("ciencia")) {
    tags.push(t("tags.science"));
  }
  if (agent.description?.toLowerCase().includes("físic")) {
    tags.push(t("tags.physics"));
  }
  if (agent.description?.toLowerCase().includes("arte") || agent.description?.toLowerCase().includes("artista")) {
    tags.push(t("tags.art"));
  }
  if (agent.description?.toLowerCase().includes("historia") || agent.description?.toLowerCase().includes("históric")) {
    tags.push(t("tags.history"));
  }
  if (agent.description?.toLowerCase().includes("genio") || agent.description?.toLowerCase().includes("inteligente")) {
    tags.push(t("tags.genius"));
  }
  if (agent.description?.toLowerCase().includes("cine") || agent.description?.toLowerCase().includes("actor")) {
    tags.push(t("tags.cinema"));
  }

  // If no tags found, add generic ones
  if (tags.length === 0) {
    if (agent.featured) tags.push(t("tags.premium"));
    tags.push(t("tags.companion"));
  }

  return tags.slice(0, 3);
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    kind: 'all',
    visibility: 'all',
    tier: 'all',
    nsfw: 'all',
    sortBy: 'newest',
  });

  const isAuthenticated = sessionStatus === "authenticated";

  // Check URL params for initial tab
  const filterParam = searchParams?.get('filter');
  const initialTab = filterParam === 'companion' ? 'companions' : 'companions';

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchWorlds = async () => {
    try {
      const res = await fetch("/api/worlds");
      if (res.ok) {
        const data = await res.json();
        setWorlds(data.worlds || []);
      }
    } catch (error) {
      console.error("Error fetching worlds:", error);
    }
  };

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await Promise.all([fetchAgents(), fetchWorlds()]);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAgents(), fetchWorlds()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(t("actions.deleteConfirm", { name: agentName }))) {
      return;
    }

    setDeleting(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAgents(agents.filter((a) => a.id !== agentId));
      } else {
        const error = await res.json();
        alert(error.error || t("actions.deleteError"));
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert(t("actions.deleteError"));
    } finally {
      setDeleting(null);
    }
  };

  const handleCloneWorld = async (worldId: string, worldName: string) => {
    try {
      const res = await fetch(`/api/worlds/${worldId}/clone`, {
        method: "POST",
      });

      if (res.ok) {
        alert(t("actions.cloneSuccess", { name: worldName }));
        fetchWorlds();
      } else {
        throw new Error("Failed to clone");
      }
    } catch (error) {
      console.error("Error cloning world:", error);
      alert(t("actions.cloneError"));
    }
  };

  // Apply all filters
  const companions = agents.filter((a) => a.kind === "companion");

  const filteredCompanions = companions.filter((companion) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = companion.name.toLowerCase().includes(searchLower);
      const matchesDesc = (companion.description?.toLowerCase() || '').includes(searchLower);
      if (!matchesName && !matchesDesc) return false;
    }

    // Kind filter (already filtered by companion above, but keeping for consistency)
    if (filters.kind !== 'all' && companion.kind !== filters.kind) {
      return false;
    }

    // Visibility filter
    if (filters.visibility !== 'all') {
      if (filters.visibility === 'private' && companion.visibility !== 'private') {
        return false;
      }
      if (filters.visibility === 'public' && companion.visibility !== 'public') {
        return false;
      }
    }

    // Tier filter
    if (filters.tier !== 'all') {
      if (companion.generationTier !== filters.tier) {
        return false;
      }
    }

    // NSFW filter
    if (filters.nsfw !== 'all') {
      const isNSFW = companion.nsfwMode || (companion.nsfwLevel && companion.nsfwLevel !== 'sfw');
      if (filters.nsfw === 'sfw' && isNSFW) {
        return false;
      }
      if (filters.nsfw === 'nsfw' && !isNSFW) {
        return false;
      }
    }

    // Categories filter
    if (filters.categories.length > 0) {
      const agentTags = Array.isArray(companion.tags) ? companion.tags : [];
      const hasMatchingCategory = filters.categories.some(cat =>
        agentTags.some(tag => tag.toLowerCase().includes(cat.toLowerCase()))
      );
      if (!hasMatchingCategory) {
        return false;
      }
    }

    return true;
  });

  // Sort companions
  const sortedCompanions = [...filteredCompanions].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case 'oldest':
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case 'mostUsed':
        return (b.cloneCount || 0) - (a.cloneCount || 0);
      case 'nameAZ':
        return a.name.localeCompare(b.name);
      case 'nameZA':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Categorizar compañeros (usando sortedCompanions)
  const recommendedCompanions = sortedCompanions.filter(
    (a) => a.userId === null && a.featured === true
  );
  const myCompanions = sortedCompanions.filter((a) => a.userId !== null);
  const popularCompanions = sortedCompanions.filter(
    (a) => a.userId === null && !a.featured && (a.cloneCount || 0) > 0
  );
  const otherCompanions = sortedCompanions.filter(
    (a) => a.userId === null && !a.featured && (a.cloneCount || 0) === 0
  );

  const predefinedWorlds = worlds.filter((w) => w.isPredefined);
  const userWorlds = worlds.filter((w) => !w.isPredefined);

  return (
    <ErrorBoundary variant="page">
    <div className="min-h-screen" data-tour="dashboard-main">
      {/* Proactive Messages Widget - PROMINENT DISPLAY (only for authenticated users) */}
      {isAuthenticated && <ProactiveMessagesWidget />}

      {/* Main Content with Pull-to-Refresh */}
      <PullToRefresh onRefresh={handleRefresh} className="lg:h-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingIndicator
              variant="inline"
              size="lg"
              message={t("loading.dashboard")}
            />
          </div>
        ) : (
          <Tabs defaultValue={initialTab} className="space-y-4 md:space-y-6">
          <TabsList className="md-surface-container-high p-1 rounded-2xl w-full md:w-auto overflow-x-auto">
            <TabsTrigger
              value="companions"
              className="px-4 md:px-6 py-2.5 rounded-2xl data-[state=active]:md-surface-container-highest data-[state=active]:shadow-sm whitespace-nowrap flex-1 md:flex-none"
            >
              <Heart className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t("tabs.companions", { count: companions.length })}</span>
              <span className="md:hidden text-xs ml-1">{companions.length}</span>
            </TabsTrigger>
            <TabsTrigger
              value="worlds"
              className="px-4 md:px-6 py-2.5 rounded-2xl data-[state=active]:md-surface-container-highest data-[state=active]:shadow-sm whitespace-nowrap flex-1 md:flex-none"
            >
              <Network className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">{t("tabs.worlds", { count: worlds.length })}</span>
              <span className="md:hidden text-xs ml-1">{worlds.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Companions Tab */}
          <TabsContent value="companions" className="space-y-6 md:space-y-8">
            {/* AI Recommendations */}
            <RecommendedForYou />

            {/* Filter Bar */}
            <div className="lg:relative sticky top-0 lg:top-auto z-30 lg:z-auto -mx-4 lg:mx-0 px-4 lg:px-0 py-3 lg:py-0 bg-[#0B0F1A]/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-b lg:border-b-0 border-gray-800/50 lg:border-transparent">
              <FilterBar filters={filters} onFiltersChange={setFilters} />
            </div>

            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold md-text-primary">{t("sections.companions.title")}</h2>
                <p className="text-xs md:text-sm md-text-secondary mt-1">
                  {t("sections.companions.count", {
                    count: sortedCompanions.length,
                    companion: sortedCompanions.length === 1 ? t("sections.companions.companionSingular") : t("sections.companions.companionPlural")
                  })}
                </p>
              </div>
              <Link href="/create-character" className="hidden md:block">
                <Button className="md-button md-button-filled px-4 md:px-6 py-2.5">
                  <Plus className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">{t("actions.newCompanion")}</span>
                  <span className="sm:hidden">{t("actions.new")}</span>
                </Button>
              </Link>
            </div>

            {companions.length === 0 ? (
              <EmptyState
                icon={Heart}
                iconColor="text-pink-400 dark:text-pink-500"
                gradientFrom="from-pink-100"
                gradientTo="to-rose-100"
                title={t("empty.companions.title")}
                description={t("empty.companions.description")}
                actionLabel={t("empty.companions.action")}
                onAction={() => router.push("/create-character")}
              />
            ) : (
              <>
                {/* NOTE: Recomendados Section removed - Now handled by RecommendedForYou component above with category system */}

                {/* Creados por ti Section - Enhanced (only for authenticated users) */}
                {isAuthenticated && myCompanions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
                      <div className="flex items-center gap-2 md:gap-3">
                        <Heart className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
                        <h2 className="text-xl md:text-2xl font-bold">{t("sections.myCompanions.title")}</h2>
                        <span className="text-xs md:text-sm text-gray-400">{myCompanions.length}</span>
                      </div>
                      <Link href="/create-character" className="hidden md:block">
                        <Button className="bg-purple-600 hover:bg-purple-700 px-3 md:px-4 py-2 rounded-2xl flex items-center gap-2 transition-all duration-300 text-sm md:text-base">
                          <Plus className="w-4 h-4" />
                          <span className="hidden sm:inline">{t("actions.newCompanion")}</span>
                        </Button>
                      </Link>
                    </div>
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {myCompanions.map((agent, idx) => {
                        const hoursSinceCreated = agent.createdAt
                          ? Math.floor((Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60))
                          : 0;
                        const displayTime = hoursSinceCreated < 24
                          ? t("sections.myCompanions.hoursAgo", { hours: hoursSinceCreated })
                          : t("sections.myCompanions.daysAgo", { days: Math.floor(hoursSinceCreated / 24) });

                        return (
                          <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: idx * 0.05,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          >
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group">
                              <div className="flex items-start gap-4 mb-4">
                                <Link href={`/agentes/${agent.id}`} className="flex-shrink-0">
                                  {agent.avatar ? (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg transition-all cursor-pointer group-hover:scale-110">
                                      <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <Avatar
                                      className="w-16 h-16 rounded-2xl shadow-lg transition-all cursor-pointer group-hover:scale-110"
                                      style={{ background: generateGradient(agent.name) }}
                                    >
                                      <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                                        {getInitials(agent.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </Link>

                                <div className="flex-1 min-w-0">
                                  <Link href={`/agentes/${agent.id}`}>
                                    <h3 className="text-lg font-bold md-text-primary hover:underline cursor-pointer mb-1">
                                      {agent.name}
                                    </h3>
                                  </Link>
                                  <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                                    <Clock className="w-3 h-3" />
                                    {displayTime}
                                  </p>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="md-list-item p-2 rounded-full h-8 w-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreVertical className="h-4 w-4 md-text-secondary" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="md-card p-1">
                                    <Link href={`/agentes/${agent.id}/edit`}>
                                      <DropdownMenuItem className="md-list-item cursor-pointer">
                                        <Edit className="h-4 w-4 mr-2" />
                                        {t("actions.edit")}
                                      </DropdownMenuItem>
                                    </Link>
                                    <DropdownMenuSeparator className="my-1" />
                                    <DropdownMenuItem
                                      className="md-list-item cursor-pointer text-destructive"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteAgent(agent.id, agent.name);
                                      }}
                                      disabled={deleting === agent.id}
                                    >
                                      {deleting === agent.id ? (
                                        <LoadingIndicator variant="spinner" size="sm" className="mr-2" />
                                      ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                      )}
                                      {t("actions.delete")}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              {agent.description && (
                                <p className="text-sm text-gray-300 mb-4 line-clamp-2">{agent.description}</p>
                              )}

                              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {t("sections.myCompanions.messages", { count: (agent.cloneCount || 0) * 2 })}
                                </span>
                              </div>

                              <Link href={`/agentes/${agent.id}`} className="block">
                                <Button className="w-full bg-gray-700/50 hover:bg-purple-600 text-white py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
                                  <MessageCircle className="w-4 h-4" />
                                  {t("actions.openChat")}
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Más vistos Section - Enhanced */}
                {popularCompanions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                      <h2 className="text-xl md:text-2xl font-bold">{t("sections.popular.title")}</h2>
                      <span className="text-xs md:text-sm text-gray-400 bg-blue-500/10 px-2 md:px-3 py-1 rounded-full border border-blue-500/20">
                        {t("tags.popular")}
                      </span>
                    </div>
                    <div className="grid gap-3 md:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                      {popularCompanions.slice(0, 6).map((agent, idx) => {
                        const isNew = agent.createdAt &&
                          (Date.now() - new Date(agent.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

                        return (
                          <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: idx * 0.05,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          >
                            <Link href={`/agentes/${agent.id}`}>
                              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-110 cursor-pointer group relative">
                                {isNew && (
                                  <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold z-10">
                                    {t("tags.new").toUpperCase()}
                                  </div>
                                )}
                                {agent.avatar ? (
                                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 h-16 w-16 mx-auto rounded-2xl overflow-hidden">
                                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
                                    <Avatar
                                      className="h-16 w-16 mx-auto"
                                      style={{ background: generateGradient(agent.name) }}
                                    >
                                      <AvatarFallback className="text-white text-xl font-semibold bg-transparent">
                                        {getInitials(agent.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                )}
                                <h4 className="text-sm font-semibold mb-1 truncate text-center">{agent.name}</h4>
                                <p className="text-xs text-gray-400 mb-2 text-center">{extractTags(agent, t)[0] || t("tags.companion")}</p>
                                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                  <MessageCircle className="w-3 h-3" />
                                  {agent.cloneCount}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Todos Section - Collapsed by default */}
                {otherCompanions.length > 0 && (
                  <details className="group">
                    <summary className="flex items-center gap-2 mb-4 cursor-pointer list-none">
                      <div className="flex items-center gap-2 flex-1">
                        <Network className="h-5 w-5 md-text-secondary" />
                        <h3 className="text-xl font-semibold md-text-primary">{t("sections.all.title")}</h3>
                        <span className="text-xs md-text-secondary bg-muted px-2 py-1 rounded-full">
                          {t("sections.all.more", { count: otherCompanions.length })}
                        </span>
                      </div>
                      <span className="text-sm md-text-secondary group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {otherCompanions.map((agent, idx) => (
                        <motion.div
                          key={agent.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: idx * 0.05,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        >
                          <div className="md-card p-6 group hover-lift-glow">
                            <div className="flex items-start gap-4 mb-4">
                              <Link href={`/agentes/${agent.id}`} className="flex-shrink-0">
                                <Avatar
                                  className="h-14 w-14 border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer md-shape-lg"
                                  style={{ background: generateGradient(agent.name) }}
                                >
                                  <AvatarFallback className="text-white text-lg font-semibold bg-transparent">
                                    {getInitials(agent.name)}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>

                              <div className="flex-1 min-w-0">
                                <Link href={`/agentes/${agent.id}`}>
                                  <h3 className="text-lg font-semibold md-text-primary truncate hover:underline cursor-pointer">
                                    {agent.name}
                                  </h3>
                                </Link>
                                {agent.description && (
                                  <p className="text-sm md-text-secondary line-clamp-2 mt-1">
                                    {agent.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <Link href={`/agentes/${agent.id}`} className="block">
                              <Button className="w-full md-button md-button-tonal py-2.5 mt-2">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                {t("actions.openChat")}
                              </Button>
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </details>
                )}
              </>
            )}
          </TabsContent>

          {/* Worlds Tab */}
          <TabsContent value="worlds" className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold md-text-primary">{t("worlds.title")}</h2>
                <p className="text-sm md-text-secondary mt-1">
                  {t("worlds.subtitle")}
                </p>
              </div>
              <Link href="/dashboard/mundos">
                <Button variant="outline" className="px-6 py-2.5">
                  {t("worlds.viewAll")}
                </Button>
              </Link>
            </div>

            {/* Trending Worlds Carousel */}
            <TrendingWorldsCarousel />

            {/* Featured Predefined Worlds */}
            {predefinedWorlds.filter((w) => w.featured).length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <h2 className="text-2xl font-bold">{t("worlds.featured.title")}</h2>
                  <span className="text-sm text-gray-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    {t("worlds.featured.badge")}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {predefinedWorlds
                    .filter((w) => w.featured)
                    .slice(0, 3)
                    .map((world, idx) => (
                      <motion.div
                        key={world.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: idx * 0.05,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                      >
                        <div className="md-card p-6 group">
                          <div className="flex items-start gap-4 mb-4">
                            <div
                              className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                              style={{ background: generateGradient(world.name) }}
                            >
                              <Network className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold md-text-primary truncate">
                                {world.name}
                              </h3>
                              <p className="text-sm md-text-secondary line-clamp-2 mt-1">
                                {world.description || t("worlds.noDescription")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm md-text-secondary mb-4">
                            <span className="flex items-center gap-1.5">
                              <Users className="h-4 w-4" />
                              {world.agentCount || 0}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MessageCircle className="h-4 w-4" />
                              {world.interactionCount || 0}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Link href={`/dashboard/mundos/${world.id}`} className="flex-1">
                              <Button variant="outline" className="w-full md-button-tonal py-2.5">
                                <Play className="h-4 w-4 mr-2" />
                                {t("actions.view")}
                              </Button>
                            </Link>
                            <Button
                              className="flex-1 md-button md-button-filled py-2.5"
                              onClick={() => handleCloneWorld(world.id, world.name)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              {t("actions.clone")}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            )}

            {/* User Worlds */}
            {userWorlds.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold md-text-primary mb-4">{t("worlds.myWorlds")}</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {userWorlds.slice(0, 3).map((world, idx) => (
                    <motion.div
                      key={world.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: idx * 0.05,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                    >
                      <div className="md-card p-6 hover-lift-glow">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ background: generateGradient(world.name) }}
                          >
                            <Network className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold md-text-primary truncate">
                              {world.name}
                            </h3>
                            <p className="text-sm md-text-secondary line-clamp-2 mt-1">
                              {world.description || t("worlds.noDescription")}
                            </p>
                          </div>
                        </div>

                        <Link href={`/dashboard/mundos/${world.id}`} className="block">
                          <Button className="w-full md-button md-button-tonal py-2.5">
                            <Play className="h-4 w-4 mr-2" />
                            {t("worlds.openWorld")}
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {worlds.length === 0 && (
              <EmptyState
                icon={Network}
                iconColor="text-blue-400 dark:text-blue-500"
                gradientFrom="from-blue-100"
                gradientTo="to-cyan-100"
                title={t("empty.worlds.title")}
                description={t("empty.worlds.description")}
                actionLabel={t("empty.worlds.action")}
                onAction={() => router.push("/dashboard/mundos")}
              />
            )}
          </TabsContent>
        </Tabs>
        )}
      </PullToRefresh>

      {/* FAB - Floating Action Button */}
      <Link href="/create-character" data-tour="create-ai-button-fab">
        <button className="md-fab md-fab-extended" title={t("actions.createNewAI")}>
          <Plus className="h-6 w-6" />
          <span className="font-medium">{t("actions.newAI")}</span>
        </button>
      </Link>
    </div>
    </ErrorBoundary>
  );
}
