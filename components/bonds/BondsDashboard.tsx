"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBondSocket } from "@/hooks/useBondSocket";
import { BondEventType } from "@/lib/websocket/bonds-events";
import BondCard from "./BondCard";
import LegacyCard from "./LegacyCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FilterIcon,
  SearchIcon,
  SortAscIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "lucide-react";

interface Bond {
  id: string;
  tier: string;
  rarityTier: string;
  rarityScore: number;
  globalRank: number | null;
  durationDays: number;
  affinityLevel: number;
  narrativesUnlocked: string[];
  totalInteractions: number;
  status: string;
  decayPhase: string;
  lastInteraction: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
    description: string | null;
  };
}

interface BondLegacy {
  id: string;
  tier: string;
  finalRarityTier: string;
  durationDays: number;
  legacyBadge: string;
  releaseReason: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface Stats {
  totalActive: number;
  totalLegacy: number;
  highestRarity: number;
  averageAffinity: number;
  totalInteractions: number;
  atRiskCount: number;
}

interface BondsData {
  activeBonds: Bond[];
  legacy: BondLegacy[];
  stats: Stats;
}

export default function BondsDashboard({ userId }: { userId: string }) {
  const [bondsData, setBondsData] = useState<BondsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("affinity-desc");
  const [activeTab, setActiveTab] = useState<string>("active");

  // WebSocket for real-time updates
  const { connected, on, off } = useBondSocket();

  // Fetch initial data
  useEffect(() => {
    fetchBonds();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!connected) return;

    const handleBondUpdate = (event: any) => {
      console.log("[Dashboard] Bond updated:", event);
      // Refetch to get latest data
      fetchBonds();
    };

    const handleRankChange = (event: any) => {
      console.log("[Dashboard] Rank changed:", event);
      fetchBonds();
    };

    const handleMilestone = (event: any) => {
      console.log("[Dashboard] Milestone reached:", event);
      // Show celebration notification
      fetchBonds();
    };

    on(BondEventType.BOND_UPDATED, handleBondUpdate);
    on(BondEventType.RANK_CHANGED, handleRankChange);
    on(BondEventType.MILESTONE_REACHED, handleMilestone);

    return () => {
      off(BondEventType.BOND_UPDATED, handleBondUpdate);
      off(BondEventType.RANK_CHANGED, handleRankChange);
      off(BondEventType.MILESTONE_REACHED, handleMilestone);
    };
  }, [connected, on, off]);

