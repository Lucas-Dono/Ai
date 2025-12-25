"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  Clock,
  Target,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalMessages: number;
    totalMembers: number;
    activityScore: number;
    balanceScore: number;
    engagementRate: number;
    avgResponseTime: number;
  };
  participation: {
    byMember: Array<{
      type: string;
      id: string;
      name: string;
      image?: string;
      avatar?: string;
      messageCount: number;
    }>;
    byDay: Array<{ date: string; count: number }>;
  };
  content: {
    topWords: Array<{ word: string; count: number }>;
  };
  relationships: Array<{
    from: string;
    to: string;
    interactions: number;
  }>;
}

interface GroupAnalyticsDashboardProps {
  groupId: string;
}

export function GroupAnalyticsDashboard({
  groupId,
}: GroupAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    loadAnalytics();
  }, [groupId, timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/analytics?range=${timeRange}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
        <h3 className="font-semibold text-destructive mb-2">
          Error al cargar analytics
        </h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Insights detallados de tu grupo
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { value: "7d", label: "7 días" },
            { value: "30d", label: "30 días" },
            { value: "all", label: "Todo" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<MessageCircle className="w-5 h-5" />}
          label="Total Mensajes"
          value={data.overview.totalMessages.toLocaleString()}
          color="blue"
        />

        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Miembros Activos"
          value={data.overview.totalMembers.toString()}
          color="green"
        />

        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Tiempo de Respuesta Promedio"
          value={`${data.overview.avgResponseTime} min`}
          color="orange"
        />

        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Score de Actividad"
          value={`${data.overview.activityScore}%`}
          color="purple"
          trend={data.overview.activityScore > 50 ? "up" : "down"}
        />

        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Balance de Participación"
          value={`${Math.round(data.overview.balanceScore * 100)}%`}
          color="pink"
          trend={data.overview.balanceScore > 0.7 ? "up" : "down"}
        />

        <StatCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Engagement Rate"
          value={`${Math.round(data.overview.engagementRate * 100)}%`}
          color="cyan"
          trend={data.overview.engagementRate > 0.5 ? "up" : "down"}
        />
      </div>

      {/* Participation by Member */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Participación por Miembro
        </h3>

        <div className="space-y-3">
          {data.participation.byMember.map((member, index) => {
            const maxMessages = data.participation.byMember[0]?.messageCount || 1;
            const percentage = (member.messageCount / maxMessages) * 100;

            return (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="font-medium">{member.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-muted rounded">
                      {member.type === "user" ? "Usuario" : "IA"}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {member.messageCount} mensajes
                  </span>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      member.type === "user"
                        ? "bg-gradient-to-r from-primary to-primary/70"
                        : "bg-gradient-to-r from-purple-500 to-purple-700"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Actividad Diaria
        </h3>

        <div className="space-y-4">
          {/* Simple bar chart */}
          <div className="flex items-end gap-1 h-32">
            {data.participation.byDay.map((day, index) => {
              const maxCount =
                Math.max(...data.participation.byDay.map((d) => d.count)) || 1;
              const height = (day.count / maxCount) * 100;

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center group"
                  title={`${day.date}: ${day.count} mensajes`}
                >
                  <div className="w-full bg-gradient-to-t from-primary to-primary/50 rounded-t group-hover:from-primary/80 group-hover:to-primary/40 transition-colors">
                    <div
                      className="w-full"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                    {new Date(day.date).toLocaleDateString("es", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Total: {data.participation.byDay.reduce((sum, d) => sum + d.count, 0)}{" "}
              mensajes
            </span>
            <span>
              Promedio:{" "}
              {Math.round(
                data.participation.byDay.reduce((sum, d) => sum + d.count, 0) /
                  data.participation.byDay.length
              )}{" "}
              msg/día
            </span>
          </div>
        </div>
      </div>

      {/* Top Words */}
      {data.content.topWords.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Palabras Más Frecuentes
          </h3>

          <div className="flex flex-wrap gap-2">
            {data.content.topWords.map((wordData) => {
              const maxCount = data.content.topWords[0]?.count || 1;
              const size = 0.7 + (wordData.count / maxCount) * 0.8; // 0.7x to 1.5x

              return (
                <div
                  key={wordData.word}
                  className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  style={{ fontSize: `${size}rem` }}
                >
                  <span className="font-medium">{wordData.word}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({wordData.count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relationship Insights */}
      {data.relationships.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Interacciones Principales
          </h3>

          <div className="space-y-2">
            {data.relationships.slice(0, 10).map((rel, index) => (
              <div
                key={`${rel.from}-${rel.to}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <div className="text-sm">
                    Miembro → Miembro
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {rel.interactions} interacciones
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "orange" | "purple" | "pink" | "cyan";
  trend?: "up" | "down";
}

function StatCard({ icon, label, value, color, trend }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 text-blue-600 dark:text-blue-400",
    green:
      "from-green-500/20 to-green-600/20 text-green-600 dark:text-green-400",
    orange:
      "from-orange-500/20 to-orange-600/20 text-orange-600 dark:text-orange-400",
    purple:
      "from-purple-500/20 to-purple-600/20 text-purple-600 dark:text-purple-400",
    pink: "from-pink-500/20 to-pink-600/20 text-pink-600 dark:text-pink-400",
    cyan: "from-cyan-500/20 to-cyan-600/20 text-cyan-600 dark:text-cyan-400",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div
          className={`p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]}`}
        >
          {icon}
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 ${
              trend === "up"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
