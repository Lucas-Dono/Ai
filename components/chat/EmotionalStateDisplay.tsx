/**
 * Visualización del Estado Emocional
 *
 * Muestra trust, affinity, respect y emociones activas
 */

"use client";

import { Heart, Users, Award, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface EmotionalState {
  trust?: number;
  affinity?: number;
  respect?: number;
}

interface EmotionalStateDisplayProps {
  state: EmotionalState;
  emotions?: string[];
  relationLevel?: number | string; // 0-1 normalized value or stage string
}

const emotionEmojis: Record<string, string> = {
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  fear: "😨",
  disgust: "🤢",
  surprise: "😲",
  love: "❤️",
  affection: "💕",
  jealousy: "😒",
  anxiety: "😰",
  excitement: "🤩",
  curiosity: "🤔",
  contentment: "😌",
  frustration: "😤",
  shame: "😳",
  pride: "😎",
  guilt: "😔",
  hope: "🌟",
  despair: "😞",
  contempt: "😏",
  trust: "🤝",
  distress: "😣",
  gratitude: "🙏",
};

const relationLevelConfig: Record<string, { label: string; color: string; icon: string }> = {
  stranger: { label: "Desconocido", color: "bg-gray-500", icon: "👤" },
  acquaintance: { label: "Conocido", color: "bg-blue-500", icon: "👋" },
  friend: { label: "Amigo", color: "bg-green-500", icon: "🤝" },
  close_friend: { label: "Amigo Cercano", color: "bg-cyan-500", icon: "💙" },
  intimate: { label: "Íntimo", color: "bg-purple-500", icon: "💜" },
  romantic: { label: "Romántico", color: "bg-pink-500", icon: "💕" },
};

/**
 * Convierte nivel de relación numérico (0-1) a string key
 * O retorna el string directamente si ya es un stage key
 */
function getRelationLevelKey(level?: number | string): string {
  // If it's already a string (stage key), return it directly
  if (typeof level === 'string') {
    return level;
  }

  // If it's a number, convert to stage key
  if (!level) return "stranger";

  if (level < 0.2) return "stranger";
  if (level < 0.4) return "acquaintance";
  if (level < 0.6) return "friend";
  if (level < 0.8) return "close_friend";
  if (level < 0.95) return "intimate";
  return "romantic";
}

export function EmotionalStateDisplay({
  state,
  emotions = [],
  relationLevel,
}: EmotionalStateDisplayProps) {
  const relationKey = getRelationLevelKey(relationLevel);
  const relation = relationLevelConfig[relationKey] || relationLevelConfig.stranger; // Fallback to stranger if invalid

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Estado Emocional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Relationship Level */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Relación:</span>
          <Badge variant="secondary" className="gap-1">
            <span>{relation.icon}</span>
            <span>{relation.label}</span>
          </Badge>
        </div>

        {/* Trust, Affinity, Respect */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                Confianza
              </span>
              <span className="font-medium">{Math.round((state.trust || 0) * 100)}%</span>
            </div>
            <Progress value={(state.trust || 0) * 100} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Heart className="h-3 w-3" />
                Afecto
              </span>
              <span className="font-medium">{Math.round((state.affinity || 0) * 100)}%</span>
            </div>
            <Progress value={(state.affinity || 0) * 100} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Award className="h-3 w-3" />
                Respeto
              </span>
              <span className="font-medium">{Math.round((state.respect || 0) * 100)}%</span>
            </div>
            <Progress value={(state.respect || 0) * 100} className="h-1.5" />
          </div>
        </div>

        {/* Active Emotions */}
        {emotions.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Emociones activas:</div>
            <div className="flex flex-wrap gap-1">
              {emotions.slice(0, 5).map((emotion) => (
                <Badge key={emotion} variant="outline" className="text-xs">
                  <span className="mr-1">{emotionEmojis[emotion.toLowerCase()] || "💭"}</span>
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
