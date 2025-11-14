"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import {
  TrophyIcon,
  HeartIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface TopUser {
  userId: string;
  userName?: string;
  userEmail?: string;
  activeBonds: number;
  avgAffinity: number;
  totalInteractions: number;
  engagementScore?: number;
}

export default function TopUsersTable() {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchTopUsers();
  }, [limit]);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/bonds-analytics/top-users?limit=${limit}`
      );
      if (res.ok) {
        const data = await res.json();
        setTopUsers(data);
      }
    } catch (error) {
      console.error("Error fetching top users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (topUsers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay usuarios con bonds activos
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Top {topUsers.length} Usuarios
          </h3>
          <p className="text-sm text-gray-400">
            Usuarios más activos y engaged con el sistema de bonds
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={limit === 10 ? "default" : "outline"}
            size="sm"
            onClick={() => setLimit(10)}
          >
            Top 10
          </Button>
          <Button
            variant={limit === 25 ? "default" : "outline"}
            size="sm"
            onClick={() => setLimit(25)}
          >
            Top 25
          </Button>
          <Button
            variant={limit === 50 ? "default" : "outline"}
            size="sm"
            onClick={() => setLimit(50)}
          >
            Top 50
          </Button>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          <PodiumCard user={topUsers[1]} rank={2} />
          {/* 1st Place */}
          <PodiumCard user={topUsers[0]} rank={1} />
          {/* 3rd Place */}
          <PodiumCard user={topUsers[2]} rank={3} />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-800/50 hover:bg-gray-800/50">
              <TableHead className="text-gray-300 font-semibold w-16">
                Rank
              </TableHead>
              <TableHead className="text-gray-300 font-semibold">
                Usuario
              </TableHead>
              <TableHead className="text-gray-300 font-semibold text-center">
                Bonds
              </TableHead>
              <TableHead className="text-gray-300 font-semibold text-center">
                Afinidad
              </TableHead>
              <TableHead className="text-gray-300 font-semibold text-center">
                Interacciones
              </TableHead>
              <TableHead className="text-gray-300 font-semibold text-center">
                Engagement
              </TableHead>
              <TableHead className="text-gray-300 font-semibold w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topUsers.map((user, index) => (
              <motion.tr
                key={user.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-800/30 transition-colors"
              >
                <TableCell>
                  <div className="flex items-center justify-center">
                    {index < 3 ? (
                      <span className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className="text-gray-400 font-medium">
                        #{index + 1}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-white">
                      {user.userName || "Usuario sin nombre"}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">
                      {user.userEmail || user.userId}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className="bg-purple-900/20 text-purple-400"
                  >
                    <HeartIcon className="h-3 w-3 mr-1" />
                    {user.activeBonds}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-full max-w-[100px] bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${user.avgAffinity}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-300">
                      {Math.round(user.avgAffinity)}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-white font-medium">
                    {user.totalInteractions.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {user.engagementScore !== undefined ? (
                    <Badge
                      variant="outline"
                      className={
                        user.engagementScore >= 80
                          ? "bg-green-900/20 text-green-400"
                          : user.engagementScore >= 60
                          ? "bg-yellow-900/20 text-yellow-400"
                          : "bg-red-900/20 text-red-400"
                      }
                    >
                      <TrendingUpIcon className="h-3 w-3 mr-1" />
                      {user.engagementScore}
                    </Badge>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/profile/${user.userId}`}>
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PodiumCard({ user, rank }: { user: TopUser; rank: number }) {
  const heights = {
    1: "h-48",
    2: "h-40",
    3: "h-36",
  };

  const gradients = {
    1: "from-amber-400 via-yellow-500 to-amber-600",
    2: "from-gray-300 via-gray-400 to-gray-500",
    3: "from-orange-400 via-orange-500 to-orange-600",
  };

  const medals = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`relative ${rank === 2 ? "order-1" : rank === 1 ? "order-2" : "order-3"}`}
    >
      <div
        className={`relative rounded-xl border-2 bg-gradient-to-br ${
          gradients[rank as keyof typeof gradients]
        } p-[2px] ${heights[rank as keyof typeof heights]}`}
      >
        <div className="bg-gray-900 rounded-[calc(0.75rem-2px)] h-full p-4 flex flex-col items-center justify-between">
          {/* Medal */}
          <div className="text-4xl">{medals[rank as keyof typeof medals]}</div>

          {/* User Info */}
          <div className="text-center">
            <p className="font-bold text-white text-sm truncate max-w-[150px]">
              {user.userName || "Usuario"}
            </p>
            <p className="text-xs text-gray-400 truncate max-w-[150px]">
              {user.userEmail || user.userId}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-2 text-xs">
            <div className="text-center">
              <HeartIcon className="h-4 w-4 mx-auto mb-1 text-pink-400" />
              <p className="font-bold text-white">{user.activeBonds}</p>
            </div>
            <div className="text-center">
              <TrophyIcon className="h-4 w-4 mx-auto mb-1 text-purple-400" />
              <p className="font-bold text-white">
                {user.totalInteractions > 1000
                  ? `${(user.totalInteractions / 1000).toFixed(1)}k`
                  : user.totalInteractions}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
