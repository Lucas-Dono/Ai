/**
 * Psychology Dashboard
 *
 * Panel de análisis psicológico completo del agente:
 * - Rueda de Plutchik (visualización de emociones)
 * - Perfil psicológico con análisis clínico
 * - Estado emocional PAD
 * - Triggers críticos recientes
 * - Métricas clave
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import {
  PlutchikWheel,
  PsychologicalProfile,
  EmotionalStatePAD,
  CriticalTriggers,
} from "@/components/psychology";

interface EmotionalData {
  state: {
    trust: number;
    affinity: number;
    respect: number;
    valence: number;
    arousal: number;
    dominance: number;
  };
  emotions: Record<string, number>;
  relationLevel: string;
}

interface BehaviorData {
  active: string[];
  phase?: number;
  safetyLevel: "SAFE" | "WARNING" | "CRITICAL" | "EXTREME_DANGER";
  triggers: string[];
  intensity?: number;
}

interface TriggerLog {
  id: string;
  triggerType: string;
  behaviorType: string;
  weight: number;
  detectedText: string | null;
  detectedAt: string;
  message: {
    id: string;
    content: string;
    createdAt: string;
    role: string;
  };
}

interface ProgressionState {
  totalInteractions: number;
  currentIntensities: Record<string, number>;
}

interface DashboardData {
  agent: {
    id: string;
    name: string;
    nsfwMode: boolean;
  };
  emotional: EmotionalData | null;
  behavior: BehaviorData | null;
  relationship: {
    stage: string;
    trust: number;
    affinity: number;
    respect: number;
    totalInteractions: number;
  };
  triggerHistory: TriggerLog[];
  progressionState: ProgressionState | null;
  stats: {
    totalTriggers: number;
    averageWeight: number;
  };
}

export default function PsychologyDashboard() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load agent state
        const [stateRes, behaviorsRes] = await Promise.all([
          fetch(`/api/agents/${agentId}/state`),
          fetch(`/api/agents/${agentId}/behaviors?limit=20`),
        ]);

        if (!stateRes.ok || !behaviorsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const stateData = await stateRes.json();
        const behaviorsData = await behaviorsRes.json();

        setData({
          agent: behaviorsData.agent,
          emotional: stateData.emotional,
          behavior: stateData.behavior,
          relationship: stateData.relationship,
          triggerHistory: behaviorsData.triggerHistory,
          progressionState: behaviorsData.progressionState,
          stats: behaviorsData.stats,
        });
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Cargando análisis psicológico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar datos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error || "No se pudieron cargar los datos"}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Preparar datos para los componentes
  const emotions = data.emotional?.emotions || {};

  // Encontrar emociones dominante y secundaria
  const emotionEntries = Object.entries(emotions as Record<string, number>)
    .sort((a, b) => b[1] - a[1]);
  const dominantEmotion = emotionEntries[0]?.[0];
  const dominantIntensity = emotionEntries[0]?.[1];
  const secondaryEmotion = emotionEntries[1]?.[0];
  const secondaryIntensity = emotionEntries[1]?.[1];

  // Preparar datos de behaviors para el perfil psicológico
  const behaviorDataForProfile = data.behavior?.active
    ? data.behavior.active.map((behaviorType, index) => ({
        type: behaviorType,
        intensity: data.progressionState?.currentIntensities[behaviorType] || 0,
        phase: data.behavior?.phase,
        trend: undefined, // TODO: Calcular tendencia desde histórico
      }))
    : [];

  // Contar triggers críticos (weight > 0.7)
  const criticalTriggerCount = data.triggerHistory.filter((t) => t.weight > 0.7).length;

  return (
    <div className="min-h-screen bg-surface">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between md-card-elevated p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-muted rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">{data.agent.name}</h1>
              <p className="text-muted-foreground font-medium mt-1">Análisis Psicológico Completo</p>
            </div>
          </div>
          {data.agent.nsfwMode && (
            <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-xl md-elevation-2">
              Modo NSFW Activo
            </span>
          )}
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="bg-blue-500/10 border-2 border-blue-500/30 md-elevation-1 hover:md-elevation-2 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <span className="text-lg">💬</span> Interacciones Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-blue-300">
                {data.progressionState?.totalInteractions || 0}
              </div>
              <p className="text-xs text-blue-400/80 mt-2 font-semibold">
                Etapa: {data.relationship.stage}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-500/10 border-2 border-purple-500/30 md-elevation-1 hover:md-elevation-2 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <span className="text-lg">🎭</span> Behaviors Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-purple-300">
                {data.behavior?.active.length || 0}
              </div>
              <p className="text-xs text-purple-400/80 mt-2 font-semibold">
                Safety: {data.behavior?.safetyLevel || "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-orange-500/10 border-2 border-orange-500/30 md-elevation-1 hover:md-elevation-2 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-orange-400 flex items-center gap-2">
                <span className="text-lg">⚡</span> Triggers Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-orange-300">{data.stats.totalTriggers}</div>
              <p className="text-xs text-orange-400/80 mt-2 font-semibold">
                {criticalTriggerCount} críticos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-green-500/10 border-2 border-green-500/30 md-elevation-1 hover:md-elevation-2 transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span className="text-lg">📊</span> Peso Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-green-300">
                {data.stats.averageWeight.toFixed(2)}
              </div>
              <p className="text-xs text-green-400/80 mt-2 font-semibold">
                {data.stats.averageWeight > 0.7
                  ? "Alto impacto"
                  : data.stats.averageWeight > 0.4
                  ? "Moderado"
                  : "Bajo impacto"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Plutchik Wheel */}
            <PlutchikWheel emotions={emotions as Record<string, number>} size={450} />

            {/* Critical Triggers */}
            <CriticalTriggers triggers={data.triggerHistory} maxDisplay={5} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Emotional State PAD */}
            {data.emotional && (
              <EmotionalStatePAD
                valence={data.emotional.state.valence}
                arousal={data.emotional.state.arousal}
                dominance={data.emotional.state.dominance}
                dominantEmotion={dominantEmotion}
                dominantIntensity={dominantIntensity}
                secondaryEmotion={secondaryEmotion}
                secondaryIntensity={secondaryIntensity}
              />
            )}

            {/* Psychological Profile */}
            <PsychologicalProfile
              behaviors={behaviorDataForProfile}
              safetyLevel={data.behavior?.safetyLevel || "SAFE"}
              criticalTriggerCount={criticalTriggerCount}
            />
          </div>
        </div>

        {/* Additional Info */}
        <Card className="bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 border-2 border-indigo-500/20 md-elevation-2">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="text-4xl mb-3">💡</div>
              <h3 className="text-2xl font-extrabold text-foreground">
                Sobre este Panel de Análisis
              </h3>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                Este dashboard utiliza el <strong className="text-blue-400">Modelo de Plutchik</strong> para visualizar emociones
                y el <strong className="text-indigo-400">Modelo PAD</strong> (Pleasure-Arousal-Dominance) para análisis dimensional.
                Los comportamientos se evalúan usando frameworks de psicología clínica moderna.
                Todos los análisis se generan automáticamente basándose en las interacciones reales.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
