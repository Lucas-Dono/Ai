"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Star,
  Users,
  MessageCircle,
  Heart,
  Crown,
  Brain,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { CompanionCard } from "@/components/companions/CompanionCard";
import type { CategoryKey } from "@/lib/categories";
import { Carousel } from "@/components/ui/carousel";

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

export function RecommendedForYou() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // Check if user is authenticated (status can be "loading", "authenticated", or "unauthenticated")
  const isAuthenticated = status === "authenticated" || (typeof window !== 'undefined' && session?.user);

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [systemAgents, setSystemAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchSystemAgents();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch("/api/recommendations");

      // Si es 401, el usuario no está autenticado - redirigir a login
      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemAgents = async () => {
    try {
      const response = await fetch("/api/agents?kind=companion");

      // Si es 401, el usuario no está autenticado - redirigir a login
      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Filter only system agents (userId = null)
        const systemOnly = data.filter((agent: Agent) => agent.tags?.includes('premium') || agent.tags?.includes('free'));
        setSystemAgents(systemOnly);
      }
    } catch (error) {
      console.error("Error fetching system agents:", error);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const response = await fetch("/api/recommendations/regenerate", {
        method: "POST",
      });

      // Si es 401, el usuario no está autenticado - redirigir a login
      if (response.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error regenerating recommendations:", error);
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20 rounded-2xl p-8 border border-purple-500/20">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  // Categorize agents by tags
  const categories = [
    {
      id: 'figuras-historicas',
      name: 'Figuras Históricas',
      icon: Crown,
      gradientClass: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      borderClass: 'border-yellow-500/30 hover:border-yellow-500/50',
      buttonClass: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border-yellow-500/30',
      shadowClass: 'hover:shadow-yellow-500/20',
      agents: systemAgents.filter(a => a.tags?.includes('figuras-históricas'))
    },
    {
      id: 'mentor',
      name: 'Mentores Intelectuales',
      icon: Brain,
      gradientClass: 'bg-gradient-to-r from-blue-500 to-purple-500',
      borderClass: 'border-blue-500/30 hover:border-blue-500/50',
      buttonClass: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border-blue-500/30',
      shadowClass: 'hover:shadow-blue-500/20',
      agents: systemAgents.filter(a => a.tags?.includes('mentor'))
    },
    {
      id: 'romantico',
      name: 'Conexiones Románticas',
      icon: Heart,
      gradientClass: 'bg-gradient-to-r from-pink-500 to-rose-500',
      borderClass: 'border-pink-500/30 hover:border-pink-500/50',
      buttonClass: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border-pink-500/30',
      shadowClass: 'hover:shadow-pink-500/20',
      agents: systemAgents.filter(a => a.tags?.includes('romántico'))
    },
    {
      id: 'confidente',
      name: 'Confidentes y Apoyo',
      icon: Users,
      gradientClass: 'bg-gradient-to-r from-green-500 to-emerald-500',
      borderClass: 'border-green-500/30 hover:border-green-500/50',
      buttonClass: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border-green-500/30',
      shadowClass: 'hover:shadow-green-500/20',
      agents: systemAgents.filter(a => a.tags?.includes('confidente'))
    },
    {
      id: 'experto',
      name: 'Expertos y Profesionales',
      icon: Zap,
      gradientClass: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      borderClass: 'border-purple-500/30 hover:border-purple-500/50',
      buttonClass: 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border-purple-500/30',
      shadowClass: 'hover:shadow-purple-500/20',
      agents: systemAgents.filter(a => a.tags?.includes('experto'))
    },
  ].filter(cat => cat.agents.length > 0); // Only show categories with agents

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        {/* Categories Grid */}
        <div className="space-y-8">
          {categories.map((category, catIdx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: catIdx * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${category.gradientClass}`}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
                <span className="text-xs text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                  {category.agents.length} {category.agents.length === 1 ? 'compañero' : 'compañeros'}
                </span>
              </div>

              {/* Agents Carousel */}
              <Carousel itemWidth={280} gap={24}>
                {category.agents.map((agent, idx) => (
                  <CompanionCard
                    key={agent.id}
                    id={agent.id}
                    name={agent.name}
                    description={agent.description}
                    avatar={agent.avatar}
                    categories={agent.categories}
                    generationTier={agent.generationTier}
                    index={catIdx * 10 + idx}
                  />
                ))}
              </Carousel>
            </motion.div>
          ))}
        </div>
      </div>
    );
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
        {recommendations.slice(0, 8).map((rec, idx) => (
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
