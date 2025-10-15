/**
 * Analytics Dashboard Page
 * Comprehensive analytics and insights dashboard
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/analytics/StatCard";
import { TimeSeriesChart } from "@/components/analytics/TimeSeriesChart";
import { PieChartCard } from "@/components/analytics/PieChartCard";
import { ProgressBar } from "@/components/analytics/ProgressBar";
import {
  MessageSquare,
  Users,
  Zap,
  DollarSign,
  Download,
  Loader2,
  Calendar,
  TrendingUp,
  Heart,
} from "lucide-react";
import type { DashboardStats, TimeRange } from "@/lib/analytics/service";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState<TimeRange>("30d");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, [range]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/dashboard?range=${range}`);
      if (!response.ok) throw new Error("Failed to load analytics");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/analytics/export?range=${range}`);
      if (!response.ok) throw new Error("Failed to export");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics-${range}-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting analytics:", error);
      alert("Failed to export analytics");
    } finally {
      setIsExporting(false);
    }
  };

  const rangeOptions: { value: TimeRange; label: string }[] = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
    { value: "1y", label: "Last Year" },
    { value: "all", label: "All Time" },
  ];

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your AI agents
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {rangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={range === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setRange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Messages"
          value={stats.overview.totalMessages.toLocaleString()}
          icon={MessageSquare}
          color="blue"
          subtitle={`${stats.usage.avgMessagesPerDay.toFixed(1)} per day`}
        />
        <StatCard
          title="Total Agents"
          value={stats.overview.totalAgents}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total Tokens"
          value={stats.usage.totalTokens.toLocaleString()}
          icon={Zap}
          color="orange"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.revenue.mrr}`}
          icon={DollarSign}
          color="green"
          subtitle={`$${stats.revenue.arr}/year ARR`}
        />
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart
          title="Messages Over Time"
          data={stats.timeSeries.messages}
          color="#3b82f6"
        />
        <TimeSeriesChart
          title="Token Usage Over Time"
          data={stats.timeSeries.tokens}
          color="#f59e0b"
        />
      </div>

      {/* Emotional Stats & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotional Intelligence */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-pink-500" />
            <h3 className="text-lg font-semibold">Emotional Intelligence</h3>
          </div>
          <div className="space-y-4">
            <ProgressBar
              label="Trust"
              value={stats.emotional.avgTrust}
              color="blue"
            />
            <ProgressBar
              label="Affinity"
              value={stats.emotional.avgAffinity}
              color="purple"
            />
            <ProgressBar
              label="Respect"
              value={stats.emotional.avgRespect}
              color="green"
            />
          </div>
        </Card>

        {/* Emotion Distribution */}
        {Object.keys(stats.emotional.emotionDistribution).length > 0 && (
          <PieChartCard
            title="Emotion Distribution"
            data={stats.emotional.emotionDistribution}
          />
        )}

        {/* Relationship Levels */}
        {Object.keys(stats.emotional.relationshipLevels).length > 0 && (
          <PieChartCard
            title="Relationship Levels"
            data={stats.emotional.relationshipLevels}
            colors={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]}
          />
        )}
      </div>

      {/* Top Performing Agents */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Top Performing Agents</h3>
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Agent</th>
                <th className="text-right py-3 px-4 font-medium">Messages</th>
                <th className="text-right py-3 px-4 font-medium">Tokens</th>
                <th className="text-right py-3 px-4 font-medium">
                  Avg Response
                </th>
                <th className="text-right py-3 px-4 font-medium">Sentiment</th>
                <th className="text-right py-3 px-4 font-medium">Users</th>
              </tr>
            </thead>
            <tbody>
              {stats.topAgents.map((agent, idx) => (
                <tr key={agent.agentId} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {idx + 1}
                      </div>
                      <span className="font-medium">{agent.agentName}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    {agent.messageCount.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {agent.tokenCount.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {agent.avgResponseLength.toFixed(0)} chars
                  </td>
                  <td className="text-right py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        agent.avgSentiment >= 0.7
                          ? "bg-green-500/10 text-green-600"
                          : agent.avgSentiment >= 0.5
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-orange-500/10 text-orange-600"
                      }`}
                    >
                      {(agent.avgSentiment * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4">
                    {agent.uniqueUsers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stats.topAgents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No agent activity in this time range</p>
          </div>
        )}
      </Card>

      {/* Usage Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold mb-2">Peak Usage Hour</h4>
          <p className="text-3xl font-bold text-primary">
            {stats.usage.peakHour}:00
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Most active time of day
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-2">Peak Usage Day</h4>
          <p className="text-lg font-bold text-primary">{stats.usage.peakDay}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Most active date
          </p>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold mb-2">Average Daily Messages</h4>
          <p className="text-3xl font-bold text-primary">
            {stats.usage.avgMessagesPerDay.toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Messages per day average
          </p>
        </Card>
      </div>
    </div>
  );
}
