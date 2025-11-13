"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface RarityDistribution {
  Common: number;
  Uncommon: number;
  Rare: number;
  Epic: number;
  Legendary: number;
  Mythic: number;
}

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
  Mythic: "#ec4899",
};

const RARITY_EMOJI: Record<string, string> = {
  Common: "⚪",
  Uncommon: "🟢",
  Rare: "🔵",
  Epic: "🟣",
  Legendary: "🟠",
  Mythic: "✨",
};

export default function RarityDistributionChart() {
  const [distribution, setDistribution] = useState<RarityDistribution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribution();
  }, []);

  const fetchDistribution = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bonds-analytics/rarity-distribution");
      if (res.ok) {
        const data = await res.json();
        setDistribution(data);
      }
    } catch (error) {
      console.error("Error fetching rarity distribution:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!distribution) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  // Convert to chart data
  const chartData = Object.entries(distribution)
    .map(([rarity, count]) => ({
      name: rarity,
      value: count,
      emoji: RARITY_EMOJI[rarity],
    }))
    .filter((item) => item.value > 0); // Only show rarities with bonds

  const totalBonds = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={RARITY_COLORS[entry.name]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Detailed Breakdown */}
      <div className="space-y-2">
        {chartData.map((item, index) => {
          const percentage = (item.value / totalBonds) * 100;

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
              {/* Emoji + Name */}
              <div className="flex items-center gap-2 w-32">
                <span className="text-2xl">{item.emoji}</span>
                <span className="font-medium text-sm text-gray-300">
                  {item.name}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: RARITY_COLORS[item.name] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  ></motion.div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right w-24">
                <p className="text-white font-bold">{item.value}</p>
                <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 font-medium">Total Bonds Activos</span>
          <span className="text-2xl font-bold text-white">
            {totalBonds.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Rarity Insights */}
      <div className="pt-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-300">Insights</h4>
        <div className="space-y-1 text-xs text-gray-400">
          {chartData.length > 0 && (
            <>
              <p>
                • La rareza más común es{" "}
                <span className="text-white font-semibold">
                  {chartData[0].name}
                </span>{" "}
                con {chartData[0].value} bonds
              </p>
              {chartData.find((d) => d.name === "Mythic") && (
                <p>
                  • Hay{" "}
                  <span className="text-pink-400 font-semibold">
                    {chartData.find((d) => d.name === "Mythic")?.value}
                  </span>{" "}
                  bonds Mythic (ultra raros)
                </p>
              )}
              {chartData.find((d) => d.name === "Legendary") && (
                <p>
                  • Hay{" "}
                  <span className="text-orange-400 font-semibold">
                    {chartData.find((d) => d.name === "Legendary")?.value}
                  </span>{" "}
                  bonds Legendary
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
