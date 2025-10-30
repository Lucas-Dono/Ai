/**
 * Critical Triggers Display
 *
 * Muestra los triggers más importantes recientes
 * Solo muestra los de alto impacto (weight > 0.6)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Trigger {
  id: string;
  triggerType: string;
  behaviorType: string;
  weight: number;
  detectedText: string | null;
  detectedAt: string;
  message: {
    content: string;
    role: string;
  };
}

interface CriticalTriggersProps {
  triggers: Trigger[];
  maxDisplay?: number;
}

const TRIGGER_LABELS: Record<string, string> = {
  mention_other_person: "Mención de otra persona",
  criticism: "Crítica",
  abandonment_signal: "Señal de abandono",
  delayed_response: "Respuesta tardía",
  boundary_assertion: "Límite establecido",
  reassurance_seeking: "Búsqueda de validación",
  explicit_rejection: "Rechazo explícito",
  love_confession: "Confesión de amor",
  romantic_interest: "Interés romántico",
  jealousy: "Celos",
  possessiveness: "Posesividad",
  idealization: "Idealización",
  devaluation: "Devaluación",
};

const TRIGGER_EMOJIS: Record<string, string> = {
  mention_other_person: "👥",
  criticism: "💢",
  abandonment_signal: "🚪",
  delayed_response: "⏰",
  boundary_assertion: "🛑",
  reassurance_seeking: "🤲",
  explicit_rejection: "❌",
  love_confession: "💌",
  romantic_interest: "💕",
  jealousy: "😒",
  possessiveness: "🔒",
  idealization: "✨",
  devaluation: "💔",
};

export function CriticalTriggers({ triggers, maxDisplay = 5 }: CriticalTriggersProps) {
  // Filtrar solo triggers críticos (weight > 0.6) y ordenar por peso
  const criticalTriggers = triggers
    .filter((t) => t.weight > 0.6)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, maxDisplay);

  const getWeightColor = (weight: number) => {
    if (weight >= 0.9) return "bg-red-500 text-white";
    if (weight >= 0.8) return "bg-red-400 text-white";
    if (weight >= 0.7) return "bg-orange-500 text-white";
    return "bg-yellow-500 text-white";
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 0.9) return "Extremo";
    if (weight >= 0.8) return "Muy Alto";
    if (weight >= 0.7) return "Alto";
    return "Moderado-Alto";
  };

  if (criticalTriggers.length === 0) {
    return (
      <Card className="md-card-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ✅ Triggers Críticos
          </CardTitle>
          <CardDescription>
            Eventos de alto impacto recientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 bg-green-500/10 rounded-xl border-2 border-green-500/30">
            <div className="text-5xl mb-3">✓</div>
            <p className="font-bold text-green-400 text-lg">No se detectaron triggers críticos recientemente</p>
            <p className="text-sm text-green-400/80 mt-2 font-medium">
              El agente mantiene un estado emocional estable
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="md-card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          Triggers Críticos
        </CardTitle>
        <CardDescription>
          {criticalTriggers.length} evento(s) de alto impacto detectados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criticalTriggers.map((trigger) => {
            const label = TRIGGER_LABELS[trigger.triggerType] || trigger.triggerType.replace(/_/g, " ");
            const emoji = TRIGGER_EMOJIS[trigger.triggerType] || "⚠️";

            return (
              <div
                key={trigger.id}
                className="bg-muted/20 border-2 border-border rounded-xl p-4 hover:border-border/60 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-2xl bg-muted/50 p-2 rounded-lg">{emoji}</div>
                    <span className="font-bold text-foreground text-sm">
                      {label}
                    </span>
                  </div>
                  <Badge className={`${getWeightColor(trigger.weight)} text-xs shrink-0 px-3 py-1 font-bold`}>
                    {getWeightLabel(trigger.weight)} ({trigger.weight.toFixed(2)})
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground italic ml-1 mb-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                  "{trigger.detectedText || trigger.message.content.substring(0, 100)}..."
                </p>

                <div className="flex items-center justify-between ml-1 text-xs">
                  <Badge variant="outline" className="text-xs font-semibold border-border/60 text-muted-foreground">
                    {trigger.behaviorType.replace(/_/g, " ")}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {formatDistanceToNow(new Date(trigger.detectedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {triggers.filter((t) => t.weight > 0.6).length > maxDisplay && (
          <div className="mt-4 text-center text-sm text-muted-foreground font-semibold bg-muted/30 py-2 rounded-lg">
            + {triggers.filter((t) => t.weight > 0.6).length - maxDisplay} triggers críticos más
          </div>
        )}
      </CardContent>
    </Card>
  );
}
