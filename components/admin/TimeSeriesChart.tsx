"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface TimeSeriesData {
  date: string;
  bondsCreated: number;
  bondsReleased: number;
  activeUsers: number;
  totalInteractions: number;
}

interface TimeSeriesChartProps {
  detailed?: boolean;
}

export default function TimeSeriesChart({ detailed = false }: TimeSeriesChartProps) {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"bonds" | "users" | "interactions">("bonds");

  useEffect(() => {
    fetchTimeSeriesData();
  }, []);

  const fetchTimeSeriesData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bonds-analytics/time-series");
      if (res.ok) {
        const timeSeriesData = await res.json();
        setData(timeSeriesData);
      }
    } catch (error) {
      console.error("Error fetching time series data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  // Format data for display
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="space-y-4">
      {/* Metric selector */}
      {detailed && (
        <div className="flex gap-2">
          <button
            onClick={() => setMetric("bonds")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              metric === "bonds"
                ? "bg-purple-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Bonds
          </button>
          <button
            onClick={() => setMetric("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              metric === "users"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Usuarios
          </button>
          <button
            onClick={() => setMetric("interactions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              metric === "interactions"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            Interacciones
          </button>
        </div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height={detailed ? 400 : 300}>
          {metric === "bonds" ? (
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="bondsCreated"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorCreated)"
                name="Creados"
              />
              <Area
                type="monotone"
                dataKey="bondsReleased"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorReleased)"
                name="Liberados"
              />
            </AreaChart>
          ) : metric === "users" ? (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
                name="Usuarios Activos"
              />
            </LineChart>
          ) : (
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="colorInteractions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalInteractions"
                stroke="#8b5cf6"
                fillOpacity={1}
                fill="url(#colorInteractions)"
                name="Interacciones"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Stats */}
      {detailed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <StatItem
            label="Total Creados"
            value={data.reduce((sum, d) => sum + d.bondsCreated, 0)}
            color="text-green-400"
          />
          <StatItem
            label="Total Liberados"
            value={data.reduce((sum, d) => sum + d.bondsReleased, 0)}
            color="text-red-400"
          />
          <StatItem
            label="Usuarios Únicos"
            value={Math.max(...data.map((d) => d.activeUsers))}
            color="text-blue-400"
          />
          <StatItem
            label="Total Interacciones"
            value={data.reduce((sum, d) => sum + d.totalInteractions, 0)}
            color="text-purple-400"
          />
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
