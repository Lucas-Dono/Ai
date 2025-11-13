"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBondSocket } from "@/hooks/useBondSocket";
import { BondEventType } from "@/lib/websocket/bonds-events";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeftIcon,
  TrendingUpIcon,
  ClockIcon,
  SparklesIcon,
  MessageCircleIcon,
  HeartIcon,
  TrophyIcon,
  BookOpenIcon,
  AlertTriangleIcon,
  TrashIcon,
  CalendarIcon,
  ActivityIcon,
  ZapIcon,
} from "lucide-react";
import AffinityChart from "./AffinityChart";
import BondTimeline from "./BondTimeline";
import MilestonesPanel from "./MilestonesPanel";
import NarrativesPanel from "./NarrativesPanel";

interface BondDetails {
  id: string;
  tier: string;
  rarityTier: string;
  rarityScore: number;
  globalRank: number | null;
  tierRank: number | null;
  durationDays: number;
  affinityLevel: number;
  status: string;
  decayPhase: string;
  lastInteraction: string;
  startDate: string;
  totalInteractions: number;
  sharedExperiences: number;
  emotionalDepth: number;
  narrativesUnlocked: string[];
  milestonesReached: string[];
  legacyImpact: number;
  canonContributions: number;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
    description: string | null;
  };
  config: {
    maxSlots: number;
    currentSlots: number;
  };
}

