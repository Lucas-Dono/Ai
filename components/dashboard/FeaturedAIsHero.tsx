"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, MessageCircle, ArrowRight, Share2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getInitials, generateGradient, cn } from "@/lib/utils";
import { ShareAgentDialog } from "@/components/share/ShareAgentDialog";

interface FeaturedAgent {
  id: string;
  name: string;
  description: string;
  avatar?: string | null;
  featured: boolean;
  category?: string;
  _count?: {
    reviews: number;
  };
  rating?: number | null;
  cloneCount?: number;
}

const categoryIcons = {
  "Apoyo Emocional": "😊",
  "Mentores": "🧠",
  "Romántico": "💕",
  "Famosos": "⭐",
  "Creativos": "🎨",
  "Entretenimiento": "🎭",
};

const categoryColors = {
  "Apoyo Emocional": "from-blue-500 to-cyan-500",
  "Mentores": "from-purple-500 to-indigo-500",
  "Romántico": "from-pink-500 to-rose-500",
  "Famosos": "from-yellow-500 to-orange-500",
  "Creativos": "from-green-500 to-emerald-500",
  "Entretenimiento": "from-red-500 to-pink-500",
};

export function FeaturedAIsHero() {
  const router = useRouter();
  const [featuredAgents, setFeaturedAgents] = useState<FeaturedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareAgent, setShareAgent] = useState<FeaturedAgent | null>(null);

  useEffect(() => {
    fetchFeaturedAgents();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (featuredAgents.length <= 3) return; // No need to rotate if 3 or less

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(featuredAgents.length / 3));
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(interval);
  }, [featuredAgents.length]);

  const fetchFeaturedAgents = async () => {
    try {
      const res = await fetch("/api/agents?filter=featured&limit=12");
      if (res.ok) {
        const data = await res.json();
        // Get only public featured agents
        const featured = data.filter((a: FeaturedAgent) => a.featured && !a.userId);
        setFeaturedAgents(featured);
      }
    } catch (error) {
      console.error("Error fetching featured agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgent = (agentId: string) => {
    router.push(`/agentes/${agentId}`);
  };

  const handleViewAll = () => {
    router.push("/dashboard?filter=featured");
  };

  if (loading || featuredAgents.length === 0) {
    return null;
  }

  // Show 3 at a time
  const displayAgents = featuredAgents.slice(currentIndex * 3, currentIndex * 3 + 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Explora IAs Predefinidas
            </h2>
            <p className="text-sm text-muted-foreground">
              Prueba antes de crear la tuya • Gratis para todos
            </p>
          </div>
        </div>

        {featuredAgents.length > 3 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="text-purple-600 hover:text-purple-700 hidden md:flex"
          >
            Ver todas ({featuredAgents.length})
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayAgents.map((agent, index) => {
          const category = agent.category || "Entretenimiento";
          const icon = categoryIcons[category as keyof typeof categoryIcons] || "✨";
          const gradient = categoryColors[category as keyof typeof categoryColors] || "from-purple-500 to-pink-500";
          const totalChats = (agent.cloneCount || 0) * 10; // Estimate
          const activeUsers = agent.cloneCount || 0;

          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                {/* Gradient Background */}
                <div className={cn(
                  "absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br",
                  gradient
                )} />

                {/* Trending Badge */}
                {totalChats > 100 && (
                  <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}

                {/* Content */}
                <div className="relative">
                  {/* Avatar & Category */}
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800 shadow-xl">
                      {agent.avatar ? (
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                      ) : (
                        <AvatarFallback
                          className="text-white text-xl font-bold"
                          style={{ background: generateGradient(agent.name) }}
                        >
                          {getInitials(agent.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{icon}</span>
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      </div>
                      {agent.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {agent.rating.toFixed(1)}
                          </span>
                          {agent._count?.reviews && (
                            <span className="text-muted-foreground text-xs">
                              ({agent._count.reviews})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name & Description */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-medium">
                        {totalChats >= 1000 ? `${(totalChats / 1000).toFixed(1)}K` : totalChats} chats
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">
                        {activeUsers >= 1000 ? `${(activeUsers / 1000).toFixed(1)}K` : activeUsers} usuarios
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTryAgent(agent.id)}
                      className={cn(
                        "flex-1 text-white shadow-md hover:shadow-lg transition-all",
                        "bg-gradient-to-r",
                        gradient
                      )}
                      size="sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chatear Gratis
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareAgent(agent);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      {featuredAgents.length > 3 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(featuredAgents.length / 3) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === currentIndex
                  ? "w-8 bg-purple-600"
                  : "w-2 bg-gray-300 dark:bg-gray-700 hover:bg-purple-400"
              )}
            />
          ))}
        </div>
      )}

      {/* Mobile "View All" Button */}
      {featuredAgents.length > 3 && (
        <div className="mt-6 text-center md:hidden">
          <Button
            variant="outline"
            onClick={handleViewAll}
            className="w-full border-purple-500/30 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
          >
            Ver todas las IAs ({featuredAgents.length})
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Share Dialog */}
      {shareAgent && (
        <ShareAgentDialog
          open={!!shareAgent}
          onOpenChange={(open) => {
            if (!open) setShareAgent(null);
          }}
          agent={shareAgent}
        />
      )}
    </motion.div>
  );
}
