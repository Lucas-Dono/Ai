"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Loader2,
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
  TrendingUp,
  Clock,
  Star,
  Zap,
  Globe,
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
const extractTags = (agent: Agent): string[] => {
  const tags: string[] = [];

  // Common patterns
  if (agent.description?.toLowerCase().includes("científico") || agent.description?.toLowerCase().includes("ciencia")) {
    tags.push("Ciencia");
  }
  if (agent.description?.toLowerCase().includes("físic")) {
    tags.push("Física");
  }
  if (agent.description?.toLowerCase().includes("arte") || agent.description?.toLowerCase().includes("artista")) {
    tags.push("Arte");
  }
  if (agent.description?.toLowerCase().includes("historia") || agent.description?.toLowerCase().includes("históric")) {
    tags.push("Historia");
  }
  if (agent.description?.toLowerCase().includes("genio") || agent.description?.toLowerCase().includes("inteligente")) {
    tags.push("Genio");
  }
  if (agent.description?.toLowerCase().includes("cine") || agent.description?.toLowerCase().includes("actor")) {
    tags.push("Cine");
  }

  // If no tags found, add generic ones
  if (tags.length === 0) {
    if (agent.featured) tags.push("Premium");
    tags.push("Compañero");
  }

  return tags.slice(0, 3);
};

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAgents(), fetchWorlds()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar a "${agentName}"? Esta acción no se puede deshacer.`)) {
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
        alert(error.error || "Error al eliminar el compañero");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      alert("Error al eliminar el compañero");
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
        alert(`Se ha creado una copia de "${worldName}" en tus mundos`);
        fetchWorlds();
      } else {
        throw new Error("Failed to clone");
      }
    } catch (error) {
      console.error("Error cloning world:", error);
      alert("No se pudo clonar el mundo");
    }
  };

  const companions = agents.filter((a) => a.kind === "companion");

  // Filter by search query
  const filteredCompanions = companions.filter((companion) =>
    companion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (companion.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Categorizar compañeros
  const recommendedCompanions = filteredCompanions.filter(
    (a) => a.userId === null && a.featured === true
  );
  const myCompanions = filteredCompanions.filter((a) => a.userId !== null);
  const popularCompanions = filteredCompanions.filter(
    (a) => a.userId === null && !a.featured && (a.cloneCount || 0) > 0
  ).sort((a, b) => (b.cloneCount || 0) - (a.cloneCount || 0));
  const otherCompanions = filteredCompanions.filter(
    (a) => a.userId === null && !a.featured && (a.cloneCount || 0) === 0
  );

  // Calculate stats
  const totalConversations = companions.reduce((acc, c) => acc + (c.cloneCount || 0) * 10, 0);
  const totalCompanions = companions.length;

  const predefinedWorlds = worlds.filter((w) => w.isPredefined);
  const userWorlds = worlds.filter((w) => !w.isPredefined);

  const stats = [
    { icon: Heart, label: `${totalCompanions} compañeros`, color: 'text-pink-400' },
    { icon: Globe, label: `${worlds.length} mundos`, color: 'text-blue-400' },
    { icon: MessageCircle, label: `${totalConversations}+ conversaciones`, color: 'text-purple-400' }
  ];

  return (
    <div className="min-h-screen">
      {/* Enhanced Header with Gradient */}
      <header className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-purple-900/40 p-8 border border-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Inicio
          </h1>
          <p className="text-gray-300 mb-6">Gestiona tus compañeros IA y mundos virtuales</p>

          {/* Stats */}
          <div className="flex gap-6 flex-wrap">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-700/50"
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm font-medium">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin md-text-secondary" />
        </div>
      ) : (
        <Tabs defaultValue={initialTab} className="space-y-6">
          <TabsList className="md-surface-container-high p-1 rounded-xl">
            <TabsTrigger
              value="companions"
              className="px-6 py-2.5 rounded-lg data-[state=active]:md-surface-container-highest data-[state=active]:shadow-sm"
            >
              <Heart className="h-4 w-4 mr-2" />
              Compañeros ({companions.length})
            </TabsTrigger>
            <TabsTrigger
              value="worlds"
              className="px-6 py-2.5 rounded-lg data-[state=active]:md-surface-container-highest data-[state=active]:shadow-sm"
            >
              <Network className="h-4 w-4 mr-2" />
              Mundos ({worlds.length})
            </TabsTrigger>
          </TabsList>

          {/* Companions Tab */}
          <TabsContent value="companions" className="space-y-8">
            {/* AI Recommendations */}
            <RecommendedForYou />

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar compañeros por nombre, época, personalidad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl pl-12 pr-32 py-4 focus:outline-none focus:border-purple-500 transition-all duration-300 text-white placeholder:text-gray-400"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold md-text-primary">Compañeros</h2>
                <p className="text-sm md-text-secondary mt-1">
                  {filteredCompanions.length} {filteredCompanions.length === 1 ? "compañero disponible" : "compañeros disponibles"}
                </p>
              </div>
              <Link href="/constructor">
                <Button className="md-button md-button-filled px-6 py-2.5">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Compañero
                </Button>
              </Link>
            </div>

            {companions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="md-card md-card-outlined p-12 text-center max-w-md">
                  <div className="h-20 w-20 rounded-full md-surface-container-highest flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 md-text-secondary" />
                  </div>
                  <h2 className="text-xl font-semibold md-text-primary mb-2">
                    Crea tu primer compañero
                  </h2>
                  <p className="md-text-secondary mb-6">
                    Los compañeros IA tienen emociones, memoria y desarrollan relaciones únicas contigo
                  </p>
                  <Link href="/constructor">
                    <Button className="md-button md-button-filled px-6 py-2.5">
                      <Plus className="h-5 w-5 mr-2" />
                      Comenzar
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Recomendados Section - Enhanced */}
                {recommendedCompanions.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <h2 className="text-2xl font-bold">Recomendados</h2>
                      <span className="text-sm text-gray-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                        Personajes premium con personalidades avanzadas
                      </span>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                      {recommendedCompanions.map((agent, idx) => {
                        const tags = extractTags(agent);
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
                            <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
                              {/* Premium badge */}
                              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
                                <Crown className="w-3 h-3" />
                                PREMIUM
                              </div>

                              {/* Trending badge */}
                              {(agent.cloneCount || 0) > 5 && (
                                <div className="absolute top-3 right-3 bg-pink-500/20 backdrop-blur-sm text-pink-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Trending
                                </div>
                              )}

                              <div className="flex items-start gap-4 mb-4">
                                <Link href={`/agentes/${agent.id}`} className="flex-shrink-0">
                                  {agent.avatar ? (
                                    <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                                      <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <Avatar
                                      className="h-16 w-16 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all cursor-pointer rounded-2xl"
                                      style={{ background: generateGradient(agent.name) }}
                                    >
                                      <AvatarFallback className="text-white text-xl font-semibold bg-transparent">
                                        {getInitials(agent.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </Link>

                                <div className="flex-1 min-w-0">
                                  <Link href={`/agentes/${agent.id}`}>
                                    <h3 className="text-xl font-bold md-text-primary hover:underline cursor-pointer mb-1">
                                      {agent.name}
                                    </h3>
                                  </Link>
                                  {agent.description && (
                                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
                                      {agent.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mb-4">
                                {tags.map((tag, i) => (
                                  <span
                                    key={i}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(i)}`}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="w-4 h-4" />
                                  {((agent.cloneCount || 0) * 10).toLocaleString()} interacciones
                                </div>
                                {agent.rating && agent.rating > 0 ? (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    {agent.rating.toFixed(1)}
                                    <span className="text-xs">({agent._count?.reviews || 0})</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <Star className="w-4 h-4" />
                                    Sin calificaciones
                                  </div>
                                )}
                              </div>

                              {/* Reason why recommended */}
                              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                                <p className="text-xs text-purple-300 flex items-center gap-2">
                                  <Sparkles className="w-3 h-3" />
                                  Popular en conversaciones sobre {tags[0]?.toLowerCase() || 'temas diversos'}
                                </p>
                              </div>

                              {/* Button */}
                              <Link href={`/agentes/${agent.id}`} className="block">
                                <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-yellow-500/30 border-0">
                                  <MessageCircle className="h-5 w-5" />
                                  Chatear ahora
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Creados por ti Section - Enhanced */}
                {myCompanions.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-pink-400" />
                        <h2 className="text-2xl font-bold">Creados por ti</h2>
                        <span className="text-sm text-gray-400">{myCompanions.length}</span>
                      </div>
                      <Link href="/constructor">
                        <Button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300">
                          <Plus className="w-4 h-4" />
                          Nuevo Compañero
                        </Button>
                      </Link>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {myCompanions.map((agent, idx) => {
                        const hoursSinceCreated = agent.createdAt
                          ? Math.floor((Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60))
                          : 0;
                        const displayTime = hoursSinceCreated < 24
                          ? `Hace ${hoursSinceCreated}h`
                          : `Hace ${Math.floor(hoursSinceCreated / 24)}d`;

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
                                        Editar
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
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4 mr-2" />
                                      )}
                                      Eliminar
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
                                  {(agent.cloneCount || 0) * 2} mensajes
                                </span>
                              </div>

                              <Link href={`/agentes/${agent.id}`} className="block">
                                <Button className="w-full bg-gray-700/50 hover:bg-purple-600 text-white py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                                  <MessageCircle className="w-4 h-4" />
                                  Abrir chat
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
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-6 h-6 text-blue-400" />
                      <h2 className="text-2xl font-bold">Más vistos</h2>
                      <span className="text-sm text-gray-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                        Popular
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
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
                              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-110 cursor-pointer group relative">
                                {isNew && (
                                  <div className="absolute -top-2 -right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-bold z-10">
                                    NEW
                                  </div>
                                )}
                                {agent.avatar ? (
                                  <div className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300 h-16 w-16 mx-auto rounded-xl overflow-hidden">
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
                                <p className="text-xs text-gray-400 mb-2 text-center">{extractTags(agent)[0] || 'Compañero'}</p>
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
                        <h3 className="text-xl font-semibold md-text-primary">Todos los compañeros</h3>
                        <span className="text-xs md-text-secondary bg-muted px-2 py-1 rounded-full">
                          {otherCompanions.length} más
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
                          <div className="md-card p-6 group">
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
                                Abrir chat
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
                <h2 className="text-2xl font-semibold md-text-primary">Mundos</h2>
                <p className="text-sm md-text-secondary mt-1">
                  Explora mundos predefinidos o crea los tuyos propios
                </p>
              </div>
              <Link href="/dashboard/mundos">
                <Button variant="outline" className="px-6 py-2.5">
                  Ver todos los mundos
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
                  <h2 className="text-2xl font-bold">Mundo Destacado</h2>
                  <span className="text-sm text-gray-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                    Recomendación del equipo
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
                              className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: generateGradient(world.name) }}
                            >
                              <Network className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold md-text-primary truncate">
                                {world.name}
                              </h3>
                              <p className="text-sm md-text-secondary line-clamp-2 mt-1">
                                {world.description || "Mundo virtual sin descripción"}
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
                                Ver
                              </Button>
                            </Link>
                            <Button
                              className="flex-1 md-button md-button-filled py-2.5"
                              onClick={() => handleCloneWorld(world.id, world.name)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Clonar
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
                <h3 className="text-xl font-semibold md-text-primary mb-4">Mis Mundos</h3>
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
                      <div className="md-card p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: generateGradient(world.name) }}
                          >
                            <Network className="h-7 w-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold md-text-primary truncate">
                              {world.name}
                            </h3>
                            <p className="text-sm md-text-secondary line-clamp-2 mt-1">
                              {world.description || "Mundo virtual sin descripción"}
                            </p>
                          </div>
                        </div>

                        <Link href={`/dashboard/mundos/${world.id}`} className="block">
                          <Button className="w-full md-button md-button-tonal py-2.5">
                            <Play className="h-4 w-4 mr-2" />
                            Abrir mundo
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {worlds.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="md-card md-card-outlined p-12 text-center max-w-md">
                  <div className="h-20 w-20 rounded-full md-surface-container-highest flex items-center justify-center mx-auto mb-6">
                    <Network className="h-10 w-10 md-text-secondary" />
                  </div>
                  <h2 className="text-xl font-semibold md-text-primary mb-2">
                    Explora mundos virtuales
                  </h2>
                  <p className="md-text-secondary mb-6">
                    Descubre mundos donde múltiples IAs interactúan entre sí
                  </p>
                  <Link href="/dashboard/mundos">
                    <Button className="md-button md-button-filled px-6 py-2.5">
                      <Network className="h-5 w-5 mr-2" />
                      Ver mundos
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* FAB - Floating Action Button */}
      <Link href="/constructor">
        <button className="md-fab md-fab-extended" title="Crear nueva IA">
          <Plus className="h-6 w-6" />
          <span className="font-medium">Nueva IA</span>
        </button>
      </Link>
    </div>
  );
}
