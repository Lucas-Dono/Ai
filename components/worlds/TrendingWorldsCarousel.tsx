"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Crown,
  Eye,
  Clock,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { generateGradient } from "@/lib/utils";

interface World {
  id: string;
  name: string;
  description?: string;
  category?: string;
  featured?: boolean;
  trendingScore: number;
  metrics: {
    viewCount: number;
    interactionCount: number;
    agentCount: number;
    rating?: number | null;
    totalTimeSpent: number;
  };
}

export function TrendingWorldsCarousel() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchTrendingWorlds();
  }, []);

  const fetchTrendingWorlds = async () => {
    try {
      const response = await fetch("/api/worlds/trending?limit=10");
      if (response.ok) {
        const data = await response.json();
        setWorlds(data.trending);
      }
    } catch (error) {
      console.error("Error fetching trending worlds:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener("resize", updateScrollButtons);
    return () => window.removeEventListener("resize", updateScrollButtons);
  }, [worlds]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(updateScrollButtons, 300);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (worlds.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-6 h-6 text-orange-400" />
        <h2 className="text-2xl font-bold text-foreground">
          Mundos Trending
        </h2>
        <span className="text-sm text-gray-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
          Top 10 más populares
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-r from-gray-900 to-transparent p-3 rounded-r-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Right Arrow */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gradient-to-l from-gray-900 to-transparent p-3 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {worlds.map((world, idx) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex-shrink-0 w-80"
            >
              <Link href={`/dashboard/mundos/${world.id}`}>
                <div className="relative group/card h-full bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 cursor-pointer">
                  {/* Trending Badge */}
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <TrendingUp className="w-3 h-3" />
                      #{idx + 1}
                    </div>
                  </div>

                  {/* Featured Crown */}
                  {world.featured && (
                    <div className="absolute top-3 left-3 z-10">
                      <Crown className="w-5 h-5 text-yellow-400 drop-shadow-lg" />
                    </div>
                  )}

                  {/* World Icon */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                      style={{ background: generateGradient(world.name) }}
                    >
                      <span className="text-3xl">🌍</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover/card:text-orange-400 transition-colors">
                        {world.name}
                      </h3>
                      {world.category && (
                        <span className="inline-block text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full mt-1">
                          {world.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {world.description && (
                    <p className="text-sm text-gray-300 line-clamp-2 mb-4 min-h-[40px]">
                      {world.description}
                    </p>
                  )}

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Eye className="w-3 h-3 text-blue-400" />
                      <span>
                        {world.metrics.viewCount.toLocaleString()} vistas
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Users className="w-3 h-3 text-green-400" />
                      <span>{world.metrics.agentCount} IAs</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MessageCircle className="w-3 h-3 text-purple-400" />
                      <span>
                        {world.metrics.interactionCount.toLocaleString()}
                      </span>
                    </div>
                    {world.metrics.rating && world.metrics.rating > 0 ? (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span>{world.metrics.rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span>
                          {Math.floor(world.metrics.totalTimeSpent / 60)}min
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-gradient-to-r from-orange-500/20 to-pink-500/20 hover:from-orange-500/30 hover:to-pink-500/30 border border-orange-500/30 text-white py-2 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Explorar mundo
                  </Button>

                  {/* Trending Score (Debug - opcional) */}
                  {process.env.NODE_ENV === "development" && (
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">
                      Score: {world.trendingScore.toFixed(1)}
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Desliza para ver más mundos populares →
        </p>
      </div>

      {/* CSS para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
