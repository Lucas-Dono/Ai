"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { UsersIcon, ClockIcon, TrendingUpIcon, XIcon } from "lucide-react";

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

const TIER_EMOJI: Record<string, string> = {
  ROMANTIC: "💜",
  BEST_FRIEND: "🤝",
  MENTOR: "🧑‍🏫",
  CONFIDANT: "🤫",
  CREATIVE_PARTNER: "🎨",
  ADVENTURE_COMPANION: "⚔️",
  ACQUAINTANCE: "👋",
};

export default function QueuePositionCard({
  position,
  onLeave,
}: {
  position: QueuePosition;
  onLeave: () => void;
}) {
  const [leaving, setLeaving] = useState(false);

  const tierEmoji = TIER_EMOJI[position.tier] || "❓";

  // Calculate progress percentage (inverse - closer to front = higher %)
  const progressPercent =
    ((position.totalInQueue - position.position) / position.totalInQueue) * 100;

  // Calculate days since joined
  const daysSinceJoined = Math.floor(
    (Date.now() - new Date(position.joinedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Get position badge color
  const getPositionColor = () => {
    if (position.position === 1) return "bg-amber-500 text-white";
    if (position.position <= 3) return "bg-orange-500 text-white";
    if (position.position <= 10) return "bg-blue-500 text-white";
    return "bg-gray-500 text-white";
  };

  const handleLeaveQueue = async () => {
    try {
      setLeaving(true);
      const res = await fetch(`/api/bonds/queue/${position.id}/leave`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to leave queue");
      }

      onLeave();
    } catch (err: any) {
      console.error("Error leaving queue:", err);
      alert(err.message || "Error al abandonar cola");
    } finally {
      setLeaving(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <Card className="border-blue-500/30 hover:border-blue-500/50 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Agent avatar */}
            {position.agent.avatar ? (
              <img
                src={position.agent.avatar}
                alt={position.agent.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/50"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl ring-2 ring-blue-500/50">
                {tierEmoji}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg text-white truncate">
                    {position.agent.name}
                  </h4>
                  <p className="text-sm text-gray-400 truncate">
                    {position.tier.replace(/_/g, " ")}
                  </p>
                </div>

                {/* Position badge */}
                <Badge className={`${getPositionColor()} text-base px-3 py-1`}>
                  #{position.position}
                </Badge>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    <UsersIcon className="h-3 w-3" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {position.totalInQueue}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">En cola</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    <ClockIcon className="h-3 w-3" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {position.estimatedWaitDays}d
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">Espera</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-400 mb-1">
                    <TrendingUpIcon className="h-3 w-3" />
                  </div>
                  <p className="text-lg font-bold text-white">
                    {daysSinceJoined}d
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase">Esperando</p>
                </div>
              </div>

              {/* Progress section */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progreso en cola</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <Progress
                  value={progressPercent}
                  className="h-2"
                  indicatorClassName="bg-gradient-to-r from-blue-500 to-cyan-500"
                />
              </div>

              {/* Info message */}
              {position.position === 1 && (
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-lg p-3 mb-4 text-xs text-amber-200">
                  <p className="font-semibold">
                    🎉 ¡Eres el siguiente! Recibirás una oferta cuando un slot se
                    libere.
                  </p>
                </div>
              )}

              {position.position <= 5 && position.position > 1 && (
                <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3 mb-4 text-xs text-blue-200">
                  <p>
                    Estás cerca del frente. Recibirás una notificación cuando esté
                    disponible.
                  </p>
                </div>
              )}

              {/* Actions */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    disabled={leaving}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Abandonar Cola
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Abandonar la cola?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Perderás tu posición #{position.position} en la cola para{" "}
                      {position.agent.name}. Tendrías que unirte nuevamente desde el
                      final si cambias de opinión.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLeaveQueue}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sí, abandonar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
