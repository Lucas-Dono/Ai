"use client";

/**
 * Rewarded Action Component
 * Alternativa a rewarded video ads para web
 * Recompensa a usuarios por realizar acciones (compartir, invitar, etc.)
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Twitter, Users, ExternalLink } from "lucide-react";

interface RewardedActionAdProps {
  type: "messages" | "images";
  onRewardGranted?: (amount: number) => void;
  trigger?: React.ReactNode;
}

type ActionType = "share_twitter" | "invite_friend" | "visit_sponsor";

const ACTIONS = {
  share_twitter: {
    icon: Twitter,
    label: "Compartir en Twitter",
    description: "Comparte sobre Blaniel en Twitter",
    reward: { messages: 5, images: 2 },
    action: "compartir",
  },
  invite_friend: {
    icon: Users,
    label: "Invitar a un amigo",
    description: "Invita a un amigo a unirse a la plataforma",
    reward: { messages: 20, images: 5 },
    action: "invitar",
  },
  visit_sponsor: {
    icon: ExternalLink,
    label: "Visitar patrocinador",
    description: "Visita nuestro patrocinador por 30 segundos",
    reward: { messages: 10, images: 3 },
    action: "visitar",
  },
} as const;

export function RewardedActionAd({
  type,
  onRewardGranted,
  trigger,
}: RewardedActionAdProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] =
    useState<ActionType>("share_twitter");

  const rewardAmount = ACTIONS[selectedAction].reward[type];

  const handlePerformAction = async () => {
    setIsLoading(true);

    try {
      switch (selectedAction) {
        case "share_twitter": {
          const text = encodeURIComponent(
            "¡Acabo de crear un compañero IA increíble en @CreadorIA! 🤖✨ Pruébalo gratis 👉"
          );
          const url = encodeURIComponent(window.location.origin);
          window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            "_blank"
          );

          // Esperar 3 segundos (tiempo para compartir)
          await new Promise((resolve) => setTimeout(resolve, 3000));
          break;
        }

        case "invite_friend": {
          // Copiar link de referido
          const referralLink = `${window.location.origin}?ref=${Math.random().toString(36).slice(2)}`;
          await navigator.clipboard.writeText(referralLink);
          toast.success("Link de invitación copiado al portapapeles");

          // Esperar 2 segundos
          await new Promise((resolve) => setTimeout(resolve, 2000));
          break;
        }

        case "visit_sponsor": {
          // Abrir sponsor en nueva pestaña
          window.open("https://example-sponsor.com", "_blank");

          // Esperar 30 segundos
          await new Promise((resolve) => setTimeout(resolve, 30000));
          break;
        }
      }

      // Otorgar recompensa
      const endpoint =
        type === "messages"
          ? "/api/rewarded-ads/grant-messages"
          : "/api/rewarded-ads/grant-images";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: `action-${selectedAction}-${Date.now()}`,
          provider: "action-reward",
          watchedSeconds: 0, // No aplica para acciones
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al otorgar recompensa");
      }

      toast.success(
        `¡Excelente! Ganaste ${rewardAmount} ${type === "messages" ? "mensajes" : "análisis de imágenes"}`
      );

      onRewardGranted?.(rewardAmount);
      setIsOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al otorgar recompensa";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="outline" size="sm">
            ⭐ Gana más {type === "messages" ? "mensajes" : "análisis"}
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gana recompensas</DialogTitle>
            <DialogDescription>
              Realiza una acción para ganar{" "}
              {type === "messages" ? "mensajes" : "análisis de imágenes"}
              gratis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selector de acción */}
            <div className="space-y-2">
              {(Object.keys(ACTIONS) as ActionType[]).map((actionKey) => {
                const action = ACTIONS[actionKey];
                const Icon = action.icon;
                const reward = action.reward[type];

                return (
                  <button
                    key={actionKey}
                    onClick={() => setSelectedAction(actionKey)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all hover:bg-accent ${
                      selectedAction === actionKey
                        ? "border-primary bg-accent"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div className="flex-1 text-left">
                        <p className="font-semibold">{action.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          +{reward}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Banner Ad (AdSense) */}
            <div className="bg-muted rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-2">
                Patrocinado
              </p>
              {/* Aquí iría el banner de AdSense */}
              <div className="h-24 bg-background rounded flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  [Banner AdSense]
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePerformAction}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading
                  ? "Procesando..."
                  : `${ACTIONS[selectedAction].action} (+${rewardAmount})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
