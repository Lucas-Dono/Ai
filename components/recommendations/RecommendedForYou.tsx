"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Star,
  MessageCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { CompanionCard } from "@/components/companions/CompanionCard";
import { CompanionCardSkeleton } from "@/components/companions/CompanionCardSkeleton";
import { CategoryBasedRecommendations } from "@/components/recommendations/CategoryBasedRecommendations";
import type { CategoryKey } from "@/lib/categories";
import { Carousel } from "@/components/ui/carousel";
import type { FilterState } from "@/components/dashboard/FilterBar";

interface Recommendation {
  itemType: "agent" | "world";
  itemId: string;
  name: string;
  description?: string;
  score: number;
  reason: string;
  tags?: string[];
  avatar?: string | null;
  categories?: CategoryKey[];
  generationTier?: 'free' | 'plus' | 'ultra' | null;
  gender?: string | null;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  tags?: string[];
  featured?: boolean;
  generationTier?: 'free' | 'plus' | 'ultra' | null;
  categories?: CategoryKey[];
  gender?: string | null;
}

// Helper function to get complexity badge info
const getComplexityBadge = (tier?: 'free' | 'plus' | 'ultra' | null) => {
  switch (tier) {
    case 'ultra':
      return {
        label: 'Ultra',
        bgClass: 'bg-gradient-to-r from-purple-500 to-pink-500',
        textClass: 'text-white',
        icon: '⚡'
      };
    case 'plus':
      return {
        label: 'Plus',
        bgClass: 'bg-gradient-to-r from-blue-500 to-cyan-500',
        textClass: 'text-white',
        icon: '✨'
      };
    case 'free':
    default:
      return {
        label: 'Free',
        bgClass: 'bg-gradient-to-r from-gray-600 to-gray-700',
        textClass: 'text-gray-200',
        icon: '●'
      };
  }
};

interface RecommendedForYouProps {
  filters?: FilterState;
  onLoadingChange?: (loading: boolean) => void;
  fallbackToCategories?: boolean;
  onAgentClick?: (agentId: string) => void;
  agents?: Agent[]; // Agentes del dashboard para evitar fetch extra
}

