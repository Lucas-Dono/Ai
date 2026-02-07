/**
 * Estado Emocional PAD (Pleasure-Arousal-Dominance)
 *
 * Muestra el modelo tridimensional de emoción
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EmotionalStatePADProps {
  valence: number; // -1 a +1
  arousal: number; // 0 a 1
  dominance: number; // 0 a 1
  dominantEmotion?: string;
  dominantIntensity?: number;
  secondaryEmotion?: string;
  secondaryIntensity?: number;
  lastUpdated?: Date;
}

export function EmotionalStatePAD({
  valence,
  arousal,
  dominance,
  dominantEmotion,
  dominantIntensity,
  secondaryEmotion,
  secondaryIntensity,
  lastUpdated,
}: EmotionalStatePADProps) {
  // Convertir valence de -1/+1 a 0-100 para la barra de progreso
  const valencePercent = ((valence + 1) / 2) * 100;
  const arousalPercent = arousal * 100;
  const dominancePercent = dominance * 100;

  // Mapeo de emociones a emojis
  const emotionEmojis: Record<string, string> = {
    joy: "😊",
    trust: "🤝",
    fear: "😨",
    surprise: "😲",
    sadness: "😢",
    disgust: "🤢",
    anger: "😠",
    anticipation: "🎯",
    love: "❤️",
    affection: "💕",
    anxiety: "😰",
    excitement: "🤩",
    contentment: "😌",
  };

  const getValenceLabel = (v: number) => {
    if (v < -0.5) return { label: "Muy Negativo", color: "text-red-400" };
    if (v < -0.2) return { label: "Negativo", color: "text-orange-400" };
    if (v < 0.2) return { label: "Neutral", color: "text-gray-400" };
    if (v < 0.5) return { label: "Positivo", color: "text-green-400" };
    return { label: "Muy Positivo", color: "text-emerald-400" };
  };

  const getArousalLabel = (a: number) => {
    if (a < 0.3) return { label: "Calmado", color: "text-blue-400" };
    if (a < 0.7) return { label: "Moderado", color: "text-indigo-400" };
    return { label: "Activado", color: "text-purple-400" };
  };

  const getDominanceLabel = (d: number) => {
    if (d < 0.3) return { label: "Sumiso", color: "text-gray-400" };
    if (d < 0.7) return { label: "Equilibrado", color: "text-blue-400" };
    return { label: "Dominante", color: "text-cyan-400" };
  };

  const valenceInfo = getValenceLabel(valence);
  const arousalInfo = getArousalLabel(arousal);
  const dominanceInfo = getDominanceLabel(dominance);

  return (
    <Card className="md-card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💭 Estado Emocional Actual
        </CardTitle>
        <CardDescription>
          Análisis basado en el Modelo PAD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emociones Dominantes */}
        {dominantEmotion && (
          <div className="space-y-3 bg-muted/30 rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Emoción Dominante:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {emotionEmojis[dominantEmotion.toLowerCase()] || "💭"}
                </span>
                <span className="font-bold text-foreground capitalize">
                  {dominantEmotion}
                </span>
                {dominantIntensity !== undefined && (
                  <span className="text-sm font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {(dominantIntensity * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            </div>

            {secondaryEmotion && (
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm font-semibold text-muted-foreground">Emoción Secundaria:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {emotionEmojis[secondaryEmotion.toLowerCase()] || "💭"}
                  </span>
                  <span className="font-semibold text-foreground capitalize">
                    {secondaryEmotion}
                  </span>
                  {secondaryIntensity !== undefined && (
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {(secondaryIntensity * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PAD Model Metrics */}
        <div className="space-y-5">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-500 rounded-full"></span>
            Modelo PAD:
          </h4>

          {/* Valence */}
          <div className="space-y-2.5 bg-muted/20 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Valence <span className="text-xs text-muted-foreground font-normal">(Placer/Displacer)</span>
              </span>
              <span className={`font-bold text-sm px-2.5 py-1 rounded-md ${valenceInfo.color}`}>
                {valenceInfo.label}
              </span>
            </div>
            <div className="relative">
              <Progress value={valencePercent} className="h-3" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-0.5 h-5 bg-foreground/40 shadow-sm" />
              </div>
            </div>
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Negativo</span>
              <span>Neutral</span>
              <span>Positivo</span>
            </div>
          </div>

          {/* Arousal */}
          <div className="space-y-2.5 bg-muted/20 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Arousal <span className="text-xs text-muted-foreground font-normal">(Activación)</span>
              </span>
              <span className={`font-bold text-sm px-2.5 py-1 rounded-md ${arousalInfo.color}`}>
                {arousalInfo.label}
              </span>
            </div>
            <Progress value={arousalPercent} className="h-3" />
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Calmado</span>
              <span>Activado</span>
            </div>
          </div>

          {/* Dominance */}
          <div className="space-y-2.5 bg-muted/20 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Dominance <span className="text-xs text-muted-foreground font-normal">(Control)</span>
              </span>
              <span className={`font-bold text-sm px-2.5 py-1 rounded-md ${dominanceInfo.color}`}>
                {dominanceInfo.label}
              </span>
            </div>
            <Progress value={dominancePercent} className="h-3" />
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Sumiso</span>
              <span>Equilibrado</span>
              <span>Dominante</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="pt-3 border-t border-border text-xs text-muted-foreground text-center font-medium">
            Última actualización: {new Date(lastUpdated).toLocaleString("es")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