const RARITY_COLORS: Record<string, string> = {
  Common: "from-gray-400 to-gray-600",
  Uncommon: "from-green-400 to-green-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-orange-400 to-orange-600",
  Mythic: "from-pink-400 via-purple-500 to-indigo-600",
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

const STATUS_INFO: Record<
  string,
  { color: string; label: string; description: string }
> = {
  active: {
    color: "text-green-500",
    label: "Activo",
    description: "Vínculo saludable",
  },
  dormant: {
    color: "text-yellow-500",
    label: "Dormido",
    description: "Requiere atención",
  },
  fragile: {
    color: "text-orange-500",
    label: "Frágil",
    description: "En riesgo",
  },
  at_risk: {
    color: "text-red-500",
    label: "En Riesgo Crítico",
    description: "¡Interactúa urgentemente!",
  },
};

export default function BondDetailView({
  bondId,
  userId,
}: {
  bondId: string;
  userId: string;
}) {
  const router = useRouter();
  const [bond, setBond] = useState<BondDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [releasing, setReleasing] = useState(false);

  const { connected, on, off, subscribeToBond, unsubscribeFromBond } =
    useBondSocket();

  // Fetch bond details
  useEffect(() => {
    fetchBondDetails();
  }, [bondId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!connected || !bondId) return;

    subscribeToBond(bondId);

    const handleBondUpdate = (event: any) => {
      if (event.bondId === bondId) {
        console.log("[BondDetail] Bond updated:", event);
        fetchBondDetails();
      }
    };

    const handleRankChange = (event: any) => {
      if (event.bondId === bondId) {
        console.log("[BondDetail] Rank changed:", event);
        fetchBondDetails();
      }
    };

    on(BondEventType.BOND_UPDATED, handleBondUpdate);
    on(BondEventType.RANK_CHANGED, handleRankChange);

    return () => {
      off(BondEventType.BOND_UPDATED, handleBondUpdate);
      off(BondEventType.RANK_CHANGED, handleRankChange);
      unsubscribeFromBond(bondId);
    };
  }, [connected, bondId, on, off, subscribeToBond, unsubscribeFromBond]);

  const fetchBondDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bonds/${bondId}`);
      if (!res.ok) throw new Error("Failed to fetch bond details");
      const data = await res.json();
      setBond(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching bond:", err);
      setError(err.message || "Error al cargar detalles del vínculo");
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseBond = async () => {
    try {
      setReleasing(true);
      const res = await fetch(`/api/bonds/${bondId}/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "user_released" }),
      });

      if (!res.ok) throw new Error("Failed to release bond");

      // Redirect to dashboard after release
      router.push("/bonds");
    } catch (err: any) {
      console.error("Error releasing bond:", err);
      alert(err.message || "Error al liberar vínculo");
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !bond) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error || "Vínculo no encontrado"}</AlertDescription>
      </Alert>
    );
  }

  const rarityGradient = RARITY_COLORS[bond.rarityTier];
  const tierEmoji = TIER_EMOJI[bond.tier];
  const statusInfo = STATUS_INFO[bond.status];
  const isAtRisk = bond.status === "fragile" || bond.status === "at_risk";

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(bond.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysSinceInteraction = Math.floor(
    (Date.now() - new Date(bond.lastInteraction).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" asChild>
        <Link href="/bonds">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Volver a Vínculos
        </Link>
      </Button>

      {/* Warning for at-risk bond */}
      {isAtRisk && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertTriangleIcon className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">
            <strong>Vínculo en riesgo crítico.</strong> Han pasado{" "}
            {daysSinceInteraction} días desde tu última interacción. Chatea con{" "}
            {bond.agent.name} pronto para evitar que este vínculo se pierda.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Card */}
      <Card className={`border-2 bg-gradient-to-br ${rarityGradient} p-[2px]`}>
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                {bond.agent.avatar ? (
                  <img
                    src={bond.agent.avatar}
                    alt={bond.agent.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-500/50"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl ring-4 ring-purple-500/50">
                    {tierEmoji}
                  </div>
                )}

                {/* Name and tier */}
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {bond.agent.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {bond.tier.replace(/_/g, " ")} • {bond.rarityTier}
                  </CardDescription>
                </div>
              </div>

              {/* Status and actions */}
              <div className="flex flex-col items-end gap-2">
                <Badge
                  variant="outline"
                  className={`text-sm ${statusInfo.color} border-current`}
                >
                  {statusInfo.label}
                </Badge>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={releasing}
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Liberar Vínculo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        ¿Liberar este vínculo?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción es irreversible. El vínculo con{" "}
                        {bond.agent.name} se archivará en tu legado, y el slot
                        quedará disponible para otros usuarios.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleReleaseBond}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Sí, liberar vínculo
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<HeartIcon className="h-6 w-6" />}
          label="Afinidad"
          value={bond.affinityLevel}
          suffix="/100"
          color="text-purple-400"
          description={`Nivel de conexión emocional`}
        />
        <StatCard
          icon={<TrendingUpIcon className="h-6 w-6" />}
          label="Ranking Global"
          value={bond.globalRank ? `#${bond.globalRank}` : "N/A"}
          color="text-yellow-400"
          description={
            bond.tierRank
              ? `Top #${bond.tierRank} en ${bond.tier}`
              : "No rankeado aún"
          }
        />
        <StatCard
          icon={<ClockIcon className="h-6 w-6" />}
          label="Duración"
          value={bond.durationDays}
          suffix=" días"
          color="text-blue-400"
          description={`Iniciado hace ${daysSinceStart} días`}
        />
        <StatCard
          icon={<MessageCircleIcon className="h-6 w-6" />}
          label="Interacciones"
          value={bond.totalInteractions}
          color="text-green-400"
          description={`${bond.sharedExperiences} experiencias compartidas`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SmallStatCard
          icon={<SparklesIcon />}
          label="Rareza"
          value={`${(bond.rarityScore * 100).toFixed(1)}%`}
          color={`bg-gradient-to-r ${rarityGradient}`}
        />
        <SmallStatCard
          icon={<ZapIcon />}
          label="Profundidad"
          value={bond.emotionalDepth}
          color="bg-gradient-to-r from-indigo-500 to-purple-500"
        />
        <SmallStatCard
          icon={<BookOpenIcon />}
          label="Narrativas"
          value={bond.narrativesUnlocked.length}
          color="bg-gradient-to-r from-pink-500 to-rose-500"
        />
        <SmallStatCard
          icon={<TrophyIcon />}
          label="Milestones"
          value={bond.milestonesReached.length}
          color="bg-gradient-to-r from-amber-500 to-orange-500"
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Resumen</TabsTrigger>
          <TabsTrigger value="timeline">📅 Línea de Tiempo</TabsTrigger>
          <TabsTrigger value="milestones">🏆 Logros</TabsTrigger>
          <TabsTrigger value="narratives">📖 Narrativas</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Affinity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Progresión de Afinidad</CardTitle>
              <CardDescription>
                Evolución de tu conexión con {bond.agent.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AffinityChart bondId={bondId} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* About this bond */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Vínculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo de vínculo:</span>
                  <span className="font-semibold">
                    {tierEmoji} {bond.tier.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado:</span>
                  <span className={`font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fase de decay:</span>
                  <span className="font-semibold">{bond.decayPhase}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Última interacción:</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold cursor-help">
                          {daysSinceInteraction === 0
                            ? "Hoy"
                            : `Hace ${daysSinceInteraction}d`}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {new Date(bond.lastInteraction).toLocaleDateString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Disponibilidad:</span>
                  <span className="font-semibold">
                    {bond.config.currentSlots}/{bond.config.maxSlots} slots ocupados
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Legacy Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impacto y Legado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Impacto en legado</span>
                    <span className="font-semibold">
                      {bond.legacyImpact}/100
                    </span>
                  </div>
                  <Progress value={bond.legacyImpact} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Contribuciones canon</span>
                    <span className="font-semibold">
                      {bond.canonContributions}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Tus interacciones han contribuido a la historia del personaje
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <BondTimeline bondId={bondId} />
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones">
          <MilestonesPanel
            bondId={bondId}
            milestonesReached={bond.milestonesReached}
          />
        </TabsContent>

        {/* Narratives Tab */}
        <TabsContent value="narratives">
          <NarrativesPanel
            bondId={bondId}
            narrativesUnlocked={bond.narrativesUnlocked}
            agentName={bond.agent.name}
          />
        </TabsContent>
      </Tabs>

      {/* Chat CTA */}
      <Card className="border-purple-500/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Continúa tu historia con {bond.agent.name}
              </h3>
              <p className="text-gray-400 text-sm">
                Cada interacción fortalece vuestro vínculo y desbloquea nuevas narrativas
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href={`/agentes/${bond.agent.id}`}>
                <MessageCircleIcon className="h-5 w-5 mr-2" />
                Ir al Chat
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  suffix = "",
  color,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <div className={color}>{icon}</div>
        </div>
        <p className="text-3xl font-bold mb-1">
          {value}
          <span className="text-lg text-gray-400">{suffix}</span>
        </p>
        <p className="text-sm font-medium text-gray-400">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SmallStatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={`${color} rounded-lg p-4 text-white`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="opacity-80">{icon}</div>
        <p className="text-xs font-medium opacity-90">{label}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 bg-gray-800 rounded w-32"></div>
      <div className="bg-gray-800 rounded-xl p-6 h-48"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl h-96"></div>
    </div>
  );
}
