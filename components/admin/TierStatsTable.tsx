"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  AlertTriangleIcon,
} from "lucide-react";

interface TierStats {
  tier: string;
  totalBonds: number;
  activeBonds: number;
  avgAffinity: number;
  avgDuration: number;
  fillRate: number;
  avgWaitTime: number;
  churnRate: number;
}

const TIER_CONFIG: Record<
  string,
  { name: string; emoji: string; color: string }
> = {
  ROMANTIC: { name: "Romántico", emoji: "💜", color: "text-pink-400" },
  BEST_FRIEND: { name: "Mejor Amigo", emoji: "🤝", color: "text-blue-400" },
  MENTOR: { name: "Mentor", emoji: "🧑‍🏫", color: "text-green-400" },
  CONFIDANT: { name: "Confidente", emoji: "🤫", color: "text-purple-400" },
  CREATIVE_PARTNER: {
    name: "Partner Creativo",
    emoji: "🎨",
    color: "text-orange-400",
  },
  ADVENTURE_COMPANION: {
    name: "Compañero Aventura",
    emoji: "⚔️",
    color: "text-cyan-400",
  },
  ACQUAINTANCE: { name: "Conocido", emoji: "👋", color: "text-gray-400" },
};

export default function TierStatsTable() {
  const [tierStats, setTierStats] = useState<TierStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<keyof TierStats>("totalBonds");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchTierStats();
  }, []);

  const fetchTierStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/bonds-analytics/tier-stats");
      if (res.ok) {
        const data = await res.json();
        setTierStats(data);
      }
    } catch (error) {
      console.error("Error fetching tier stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: keyof TierStats) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  // Sort data
  const sortedStats = [...tierStats].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<UsersIcon className="h-5 w-5" />}
          label="Total Bonds"
          value={tierStats.reduce((sum, t) => sum + t.totalBonds, 0)}
          color="text-blue-400"
        />
        <SummaryCard
          icon={<TrendingUpIcon className="h-5 w-5" />}
          label="Afinidad Promedio"
          value={`${Math.round(
            tierStats.reduce((sum, t) => sum + t.avgAffinity, 0) /
              tierStats.length
          )}%`}
          color="text-green-400"
        />
        <SummaryCard
          icon={<ClockIcon className="h-5 w-5" />}
          label="Duración Promedio"
          value={`${Math.round(
            tierStats.reduce((sum, t) => sum + t.avgDuration, 0) /
              tierStats.length
          )}d`}
          color="text-purple-400"
        />
        <SummaryCard
          icon={<AlertTriangleIcon className="h-5 w-5" />}
          label="Churn Rate Promedio"
          value={`${(
            tierStats.reduce((sum, t) => sum + t.churnRate, 0) / tierStats.length
          ).toFixed(1)}%`}
          color="text-red-400"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
              <TableHead className="text-gray-300 font-semibold">Tier</TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("totalBonds")}
              >
                <div className="flex items-center gap-1">
                  Total
                  {sortBy === "totalBonds" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("activeBonds")}
              >
                <div className="flex items-center gap-1">
                  Activos
                  {sortBy === "activeBonds" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("avgAffinity")}
              >
                <div className="flex items-center gap-1">
                  Afinidad
                  {sortBy === "avgAffinity" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("avgDuration")}
              >
                <div className="flex items-center gap-1">
                  Duración
                  {sortBy === "avgDuration" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("fillRate")}
              >
                <div className="flex items-center gap-1">
                  Fill Rate
                  {sortBy === "fillRate" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("avgWaitTime")}
              >
                <div className="flex items-center gap-1">
                  Espera
                  {sortBy === "avgWaitTime" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-300 font-semibold cursor-pointer hover:text-white"
                onClick={() => handleSort("churnRate")}
              >
                <div className="flex items-center gap-1">
                  Churn
                  {sortBy === "churnRate" &&
                    (sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStats.map((tier, index) => {
              const config = TIER_CONFIG[tier.tier];
              return (
                <motion.tr
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{config?.emoji || "❓"}</span>
                      <span className={`font-medium ${config?.color || ""}`}>
                        {config?.name || tier.tier}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white font-medium">
                    {tier.totalBonds}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-900/20 text-green-400">
                      {tier.activeBonds}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-full max-w-[100px] bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${tier.avgAffinity}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-300 min-w-[40px]">
                        {Math.round(tier.avgAffinity)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {Math.round(tier.avgDuration)}d
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tier.fillRate > 80
                          ? "bg-green-900/20 text-green-400"
                          : tier.fillRate > 50
                          ? "bg-yellow-900/20 text-yellow-400"
                          : "bg-red-900/20 text-red-400"
                      }
                    >
                      {tier.fillRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {tier.avgWaitTime > 0
                      ? `${Math.round(tier.avgWaitTime)}d`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        tier.churnRate > 30
                          ? "bg-red-900/20 text-red-400"
                          : tier.churnRate > 15
                          ? "bg-yellow-900/20 text-yellow-400"
                          : "bg-green-900/20 text-green-400"
                      }
                    >
                      {tier.churnRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700">
      <div className={`${color} mb-2`}>{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}
