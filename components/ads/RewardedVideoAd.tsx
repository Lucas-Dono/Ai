"use client";

/**
 * Rewarded Video Ad Component
 * Muestra un video ad y otorga recompensas al usuario
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

interface RewardedVideoAdProps {
  type: "messages" | "images";
  onRewardGranted?: (amount: number) => void;
  trigger?: React.ReactNode;
}

export function RewardedVideoAd({
  type,
  onRewardGranted,
  trigger,
}: RewardedVideoAdProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);

  const rewardText =
    type === "messages"
      ? "+10 mensajes"
      : "+4 análisis de imágenes por minuto";

  const handleWatchAd = async () => {
    setIsLoading(true);
    setWatchStartTime(Date.now());

    /**
     * FEATURE FUTURA: Integración con Google AdMob
     *
     * Para implementar completamente:
     * 1. Crear cuenta en Google AdMob (https://admob.google.com)
     * 2. Configurar App ID y Ad Unit IDs
     * 3. Instalar SDK: npm install @react-native-google-mobile-ads/admob
     * 4. Configurar en app.json o next.config.js
     * 5. Implementar RewardedAd.load() y .show()
     * 6. Los endpoints /api/rewarded-ads/grant-* ya están listos para validar rewards
     *
     * Mientras tanto, simulamos un video de 30 segundos para testing
     */
    const videoLength = 30; // segundos

    // Simular carga del ad
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simular video (en producción, esto sería el player de ads)
    await new Promise((resolve) => setTimeout(resolve, videoLength * 1000));

    // Calcular segundos vistos
    const watchedSeconds = watchStartTime
      ? Math.floor((Date.now() - watchStartTime) / 1000)
      : videoLength;

    // Otorgar recompensa
    try {
      const endpoint =
        type === "messages"
          ? "/api/rewarded-ads/grant-messages"
          : "/api/rewarded-ads/grant-images";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: `demo-${Date.now()}`,
          provider: "google-admob", // o tu proveedor
          watchedSeconds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al otorgar recompensa");
      }

      const granted =
        type === "messages" ? data.messagesGranted : data.imagesGranted;

      toast.success(data.message || `¡Recompensa otorgada: ${granted}!`);

      onRewardGranted?.(granted);
      setIsOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al otorgar recompensa';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setWatchStartTime(null);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="outline" size="sm">
            🎥 Ver anuncio para ganar {rewardText}
          </Button>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ver anuncio para ganar recompensa</DialogTitle>
            <DialogDescription>
              Mira este breve anuncio de{" "}
              {type === "messages" ? "30 segundos" : "1-2 minutos"} para ganar{" "}
              {rewardText}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Cargando anuncio...
                </p>
              </div>
            ) : (
              <>
                <div className="bg-muted rounded-2xl p-6 text-center">
                  <p className="text-lg font-semibold mb-2">
                    Recompensa: {rewardText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    El video se reproducirá automáticamente
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleWatchAd}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Ver anuncio
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
