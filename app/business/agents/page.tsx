"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Settings as SettingsIcon,
  Copy,
  Trash2,
  Eye,
  Activity,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  type: string;
  status: "active" | "idle" | "error" | "stopped";
  description?: string;
  tasksToday: number;
  tasksTotal: number;
  successRate: number;
  avgResponseTime: string;
  uptime: string;
  lastActive: string;
  createdAt: string;
  model: string;
  cost: number;
}

type ViewMode = "grid" | "list";
type FilterStatus = "all" | "active" | "idle" | "error" | "stopped";
type SortBy = "name" | "tasks" | "successRate" | "created";

export default function AgentsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>(
    (searchParams.get("status") as FilterStatus) || "all"
  );
  const [sortBy, setSortBy] = useState<SortBy>("name");

  // Mock data - replace with real API call
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "agt_1",
      name: "Customer Support Bot",
      type: "Customer Service",
      status: "active",
      description: "Handles customer inquiries, support tickets, and general questions with contextual understanding",
      tasksToday: 127,
      tasksTotal: 5240,
      successRate: 99.2,
      avgResponseTime: "2.3s",
      uptime: "24h",
      lastActive: "2 min ago",
      createdAt: "2025-01-15",
      model: "GPT-4 Turbo",
      cost: 45.20,
    },
    {
      id: "agt_2",
      name: "Data Analysis Assistant",
      type: "Analytics",
      status: "active",
      description: "Processes data, generates insights, and creates analytical reports",
      tasksToday: 45,
      tasksTotal: 1890,
      successRate: 100,
      avgResponseTime: "5.1s",
      uptime: "18h",
      lastActive: "15 min ago",
      createdAt: "2025-02-01",
      model: "Claude 3.5 Sonnet",
      cost: 32.10,
    },
    {
      id: "agt_3",
      name: "HR Recruiting Agent",
      type: "Human Resources",
      status: "idle",
      description: "Screens resumes, schedules interviews, and manages candidate communication",
      tasksToday: 8,
      tasksTotal: 456,
      successRate: 98.1,
      avgResponseTime: "3.8s",
      uptime: "24h",
      lastActive: "2 hours ago",
      createdAt: "2025-01-20",
      model: "GPT-4",
      cost: 18.50,
    },
    {
      id: "agt_4",
      name: "Sales Lead Qualifier",
      type: "Sales",
      status: "active",
      description: "Qualifies inbound leads, scores opportunities, and routes to sales team",
      tasksToday: 89,
      tasksTotal: 3210,
      successRate: 97.5,
      avgResponseTime: "1.9s",
      uptime: "24h",
      lastActive: "5 min ago",
      createdAt: "2025-01-10",
      model: "GPT-4 Turbo",
      cost: 38.90,
    },
    {
      id: "agt_5",
      name: "Document Processor",
      type: "Operations",
      status: "active",
      description: "Extracts information from documents, validates data, and routes for approval",
      tasksToday: 234,
      tasksTotal: 8920,
      successRate: 99.8,
      avgResponseTime: "4.2s",
      uptime: "24h",
      lastActive: "1 min ago",
      createdAt: "2024-12-15",
      model: "Claude 3 Opus",
      cost: 52.30,
    },
    {
      id: "agt_6",
      name: "Code Review Assistant",
      type: "Development",
      status: "stopped",
      description: "Reviews pull requests, suggests improvements, and checks code quality",
      tasksToday: 0,
      tasksTotal: 1245,
      successRate: 96.3,
      avgResponseTime: "8.5s",
      uptime: "0h",
      lastActive: "3 days ago",
      createdAt: "2025-01-25",
      model: "GPT-4",
      cost: 0,
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter and sort agents
  const filteredAgents = agents
    .filter((agent) => {
      const matchesSearch =
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || agent.status === filterStatus;

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "tasks":
          return b.tasksToday - a.tasksToday;
        case "successRate":
          return b.successRate - a.successRate;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "status-active";
      case "idle":
        return "status-idle";
      case "error":
        return "status-error";
      default:
        return "status-offline";
    }
  };

  const getStatusText = (status: Agent["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const AgentCard = ({ agent }: { agent: Agent }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="business-card group cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[rgb(var(--business-primary))]/10 to-[rgb(var(--business-accent))]/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Bot className="h-6 w-6 text-business-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-business-primary truncate group-hover:text-business-brand transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-business-muted">{agent.type}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
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
                <SettingsIcon className="h-4 w-4 mr-2" />
                Configure
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-3">
          <span className={`status-indicator text-sm ${getStatusColor(agent.status)}`}>
            {getStatusText(agent.status)}
          </span>
        </div>

        {agent.description && (
          <p className="text-sm text-business-muted line-clamp-2 mb-4">
            {agent.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="text-xs text-business-muted mb-1">Tasks Today</p>
            <p className="text-lg font-semibold text-business-primary">
              {agent.tasksToday}
            </p>
          </div>
          <div>
            <p className="text-xs text-business-muted mb-1">Success Rate</p>
            <p className="text-lg font-semibold text-business-success">
              {agent.successRate}%
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-business-muted border-t border-business pt-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {agent.avgResponseTime}
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            {agent.lastActive}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Link href={`/business/agents/${agent.id}`} className="flex-1">
            <Button size="sm" variant="outline" className="w-full border-business">
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          </Link>
          {agent.status === "active" || agent.status === "idle" ? (
            <Button size="sm" variant="outline" className="border-business">
              <Pause className="h-3 w-3" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="border-business">
              <Play className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );

  const AgentRow = ({ agent }: { agent: Agent }) => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="cursor-pointer group"
    >
      <td>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[rgb(var(--business-primary))]/10 to-[rgb(var(--business-accent))]/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-business-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-business-primary truncate group-hover:text-business-brand transition-colors">
              {agent.name}
            </p>
            <p className="text-xs text-business-muted truncate">{agent.type}</p>
          </div>
        </div>
      </td>
      <td>
        <span className={`status-indicator ${getStatusColor(agent.status)}`}>
          {getStatusText(agent.status)}
        </span>
      </td>
      <td className="text-right font-medium text-business-primary">
        {agent.tasksToday}
      </td>
      <td className="text-right text-business-success font-medium">
        {agent.successRate}%
      </td>
      <td className="text-right text-business-secondary">{agent.avgResponseTime}</td>
      <td className="text-right text-business-secondary">{agent.uptime}</td>
      <td className="text-right text-business-muted text-xs">{agent.lastActive}</td>
      <td className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </motion.tr>
  );

  return (
    <div className="space-y-6 business-animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-business-muted">
            {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/business/agents/new">
          <Button className="bg-[rgb(var(--business-primary))] hover:bg-[rgb(var(--business-primary-hover))] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create New Agent
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="business-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-business-muted" />
            <Input
              type="search"
              placeholder="Search agents by name, type, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-business-tertiary border-business focus-visible:ring-[rgb(var(--business-primary))]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterStatus} onValueChange={(v: FilterStatus) => setFilterStatus(v)}>
              <SelectTrigger className="w-[140px] border-business">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v: SortBy) => setSortBy(v)}>
              <SelectTrigger className="w-[160px] border-business">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="tasks">Tasks Today</SelectItem>
                <SelectItem value="successRate">Success Rate</SelectItem>
                <SelectItem value="created">Recently Created</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-business-tertiary rounded-lg">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                className={cn(
                  "h-8 px-3",
                  viewMode === "grid" &&
                    "bg-[rgb(var(--business-primary))] text-white"
                )}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                className={cn(
                  "h-8 px-3",
                  viewMode === "list" &&
                    "bg-[rgb(var(--business-primary))] text-white"
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Agents Display */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="business-card">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl business-skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 business-skeleton" />
                    <div className="h-3 w-24 business-skeleton" />
                  </div>
                </div>
                <div className="h-20 business-skeleton" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card className="business-card text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-business-muted" />
          <h3 className="text-lg font-semibold text-business-primary mb-2">
            No agents found
          </h3>
          <p className="text-business-muted mb-4">
            Try adjusting your filters or create a new agent
          </p>
          <Link href="/business/agents/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Agent
            </Button>
          </Link>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <Card className="business-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="business-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Status</th>
                  <th className="text-right">Tasks</th>
                  <th className="text-right">Success</th>
                  <th className="text-right">Avg Response</th>
                  <th className="text-right">Uptime</th>
                  <th className="text-right">Last Active</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((agent) => (
                  <AgentRow key={agent.id} agent={agent} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
