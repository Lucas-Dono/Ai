"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Lightbulb, Play } from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import {
  getNextTrigger,
  markTriggerShown,
  markRouteVisited,
  type ContextualTrigger,
} from "@/lib/onboarding/contextual-tours";
import { usePathname, useRouter } from "next/navigation";

/**
 * Componente que muestra hints contextuales automáticos
 * basados en el comportamiento del usuario
 */
export function ContextualHint() {
  const [currentTrigger, setCurrentTrigger] = useState<ContextualTrigger | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const { progress } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();

  // Marcar ruta como visitada
  useEffect(() => {
    if (pathname) {
      markRouteVisited(pathname);
    }
  }, [pathname]);

  // Revisar triggers cada 30 segundos
  useEffect(() => {
    const checkTriggers = async () => {
      // No mostrar si hay un tour activo o si ya hay un hint mostrado
      if (progress.currentTour || currentTrigger || isDismissed) {
        return;
      }

      const trigger = await getNextTrigger();
      if (trigger) {
        setCurrentTrigger(trigger);
      }
    };

    // Revisar al montar y cada 30 segundos
    checkTriggers();
    const interval = setInterval(checkTriggers, 30000);

    return () => clearInterval(interval);
  }, [progress.currentTour, currentTrigger, isDismissed]);

  const handleStartTour = () => {
    if (!currentTrigger) return;

    // Marcar como mostrado
    markTriggerShown(currentTrigger.id);

    // Iniciar el tour navegando a la ruta
    router.push(`/tours/${currentTrigger.tourId}`);

    // Limpiar estado
    setCurrentTrigger(null);
    setIsDismissed(false);
  };

  const handleDismiss = () => {
    if (!currentTrigger) return;

    // Marcar como mostrado (para respetar cooldowns)
    markTriggerShown(currentTrigger.id);

    // Limpiar estado
    setCurrentTrigger(null);
    setIsDismissed(true);

    // Resetear dismissed después de 1 minuto
    setTimeout(() => {
      setIsDismissed(false);
    }, 60000);
  };

  return (
    <AnimatePresence>
      {currentTrigger && !isDismissed && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: [0, -8, 0],
            scale: 1,
          }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{
            type: "spring",
            duration: 0.5,
            y: {
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut",
            }
          }}
          className="fixed bottom-4 right-4 left-4 md:left-auto md:bottom-6 md:right-6 z-50"
        >
          <Card className="w-full md:w-80 p-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mt-1 p-2 rounded-full bg-primary/10"
              >
                <Lightbulb className="h-5 w-5 text-primary" />
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground font-medium mb-3">
                  {currentTrigger.message}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleStartTour}
                    className="gap-2 flex-1"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Tour
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDismiss}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress indicator (opcional) */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tip #{currentTrigger.priority}</span>
                <span className="text-primary">•</span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
