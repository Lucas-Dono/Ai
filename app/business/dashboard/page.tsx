"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  TrendingUp,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  BarChart3,
  Download,
  RefreshCw,
  MessageCircle,
  Zap,
  Eye,
  MoreVertical,
} from "lucide-react";
import { StatCard } from "@/components/business/shared/StatCard";
import {
  PerformanceChart,
  ComparisonBarChart,
  DonutChart,
} from "@/components/business/shared/Charts";
import { ActivityFeed } from "@/components/business/dashboard/ActivityFeed";
import { SystemHealth } from "@/components/business/dashboard/SystemHealth";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BusinessDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date());
    }, 1500);
  };

  // Dashboard Data
  const kpiData = {
    activeAgents: 12,
    activeAgentsChange: 16.7,
    totalTasks: 1547,
    totalTasksChange: 12.3,
    successRate: 98.5,
    successRateChange: 1.2,
    operationalCost: 342,
    operationalCostChange: -5.3,
  };

  const performanceData = [
    { name: "Mon", value: 420 },
    { name: "Tue", value: 680 },
    { name: "Wed", value: 550 },
    { name: "Thu", value: 780 },
    { name: "Fri", value: 920 },
    { name: "Sat", value: 640 },
    { name: "Sun", value: 380 },
  ];

  const agentComparisonData = [
    { name: "Support Bot", tasks: 450, success: 440 },
    { name: "Data Analyst", tasks: 280, success: 278 },
    { name: "HR Assistant", tasks: 220, success: 215 },
    { name: "Sales Agent", tasks: 310, success: 302 },
    { name: "Doc Processor", tasks: 287, success: 285 },
  ];

  const costBreakdownData = [
    { name: "LLM API Calls", value: 156, color: "rgb(30 64 175)" },
    { name: "Compute Resources", value: 98, color: "rgb(6 182 212)" },
    { name: "Storage", value: 45, color: "rgb(16 185 129)" },
    { name: "Network", value: 43, color: "rgb(245 158 11)" },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "agent" as const,
      action: "Agent Deployed",
      description: "Customer Support Bot v2.1 is now active",
      timestamp: "2 minutes ago",
      status: "success" as const,
    },
    {
      id: "2",
      type: "workflow" as const,
      action: "Workflow Completed",
      description: "Data Analysis Pipeline processed 1,245 records",
      timestamp: "15 minutes ago",
      status: "success" as const,
    },
    {
      id: "3",
      type: "agent" as const,
      action: "High Usage Alert",
      description: "Sales Agent exceeded 80% of daily quota",
      timestamp: "1 hour ago",
      status: "warning" as const,
    },
    {
      id: "4",
      type: "team" as const,
      action: "New Team Member",
      description: "Sarah Johnson joined as Developer",
      timestamp: "2 hours ago",
      status: "info" as const,
    },
    {
      id: "5",
      type: "system" as const,
      action: "System Update",
      description: "Platform upgraded to v3.2.1",
      timestamp: "3 hours ago",
      status: "success" as const,
    },
  ];

  const systemServices = [
    {
      name: "API Gateway",
      status: "operational" as const,
      responseTime: 45,
      uptime: 99.9,
    },
    {
      name: "Database",
      status: "operational" as const,
      responseTime: 12,
      uptime: 100,
    },
    {
      name: "LLM Provider",
      status: "degraded" as const,
      responseTime: 1850,
      uptime: 98.2,
    },
    {
      name: "Queue Service",
      status: "operational" as const,
      responseTime: 8,
      uptime: 99.8,
    },
  ];

  const activeAgents = [
    {
      id: "1",
      name: "Customer Support Bot",
      type: "Customer Service",
      status: "active",
      tasksToday: 127,
      successRate: 99.2,
      uptime: "24h",
      avgResponseTime: "2.3s",
    },
    {
      id: "2",
      name: "Data Analysis Assistant",
      type: "Analytics",
      status: "active",
      tasksToday: 45,
      successRate: 100,
      uptime: "18h",
      avgResponseTime: "5.1s",
    },
    {
      id: "3",
      name: "HR Recruiting Agent",
      type: "Human Resources",
      status: "idle",
      tasksToday: 8,
      successRate: 98.1,
      uptime: "24h",
      avgResponseTime: "3.8s",
    },
  ];

  return (
    <div className="space-y-6 business-animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-business-muted">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-business"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-business"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Agents"
          value={kpiData.activeAgents}
          change={kpiData.activeAgentsChange}
          changeType="increase"
          trend="up"
          icon={Bot}
          description="+2 since last week"
          loading={loading}
        />
        <StatCard
          title="Total Tasks"
          value={kpiData.totalTasks.toLocaleString()}
          change={kpiData.totalTasksChange}
          changeType="increase"
          trend="up"
          icon={Activity}
          description="This month"
          loading={loading}
        />
        <StatCard
          title="Success Rate"
          value={`${kpiData.successRate}%`}
          change={kpiData.successRateChange}
          changeType="increase"
          trend="up"
          icon={TrendingUp}
          description="Above target (95%)"
          loading={loading}
        />
        <StatCard
          title="Operational Cost"
          value={`$${kpiData.operationalCost}`}
          change={kpiData.operationalCostChange}
          changeType="decrease"
          trend="down"
          icon={DollarSign}
          description="vs. last month"
          loading={loading}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceChart
            data={performanceData}
            title="Task Throughput"
            description="Number of tasks completed per day this week"
            dataKey="value"
            loading={loading}
          />
        </div>
        <div>
          <ActivityFeed activities={recentActivities} loading={loading} />
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ComparisonBarChart
          data={agentComparisonData}
          title="Agent Performance Comparison"
          description="Tasks completed vs successful tasks by agent"
          dataKeys={["tasks", "success"]}
          loading={loading}
        />
        <DonutChart
          data={costBreakdownData}
          title="Cost Breakdown"
          description="Operational costs by category this month"
          loading={loading}
        />
      </div>

      {/* Active Agents Table */}
      <Card className="business-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-business-primary">
              Active Agents
            </h3>
            <p className="text-sm text-business-muted">
              Real-time status of your AI agents
            </p>
          </div>
          <Link href="/business/agents">
            <Button variant="outline" size="sm" className="border-business">
              View All
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="business-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Type</th>
                <th>Status</th>
                <th className="text-right">Tasks Today</th>
                <th className="text-right">Success Rate</th>
                <th className="text-right">Avg Response</th>
                <th className="text-right">Uptime</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8}>
                        <div className="h-12 business-skeleton" />
                      </td>
                    </tr>
                  ))
                : activeAgents.map((agent) => (
                    <motion.tr
                      key={agent.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="cursor-pointer"
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[rgb(var(--business-primary))]/10 to-[rgb(var(--business-accent))]/10 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-business-brand" />
                          </div>
                          <div>
                            <p className="font-medium text-business-primary">
                              {agent.name}
                            </p>
                            <p className="text-xs text-business-muted">
                              ID: {agent.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant="outline"
                          className="text-xs border-business"
                        >
                          {agent.type}
                        </Badge>
                      </td>
                      <td>
                        <span
                          className={`status-indicator ${
                            agent.status === "active"
                              ? "status-active"
                              : "status-idle"
                          }`}
                        >
                          {agent.status === "active" ? "Active" : "Idle"}
                        </span>
                      </td>
                      <td className="text-right font-medium text-business-primary">
                        {agent.tasksToday}
                      </td>
                      <td className="text-right">
                        <span className="text-business-success font-medium">
                          {agent.successRate}%
                        </span>
                      </td>
                      <td className="text-right text-business-secondary">
                        {agent.avgResponseTime}
                      </td>
                      <td className="text-right text-business-secondary">
                        {agent.uptime}
                      </td>
                      <td>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              View Logs
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* System Health */}
      <SystemHealth services={systemServices} loading={loading} />
    </div>
  );
}