export function RecommendedForYou({
  filters,
  onLoadingChange,
  fallbackToCategories = true,
  onAgentClick,
  agents
}: RecommendedForYouProps) {
  const { data: session } = useSession();
  const router = useRouter();
  // Check if user is authenticated
  const isAuthenticated = typeof window !== 'undefined' && session?.user;

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations");

      // Si es 401 o no autenticado, activar fallback
      if (response.status === 401) {
        setFailed(true);
        setLoading(false);
        onLoadingChange?.(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setFailed(false);
      } else {
        // Cualquier otro error, activar fallback
        setFailed(true);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setFailed(true);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  };


  const handleRegenerate = async () => {
    setRegenerating(true);
    onLoadingChange?.(true);
    try {
      const response = await fetch("/api/recommendations/regenerate", {
        method: "POST",
      });

      // Si es 401, activar fallback
      if (response.status === 401) {
        setFailed(true);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
        setFailed(false);
      } else {
        setFailed(true);
      }
    } catch (error) {
      console.error("Error regenerating recommendations:", error);
      setFailed(true);
    } finally {
      setRegenerating(false);
      onLoadingChange?.(false);
    }
  };

  // Apply filters to agents
  const applyFiltersToAgent = (agent: Agent | Recommendation): boolean => {
    if (!filters) return true;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesName = agent.name.toLowerCase().includes(searchLower);
      const matchesDesc = (agent.description?.toLowerCase() || '').includes(searchLower);
      if (!matchesName && !matchesDesc) return false;
    }

    // Gender filter
    if (filters.gender !== 'all') {
      if (!agent.gender || agent.gender.toLowerCase() !== filters.gender.toLowerCase()) {
        return false;
      }
    }

    // Categories filter
    if (filters.categories.length > 0) {
      const agentCategories = Array.isArray(agent.categories) ? agent.categories : [];
      const hasMatchingCategory = filters.categories.some(cat =>
        agentCategories.some(category => category.toLowerCase() === cat.toLowerCase())
      );
      if (!hasMatchingCategory) return false;
    }

    // Tier filter (for Agent type)
    if (filters.tier !== 'all' && 'generationTier' in agent) {
      if (agent.generationTier !== filters.tier) {
        return false;
      }
    }

    return true;
  };

  // Filter recommendations and system agents
  const filteredRecommendations = recommendations.filter(applyFiltersToAgent);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-purple-500/20 rounded animate-pulse" />
            <div className="h-6 w-48 bg-purple-500/20 rounded animate-pulse" />
          </div>
        </div>

        {/* Cards Skeleton */}
        <Carousel itemWidth={280} gap={24}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <CompanionCardSkeleton key={idx} />
          ))}
        </Carousel>
      </div>
    );
  }

  // Si falló o no tiene recomendaciones y hay fallback habilitado
  if ((failed || filteredRecommendations.length === 0) && fallbackToCategories) {
    return <CategoryBasedRecommendations filters={filters} onAgentClick={onAgentClick} agents={agents} />;
  }

  // Si no hay recomendaciones y no hay fallback, no mostrar nada
  if (filteredRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Recomendado para ti
          </h2>
          <span className="text-xs text-gray-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
            IA Personalizada
          </span>
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={regenerating}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
          />
          Actualizar
        </Button>
      </div>

      {/* Carousel de Recomendaciones */}
      <Carousel itemWidth={280} gap={24}>
        {filteredRecommendations.slice(0, 8).map((rec, idx) => (
          <motion.div
            key={`${rec.itemType}-${rec.itemId}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: idx * 0.05,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="relative"
          >
            {/* Score Badge - positioned above the card */}
            <div className="absolute -top-2 -right-2 z-20">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-white" />
                {Math.round(rec.score * 100)}%
              </div>
            </div>

            {rec.itemType === "agent" ? (
              <div className="relative h-full">
                <CompanionCard
                  id={rec.itemId}
                  name={rec.name}
                  description={rec.description}
                  avatar={rec.avatar}
                  categories={rec.categories}
                  generationTier={rec.generationTier}
                  index={idx}
                />
                {/* Recommendation Reason - overlaid at bottom */}
                <div className="absolute bottom-16 left-0 right-0 mx-4 bg-purple-500/95 backdrop-blur-sm border border-purple-400/30 rounded-lg p-2">
                  <p className="text-[10px] text-white flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{rec.reason}</span>
                  </p>
                </div>
              </div>
            ) : (
              <Link href={`/dashboard/mundos/${rec.itemId}`}>
                <div className="group relative h-full bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer" style={{ aspectRatio: '2/3' }}>
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>

                  {/* Icon */}
                  <div className="flex items-center justify-center mb-4 pt-4">
                    <div
                      className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: generateGradient(rec.name) }}
                    >
                      <span className="text-4xl">🌍</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="text-center mb-4">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-blue-400 transition-colors mb-1.5">
                      {rec.name}
                    </h3>
                    {rec.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                        {rec.description}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-3">
                    <p className="text-xs text-blue-300 flex items-start gap-2">
                      <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{rec.reason}</span>
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button className="mt-auto w-full bg-[#27272a] text-gray-200 hover:bg-[#3f3f46] hover:text-white transition-all duration-150 rounded-lg py-2.5 text-[13px] font-semibold">
                    Explorar
                  </Button>
                </div>
              </Link>
            )}
          </motion.div>
        ))}
      </Carousel>

      {/* Footer - Subtle info */}
      <div className="text-center">
        <p className="text-xs text-gray-500/70">
          Actualizado diariamente
        </p>
      </div>
    </div>
  );
}
