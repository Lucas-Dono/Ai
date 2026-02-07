"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBondSocket } from "@/hooks/useBondSocket";
import { BondEventType } from "@/lib/websocket/bond-event-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ClockIcon,
  UsersIcon,
  SparklesIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  InfoIcon,
} from "lucide-react";
import Link from "next/link";
import SlotOfferCard from "./SlotOfferCard";
import QueuePositionCard from "./QueuePositionCard";

interface QueuePosition {
  id: string;
  agentId: string;
  tier: string;
  position: number;
  totalInQueue: number;
  estimatedWaitDays: number;
  joinedAt: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface SlotOffer {
  id: string;
  agentId: string;
  tier: string;
  expiresAt: string;
  agent: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface QueueData {
  queuePositions: QueuePosition[];
  slotOffers: SlotOffer[];
  stats: {
    totalInQueues: number;
    activeOffers: number;
    avgWaitTime: number;
  };
}

const TIER_EMOJI: Record<string, string> = {
  ROMANTIC: "💜",
  BEST_FRIEND: "🤝",
  MENTOR: "🧑‍🏫",
  CONFIDANT: "🤫",
  CREATIVE_PARTNER: "🎨",
  ADVENTURE_COMPANION: "⚔️",
  ACQUAINTANCE: "👋",
};

export default function QueueDashboard({ userId }: { userId: string }) {
  const [queueData, setQueueData] = useState<QueueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { connected, on, off } = useBondSocket();

  // Fetch queue data
  useEffect(() => {
    fetchQueueData();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!connected) return;

    const handleSlotAvailable = (event: any) => {
      console.log("[Queue] Slot available:", event);
      // Refetch to get latest offers
      fetchQueueData();
    };

    const handleQueuePositionChanged = (event: any) => {
      console.log("[Queue] Position changed:", event);
      fetchQueueData();
    };

    on(BondEventType.SLOT_AVAILABLE, handleSlotAvailable);
    on(BondEventType.QUEUE_POSITION_CHANGED, handleQueuePositionChanged);

    return () => {
      off(BondEventType.SLOT_AVAILABLE, handleSlotAvailable);
      off(BondEventType.QUEUE_POSITION_CHANGED, handleQueuePositionChanged);
    };
  }, [connected, on, off]);

  const fetchQueueData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bonds/queue/my-queues");
      if (!res.ok) throw new Error("Failed to fetch queue data");
      const data = await res.json();
      setQueueData(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching queue data:", err);
      setError(err.message || "Error al cargar datos de cola");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !queueData) {
    return <QueueSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangleIcon className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!queueData) {
    return null;
  }

  const hasActiveOffers = queueData.slotOffers.length > 0;

  return (
    <div className="space-y-8">
      {/* Active offers alert */}
      {hasActiveOffers && (
        <Alert className="border-green-500 bg-green-500/10">
          <SparklesIcon className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-200">
            <strong>¡Tienes {queueData.stats.activeOffers} slot(s) disponible(s)!</strong>{" "}
            Reclámalos antes de que expiren.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<UsersIcon className="h-6 w-6" />}
          label="En Cola"
          value={queueData.stats.totalInQueues}
          color="text-blue-400"
          description="Posiciones activas"
        />
        <StatCard
          icon={<SparklesIcon className="h-6 w-6" />}
          label="Slots Disponibles"
          value={queueData.stats.activeOffers}
          color="text-green-400"
          description={
            hasActiveOffers
              ? "¡Reclama ahora!"
              : "Sin ofertas activas"
          }
          highlight={hasActiveOffers}
        />
        <StatCard
          icon={<ClockIcon className="h-6 w-6" />}
          label="Espera Promedio"
          value={`${queueData.stats.avgWaitTime}d`}
          color="text-purple-400"
          description="Tiempo estimado"
        />
      </div>

      {/* Slot Offers Section */}
      {queueData.slotOffers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-green-500" />
              Slots Disponibles
            </h2>
            <Badge variant="outline" className="text-green-400 border-green-500">
              {queueData.slotOffers.length} activo(s)
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {queueData.slotOffers.map((offer) => (
                <SlotOfferCard
                  key={offer.id}
                  offer={offer}
                  onClaim={fetchQueueData}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Queue Positions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-blue-500" />
            Mis Posiciones en Cola
          </h2>
          {queueData.queuePositions.length > 0 && (
            <Badge variant="outline" className="text-gray-400">
              {queueData.queuePositions.length} activa(s)
            </Badge>
          )}
        </div>

        {queueData.queuePositions.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <UsersIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                No estás en ninguna cola
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Cuando intentes establecer un vínculo con un personaje que está
                lleno, serás añadido automáticamente a la cola de espera.
              </p>
              <Button asChild>
                <Link href="/dashboard/mundos">
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Explorar Personajes
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {queueData.queuePositions.map((position) => (
              <QueuePositionCard
                key={position.id}
                position={position}
                onLeave={fetchQueueData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-blue-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <InfoIcon className="h-5 w-5 text-blue-400" />
            ¿Cómo funciona la cola?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p>
              Cuando un vínculo está lleno, puedes unirte a la cola y esperar tu
              turno.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p>
              Cuando un slot quede disponible, recibirás una oferta con{" "}
              <strong>48 horas</strong> para reclamarla.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p>
              Las ofertas expiran automáticamente si no las reclamas, y el slot
              pasa al siguiente en cola.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p>
              Puedes estar en múltiples colas simultáneamente, pero solo puedes
              tener un vínculo activo de cada tipo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Real-time connection indicator */}
      {connected && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-4 py-2 text-sm text-green-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Actualizaciones en vivo
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  description,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 border ${
        highlight
          ? "bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/50"
          : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={color}>{icon}</div>
        {highlight && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <SparklesIcon className="h-5 w-5 text-green-400" />
          </motion.div>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-400 mb-1">{label}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </motion.div>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>
      <div className="bg-gray-800 rounded-xl h-48"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>
    </div>
  );
}
