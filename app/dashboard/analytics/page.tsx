/**
 * Dashboard Global de Analytics
 *
 * Visualización de estadísticas globales de behaviors de todos los agentes.
 */

"use client";

import useSWR from "swr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Activity, TrendingUp, Users, AlertTriangle } from "lucide-react";

interface AnalyticsData {
  agents: Array<{
    id: string;
    name: string;
    kind: string;
    nsfwMode: boolean;
  }>;
  totalAgents: number;
  totalBehaviors: number;
  totalTriggers: number;
  behaviorDistribution: Record<string, number>;
  topTriggers: Array<{
    type: string;
    count: number;
    avgWeight: number;
  }>;
  safetyLevelStats: {
    SAFE: number;
    WARNING: number;
    CRITICAL: number;
    EXTREME_DANGER: number;
  };
  agentComparison: Array<{
    id: string;
    name: string;
    kind: string;
    nsfwMode: boolean;
    behaviorCount: number;
    triggerCount: number;
    avgIntensity: number;
    avgPhase: number;
    createdAt: string;
  }>;
  trends: Array<{
    date: string;
    triggerCount: number;
  }>;
  metadata: {
    generatedAt: string;
    periodDays: number;
  };
}

const behaviorLabels: Record<string, string> = {
  YANDERE_OBSESSIVE: "Yandere Obsesivo",
  ANXIOUS_ATTACHMENT: "Apego Ansioso",
  AVOIDANT_ATTACHMENT: "Apego Evitativo",
  DISORGANIZED_ATTACHMENT: "Apego Desorganizado",
  BPD_SPLITTING: "TLP (Splitting)",
  NPD_GRANDIOSE: "TNP Grandioso",
  CODEPENDENCY: "Codependencia",
  OCD_PATTERNS: "Patrones TOC",
};

const COLORS = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#14b8a6", "#f97316"];

const safetyColors = {
  SAFE: "#10b981",
  WARNING: "#f59e0b",
  CRITICAL: "#ef4444",
  EXTREME_DANGER: "#7f1d1d",
};

export default function AnalyticsDashboardPage() {
  // Usar SWR para data fetching con cache automático
  const {
    data,
    error,
    isLoading: loading,
  } = useSWR<AnalyticsData>("/api/analytics/behaviors", {
    // Revalidar cada 5 minutos si la tab está activa
    refreshInterval: 5 * 60 * 1000,
    // Mostrar data anterior mientras revalida
    keepPreviousData: true,
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!loading && !data)) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error al cargar analytics
            </CardTitle>
            <CardDescription>
              {error?.message || "No se pudieron cargar los datos"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Safety check for data availability
  if (!data) {
    return null;
  }

  const behaviorDistributionData = Object.entries(data.behaviorDistribution).map(([key, value]) => ({
    name: behaviorLabels[key] || key, value,
  }));

  const safetyLevelData = Object.entries(data.safetyLevelStats).map(([key, value]) => ({
    name: key, value,
  }));

  const triggerData = data.topTriggers.slice(0, 10).map((trigger) => ({
    name: trigger.type.replace(/_/g, " "),
    count: trigger.count,
    weight: trigger.avgWeight,
  }));

  const criticalLevelCount = data.safetyLevelStats.CRITICAL + data.safetyLevelStats.EXTREME_DANGER;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard de Analytics</h1>
        <p className="text-muted-foreground">Análisis global de behaviors de todos tus agentes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />Total Agentes
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalAgents}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />Behaviors Activos
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalBehaviors}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Total Triggers
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.totalTriggers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />Nivel Crítico
            </CardTitle>
          </CardHeader>
          <CardContent><div className="text-3xl font-bold">{criticalLevelCount}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Behaviors</CardTitle>
              <CardDescription>Cantidad de cada tipo de behavior activo</CardDescription>
            </CardHeader>
            <CardContent>
              {behaviorDistributionData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><p>No hay behaviors activos</p></div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={behaviorDistributionData} cx="50%" cy="50%" labelLine={false}
                      label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={100} fill="#8884d8" dataKey="value">
                      {behaviorDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Niveles de Seguridad</CardTitle>
                <CardDescription>Distribución de safety levels</CardDescription>
              </CardHeader>
              <CardContent>
                {safetyLevelData.every(d => d.value === 0) ? (
                  <div className="text-center py-12 text-muted-foreground"><p>No hay datos de safety level</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={safetyLevelData} cx="50%" cy="50%" labelLine={false}
                        label={(entry: any) => entry.value > 0 ? `${entry.name}: ${entry.value}` : ""}
                        outerRadius={80} fill="#8884d8" dataKey="value">
                        {safetyLevelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={safetyColors[entry.name as keyof typeof safetyColors]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Triggers</CardTitle>
                <CardDescription>Triggers más frecuentes</CardDescription>
              </CardHeader>
              <CardContent>
                {triggerData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground"><p>No hay triggers detectados</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={triggerData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Comparación entre Agentes</CardTitle>
              <CardDescription>Estadísticas de behaviors por agente</CardDescription>
            </CardHeader>
            <CardContent>
              {data.agentComparison.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground"><p>No hay agentes para comparar</p></div>
              ) : (
                <div className="space-y-4">
                  {data.agentComparison.map((agent) => (
                    <div key={agent.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{agent.name}</h3>
                          <p className="text-sm text-muted-foreground">{agent.kind}</p>
                        </div>
                        <div className="flex gap-2">
                          {agent.nsfwMode && (
                            <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded">NSFW</span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Behaviors</p>
                          <p className="text-xl font-bold">{agent.behaviorCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Triggers</p>
                          <p className="text-xl font-bold">{agent.triggerCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Intensidad Promedio</p>
                          <p className="text-xl font-bold">{(agent.avgIntensity * 100).toFixed(0)}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fase Promedio</p>
                          <p className="text-xl font-bold">{agent.avgPhase.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Temporales</CardTitle>
              <CardDescription>Triggers detectados en los últimos {data.metadata.periodDays} días</CardDescription>
            </CardHeader>
            <CardContent>
              {data.trends.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay datos de tendencias</p>
                  <p className="text-sm mt-2">Las tendencias se calcularán cuando haya triggers en los últimos {data.metadata.periodDays} días</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString("es", { month: "short", day: "numeric" })} />
                    <YAxis label={{ value: "Triggers", angle: -90, position: "insideLeft" }} />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" })} />
                    <Legend />
                    <Line type="monotone" dataKey="triggerCount" stroke="#8b5cf6" strokeWidth={2} name="Triggers Detectados" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
