"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Calendar, MessageCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  userId: string;
  userName: string;
  userImage: string | null;
  rank: number;
  activeBondsCount: number;
  averageBondDuration: number;
  totalInteractions: number;
  consistencyScore: number;
  isCurrentUser: boolean;
}

interface UserPosition {
  global: number | null;
  weekly: number | null;
  monthly: number | null;
  percentile: number;
  metrics: any;
}

export function RetentionLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "monthly">("global");

  const fetchLeaderboard = async (type: "global" | "weekly" | "monthly") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard/retention?type=${type}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setUserPosition(data.userPosition);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
    if (rank === 2) return "from-gray-400/20 to-gray-500/20 border-gray-400/30";
    if (rank === 3) return "from-amber-600/20 to-amber-700/20 border-amber-600/30";
    return "";
  };

  return (
    <div className="space-y-6">
      {/* User Position Card */}
      {userPosition && (
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-500" />
              Tu Posición
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-500">
                  #{userPosition.global || "-"}
                </div>
                <p className="text-sm text-muted-foreground">Global</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500">
                  #{userPosition.weekly || "-"}
                </div>
                <p className="text-sm text-muted-foreground">Semanal</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  #{userPosition.monthly || "-"}
                </div>
                <p className="text-sm text-muted-foreground">Mensual</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-500">
                  Top {userPosition.percentile}%
                </div>
                <p className="text-sm text-muted-foreground">Percentil</p>
              </div>
            </div>

            {userPosition.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Bonds Activos
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {userPosition.metrics.activeBondsCount}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    Duración Promedio
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {userPosition.metrics.averageBondDuration} días
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    Interacciones
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {userPosition.metrics.totalInteractions}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="w-4 h-4" />
                    Score
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {userPosition.metrics.consistencyScore}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard de Retention
          </CardTitle>
          <CardDescription>
            Los usuarios más consistentes en mantener sus vínculos activos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="global">🌍 Global</TabsTrigger>
              <TabsTrigger value="weekly">📅 Semanal</TabsTrigger>
              <TabsTrigger value="monthly">📆 Mensual</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <TabsContent value={activeTab} className="space-y-3">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No hay datos de leaderboard disponibles aún
                    </p>
                  </div>
                ) : (
                  leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`p-4 rounded-lg border ${
                        entry.isCurrentUser
                          ? "bg-primary/10 border-primary"
                          : entry.rank <= 3
                          ? `bg-gradient-to-r ${getRankColor(entry.rank)}`
                          : "bg-card"
                      } hover:bg-accent/50 transition-colors`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex items-center gap-2 min-w-[60px]">
                          <span
                            className={`text-2xl font-bold ${
                              entry.rank === 1
                                ? "text-yellow-500"
                                : entry.rank === 2
                                ? "text-gray-400"
                                : entry.rank === 3
                                ? "text-amber-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            #{entry.rank}
                          </span>
                          {getRankIcon(entry.rank) && (
                            <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                          )}
                        </div>

                        {/* User Info */}
                        <Avatar className="w-10 h-10 border-2 border-border">
                          <AvatarImage src={entry.userImage || undefined} />
                          <AvatarFallback>
                            {entry.userName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {entry.userName}
                            {entry.isCurrentUser && (
                              <Badge variant="secondary" className="ml-2">
                                Tú
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Score: {entry.consistencyScore} | {entry.activeBondsCount} bonds activos
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <div className="font-bold">{entry.averageBondDuration}</div>
                            <div className="text-xs text-muted-foreground">días prom.</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{entry.totalInteractions}</div>
                            <div className="text-xs text-muted-foreground">mensajes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-purple-500">
                              {entry.consistencyScore}
                            </div>
                            <div className="text-xs text-muted-foreground">score</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
