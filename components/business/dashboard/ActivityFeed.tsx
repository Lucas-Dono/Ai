"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bot,
  Workflow,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Activity {
  id: string;
  type: "agent" | "workflow" | "team" | "system";
  action: string;
  description: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  metadata?: {
    agentName?: string;
    workflowName?: string;
    userName?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  className?: string;
}

export function ActivityFeed({
  activities,
  loading = false,
  className,
}: ActivityFeedProps) {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "agent":
        return Bot;
      case "workflow":
        return Workflow;
      case "team":
        return Users;
      default:
        return Info;
    }
  };

  const getStatusIcon = (status?: Activity["status"]) => {
    switch (status) {
      case "success":
        return CheckCircle2;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getStatusColor = (status?: Activity["status"]) => {
    switch (status) {
      case "success":
        return "text-business-success";
      case "warning":
        return "text-business-warning";
      case "error":
        return "text-business-error";
      default:
        return "text-business-accent";
    }
  };

  if (loading) {
    return (
      <Card className={cn("business-card", className)}>
        <div className="space-y-4">
          <div className="h-6 w-32 business-skeleton" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 rounded-full business-skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 business-skeleton" />
                <div className="h-3 w-1/2 business-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("business-card", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-business-primary flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </h3>
        <button className="text-sm text-business-brand hover:underline flex items-center gap-1">
          View All
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = getIcon(activity.type);
          const StatusIcon = getStatusIcon(activity.status);

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex gap-3 p-3 rounded-lg hover:bg-business-hover transition-colors cursor-pointer group"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[rgb(var(--business-primary))]/10 to-[rgb(var(--business-accent))]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5 text-business-brand" />
                </div>
                {activity.status && (
                  <div
                    className={cn(
                      "absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-business-secondary flex items-center justify-center border-2 border-business-secondary",
                      getStatusColor(activity.status)
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-business-primary truncate">
                  {activity.action}
                </p>
                <p className="text-sm text-business-muted truncate">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-business-muted">
                  <Clock className="h-3 w-3" />
                  {activity.timestamp}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
