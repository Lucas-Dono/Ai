/**
 * SharedAICard - Card de IA compartida con preview y stats
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Download,
  Eye,
  User,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SharedAICardProps {
  character: {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    avatar?: string;
    author: {
      id: string;
      name: string;
    };
    stats: {
      downloads: number;
      likes: number;
      views: number;
    };
    isLiked: boolean;
  };
}

export function SharedAICard({ character }: SharedAICardProps) {
  const [isLiked, setIsLiked] = useState(character.isLiked);
  const [likesCount, setLikesCount] = useState(character.stats.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLiking) return;

    try {
      setIsLiking(true);
      const newLiked = !isLiked;
      setIsLiked(newLiked);
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1);

      await fetch(`/api/community/marketplace/characters/${character.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newLiked ? 5 : 0 }),
      });
    } catch (error) {
      console.error('Error liking character:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(character.stats.likes);
    } finally {
      setIsLiking(false);
    }
  };

  const categoryColors: Record<string, string> = {
    anime: 'from-pink-500 to-purple-500',
    realistic: 'from-blue-500 to-cyan-500',
    fantasy: 'from-purple-500 to-pink-500',
    'sci-fi': 'from-cyan-500 to-blue-500',
    historical: 'from-amber-500 to-orange-500',
    gaming: 'from-green-500 to-emerald-500',
  };

  return (
    <Link href={`/agentes/${character.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col hover-lift-glow"
      >
        {/* Avatar/Preview */}
        <div className="relative aspect-square bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="h-20 w-20 text-muted-foreground/30" />
            </div>
          )}

          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors",
              isLiked
                ? "bg-red-500/90 text-white"
                : "bg-black/30 text-white hover:bg-black/50"
            )}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
          </motion.button>

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={cn(
              "bg-gradient-to-r text-white border-0",
              categoryColors[character.category] || 'from-primary to-secondary'
            )}>
              {character.category}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Name */}
          <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {character.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {character.description}
          </p>

          {/* Tags */}
          {character.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {character.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-xs">
                {character.author.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              {character.author.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart className={cn("h-3.5 w-3.5", isLiked && "fill-current text-red-500")} />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                <span>{character.stats.downloads}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{character.stats.views}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
