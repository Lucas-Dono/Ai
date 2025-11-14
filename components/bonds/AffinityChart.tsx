"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface AffinityDataPoint {
  date: string;
  affinity: number;
  event?: string;
}

export default function AffinityChart({ bondId }: { bondId: string }) {
  const [data, setData] = useState<AffinityDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAffinityHistory();
  }, [bondId]);

  const fetchAffinityHistory = async () => {
    try {
      const res = await fetch(`/api/bonds/${bondId}/affinity-history`);
      if (res.ok) {
        const history = await res.json();
        setData(history);
      }
    } catch (error) {
      console.error("Error fetching affinity history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <p>No hay suficientes datos para mostrar el gráfico aún</p>
      </div>
    );
  }

  // Calculate chart dimensions
  const maxAffinity = Math.max(...data.map((d) => d.affinity), 100);
  const minAffinity = Math.min(...data.map((d) => d.affinity), 0);
  const range = maxAffinity - minAffinity || 1;

  // Generate SVG path
  const width = 800;
  const height = 300;
  const padding = 40;

  const xScale = (index: number) =>
    padding + (index / (data.length - 1)) * (width - 2 * padding);

  const yScale = (value: number) =>
    height - padding - ((value - minAffinity) / range) * (height - 2 * padding);

  const pathData = data
    .map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.affinity);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(" ");

  // Calculate trend
  const firstValue = data[0].affinity;
  const lastValue = data[data.length - 1].affinity;
  const trend = lastValue - firstValue;
  const trendPercent = ((trend / firstValue) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Trend indicator */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-400">
          Últimos {data.length} días
        </h4>
        <div
          className={`flex items-center gap-2 ${
            trend >= 0 ? "text-green-400" : "text-red-400"
          }`}
        >
          {trend >= 0 ? (
            <TrendingUpIcon className="h-4 w-4" />
          ) : (
            <TrendingDownIcon className="h-4 w-4" />
          )}
          <span className="text-sm font-semibold">
            {trend >= 0 ? "+" : ""}
            {trendPercent}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          <g className="grid-lines" opacity="0.1">
            {[0, 25, 50, 75, 100].map((value) => (
              <line
                key={value}
                x1={padding}
                y1={yScale(value)}
                x2={width - padding}
                y2={yScale(value)}
                stroke="currentColor"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Gradient fill */}
          <defs>
            <linearGradient id="affinityGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <motion.path
            d={`${pathData} L ${xScale(data.length - 1)} ${height - padding} L ${padding} ${height - padding} Z`}
            fill="url(#affinityGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Line */}
          <motion.path
            d={pathData}
            fill="none"
            stroke="rgb(168, 85, 247)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Data points */}
          {data.map((point, index) => (
            <g key={index}>
              <motion.circle
                cx={xScale(index)}
                cy={yScale(point.affinity)}
                r="4"
                fill="rgb(168, 85, 247)"
                stroke="rgb(17, 24, 39)"
                strokeWidth="2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                className="cursor-pointer"
              >
                <title>
                  {new Date(point.date).toLocaleDateString()}: {point.affinity}
                  {point.event && `\n${point.event}`}
                </title>
              </motion.circle>

              {/* Highlight significant events */}
              {point.event && (
                <motion.circle
                  cx={xScale(index)}
                  cy={yScale(point.affinity)}
                  r="8"
                  fill="none"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ delay: index * 0.05 + 0.3 }}
                />
              )}
            </g>
          ))}

          {/* Y-axis labels */}
          <g className="text-xs" fill="currentColor" opacity="0.6">
            {[0, 25, 50, 75, 100].map((value) => (
              <text
                key={value}
                x={padding - 10}
                y={yScale(value)}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="12"
              >
                {value}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Nivel de afinidad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-purple-500"></div>
          <span>Evento importante</span>
        </div>
      </div>
    </div>
  );
}
