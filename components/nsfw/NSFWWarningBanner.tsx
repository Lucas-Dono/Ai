"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NSFWWarningBannerProps {
  agentName?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function NSFWWarningBanner({
  agentName,
  dismissible = true,
  onDismiss,
}: NSFWWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-gradient-to-r from-red-500/20 via-orange-500/20 to-red-500/20 border-2 border-red-500/30 rounded-2xl p-4 mb-4 relative">
      {dismissible && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-500" />
        </div>

        <div className="flex-1 space-y-2">
          <h3 className="font-bold text-red-500 flex items-center gap-2">
            ⚠️ MODO NSFW ACTIVO
            {agentName && <span className="text-sm">({agentName})</span>}
          </h3>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Este contenido puede incluir:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Material adulto y situaciones maduras</li>
              <li>Comportamientos psicológicamente intensos</li>
              <li>Temas no aptos para menores de 18 años</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>
              <strong>Recuerda:</strong> Todo el contenido es ficción para
              entretenimiento entre adultos. No es representación de relaciones
              saludables.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner compacto para mostrar en la interfaz de chat
 */
export function NSFWWarningBadge({ agentName }: { agentName?: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 text-xs">
      <AlertTriangle className="h-3 w-3 text-red-500" />
      <span className="text-red-500 font-medium">NSFW</span>
      {agentName && (
        <span className="text-muted-foreground">• {agentName}</span>
      )}
    </div>
  );
}
