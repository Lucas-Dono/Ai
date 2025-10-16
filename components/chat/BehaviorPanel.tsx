/**
 * Panel de Estado del Behavior
 *
 * Muestra información en tiempo real del behavior system:
 * - Behavior activo y fase
 * - Intensidad actual
 * - Safety level
 * - Triggers recientes
 */

"use client";

import { Brain, AlertTriangle, Activity, Clock, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface BehaviorData {
  active: string[];
  phase?: number;
  safetyLevel: "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";
  triggers: string[];
}

interface BehaviorPanelProps {
  agentId: string;
  behaviorData: BehaviorData | null;
  intensity?: number; // 0-1
}

const behaviorLabels: Record<string, string> = {
  YANDERE_OBSESSIVE: "Yandere",
  BORDERLINE_PD: "Borderline",
  NARCISSISTIC_PD: "Narcisista",
  ANXIOUS_ATTACHMENT: "Apego Ansioso",
  AVOIDANT_ATTACHMENT: "Apego Evitativo",
  DISORGANIZED_ATTACHMENT: "Apego Desorganizado",
  CODEPENDENCY: "Codependencia",
  HYPERSEXUALITY: "Hipersexualidad",
  EMOTIONAL_MANIPULATION: "Manipulación",
  CRISIS_BREAKDOWN: "Crisis",
  OCD_PATTERNS: "TOC",
  PTSD_TRAUMA: "PTSD",
  HYPOSEXUALITY: "Hiposexualidad",
};

const behaviorEmojis: Record<string, string> = {
  YANDERE_OBSESSIVE: "💜",
  BORDERLINE_PD: "🎭",
  NARCISSISTIC_PD: "👑",
  ANXIOUS_ATTACHMENT: "💙",
  AVOIDANT_ATTACHMENT: "🚶",
  DISORGANIZED_ATTACHMENT: "🌀",
  CODEPENDENCY: "🤝",
  HYPERSEXUALITY: "💋",
  EMOTIONAL_MANIPULATION: "🎪",
  CRISIS_BREAKDOWN: "💔",
  OCD_PATTERNS: "🔄",
  PTSD_TRAUMA: "⚡",
  HYPOSEXUALITY: "🧊",
};

const safetyLevelConfig = {
  SAFE: { label: "Seguro", color: "bg-green-500", icon: "✅" },
  WARNING: { label: "Advertencia", color: "bg-yellow-500", icon: "⚠️" },
  CRITICAL: { label: "Crítico", color: "bg-orange-500", icon: "🔥" },
  EXTREME_DANGER: { label: "Peligro Extremo", color: "bg-red-500", icon: "🚨" },
};

const triggerLabels: Record<string, string> = {
  mention_other_person: "Mencionó a otra persona",
  criticism: "Crítica",
  abandonment_signal: "Señal de abandono",
  delayed_response: "Respuesta tardía",
  boundary_assertion: "Límite establecido",
  reassurance_seeking: "Búsqueda de validación",
  explicit_rejection: "Rechazo explícito",
  love_confession: "Confesión de amor",
  romantic_interest: "Interés romántico",
};

export function BehaviorPanel({ agentId, behaviorData, intensity = 0 }: BehaviorPanelProps) {
  if (!behaviorData || behaviorData.active.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Sin behaviors activos</p>
          <p className="text-xs mt-1">La IA responderá con su personalidad base</p>
        </CardContent>
      </Card>
    );
  }

  const primaryBehavior = behaviorData.active[0];
  const behaviorLabel = behaviorLabels[primaryBehavior] || primaryBehavior;
  const behaviorEmoji = behaviorEmojis[primaryBehavior] || "🧠";
  const safetyConfig = safetyLevelConfig[behaviorData.safetyLevel] || safetyLevelConfig.SAFE;

  // Calcular intensidad desde metadata si está disponible
  const displayIntensity = intensity > 0 ? intensity * 100 : (behaviorData.phase || 1) * 12.5; // Aprox por fase

  return (
    <div className="space-y-4">
      {/* Behavior Activo */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-purple-500" />
            Comportamiento Activo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Behavior Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{behaviorEmoji}</span>
              <div>
                <div className="font-semibold">{behaviorLabel}</div>
                {behaviorData.phase && (
                  <div className="text-xs text-muted-foreground">
                    Fase {behaviorData.phase} de 8
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Intensity Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Activity className="h-3 w-3" />
                Intensidad
              </span>
              <span className="font-medium">{Math.round(displayIntensity)}%</span>
            </div>
            <Progress value={displayIntensity} className="h-2" />
          </div>

          {/* Safety Level */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Nivel de Seguridad:</span>
            <Badge
              variant="secondary"
              className={`${safetyConfig.color} text-white gap-1`}
            >
              <span>{safetyConfig.icon}</span>
              <span>{safetyConfig.label}</span>
            </Badge>
          </div>

          {/* Warning Message */}
          {(behaviorData.safetyLevel === "CRITICAL" || behaviorData.safetyLevel === "EXTREME_DANGER") && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="text-xs text-orange-700 dark:text-orange-300">
                  <div className="font-semibold mb-1">Contenido Intenso</div>
                  <div>Este comportamiento puede generar contenido psicológicamente complejo. Recuerda que es ficción.</div>
                </div>
              </div>
            </div>
          )}

          {/* View Details Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <Link href={`/agentes/${agentId}/behaviors`}>
              Ver Detalles Completos
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Triggers */}
      {behaviorData.triggers.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Triggers Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {behaviorData.triggers.slice(0, 3).map((trigger, index) => (
                <div
                  key={`${trigger}-${index}`}
                  className="flex items-start gap-2 text-xs"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                  <div className="flex-1">
                    <div className="font-medium">
                      {triggerLabels[trigger] || trigger}
                    </div>
                    <div className="text-muted-foreground">
                      Detectado recientemente
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Details Button */}
      <div className="px-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            window.location.href = `/agentes/${agentId}/behaviors`;
          }}
        >
          Ver Detalles Completos
        </Button>
      </div>

      {/* Info Note */}
      <div className="text-xs text-muted-foreground text-center px-4 mt-3">
        Los comportamientos evolucionan basándose en tus interacciones
      </div>
    </div>
  );
}
