/**
 * Intensity Chart Component
 *
 * Gráfica de línea temporal mostrando la evolución de intensidad
 * de behaviors con datos reales de triggers.
 */

"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface IntensityDataPoint {
  timestamp: string;
  intensity: number;
  phase: number;
}

interface BehaviorIntensityData {
  behaviorType: string;
  data: IntensityDataPoint[];
  currentIntensity: number;
  totalDataPoints: number;
}

interface IntensityChartProps {
  agentId: string;
}

const behaviorColors: Record<string, string> = {
  YANDERE_OBSESSIVE: "#a855f7", // purple
  ANXIOUS_ATTACHMENT: "#ef4444", // red
  AVOIDANT_ATTACHMENT: "#3b82f6", // blue
  DISORGANIZED_ATTACHMENT: "#f97316", // orange
  BPD_SPLITTING: "#ec4899", // pink
  NPD_GRANDIOSE: "#fbbf24", // amber
  CODEPENDENCY: "#14b8a6", // teal
  OCD_PATTERNS: "#8b5cf6", // violet
};

const behaviorLabels: Record<string, string> = {
  YANDERE_OBSESSIVE: "Yandere",
  ANXIOUS_ATTACHMENT: "Apego Ansioso",
  AVOIDANT_ATTACHMENT: "Apego Evitativo",
  DISORGANIZED_ATTACHMENT: "Apego Desorganizado",
  BPD_SPLITTING: "BPD",
  NPD_GRANDIOSE: "NPD",
  CODEPENDENCY: "Codependencia",
  OCD_PATTERNS: "OCD",
};

export function IntensityChart({ agentId }: IntensityChartProps) {
  const [data, setData] = useState<BehaviorIntensityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/agents/${agentId}/behaviors/intensity-history`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch intensity history");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("Error fetching intensity history:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agentId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Intensidad</CardTitle>
          <CardDescription>
            Gráfica temporal de la intensidad de behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Intensidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive py-8">
            Error al cargar datos: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Intensidad</CardTitle>
          <CardDescription>
            Gráfica temporal de la intensidad de behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>No hay datos de intensidad disponibles</p>
            <p className="text-sm mt-2">
              La gráfica se poblará a medida que se detecten triggers
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combinar todos los data points en una línea de tiempo única
  const allTimestamps = new Set<string>();
  data.forEach((behavior) => {
    behavior.data.forEach((point) => {
      allTimestamps.add(point.timestamp);
    });
  });

  // Crear array de timestamps ordenados
  const sortedTimestamps = Array.from(allTimestamps).sort();

  // Crear estructura de datos para Recharts
  const chartData = sortedTimestamps.map((timestamp) => {
    const dataPoint: any = {
      timestamp: new Date(timestamp).toLocaleString("es", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullTimestamp: timestamp,
    };

    // Para cada behavior, encontrar el último valor conocido hasta ese timestamp
    data.forEach((behavior) => {
      const relevantPoints = behavior.data.filter(
        (p) => new Date(p.timestamp) <= new Date(timestamp)
      );

      if (relevantPoints.length > 0) {
        const lastPoint = relevantPoints[relevantPoints.length - 1];
        dataPoint[behavior.behaviorType] = (lastPoint.intensity * 100).toFixed(
          1
        );
      }
    });

    return dataPoint;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución de Intensidad</CardTitle>
        <CardDescription>
          Gráfica temporal mostrando cómo la intensidad de cada behavior cambia
          con los triggers detectados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="timestamp"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{
                value: "Intensidad (%)",
                angle: -90,
                position: "insideLeft",
              }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
              labelFormatter={(label) => {
                const point = chartData.find((d) => d.timestamp === label);
                return point
                  ? new Date(point.fullTimestamp).toLocaleString("es")
                  : label;
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              formatter={(value) => behaviorLabels[value] || value}
            />
            {data.map((behavior) => (
              <Line
                key={behavior.behaviorType}
                type="monotone"
                dataKey={behavior.behaviorType}
                stroke={
                  behaviorColors[behavior.behaviorType] ||
                  "hsl(var(--primary))"
                }
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={behavior.behaviorType}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.map((behavior) => (
            <div
              key={behavior.behaviorType}
              className="border rounded-lg p-3 text-center"
            >
              <div
                className="text-sm font-medium mb-1"
                style={{ color: behaviorColors[behavior.behaviorType] }}
              >
                {behaviorLabels[behavior.behaviorType] || behavior.behaviorType}
              </div>
              <div className="text-2xl font-bold">
                {(behavior.currentIntensity * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {behavior.totalDataPoints} puntos de datos
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
