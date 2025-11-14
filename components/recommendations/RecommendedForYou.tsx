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
  TrendingUp,
  Heart,
  Crown,
  Brain,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateGradient, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Recommendation {
  itemType: "agent" | "world";
  itemId: string;
  name: string;
  description?: string;
  score: number;
  reason: string;
  tags?: string[];
  avatar?: string | null;
}

interface Agent {
  id: string;
  name: string;
  description?: string;
  avatar?: string | null;
  tags?: string[];
  featured?: boolean;
}

export function RecommendedForYou() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";

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
    {
      id: 'para-empezar',
      name: 'Para Empezar',
      icon: Lightbulb,
      gradientClass: 'bg-gradient-to-r from-cyan-500 to-blue-500',
      borderClass: 'border-cyan-500/30 hover:border-cyan-500/50',
      buttonClass: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border-cyan-500/30',
      shadowClass: 'hover:shadow-cyan-500/20',
      agents: systemAgents.filter(a => a.tags?.includes('free'))
    },
  ].filter(cat => cat.agents.length > 0); // Only show categories with agents

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Descubre compañeros increíbles
            </h2>
          </div>
        </div>

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

              {/* Agents Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {category.agents.map((agent, idx) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: catIdx * 0.1 + idx * 0.05,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  >
                    <Link
                      href={isAuthenticated ? `/agentes/${agent.id}` : `/login?callbackUrl=/agentes/${agent.id}`}
                    >
                      <div className={`group relative h-full bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border ${category.borderClass} transition-all duration-300 hover:scale-105 hover:shadow-2xl ${category.shadowClass} cursor-pointer`}>
                        {/* Premium Badge */}
                        {agent.featured && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                            <Crown className="w-3 h-3" />
                            PREMIUM
                          </div>
                        )}

                        {/* Avatar */}
                        <div className="flex items-center justify-center mb-4">
                          {agent.avatar ? (
                            <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-gray-700/50 shadow-lg group-hover:scale-110 transition-transform">
                              <img
                                src={agent.avatar}
                                alt={agent.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <Avatar
                              className="h-20 w-20 border-2 border-gray-700/50 shadow-lg rounded-2xl group-hover:scale-110 transition-transform"
                              style={{ background: generateGradient(agent.name) }}
                            >
                              <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                                {getInitials(agent.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Content */}
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors mb-2">
                            {agent.name}
                          </h3>
                          {agent.description && (
                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                              {agent.description}
                            </p>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button className={`w-full ${category.buttonClass} border text-white py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm`}>
                          <MessageCircle className="w-4 h-4" />
                          {isAuthenticated ? "Comenzar chat" : "Registrarse para chatear"}
                        </Button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            Chatea con estos compañeros para recibir recomendaciones personalizadas basadas en tus intereses
          </p>
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

      {/* Grid de Recomendaciones */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          >
            <Link
              href={
                rec.itemType === "agent"
                  ? `/agentes/${rec.itemId}`
                  : `/dashboard/mundos/${rec.itemId}`
              }
            >
              <div className="group relative h-full bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer">
                {/* Score Badge */}
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-3 h-3 fill-white" />
                    {Math.round(rec.score * 100)}%
                  </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 left-3 z-10">
                  {rec.itemType === "agent" ? (
                    <Heart className="w-4 h-4 text-pink-400" />
                  ) : (
                    <Users className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                {/* Avatar/Icon */}
                <div className="flex items-center justify-center mb-4 pt-4">
                  {rec.itemType === "agent" ? (
                    rec.avatar ? (
                      <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg">
                        <img
                          src={rec.avatar}
                          alt={rec.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <Avatar
                        className="h-20 w-20 border-2 border-purple-500/30 shadow-lg rounded-2xl"
                        style={{ background: generateGradient(rec.name) }}
                      >
                        <AvatarFallback className="text-white text-2xl font-bold bg-transparent">
                          {getInitials(rec.name)}
                        </AvatarFallback>
                      </Avatar>
                    )
                  ) : (
                    <div
                      className="h-20 w-20 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: generateGradient(rec.name) }}
                    >
                      <span className="text-4xl">🌍</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors mb-1">
                    {rec.name}
                  </h3>
                  {rec.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">
                      {rec.description}
                    </p>
                  )}

                  {/* Tags */}
                  {rec.tags && rec.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                      {rec.tags.slice(0, 2).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-gray-700/50 text-gray-300 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reason (Why recommended) */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-3 mb-3">
                  <p className="text-xs text-purple-300 flex items-start gap-2">
                    <Sparkles className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{rec.reason}</span>
                  </p>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-white py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm">
                  <MessageCircle className="w-4 h-4" />
                  {rec.itemType === "agent" ? "Chatear" : "Explorar"}
                </Button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Recomendaciones actualizadas diariamente basadas en tus interacciones
        </p>
      </div>
    </div>
  );
}
