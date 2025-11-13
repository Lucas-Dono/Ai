/**
 * Character Detail Page - Vista detallada de un personaje compartido
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Download,
  Eye,
  User,
  Share2,
  Flag,
  Sparkles,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ImportButton } from "@/components/community/ImportButton";
import { LikeButton } from "@/components/community/LikeButton";
import { CreatorBadge } from "@/components/community/CreatorBadge";

interface CharacterDetail {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  avatar?: string;
  personality: string;
  systemPrompt: string;
  voiceId?: string;
  voiceName?: string;
  appearance?: any;
  author: {
    id: string;
    name: string;
    reputation: number;
    badges: string[];
  };
  stats: {
    downloads: number;
    likes: number;
    views: number;
    comments: number;
  };
  isLiked: boolean;
  createdAt: string;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    loadCharacter();
  }, [characterId]);

  const loadCharacter = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community/marketplace/characters/${characterId}`);
      const data = await response.json();
      setCharacter(data);
    } catch (error) {
      console.error('Error loading character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      const response = await fetch(`/api/community/marketplace/characters/${characterId}/import`, {
        method: 'POST',
      });

      if (response.ok) {
        setImported(true);
        // Reload to update stats
        loadCharacter();
      }
    } catch (error) {
      console.error('Error importing character:', error);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Personaje no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            Este personaje no existe o ha sido eliminado.
          </p>
          <Link href="/community/share/characters">
            <Button>Volver a Characters</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/community/share/characters">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Avatar */}
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
                {character.avatar ? (
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="h-32 w-32 text-muted-foreground/30" />
                  </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="text-sm">
                    {character.category}
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                {/* Title & Actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
                    <p className="text-muted-foreground">{character.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <LikeButton
                      itemId={character.id}
                      itemType="character"
                      initialLiked={character.isLiked}
                      initialLikes={character.stats.likes}
                    />
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                {character.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {character.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <Separator className="my-6" />

                {/* Details */}
                <div className="space-y-4">
                  {/* Personality */}
                  <div>
                    <h3 className="font-semibold mb-2">Personalidad</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {character.personality}
                    </p>
                  </div>

                  {/* System Prompt */}
                  <div>
                    <h3 className="font-semibold mb-2">System Prompt</h3>
                    <div className="bg-accent/50 border border-border rounded-2xl p-4">
                      <p className="text-sm font-mono whitespace-pre-wrap">
                        {character.systemPrompt}
                      </p>
                    </div>
                  </div>

                  {/* Voice */}
                  {character.voiceName && (
                    <div>
                      <h3 className="font-semibold mb-2">Voz</h3>
                      <p className="text-sm text-muted-foreground">
                        {character.voiceName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Comments Section (placeholder) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5" />
                <h2 className="text-xl font-bold">Comentarios</h2>
                <span className="text-sm text-muted-foreground">
                  ({character.stats.comments})
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-center py-8">
                Sistema de comentarios próximamente...
              </p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Import Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card border border-border rounded-2xl p-6 sticky top-24"
            >
              <ImportButton
                characterId={character.id}
                characterName={character.name}
                onImport={handleImport}
                importing={importing}
                imported={imported}
              />

              <Separator className="my-6" />

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Likes
                  </span>
                  <span className="font-semibold">{character.stats.likes}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Importaciones
                  </span>
                  <span className="font-semibold">{character.stats.downloads}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Vistas
                  </span>
                  <span className="font-semibold">{character.stats.views}</span>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Creator Info */}
              <div>
                <h3 className="font-semibold mb-3">Creador</h3>
                <Link href={`/profile/${character.author.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-accent transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {character.author.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {character.author.name}
                        </p>
                        <CreatorBadge reputation={character.author.reputation} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {character.author.reputation} karma
                      </p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Report */}
              <Button variant="ghost" size="sm" className="w-full mt-4 gap-2 text-muted-foreground">
                <Flag className="h-4 w-4" />
                Reportar
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
