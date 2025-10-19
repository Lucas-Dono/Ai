"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Database,
  Cloud,
  Zap,
  Server,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down" | "maintenance";
  responseTime?: number;
  uptime?: number;
  lastCheck?: string;
}

interface SystemHealthProps {
  services: ServiceStatus[];
  loading?: boolean;
  className?: string;
}

export function SystemHealth({
  services,
  loading = false,
  className,
}: SystemHealthProps) {
  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return "text-business-success";
      case "degraded":
        return "text-business-warning";
      case "down":
        return "text-business-error";
      case "maintenance":
        return "text-business-accent";
      default:
        return "text-business-muted";
    }
  };

  const getStatusBadge = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="business-badge-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Operational
          </Badge>
        );
      case "degraded":
        return (
          <Badge className="business-badge-warning">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Degraded
          </Badge>
        );
      case "down":
        return (
          <Badge className="business-badge-error">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Down
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="business-badge-primary">
            <Clock className="h-3 w-3 mr-1" />
            Maintenance
          </Badge>
        );
    }
  };

  const getServiceIcon = (name: string) => {
    if (name.toLowerCase().includes("api")) return Cloud;
    if (name.toLowerCase().includes("database")) return Database;
    if (name.toLowerCase().includes("llm") || name.toLowerCase().includes("ai"))
      return Zap;
    return Server;
  };

  const overallStatus = services.every((s) => s.status === "operational")
    ? "operational"
    : services.some((s) => s.status === "down")
    ? "down"
    : "degraded";

  if (loading) {
    return (
      <Card className={cn("business-card", className)}>
        <div className="space-y-4">
          <div className="h-6 w-32 business-skeleton" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-4 w-32 business-skeleton" />
              <div className="h-6 w-24 business-skeleton" />
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
          System Health
        </h3>
        {getStatusBadge(overallStatus)}
      </div>

      <div className="space-y-3">
        {services.map((service, index) => {
          const Icon = getServiceIcon(service.name);

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-business-tertiary/30 hover:bg-business-hover transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[rgb(var(--business-primary))]/10 to-[rgb(var(--business-accent))]/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-business-brand" />
                </div>
                <div>
                  <p className="text-sm font-medium text-business-primary">
                    {service.name}
                  </p>
                  {service.responseTime && (
                    <p className="text-xs text-business-muted">
                      {service.responseTime}ms avg response
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {service.uptime && (
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-business-secondary">
                      {service.uptime}%
                    </p>
                    <p className="text-xs text-business-muted">uptime</p>
                  </div>
                )}
                <div
                  className={cn(
                    "h-3 w-3 rounded-full",
                    service.status === "operational" &&
                      "bg-business-success business-animate-pulse",
                    service.status === "degraded" && "bg-business-warning",
                    service.status === "down" &&
                      "bg-business-error business-animate-pulse",
                    service.status === "maintenance" && "bg-business-accent"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-business">
        <p className="text-xs text-business-muted text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </Card>
  );
}
