/**
 * Página de Detalles de Behaviors
 *
 * Visualización completa de:
 * - Timeline de progresión de fases
 * - Historial de triggers
 * - Gráficas de intensidad
 * - Configuración de behaviors
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, History, Settings, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntensityChart } from "@/components/behaviors/IntensityChart";
import { BehaviorSettings } from "@/components/behaviors/BehaviorSettings";

interface BehaviorProfile {
  id: string;
  behaviorType: string;
  baseIntensity: number;
  currentPhase: number;
  phaseStartedAt: string;
  interactionsSincePhaseStart: number;
  phaseHistory: Array<{
    phase: number;
    startedAt: string;
    endedAt: string | null;
    interactions: number;
    triggers: string[];
  }>;
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

interface BehaviorData {
  agent: {
    id: string;
    name: string;
    nsfwMode: boolean;
  };
  behaviorProfiles: BehaviorProfile[];
  progressionState: any;
  triggerHistory: TriggerLog[];
  stats: {
    totalTriggers: number;
    triggersByType: Record<string, number>;
    triggersByBehavior: Record<string, number>;
    averageWeight: number;
  };
  pagination: {
    total: number;
    count: number;
    hasMore: boolean;
    nextCursor: string | null;
    limit: number;
  };
}

export default function BehaviorsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  const [data, setData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (cursor?: string) => {
    try {
      const url = cursor
        ? `/api/agents/${agentId}/behaviors?cursor=${cursor}&limit=50`
        : `/api/agents/${agentId}/behaviors?limit=50`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch behavior data");
      }

      const result = await response.json();

      if (cursor && data) {
        // Append triggers to existing data (Load More)
        setData({
          ...result,
          triggerHistory: [...data.triggerHistory, ...result.triggerHistory],
        });
      } else {
        // Initial load
        setData(result);
      }
    } catch (err) {
      console.error("Error fetching behavior data:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const handleLoadMore = async () => {
    if (!data?.pagination.hasMore || loadingMore) return;

    setLoadingMore(true);
    await fetchData(data.pagination.nextCursor || undefined);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando datos de comportamiento...</p>
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
            <CardDescription>{error || "No se pudieron cargar los datos"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{data.agent.name}</h1>
            <p className="text-muted-foreground">Análisis de Comportamientos</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data.agent.nsfwMode && (
            <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-sm rounded-full">
              Modo NSFW Activo
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Behaviors Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.behaviorProfiles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.pagination.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Mostrando {data.triggerHistory.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Peso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.stats.averageWeight.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Interacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.progressionState?.totalInteractions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="triggers" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          {/* Intensity Chart */}
          <IntensityChart agentId={agentId} />

          {/* Phase Progression Details */}
          <Card>
            <CardHeader>
              <CardTitle>Progresión de Fases</CardTitle>
              <CardDescription>
                Detalle de la evolución de cada comportamiento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.behaviorProfiles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay behaviors activos para este agente</p>
                  <p className="text-sm mt-2">
                    Los behaviors se activan durante la configuración inicial o se desarrollan
                    durante las interacciones
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {data.behaviorProfiles.map((profile) => (
                    <div key={profile.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">
                          {profile.behaviorType.replace(/_/g, " ")}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          Fase {profile.currentPhase}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Intensidad Base:</span>
                          <span className="font-medium">
                            {(profile.baseIntensity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Interacciones en esta fase:
                          </span>
                          <span className="font-medium">
                            {profile.interactionsSincePhaseStart}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Fase iniciada:</span>
                          <span className="font-medium">
                            {new Date(profile.phaseStartedAt).toLocaleDateString("es", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Phase History */}
                      {profile.phaseHistory.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="text-sm font-medium mb-3">Historial de Fases:</h4>
                          <div className="space-y-2">
                            {profile.phaseHistory
                              .slice()
                              .reverse()
                              .map((phase, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs bg-muted p-2 rounded"
                                >
                                  <span className="font-medium">Fase {phase.phase}</span>
                                  <span className="text-muted-foreground">
                                    {phase.interactions} interacciones
                                  </span>
                                  <span className="text-muted-foreground">
                                    {new Date(phase.startedAt).toLocaleDateString("es")}
                                    {phase.endedAt &&
                                      ` - ${new Date(phase.endedAt).toLocaleDateString("es")}`}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Triggers</CardTitle>
              <CardDescription>
                Registro de todos los triggers detectados ({data.pagination.total} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.triggerHistory.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No se han detectado triggers aún</p>
                  <p className="text-sm mt-2">
                    Los triggers se detectan automáticamente durante las conversaciones
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {data.triggerHistory.map((trigger) => (
                      <div
                        key={trigger.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {trigger.triggerType.replace(/_/g, " ")}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  trigger.weight > 0.7
                                    ? "bg-red-500/10 text-red-500"
                                    : trigger.weight > 0.4
                                    ? "bg-yellow-500/10 text-yellow-500"
                                    : "bg-green-500/10 text-green-500"
                                }`}
                              >
                                Peso: {trigger.weight.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground italic">
                              "{trigger.detectedText || trigger.message.content}"
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                            {new Date(trigger.detectedAt).toLocaleString("es")}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                            {trigger.behaviorType.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More Button */}
                  {data.pagination.hasMore && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Cargando más...
                          </>
                        ) : (
                          <>
                            Cargar más triggers ({data.pagination.total - data.triggerHistory.length} restantes)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <BehaviorSettings
            agentId={agentId}
            agentName={data.agent.name}
            behaviors={data.behaviorProfiles}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
