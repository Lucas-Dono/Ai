"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Share2,
  Users,
  Award,
  Calendar,
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Link2,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

interface ShareAnalytics {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalShares: number;
    uniqueUsers: number;
    uniqueAgents: number;
    mostPopularMethod: string;
  };
  sharesByMethod: Record<string, number>;
  sharesByMethodWithPercentage: Array<{
    method: string;
    count: number;
    percentage: number;
  }>;
  topAgents: Array<{
    agentId: string;
    agentName: string;
    agentAvatar: string | null;
    shareCount: number;
  }>;
  sharesTimeline: Array<{
    date: string;
    count: number;
  }>;
}

const METHOD_COLORS: Record<string, string> = {
  twitter: "#1DA1F2",
  facebook: "#4267B2",
  linkedin: "#0077B5",
  whatsapp: "#25D366",
  copy_link: "#6366F1",
  community: "#EC4899",
};

const METHOD_ICONS: Record<string, any> = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  copy_link: Link2,
  community: Users,
};

const METHOD_LABELS: Record<string, string> = {
  twitter: "Twitter",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  copy_link: "Copiar Link",
  community: "Comunidad",
};

export default function ShareAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/analytics/shares?days=${period}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Cargando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No se pudieron cargar los datos</p>
          <Button onClick={fetchAnalytics} className="mt-4">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // Preparar datos para gráficos
  const pieChartData = analytics.sharesByMethodWithPercentage.map((item) => ({
    name: METHOD_LABELS[item.method] || item.method,
    value: item.count,
    percentage: item.percentage,
    color: METHOD_COLORS[item.method] || "#6366F1",
  }));

  const timelineData = analytics.sharesTimeline.map((item) => ({
    date: new Date(item.date).toLocaleDateString("es", { month: "short", day: "numeric" }),
    shares: item.count,
  }));

  const methodComparisonData = analytics.sharesByMethodWithPercentage.map((item) => ({
    method: METHOD_LABELS[item.method] || item.method,
    shares: item.count,
    fill: METHOD_COLORS[item.method] || "#6366F1",
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Analytics de Compartidos</h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de cómo se comparten tus agentes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalytics}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Compartidos</CardTitle>
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.totalShares.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                en {period} días
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Únicos</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.uniqueUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                usuarios compartieron
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Agentes Compartidos</CardTitle>
              <Award className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.summary.uniqueAgents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                agentes diferentes
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover-lift bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Método Popular</CardTitle>
              <TrendingUp className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = METHOD_ICONS[analytics.summary.mostPopularMethod];
                  return Icon ? <Icon className="w-5 h-5" /> : null;
                })()}
                <div className="text-2xl font-bold">
                  {METHOD_LABELS[analytics.summary.mostPopularMethod] || analytics.summary.mostPopularMethod}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                método más usado
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="methods">Por Método</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="agents">Top Agentes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Método</CardTitle>
                <CardDescription>
                  Porcentaje de shares por cada método
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Comparación de Métodos</CardTitle>
                <CardDescription>
                  Cantidad total por cada método
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={methodComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="shares" radius={[8, 8, 0, 0]}>
                      {methodComparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalle por Método</CardTitle>
              <CardDescription>
                Análisis completo de cada método de compartido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.sharesByMethodWithPercentage.map((method, index) => {
                  const Icon = METHOD_ICONS[method.method];
                  return (
                    <motion.div
                      key={method.method}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {Icon && (
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${METHOD_COLORS[method.method]}20` }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: METHOD_COLORS[method.method] }}
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">
                            {METHOD_LABELS[method.method] || method.method}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.count} compartidos
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge
                            variant="secondary"
                            className="text-lg font-bold"
                            style={{
                              backgroundColor: `${METHOD_COLORS[method.method]}20`,
                              color: METHOD_COLORS[method.method],
                            }}
                          >
                            {method.percentage}%
                          </Badge>
                        </div>
                        <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${method.percentage}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: METHOD_COLORS[method.method] }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia Temporal</CardTitle>
              <CardDescription>
                Evolución de compartidos a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="shares"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorShares)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>🏆 Top 10 Agentes Más Compartidos</CardTitle>
              <CardDescription>
                Los agentes que generan más viralidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.topAgents.map((agent, index) => (
                  <motion.div
                    key={agent.agentId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index < 3
                        ? "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20"
                        : "bg-card"
                    } hover:bg-accent/50 transition-colors`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-2xl font-bold ${
                            index === 0
                              ? "text-yellow-500"
                              : index === 1
                              ? "text-gray-400"
                              : index === 2
                              ? "text-amber-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          #{index + 1}
                        </span>
                        {index < 3 && (
                          <span className="text-2xl">
                            {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                          </span>
                        )}
                      </div>

                      {agent.agentAvatar && (
                        <img
                          src={agent.agentAvatar}
                          alt={agent.agentName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-border"
                        />
                      )}

                      <div>
                        <div className="font-medium">{agent.agentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {agent.shareCount} compartidos
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="text-lg font-bold"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      {agent.shareCount}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
