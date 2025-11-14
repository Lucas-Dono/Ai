/**
 * Monetization Metrics Dashboard
 *
 * Visualización de métricas de monetización:
 * - MRR (Monthly Recurring Revenue)
 * - Conversiones y plan distribution
 * - Upgrade context analysis
 * - Tendencias temporales
 * - KPIs de negocio
 *
 * PHASE 5: Monetization Analytics
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Users,
  Target,
  AlertCircle,
  Crown,
  Sparkles as SparklesIcon,
  Heart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MonetizationData {
  overview: {
    mrr: number;
    totalUsers: number;
    paidUsers: number;
    conversionRate: number;
    arpu: number;
    ltv: number;
    churnRate: number;
  };
  planDistribution: Array<{
    plan: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  growth: {
    userGrowth: number;
    recentConversions: number;
    conversionRate: number;
  };
  upgradeContexts: Array<{
    context: string;
    count: number;
    percentage: number;
  }>;
  trends: Array<{
    date: string;
    newUsers: number;
    newPaid: number;
    mrr: number;
  }>;
  metadata: {
    generatedAt: string;
    periodDays: number;
    currency: string;
  };
}

const PLAN_COLORS = {
  free: "#6b7280",
  plus: "#8b5cf6",
  ultra: "#ec4899",
};

const CONTEXT_COLORS = {
  limit_reached: "#f59e0b",
  feature_locked: "#8b5cf6",
  voluntary: "#10b981",
};

const PLAN_LABELS = {
  free: "Free",
  plus: "Plus",
  ultra: "Ultra",
};

const CONTEXT_LABELS = {
  limit_reached: "Límite Alcanzado",
  feature_locked: "Feature Bloqueada",
  voluntary: "Upgrade Voluntario",
};

export default function MonetizationMetricsPage() {
  const [data, setData] = useState<MonetizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch("/api/analytics/monetization");
      if (!response.ok) throw new Error("Failed to fetch monetization data");
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error("Error fetching monetization data:", error);
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando métricas de monetización...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive hover-lift-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Error al cargar métricas
            </CardTitle>
            <CardDescription>{error || "No se pudieron cargar los datos"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const planDistributionData = data.planDistribution.map((item) => ({
    name: PLAN_LABELS[item.plan as keyof typeof PLAN_LABELS] || item.plan,
    value: item.count,
    revenue: item.revenue,
  }));

  const upgradeContextData = data.upgradeContexts.map((item) => ({
    name: CONTEXT_LABELS[item.context as keyof typeof CONTEXT_LABELS] || item.context,
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500">
          Métricas de Monetización
        </h1>
        <p className="text-muted-foreground">
          Análisis completo de ingresos, conversiones y comportamiento de usuarios
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="hover-lift-glow bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                MRR (Monthly Recurring Revenue)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${data.overview.mrr.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.metadata.currency} por mes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="hover-lift-glow bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Tasa de Conversión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-bold text-blue-600">{data.overview.conversionRate}%</div>
                {data.overview.conversionRate >= 5 ? (
                  <ArrowUpRight className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-orange-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.overview.paidUsers} de {data.overview.totalUsers} usuarios
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="hover-lift-glow bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                ARPU (Avg Revenue Per User)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                ${data.overview.arpu.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">por usuario/mes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="hover-lift-glow bg-gradient-to-br from-pink-500/5 via-red-500/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-pink-500" />
                LTV (Lifetime Value)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-pink-600">${data.overview.ltv.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground mt-1">valor promedio del cliente</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="hover-lift-glow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crecimiento (30 días)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.growth.userGrowth} usuarios</div>
              <p className="text-xs text-muted-foreground mt-1">
                {data.growth.recentConversions} conversiones ({data.growth.conversionRate}%)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="hover-lift-glow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Pagos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.paidUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((data.overview.paidUsers / data.overview.totalUsers) * 100).toFixed(1)}% del total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="hover-lift-glow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold">{data.overview.churnRate}%</div>
                {data.overview.churnRate < 5 ? (
                  <span className="text-xs text-green-600 font-semibold">Saludable</span>
                ) : (
                  <span className="text-xs text-orange-600 font-semibold">Atención</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">tasa de cancelación mensual</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="context">Contexto de Upgrade</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover-lift-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Distribución de Planes
                </CardTitle>
                <CardDescription>Usuarios por tipo de plan</CardDescription>
              </CardHeader>
              <CardContent>
                {planDistributionData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No hay datos de distribución</p>
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={planDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) =>
                            `${entry.name}: ${entry.value} (${((entry.value / data.overview.totalUsers) * 100).toFixed(0)}%)`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {planDistributionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                PLAN_COLORS[
                                  data.planDistribution[index].plan as keyof typeof PLAN_COLORS
                                ]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {data.planDistribution.map((item, index) => (
                        <div
                          key={item.plan}
                          className="flex items-center justify-between p-3 rounded-2xl bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{
                                backgroundColor:
                                  PLAN_COLORS[item.plan as keyof typeof PLAN_COLORS],
                              }}
                            />
                            <span className="font-medium">
                              {PLAN_LABELS[item.plan as keyof typeof PLAN_LABELS] || item.plan}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{item.count} usuarios</div>
                            <div className="text-xs text-muted-foreground">
                              ${item.revenue}/mes
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover-lift-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Revenue por Plan
                </CardTitle>
                <CardDescription>Contribución de cada plan al MRR</CardDescription>
              </CardHeader>
              <CardContent>
                {data.planDistribution.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No hay datos de revenue</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.planDistribution}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="plan" tickFormatter={(value) => PLAN_LABELS[value as keyof typeof PLAN_LABELS] || value} />
                      <YAxis label={{ value: "Revenue ($)", angle: -90, position: "insideLeft" }} />
                      <Tooltip
                        formatter={(value: any, name: any) => [`$${value}`, name === "revenue" ? "Revenue" : name]}
                        labelFormatter={(label) => PLAN_LABELS[label as keyof typeof PLAN_LABELS] || label}
                      />
                      <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="context">
          <Card className="hover-lift-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-500" />
                Contexto de Upgrade
              </CardTitle>
              <CardDescription>
                Por qué los usuarios decidieron hacer upgrade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upgradeContextData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay datos de contexto</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={upgradeContextData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {upgradeContextData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              CONTEXT_COLORS[
                                data.upgradeContexts[index].context as keyof typeof CONTEXT_COLORS
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      {data.upgradeContexts.map((item, index) => (
                        <div
                          key={item.context}
                          className="p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{
                                  backgroundColor:
                                    CONTEXT_COLORS[item.context as keyof typeof CONTEXT_COLORS],
                                }}
                              />
                              <span className="font-medium">
                                {CONTEXT_LABELS[item.context as keyof typeof CONTEXT_LABELS] ||
                                  item.context}
                              </span>
                            </div>
                            <span className="font-bold text-lg">{item.count}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${item.percentage}%`,
                                backgroundColor:
                                  CONTEXT_COLORS[item.context as keyof typeof CONTEXT_COLORS],
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.percentage.toFixed(1)}% de los upgrades
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Insights
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                          • {upgradeContextData[0]?.name} es el contexto principal de conversión
                        </li>
                        <li>• Optimizar límites puede aumentar conversiones</li>
                        <li>• Los upgrades voluntarios indican buena propuesta de valor</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="hover-lift-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Tendencias Temporales
              </CardTitle>
              <CardDescription>
                Evolución de MRR y conversiones en los últimos {data.metadata.periodDays} días
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.trends.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No hay datos de tendencias</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("es", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis
                      yAxisId="left"
                      label={{ value: "MRR ($)", angle: -90, position: "insideLeft" }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{ value: "Usuarios", angle: 90, position: "insideRight" }}
                    />
                    <Tooltip
                      labelFormatter={(value) =>
                        new Date(value).toLocaleDateString("es", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      }
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="mrr"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="MRR ($)"
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Nuevos Usuarios"
                      dot={{ r: 3 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="newPaid"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Nuevos Pagos"
                      dot={{ r: 3 }}
                    />
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
