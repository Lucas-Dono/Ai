/**
 * My Shared Items - Perfil de creator con items compartidos
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Palette,
  Heart,
  Download,
  Eye,
  TrendingUp,
  Award,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { CreatorBadge, getNextBadgeLevel } from "@/components/community/CreatorBadge";

interface CreatorStats {
  totalShared: number;
  totalLikes: number;
  totalDownloads: number;
  totalComments: number;
  reputation: number;
  badges: string[];
}

interface SharedItem {
  id: string;
  type: 'character' | 'prompt' | 'theme';
  name: string;
  category: string;
  likes: number;
  downloads: number;
  views: number;
  comments: number;
  createdAt: string;
}

export default function MySharedPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [items, setItems] = useState<SharedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'characters' | 'prompts' | 'themes'>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]); // Recargar cuando cambia el tab

  const loadData = async () => {
    try {
      setLoading(true);

      // Obtener datos del endpoint
      const typeParam = activeTab === 'all' ? '' : `?type=${activeTab}`;
      const response = await fetch(`/api/user/shared${typeParam}`);

      if (!response.ok) {
        throw new Error('Error al cargar datos');
      }

      const data = await response.json();
      setStats(data.stats);
      setItems(data.items);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback a datos vacíos en caso de error
      setStats({
        totalShared: 0,
        totalLikes: 0,
        totalDownloads: 0,
        totalComments: 0,
        reputation: 0,
        badges: [],
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const { nextLevel, progress } = stats ? getNextBadgeLevel(stats.reputation) : { nextLevel: null, progress: 0 };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-2xl font-bold">
                {session?.user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {session?.user?.name || 'Usuario'}
                </h1>
                {stats && <CreatorBadge reputation={stats.reputation} />}
              </div>
              <p className="text-muted-foreground mb-4">
                Mi perfil de creator
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-accent/50 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Compartidos</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalShared || 0}</p>
                </div>
                <div className="bg-accent/50 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-xs text-muted-foreground">Likes</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalLikes || 0}</p>
                </div>
                <div className="bg-accent/50 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-muted-foreground">Descargas</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
                </div>
                <div className="bg-accent/50 rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Karma</span>
                  </div>
                  <p className="text-2xl font-bold">{stats?.reputation || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Badge Progress */}
          {nextLevel && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    Progreso a {nextLevel.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {nextLevel.minReputation - (stats?.reputation || 0)} karma restante
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full md:w-auto grid-cols-4 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="characters" className="gap-2">
              <Users className="h-4 w-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="prompts" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Prompts
            </TabsTrigger>
            <TabsTrigger value="themes" className="gap-2">
              <Palette className="h-4 w-4" />
              Themes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <EmptyState
              icon={TrendingUp}
              title="No has compartido nada todavía"
              description="Comparte tus creaciones con la comunidad y empieza a ganar karma."
            />
          </TabsContent>

          <TabsContent value="characters">
            <EmptyState
              icon={Users}
              title="No has compartido personajes"
              description="Ve a tus personajes y haz clic en 'Compartir con la Comunidad'."
            />
          </TabsContent>

          <TabsContent value="prompts">
            <EmptyState
              icon={MessageSquare}
              title="No has compartido prompts"
              description="Crea prompts útiles y compártelos con otros usuarios."
            />
          </TabsContent>

          <TabsContent value="themes">
            <EmptyState
              icon={Palette}
              title="No has compartido temas"
              description="Diseña temas visuales y compártelos con la comunidad."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <Icon className="h-16 w-16 text-muted-foreground/50 mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </motion.div>
  );
}
