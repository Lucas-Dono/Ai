/**
 * Personal Analytics Dashboard
 * Overview of user's progress, activity, and insights
 */

"use client";

import { useMyStats } from "@/hooks/useMyStats";
import { useClientLocale } from "@/hooks/useClientLocale";
import { StatCard } from "@/components/analytics/StatCard";
import { ProgressRing } from "@/components/analytics/ProgressRing";
import { InsightCard } from "@/components/analytics/InsightCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MessageSquare,
  Bot,
  Clock,
  Heart,
  Flame,
  TrendingUp,
  Download,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function MyStatsPage() {
  const { data, isLoading, error } = useMyStats("all", 30);
  const { t, locale } = useClientLocale();

  const handleExport = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`/api/analytics/me/export?format=${format}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `my-analytics-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t("myStats.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">{t("myStats.error")}</CardTitle>
            <CardDescription>
              {t("myStats.errorDescription")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { overview, messagesPerDay, mostUsedAIs, insights } = data;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("myStats.title")}</h1>
          <p className="text-muted-foreground">
            {t("myStats.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            {t("myStats.export.csv")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
            <Download className="h-4 w-4 mr-2" />
            {t("myStats.export.json")}
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("myStats.overview.aisCreated")}
          value={overview.totalAIsCreated}
          icon={Bot}
          color="purple"
        />
        <StatCard
          title={t("myStats.overview.messagesSent")}
          value={overview.totalMessagesSent.toLocaleString()}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title={t("myStats.overview.timeSpent")}
          value={`${overview.totalTimeSpentHours}h`}
          icon={Clock}
          color="green"
          subtitle={t("myStats.overview.meaningfulConversations")}
        />
        <StatCard
          title={t("myStats.overview.currentStreak")}
          value={overview.currentStreak}
          icon={Flame}
          color="orange"
          subtitle={t("myStats.overview.bestStreak").replace("{days}", overview.longestStreak.toString())}
        />
      </div>

      {/* Favorite AI */}
      {overview.favoriteAI && (
        <Card className="border-purple-500/50 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              {t("myStats.favoriteAI.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">{overview.favoriteAI.name}</h3>
                <p className="text-muted-foreground">
                  {t("myStats.favoriteAI.messagesExchanged").replace("{count}", overview.favoriteAI.messageCount.toString())}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/agentes/${overview.favoriteAI.id}`}>
                  {t("myStats.favoriteAI.chatNow")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">{t("myStats.tabs.activity")}</TabsTrigger>
          <TabsTrigger value="emotions">{t("myStats.tabs.emotions")}</TabsTrigger>
          <TabsTrigger value="relationships">{t("myStats.tabs.relationships")}</TabsTrigger>
          <TabsTrigger value="insights">{t("myStats.tabs.insights")}</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("myStats.activity.messagesPerDay")}</CardTitle>
              <CardDescription>{t("myStats.activity.last30Days")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={messagesPerDay}>
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
                  <YAxis />
                  <Tooltip
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("myStats.activity.mostUsedAIs")}</CardTitle>
              <CardDescription>{t("myStats.activity.topCompanions")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mostUsedAIs.slice(0, 5)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="messageCount" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emotions Tab */}
        <TabsContent value="emotions">
          <Card>
            <CardHeader>
              <CardTitle>{t("myStats.emotions.title")}</CardTitle>
              <CardDescription>
                {t("myStats.emotions.explore")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t("myStats.emotions.detailedAnalytics")}
                </p>
                <Button asChild>
                  <Link href="/dashboard/my-stats/emotions">
                    {t("myStats.emotions.viewAnalytics")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relationships Tab */}
        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle>{t("myStats.relationships.title")}</CardTitle>
              <CardDescription>
                {t("myStats.relationships.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  {t("myStats.relationships.subtitle")}
                </p>
                <Button asChild>
                  <Link href="/dashboard/my-stats/relationships">
                    {t("myStats.relationships.title")}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.insights.map((insight, index) => (
              <InsightCard
                key={index}
                insight={insight}
                variant={index === 0 ? "highlight" : "default"}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("myStats.insights.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">{t("myStats.insights.mostActive")}</h4>
                <p className="text-2xl font-bold">{insights.patterns.mostActiveDay}</p>
                <p className="text-sm text-muted-foreground">
                  {t("myStats.insights.at").replace("{hour}", insights.patterns.mostActiveHour.toString())}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">{t("myStats.insights.conversationStyle")}</h4>
                <p className="text-2xl font-bold capitalize">
                  {insights.patterns.preferredConversationType}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("myStats.insights.avgSession").replace("{hours}", insights.patterns.avgSessionDuration.toFixed(1))}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">{t("myStats.insights.emotionalTendency")}</h4>
                <p className="text-2xl font-bold capitalize">
                  {insights.patterns.emotionalTendency}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">{t("myStats.insights.yourPercentile")}</h4>
                <div className="flex items-center gap-3">
                  <ProgressRing progress={insights.comparisons.percentile} size={80} strokeWidth={6}>
                    <span className="text-lg font-bold">
                      {insights.comparisons.percentile}%
                    </span>
                  </ProgressRing>
                  <p className="text-sm text-muted-foreground">
                    {t("myStats.insights.moreActiveThan").replace("{percent}", insights.comparisons.percentile.toString())}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