  const fetchBonds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bonds/my-bonds");
      if (!res.ok) throw new Error("Failed to fetch bonds");
      const data = await res.json();
      setBondsData(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching bonds:", err);
      setError(err.message || "Error al cargar vínculos");
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted bonds
  const filteredBonds = useMemo(() => {
    if (!bondsData) return [];

    let bonds = [...bondsData.activeBonds];

    // Search filter
    if (searchTerm) {
      bonds = bonds.filter((bond) =>
        bond.agent.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tier filter
    if (filterTier !== "all") {
      bonds = bonds.filter((bond) => bond.tier === filterTier);
    }

    // Status filter
    if (filterStatus !== "all") {
      bonds = bonds.filter((bond) => bond.status === filterStatus);
    }

    // Rarity filter
    if (filterRarity !== "all") {
      bonds = bonds.filter((bond) => bond.rarityTier === filterRarity);
    }

    // Sorting
    bonds.sort((a, b) => {
      switch (sortBy) {
        case "affinity-desc":
          return b.affinityLevel - a.affinityLevel;
        case "affinity-asc":
          return a.affinityLevel - b.affinityLevel;
        case "rarity-desc":
          return b.rarityScore - a.rarityScore;
        case "rarity-asc":
          return a.rarityScore - b.rarityScore;
        case "duration-desc":
          return b.durationDays - a.durationDays;
        case "duration-asc":
          return a.durationDays - b.durationDays;
        case "rank-asc":
          return (a.globalRank || 999999) - (b.globalRank || 999999);
        case "recent":
          return (
            new Date(b.lastInteraction).getTime() -
            new Date(a.lastInteraction).getTime()
          );
        default:
          return 0;
      }
    });

    return bonds;
  }, [
    bondsData,
    searchTerm,
    filterTier,
    filterStatus,
    filterRarity,
    sortBy,
  ]);

  if (loading && !bondsData) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!bondsData) {
    return null;
  }

  const hasAtRiskBonds =
    bondsData.activeBonds.filter(
      (b) => b.status === "fragile" || b.status === "at_risk"
    ).length > 0;

  return (
    <div className="space-y-8">
      {/* Warning for at-risk bonds */}
      {hasAtRiskBonds && (
        <Alert className="border-orange-500 bg-orange-500/10">
          <AlertTriangleIcon className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-200">
            Tienes {bondsData.stats.atRiskCount} vínculo(s) en riesgo. Interactúa pronto para evitar que se deterioren.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Vínculos Activos"
          value={bondsData.stats.totalActive}
          icon="🏆"
          subtitle={`${bondsData.stats.atRiskCount} en riesgo`}
          trend={connected ? "live" : undefined}
        />
        <StatCard
          label="Afinidad Promedio"
          value={`${bondsData.stats.averageAffinity}%`}
          icon="💜"
          subtitle="Promedio general"
        />
        <StatCard
          label="Interacciones"
          value={bondsData.stats.totalInteractions.toLocaleString()}
          icon="💬"
          subtitle="Total acumulado"
        />
        <StatCard
          label="Rareza Máxima"
          value={getRarityName(bondsData.stats.highestRarity)}
          icon="✨"
          subtitle="Mejor logro"
        />
      </div>

      {/* Tabs: Active vs Legacy vs Leaderboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="active" className="gap-2">
            🏆 Activos ({bondsData.activeBonds.length})
          </TabsTrigger>
          <TabsTrigger value="legacy" className="gap-2">
            📜 Legado ({bondsData.legacy.length})
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            👑 Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Active Bonds Tab */}
        <TabsContent value="active" className="space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tier Filter */}
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de vínculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ROMANTIC">💜 Romántico</SelectItem>
                <SelectItem value="BEST_FRIEND">🤝 Mejor Amigo</SelectItem>
                <SelectItem value="MENTOR">🧑‍🏫 Mentor</SelectItem>
                <SelectItem value="CONFIDANT">🤫 Confidente</SelectItem>
                <SelectItem value="CREATIVE_PARTNER">🎨 Creativo</SelectItem>
                <SelectItem value="ADVENTURE_COMPANION">
                  ⚔️ Aventura
                </SelectItem>
                <SelectItem value="ACQUAINTANCE">👋 Conocido</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">✅ Activo</SelectItem>
                <SelectItem value="dormant">😴 Dormido</SelectItem>
                <SelectItem value="fragile">⚠️ Frágil</SelectItem>
                <SelectItem value="at_risk">🚨 En Riesgo</SelectItem>
              </SelectContent>
            </Select>

            {/* Rarity Filter */}
            <Select value={filterRarity} onValueChange={setFilterRarity}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Rareza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Common">Común</SelectItem>
                <SelectItem value="Uncommon">Poco común</SelectItem>
                <SelectItem value="Rare">Rara</SelectItem>
                <SelectItem value="Epic">Épica</SelectItem>
                <SelectItem value="Legendary">Legendaria</SelectItem>
                <SelectItem value="Mythic">Mítica</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="affinity-desc">
                  Afinidad (Mayor)
                </SelectItem>
                <SelectItem value="affinity-asc">Afinidad (Menor)</SelectItem>
                <SelectItem value="rarity-desc">Rareza (Mayor)</SelectItem>
                <SelectItem value="rarity-asc">Rareza (Menor)</SelectItem>
                <SelectItem value="duration-desc">
                  Duración (Mayor)
                </SelectItem>
                <SelectItem value="duration-asc">Duración (Menor)</SelectItem>
                <SelectItem value="rank-asc">Ranking (Mejor)</SelectItem>
                <SelectItem value="recent">Más Recientes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active filter badges */}
          {(filterTier !== "all" ||
            filterStatus !== "all" ||
            filterRarity !== "all" ||
            searchTerm) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Filtros activos:</span>
              {filterTier !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setFilterTier("all")}
                >
                  Tipo: {filterTier} ×
                </Badge>
              )}
              {filterStatus !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setFilterStatus("all")}
                >
                  Estado: {filterStatus} ×
                </Badge>
              )}
              {filterRarity !== "all" && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setFilterRarity("all")}
                >
                  Rareza: {filterRarity} ×
                </Badge>
              )}
              {searchTerm && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setSearchTerm("")}
                >
                  Búsqueda: &quot;{searchTerm}&quot; ×
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterTier("all");
                  setFilterStatus("all");
                  setFilterRarity("all");
                  setSearchTerm("");
                }}
              >
                Limpiar todo
              </Button>
            </div>
          )}

          {/* Bonds Grid */}
          {filteredBonds.length === 0 ? (
            <EmptyState
              title="No se encontraron vínculos"
              description={
                bondsData.activeBonds.length === 0
                  ? "Comienza a interactuar con personajes para establecer vínculos únicos."
                  : "Intenta ajustar los filtros para ver más resultados."
              }
              icon="🔍"
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence mode="popLayout">
                {filteredBonds.map((bond) => (
                  <BondCard key={bond.id} bond={bond} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </TabsContent>

        {/* Legacy Bonds Tab */}
        <TabsContent value="legacy" className="space-y-6">
          {bondsData.legacy.length === 0 ? (
            <EmptyState
              title="No tienes vínculos en tu legado aún"
              description="Los vínculos que liberes o pierdan quedarán registrados aquí como parte de tu historia."
              icon="📜"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {bondsData.legacy.map((legacy) => (
                <LegacyCard key={legacy.id} legacy={legacy} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardContent />
        </TabsContent>
      </Tabs>

      {/* Real-time connection indicator */}
      {connected && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2 text-sm text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          En vivo
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtitle,
  trend,
}: {
  label: string;
  value: number | string;
  icon: string;
  subtitle?: string;
  trend?: "up" | "down" | "live";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-4xl">{icon}</div>
        {trend === "live" && (
          <Badge variant="outline" className="text-xs border-green-500 text-green-400">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </Badge>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16 px-4"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mx-auto">{description}</p>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
        ))}
      </div>
      <div className="flex gap-4">
        <div className="bg-gray-800 rounded-lg h-10 w-32"></div>
        <div className="bg-gray-800 rounded-lg h-10 w-32"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-6 h-64"></div>
        ))}
      </div>
    </div>
  );
}

function getRarityName(level: number): string {
  const names = [
    "N/A",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
    "Mythic",
  ];
  return names[level] || "N/A";
}

function LeaderboardContent() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState("all");

  const TIER_LABELS: Record<string, string> = {
    ROMANTIC: "Pareja Romántica",
    BEST_FRIEND: "Mejor Amigo/a",
    MENTOR: "Mentor",
    CONFIDANT: "Confidente",
    CREATIVE_PARTNER: "Compañero/a Creativo/a",
    ADVENTURE_COMPANION: "Compañero/a de Aventuras",
    ACQUAINTANCE: "Conocido/a",
  };

  const TIER_EMOJI: Record<string, string> = {
    ROMANTIC: "💜",
    BEST_FRIEND: "🤝",
    MENTOR: "🧑‍🏫",
    CONFIDANT: "🤫",
    CREATIVE_PARTNER: "🎨",
    ADVENTURE_COMPANION: "⚔️",
    ACQUAINTANCE: "👋",
  };

  const RARITY_COLORS: Record<string, string> = {
    Common: "from-gray-400 to-gray-600",
    Uncommon: "from-green-400 to-green-600",
    Rare: "from-blue-400 to-blue-600",
    Epic: "from-purple-400 to-purple-600",
    Legendary: "from-orange-400 to-orange-600",
    Mythic: "from-pink-400 via-purple-500 to-indigo-600",
  };

  useEffect(() => {
    fetchData();
  }, [selectedTier]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaderboardRes, statsRes] = await Promise.all([
        fetch(`/api/bonds/leaderboard?tier=${selectedTier}`),
        fetch("/api/bonds/global-stats"),
      ]);

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setLeaderboard(data.leaderboard || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setGlobalStats(data);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="space-y-6">
      {/* Global Stats */}
      {globalStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">✨</div>
            <div className="text-2xl font-bold text-white">
              {globalStats.totalActiveBonds.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Vínculos Activos</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">
              {globalStats.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Usuarios</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-white">
              {globalStats.averageRarityScore.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Rareza Promedio</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">
              {TIER_EMOJI[globalStats.mostPopularTier] || "🏆"}
            </div>
            <div className="text-sm font-bold text-white">
              {TIER_LABELS[globalStats.mostPopularTier] || "Popular"}
            </div>
            <div className="text-sm text-gray-400">Tier Más Popular</div>
          </div>
        </div>
      )}

      {/* Tier Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTier === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTier("all")}
        >
          Todos
        </Button>
        {Object.entries(TIER_LABELS).map(([tier, label]) => (
          <Button
            key={tier}
            variant={selectedTier === tier ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTier(tier)}
          >
            {TIER_EMOJI[tier]} {label}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Cargando leaderboard...</div>
      ) : leaderboard.length === 0 ? (
        <EmptyState
          title="No hay vínculos en esta categoría"
          description="Sé el primero en establecer un vínculo de este tipo"
          icon="🏆"
        />
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry: any, index: number) => {
            const rank = index + 1;
            const rarityColor = RARITY_COLORS[entry.rarityTier] || "from-gray-400 to-gray-600";

            return (
              <motion.div
                key={entry.userId + entry.agentId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-gray-800 rounded-lg p-4 border ${
                  rank <= 3 ? "border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20" : "border-gray-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="text-2xl font-bold w-12 text-center">{getRankIcon(rank)}</div>

                  {/* User */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white truncate">{entry.userName}</span>
                      <span className="text-xl">{TIER_EMOJI[entry.tier]}</span>
                      <span className="text-sm text-gray-400 truncate">{entry.agentName}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs bg-gradient-to-r text-white border-0 ${rarityColor}`}>
                        {entry.rarityTier}
                      </Badge>
                      <span className="text-xs text-gray-400">{entry.affinityLevel}% afinidad</span>
                      <span className="text-xs text-gray-400">{entry.durationDays} días</span>
                      <span className="text-xs text-gray-400">Score: {entry.rarityScore.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
