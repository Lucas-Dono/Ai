/**
 * Emotional Analytics Page
 * Deep dive into emotional patterns and AI relationships
 */

"use client";

import { useMyStats } from "@/hooks/useMyStats";
import { useClientLocale } from "@/hooks/useClientLocale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Heart, TrendingUp, Smile, ArrowLeft } from "lucide-react";
import Link from "next/link";

const EMOTION_COLORS = [
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
  "#f97316",
];

export default function EmotionsPage() {
  const { data, isLoading, error } = useMyStats("emotions", 30);
  const { t, locale } = useClientLocale();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.emotional) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("myStats.emotions.errorLoading")}</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { emotional } = data;

  // Prepare emotion frequency data for pie chart
  const emotionData = Object.entries(emotional.emotionFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([emotion, count]) => ({
      name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: count,
    }));

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/my-stats">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{t("myStats.emotions.title")}</h1>
          <p className="text-muted-foreground">
            {t("myStats.emotions.subtitle")}
          </p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {emotional.happiestAI && (
          <Card className="border-pink-500/50 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Smile className="h-4 w-4 text-pink-500" />
                {t("myStats.emotions.happiestAI")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emotional.happiestAI.name}</div>
              <p className="text-sm text-muted-foreground">
                {t("myStats.emotions.avgValence").replace("{percent}", (emotional.happiestAI.avgValence * 100).toFixed(0))}
              </p>
            </CardContent>
          </Card>
        )}

        {emotional.mostComfortingAI && (
          <Card className="border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-blue-500" />
                {t("myStats.emotions.mostComfortingAI")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emotional.mostComfortingAI.name}</div>
              <p className="text-sm text-muted-foreground">{t("myStats.emotions.safeSpace")}</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              {t("myStats.emotions.emotionalEvents")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emotional.emotionalJourney.length}</div>
            <p className="text-sm text-muted-foreground">{t("myStats.emotions.significantMoments")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Emotion Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>{t("myStats.emotions.distribution")}</CardTitle>
          <CardDescription>{t("myStats.emotions.frequentEmotions")}</CardDescription>
        </CardHeader>
        <CardContent>
          {emotionData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("myStats.emotions.noData")}</p>
              <p className="text-sm mt-2">
                {t("myStats.emotions.startChatting")}
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={emotionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emotionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Mood Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("myStats.emotions.valenceOverTime")}</CardTitle>
            <CardDescription>{t("myStats.emotions.positiveVsNegative")}</CardDescription>
          </CardHeader>
          <CardContent>
            {emotional.moodTrends.valence.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t("myStats.emotions.notEnoughData")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={emotional.moodTrends.valence}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis domain={[-1, 1]} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name={locale === "es" ? "Valencia" : "Valence"}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("myStats.emotions.arousalOverTime")}</CardTitle>
            <CardDescription>{t("myStats.emotions.energyLevels")}</CardDescription>
          </CardHeader>
          <CardContent>
            {emotional.moodTrends.arousal.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t("myStats.emotions.notEnoughData")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={emotional.moodTrends.arousal}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis domain={[0, 1]} />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ec4899"
                    strokeWidth={2}
                    name={locale === "es" ? "Activación" : "Arousal"}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emotional Journey Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>{t("myStats.emotions.emotionalJourney")}</CardTitle>
          <CardDescription>{t("myStats.emotions.recentMoments")}</CardDescription>
        </CardHeader>
        <CardContent>
          {emotional.emotionalJourney.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t("myStats.emotions.noJourneyData")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emotional.emotionalJourney.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  className="border-l-4 border-purple-500 pl-4 py-2 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{event.emotion}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString(locale === "es" ? "es-ES" : "en-US")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.event}</p>
                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500"
                      style={{ width: `${event.intensity * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
