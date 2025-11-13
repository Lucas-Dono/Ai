"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUpIcon,
  UsersIcon,
  HeartIcon,
  ActivityIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  TrophyIcon,
  SparklesIcon,
} from "lucide-react";
import TimeSeriesChart from "./TimeSeriesChart";
import RarityDistributionChart from "./RarityDistributionChart";
import TierStatsTable from "./TierStatsTable";
import TopUsersTable from "./TopUsersTable";

interface GlobalStats {
  totalBonds: number;
  activeBonds: number;
  totalUsers: number;
  usersWithBonds: number;
  avgBondsPerUser: number;
  avgAffinityLevel: number;
  avgDurationDays: number;
  totalInteractions: number;
  conversionRate: number;
}

interface ConversionFunnel {
  totalUsers: number;
  usersInQueue: number;
  conversionQueue: number;
  usersWithOffers: number;
  conversionOffers: number;
  usersWithBonds: number;
  conversionBonds: number;
}

export default function BondsAnalyticsDashboard() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [conversionFunnel, setConversionFunnel] =
    useState<ConversionFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [statsRes, funnelRes] = await Promise.all([
        fetch("/api/admin/bonds-analytics/global"),
        fetch("/api/admin/bonds-analytics/funnel"),
      ]);

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setGlobalStats(stats);
      }

      if (funnelRes.ok) {
        const funnel = await funnelRes.json();
        setConversionFunnel(funnel);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !globalStats) {
    return <DashboardSkeleton />;
  }

  if (!globalStats) {
    return (
      <div className="text-center py-12 text-gray-500">
        Error al cargar analytics
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-gray-400">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>Actualización automática cada 30s</span>
      </div>

      {/* Global KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={<HeartIcon className="h-6 w-6" />}
          label="Vínculos Activos"
          value={globalStats.activeBonds.toLocaleString()}
          subtitle={`${globalStats.totalBonds} totales`}
          color="text-pink-400"
          trend={
            globalStats.totalBonds > 0
              ? {
                  value:
                    ((globalStats.activeBonds / globalStats.totalBonds) * 100).toFixed(
                      1
                    ) + "%",
                  label: "tasa activa",
                }
              : undefined
          }
        />

        <KPICard
          icon={<UsersIcon className="h-6 w-6" />}
          label="Usuarios con Bonds"
          value={globalStats.usersWithBonds.toLocaleString()}
          subtitle={`de ${globalStats.totalUsers.toLocaleString()}`}
          color="text-blue-400"
          trend={{
            value: globalStats.conversionRate.toFixed(1) + "%",
            label: "conversión",
          }}
        />

        <KPICard
          icon={<TrendingUpIcon className="h-6 w-6" />}
          label="Afinidad Promedio"
          value={`${Math.round(globalStats.avgAffinityLevel)}%`}
          subtitle="nivel global"
          color="text-green-400"
        />

        <KPICard
          icon={<ActivityIcon className="h-6 w-6" />}
          label="Interacciones"
          value={globalStats.totalInteractions.toLocaleString()}
          subtitle="totales"
          color="text-purple-400"
        />

        <KPICard
          icon={<HeartIcon className="h-6 w-6" />}
          label="Bonds por Usuario"
          value={globalStats.avgBondsPerUser.toFixed(2)}
          subtitle="promedio"
          color="text-orange-400"
        />

        <KPICard
          icon={<ActivityIcon className="h-6 w-6" />}
          label="Duración Promedio"
          value={`${Math.round(globalStats.avgDurationDays)}d`}
          subtitle="días activos"
          color="text-cyan-400"
        />

        {conversionFunnel && (
          <>
            <KPICard
              icon={<UsersIcon className="h-6 w-6" />}
              label="En Cola"
              value={conversionFunnel.usersInQueue.toLocaleString()}
              subtitle={`${conversionFunnel.conversionQueue.toFixed(1)}% de usuarios`}
              color="text-yellow-400"
            />

            <KPICard
              icon={<SparklesIcon className="h-6 w-6" />}
              label="Con Ofertas"
              value={conversionFunnel.usersWithOffers.toLocaleString()}
              subtitle={`${conversionFunnel.conversionOffers.toFixed(1)}% conversión`}
              color="text-teal-400"
            />
          </>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="tiers">🎯 Por Tier</TabsTrigger>
          <TabsTrigger value="users">👥 Usuarios</TabsTrigger>
          <TabsTrigger value="trends">📈 Tendencias</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Time Series */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Actividad (Últimos 30 días)
                </CardTitle>
                <CardDescription>
                  Bonds creados, liberados e interacciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeSeriesChart />
              </CardContent>
            </Card>

            {/* Rarity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Distribución de Rareza
                </CardTitle>
                <CardDescription>
                  Bonds activos por nivel de rareza
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RarityDistributionChart />
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          {conversionFunnel && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5 text-green-500" />
                  Embudo de Conversión
                </CardTitle>
                <CardDescription>
                  Flujo de usuarios desde cola hasta bond establecido
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FunnelStep
                    label="Total Usuarios"
                    value={conversionFunnel.totalUsers}
                    percentage={100}
                    color="bg-blue-500"
                  />
                  <FunnelStep
                    label="En Cola"
                    value={conversionFunnel.usersInQueue}
                    percentage={conversionFunnel.conversionQueue}
                    color="bg-yellow-500"
                  />
                  <FunnelStep
                    label="Con Ofertas"
                    value={conversionFunnel.usersWithOffers}
                    percentage={
                      (conversionFunnel.usersWithOffers /
                        conversionFunnel.totalUsers) *
                      100
                    }
                    color="bg-orange-500"
                  />
                  <FunnelStep
                    label="Con Bonds"
                    value={conversionFunnel.usersWithBonds}
                    percentage={conversionFunnel.conversionBonds}
                    color="bg-green-500"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tiers Tab */}
        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas por Tier</CardTitle>
              <CardDescription>
                Análisis detallado de cada tipo de vínculo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TierStatsTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Top Usuarios</CardTitle>
              <CardDescription>
                Usuarios más activos y engaged
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopUsersTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias Temporales</CardTitle>
                <CardDescription>
                  Análisis de patrones y tendencias a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimeSeriesChart detailed />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KPICard({
  icon,
  label,
  value,
  subtitle,
  color,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  trend?: { value: string; label: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="border-gray-700 hover:border-purple-500/50 transition-colors">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className={color}>{icon}</div>
            {trend && (
              <Badge variant="outline" className="text-xs">
                {trend.value}
              </Badge>
            )}
          </div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-sm text-gray-400">{label}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FunnelStep({
  label,
  value,
  percentage,
  color,
}: {
  label: string;
  value: number;
  percentage: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className="text-white font-bold">
          {value.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-gray-800 rounded-xl h-32"></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl h-96"></div>
        <div className="bg-gray-800 rounded-xl h-96"></div>
      </div>
    </div>
  );
}
