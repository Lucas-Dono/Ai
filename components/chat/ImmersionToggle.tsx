/**
 * Toggle de Inmersión
 *
 * Permite al usuario elegir entre:
 * - Modo Inmersivo: Solo chat, sin información técnica visible
 * - Modo Información: Muestra behaviors, emociones, triggers, etc.
 */

"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImmersionToggleProps {
  onToggle: (showInfo: boolean) => void;
  defaultValue?: boolean;
}

export function ImmersionToggle({ onToggle, defaultValue = true }: ImmersionToggleProps) {
  const [showInfo, setShowInfo] = useState(defaultValue);

  // Cargar preferencia del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("immersion-mode");
    if (saved !== null) {
      const value = saved === "true";
      setShowInfo(value);
      onToggle(value);
    }
  }, []);

  const handleToggle = () => {
    const newValue = !showInfo;
    setShowInfo(newValue);
    onToggle(newValue);
    localStorage.setItem("immersion-mode", String(newValue));
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className="relative"
          >
            {showInfo ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-sm">
            <div className="font-semibold mb-1">
              {showInfo ? "Modo Información" : "Modo Inmersivo"}
            </div>
            <div className="text-xs text-muted-foreground max-w-xs">
              {showInfo
                ? "Mostrando estados emocionales y behaviors. Click para ocultar."
                : "Estados ocultos para experiencia inmersiva. Click para mostrar."}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
