/**
 * AwardButton - Botón para dar awards a posts
 */

"use client";

import { useState } from "react";
import { Award, Sparkles as SparklesIcon, Heart, Star, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles, useEmotionalSparkles } from "@/components/effects/Sparkles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface AwardButtonProps {
  postId: string;
  onGiveAward: (awardType: string) => Promise<void>;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const AWARD_TYPES = [
  {
    type: 'helpful',
    name: 'Útil',
    description: 'Este post me ayudó',
    icon: SparklesIcon,
    color: 'text-blue-400 bg-blue-500/10 hover:bg-blue-500/20',
    cost: 0, // Gratis
  },
  {
    type: 'wholesome',
    name: 'Wholesome',
    description: 'Contenido positivo',
    icon: Heart,
    color: 'text-pink-400 bg-pink-500/10 hover:bg-pink-500/20',
    cost: 0,
  },
  {
    type: 'quality',
    name: 'Calidad',
    description: 'Excelente contenido',
    icon: Star,
    color: 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20',
    cost: 0,
  },
  {
    type: 'gold',
    name: 'Oro',
    description: 'Contribución excepcional',
    icon: Trophy,
    color: 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20',
    cost: 100, // Requiere karma/puntos
  },
  {
    type: 'platinum',
    name: 'Platino',
    description: 'Lo mejor de lo mejor',
    icon: Zap,
    color: 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20',
    cost: 500,
  },
];

export function AwardButton({ postId, onGiveAward, variant = "ghost", size = "sm" }: AwardButtonProps) {
  const [open, setOpen] = useState(false);
  const [giving, setGiving] = useState(false);
  const { showSparkles, sparklesConfig, triggerSparkles } = useEmotionalSparkles();

  const handleGiveAward = async (awardType: string) => {
    try {
      setGiving(true);
      await onGiveAward(awardType);

      // Trigger sparkles based on award type
      const awardConfig = AWARD_TYPES.find(a => a.type === awardType);
      const emotion = awardType === 'wholesome' ? 'love' : awardType === 'gold' || awardType === 'platinum' ? 'achievement' : 'joy';
      const intensity = awardConfig?.cost === 500 ? 10 : awardConfig?.cost === 100 ? 8 : 6;
      triggerSparkles({ emotion, intensity, duration: 2 });

      setOpen(false);
    } catch (err) {
      console.error('Error giving award:', err);
      alert(err instanceof Error ? err.message : 'Error al dar award');
    } finally {
      setGiving(false);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Award className="h-4 w-4" />
          {size !== "icon" && "Award"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dar Award</DialogTitle>
          <DialogDescription>
            Premia este post por su calidad o utilidad. Los awards gratuitos ayudan a destacar buen contenido.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {AWARD_TYPES.map((award) => {
            const Icon = award.icon;
            return (
              <button
                key={award.type}
                onClick={() => handleGiveAward(award.type)}
                disabled={giving}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border border-border/50 transition-all",
                  award.color,
                  "hover:border-current disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <Icon className="h-8 w-8" />
                <div className="text-center">
                  <p className="text-sm font-semibold">{award.name}</p>
                  <p className="text-xs opacity-80">{award.description}</p>
                  {award.cost > 0 && (
                    <p className="text-xs font-bold mt-1">{award.cost} karma</p>
                  )}
                  {award.cost === 0 && (
                    <p className="text-xs font-bold mt-1 text-green-400">Gratis</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
    <Sparkles show={showSparkles} {...sparklesConfig} />
    </>
  );
}
