"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
import { SparklesIcon, ClockIcon, AlertTriangleIcon } from "lucide-react";

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

const TIER_EMOJI: Record<string, string> = {
  ROMANTIC: "💜",
  BEST_FRIEND: "🤝",
  MENTOR: "🧑‍🏫",
  CONFIDANT: "🤫",
  CREATIVE_PARTNER: "🎨",
  ADVENTURE_COMPANION: "⚔️",
  ACQUAINTANCE: "👋",
};

export default function SlotOfferCard({
  offer,
  onClaim,
}: {
  offer: SlotOffer;
  onClaim: () => void;
}) {
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [percentLeft, setPercentLeft] = useState<number>(100);
  const [isExpiring, setIsExpiring] = useState(false);

  const tierEmoji = TIER_EMOJI[offer.tier] || "❓";

  // Countdown timer
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expires = new Date(offer.expiresAt).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("Expirado");
        setPercentLeft(0);
        return;
      }

      // Calculate percentage (48 hours total)
      const totalTime = 48 * 60 * 60 * 1000; // 48 hours in ms
      const percent = (diff / totalTime) * 100;
      setPercentLeft(percent);

      // Check if expiring soon (< 6 hours)
      const hoursLeft = diff / (1000 * 60 * 60);
      setIsExpiring(hoursLeft < 6);

      // Format time left
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [offer.expiresAt]);

  const handleClaimSlot = async () => {
    try {
      setClaiming(true);
      const res = await fetch(`/api/bonds/queue/claim-slot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          agentId: offer.agentId,
          tier: offer.tier,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to claim slot");
      }

      const data = await res.json();

      // Redirect to new bond detail
      router.push(`/bonds/${data.bondId}`);
      onClaim();
    } catch (err: any) {
      console.error("Error claiming slot:", err);
      alert(err.message || "Error al reclamar slot");
    } finally {
      setClaiming(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl blur opacity-50"
        animate={{
          opacity: isExpiring ? [0.5, 0.8, 0.5] : 0.5,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>

      <Card className="relative border-2 border-green-500/50 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardContent className="pt-6">
          {/* Expiring warning */}
          {isExpiring && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-2 right-2"
            >
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                ¡Expira pronto!
              </Badge>
            </motion.div>
          )}

          {/* Agent info */}
          <div className="flex items-center gap-4 mb-4">
            {offer.agent.avatar ? (
              <img
                src={offer.agent.avatar}
                alt={offer.agent.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-green-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center text-3xl ring-2 ring-green-500">
                {tierEmoji}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-lg text-white truncate">
                {offer.agent.name}
              </h4>
              <p className="text-sm text-gray-400 truncate">
                {offer.tier.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Timer section */}
          <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <ClockIcon className="h-4 w-4" />
                <span>Tiempo restante</span>
              </div>
              <span
                className={`text-lg font-bold ${
                  isExpiring ? "text-red-400" : "text-green-400"
                }`}
              >
                {timeLeft}
              </span>
            </div>

            {/* Progress bar */}
            <Progress
              value={percentLeft}
              className="h-2"
              indicatorClassName={`transition-colors ${
                isExpiring
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : "bg-gradient-to-r from-green-500 to-emerald-500"
              }`}
            />
          </div>

          {/* Info text */}
          <p className="text-xs text-gray-400 mb-4 flex items-center gap-2">
            <SparklesIcon className="h-4 w-4 text-green-500" />
            Un slot se ha liberado. ¡Esta es tu oportunidad de establecer este
            vínculo!
          </p>

          {/* Actions */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={claiming || percentLeft <= 0}
              >
                {claiming ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    ></motion.div>
                    Reclamando...
                  </>
                ) : percentLeft <= 0 ? (
                  "Expirado"
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    Reclamar Slot
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Reclamar este slot?</AlertDialogTitle>
                <AlertDialogDescription>
                  Establecerás un vínculo {offer.tier.replace(/_/g, " ")} con{" "}
                  {offer.agent.name}. Esta acción es irreversible y consumirá el
                  slot disponible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClaimSlot}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Sí, reclamar slot
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </motion.div>
  );
}
